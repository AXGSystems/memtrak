import { NextRequest, NextResponse } from 'next/server';
import { requireReadOnly, safeError } from '@/lib/route-auth';
import { findDuplicateCandidates } from '@/lib/dedupe';

/**
 * GET /api/memtrak/dedupe/candidates?limit=50
 *
 * Returns duplicate-organization candidate pairs computed live from the
 * organization table (fuzzy name + state + member-id-stem scoring). No
 * fabricated counts — the response reflects the real population scanned.
 */
export async function GET(request: NextRequest) {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const limit = Number(request.nextUrl.searchParams.get('limit')) || 50;
  try {
    const result = await findDuplicateCandidates({ limit });
    return NextResponse.json(result);
  } catch (err) {
    return safeError(err);
  }
}
