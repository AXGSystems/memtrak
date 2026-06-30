/**
 * MEMTrak — Microsoft Graph mail client
 *
 * App-only (client credentials) auth against Microsoft Graph for sending
 * tracked email from membership@ / licensing@ mailboxes. Raw HTTP — the
 * project ships no Graph SDK dependency. Server-side only.
 *
 * Honest by design: if the Graph credentials are absent, isGraphConfigured()
 * returns false and the send route stays in preview mode rather than
 * pretending mail was sent.
 *
 * Required env vars: GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, GRAPH_TENANT_ID
 */

export function isGraphConfigured(): boolean {
  return !!(
    process.env.GRAPH_CLIENT_ID &&
    process.env.GRAPH_CLIENT_SECRET &&
    process.env.GRAPH_TENANT_ID
  );
}

async function getGraphToken(): Promise<string> {
  const tenant = process.env.GRAPH_TENANT_ID;
  const clientId = process.env.GRAPH_CLIENT_ID;
  const clientSecret = process.env.GRAPH_CLIENT_SECRET;
  if (!tenant || !clientId || !clientSecret) {
    throw new Error('Microsoft Graph is not configured');
  }

  const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(tenant)}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Graph token error ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('Graph token response missing access_token');
  return data.access_token;
}

/**
 * Send a single HTML email via Graph sendMail as the `from` mailbox.
 * Throws on failure so the caller can record an accurate per-recipient status.
 */
export async function sendGraphMail(opts: {
  from: string;
  toEmail: string;
  toName?: string;
  subject: string;
  htmlBody: string;
  /**
   * Extra internet message headers (e.g. RFC 8058 List-Unsubscribe /
   * List-Unsubscribe-Post). Sent via Graph's `internetMessageHeaders`.
   */
  headers?: Record<string, string>;
}): Promise<void> {
  const token = await getGraphToken();
  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(opts.from)}/sendMail`;

  const internetMessageHeaders = opts.headers
    ? Object.entries(opts.headers).map(([name, value]) => ({ name, value }))
    : undefined;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        subject: opts.subject,
        body: { contentType: 'HTML', content: opts.htmlBody },
        toRecipients: [
          {
            emailAddress: {
              address: opts.toEmail,
              ...(opts.toName ? { name: opts.toName } : {}),
            },
          },
        ],
        ...(internetMessageHeaders ? { internetMessageHeaders } : {}),
      },
      saveToSentItems: true,
    }),
  });

  // Graph sendMail returns 202 Accepted with an empty body on success.
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Graph sendMail ${res.status}: ${detail.slice(0, 200)}`);
  }
}
