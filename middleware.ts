import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authConfig, isAuthEnabled, AUTH_BYPASS_PREFIXES } from '@/lib/auth.config';
import { extractBearer, hashApiKey, scopeAllows } from '@/lib/api-keys';

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

// ── API key cache (per-edge-instance, 60s) ──────────────────────────
interface CachedKey { id: string; scopes: string[]; expiresAt: number }
const apiKeyCache = new Map<string, CachedKey | null>(); // null = negative cache

async function lookupApiKey(hash: string): Promise<CachedKey | null> {
  const cached = apiKeyCache.get(hash);
  if (cached !== undefined && cached !== null && cached.expiresAt > Date.now()) return cached;
  if (cached === null) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  try {
    const res = await fetch(
      `${url}/rest/v1/memtrak_api_keys?key_hash=eq.${encodeURIComponent(hash)}&revoked_at=is.null&select=id,scopes`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) {
      apiKeyCache.set(hash, null);
      return null;
    }
    const rows = (await res.json()) as Array<{ id: string; scopes: string[] }>;
    if (!rows.length) {
      apiKeyCache.set(hash, null);
      return null;
    }
    const entry: CachedKey = { id: rows[0].id, scopes: rows[0].scopes ?? [], expiresAt: Date.now() + 60_000 };
    apiKeyCache.set(hash, entry);
    return entry;
  } catch {
    return null;
  }
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

// ── Global basic-auth gate (AXG Lockdown) ────────────────────────────
// Hard gate in front of everything. Paths in BASIC_AUTH_BYPASS are reachable
// without basic auth — required for email tracking pixels and bearer-token
// API endpoints (which carry their own auth).
const BASIC_AUTH_BYPASS_EXACT = new Set<string>([
  '/api/memtrak/pixel',
  '/api/memtrak/logo',
]);

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function checkBasicAuth(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  if (BASIC_AUTH_BYPASS_EXACT.has(pathname)) return null;
  // Bearer-token API access (programmatic) self-authenticates — skip basic auth.
  if (pathname.startsWith('/api/memtrak/') && extractBearer(request.headers)) return null;

  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPass = process.env.BASIC_AUTH_PASS;
  if (!expectedUser || !expectedPass) {
    return new NextResponse('Server misconfigured: auth env vars missing', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  const header = request.headers.get('authorization');
  if (header && header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      const idx = decoded.indexOf(':');
      if (idx > 0) {
        const user = decoded.slice(0, idx);
        const pass = decoded.slice(idx + 1);
        if (timingSafeEqual(user, expectedUser) && timingSafeEqual(pass, expectedPass)) {
          return null;
        }
      }
    } catch {
      /* fall through */
    }
  }
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="AXG Lockdown", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

// ── The middleware itself ────────────────────────────────────────────
// `auth()` wraps the handler so `req.auth` carries the session when enabled.
export default auth(async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Global AXG basic-auth gate (front of everything else)
  const basicAuthFail = checkBasicAuth(request as unknown as NextRequest);
  if (basicAuthFail) return basicAuthFail;

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

    // Bearer-token auth: alt to session for /api/memtrak/* programmatic access.
    let bearerOk = false;
    if (!bypass && pathname.startsWith('/api/memtrak/')) {
      const token = extractBearer(request.headers);
      if (token) {
        const hash = await hashApiKey(token);
        const key = await lookupApiKey(hash);
        if (key && scopeAllows(key.scopes, request.method, pathname)) bearerOk = true;
      }
    }

    if (!bypass && !bearerOk && !request.auth) {
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
