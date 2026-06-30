import { NextRequest, NextResponse } from 'next/server';
import { recomputeEngagement } from '@/lib/member-data';
import { requireReadOnly, requireStaff, safeError } from '@/lib/route-auth';
import { logEntityAudit } from '@/lib/audit';
import { auditContext } from '@/lib/audit-context';

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/memtrak/orgs/[id]/recompute-engagement
 *
 * Recomputes the engagement score and persists the new score / health_tier
 * when Supabase is configured. Returns the full breakdown.
 */
export async function POST(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  try {
    const result = await recomputeEngagement(id, { persist: true });
    logEntityAudit({
      entity: 'organization', entity_id: id, entity_label: id,
      action: 'recompute_engagement', actor: gate.actor.email,
      summary: `Recomputed engagement for org ${id}`,
      ...auditContext(request),
    });
    return NextResponse.json(result);
  } catch (err) {
    return safeError(err);
  }
}

/**
 * GET /api/memtrak/orgs/[id]/recompute-engagement
 *
 * Pure preview — returns the would-be score and breakdown without writing.
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  try {
    const result = await recomputeEngagement(id, { persist: false });
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=120' },
    });
  } catch (err) {
    return safeError(err);
  }
}
