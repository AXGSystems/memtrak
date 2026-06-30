import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isAnthropicConfigured } from '@/lib/anthropic';
import { isGraphConfigured } from '@/lib/graph';
import { isPaymentsConfigured } from '@/lib/payments';

import { requireReadOnly } from '@/lib/route-auth';
/**
 * MEMTrak Integrations Status
 *
 * Reports the TRUE runtime configuration state of each integration by
 * probing for the required environment variables. No integration is reported
 * as "Connected" unless its credentials are actually present in this
 * environment — replacing the previous hard-coded/aspirational status labels.
 *
 * Status values:
 *   - "Configured"     — required env vars are present (live client code exists)
 *   - "Not Configured" — env vars absent
 *   - "Not Implemented"— no client code exists yet, regardless of env vars
 */

type Status = 'Configured' | 'Not Configured' | 'Not Implemented';

export async function GET() {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const integrations: { key: string; status: Status }[] = [
    // Live client code exists for these — report true env-var state.
    { key: 'graph', status: isGraphConfigured() ? 'Configured' : 'Not Configured' },
    { key: 'anthropic', status: isAnthropicConfigured() ? 'Configured' : 'Not Configured' },
    { key: 'supabase', status: isSupabaseConfigured() ? 'Configured' : 'Not Configured' },
    { key: 'stripe', status: isPaymentsConfigured() ? 'Configured' : 'Not Configured' },

    // No client code exists yet for these — do not claim "Connected"/"Ready".
    { key: 'azure_sql', status: 'Not Implemented' },
    { key: 'ga4', status: 'Not Implemented' },
    { key: 'revive', status: 'Not Implemented' },
    { key: 'zerobounce', status: 'Not Implemented' },
    { key: 'twilio', status: 'Not Implemented' },
  ];

  return NextResponse.json({
    integrations,
    probedAt: new Date().toISOString(),
  });
}
