import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { isAuthEnabled, isPreviewOpen, type AuthRole } from '@/lib/auth.config';
import { logEntityAudit } from '@/lib/audit';

/**
 * PATCH  /api/memtrak/keys/[id]  — revoke / restore / rename / re-scope
 * DELETE /api/memtrak/keys/[id]  — hard-delete
 */

type Ctx = { params: Promise<{ id: string }> };

async function requireAdmin() {
  // Fail closed: when the session gate is "disabled", destructive key ops are
  // allowed ONLY in an explicit non-production preview — production NEVER
  // bypasses (mirrors keys/route.ts and lib/route-auth.requireRole).
  if (!isAuthEnabled()) {
    if (isPreviewOpen()) return { ok: true as const, email: 'preview-demo' };
    return { ok: false as const, status: 401, error: 'Authentication required' };
  }
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
  let auditSummary = '';
  let auditAction: 'update' | 'revoke' = 'update';

  if (body.action === 'revoke') {
    patch.revoked_at = new Date().toISOString();
    auditAction = 'revoke';
    auditSummary = 'Revoked API key';
  } else if (body.action === 'restore') {
    patch.revoked_at = null;
    auditSummary = 'Restored API key';
  }
  if (typeof body.name === 'string' && body.name.trim()) {
    patch.name = body.name.trim();
    auditSummary = auditSummary || `Renamed to "${body.name.trim()}"`;
  }
  if (Array.isArray(body.scopes)) {
    patch.scopes = body.scopes.filter((s): s is string => typeof s === 'string');
    auditSummary = auditSummary || 'Updated scopes';
  }
  if (typeof body.note === 'string') patch.note = body.note;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No supported fields in patch' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('memtrak_api_keys')
    .update(patch)
    .eq('id', id)
    .select('id, name, prefix, scopes, created_by, created_at, last_used_at, revoked_at, note')
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 });

  logEntityAudit({
    entity: 'invite', entity_id: id, entity_label: data.name,
    action: auditAction, actor: gate.email,
    summary: `${auditSummary} (${data.prefix}…)`,
  });

  return NextResponse.json({ success: true, key: data });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: 'Supabase admin client unavailable' }, { status: 503 });

  const { data: before } = await admin.from('memtrak_api_keys').select('name, prefix').eq('id', id).maybeSingle();
  const { error } = await admin.from('memtrak_api_keys').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  logEntityAudit({
    entity: 'invite', entity_id: id, entity_label: before?.name,
    action: 'delete', actor: gate.email,
    summary: `Deleted API key "${before?.name ?? id}"`,
  });

  return new NextResponse(null, { status: 204 });
}
