import { NextRequest, NextResponse } from 'next/server';
import { getEvent } from '@/lib/member-data';

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/memtrak/connect-events/[id]
 *
 * Returns the event summary plus its full attendance roster. The id is the
 * alta_connect_event_id (URL-encoded if it contains slashes).
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const result = await getEvent(decodeURIComponent(id));
  if (!result) return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  return NextResponse.json(result);
}
