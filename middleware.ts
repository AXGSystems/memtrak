import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthEnabled, verifySession, SESSION_COOKIE } from '@/lib/auth';

/**
 * MEMTrak Security Middleware
 * - Security headers on all responses
 * - Basic rate limiting on API routes (in-memory, per-IP)
 * - Input sanitization on tracking endpoints
 * - Optional passphrase auth gate (off by default — see lib/auth.ts)
 */

// Paths that must remain reachable even when auth is enabled.
const AUTH_BYPASS_PREFIXES = [
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

function shouldBypassAuth(pathname: string): boolean {
  return AUTH_BYPASS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

// Simple in-memory rate limiter (per IP, resets every minute)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100; // requests per minute per IP
const RATE_WINDOW = 60_000; // 1 minute

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

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimits) {
      if (now > entry.resetAt) rateLimits.delete(ip);
    }
  }, 300_000);
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const pathname = request.nextUrl.pathname;

  // Rate limit API routes
  if (pathname.startsWith('/api/')) {
    if (!checkRateLimit(ip)) {
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Max 100 requests/minute.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }
  }

  // Optional auth gate. Activates only when MEMTRAK_AUTH_ENABLED=true and a
  // passphrase is set — otherwise falls through completely.
  if (isAuthEnabled() && !shouldBypassAuth(pathname)) {
    const cookie = request.cookies.get(SESSION_COOKIE.name)?.value;
    const session = await verifySession(cookie);
    if (!session) {
      // API routes get 401; page routes redirect to /login.
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
    // Surface the role to downstream handlers.
    response.headers.set('x-memtrak-role', session.role);
  }

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co wss://*.supabase.co;");

  // Tracking pixel/logo: allow embedding in emails (no X-Frame-Options)
  if (request.nextUrl.pathname.includes('/api/memtrak/pixel') ||
      request.nextUrl.pathname.includes('/api/memtrak/logo')) {
    response.headers.delete('X-Frame-Options');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico|alta-shield.png).*)',
  ],
};
