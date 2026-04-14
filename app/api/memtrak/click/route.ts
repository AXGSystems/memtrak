import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/memtrak';

/**
 * MEMTrak Click Tracker
 *
 * Wrap email links as: https://dash.alta.org/api/memtrak/click?cid=CAMPAIGN_ID&rid=RECIPIENT_EMAIL&url=DESTINATION_URL
 *
 * When the recipient clicks:
 * 1. Logs the "click" event with campaign, recipient, and destination
 * 2. Redirects (302) to the actual destination URL
 */

// Allowlist of safe redirect domains — ONLY these can be redirect targets
const SAFE_DOMAINS = ['alta.org', 'www.alta.org', 'team.alta.org', 'remembers.com', 'alta.atlassian.net'];

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Must be HTTPS (no HTTP redirects)
    if (parsed.protocol !== 'https:') return false;
    // Must match allowlist exactly
    return SAFE_DOMAINS.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const cid = request.nextUrl.searchParams.get('cid') || 'unknown';
  const rid = request.nextUrl.searchParams.get('rid') || 'unknown';
  const url = request.nextUrl.searchParams.get('url') || '';

  // Log the click event
  await logEvent({
    type: 'click',
    campaignId: cid,
    recipientEmail: rid,
    metadata: {
      destinationUrl: url,
      userAgent: request.headers.get('user-agent') || 'unknown',
    },
  });

  // Validate and redirect
  if (url && isSafeUrl(url)) {
    return NextResponse.redirect(url, 302);
  }

  // Fallback: redirect to ALTA homepage if URL is missing or unsafe
  return NextResponse.redirect('https://www.alta.org', 302);
}
