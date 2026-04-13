import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/memtrak';

/**
 * MEMTrak Read Receipt — "Confirm you received this" landing page
 *
 * This is the MOST RELIABLE tracking method. Unlike pixels (blocked by
 * many corporate Outlook configs), this requires the recipient to click
 * a link — which NO email client blocks.
 *
 * Usage in emails:
 *   "Please confirm receipt: https://dash.alta.org/api/memtrak/receipt?cid=CAMPAIGN_ID&rid=EMAIL"
 *
 * When clicked:
 *   1. Logs a "confirmed" event (stronger signal than pixel open)
 *   2. Shows a branded confirmation page thanking the recipient
 *
 * This works because:
 *   - Link clicks are NEVER blocked by email clients
 *   - The recipient takes an explicit action (high-quality signal)
 *   - Works on 100% of devices, 100% of email clients
 *   - Also captures user agent and timestamp
 */

export async function GET(request: NextRequest) {
  const cid = request.nextUrl.searchParams.get('cid') || 'unknown';
  const rid = request.nextUrl.searchParams.get('rid') || 'unknown';

  // Log the confirmed-open event
  logEvent({
    type: 'open',
    campaignId: cid,
    recipientEmail: rid,
    metadata: {
      method: 'receipt-confirmation',
      userAgent: request.headers.get('user-agent') || 'unknown',
      confirmed: 'true',
    },
  });

  // Return a branded confirmation page
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message Confirmed — ALTA</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #1B3A5C 0%, #122840 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: white; border-radius: 16px; padding: 48px; max-width: 420px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
    .check { width: 64px; height: 64px; background: #f0fdf4; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .check svg { width: 32px; height: 32px; color: #8CC63F; }
    h1 { color: #1B3A5C; font-size: 20px; margin: 0 0 8px 0; }
    p { color: #7f8c9b; font-size: 14px; margin: 0 0 24px 0; line-height: 1.6; }
    .link { color: #4A90D9; text-decoration: none; font-size: 13px; font-weight: 600; }
    .footer { color: #ccc; font-size: 11px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="check">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h1>Thank you!</h1>
    <p>Your receipt has been confirmed. No further action is needed.</p>
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
