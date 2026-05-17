import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAuthEnabled, type AuthRole } from '@/lib/auth.config';

/**
 * GET /api/auth/me
 *
 * Returns the current session, or { enabled: false } when auth is off.
 * Used by the topbar to render a logout button when relevant.
 */
export async function GET() {
  if (!isAuthEnabled()) {
    return NextResponse.json({ enabled: false });
  }
  const session = await auth();
  const user = session?.user as { email?: string | null; role?: AuthRole } | undefined;
  return NextResponse.json({
    enabled: true,
    email: user?.email ?? null,
    role: user?.role ?? null,
  });
}
