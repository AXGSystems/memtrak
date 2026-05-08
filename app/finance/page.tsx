'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card, { KpiCard } from '@/components/Card';
import AnimatedCounter from '@/components/AnimatedCounter';
import ClientChart from '@/components/ClientChart';
import { SkeletonKPI, SkeletonCard } from '@/components/Skeleton';
import {
  DollarSign, Receipt, AlertCircle, CheckCircle2, Clock, TrendingUp, Building2, ExternalLink,
} from 'lucide-react';
import type { FinanceStats } from '@/lib/member-data';

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

const monthLabel = (key: string) => {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleString('en-US', { month: 'short' });
};

export default function FinancePage() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/memtrak/invoices/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const collectionRate = stats && stats.billed > 0 ? Math.round((stats.collected / stats.billed) * 100) : 0;
  const trailing12 = stats ? stats.monthlyCash.reduce((s, m) => s + m.amount, 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            Finance
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {stats
              ? <>Live invoice cashflow · trailing 12 months: <strong style={{ color: 'var(--heading)' }}>${trailing12.toLocaleString()}</strong></>
              : 'Loading invoice stats…'}
          </p>
        </div>
        <Link
          href="/invoices"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03]"
          style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
        >
          <Receipt className="w-3.5 h-3.5" /> Open invoices
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {loading || !stats ? (
          <><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /></>
        ) : (
          <>
            <KpiCard label="Billed" value={`$${(stats.billed / 1000).toFixed(0)}K`} sub="all active invoices" icon={Receipt} color="#4A90D9" />
            <KpiCard label="Collected" value={`$${(stats.collected / 1000).toFixed(0)}K`} sub={`${collectionRate}% of billed`} icon={CheckCircle2} color="#8CC63F" />
            <KpiCard label="Outstanding" value={`$${(stats.outstanding / 1000).toFixed(0)}K`} sub="not yet paid" icon={Clock} color="#F5C542" />
            <KpiCard label="Past due" value={`$${(stats.pastDue / 1000).toFixed(0)}K`} sub="needs dunning" icon={AlertCircle} color="#D94A4A" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly cash trend */}
        <div className="lg:col-span-2">
          {loading || !stats ? <SkeletonCard height={300} /> : (
            <Card glass title="Monthly cash collected" subtitle="Trailing 12 months — paid invoices bucketed by date_paid">
              <ClientChart
                type="bar"
                height={260}
                data={{
                  labels: stats.monthlyCash.map((m) => monthLabel(m.month)),
                  datasets: [{
                    label: 'Cash',
                    data: stats.monthlyCash.map((m) => m.amount),
                    backgroundColor: stats.monthlyCash.map(() => '#8CC63F'),
                    borderRadius: 6,
                  }],
                }}
                options={{
                  plugins: {
                    legend: { display: false },
                    datalabels: { display: false },
                    tooltip: { callbacks: { label: (ctx: { raw: number }) => `$${ctx.raw.toLocaleString()}` } },
                  },
                  scales: {
                    y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}` } },
                    x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 10 } } },
                  },
                }}
              />
            </Card>
          )}
        </div>

        {/* AR Aging */}
        {loading || !stats ? <SkeletonCard height={300} /> : (
          <Card glass title="AR aging" subtitle="Outstanding by days past due">
            <div className="space-y-2">
              {([
                { label: 'Current', key: 'current', color: '#8CC63F' },
                { label: '1–30 days', key: 'd1_30', color: '#F5C542' },
                { label: '31–60 days', key: 'd31_60', color: '#E8923F' },
                { label: '61–90 days', key: 'd61_90', color: '#D94A4A' },
                { label: '91+ days', key: 'd91_plus', color: '#a855f7' },
              ] as const).map(({ label, key, color }) => {
                const amount = stats.aging[key];
                const pct = stats.outstanding > 0 ? Math.round((amount / stats.outstanding) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span style={{ color: 'var(--heading)' }}>{label}</span>
                      <span className="tabular-nums" style={{ color }}>${amount.toLocaleString()} <span style={{ color: 'var(--text-muted)' }}>({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by member type */}
        {loading || !stats ? <SkeletonCard height={260} /> : (
          <Card glass title="Cash collected by member type" subtitle="Paid invoices split by org_type">
            {stats.byOrgType.length === 0 ? (
              <p className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>No paid invoices yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.byOrgType.map((row) => {
                  const max = stats.byOrgType[0].amount || 1;
                  const pct = Math.round((row.amount / max) * 100);
                  const color = TYPE_COLOR[row.org_type] ?? 'var(--accent)';
                  return (
                    <div key={row.org_type} className="flex items-center gap-3">
                      <span className="w-12 text-[10px] font-bold uppercase tracking-wider" style={{ color }}>{row.org_type}</span>
                      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <AnimatedCounter value={row.amount} prefix="$" className="text-xs font-bold tabular-nums" color="var(--heading)" />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* Top paying orgs */}
        {loading || !stats ? <SkeletonCard height={260} /> : (
          <Card glass title="Top paying organizations" subtitle="Cumulative cash collected">
            {stats.topPayers.length === 0 ? (
              <p className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>No paid invoices yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.topPayers.map((p, i) => (
                  <Link
                    key={p.org_id}
                    href={`/member-360?id=${encodeURIComponent(p.org_id)}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg transition-all hover:translate-x-0.5"
                    style={{ background: 'var(--input-bg)' }}
                  >
                    <span className="w-5 text-center text-[10px] font-bold" style={{ color: i === 0 ? '#F5C542' : 'var(--text-muted)' }}>#{i + 1}</span>
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    <span className="flex-1 text-xs font-bold truncate" style={{ color: 'var(--heading)' }}>{p.org_name}</span>
                    <span className="text-xs font-extrabold tabular-nums" style={{ color: '#8CC63F' }}>${p.amount.toLocaleString()}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {!loading && stats && stats.pastDue > 0 && (
        <Card glass accent="#D94A4A">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D94A4A' }} />
            <div className="flex-1">
              <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
                ${stats.pastDue.toLocaleString()} past due across {Object.values(stats.aging).filter((v) => v > 0).length - (stats.aging.current > 0 ? 1 : 0)} aging buckets
              </div>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Run the dunning workflow to nudge non-payers. Invoices over 90 days should be flagged for personal outreach.
              </p>
            </div>
            <Link href="/invoices?status=Past+Due" className="text-[10px] font-semibold flex items-center gap-1 px-2 py-1 rounded-md transition-all hover:scale-[1.03]" style={{ color: '#D94A4A', background: 'color-mix(in srgb, #D94A4A 12%, transparent)' }}>
              View past-due <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </Card>
      )}

      <p className="text-[10px] pt-2" style={{ color: 'var(--text-muted)' }}>
        <DollarSign className="w-3 h-3 inline-block mr-1" />
        All figures are derived from MEMTrak invoice records. Cancelled and refunded invoices are excluded from totals.
      </p>
    </div>
  );
}
