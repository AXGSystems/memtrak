import { NextRequest, NextResponse } from 'next/server';
import { listAuditEvents, type AuditAction, type AuditEntity } from '@/lib/audit';

const ACTIONS: AuditAction[] = ['create', 'update', 'delete', 'mark_paid', 'recompute_engagement', 'import'];
const ENTITIES: AuditEntity[] = ['organization', 'contact', 'invoice', 'event_attendance', 'group', 'group_member'];

/**
 * GET /api/memtrak/audit-trail
 *
 * Returns the AMS entity-change audit trail. Distinct from /api/memtrak/audit
 * which is the security/email audit log.
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const entity = sp.get('entity');
  const action = sp.get('action');

  const result = listAuditEvents({
    entity: entity && ENTITIES.includes(entity as AuditEntity) ? (entity as AuditEntity) : undefined,
    action: action && ACTIONS.includes(action as AuditAction) ? (action as AuditAction) : undefined,
    q: sp.get('q') ?? undefined,
    since: sp.get('since') ?? undefined,
    limit: Number(sp.get('limit')) || 200,
  });

  return NextResponse.json(result);
}
