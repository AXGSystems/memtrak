import { NextRequest, NextResponse } from 'next/server';
import {
  getOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/lib/member-data';
import { logEntityAudit, diffRecords } from '@/lib/audit';
import { requireReadOnly, requireStaff, requireAdminRole, safeError } from '@/lib/route-auth';
import { auditContext } from '@/lib/audit-context';

/**
 * MEMTrak Members API — single organization
 *
 * GET    /api/memtrak/members/[id]   → org or 404
 * PUT    /api/memtrak/members/[id]   → updated org (Supabase required)
 * DELETE /api/memtrak/members/[id]   → 204 (Supabase required)
 */

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  const org = await getOrganization(id);
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(org);
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

  try {
    const before = await getOrganization(id);
    const org = await updateOrganization(id, patch);
    logEntityAudit({
      entity: 'organization', entity_id: org.id, entity_label: org.org_name,
      action: 'update', actor: gate.actor.email,
      summary: `Updated ${org.org_name}`,
      diff: diffRecords(before as unknown as Record<string, unknown>, org as unknown as Record<string, unknown>),
      ...auditContext(request),
    });
    return NextResponse.json({ success: true, org });
  } catch (err) {
    return safeError(err);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const gate = await requireAdminRole();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  try {
    const before = await getOrganization(id);
    await deleteOrganization(id);
    logEntityAudit({
      entity: 'organization', entity_id: id, entity_label: before?.org_name,
      action: 'delete', actor: gate.actor.email,
      summary: `Deleted ${before?.org_name ?? id}`,
      ...auditContext(request),
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return safeError(err);
  }
}
