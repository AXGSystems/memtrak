import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authConfig, isAuthEnabled, AUTH_BYPASS_PREFIXES } from '@/lib/auth.config';

/**
 * MEMTrak edge middleware:
 *  • Rate limiting on API routes (per-IP, 100/min)
 *  • Security headers on all responses
 *  • NextAuth gate (off by default — see lib/auth.config.ts.isAuthEnabled)
 *
 * NextAuth's adapter and Resend provider live in /auth.ts, which is NOT
 * imported here — only the edge-safe config in lib/auth.config.ts is.
 */

const { auth } = NextAuth(authConfig);

// ── Rate limiter (in-memory, per-IP) ────────────────────────────────
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimits) {
      if (now > entry.resetAt) rateLimits.delete(ip);
    }
  }, 300_000);
}

// ── Security headers ─────────────────────────────────────────────────
function applySecurityHeaders(response: NextResponse, pathname: string) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co;",
  );

  // Tracking pixel/logo: allow embedding in emails (no X-Frame-Options).
  if (pathname.includes('/api/memtrak/pixel') || pathname.includes('/api/memtrak/logo')) {
    response.headers.delete('X-Frame-Options');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
}

// ── The middleware itself ────────────────────────────────────────────
// `auth()` wraps the handler so `req.auth` carries the session when enabled.
export default auth(async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Rate limit API routes
  if (pathname.startsWith('/api/')) {
    if (!checkRateLimit(ip)) {
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Max 100 requests/minute.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }
  }

  // Auth gate. Only active when MEMTRAK_AUTH_ENABLED=true and AUTH_SECRET set.
  if (isAuthEnabled()) {
    const bypass = AUTH_BYPASS_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
    if (!bypass && !request.auth) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  applySecurityHeaders(response, pathname);
  return response;
}) as unknown as (request: NextRequest) => Promise<NextResponse>;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|alta-shield.png).*)',
  ],
};
