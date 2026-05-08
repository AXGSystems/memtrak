import { NextRequest, NextResponse } from 'next/server';
import {
  getOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/lib/member-data';

/**
 * MEMTrak Members API — single organization
 *
 * GET    /api/memtrak/members/[id]   → org or 404
 * PUT    /api/memtrak/members/[id]   → updated org (Supabase required)
 * DELETE /api/memtrak/members/[id]   → 204 (Supabase required)
 */

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const org = await getOrganization(id);
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(org);
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  let patch: Record<string, unknown>;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const org = await updateOrganization(id, patch);
    return NextResponse.json({ success: true, org });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    await deleteOrganization(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}
