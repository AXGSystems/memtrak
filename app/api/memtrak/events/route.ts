import { NextRequest, NextResponse } from 'next/server';
import { getEvents, getStats, logEvent } from '@/lib/memtrak';

/**
 * MEMTrak Events API
 *
 * GET: Retrieve tracked events and stats
 *   ?action=stats  — aggregate stats
 *   ?action=events — recent events (optionally filter by cid, type, limit)
 *
 * POST: Manually log an event (for sends, bounces, replies logged by staff)
 */

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action') || 'stats';

  if (action === 'stats') {
    return NextResponse.json(getStats());
  }

  const cid = request.nextUrl.searchParams.get('cid') || undefined;
  const type = request.nextUrl.searchParams.get('type') || undefined;
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');

  return NextResponse.json(getEvents({ campaignId: cid, type, limit }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = logEvent({
      type: body.type || 'send',
      campaignId: body.campaignId || 'manual',
      recipientEmail: body.recipientEmail || '',
      recipientName: body.recipientName,
      metadata: body.metadata || {},
    });
    return NextResponse.json({ success: true, event });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
