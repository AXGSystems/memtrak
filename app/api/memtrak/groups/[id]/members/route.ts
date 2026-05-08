import { NextRequest, NextResponse } from 'next/server';
import { addGroupMember, type GroupRole } from '@/lib/member-data';

type Ctx = { params: Promise<{ id: string }> };

const ROLES: GroupRole[] = ['Chair', 'Vice Chair', 'Secretary', 'Member', 'Liaison', 'Observer'];

export async function POST(request: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!body.contact_id || typeof body.contact_id !== 'string') {
    return NextResponse.json({ error: 'contact_id required' }, { status: 400 });
  }
  const role = typeof body.role === 'string' ? body.role : 'Member';
  if (!ROLES.includes(role as GroupRole)) {
    return NextResponse.json({ error: `role must be one of ${ROLES.join(', ')}` }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const member = await addGroupMember({ ...(body as any), group_id: id, role: role as GroupRole });
    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Add member failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}
