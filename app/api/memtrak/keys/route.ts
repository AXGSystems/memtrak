import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { isAuthEnabled, isPreviewOpen, type AuthRole } from '@/lib/auth.config';
import { generateApiKeySecret, hashApiKey, prefixOf, type ApiKeyRecord } from '@/lib/api-keys';
import { logEntityAudit } from '@/lib/audit';

/**
 * GET  /api/memtrak/keys           — list (admin only)
 * POST /api/memtrak/keys           — create (admin only) — returns the
 *                                    secret EXACTLY ONCE.
 */

async function requireAdmin() {
  // Fail closed: even when the session gate is "disabled", key management
  // requires an explicit non-production preview. Production NEVER bypasses.
  if (!isAuthEnabled()) {
    if (isPreviewOpen()) return { ok: true as const, email: 'preview-demo' };
    return { ok: false as const, status: 401, error: 'Authentication required' };
  }
  const session = await auth();
  const user = session?.user as { email?: string | null; role?: AuthRole } | undefined;
  if (!user) return { ok: false as const, status: 401, error: 'Authentication required' };
  if (user.role !== 'admin') {
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
    .from('memtrak_api_keys')
    .select('id, name, prefix, scopes, created_by, created_at, last_used_at, revoked_at, note')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rows: (data ?? []) as Omit<ApiKeyRecord, 'key_hash'>[] });
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });

  const scopes = Array.isArray(body.scopes)
    ? body.scopes.filter((s): s is string => typeof s === 'string')
    : [];
  // Empty scopes grant NO access (see scopeAllows). Reject at creation so an
  // unscoped — and therefore useless/dangerous-by-mistake — key is never minted.
  if (scopes.length === 0) {
    return NextResponse.json(
      { error: 'At least one scope is required (e.g. "GET:/api/memtrak/members"). Empty scopes grant no access.' },
      { status: 400 },
    );
  }
  const note = typeof body.note === 'string' ? body.note : null;

  const admin = getAdminSupabase();
  if (!admin) return NextResponse.json({ error: 'Supabase admin client unavailable' }, { status: 503 });

  const secret = generateApiKeySecret();
  const prefix = prefixOf(secret);
  const key_hash = await hashApiKey(secret);

  const { data, error } = await admin
    .from('memtrak_api_keys')
    .insert({ name, prefix, key_hash, scopes, note, created_by: gate.email })
    .select('id, name, prefix, scopes, created_by, created_at, note')
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 });

  logEntityAudit({
    entity: 'invite',  // reuse invite category for principals
    entity_id: data.id, entity_label: name,
    action: 'create', actor: gate.email,
    summary: `Created API key "${name}" (${prefix}…)`,
  });

  // Return the secret ONCE. Caller must store it — we never serve it again.
  return NextResponse.json({ success: true, key: data, secret }, { status: 201 });
}
