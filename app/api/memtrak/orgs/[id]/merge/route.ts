import { NextRequest, NextResponse } from 'next/server';
import { requireStaff, safeError } from '@/lib/route-auth';
import { mergeOrganizations } from '@/lib/dedupe';
import { logEntityAudit } from '@/lib/audit';
import { auditContext } from '@/lib/audit-context';

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/memtrak/orgs/[id]/merge   body: { duplicate_id: string }
 *
 * Merges the duplicate organization into the survivor identified by [id].
 * Survivor keeps its record while absorbing the union of tags, summed
 * lifetime revenue, the higher engagement score, and the most-recent
 * payment date; the duplicate row is then removed. Staff-gated + audited.
 */
export async function POST(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id: survivorId } = await ctx.params;

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const duplicateId = typeof body.duplicate_id === 'string' ? body.duplicate_id : '';
  if (!duplicateId) return NextResponse.json({ error: 'duplicate_id required' }, { status: 400 });

  try {
    const { survivor, mergedFromId } = await mergeOrganizations(survivorId, duplicateId);
    logEntityAudit({
      entity: 'organization', entity_id: survivorId, entity_label: survivor.org_name,
      action: 'merge', actor: gate.actor.email,
      summary: `Merged organization ${mergedFromId} into ${survivor.org_name} (${survivorId})`,
      ...auditContext(request),
    });
    return NextResponse.json({ success: true, survivor, merged_from: mergedFromId });
  } catch (err) {
    return safeError(err);
  }
}
