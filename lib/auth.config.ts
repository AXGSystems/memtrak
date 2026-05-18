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
  '/api/memtrak/pixel',
  '/api/memtrak/logo',
  '/api/memtrak/click',
  '/api/memtrak/unsubscribe',
  '/api/memtrak/confirm',
  '/api/memtrak/mail-return',
  '/_next/',
  '/favicon.ico',
  '/alta-shield.png',
];

/** True when both env vars are set. Wide-open when either is missing. */
export function isAuthEnabled(): boolean {
  return process.env.MEMTRAK_AUTH_ENABLED === 'true'
    && Boolean(process.env.AUTH_SECRET);
}

export const authConfig = {
  pages: {
    signIn: '/login',
    verifyRequest: '/login?sent=1',
    error: '/login?error=1',
  },
  session: { strategy: 'jwt', maxAge: 12 * 60 * 60 },
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
      // First sign-in: persist role + email + contact context onto the token.
      if (user) {
        const u = user as { role?: AuthRole; contact_id?: string; org_id?: string };
        token.role = u.role ?? 'read-only';
        token.email = user.email ?? token.email;
        if (u.contact_id) token.contact_id = u.contact_id;
        if (u.org_id) token.org_id = u.org_id;
      }
      if (trigger === 'update' && session?.role) {
        token.role = session.role;
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
