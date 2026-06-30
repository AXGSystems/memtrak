import { NextRequest, NextResponse } from 'next/server';
import { listContacts, createContact } from '@/lib/member-data';
import { requireReadOnly, requireStaff, safeError } from '@/lib/route-auth';
import { logEntityAudit } from '@/lib/audit';
import { auditContext } from '@/lib/audit-context';

/**
 * GET  /api/memtrak/orgs/[id]/contacts → array of contacts for the org
 * POST /api/memtrak/orgs/[id]/contacts → creates a contact (Supabase required)
 */

type Ctx = { params: Promise<{ id: string }> };

const ROLES = new Set(['Primary', 'Billing', 'Operations', 'Marketing', 'Technical', 'Other']);

export async function GET(_req: NextRequest, ctx: Ctx) {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  const rows = await listContacts(id);
  return NextResponse.json({ rows });
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const first_name = typeof body.first_name === 'string' ? body.first_name.trim() : '';
  const last_name = typeof body.last_name === 'string' ? body.last_name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const role = typeof body.role === 'string' ? body.role.trim() : '';

  if (!first_name) return NextResponse.json({ error: 'first_name required' }, { status: 400 });
  if (!last_name) return NextResponse.json({ error: 'last_name required' }, { status: 400 });
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  if (!ROLES.has(role)) {
    return NextResponse.json({ error: `role must be one of ${[...ROLES].join(', ')}` }, { status: 400 });
  }

  try {
    const contact = await createContact({
      ...body,
      org_id: id,
      first_name,
      last_name,
      email,
      role,
      is_primary: Boolean(body.is_primary),
      total_opens: 0,
      total_clicks: 0,
    });
    logEntityAudit({
      entity: 'contact', entity_id: contact.id,
      entity_label: `${first_name} ${last_name}`.trim() || email,
      action: 'create', actor: gate.actor.email,
      summary: `Added contact ${first_name} ${last_name} to org ${id}`,
      ...auditContext(request),
    });
    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
