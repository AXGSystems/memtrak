import { NextResponse } from 'next/server';
import { listInvoices } from '@/lib/member-data';
import { bucketInvoices } from '@/lib/dunning';

import { requireReadOnly } from '@/lib/route-auth';
/**
 * GET /api/memtrak/dunning/buckets
 *
 * Returns the 6 dunning cohorts with the matching invoices.
 */
export async function GET() {
  const gate = await requireReadOnly();
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { rows } = await listInvoices({ pageSize: 200, page: 1 });
  const buckets = bucketInvoices(rows);
  return NextResponse.json({
    buckets: buckets.map((b) => ({
      key: b.cohort.key,
      label: b.cohort.label,
      tone: b.cohort.tone,
      description: b.cohort.description,
      offsetDays: b.cohort.offsetDays,
      total: b.total,
      count: b.invoices.length,
      invoices: b.invoices,
    })),
  }, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  });
}
