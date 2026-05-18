import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAuthEnabled, type AuthRole } from '@/lib/auth.config';

/**
 * GET /api/admin/runbook-status
 *
 * Returns which production-relevant env vars are currently set on this
 * deploy. Never returns the values — just booleans + the first 4 chars
 * of each so admins can confirm it's the expected key.
 *
 * Admin only when auth is on.
 */

interface EnvFlag {
  key: string;
  set: boolean;
  hint?: string;
}

function flag(key: string, hint?: string): EnvFlag {
  return { key, set: Boolean(process.env[key]), hint };
}

export async function GET() {
  if (isAuthEnabled()) {
    const session = await auth();
    const user = session?.user as { role?: AuthRole } | undefined;
    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }
  }

  return NextResponse.json({
    auth_enabled: isAuthEnabled(),
    groups: [
      {
        name: 'Core',
        flags: [
          flag('NEXT_PUBLIC_SUPABASE_URL', 'Supabase project URL'),
          flag('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Public anon key for read-only Supabase calls'),
          flag('SUPABASE_SERVICE_ROLE_KEY', 'Service-role key — writes, NextAuth adapter, API key lookup'),
        ],
      },
      {
        name: 'NextAuth (flip ON when ready)',
        flags: [
          flag('MEMTRAK_AUTH_ENABLED', 'Set to "true" to activate the auth gate'),
          flag('AUTH_SECRET', 'Long random for JWT signing'),
          flag('AUTH_URL', 'Optional; defaults to deploy URL'),
          flag('RESEND_API_KEY', 'Magic-link delivery via Resend'),
          flag('EMAIL_FROM', 'Sender for magic links — "MEMTrak <noreply@alta.org>"'),
        ],
      },
      {
        name: 'Microsoft Graph (email send)',
        flags: [
          flag('GRAPH_CLIENT_ID'),
          flag('GRAPH_CLIENT_SECRET'),
          flag('GRAPH_TENANT_ID'),
        ],
      },
    ],
  });
}
