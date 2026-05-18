import { NextRequest, NextResponse } from 'next/server';
import { getPortalContext } from '@/lib/portal-auth';
import { getEvent, recordAttendance } from '@/lib/member-data';
import { logEntityAudit } from '@/lib/audit';

/**
 * POST /api/portal/register-event
 *
 * Self-register the current member for an existing event. Unlike the
 * staff endpoint, this never bootstraps a new event — the event must
 * already exist (created by staff via /events).
 *
 * Body: { alta_connect_event_id }
 */
export async function POST(request: NextRequest) {
  const gate = await getPortalContext();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const eventId = typeof body.alta_connect_event_id === 'string' ? body.alta_connect_event_id.trim() : '';
  if (!eventId) return NextResponse.json({ error: 'alta_connect_event_id required' }, { status: 400 });

  const found = await getEvent(eventId);
  if (!found) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  try {
    const row = await recordAttendance({
      alta_connect_event_id: eventId,
      event_name: found.event.event_name,
      event_date: found.event.event_date,
      event_type: found.event.event_type,
      org_id: gate.ctx.org_id,
      contact_id: gate.ctx.contact_id,
      registration_status: 'Registered',
      registration_fee: 0,
      paid: true,
      registration_date: new Date().toISOString().slice(0, 10),
    });

    logEntityAudit({
      entity: 'event_attendance',
      entity_id: row.id,
      entity_label: `${found.event.event_name} — self-register`,
      action: 'create',
      actor: `member:${gate.ctx.email ?? gate.ctx.contact_id}`,
      summary: `Self-registered for ${found.event.event_name}`,
    });

    return NextResponse.json({ success: true, registration: row }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Register failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}
