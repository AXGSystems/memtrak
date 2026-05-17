import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe NextAuth config. Imported by both `middleware.ts` (edge runtime)
 * and `auth.ts` (full config). Must not import the Supabase adapter or any
 * Node-only modules.
 *
 * Behavior knobs are all callback-based — providers + adapter live in
 * `auth.ts` so they don't ship to the edge.
 */

export type AuthRole = 'admin' | 'staff' | 'read-only';

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
      return Boolean(auth?.user);
    },
    jwt({ token, user, trigger, session }) {
      // First sign-in: persist role + email onto the token.
      if (user) {
        token.role = (user as { role?: AuthRole }).role ?? 'read-only';
        token.email = user.email ?? token.email;
      }
      if (trigger === 'update' && session?.role) {
        token.role = session.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: AuthRole }).role =
          (token.role as AuthRole | undefined) ?? 'read-only';
      }
      return session;
    },
  },
  // Providers live in auth.ts to keep the Supabase adapter + Node deps off the edge.
  providers: [],
} satisfies NextAuthConfig;

const ROLE_RANK: Record<AuthRole, number> = { admin: 3, staff: 2, 'read-only': 1 };

export function hasRole(role: AuthRole | null | undefined, required: AuthRole): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[required];
}
