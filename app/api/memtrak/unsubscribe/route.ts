import { NextRequest, NextResponse } from 'next/server';
import { unsubscribe, isUnsubscribed, logEvent, getSuppressionList } from '@/lib/memtrak';
import { auth } from '@/auth';
import { isAuthEnabled, isPreviewOpen, type AuthRole } from '@/lib/auth.config';

/**
 * Staff/admin guard for the JSON suppression API. This route is in
 * AUTH_BYPASS_PREFIXES so the public unsubscribe page + RFC 8058 one-click
 * POST stay reachable without a session — but the suppression-list dump and
 * per-email lookups are member PII and MUST NOT be public, so we gate the
 * JSON branch explicitly here (defense-in-depth, fail-closed).
 */
async function requireStaff(): Promise<boolean> {
  if (!isAuthEnabled()) return isPreviewOpen();
  const session = await auth();
  const role = (session?.user as { role?: AuthRole } | undefined)?.role;
  return role === 'admin' || role === 'staff' || role === 'read-only';
}

/**
 * MEMTrak Unsubscribe — CAN-SPAM + RFC 8058 Compliant Opt-Out
 *
 * Every email ALTA sends MUST include an unsubscribe link (federal law) and,
 * for bulk senders to Gmail/Yahoo (2024 mandate), a one-click List-Unsubscribe
 * mechanism. This endpoint handles the user-facing unsubscribe page, the
 * mailbox-provider one-click POST, and the internal suppression list API.
 *
 * GET: Renders the unsubscribe confirmation page. It is SAFE/idempotent and
 *      does NOT mutate state, so link prefetchers and security scanners
 *      (Outlook SafeLinks, Gmail image proxy, Apple Mail Privacy Protection)
 *      cannot silently unsubscribe a recipient who never clicked.
 *   /api/memtrak/unsubscribe?email=RECIPIENT_EMAIL&cid=CAMPAIGN_ID
 *
 * POST (RFC 8058 one-click): When the body contains the one-click signal
 *      `List-Unsubscribe=One-Click` (sent automatically by Gmail/Yahoo when a
 *      recipient hits the native "Unsubscribe" control), this performs the
 *      suppression and logs an 'unsubscribe' event. The human-facing
 *      confirmation page (GET) shows the same form with a real submit button.
 *
 * POST (admin API): JSON body for staff/admin use
 *   { action: 'list' } — returns full suppression list
 *   { action: 'check', email: '...' } — checks if email is suppressed
 *
 * Compliance:
 *   ✓ RFC 8058 one-click unsubscribe via POST (Gmail/Yahoo 2024 requirement)
 *   ✓ Honored well within the 2-day window the bulk-sender rules require
 *   ✓ No login and no conditions on unsubscribe (no "tell us why")
 *   ✓ GET is a safe confirmation only — mutation happens on POST
 *
 * Email headers (set by the send route):
 *   List-Unsubscribe: <https://.../api/memtrak/unsubscribe?...>, <mailto:unsubscribe@alta.org>
 *   List-Unsubscribe-Post: List-Unsubscribe=One-Click
 */

// Shared helper: record a suppression and log a distinct 'unsubscribe' event.
async function processUnsubscribe(email: string, cid: string, method: string): Promise<void> {
  await unsubscribe(email);
  await logEvent({
    type: 'unsubscribe',
    campaignId: cid,
    recipientEmail: email,
    metadata: { action: 'unsubscribe', method },
  });
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') || '';
  const cid = request.nextUrl.searchParams.get('cid') || 'unknown';
  const safeEmail = email.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // GET is intentionally read-only. Suppression occurs on the POST below
  // (either the provider one-click POST or this page's form submit).
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribed — ALTA</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #1B3A5C 0%, #122840 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: white; border-radius: 16px; padding: 48px; max-width: 440px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
    .icon { width: 64px; height: 64px; background: #f0f9ff; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .icon svg { width: 32px; height: 32px; color: #4A90D9; }
    h1 { color: #1B3A5C; font-size: 20px; margin: 0 0 8px 0; }
    p { color: #7f8c9b; font-size: 14px; margin: 0 0 8px 0; line-height: 1.6; }
    .email { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 16px; font-size: 13px; color: #1B3A5C; font-weight: 600; display: inline-block; margin: 8px 0 16px; }
    .note { font-size: 12px; color: #94a3b8; margin-top: 16px; }
    .btn { background: #1B3A5C; color: #fff; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; margin: 8px 0; }
    .btn:hover { background: #122840; }
    .footer { color: #ccc; font-size: 11px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </div>
    <h1>Unsubscribe from ALTA emails</h1>
    ${email ? `<div class="email">${safeEmail}</div>` : ''}
    <p>Confirm below and you will no longer receive email communications from ALTA.</p>
    <form method="POST" action="/api/memtrak/unsubscribe">
      <input type="hidden" name="email" value="${safeEmail}" />
      <input type="hidden" name="cid" value="${cid.replace(/</g, '&lt;').replace(/>/g, '&gt;')}" />
      <button type="submit" class="btn">Confirm unsubscribe</button>
    </form>
    <p class="note">This is processed immediately. If you believe you received this in error, please contact <strong>membership@alta.org</strong>.</p>
    <div class="footer">American Land Title Association<br>1800 M Street NW, Suite 300S, Washington, DC 20036</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';

  // ── Form / one-click flows (RFC 8058 + human confirmation form) ──
  // Mailbox providers (Gmail/Yahoo) POST `List-Unsubscribe=One-Click` as
  // form-urlencoded; the confirmation page posts the email + cid the same way.
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const oneClick = form.get('List-Unsubscribe');
    const email = (form.get('email') as string) || request.nextUrl.searchParams.get('email') || '';
    const cid = (form.get('cid') as string) || request.nextUrl.searchParams.get('cid') || 'unknown';

    // Provider one-click: no email in body, identity is carried in the URL params.
    const method = oneClick === 'One-Click' ? 'one-click-rfc8058' : 'confirmation-page';

    if (email) {
      await processUnsubscribe(email, cid, method);
    }

    // RFC 8058 one-click expects a simple 2xx; the human form expects a page.
    if (oneClick === 'One-Click' && !contentType.includes('multipart/form-data')) {
      return new NextResponse('Unsubscribed', { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }

    const safeEmail = email.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Unsubscribed — ALTA</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:linear-gradient(135deg,#1B3A5C 0%,#122840 100%);min-height:100vh;display:flex;align-items:center;justify-content:center}.card{background:#fff;border-radius:16px;padding:48px;max-width:440px;text-align:center;box-shadow:0 25px 50px rgba(0,0,0,.25)}h1{color:#1B3A5C;font-size:20px;margin:0 0 8px}p{color:#7f8c9b;font-size:14px;margin:0 0 8px;line-height:1.6}.email{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 16px;font-size:13px;color:#1B3A5C;font-weight:600;display:inline-block;margin:8px 0 16px}.footer{color:#ccc;font-size:11px;margin-top:32px}</style></head><body><div class="card"><h1>You&apos;ve been unsubscribed</h1>${email ? `<div class="email">${safeEmail}</div>` : ''}<p>You will no longer receive email communications from ALTA.</p><div class="footer">American Land Title Association<br>1800 M Street NW, Suite 300S, Washington, DC 20036</div></div></body></html>`;
    return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html' } });
  }

  // ── Staff/admin JSON API (suppression list + lookups are member PII) ──
  // Gated here because this route is in AUTH_BYPASS_PREFIXES for the public
  // unsubscribe flow; the JSON branch must NOT inherit that bypass.
  if (!(await requireStaff())) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  try {
    const body = await request.json();

    if (body.action === 'list') {
      return NextResponse.json({ suppressionList: await getSuppressionList() });
    }

    if (body.action === 'check' && body.email) {
      return NextResponse.json({ email: body.email, unsubscribed: await isUnsubscribed(body.email) });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
