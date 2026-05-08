import { NextRequest, NextResponse } from 'next/server';
import { listInvoices, createInvoice, type InvoiceStatus } from '@/lib/member-data';

const STATUSES: InvoiceStatus[] = ['Pending', 'Sent', 'Paid', 'Past Due', 'Cancelled', 'Refunded'];

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const status = sp.get('status') as InvoiceStatus | null;
  const result = await listInvoices({
    org_id: sp.get('org_id') ?? undefined,
    status: status && STATUSES.includes(status) ? status : undefined,
    fiscal_year: sp.get('fiscal_year') ? Number(sp.get('fiscal_year')) : undefined,
    due_from: sp.get('due_from') ?? undefined,
    due_to: sp.get('due_to') ?? undefined,
    q: sp.get('q') ?? undefined,
    page: Number(sp.get('page')) || 1,
    pageSize: Number(sp.get('pageSize')) || 50,
  });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!body.org_id || typeof body.org_id !== 'string') return NextResponse.json({ error: 'org_id required' }, { status: 400 });
  if (!body.invoice_number || typeof body.invoice_number !== 'string') return NextResponse.json({ error: 'invoice_number required' }, { status: 400 });
  if (typeof body.amount !== 'number' || body.amount < 0) return NextResponse.json({ error: 'amount must be a non-negative number' }, { status: 400 });
  if (!body.date_due || typeof body.date_due !== 'string') return NextResponse.json({ error: 'date_due required' }, { status: 400 });

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invoice = await createInvoice(body as any);
    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Create failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}
