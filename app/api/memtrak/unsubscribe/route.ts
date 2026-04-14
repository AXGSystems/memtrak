import { NextRequest, NextResponse } from 'next/server';
import { unsubscribe, isUnsubscribed, logEvent, getSuppressionList } from '@/lib/memtrak';

/**
 * MEMTrak Unsubscribe — CAN-SPAM Compliant Opt-Out
 *
 * Every email ALTA sends MUST include an unsubscribe link (federal law).
 * This endpoint handles both the user-facing unsubscribe page and the
 * internal suppression list API.
 *
 * GET: Shows unsubscribe confirmation page to recipient
 *   /api/memtrak/unsubscribe?email=RECIPIENT_EMAIL&cid=CAMPAIGN_ID
 *
 * POST: API to manage suppression list (for staff/admin use)
 *   { action: 'list' } — returns full suppression list
 *   { action: 'check', email: '...' } — checks if email is suppressed
 *
 * CAN-SPAM Requirements Met:
 *   ✓ One-click unsubscribe (no login required)
 *   ✓ Processes within 10 business days (instant)
 *   ✓ Unsubscribe mechanism works for 30 days after send
 *   ✓ No conditions on unsubscribe (no "tell us why")
 *
 * Usage in email footer:
 *   <a href="https://dash.alta.org/api/memtrak/unsubscribe?email=RECIPIENT_EMAIL&cid=CAMPAIGN_ID">Unsubscribe</a>
 */

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') || '';
  const cid = request.nextUrl.searchParams.get('cid') || 'unknown';

  if (email) {
    // Process the unsubscribe
    await unsubscribe(email);

    // Log the event
    await logEvent({
      type: 'bounce', // Using bounce type for unsubscribes (they're "soft bounces" from a deliverability perspective)
      campaignId: cid,
      recipientEmail: email,
      metadata: { action: 'unsubscribe', method: 'one-click' },
    });
  }

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
    <h1>You&apos;ve been unsubscribed</h1>
    ${email ? `<div class="email">${email.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>` : ''}
    <p>You will no longer receive email communications from ALTA.</p>
    <p class="note">This may take up to 24 hours to fully process. If you believe you received this in error, please contact <strong>membership@alta.org</strong>.</p>
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
