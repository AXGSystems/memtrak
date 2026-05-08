import { NextRequest, NextResponse } from 'next/server';
import { isAuthEnabled, verifySession, SESSION_COOKIE } from '@/lib/auth';

/**
 * GET /api/auth/me
 *
 * Returns the current session role, or { enabled: false } when auth is off.
 * Used by the topbar to render a logout button when relevant.
 */
export async function GET(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ enabled: false });
  }
  const cookie = request.cookies.get(SESSION_COOKIE.name)?.value;
  const session = await verifySession(cookie);
  return NextResponse.json({ enabled: true, role: session?.role ?? null });
}
