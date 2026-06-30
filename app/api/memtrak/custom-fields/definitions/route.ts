import { NextResponse } from 'next/server';
import { getCustomFieldDefs } from '@/lib/custom-fields';

import { requireReadOnly } from '@/lib/route-auth';
/**
 * GET /api/memtrak/custom-fields/definitions
 *
 * Returns the canonical custom-field definitions used to render the
 * Member360 panel and the MemberFormDrawer custom-field inputs.
 *
 * Cached aggressively — definitions change rarely and are deploy-time.
 */
export async function GET() {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  return NextResponse.json({ definitions: getCustomFieldDefs() }, {
    headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate=3600' },
  });
}
