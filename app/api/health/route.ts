import { NextResponse } from 'next/server';
import { isAdminSupabaseConfigured } from '@/lib/supabase-admin';
import { isAuthEnabled } from '@/lib/auth.config';

/**
 * GET /api/health
 *
 * Liveness + readiness probe for uptime monitoring, load balancers, and SOC2
 * availability (A1) / incident-response evidence. Intentionally UNAUTHENTICATED
 * and cheap so external monitors can poll it, but it leaks NO secrets — only
 * boolean readiness flags and a coarse status.
 *
 * - 200 { status: 'ok' }       → core dependencies configured
 * - 503 { status: 'degraded' } → a required dependency is unconfigured
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const checks = {
    database: isAdminSupabaseConfigured(),
    auth: isAuthEnabled(),
  };
  const ready = checks.database;
  const body = {
    status: ready ? 'ok' : 'degraded',
    checks,
    uptime: typeof process.uptime === 'function' ? Math.round(process.uptime()) : null,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(body, {
    status: ready ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function HEAD() {
  const ready = isAdminSupabaseConfigured();
  return new NextResponse(null, {
    status: ready ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
