import { NextRequest, NextResponse } from 'next/server';
import { addGroupMember, type GroupRole } from '@/lib/member-data';
import { requireStaff, safeError } from '@/lib/route-auth';
import { logEntityAudit } from '@/lib/audit';
import { auditContext } from '@/lib/audit-context';

type Ctx = { params: Promise<{ id: string }> };

const ROLES: GroupRole[] = ['Chair', 'Vice Chair', 'Secretary', 'Member', 'Liaison', 'Observer'];

export async function POST(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!body.contact_id || typeof body.contact_id !== 'string') {
    return NextResponse.json({ error: 'contact_id required' }, { status: 400 });
  }
  const role = typeof body.role === 'string' ? body.role : 'Member';
  if (!ROLES.includes(role as GroupRole)) {
    return NextResponse.json({ error: `role must be one of ${ROLES.join(', ')}` }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const member = await addGroupMember({ ...(body as any), group_id: id, role: role as GroupRole });
    logEntityAudit({
      entity: 'group_member', entity_id: id, entity_label: String(body.contact_id),
      action: 'create', actor: gate.actor.email,
      summary: `Added contact ${body.contact_id} to group ${id} as ${role}`,
      ...auditContext(request),
    });
    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
