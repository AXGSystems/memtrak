import { NextRequest, NextResponse } from 'next/server';
import { createList, getLists, getList, getActiveRecipients, getSuppressionCount } from '@/lib/memtrak';

/**
 * MEMTrak Recipient Lists API
 *
 * Manage segmented recipient lists for targeted campaigns.
 *
 * GET: List all recipient lists, or get a specific one
 *   ?id=list_123 — get specific list with active recipients (suppression filtered)
 *   (no params) — list all lists with counts
 *
 * POST: Create a new recipient list
 *   { name, description, recipients: [{ email, name, org, type, state }] }
 */

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  if (id) {
    const list = getList(id);
    if (!list) return NextResponse.json({ error: 'List not found' }, { status: 404 });
    const active = getActiveRecipients(list);
    return NextResponse.json({
      ...list,
      totalRecipients: list.recipients.length,
      activeRecipients: active.length,
      suppressed: list.recipients.length - active.length,
      recipients: active, // Only return non-suppressed recipients
    });
  }

  const lists = getLists();
  return NextResponse.json({
    lists: lists.map(l => ({
      id: l.id,
      name: l.name,
      description: l.description,
      totalRecipients: l.recipients.length,
      createdAt: l.createdAt,
    })),
    totalLists: lists.length,
    suppressionCount: getSuppressionCount(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.recipients || !Array.isArray(body.recipients)) {
      return NextResponse.json({ error: 'name and recipients[] required' }, { status: 400 });
    }
    const list = createList({
      name: body.name,
      description: body.description || '',
      recipients: body.recipients,
    });
    return NextResponse.json({ success: true, list });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
