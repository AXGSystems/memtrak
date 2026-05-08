import { NextResponse } from 'next/server';
import { getFinanceStats } from '@/lib/member-data';

/**
 * GET /api/memtrak/invoices/stats
 *
 * Returns FinanceStats: totals, AR aging, last-12-month cash collected,
 * by-org-type revenue, and top-5 paying orgs.
 */
export async function GET() {
  const stats = await getFinanceStats();
  return NextResponse.json(stats, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' },
  });
}
