import { NextRequest, NextResponse } from 'next/server';
import { getPortalContext } from '@/lib/portal-auth';
import { getInvoice } from '@/lib/member-data';
import { createCheckoutSession, isPaymentsConfigured } from '@/lib/payments';

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/portal/invoices/[id]/pay
 *
 * Self-service dues payment for the signed-in member. Verifies the invoice
 * belongs to the member's organization and is payable, then returns a Stripe
 * Checkout URL. When no payment gateway is configured this returns 503 with a
 * truthful "not configured" message — it never fabricates a checkout link or
 * a paid status.
 */
export async function POST(request: NextRequest, ctx: Ctx) {
  const gate = await getPortalContext();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  const invoice = await getInvoice(id);
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

  // Authorization: the member may only pay invoices for their own org.
  if (invoice.org_id !== gate.ctx.org_id) {
    return NextResponse.json({ error: 'Not authorized for this invoice' }, { status: 403 });
  }

  if (invoice.status === 'Paid') {
    return NextResponse.json({ error: 'Invoice is already paid' }, { status: 409 });
  }
  if (invoice.status === 'Cancelled' || invoice.status === 'Refunded') {
    return NextResponse.json({ error: `Invoice is ${invoice.status.toLowerCase()} and cannot be paid` }, { status: 409 });
  }

  if (!isPaymentsConfigured()) {
    return NextResponse.json(
      { error: 'Online payment is not configured for this environment.', configured: false },
      { status: 503 },
    );
  }

  const origin = request.nextUrl.origin;
  try {
    const session = await createCheckoutSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      amount: invoice.amount,
      description: invoice.description ?? undefined,
      successUrl: `${origin}/portal/invoices?paid=${encodeURIComponent(invoice.invoice_number)}`,
      cancelUrl: `${origin}/portal/invoices?cancelled=1`,
      customerEmail: gate.ctx.email,
    });
    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not start payment';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
