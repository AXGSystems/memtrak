import { NextRequest, NextResponse } from 'next/server';
import { getInvoice, getOrganization, listContacts } from '@/lib/member-data';
import { cohortForInvoice, renderDunningEmail } from '@/lib/dunning';

import { requireReadOnly } from '@/lib/route-auth';
/**
 * GET /api/memtrak/dunning/preview?invoice_id=...
 *
 * Returns the rendered subject + HTML body for the given invoice's current
 * dunning cohort. The active recipient is the org's primary contact (or the
 * first contact if none is marked primary).
 *
 * Returns 404 if the invoice doesn't exist; 422 if it doesn't currently
 * match any dunning window.
 */
export async function GET(request: NextRequest) {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const sp = request.nextUrl.searchParams;
  const id = sp.get('invoice_id');
  if (!id) return NextResponse.json({ error: 'invoice_id required' }, { status: 400 });

  const invoice = await getInvoice(id);
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  const org = await getOrganization(invoice.org_id);
  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

  const cohort = cohortForInvoice(invoice);
  if (!cohort) {
    return NextResponse.json({ error: 'Invoice is not in any dunning window right now' }, { status: 422 });
  }

  const contacts = await listContacts(org.id);
  const contact = contacts.find((c) => c.is_primary) ?? contacts[0];

  const email = renderDunningEmail({
    invoice, org, contact, cohort, origin: request.nextUrl.origin,
  });

  return NextResponse.json({
    invoice: { id: invoice.id, invoice_number: invoice.invoice_number, amount: invoice.amount, date_due: invoice.date_due },
    org: { id: org.id, org_name: org.org_name, org_type: org.org_type },
    contact: contact ? { id: contact.id, first_name: contact.first_name, last_name: contact.last_name, email: contact.email, is_primary: contact.is_primary } : null,
    cohort: { key: cohort.key, label: cohort.label, tone: cohort.tone, description: cohort.description },
    email,
  });
}
