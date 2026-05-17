import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { isAuthEnabled, type AuthRole } from '@/lib/auth.config';
import { logEntityAudit } from '@/lib/audit';

/**
 * PATCH  /api/memtrak/invites/[id]   — change role / revoke / restore (admin only)
 * DELETE /api/memtrak/invites/[id]   — hard-delete an invite (admin only)
 *
 * PATCH body:
 *   { role?: AuthRole, action?: 'revoke' | 'restore', note?: string }
 */

type Ctx = { params: Promise<{ id: string }> };

const ROLES: AuthRole[] = ['admin', 'staff', 'read-only'];

async function requireAdmin() {
  if (!isAuthEnabled()) return { ok: true as const, email: 'auth-disabled' };
  const session = await auth();
  const user = session?.user as { email?: string | null; role?: AuthRole } | undefined;
  if (!user || user.role !== 'admin') {
    return { ok: false as const, status: 403, error: 'Admin only' };
  }
  return { ok: true as const, email: user.email ?? 'admin' };
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: 'Supabase admin client unavailable' }, { status: 503 });

  const patch: Record<string, unknown> = {};
  let auditAction: 'update' | 'revoke' = 'update';
  let auditSummary = '';

  if (typeof body.role === 'string') {
    if (!ROLES.includes(body.role as AuthRole)) {
      return NextResponse.json({ error: `role must be one of ${ROLES.join(', ')}` }, { status: 400 });
    }
    patch.role = body.role;
    auditSummary = `Set role to ${body.role}`;
  }
  if (body.action === 'revoke') {
    patch.revoked_at = new Date().toISOString();
    auditAction = 'revoke';
    auditSummary = `Revoked invite`;
  } else if (body.action === 'restore') {
    patch.revoked_at = null;
    auditSummary = `Restored invite`;
  }
  if (typeof body.note === 'string') patch.note = body.note;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No supported fields in patch' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('memtrak_invites')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 });

  logEntityAudit({
    entity: 'invite',
    entity_id: id,
    entity_label: data.email,
    action: auditAction,
    actor: gate.email,
    summary: `${auditSummary} for ${data.email}`,
  });

  return NextResponse.json({ success: true, invite: data });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: 'Supabase admin client unavailable' }, { status: 503 });

  const { data: before } = await admin.from('memtrak_invites').select('email').eq('id', id).maybeSingle();
  const { error } = await admin.from('memtrak_invites').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  logEntityAudit({
    entity: 'invite',
    entity_id: id,
    entity_label: before?.email,
    action: 'delete',
    actor: gate.email,
    summary: `Deleted invite for ${before?.email ?? id}`,
  });

  return new NextResponse(null, { status: 204 });
}
