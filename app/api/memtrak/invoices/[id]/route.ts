import { NextRequest, NextResponse } from 'next/server';
import { getInvoice, updateInvoice, deleteInvoice, markInvoicePaid } from '@/lib/member-data';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const invoice = await getInvoice(id);
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PUT(request: NextRequest, ctx: Ctx) {
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
      return NextResponse.json({ success: true, invoice });
    }
    const invoice = await updateInvoice(id, patch);
    return NextResponse.json({ success: true, invoice });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    await deleteInvoice(id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}
