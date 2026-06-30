import { NextRequest, NextResponse } from 'next/server';
import { listGroups, createGroup, type GroupType } from '@/lib/member-data';
import { requireReadOnly, requireStaff, safeError } from '@/lib/route-auth';
import { logEntityAudit } from '@/lib/audit';
import { auditContext } from '@/lib/audit-context';

const TYPES: GroupType[] = ['Committee', 'Board', 'Task Force', 'Section', 'Working Group', 'Interest Group'];

export async function GET() {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const groups = await listGroups();
  return NextResponse.json({ groups });
}

export async function POST(request: NextRequest) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!body.name || typeof body.name !== 'string') return NextResponse.json({ error: 'name required' }, { status: 400 });
  if (!body.group_type || !TYPES.includes(body.group_type as GroupType)) {
    return NextResponse.json({ error: `group_type must be one of ${TYPES.join(', ')}` }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const group = await createGroup(body as any);
    logEntityAudit({
      entity: 'group', entity_id: group.id, entity_label: group.name,
      action: 'create', actor: gate.actor.email,
      summary: `Created group ${group.name} (${group.group_type})`,
      ...auditContext(request),
    });
    return NextResponse.json({ success: true, group }, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
