import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/memtrak';

/**
 * MEMTrak Tracking Pixel
 *
 * Embed in emails as: <img src="https://dash.alta.org/api/memtrak/pixel?cid=CAMPAIGN_ID&rid=RECIPIENT_EMAIL" width="1" height="1" alt="" />
 *
 * When the recipient's email client loads the image, this endpoint:
 * 1. Logs the "open" event with campaign ID and recipient
 * 2. Returns a 1x1 transparent GIF
 *
 * Works with: Outlook, Gmail, Apple Mail, most mobile clients
 * Does NOT work when: images are blocked by default (some corporate Outlook configs)
 */

// 1x1 transparent GIF (43 bytes)
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

export async function GET(request: NextRequest) {
  const cid = request.nextUrl.searchParams.get('cid') || 'unknown';
  const rid = request.nextUrl.searchParams.get('rid') || 'unknown';

  // Log the open event
  logEvent({
    type: 'open',
    campaignId: cid,
    recipientEmail: rid,
    metadata: {
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    },
  });

  // Return transparent 1x1 GIF with no-cache headers
  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(PIXEL.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
