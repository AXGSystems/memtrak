// ============================================================
// MEMTrak Payments — self-service dues collection
// ------------------------------------------------------------
// Real Stripe Checkout integration via the Stripe REST API (no SDK
// dependency added). Follows the codebase honesty convention: a
// payment session is ONLY created when STRIPE_SECRET_KEY is actually
// present in the environment. When it is absent we report
// "Not Configured" rather than fabricating a checkout URL or a paid
// state — the caller surfaces that truthfully to the member.
//
// Flow:
//   1. Member clicks "Pay" on an open invoice.
//   2. createCheckoutSession() builds a Stripe Checkout Session for the
//      invoice amount and returns the hosted-checkout URL.
//   3. Stripe redirects back; the checkout.session.completed webhook
//      (app/api/memtrak/webhooks/stripe) marks the invoice Paid via
//      markInvoicePaid() with the Stripe payment reference.
// ============================================================

export function isPaymentsConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export interface CheckoutInput {
  invoiceId: string;
  invoiceNumber: string;
  /** Amount in major units (e.g. dollars). Converted to cents for Stripe. */
  amount: number;
  currency?: string;
  description?: string;
  /** Absolute URL the member returns to after a successful/cancelled payment. */
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string | null;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

/**
 * Create a Stripe Checkout Session for an invoice. Throws a typed error when
 * payments are not configured so the route can return 503 (never a fake URL).
 */
export async function createCheckoutSession(input: CheckoutInput): Promise<CheckoutSession> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error('Payments not configured');
  }

  const currency = (input.currency ?? 'usd').toLowerCase();
  const amountCents = Math.round(input.amount * 100);
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new Error('Invalid payment amount');
  }

  // Stripe Checkout Sessions are created with application/x-www-form-urlencoded.
  const form = new URLSearchParams();
  form.set('mode', 'payment');
  form.set('success_url', input.successUrl);
  form.set('cancel_url', input.cancelUrl);
  form.set('client_reference_id', input.invoiceId);
  form.set('metadata[invoice_id]', input.invoiceId);
  form.set('metadata[invoice_number]', input.invoiceNumber);
  if (input.customerEmail) form.set('customer_email', input.customerEmail);
  form.set('line_items[0][quantity]', '1');
  form.set('line_items[0][price_data][currency]', currency);
  form.set('line_items[0][price_data][unit_amount]', String(amountCents));
  form.set('line_items[0][price_data][product_data][name]', `Invoice ${input.invoiceNumber}`);
  if (input.description) {
    form.set('line_items[0][price_data][product_data][description]', input.description.slice(0, 500));
  }

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  const data = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
  if (!res.ok || !data.url || !data.id) {
    throw new Error(data.error?.message ?? `Stripe error (${res.status})`);
  }
  return { id: data.id, url: data.url };
}

// ── Webhook signature verification ───────────────────────────
// Stripe signs webhook payloads with the endpoint's signing secret using
// HMAC-SHA256 over `${timestamp}.${rawBody}`. We verify it without the SDK.

export async function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | null,
  toleranceSeconds = 300,
): Promise<boolean> {
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signingSecret || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((kv) => {
      const [k, v] = kv.split('=');
      return [k?.trim(), v?.trim()];
    }),
  ) as { t?: string; v1?: string };

  if (!parts.t || !parts.v1) return false;

  // Reject stale timestamps (replay protection).
  const ts = Number(parts.t);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > toleranceSeconds) return false;

  const { createHmac, timingSafeEqual } = await import('node:crypto');
  const expected = createHmac('sha256', signingSecret)
    .update(`${parts.t}.${rawBody}`)
    .digest('hex');

  try {
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(parts.v1, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
