import { NextResponse } from 'next/server';
import { listEvents } from '@/lib/member-data';

/**
 * GET /api/memtrak/connect-events
 *
 * Returns all ALTA Connect events (aggregated from memtrak_event_attendance)
 * with registration / attendance / revenue summaries. Sorted newest first.
 *
 * Note: this path is distinct from /api/memtrak/events, which is the email-
 * tracking event log (sends, opens, clicks).
 */
export async function GET() {
  const events = await listEvents();
  return NextResponse.json({ events }, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  });
}
