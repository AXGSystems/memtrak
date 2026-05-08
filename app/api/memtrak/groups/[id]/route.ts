import { NextRequest, NextResponse } from 'next/server';
import { getGroup, updateGroup, deleteGroup } from '@/lib/member-data';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const result = await getGroup(id);
  if (!result) return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  let patch: Record<string, unknown>;
  try { patch = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  try {
    const group = await updateGroup(id, patch);
    return NextResponse.json({ success: true, group });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    await deleteGroup(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}
