import { NextResponse } from 'next/server';
import { getPortalContext } from '@/lib/portal-auth';
import { listInvoices } from '@/lib/member-data';

/**
 * GET /api/portal/invoices
 *
 * Read-only list of the signed-in member's organization's invoices.
 * No write surface here — payment goes through Stripe (Phase 2 follow-up).
 */
export async function GET() {
  const gate = await getPortalContext();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const result = await listInvoices({ org_id: gate.ctx.org_id, pageSize: 100 });
  return NextResponse.json(result);
}
