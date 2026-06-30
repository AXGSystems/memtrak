import { NextRequest, NextResponse } from 'next/server';
import { verifyStripeSignature } from '@/lib/payments';
import { getInvoice, markInvoicePaid } from '@/lib/member-data';
import { logEntityAudit } from '@/lib/audit';
import { safeError } from '@/lib/route-auth';

/**
 * POST /api/memtrak/webhooks/stripe
 *
 * Receives Stripe payment events. On `checkout.session.completed` it marks the
 * referenced invoice Paid (idempotently — already-paid invoices are a no-op).
 * The signature is HMAC-verified against STRIPE_WEBHOOK_SECRET; unsigned or
 * stale requests are rejected. This is the ONLY path that sets an invoice to
 * Paid from a gateway, so a fake/forged call cannot mark dues collected.
 *
 * Public endpoint by design (Stripe is unauthenticated) — security comes from
 * the signature check, not a session gate.
 */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const sig = request.headers.get('stripe-signature');

  const valid = await verifyStripeSignature(raw, sig);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid or missing signature' }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    // Acknowledge other events without acting on them.
    return NextResponse.json({ received: true, ignored: event.type ?? null });
  }

  const session = event.data?.object ?? {};
  const metadata = (session.metadata as Record<string, unknown> | undefined) ?? {};
  const invoiceId =
    (typeof metadata.invoice_id === 'string' && metadata.invoice_id) ||
    (typeof session.client_reference_id === 'string' && session.client_reference_id) ||
    '';
  const paymentRef =
    (typeof session.payment_intent === 'string' && session.payment_intent) ||
    (typeof session.id === 'string' && session.id) ||
    undefined;

  if (!invoiceId) {
    return NextResponse.json({ received: true, warning: 'No invoice reference on session' });
  }

  try {
    const existing = await getInvoice(invoiceId);
    if (!existing) {
      return NextResponse.json({ received: true, warning: 'Invoice not found' });
    }
    // Idempotent: a duplicate webhook for an already-paid invoice does nothing.
    if (existing.status === 'Paid') {
      return NextResponse.json({ received: true, alreadyPaid: true });
    }

    const invoice = await markInvoicePaid(invoiceId, {
      payment_method: 'Stripe',
      payment_reference: paymentRef,
    });
    logEntityAudit({
      entity: 'invoice', entity_id: invoiceId, entity_label: invoice.invoice_number,
      action: 'pay', actor: 'stripe-webhook',
      summary: `Invoice ${invoice.invoice_number} paid online via Stripe ($${invoice.amount.toLocaleString()})`,
    });
    return NextResponse.json({ received: true, paid: true });
  } catch (err) {
    // 500 so Stripe retries delivery; generic body avoids leaking internals.
    return safeError(err);
  }
}
