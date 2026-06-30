import { NextRequest, NextResponse } from 'next/server';
import { getEvents, getStats, logEvent } from '@/lib/memtrak';
import { requireReadOnly, requireStaff } from '@/lib/route-auth';

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
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const action = request.nextUrl.searchParams.get('action') || 'stats';

  if (action === 'stats') {
    return NextResponse.json(await getStats());
  }

  const cid = request.nextUrl.searchParams.get('cid') || undefined;
  const type = request.nextUrl.searchParams.get('type') || undefined;
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100');

  return NextResponse.json(await getEvents({ campaignId: cid, type, limit }));
}

export async function POST(request: NextRequest) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  try {
    const body = await request.json();
    const event = await logEvent({
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
