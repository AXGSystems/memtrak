import { NextResponse } from 'next/server';
import { getPortalContext } from '@/lib/portal-auth';
import { listEvents, listAttendanceForOrg } from '@/lib/member-data';

/**
 * GET /api/portal/events
 *
 * Returns two lists for the member portal:
 *  • all upcoming events (the org can register for any)
 *  • the member's existing registrations
 */
export async function GET() {
  const gate = await getPortalContext();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const today = new Date().toISOString().slice(0, 10);
  const [allEvents, myAttendance] = await Promise.all([
    listEvents(),
    listAttendanceForOrg(gate.ctx.org_id),
  ]);

  const upcoming = allEvents.filter((e) => e.event_date >= today);
  const myEventIds = new Set(myAttendance.map((a) => a.alta_connect_event_id));

  return NextResponse.json({
    upcoming: upcoming.map((e) => ({ ...e, registered: myEventIds.has(e.alta_connect_event_id) })),
    my_registrations: myAttendance,
  });
}
