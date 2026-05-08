import type { Invoice, Organization, Contact } from './member-data';

export type DunningCohortKey = 'pre_60' | 'pre_30' | 'pre_7' | 'past_7' | 'past_30' | 'past_60';

export interface DunningCohort {
  key: DunningCohortKey;
  label: string;
  /** Days before (negative) / after (positive) the due date this cohort targets */
  offsetDays: number;
  /** Inclusive lower / upper window relative to today */
  windowDays: { from: number; to: number };
  tone: 'friendly' | 'firm' | 'urgent';
  description: string;
}

export const DUNNING_COHORTS: DunningCohort[] = [
  { key: 'pre_60',  label: '60 days before',  offsetDays: -60, windowDays: { from: 53, to: 60 }, tone: 'friendly', description: 'Soft pre-renewal nudge — give members runway' },
  { key: 'pre_30',  label: '30 days before',  offsetDays: -30, windowDays: { from: 23, to: 30 }, tone: 'friendly', description: 'Standard renewal reminder' },
  { key: 'pre_7',   label: '7 days before',   offsetDays: -7,  windowDays: { from: 1,  to: 7  }, tone: 'firm',     description: 'Final pre-due reminder with payment link' },
  { key: 'past_7',  label: '7 days past due', offsetDays: 7,   windowDays: { from: -7,  to: -1  }, tone: 'firm',    description: 'Friendly past-due nudge' },
  { key: 'past_30', label: '30 days past',    offsetDays: 30,  windowDays: { from: -30, to: -8  }, tone: 'urgent', description: 'Past-due escalation' },
  { key: 'past_60', label: '60 days past',    offsetDays: 60,  windowDays: { from: -60, to: -31 }, tone: 'urgent', description: 'Final notice before suspension' },
];

const todayStartUTC = () => {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

const dateMs = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));

/** Days from today to dueIso (positive = future). Today = 0. */
export function daysUntilDue(dueIso: string): number {
  const diff = dateMs(dueIso) - todayStartUTC();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/**
 * Returns the cohort an invoice falls into based on days-until-due.
 * Returns null if the invoice does not currently match any dunning window.
 */
export function cohortForInvoice(inv: Invoice): DunningCohort | null {
  if (inv.status === 'Paid' || inv.status === 'Cancelled' || inv.status === 'Refunded') return null;
  const days = daysUntilDue(inv.date_due);
  for (const c of DUNNING_COHORTS) {
    if (days >= c.windowDays.from && days <= c.windowDays.to) return c;
  }
  return null;
}

/**
 * Buckets a list of invoices into the 6 dunning cohorts. Returns one entry
 * per cohort (in canonical order), with the matching invoices and totals.
 */
export interface DunningBucket {
  cohort: DunningCohort;
  invoices: Invoice[];
  total: number;
}

export function bucketInvoices(invoices: Invoice[]): DunningBucket[] {
  const buckets: DunningBucket[] = DUNNING_COHORTS.map((cohort) => ({
    cohort, invoices: [] as Invoice[], total: 0,
  }));
  const byKey = new Map(buckets.map((b) => [b.cohort.key, b]));

  for (const inv of invoices) {
    const cohort = cohortForInvoice(inv);
    if (!cohort) continue;
    const b = byKey.get(cohort.key);
    if (!b) continue;
    b.invoices.push(inv);
    b.total += inv.amount;
  }
  return buckets;
}

// ── Email template generation ────────────────────────────────

export interface DunningEmailRenderInput {
  invoice: Invoice;
  org: Organization;
  contact?: Contact;
  cohort: DunningCohort;
  /** Origin used to build absolute payment + unsubscribe URLs */
  origin?: string;
}

export interface DunningEmail {
  subject: string;
  body: string;
  to: { email: string; name?: string }[];
  campaignId: string;
}

const subjectFor = (inv: Invoice, org: Organization, cohort: DunningCohort): string => {
  const fy = inv.fiscal_year ?? new Date(inv.date_due).getFullYear();
  switch (cohort.key) {
    case 'pre_60': return `${fy} ALTA Renewal — early heads-up for ${org.org_name}`;
    case 'pre_30': return `${fy} ALTA Membership Renewal — ${org.org_name}`;
    case 'pre_7':  return `Final reminder: ${org.org_name} renewal due ${inv.date_due}`;
    case 'past_7': return `Past due: ${inv.invoice_number} for ${org.org_name}`;
    case 'past_30': return `Action required: 30 days overdue — ${inv.invoice_number}`;
    case 'past_60': return `Final notice — membership at risk of suspension (${inv.invoice_number})`;
  }
};

const bodyFor = (input: DunningEmailRenderInput): string => {
  const { invoice: inv, org, contact, cohort, origin } = input;
  const baseUrl = origin ?? '';
  const payUrl = `${baseUrl}/invoices?status=${encodeURIComponent('Sent')}&q=${encodeURIComponent(inv.invoice_number)}`;
  const greetName = contact ? `${contact.first_name}` : `${org.org_name}`;
  const amount = `$${inv.amount.toLocaleString()}`;
  const fy = inv.fiscal_year ?? new Date(inv.date_due).getFullYear();

  const intro = (() => {
    switch (cohort.key) {
      case 'pre_60':
        return `<p>Hi ${greetName},</p>
        <p>Your ${fy} ALTA membership renewal is coming up on <strong>${inv.date_due}</strong>. We wanted to give you a friendly heads-up so there are no surprises.</p>`;
      case 'pre_30':
        return `<p>Hi ${greetName},</p>
        <p>This is your ${fy} ALTA renewal notice. Your membership for <strong>${org.org_name}</strong> renews on <strong>${inv.date_due}</strong>.</p>`;
      case 'pre_7':
        return `<p>Hi ${greetName},</p>
        <p>Your ${fy} ALTA membership renewal for <strong>${org.org_name}</strong> is due in just a few days (<strong>${inv.date_due}</strong>). Please use the link below to renew before the deadline.</p>`;
      case 'past_7':
        return `<p>Hi ${greetName},</p>
        <p>We noticed your ${fy} ALTA renewal payment hasn't arrived yet. The invoice was due on <strong>${inv.date_due}</strong>. Could you take a moment to settle this so your membership stays active without interruption?</p>`;
      case 'past_30':
        return `<p>Hi ${greetName},</p>
        <p>Your ${fy} ALTA renewal is now <strong>more than 30 days past due</strong>. To avoid loss of member benefits — including event registration, advocacy alerts, and committee participation — please bring your account current as soon as possible.</p>`;
      case 'past_60':
        return `<p>Hi ${greetName},</p>
        <p>This is a final notice. <strong>${org.org_name}</strong>'s ${fy} ALTA membership has been past due for over 60 days and is now at risk of suspension. If we don't receive payment within the next 14 days, your account will be moved to suspended status.</p>`;
    }
  })();

  const summary = `
    <table role="presentation" cellpadding="8" style="border-collapse: collapse; margin: 16px 0; font-family: Arial, sans-serif; font-size: 13px;">
      <tr><td style="color: #6b7280;">Invoice</td><td><strong>${inv.invoice_number}</strong></td></tr>
      <tr><td style="color: #6b7280;">Amount</td><td><strong>${amount}</strong></td></tr>
      <tr><td style="color: #6b7280;">Due date</td><td>${inv.date_due}</td></tr>
      <tr><td style="color: #6b7280;">Member type</td><td>${org.org_type}</td></tr>
    </table>
  `;

  const cta = `<p style="margin: 24px 0;">
    <a href="${payUrl}" style="display: inline-block; padding: 10px 18px; background: #1B3A5C; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Pay invoice ${inv.invoice_number}</a>
  </p>`;

  const close = (() => {
    switch (cohort.tone) {
      case 'friendly': return `<p>Thank you for your continued membership.</p><p>— ALTA Membership Team</p>`;
      case 'firm':     return `<p>If you have already paid, please disregard this email. If you have questions, reach out to <a href="mailto:membership@alta.org">membership@alta.org</a>.</p><p>— ALTA Membership Team</p>`;
      case 'urgent':   return `<p>Please contact <a href="mailto:membership@alta.org">membership@alta.org</a> immediately if there is an issue with this invoice.</p><p>— ALTA Membership Team</p>`;
    }
  })();

  return `<div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
    ${intro}
    ${summary}
    ${cta}
    ${close}
  </div>`;
};

export function renderDunningEmail(input: DunningEmailRenderInput): DunningEmail {
  const subject = subjectFor(input.invoice, input.org, input.cohort);
  const body = bodyFor(input);
  const to = input.contact?.email
    ? [{ email: input.contact.email, name: `${input.contact.first_name} ${input.contact.last_name}` }]
    : [];
  const campaignId = `dunning-${input.cohort.key}-${input.invoice.fiscal_year ?? 'fy'}`;
  return { subject, body, to, campaignId };
}
