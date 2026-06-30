import { NextResponse } from 'next/server';
import { getAuditLog, getAuditStats, fetchSecurityAudit } from '@/lib/security';
import { requireStaff } from '@/lib/route-auth';

/**
 * GET /api/memtrak/audit — the security/email audit log.
 *
 * Authenticated (staff+) and DURABLE: prefers the authoritative
 * `memtrak_audit_log` table (security.* rows) over the per-instance in-memory
 * ring buffer, which is near-empty on each serverless cold start. Falls back to
 * the cache only when the durable store is unavailable (never fabricated data).
 */
export async function GET() {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const durable = await fetchSecurityAudit(50);
  if (durable) {
    return NextResponse.json({ stats: durable.stats, events: durable.events, source: 'durable' });
  }
  return NextResponse.json({
    stats: getAuditStats(),
    events: getAuditLog(50),
    source: 'cache',
  });
}
