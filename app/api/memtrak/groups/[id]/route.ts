import { NextRequest, NextResponse } from 'next/server';
import { getGroup, updateGroup, deleteGroup } from '@/lib/member-data';
import { requireReadOnly, requireStaff, safeError } from '@/lib/route-auth';
import { logEntityAudit } from '@/lib/audit';
import { auditContext } from '@/lib/audit-context';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  const result = await getGroup(id);
  if (!result) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  let patch: Record<string, unknown>;
  try { patch = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  try {
    const group = await updateGroup(id, patch);
    logEntityAudit({
      entity: 'group', entity_id: id, entity_label: group.name,
      action: 'update', actor: gate.actor.email,
      summary: `Updated group ${group.name}`,
      ...auditContext(request),
    });
    return NextResponse.json({ success: true, group });
  } catch (err) {
    return safeError(err);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  try {
    await deleteGroup(id);
    logEntityAudit({
      entity: 'group', entity_id: id, entity_label: id,
      action: 'delete', actor: gate.actor.email,
      summary: `Deleted group ${id}`,
      ...auditContext(request),
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return safeError(err);
  }
}
