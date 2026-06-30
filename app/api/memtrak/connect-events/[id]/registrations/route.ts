import { NextRequest, NextResponse } from 'next/server';
import {
  getEvent,
  getOrganization,
  recordAttendance,
  type EventType,
  type RegistrationStatus,
} from '@/lib/member-data';
import { logEntityAudit } from '@/lib/audit';
import { requireStaff, safeError } from '@/lib/route-auth';
import { auditContext } from '@/lib/audit-context';

/**
 * POST /api/memtrak/connect-events/[id]/registrations
 *
 * Registers an organization (and optionally a contact) for the event with
 * id = alta_connect_event_id (URL-encoded). Bootstraps event metadata when
 * this is the first registration on a new event id; otherwise event_name /
 * event_date / event_type are inherited from existing rows and any values
 * sent in the body are ignored.
 *
 * Body: { org_id, contact_id?, registration_status?, registration_fee?,
 *         paid?, registration_date?, event_name?, event_date?, event_type? }
 */

type Ctx = { params: Promise<{ id: string }> };

const EVENT_TYPES = new Set<EventType>([
  'Conference', 'Webinar', 'Workshop', 'Committee Meeting',
  'Board Meeting', 'Social', 'Training',
]);
const STATUSES = new Set<RegistrationStatus>(['Registered', 'Attended', 'No Show', 'Cancelled']);

const todayIso = () => new Date().toISOString().slice(0, 10);

export async function POST(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id: rawId } = await ctx.params;
  const altaConnectEventId = decodeURIComponent(rawId);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const org_id = typeof body.org_id === 'string' ? body.org_id.trim() : '';
  if (!org_id) return NextResponse.json({ error: 'org_id required' }, { status: 400 });

  const org = await getOrganization(org_id);
  if (!org) return NextResponse.json({ error: `Organization ${org_id} not found` }, { status: 404 });

  const status: RegistrationStatus =
    typeof body.registration_status === 'string' && STATUSES.has(body.registration_status as RegistrationStatus)
      ? (body.registration_status as RegistrationStatus)
      : 'Registered';

  const fee =
    typeof body.registration_fee === 'number' && Number.isFinite(body.registration_fee) && body.registration_fee >= 0
      ? body.registration_fee
      : 0;

  const existing = await getEvent(altaConnectEventId);
  let event_name: string;
  let event_date: string;
  let event_type: EventType;

  if (existing) {
    event_name = existing.event.event_name;
    event_date = existing.event.event_date;
    event_type = existing.event.event_type;
  } else {
    event_name = typeof body.event_name === 'string' ? body.event_name.trim() : '';
    event_date = typeof body.event_date === 'string' ? body.event_date.trim() : '';
    const t = typeof body.event_type === 'string' ? body.event_type : '';
    if (!event_name) return NextResponse.json({ error: 'event_name required for new event' }, { status: 400 });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(event_date)) {
      return NextResponse.json({ error: 'event_date must be YYYY-MM-DD' }, { status: 400 });
    }
    if (!EVENT_TYPES.has(t as EventType)) {
      return NextResponse.json({ error: `event_type must be one of ${[...EVENT_TYPES].join(', ')}` }, { status: 400 });
    }
    event_type = t as EventType;
  }

  try {
    const row = await recordAttendance({
      alta_connect_event_id: altaConnectEventId,
      event_name,
      event_date,
      event_type,
      org_id,
      contact_id: typeof body.contact_id === 'string' && body.contact_id ? body.contact_id : null,
      registration_status: status,
      registration_fee: fee,
      paid: Boolean(body.paid),
      registration_date: typeof body.registration_date === 'string' ? body.registration_date : todayIso(),
      check_in_time: status === 'Attended'
        ? (typeof body.check_in_time === 'string' ? body.check_in_time : new Date().toISOString())
        : null,
    });

    logEntityAudit({
      entity: 'event_attendance',
      entity_id: row.id,
      entity_label: `${event_name} — ${org.org_name}`,
      action: 'create',
      actor: gate.actor.email,
      summary: `Registered ${org.org_name} for ${event_name}${fee > 0 ? ` ($${fee.toLocaleString()}${body.paid ? ', paid' : ', unpaid'})` : ''}`,
      ...auditContext(request),
    });

    return NextResponse.json({ success: true, registration: row, bootstrapped: !existing }, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
