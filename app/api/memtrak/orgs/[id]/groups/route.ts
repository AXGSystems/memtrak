import { NextRequest, NextResponse } from 'next/server';
import { listGroupsForOrg } from '@/lib/member-data';

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/memtrak/orgs/[id]/groups
 *
 * Returns the groups that any contact at this organization is a member of,
 * along with their role + term info. Useful for showing "Memberships" on
 * the Member360 page.
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const rows = await listGroupsForOrg(id);
  return NextResponse.json({ rows });
}
