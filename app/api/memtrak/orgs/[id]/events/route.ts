import { NextRequest, NextResponse } from 'next/server';
import { listAttendanceForOrg } from '@/lib/member-data';

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/memtrak/orgs/[id]/events
 *
 * Returns the organization's full event-attendance history sorted newest first.
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const rows = await listAttendanceForOrg(id);
  return NextResponse.json({ rows });
}
