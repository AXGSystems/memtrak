import { NextRequest, NextResponse } from 'next/server';
import { listGroups, createGroup, type GroupType } from '@/lib/member-data';

const TYPES: GroupType[] = ['Committee', 'Board', 'Task Force', 'Section', 'Working Group', 'Interest Group'];

export async function GET() {
  const groups = await listGroups();
  return NextResponse.json({ groups });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!body.name || typeof body.name !== 'string') return NextResponse.json({ error: 'name required' }, { status: 400 });
  if (!body.group_type || !TYPES.includes(body.group_type as GroupType)) {
    return NextResponse.json({ error: `group_type must be one of ${TYPES.join(', ')}` }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const group = await createGroup(body as any);
    return NextResponse.json({ success: true, group }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Create failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}
