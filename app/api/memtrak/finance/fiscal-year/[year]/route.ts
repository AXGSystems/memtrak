import { NextRequest, NextResponse } from 'next/server';
import { getFiscalYearReport } from '@/lib/member-data';

type Ctx = { params: Promise<{ year: string }> };

/**
 * GET /api/memtrak/finance/fiscal-year/[year]
 *
 * Returns the FiscalYearReport for the given year. Cached for 5 minutes.
 */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { year: yearStr } = await ctx.params;
  const year = Number(yearStr);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: 'year must be 2000-2100' }, { status: 400 });
  }
  const report = await getFiscalYearReport(year);
  return NextResponse.json(report, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
  });
}
