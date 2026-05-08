import { NextRequest, NextResponse } from 'next/server';
import {
  listOrganizations,
  createOrganization,
  type SortField,
} from '@/lib/member-data';

/**
 * MEMTrak Members API
 *
 * GET  /api/memtrak/members
 *   ?q=&type=&health=&state=&status=&sort=&order=&page=&pageSize=
 *   Returns { rows, total, page, pageSize }
 *
 * POST /api/memtrak/members
 *   Body: OrganizationInput (org_name + org_type required)
 *   Returns the created organization. Requires Supabase.
 */

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const result = await listOrganizations({
    q: sp.get('q') ?? undefined,
    type: sp.get('type') ?? undefined,
    health: sp.get('health') ?? undefined,
    state: sp.get('state') ?? undefined,
    status: sp.get('status') ?? undefined,
    joined_after: sp.get('joined_after') ?? undefined,
    renewal_from: sp.get('renewal_from') ?? undefined,
    renewal_to: sp.get('renewal_to') ?? undefined,
    sort: (sp.get('sort') as SortField) ?? undefined,
    order: sp.get('order') === 'asc' ? 'asc' : 'desc',
    page: Number(sp.get('page')) || 1,
    pageSize: Number(sp.get('pageSize')) || 25,
  });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.org_name || typeof body.org_name !== 'string') {
    return NextResponse.json({ error: 'org_name required' }, { status: 400 });
  }
  if (!body.org_type || typeof body.org_type !== 'string') {
    return NextResponse.json({ error: 'org_type required' }, { status: 400 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const org = await createOrganization(body as any);
    return NextResponse.json({ success: true, org }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Create failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}
