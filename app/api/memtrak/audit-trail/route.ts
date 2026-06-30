import { NextRequest, NextResponse } from 'next/server';
import { listAuditEvents, fetchAuditEvents, verifyAuditChain, type AuditAction, type AuditEntity } from '@/lib/audit';
import { requireStaff } from '@/lib/route-auth';

const ACTIONS: AuditAction[] = ['create', 'update', 'delete', 'mark_paid', 'recompute_engagement', 'import'];
const ENTITIES: AuditEntity[] = ['organization', 'contact', 'invoice', 'event_attendance', 'group', 'group_member'];

/**
 * GET /api/memtrak/audit-trail
 *
 * Returns the AMS entity-change audit trail. Distinct from /api/memtrak/audit
 * which is the security/email audit log.
 */
export async function GET(request: NextRequest) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const sp = request.nextUrl.searchParams;
  const entity = sp.get('entity');
  const action = sp.get('action');

  const params = {
    entity: entity && ENTITIES.includes(entity as AuditEntity) ? (entity as AuditEntity) : undefined,
    action: action && ACTIONS.includes(action as AuditAction) ? (action as AuditAction) : undefined,
    q: sp.get('q') ?? undefined,
    since: sp.get('since') ?? undefined,
    limit: Number(sp.get('limit')) || 200,
  };

  // Prefer the durable DB trail; fall back to the per-instance cache only when
  // the store is unavailable (never to fabricated data).
  const durable = await fetchAuditEvents(params);
  // Verify the tamper-evident hash chain so the UI can surface integrity as
  // positive SOC2 CC7.x evidence (or flag a break). Best-effort: a verify
  // failure must not block returning the trail.
  let chain: Awaited<ReturnType<typeof verifyAuditChain>> | null = null;
  if (durable) {
    try { chain = await verifyAuditChain(); } catch { chain = null; }
  }
  return NextResponse.json({ ...(durable ?? listAuditEvents(params)), chain });
}
