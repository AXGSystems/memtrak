import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/memtrak';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * MEMTrak Logo Tracker — The Stealth Approach
 *
 * Instead of a suspicious invisible 1x1 pixel, this endpoint serves the
 * actual ALTA shield logo PNG. The email header/signature contains the
 * logo as usual — but the image URL points HERE instead of a static file.
 *
 * When the recipient's email client renders the logo:
 *   1. It fetches this endpoint
 *   2. We log the open event (campaign, recipient, timestamp)
 *   3. We serve back the real alta-shield.png
 *
 * Why this works better than a tracking pixel:
 *   - Logo images are EXPECTED content — email clients don't block them
 *   - Even corporate Outlook configs that block "remote images" often
 *     whitelist images from known/trusted senders
 *   - The logo renders normally — the recipient sees nothing unusual
 *   - Works with Apple Mail Privacy Protection (Apple pre-fetches ALL
 *     images including logos, so we still get the event)
 *
 * Usage in email HTML:
 *   <img src="https://dash.alta.org/api/memtrak/logo?cid=CAMPAIGN_ID&rid=RECIPIENT_EMAIL"
 *        alt="ALTA" width="120" height="40" />
 *
 * Replace the static logo URL in your email template with this tracked version.
 */

let cachedLogo: Buffer | null = null;

async function getLogo(): Promise<Buffer> {
  if (cachedLogo) return cachedLogo;
  try {
    // Try to read from public directory
    cachedLogo = await readFile(join(process.cwd(), 'public', 'alta-shield.png'));
    return cachedLogo;
  } catch {
    // Fallback: return a minimal 1x1 PNG if logo file not found
    return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  }
}

export async function GET(request: NextRequest) {
  const cid = request.nextUrl.searchParams.get('cid') || 'unknown';
  const rid = request.nextUrl.searchParams.get('rid') || 'unknown';

  // Log the open event
  await logEvent({
    type: 'open',
    campaignId: cid,
    recipientEmail: rid,
    metadata: {
      method: 'logo-tracker',
      userAgent: request.headers.get('user-agent') || 'unknown',
    },
  });

  // Serve the real logo
  const logo = await getLogo();

  return new NextResponse(new Uint8Array(logo), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Content-Length': String(logo.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
