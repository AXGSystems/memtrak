import { NextRequest, NextResponse } from 'next/server';
import {
  listDocuments,
  createDocument,
  DOCUMENT_TYPES,
  type DocumentType,
} from '@/lib/member-data';
import { logEntityAudit } from '@/lib/audit';
import { requireReadOnly, requireStaff, safeError } from '@/lib/route-auth';
import { auditContext } from '@/lib/audit-context';

/**
 * GET  /api/memtrak/documents
 *   ?q=&doc_type=&group_id=&tag=
 *
 * POST /api/memtrak/documents
 *   Body: { name, doc_type, url, description?, group_id?, effective_date?, tags? }
 */

function isValidUrl(s: string): boolean {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; }
  catch { return false; }
}

export async function GET(request: NextRequest) {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const sp = request.nextUrl.searchParams;
  const rows = await listDocuments({
    q: sp.get('q') ?? undefined,
    doc_type: (sp.get('doc_type') as DocumentType | null) ?? undefined,
    group_id: sp.get('group_id') ?? undefined,
    tag: sp.get('tag') ?? undefined,
  });
  return NextResponse.json({ rows });
}

export async function POST(request: NextRequest) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const doc_type = typeof body.doc_type === 'string' ? body.doc_type : '';
  const url = typeof body.url === 'string' ? body.url.trim() : '';

  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  if (!DOCUMENT_TYPES.includes(doc_type as DocumentType)) {
    return NextResponse.json({ error: `doc_type must be one of ${DOCUMENT_TYPES.join(', ')}` }, { status: 400 });
  }
  if (!isValidUrl(url)) return NextResponse.json({ error: 'url must be a valid http(s) URL' }, { status: 400 });

  const description = typeof body.description === 'string' ? body.description : null;
  const group_id    = typeof body.group_id === 'string' && body.group_id ? body.group_id : null;
  const effective_date = typeof body.effective_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.effective_date) ? body.effective_date : null;
  // Trust the authenticated session for the actor, not a client-supplied field.
  const uploaded_by = gate.actor.email;
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === 'string') : [];

  try {
    const doc = await createDocument({
      name, doc_type: doc_type as DocumentType, url,
      description, group_id, effective_date, uploaded_by, tags,
    });
    logEntityAudit({
      entity: 'document', entity_id: doc.id, entity_label: doc.name,
      action: 'create', actor: gate.actor.email,
      summary: `Added ${doc.doc_type.toLowerCase()} "${doc.name}"`,
      ...auditContext(request),
    });
    return NextResponse.json({ success: true, document: doc }, { status: 201 });
  } catch (err) {
    return safeError(err);
  }
}
