import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * MEMTrak Security Middleware
 * - Security headers on all responses
 * - Basic rate limiting on API routes (in-memory, per-IP)
 * - Input sanitization on tracking endpoints
 */

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

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!checkRateLimit(ip)) {
      return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded. Max 100 requests/minute.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }
  }

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

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
