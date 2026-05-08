import { NextRequest, NextResponse } from 'next/server';
import { getContact, updateContact, deleteContact } from '@/lib/member-data';

/**
 * GET    /api/memtrak/contacts/[id]
 * PUT    /api/memtrak/contacts/[id]
 * DELETE /api/memtrak/contacts/[id]
 */

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const contact = await getContact(id);
  if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(contact);
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  let patch: Record<string, unknown>;
  try {
    patch = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof patch.email === 'string' && patch.email && !patch.email.includes('@')) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }

  try {
    const contact = await updateContact(id, patch);
    return NextResponse.json({ success: true, contact });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    await deleteContact(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}
