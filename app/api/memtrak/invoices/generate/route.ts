import { NextRequest, NextResponse } from 'next/server';
import { generateInvoices } from '@/lib/member-data';
import { requireStaff, safeError } from '@/lib/route-auth';
import { logEntityAudit } from '@/lib/audit';
import { auditContext } from '@/lib/audit-context';

/**
 * POST /api/memtrak/invoices/generate
 *
 * Body: { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
 *   Generates Pending invoices for every Active org with renewal_date in that
 *   range that does NOT already have an invoice for the target fiscal year
 *   (derived from the `to` date). Idempotent within a fiscal year.
 */
export async function POST(request: NextRequest) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const from = typeof body.from === 'string' ? body.from : '';
  const to = typeof body.to === 'string' ? body.to : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json({ error: 'from and to must be YYYY-MM-DD' }, { status: 400 });
  }
  if (from > to) {
    return NextResponse.json({ error: 'from must be on or before to' }, { status: 400 });
  }

  try {
    const result = await generateInvoices(from, to);
    logEntityAudit({
      entity: 'invoice', entity_id: 'bulk-generate', entity_label: `${from}..${to}`,
      action: 'create', actor: gate.actor.email,
      summary: `Generated invoices for renewals ${from} to ${to}`,
      ...auditContext(request),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
