import { NextRequest, NextResponse } from 'next/server';
import { verifyAuditChain } from '@/lib/audit';
import { logAudit, dispatchSecurityAlert } from '@/lib/security';
import { requireAdminRole } from '@/lib/route-auth';
import { auditContext } from '@/lib/audit-context';

/**
 * GET /api/memtrak/audit/verify
 *
 * Scheduled (and on-demand) integrity check of the tamper-evident audit hash
 * chain — the operational half of SOC2 CC7.2 (monitoring) / CC7.3 (evaluating
 * events). Running verifyAuditChain() on a fixed cadence means tampering is
 * surfaced automatically instead of only when a human happens to open the
 * audit page.
 *
 * Authorization (fail-closed, two accepted callers):
 *   1. Vercel Cron — sends `Authorization: Bearer <CRON_SECRET>`. We accept it
 *      ONLY when CRON_SECRET is set and matches (timing-safe), so an
 *      unauthenticated probe of this public-prefixed path can't trigger it.
 *   2. An authenticated admin staff session (manual re-run from the UI).
 *
 * Every run is recorded as a durable security audit event, and a non-intact
 * result fires a critical alert via dispatchSecurityAlert (email when Graph is
 * configured; always console.error as a floor).
 */
export const dynamic = 'force-dynamic';

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

async function authorize(request: NextRequest): Promise<{ ok: true; actor: string } | { ok: false; status: number; error: string }> {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get('authorization') ?? '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
  // Vercel also stamps cron requests with this header; presence + secret match
  // is what we trust, not the header alone.
  if (secret && bearer && timingSafeEqual(bearer, secret)) {
    return { ok: true, actor: 'cron' };
  }
  // Otherwise require an admin session (manual run).
  const gate = await requireAdminRole();
  if (gate.ok) return { ok: true, actor: gate.actor.email };
  return { ok: false, status: gate.status, error: gate.error };
}

export async function GET(request: NextRequest) {
  const auth = await authorize(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { ip_address } = auditContext(request);
  const ip = ip_address ?? 'cron';

  let result: Awaited<ReturnType<typeof verifyAuditChain>>;
  try {
    result = await verifyAuditChain();
  } catch (err) {
    logAudit('audit.chain_verify_error', ip, err instanceof Error ? err.message : 'verify threw', 'warning');
    return NextResponse.json({ error: 'Verification failed to run' }, { status: 500 });
  }

  if (!result.available) {
    // Store unreachable — operationally relevant, not itself tampering.
    logAudit('audit.chain_unavailable', ip, `actor=${auth.actor}`, 'warning');
    return NextResponse.json({ ok: false, ...result }, { status: 503 });
  }

  if (result.intact) {
    logAudit('audit.chain_verified', ip, `intact, checked=${result.checked}, actor=${auth.actor}`, 'info');
    return NextResponse.json({ ok: true, ...result });
  }

  // Non-intact => tampering detected. Record durably (warning avoids a
  // duplicate alert — we dispatch the richer one explicitly below) and fire a
  // dedicated, descriptive out-of-band alert.
  const detail = `AUDIT CHAIN BROKEN at row ${result.brokenAt} after ${result.checked} verified rows (actor=${auth.actor})`;
  logAudit('audit.chain_tampering_detected', ip, detail, 'warning');
  await dispatchSecurityAlert(
    'audit chain integrity FAILURE',
    detail,
  );
  return NextResponse.json({ ok: false, ...result }, { status: 409 });
}
