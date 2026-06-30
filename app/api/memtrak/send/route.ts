import { NextRequest, NextResponse } from 'next/server';
import { logEvent, isUnsubscribed, generatePixelUrl } from '@/lib/memtrak';
import { isGraphConfigured, sendGraphMail } from '@/lib/graph';
import { requireStaff, safeError } from '@/lib/route-auth';

/**
 * Server-side allowlist of approved sender mailboxes (ASVS V4.1 — the caller
 * may NOT send as an arbitrary address). Any 'from' outside this set is
 * rejected before a message is composed, blocking spoofing/relay abuse.
 */
const ALLOWED_FROM = new Set<string>([
  'membership@alta.org',
  'licensing@alta.org',
]);
const DEFAULT_FROM = 'membership@alta.org';

/**
 * Conservative HTML sanitizer for caller-supplied email bodies (ASVS V5.2 —
 * unsanitized HTML). We strip the highest-risk active-content vectors before
 * the body is injected into a sent message: <script>/<style>/<iframe>/<object>
 * blocks, inline event-handler attributes (on*=...), and javascript:/vbscript:
 * URIs. This is allowlist-light by design — email HTML legitimately needs most
 * markup — but removes the script-execution surface a low-privilege caller
 * could otherwise smuggle into a mailing.
 */
function sanitizeEmailHtml(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed)\b[^>]*\/?\s*>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*(javascript|vbscript):[^"']*\2/gi, '$1=$2#$2')
    .replace(/(href|src)\s*=\s*(javascript|vbscript):[^\s>]*/gi, '$1=#');
}

/**
 * MEMTrak Send API — Programmatic Email Sending
 *
 * When Microsoft Graph API is connected, this endpoint can send emails
 * directly from membership@alta.org or licensing@alta.org with tracking
 * automatically embedded.
 *
 * POST: Send a tracked email
 *   {
 *     from: "membership@alta.org",
 *     to: [{ email, name }],
 *     subject: "...",
 *     body: "...", // HTML body
 *     campaignId: "pfl-compliance-apr-2026",
 *     autoTrack: true // auto-inject logo tracker + unsubscribe footer
 *   }
 *
 * Suppression + CAN-SPAM + RFC 8058 are ALWAYS applied (never gated by a flag):
 *   - Checks each recipient against the suppression list (skips unsubscribed)
 *   - Appends the CAN-SPAM footer (physical postal address + unsubscribe link)
 *   - Adds List-Unsubscribe / List-Unsubscribe-Post: List-Unsubscribe=One-Click
 *     headers (Gmail/Yahoo 2024 one-click requirement)
 *   - Logs a "send" event for each recipient
 *
 * autoTrack only controls engagement instrumentation:
 *   - Injects the ALTA logo tracker (open tracking)
 *
 * Required env vars for actual sending:
 *   GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, GRAPH_TENANT_ID
 *
 * Without Graph credentials, this endpoint returns a preview of what
 * WOULD be sent, without actually sending.
 */

export async function POST(request: NextRequest) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await request.json();
    const { from, to, subject, campaignId, autoTrack = true } = body;
    const { body: rawHtmlBody } = body;

    if (!to || !Array.isArray(to) || !subject || !rawHtmlBody || !campaignId) {
      return NextResponse.json({ error: 'to[], subject, body, and campaignId are required' }, { status: 400 });
    }

    // ASVS V4.1: never send as an arbitrary mailbox. Reject any explicit
    // 'from' that is not on the server-side allowlist.
    if (from != null && (typeof from !== 'string' || !ALLOWED_FROM.has(from))) {
      return NextResponse.json(
        { error: 'from must be an approved mailbox (membership@alta.org or licensing@alta.org)' },
        { status: 400 },
      );
    }

    // ASVS V5.2: strip active-content vectors from caller-supplied HTML.
    const htmlBody = sanitizeEmailHtml(String(rawHtmlBody));

    const baseUrl = request.nextUrl.origin;

    // Filter out suppressed recipients
    const suppressionChecks = await Promise.all(
      to.map(async (r: { email: string }) => ({ r, unsub: await isUnsubscribed(r.email) }))
    );
    const activeRecipients = suppressionChecks.filter(c => !c.unsub).map(c => c.r);
    const suppressedCount = to.length - activeRecipients.length;

    // Preview mode unless Microsoft Graph credentials are present.
    const hasGraph = isGraphConfigured();
    const fromMailbox = from || DEFAULT_FROM;

    const results = await Promise.all(activeRecipients.map(async (recipient: { email: string; name?: string }) => {
      let finalBody = htmlBody;

      // The unsubscribe URL is reused for both the visible footer link and the
      // RFC 8058 List-Unsubscribe header (Gmail/Yahoo 2024 bulk-sender rule).
      const unsubUrl = `${baseUrl}/api/memtrak/unsubscribe?email=${encodeURIComponent(recipient.email)}&cid=${encodeURIComponent(campaignId)}`;

      if (autoTrack) {
        // Inject logo tracker at the top (open tracking only — never gates compliance).
        const logoTag = `<img src="${generatePixelUrl(baseUrl, campaignId, recipient.email).replace('/pixel?', '/logo?')}" alt="ALTA" width="120" height="40" style="display:block;margin:0 0 16px 0;" />`;
        finalBody = logoTag + finalBody;
      }

      // CAN-SPAM footer (physical postal address + unsubscribe) is UNCONDITIONAL.
      // Legal compliance must never depend on the autoTrack flag — sending
      // commercial email without it is a federal CAN-SPAM violation.
      const footer = `
<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#94a3b8;text-align:center;">
  <p>American Land Title Association | 1800 M Street NW, Suite 300S | Washington, DC 20036</p>
  <p><a href="${unsubUrl}" style="color:#4A90D9;">Unsubscribe</a> from future emails</p>
</div>`;
      finalBody += footer;

      // RFC 8058 one-click unsubscribe headers — required for bulk senders to
      // Gmail/Yahoo since Feb 2024. The List-Unsubscribe-Post signal tells the
      // provider to POST `List-Unsubscribe=One-Click` to the URL, which our
      // unsubscribe route honors without a confirmation click.
      const listUnsubHeaders: Record<string, string> = {
        'List-Unsubscribe': `<${unsubUrl}>, <mailto:unsubscribe@alta.org?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      };

      // Actually send via Microsoft Graph when configured. Record the true
      // per-recipient outcome — a send event is only logged on success.
      let status: 'sent' | 'preview' | 'failed' = 'preview';
      let error: string | undefined;

      if (hasGraph) {
        try {
          await sendGraphMail({
            from: fromMailbox,
            toEmail: recipient.email,
            toName: recipient.name,
            subject,
            htmlBody: finalBody,
            headers: listUnsubHeaders,
          });
          status = 'sent';
        } catch (e) {
          status = 'failed';
          error = e instanceof Error ? e.message : 'send failed';
        }
      }

      // Log a send event only for actually-sent mail, or in preview mode
      // (preview records the intended send for tracking continuity).
      if (status === 'sent' || status === 'preview') {
        await logEvent({
          type: 'send',
          campaignId,
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          metadata: { from: fromMailbox, subject, mode: status },
        });
      }

      return {
        email: recipient.email,
        name: recipient.name,
        status,
        ...(error ? { error } : {}),
        bodyPreview: finalBody.slice(0, 200) + '...',
      };
    }));

    const sentCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;

    return NextResponse.json({
      status: hasGraph ? (failedCount > 0 ? 'partial' : 'sent') : 'preview',
      message: hasGraph
        ? `${sentCount} email(s) sent from ${fromMailbox}${failedCount > 0 ? `, ${failedCount} failed` : ''}.`
        : `Preview mode — ${results.length} email(s) would be sent. Set GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, and GRAPH_TENANT_ID to enable actual sending.`,
      campaignId,
      sent: hasGraph ? sentCount : 0,
      previewed: hasGraph ? 0 : results.length,
      failed: failedCount,
      suppressed: suppressedCount,
      results,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
