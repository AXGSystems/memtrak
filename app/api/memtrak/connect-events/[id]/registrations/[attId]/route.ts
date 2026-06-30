import { NextRequest, NextResponse } from 'next/server';
import {
  getAttendance,
  updateAttendance,
  deleteAttendance,
  getOrganization,
  type EventAttendance,
  type RegistrationStatus,
} from '@/lib/member-data';
import { logEntityAudit, diffRecords } from '@/lib/audit';
import { requireStaff, requireAdminRole, safeError } from '@/lib/route-auth';
import { auditContext } from '@/lib/audit-context';

/**
 * PATCH  /api/memtrak/connect-events/[id]/registrations/[attId]
 * DELETE /api/memtrak/connect-events/[id]/registrations/[attId]
 *
 * PATCH body either:
 *   - free-form patch: { registration_status?, paid?, check_in_time?, registration_fee?, contact_id? }
 *   - action shortcut: { action: 'check_in' | 'mark_paid' | 'cancel' }
 */

type Ctx = { params: Promise<{ id: string; attId: string }> };

const STATUSES = new Set<RegistrationStatus>(['Registered', 'Attended', 'No Show', 'Cancelled']);
type Action = 'check_in' | 'mark_paid' | 'cancel';
const ACTIONS = new Set<Action>(['check_in', 'mark_paid', 'cancel']);

function actorLabel(row: EventAttendance, orgName?: string): string {
  return `${row.event_name} — ${orgName ?? row.org_id}`;
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { attId } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const before = await getAttendance(attId);
  if (!before) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });

  let patch: Partial<EventAttendance>;
  let auditAction: 'update' | 'mark_paid' = 'update';
  let auditSummary: string;
  const orgName = (await getOrganization(before.org_id))?.org_name;

  const action = typeof body.action === 'string' ? (body.action as Action) : undefined;
  if (action) {
    if (!ACTIONS.has(action)) {
      return NextResponse.json({ error: `action must be one of ${[...ACTIONS].join(', ')}` }, { status: 400 });
    }
    if (action === 'check_in') {
      patch = { registration_status: 'Attended', check_in_time: new Date().toISOString() };
      auditSummary = `Checked in ${orgName ?? before.org_id} at ${before.event_name}`;
    } else if (action === 'mark_paid') {
      patch = { paid: true };
      auditAction = 'mark_paid';
      auditSummary = `Marked ${orgName ?? before.org_id} paid for ${before.event_name} ($${before.registration_fee.toLocaleString()})`;
    } else {
      patch = { registration_status: 'Cancelled' };
      auditSummary = `Cancelled ${orgName ?? before.org_id}'s registration for ${before.event_name}`;
    }
  } else {
    patch = {};
    if (typeof body.registration_status === 'string') {
      if (!STATUSES.has(body.registration_status as RegistrationStatus)) {
        return NextResponse.json({ error: 'invalid registration_status' }, { status: 400 });
      }
      patch.registration_status = body.registration_status as RegistrationStatus;
    }
    if (typeof body.paid === 'boolean') patch.paid = body.paid;
    if (typeof body.check_in_time === 'string' || body.check_in_time === null) {
      patch.check_in_time = body.check_in_time as string | null;
    }
    if (typeof body.registration_fee === 'number' && Number.isFinite(body.registration_fee) && body.registration_fee >= 0) {
      patch.registration_fee = body.registration_fee;
    }
    if (typeof body.contact_id === 'string' || body.contact_id === null) {
      patch.contact_id = body.contact_id as string | null;
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No supported fields in patch' }, { status: 400 });
    }
    auditSummary = `Updated registration for ${orgName ?? before.org_id} at ${before.event_name}`;
  }

  try {
    const row = await updateAttendance(attId, patch);
    logEntityAudit({
      entity: 'event_attendance',
      entity_id: row.id,
      entity_label: actorLabel(row, orgName),
      action: auditAction,
      actor: gate.actor.email,
      summary: auditSummary,
      diff: diffRecords(before as unknown as Record<string, unknown>, row as unknown as Record<string, unknown>),
      ...auditContext(request),
    });
    return NextResponse.json({ success: true, registration: row });
  } catch (err) {
    return safeError(err);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const gate = await requireAdminRole();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { attId } = await ctx.params;
  const before = await getAttendance(attId);
  if (!before) return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  const orgName = (await getOrganization(before.org_id))?.org_name;

  try {
    await deleteAttendance(attId);
    logEntityAudit({
      entity: 'event_attendance',
      entity_id: attId,
      entity_label: actorLabel(before, orgName),
      action: 'delete',
      actor: gate.actor.email,
      summary: `Removed ${orgName ?? before.org_id}'s registration for ${before.event_name}`,
      ...auditContext(request),
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return safeError(err);
  }
}
