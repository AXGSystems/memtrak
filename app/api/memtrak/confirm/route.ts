import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/memtrak';

/**
 * MEMTrak Confirm/Deny Receipt — Both Actions = Confirmed Engagement
 *
 * This is the clever part: we give recipients TWO buttons:
 *   "Yes, I received this" → logs confirmed engagement
 *   "I didn't receive this" → ALSO logs confirmed engagement
 *
 * Why? Because clicking EITHER button proves they:
 *   1. Received the email
 *   2. Opened the email
 *   3. Read enough to find the button
 *   4. Took action (clicked)
 *
 * The "deny" response is actually useful data too — it may indicate
 * the email went to spam/junk, or the recipient is confused about
 * which message we're referring to. Either way, it's engagement.
 *
 * Usage in emails:
 *   "Did you receive our PFL compliance notice?
 *    [Yes, I received it] | [No, I didn't receive this]"
 *
 *   Both links point here with action=confirm or action=deny
 *
 * URL format:
 *   /api/memtrak/confirm?cid=CAMPAIGN_ID&rid=EMAIL&action=confirm
 *   /api/memtrak/confirm?cid=CAMPAIGN_ID&rid=EMAIL&action=deny
 */

export async function GET(request: NextRequest) {
  const cid = request.nextUrl.searchParams.get('cid') || 'unknown';
  const rid = request.nextUrl.searchParams.get('rid') || 'unknown';
  const action = request.nextUrl.searchParams.get('action') || 'confirm';

  // BOTH actions log confirmed engagement
  logEvent({
    type: 'open',
    campaignId: cid,
    recipientEmail: rid,
    metadata: {
      method: 'confirm-deny',
      action, // 'confirm' or 'deny' — both prove engagement
      confirmed: 'true', // always true because clicking = proof of receipt
      userAgent: request.headers.get('user-agent') || 'unknown',
    },
  });

  // Different pages based on action
  const isConfirm = action !== 'deny';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isConfirm ? 'Receipt Confirmed' : 'We Hear You'} — ALTA</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #1B3A5C 0%, #122840 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: white; border-radius: 16px; padding: 48px; max-width: 440px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
    .icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .icon-confirm { background: #f0fdf4; }
    .icon-deny { background: #fef3c7; }
    .icon svg { width: 32px; height: 32px; }
    h1 { color: #1B3A5C; font-size: 20px; margin: 0 0 8px 0; }
    p { color: #7f8c9b; font-size: 14px; margin: 0 0 16px 0; line-height: 1.6; }
    .note { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #64748b; margin-top: 16px; }
    .link { color: #4A90D9; text-decoration: none; font-size: 13px; font-weight: 600; }
    .footer { color: #ccc; font-size: 11px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon ${isConfirm ? 'icon-confirm' : 'icon-deny'}">
      ${isConfirm
        ? '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#8CC63F" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#E8923F" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>'
      }
    </div>
    <h1>${isConfirm ? 'Thank you!' : 'Got it — we\'ll look into this'}</h1>
    <p>${isConfirm
      ? 'Your receipt has been confirmed. No further action is needed.'
      : 'We\'ve noted that you may not have received our previous communication. A member of the ALTA team will follow up with you directly.'
    }</p>
    ${!isConfirm ? '<div class="note">If you\'re having trouble receiving emails from ALTA, please check your spam/junk folder or contact us at <strong>membership@alta.org</strong>.</div>' : ''}
    <br>
    <a href="https://www.alta.org" class="link">Visit alta.org &rarr;</a>
    <div class="footer">American Land Title Association</div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}
