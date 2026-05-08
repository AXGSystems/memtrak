import { NextRequest, NextResponse } from 'next/server';
import { generateInvoices } from '@/lib/member-data';

/**
 * POST /api/memtrak/invoices/generate
 *
 * Body: { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
 *   Generates Pending invoices for every Active org with renewal_date in that
 *   range that does NOT already have an invoice for the target fiscal year
 *   (derived from the `to` date). Idempotent within a fiscal year.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const from = typeof body.from === 'string' ? body.from : '';
  const to = typeof body.to === 'string' ? body.to : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json({ error: 'from and to must be YYYY-MM-DD' }, { status: 400 });
  }
  if (from > to) {
    return NextResponse.json({ error: 'from must be on or before to' }, { status: 400 });
  }

  try {
    const result = await generateInvoices(from, to);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generate failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}
