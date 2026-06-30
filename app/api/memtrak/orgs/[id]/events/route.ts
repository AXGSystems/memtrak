import { NextRequest, NextResponse } from 'next/server';
import { listAttendanceForOrg } from '@/lib/member-data';

import { requireReadOnly } from '@/lib/route-auth';
type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/memtrak/orgs/[id]/events
 *
 * Returns the organization's full event-attendance history sorted newest first.
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  const rows = await listAttendanceForOrg(id);
  return NextResponse.json({ rows });
}
