import { NextRequest, NextResponse } from 'next/server';
import { recomputeEngagement } from '@/lib/member-data';

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/memtrak/orgs/[id]/recompute-engagement
 *
 * Recomputes the engagement score and persists the new score / health_tier
 * when Supabase is configured. Returns the full breakdown.
 */
export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const result = await recomputeEngagement(id, { persist: true });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Recompute failed';
    const notFound = message.includes('not found');
    return NextResponse.json({ error: message }, { status: notFound ? 404 : 500 });
  }
}

/**
 * GET /api/memtrak/orgs/[id]/recompute-engagement
 *
 * Pure preview — returns the would-be score and breakdown without writing.
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const result = await recomputeEngagement(id, { persist: false });
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=120' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Recompute failed';
    const notFound = message.includes('not found');
    return NextResponse.json({ error: message }, { status: notFound ? 404 : 500 });
  }
}
