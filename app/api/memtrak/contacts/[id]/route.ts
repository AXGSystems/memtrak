import { NextRequest, NextResponse } from 'next/server';
import { getContact, updateContact, deleteContact } from '@/lib/member-data';
import { requireReadOnly, requireStaff, safeError } from '@/lib/route-auth';
import { logEntityAudit } from '@/lib/audit';
import { auditContext } from '@/lib/audit-context';

/**
 * GET    /api/memtrak/contacts/[id]
 * PUT    /api/memtrak/contacts/[id]
 * DELETE /api/memtrak/contacts/[id]
 */

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  const contact = await getContact(id);
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  let patch: Record<string, unknown>;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof patch.email === 'string' && patch.email && !patch.email.includes('@')) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }

  try {
    const contact = await updateContact(id, patch);
    const label = `${contact.first_name} ${contact.last_name}`.trim() || contact.email || id;
    logEntityAudit({
      entity: 'contact', entity_id: id, entity_label: label,
      action: 'update', actor: gate.actor.email,
      summary: `Updated contact ${label}`,
      ...auditContext(request),
    });
    return NextResponse.json({ success: true, contact });
  } catch (err) {
    return safeError(err);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  try {
    await deleteContact(id);
    logEntityAudit({
      entity: 'contact', entity_id: id, entity_label: id,
      action: 'delete', actor: gate.actor.email,
      summary: `Deleted contact ${id}`,
      ...auditContext(request),
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return safeError(err);
  }
}
