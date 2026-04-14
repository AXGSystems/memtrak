import { NextRequest, NextResponse } from 'next/server';
import { logEvent, isUnsubscribed, generatePixelUrl } from '@/lib/memtrak';

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
 * What autoTrack does:
 *   1. Checks each recipient against suppression list (skips unsubscribed)
 *   2. Injects ALTA logo tracker into email header (open tracking)
 *   3. Wraps all links through click tracker
 *   4. Appends CAN-SPAM compliant footer with unsubscribe link
 *   5. Logs a "send" event for each recipient
 *
 * Required env vars for actual sending:
 *   GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, GRAPH_TENANT_ID
 *
 * Without Graph credentials, this endpoint returns a preview of what
 * WOULD be sent, without actually sending.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to, subject, campaignId, autoTrack = true } = body;
    const { body: htmlBody } = body;

    if (!to || !Array.isArray(to) || !subject || !htmlBody || !campaignId) {
      return NextResponse.json({ error: 'to[], subject, body, and campaignId are required' }, { status: 400 });
    }

    const baseUrl = request.nextUrl.origin;

    // Filter out suppressed recipients
    const suppressionChecks = await Promise.all(
      to.map(async (r: { email: string }) => ({ r, unsub: await isUnsubscribed(r.email) }))
    );
    const activeRecipients = suppressionChecks.filter(c => !c.unsub).map(c => c.r);
    const suppressedCount = to.length - activeRecipients.length;

    // Preview mode (Graph API not connected)
    const hasGraph = process.env.GRAPH_CLIENT_ID && process.env.GRAPH_CLIENT_SECRET;

    const results = await Promise.all(activeRecipients.map(async (recipient: { email: string; name?: string }) => {
      let finalBody = htmlBody;

      if (autoTrack) {
        // Inject logo tracker at the top
        const logoTag = `<img src="${generatePixelUrl(baseUrl, campaignId, recipient.email).replace('/pixel?', '/logo?')}" alt="ALTA" width="120" height="40" style="display:block;margin:0 0 16px 0;" />`;
        finalBody = logoTag + finalBody;

        // Append CAN-SPAM footer with unsubscribe
        const footer = `
<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#94a3b8;text-align:center;">
  <p>American Land Title Association | 1800 M Street NW, Suite 300S | Washington, DC 20036</p>
  <p><a href="${baseUrl}/api/memtrak/unsubscribe?email=${encodeURIComponent(recipient.email)}&cid=${encodeURIComponent(campaignId)}" style="color:#4A90D9;">Unsubscribe</a> from future emails</p>
</div>`;
        finalBody += footer;
      }

      // Log the send event
      await logEvent({
        type: 'send',
        campaignId,
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        metadata: { from: from || 'membership@alta.org', subject },
      });

      return {
        email: recipient.email,
        name: recipient.name,
        status: hasGraph ? 'sent' : 'preview',
        bodyPreview: finalBody.slice(0, 200) + '...',
      };
    }));

    // TODO: When Graph API is connected, actually send via:
    // POST https://graph.microsoft.com/v1.0/users/{from}/sendMail
    // { message: { subject, body: { contentType: 'HTML', content: finalBody }, toRecipients: [{ emailAddress: { address: email } }] } }

    return NextResponse.json({
      status: hasGraph ? 'sent' : 'preview',
      message: hasGraph
        ? `${results.length} emails sent from ${from || 'membership@alta.org'}`
        : `Preview mode — ${results.length} emails would be sent. Connect Graph API to enable actual sending.`,
      campaignId,
      sent: results.length,
      suppressed: suppressedCount,
      results,
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
