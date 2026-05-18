import { NextRequest, NextResponse } from 'next/server';
import { getPortalContext } from '@/lib/portal-auth';
import { getContact, updateContact } from '@/lib/member-data';
import { logEntityAudit, diffRecords } from '@/lib/audit';

/**
 * PATCH /api/portal/profile
 *
 * Update the signed-in member's own contact record. Editable fields are
 * limited to identity / contact info — role, is_primary, email,
 * engagement stats and org_id are NOT user-editable.
 *
 * Body: { first_name?, last_name?, title?, phone? }
 */

const ALLOWED = ['first_name', 'last_name', 'title', 'phone'] as const;
type AllowedField = typeof ALLOWED[number];

export async function PATCH(request: NextRequest) {
  const gate = await getPortalContext();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const patch: Record<string, string> = {};
  for (const f of ALLOWED) {
    const v = body[f];
    if (typeof v === 'string') patch[f] = v.trim();
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No editable fields in patch' }, { status: 400 });
  }

  const before = await getContact(gate.ctx.contact_id);
  if (!before) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

  try {
    const contact = await updateContact(gate.ctx.contact_id, patch);
    logEntityAudit({
      entity: 'contact',
      entity_id: contact.id,
      entity_label: `${contact.first_name} ${contact.last_name}`,
      action: 'update',
      actor: `member:${gate.ctx.email ?? contact.email}`,
      summary: `Self-updated profile`,
      diff: diffRecords(before as unknown as Record<string, unknown>, contact as unknown as Record<string, unknown>),
    });
    return NextResponse.json({ success: true, contact });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}
