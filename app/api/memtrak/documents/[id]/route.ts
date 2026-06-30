import { NextRequest, NextResponse } from 'next/server';
import {
  getDocument,
  updateDocument,
  deleteDocument,
  DOCUMENT_TYPES,
  type DocumentType,
} from '@/lib/member-data';
import { logEntityAudit, diffRecords } from '@/lib/audit';
import { requireReadOnly, requireStaff, requireAdminRole, safeError } from '@/lib/route-auth';
import { auditContext } from '@/lib/audit-context';

/**
 * GET    /api/memtrak/documents/[id]
 * PATCH  /api/memtrak/documents/[id]
 * DELETE /api/memtrak/documents/[id]
 */

type Ctx = { params: Promise<{ id: string }> };

function isValidUrl(s: string): boolean {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; }
  catch { return false; }
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  const doc = await getDocument(id);
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const before = await getDocument(id);
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const patch: Record<string, unknown> = {};
  if (typeof body.name === 'string' && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.doc_type === 'string') {
    if (!DOCUMENT_TYPES.includes(body.doc_type as DocumentType)) {
      return NextResponse.json({ error: 'invalid doc_type' }, { status: 400 });
    }
    patch.doc_type = body.doc_type;
  }
  if (typeof body.url === 'string') {
    if (!isValidUrl(body.url)) return NextResponse.json({ error: 'url must be a valid http(s) URL' }, { status: 400 });
    patch.url = body.url.trim();
  }
  if (typeof body.description === 'string' || body.description === null) patch.description = body.description;
  if (typeof body.group_id === 'string' || body.group_id === null) patch.group_id = body.group_id;
  if (typeof body.effective_date === 'string' || body.effective_date === null) patch.effective_date = body.effective_date;
  if (Array.isArray(body.tags)) patch.tags = body.tags.filter((t): t is string => typeof t === 'string');

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No supported fields in patch' }, { status: 400 });
  }

  try {
    const doc = await updateDocument(id, patch as Partial<typeof before>);
    logEntityAudit({
      entity: 'document', entity_id: doc.id, entity_label: doc.name,
      action: 'update', actor: gate.actor.email,
      summary: `Updated "${doc.name}"`,
      diff: diffRecords(before as unknown as Record<string, unknown>, doc as unknown as Record<string, unknown>),
      ...auditContext(request),
    });
    return NextResponse.json({ success: true, document: doc });
  } catch (err) {
    return safeError(err);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const gate = await requireAdminRole();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  const before = await getDocument(id);
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await deleteDocument(id);
    logEntityAudit({
      entity: 'document', entity_id: id, entity_label: before.name,
      action: 'delete', actor: gate.actor.email,
      summary: `Deleted "${before.name}"`,
      ...auditContext(request),
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return safeError(err);
  }
}
