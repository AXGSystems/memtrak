import { NextResponse } from 'next/server';
import { getPortalContext } from '@/lib/portal-auth';
import { getContact, getOrganization, listInvoices, listAttendanceForOrg, listGroupsForOrg } from '@/lib/member-data';

/**
 * GET /api/portal/me
 *
 * Returns the full member context: their contact, their organization,
 * counts of open invoices / upcoming events / group memberships.
 * One round-trip for the portal dashboard.
 */
export async function GET() {
  const gate = await getPortalContext();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { ctx } = gate;
  const [contact, org] = await Promise.all([
    getContact(ctx.contact_id),
    getOrganization(ctx.org_id),
  ]);

  if (!contact || !org) {
    return NextResponse.json({ error: 'Member context refers to records that no longer exist' }, { status: 404 });
  }

  const [invoiceList, attendance, groupRows] = await Promise.all([
    listInvoices({ org_id: ctx.org_id, pageSize: 100 }),
    listAttendanceForOrg(ctx.org_id),
    listGroupsForOrg(ctx.org_id),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const openInvoices = invoiceList.rows.filter(
    (i) => i.status !== 'Paid' && i.status !== 'Cancelled' && i.status !== 'Refunded',
  );
  const openBalance = openInvoices.reduce((s, i) => s + i.amount, 0);
  const upcomingRegistrations = attendance.filter((a) => a.event_date >= today && a.registration_status !== 'Cancelled');

  return NextResponse.json({
    contact,
    org,
    summary: {
      open_invoices: openInvoices.length,
      open_balance: openBalance,
      upcoming_events: upcomingRegistrations.length,
      groups: groupRows.length,
    },
  });
}
