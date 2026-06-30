import { NextRequest, NextResponse } from 'next/server';
import { getInvoice, updateInvoice, deleteInvoice, markInvoicePaid } from '@/lib/member-data';
import { requireReadOnly, requireStaff, safeError } from '@/lib/route-auth';
import { logEntityAudit } from '@/lib/audit';
import { auditContext } from '@/lib/audit-context';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  const invoice = await getInvoice(id);
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  let patch: Record<string, unknown>;
  try { patch = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  try {
    // The mark_paid action is a convenience for the UI.
    if (patch.action === 'mark_paid') {
      const payment_method = typeof patch.payment_method === 'string' ? patch.payment_method : 'Unspecified';
      const payment_reference = typeof patch.payment_reference === 'string' ? patch.payment_reference : undefined;
      const date_paid = typeof patch.date_paid === 'string' ? patch.date_paid : undefined;
      const invoice = await markInvoicePaid(id, { payment_method, payment_reference, date_paid });
      logEntityAudit({
        entity: 'invoice', entity_id: id, entity_label: invoice.invoice_number,
        action: 'mark_paid', actor: gate.actor.email,
        summary: `Marked invoice ${invoice.invoice_number} paid ($${invoice.amount.toLocaleString()}, ${payment_method})`,
        ...auditContext(request),
      });
      return NextResponse.json({ success: true, invoice });
    }
    const invoice = await updateInvoice(id, patch);
    logEntityAudit({
      entity: 'invoice', entity_id: id, entity_label: invoice.invoice_number,
      action: 'update', actor: gate.actor.email,
      summary: `Updated invoice ${invoice.invoice_number}`,
      ...auditContext(request),
    });
    return NextResponse.json({ success: true, invoice });
  } catch (err) {
    return safeError(err);
  }
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const gate = await requireStaff();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await ctx.params;
  try {
    await deleteInvoice(id);
    logEntityAudit({
      entity: 'invoice', entity_id: id, entity_label: id,
      action: 'delete', actor: gate.actor.email,
      summary: `Deleted invoice ${id}`,
      ...auditContext(request),
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return safeError(err);
  }
}
