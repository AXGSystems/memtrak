import { auth } from '@/auth';
import { isAuthEnabled, type AuthRole } from '@/lib/auth.config';

/**
 * Resolve the portal context (contact_id + org_id) for the current request.
 *
 *  • When auth is on AND the user is a 'member': use their session-bound
 *    contact_id / org_id.
 *  • When auth is on AND the user is staff: caller must supply an explicit
 *    contact_id (e.g. via query param) — we return { staff: true } for the
 *    caller to handle, but for portal-scoped endpoints we 403.
 *  • When auth is off (preview deploys): fall back to a known demo contact
 *    so the portal still works for demos.
 */

export interface PortalContext {
  contact_id: string;
  org_id: string;
  email: string | null;
  role: AuthRole | 'demo';
}

const DEMO_CONTEXT: PortalContext = {
  contact_id: 'c-004-1',
  org_id: 'demo-acu-004',
  email: 'demo@portal.local',
  role: 'demo',
};

export async function getPortalContext(): Promise<
  | { ok: true; ctx: PortalContext }
  | { ok: false; status: number; error: string }
> {
  if (!isAuthEnabled()) {
    return { ok: true, ctx: DEMO_CONTEXT };
  }

  const session = await auth();
  const user = session?.user as
    | { email?: string | null; role?: AuthRole; contact_id?: string; org_id?: string }
    | undefined;

  if (!user) return { ok: false, status: 401, error: 'Authentication required' };

  if (user.role === 'member') {
    if (!user.contact_id || !user.org_id) {
      return { ok: false, status: 403, error: 'Member session missing contact context' };
    }
    return {
      ok: true,
      ctx: { contact_id: user.contact_id, org_id: user.org_id, email: user.email ?? null, role: 'member' },
    };
  }

  // Staff aren't members; portal endpoints reject by default. Staff who
  // want to inspect a member's portal can call /api/memtrak/* directly.
  return { ok: false, status: 403, error: 'Portal is for members. Staff: use the admin views.' };
}
