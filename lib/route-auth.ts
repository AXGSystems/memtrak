/**
 * Server-side, in-handler authorization helpers (defense in depth).
 *
 * Edge middleware already gates requests when the session is enabled, but
 * route handlers must NOT trust that alone — they re-assert identity and role
 * here so a misconfigured matcher, a future bypass, or a non-session caller
 * can't reach a mutating data path unauthenticated.
 *
 * FAIL CLOSED: when the session gate is "disabled", access is granted ONLY in
 * an explicit non-production preview deploy. Production always requires a real
 * session of sufficient role.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAuthEnabled, isPreviewOpen, hasRole, type AuthRole } from '@/lib/auth.config';

export interface AuthedActor {
  email: string;
  role: AuthRole;
}

export type GateResult =
  | { ok: true; actor: AuthedActor }
  | { ok: false; status: number; error: string };

/**
 * Require an authenticated session with at least `required` role.
 *  • 'read-only'  → any staff-side viewer (GET endpoints)
 *  • 'staff'      → can mutate member data (POST/PUT/PATCH/DELETE)
 *  • 'admin'      → key/invite management, destructive ops
 */
export async function requireRole(required: AuthRole): Promise<GateResult> {
  if (!isAuthEnabled()) {
    if (isPreviewOpen()) {
      return { ok: true, actor: { email: 'preview-demo', role: 'admin' } };
    }
    return { ok: false, status: 401, error: 'Authentication required' };
  }
  const session = await auth();
  const user = session?.user as { email?: string | null; role?: AuthRole } | undefined;
  if (!user) return { ok: false, status: 401, error: 'Authentication required' };
  const role = user.role ?? 'read-only';
  if (!hasRole(role, required)) {
    return { ok: false, status: 403, error: `Requires ${required} role` };
  }
  return { ok: true, actor: { email: user.email ?? role, role } };
}

/** Read access — any staff-side role. */
export function requireReadOnly(): Promise<GateResult> {
  return requireRole('read-only');
}

/** Write access — staff or above (rejects read-only on mutations). */
export function requireStaff(): Promise<GateResult> {
  return requireRole('staff');
}

/** Admin-only — key/invite management and destructive operations. */
export function requireAdminRole(): Promise<GateResult> {
  return requireRole('admin');
}

/** Convenience: turn a failed gate into a JSON error response. */
export function gateError(gate: Extract<GateResult, { ok: false }>): NextResponse {
  return NextResponse.json({ error: gate.error }, { status: gate.status });
}

/**
 * Map a caught error to a SAFE client response (ASVS V7.4.1 — generic error
 * messages). The full error is logged server-side; the client only ever sees:
 *   • 503 "Service unavailable — not configured"  when Supabase env is absent
 *     (an operational signal the UI surfaces, leaks no internals), or
 *   • 404 "Not found"  when the data layer reports the record is missing, or
 *   • 500 "Internal error"  for everything else (no raw DB/SQL/stack text).
 *
 * Never returns err.message to the client, so implementation, schema, and
 * Supabase/PostgREST detail can't leak through the JSON body.
 */
export function safeError(err: unknown, fallbackStatus = 500): NextResponse {
  const raw = err instanceof Error ? err.message : String(err);
  // Server-side log keeps the real detail for operators/audit.
  console.error('[memtrak] route error:', err);

  if (raw.includes('Supabase not configured')) {
    return NextResponse.json(
      { error: 'Service unavailable — backend not configured' },
      { status: 503 },
    );
  }
  if (/not found/i.test(raw)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ error: 'Internal error' }, { status: fallbackStatus });
}
