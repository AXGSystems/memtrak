import { NextRequest, NextResponse } from 'next/server';
import { isAuthEnabled, signSession, newSessionPayload, SESSION_COOKIE, type AuthRole } from '@/lib/auth';

const ROLES: AuthRole[] = ['admin', 'staff', 'read-only'];

export async function POST(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.json({ error: 'Auth not configured on this deploy' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const passphrase = typeof body.passphrase === 'string' ? body.passphrase : '';
  const role = typeof body.role === 'string' ? (body.role as AuthRole) : 'staff';

  if (!ROLES.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  if (passphrase !== process.env.MEMTRAK_AUTH_PASSPHRASE) {
    return NextResponse.json({ error: 'Incorrect passphrase' }, { status: 401 });
  }

  const session = newSessionPayload(role);
  const value = await signSession(session);

  const response = NextResponse.json({ success: true, role });
  response.cookies.set(SESSION_COOKIE.name, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_COOKIE.sessionHours * 60 * 60,
  });
  return response;
}
