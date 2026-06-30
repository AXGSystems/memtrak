import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { isAuthEnabled, isPreviewOpen, type AuthRole } from '@/lib/auth.config';
import { logEntityAudit } from '@/lib/audit';

/**
 * GET  /api/memtrak/invites           — list (admin only)
 * POST /api/memtrak/invites           — create (admin only)
 *
 * Invite-only auth: rows in this table gate magic-link sign-in. The
 * NextAuth signIn callback reads them. See lib/auth.config.ts.
 */

const ROLES: AuthRole[] = ['admin', 'staff', 'read-only'];

async function requireAdmin() {
  // Fail closed: when the session gate is "disabled", invite management is
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

export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: 'Supabase admin client unavailable' }, { status: 503 });

  const { data, error } = await admin
    .from('memtrak_invites')
    .select('id, email, role, invited_by, invited_at, accepted_at, revoked_at, note')
    .order('invited_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role = typeof body.role === 'string' ? body.role : '';
  const note = typeof body.note === 'string' ? body.note : null;

  if (!email || !email.includes('@')) return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  if (!ROLES.includes(role as AuthRole)) return NextResponse.json({ error: `role must be one of ${ROLES.join(', ')}` }, { status: 400 });

  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: 'Supabase admin client unavailable' }, { status: 503 });

  const { data, error } = await admin
    .from('memtrak_invites')
    .upsert(
      { email, role, note, invited_by: gate.email, revoked_at: null },
      { onConflict: 'email' },
    )
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 });

  logEntityAudit({
    entity: 'invite',
    entity_id: data.id,
    entity_label: email,
    action: 'create',
    actor: gate.email,
    summary: `Invited ${email} as ${role}`,
  });

  return NextResponse.json({ success: true, invite: data }, { status: 201 });
}
