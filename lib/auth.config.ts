import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe NextAuth config. Imported by both `middleware.ts` (edge runtime)
 * and `auth.ts` (full config). Must not import the Supabase adapter or any
 * Node-only modules.
 *
 * Behavior knobs are all callback-based — providers + adapter live in
 * `auth.ts` so they don't ship to the edge.
 */

export type AuthRole = 'admin' | 'staff' | 'read-only' | 'member';

/** True for any staff-side role. Members are excluded. */
export function isStaffRole(role: AuthRole | null | undefined): boolean {
  return role === 'admin' || role === 'staff' || role === 'read-only';
}

/** Paths that must remain reachable even when auth is enabled. */
export const AUTH_BYPASS_PREFIXES = [
  '/login',
  '/api/auth/',
  '/api/health',
  '/api/memtrak/pixel',
  '/api/memtrak/logo',
  '/api/memtrak/click',
  '/api/memtrak/unsubscribe',
  '/api/memtrak/confirm',
  '/api/memtrak/mail-return',
  // Scheduled audit-chain integrity check. Reachable so Vercel Cron can call
  // it; the route itself fails closed — it requires a matching CRON_SECRET
  // bearer token or an authenticated admin session (see the route handler).
  '/api/memtrak/audit/verify',
  '/_next/',
  '/favicon.ico',
  '/alta-shield.png',
];

/**
 * Whether the NextAuth session gate is active. FAILS CLOSED.
 *
 * Production (NODE_ENV==='production'): auth is ALWAYS on. The only way to
 * disable it is an explicit, non-production preview opt-in — there is no
 * production kill-switch. If AUTH_SECRET is somehow missing in production we
 * still report enabled so the gate denies (NextAuth will reject without a
 * secret) rather than silently serving everything wide open.
 *
 * Non-production: auth is on by default; a preview/demo deploy may opt OUT
 * with MEMTRAK_PREVIEW_OPEN==='true' (used only for throwaway demos), and a
 * real secret is required to actually run the session machinery.
 */
export function isAuthEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  // Non-production: explicit demo opt-out only.
  if (process.env.MEMTRAK_PREVIEW_OPEN === 'true') return false;
  // Default closed; require a secret to run the JWT machinery in dev.
  return Boolean(process.env.AUTH_SECRET) || process.env.MEMTRAK_AUTH_ENABLED === 'true';
}

/**
 * True ONLY in an explicit non-production demo/preview deploy. Used to decide
 * whether demo fallbacks (e.g. the portal demo context) are permissible.
 * Always false in production — production never serves demo data.
 */
export function isPreviewOpen(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.MEMTRAK_PREVIEW_OPEN === 'true';
}

export const authConfig = {
  pages: {
    signIn: '/login',
    verifyRequest: '/login?sent=1',
    error: '/login?error=1',
  },
  // Session lifetime (SOC2 CC6.1 / ISO A.8.5): a 30-minute IDLE timeout plus a
  // 12-hour ABSOLUTE cap. With the JWT strategy `maxAge` is the rolling idle
  // window — each request (throttled by `updateAge`) re-issues the token with a
  // fresh 30-min expiry, so an idle browser is logged out after 30 min of
  // inactivity. The absolute cap is enforced independently in the jwt callback
  // via `absExp`, so a continuously-active session still ends after 12h.
  session: { strategy: 'jwt', maxAge: 30 * 60, updateAge: 5 * 60 },
  callbacks: {
    authorized({ auth, request }) {
      if (!isAuthEnabled()) return true;
      const pathname = request.nextUrl.pathname;
      const bypass = AUTH_BYPASS_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(p),
      );
      if (bypass) return true;
      if (!auth?.user) return false;

      // Members can only see /portal/*. Staff can see everything else
      // (including /portal/*, useful for impersonation / preview).
      const role = (auth.user as { role?: AuthRole }).role;
      const isPortalPath = pathname === '/portal' || pathname.startsWith('/portal/') ||
                           pathname.startsWith('/api/portal/');
      if (role === 'member' && !isPortalPath) return false;
      return true;
    },
    jwt({ token, user, trigger, session }) {
      // First sign-in: persist role + email + contact context onto the token,
      // and stamp the ABSOLUTE expiry (12h from sign-in). The rolling 30-min
      // idle window is enforced by session.maxAge; this cap is the ceiling that
      // a continuously-active session cannot extend past.
      if (user) {
        const u = user as { role?: AuthRole; contact_id?: string; org_id?: string };
        token.role = u.role ?? 'read-only';
        token.email = user.email ?? token.email;
        if (u.contact_id) token.contact_id = u.contact_id;
        if (u.org_id) token.org_id = u.org_id;
        token.absExp = Math.floor(Date.now() / 1000) + 12 * 60 * 60;
      }
      if (trigger === 'update' && session?.role) {
        token.role = session.role;
      }
      // Absolute-cap enforcement: once the ceiling is passed, invalidate the
      // session (NextAuth treats a null jwt return as no session).
      const absExp = token.absExp as number | undefined;
      if (typeof absExp === 'number' && Math.floor(Date.now() / 1000) >= absExp) {
        return null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        const u = session.user as { role?: AuthRole; contact_id?: string; org_id?: string };
        u.role = (token.role as AuthRole | undefined) ?? 'read-only';
        if (token.contact_id) u.contact_id = token.contact_id as string;
        if (token.org_id) u.org_id = token.org_id as string;
      }
      return session;
    },
  },
  // Providers live in auth.ts to keep the Supabase adapter + Node deps off the edge.
  providers: [],
} satisfies NextAuthConfig;

const ROLE_RANK: Record<AuthRole, number> = { admin: 3, staff: 2, 'read-only': 1, member: 0 };

export function hasRole(role: AuthRole | null | undefined, required: AuthRole): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[required];
}
