import { NextResponse } from 'next/server';
import { handlers } from '@/auth';
import { isAuthEnabled } from '@/lib/auth.config';

/**
 * NextAuth route handler. Wrapped so deploys without AUTH_SECRET (i.e.
 * the gate is off) return a clean 503 instead of NextAuth's generic
 * "server configuration" 500.
 */

async function notConfigured(): Promise<Response> {
  return NextResponse.json({ enabled: false, error: 'Auth not configured on this deploy' }, { status: 503 });
}

export const GET: typeof handlers.GET = async (req) => {
  if (!isAuthEnabled()) return notConfigured();
  return handlers.GET(req);
};

export const POST: typeof handlers.POST = async (req) => {
  if (!isAuthEnabled()) return notConfigured();
  return handlers.POST(req);
};
