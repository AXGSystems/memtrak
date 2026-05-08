'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card, { KpiCard } from '@/components/Card';
import AnimatedCounter from '@/components/AnimatedCounter';
import ClientChart from '@/components/ClientChart';
import { SkeletonKPI, SkeletonCard } from '@/components/Skeleton';
import {
  Receipt, CheckCircle2, Clock, AlertCircle, Building2, Users, UserPlus,
  UserX, ExternalLink, Printer, Download, ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { FiscalYearReport } from '@/lib/member-data';

const TYPE_COLOR: Record<string, string> = {
  ACU: '#a855f7',
  ACA: '#14b8a6',
  ACB: '#4A90D9',
  REA: '#F5C542',
  Associate: '#8CC63F',
  Affiliate: '#E8923F',
  Government: '#475569',
  Honorary: '#a855f7',
};

const monthShort = (key: string) => {
  const [, m] = key.split('-');
  return new Date(2000, Number(m) - 1).toLocaleString('en-US', { month: 'short' });
};

export default function FiscalYearReportPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [report, setReport] = useState<FiscalYearReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/memtrak/finance/fiscal-year/${year}`)
      .then((r) => r.json())
      .then((d: FiscalYearReport) => setReport(d))
      .finally(() => setLoading(false));
  }, [year]);

  const collectionRate = useMemo(() => {
    if (!report || report.billed === 0) return 0;
    return Math.round((report.collected / report.billed) * 100);
  }, [report]);

  const exportCsv = () => {
    if (!report) return;
    const sections: string[] = [];
    sections.push(`MEMTrak Fiscal Year Report — FY${report.fiscal_year}`);
    sections.push('');
    sections.push('Metric,Amount,Count');
    sections.push(`Billed,${report.billed},${report.invoiceCount.billed}`);
    sections.push(`Collected,${report.collected},${report.invoiceCount.collected}`);
    sections.push(`Outstanding,${report.outstanding},${report.invoiceCount.outstanding}`);
    sections.push(`Past Due,${report.pastDue},${report.invoiceCount.pastDue}`);
    sections.push(`Write-offs,${report.writeOffs},${report.invoiceCount.writeOffs}`);
    sections.push('');
    sections.push('Month,Billed,Collected');
    for (const m of report.monthly) sections.push(`${m.month},${m.billed},${m.collected}`);
    sections.push('');
    sections.push('Org Type,Billed,Collected');
    for (const t of report.byOrgType) sections.push(`${t.org_type},${t.billed},${t.collected}`);
    sections.push('');
    sections.push('Rank,Org,Type,Collected');
    report.topPayers.forEach((p, i) => sections.push(`${i + 1},"${p.org_name}",${p.org_type},${p.amount}`));

    const blob = new Blob([sections.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MEMTrak-FY${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            Fiscal Year {year}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Board-ready fiscal report · cash-basis from MEMTrak invoice records
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <div className="flex items-center gap-1 px-1 py-0.5 rounded-lg" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
            <button
              onClick={() => setYear(year - 1)}
              aria-label="Previous year"
              className="p-1 rounded transition-all hover:scale-[1.08]"
              style={{ color: 'var(--text-muted)' }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold tabular-nums px-2" style={{ color: 'var(--heading)' }}>{year}</span>
            <button
              onClick={() => setYear(year + 1)}
              disabled={year >= currentYear}
              aria-label="Next year"
              className="p-1 rounded transition-all hover:scale-[1.08] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-muted)' }}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={exportCsv}
            disabled={!report}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-50"
            style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03]"
            style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {loading || !report ? (
          <><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /></>
        ) : (
          <>
            <KpiCard label="Billed" value={`$${(report.billed / 1000).toFixed(0)}K`} sub={`${report.invoiceCount.billed} invoices`} icon={Receipt} color="#4A90D9" />
            <KpiCard label="Collected" value={`$${(report.collected / 1000).toFixed(0)}K`} sub={`${collectionRate}% of billed`} icon={CheckCircle2} color="#8CC63F" />
            <KpiCard label="Outstanding" value={`$${(report.outstanding / 1000).toFixed(0)}K`} sub={`${report.invoiceCount.outstanding} unpaid`} icon={Clock} color="#F5C542" />
            <KpiCard label="Past due" value={`$${(report.pastDue / 1000).toFixed(0)}K`} sub={`${report.invoiceCount.pastDue} overdue`} icon={AlertCircle} color="#D94A4A" />
          </>
        )}
      </div>

      {/* Member roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {loading || !report ? <SkeletonCard height={120} /> : (
          <Card glass>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, #8CC63F 14%, transparent)' }}>
                <UserPlus className="w-4 h-4" style={{ color: '#8CC63F' }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>New members in {year}</div>
                <AnimatedCounter value={report.newMembers} className="text-2xl font-extrabold" color="var(--heading)" />
              </div>
            </div>
          </Card>
        )}
        {loading || !report ? <SkeletonCard height={120} /> : (
          <Card glass>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, #4A90D9 14%, transparent)' }}>
                <Users className="w-4 h-4" style={{ color: '#4A90D9' }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Renewing members</div>
                <AnimatedCounter value={report.renewingMembers} className="text-2xl font-extrabold" color="var(--heading)" />
              </div>
            </div>
          </Card>
        )}
        {loading || !report ? <SkeletonCard height={120} /> : (
          <Card glass>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'color-mix(in srgb, #D94A4A 14%, transparent)' }}>
                <UserX className="w-4 h-4" style={{ color: '#D94A4A' }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Lapsed / cancelled</div>
                <AnimatedCounter value={report.lapsedMembers} className="text-2xl font-extrabold" color="var(--heading)" />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Monthly billed vs collected */}
      {loading || !report ? <SkeletonCard height={300} /> : (
        <Card glass title={`${year} monthly billed vs collected`} subtitle="Issued in month vs cash received in month">
          <ClientChart
            type="bar"
            height={260}
            data={{
              labels: report.monthly.map((m) => monthShort(m.month)),
              datasets: [
                {
                  label: 'Billed',
                  data: report.monthly.map((m) => m.billed),
                  backgroundColor: report.monthly.map(() => 'rgba(74,144,217,0.7)'),
                  borderRadius: 6,
                },
                {
                  label: 'Collected',
                  data: report.monthly.map((m) => m.collected),
                  backgroundColor: report.monthly.map(() => '#8CC63F'),
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              plugins: {
                legend: { display: true, position: 'top' as const, labels: { color: '#8899aa', usePointStyle: true, padding: 16, font: { size: 10 } } },
                datalabels: { display: false },
                tooltip: { callbacks: { label: (ctx: { dataset: { label: string }; raw: number }) => `${ctx.dataset.label}: $${ctx.raw.toLocaleString()}` } },
              },
              scales: {
                y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}` } },
                x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 10 } } },
              },
            }}
          />
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By type */}
        {loading || !report ? <SkeletonCard height={260} /> : (
          <Card glass title="Collected by member type" subtitle="Cash received split by org_type">
            {report.byOrgType.length === 0 ? (
              <p className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>No collections recorded for {year}.</p>
            ) : (
              <div className="space-y-2">
                {report.byOrgType.map((row) => {
                  const max = report.byOrgType[0].collected || 1;
                  const pct = Math.round((row.collected / max) * 100);
                  const color = TYPE_COLOR[row.org_type] ?? 'var(--accent)';
                  return (
                    <div key={row.org_type} className="flex items-center gap-3">
                      <span className="w-12 text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{row.org_type}</span>
                      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--heading)' }}>${row.collected.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* Top payers */}
        {loading || !report ? <SkeletonCard height={260} /> : (
          <Card glass title="Top 10 paying organizations" subtitle={`Cash received in FY${year}`}>
            {report.topPayers.length === 0 ? (
              <p className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>No collections recorded for {year}.</p>
            ) : (
              <div className="space-y-1.5">
                {report.topPayers.map((p, i) => (
                  <Link
                    key={p.org_id}
                    href={`/member-360?id=${encodeURIComponent(p.org_id)}`}
                    className="flex items-center gap-3 p-2 rounded-md transition-all hover:translate-x-0.5"
                    style={{ background: 'var(--input-bg)' }}
                  >
                    <span className="w-5 text-center text-[10px] font-bold" style={{ color: i === 0 ? '#F5C542' : 'var(--text-muted)' }}>#{i + 1}</span>
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    <span className="flex-1 text-xs font-bold truncate" style={{ color: 'var(--heading)' }}>{p.org_name}</span>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: TYPE_COLOR[p.org_type] ?? 'var(--text-muted)' }}>{p.org_type}</span>
                    <span className="text-xs font-extrabold tabular-nums" style={{ color: '#8CC63F' }}>${p.amount.toLocaleString()}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {!loading && report && report.writeOffs > 0 && (
        <Card glass accent="#a855f7">
          <div className="flex items-start gap-3">
            <div className="text-xs">
              <strong style={{ color: 'var(--heading)' }}>${report.writeOffs.toLocaleString()}</strong>
              <span style={{ color: 'var(--text-muted)' }}> in cancelled or refunded invoices ({report.invoiceCount.writeOffs}) — excluded from billed and collected totals.</span>
            </div>
          </div>
        </Card>
      )}

      <p className="text-[10px] pt-2" style={{ color: 'var(--text-muted)' }}>
        Methodology: <strong>Billed</strong> = invoices issued in {year} (excluding cancelled/refunded).
        <strong> Collected</strong> = cash actually received during {year}, regardless of issue date.
        <strong> Outstanding</strong> = invoices issued in {year} that are not yet paid.
        Member counts reflect organizations active as of report time.
      </p>
    </div>
  );
}
