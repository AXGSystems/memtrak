import { NextRequest, NextResponse } from 'next/server';
import { removeGroupMember } from '@/lib/member-data';
import { requireStaff, safeError } from '@/lib/route-auth';
import { logEntityAudit } from '@/lib/audit';
import { auditContext } from '@/lib/audit-context';

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  try {
    await removeGroupMember(id);
    logEntityAudit({
      entity: 'group_member', entity_id: id, entity_label: id,
      action: 'delete', actor: gate.actor.email,
      summary: `Removed group member ${id}`,
      ...auditContext(request),
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return safeError(err);
  }
}
