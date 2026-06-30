'use client';

import { useEffect, useMemo, useRef, useState, use } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import ClientChart from '@/components/ClientChart';
import { SkeletonCard } from '@/components/Skeleton';
import { ChevronLeft, Printer, Download, AlertCircle } from 'lucide-react';
import { getReport, reportToCSV, printReport, type ReportInputs, type ReportResult } from '@/lib/reports';
import type {
  Organization, Invoice, EventSummary, EventAttendance, Group, GroupMember,
} from '@/lib/member-data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function ReportDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const preset = useMemo(() => getReport(slug), [slug]);

  const [inputs, setInputs] = useState<ReportInputs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!preset) return;
    let cancelled = false;

    Promise.all([
      fetch('/api/memtrak/members?pageSize=200').then((r) => r.json()),
      fetch('/api/memtrak/invoices?pageSize=200').then((r) => r.json()),
      fetch('/api/memtrak/connect-events').then((r) => r.json()),
      fetch('/api/memtrak/groups').then((r) => r.json()),
    ])
      .then(async ([members, invoices, events, groups]) => {
        if (cancelled) return;
        // attendance + group members are best-effort: pull from each event/group to assemble
        // (these data sets are small enough to skip; we leave attendance empty here unless needed)
        setInputs({
          organizations: (members.rows ?? []) as Organization[],
          invoices: (invoices.rows ?? []) as Invoice[],
          events: (events.events ?? []) as EventSummary[],
          attendance: [] as EventAttendance[],
          groups: (groups.groups ?? []) as Group[],
          groupMembers: [] as GroupMember[],
        });
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Network error'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [preset]);

  const result: ReportResult | null = useMemo(() => {
    if (!preset || !inputs) return null;
    return preset.run(inputs);
  }, [preset, inputs]);

  if (!preset) {
    return (
      <div className="space-y-6">
        <Link href="/reports" className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
          <ChevronLeft className="w-3 h-3" /> Back to reports
        </Link>
        <Card glass><p className="text-xs" style={{ color: '#D94A4A' }}>Unknown report.</p></Card>
      </div>
    );
  }

  // Provenance: which live endpoints fed this report, and how many records.
  const provenance = useMemo(() => {
    const sourceMap: Record<string, { sources: string[]; count: number }> = {
      'member-health-by-type': { sources: ['/api/memtrak/members'], count: inputs?.organizations.length ?? 0 },
      'top-revenue-payers': { sources: ['/api/memtrak/invoices', '/api/memtrak/members'], count: inputs?.invoices.length ?? 0 },
      'engagement-distribution': { sources: ['/api/memtrak/members'], count: inputs?.organizations.length ?? 0 },
      'lapsing-renewals': { sources: ['/api/memtrak/members'], count: inputs?.organizations.length ?? 0 },
      'event-performance': { sources: ['/api/memtrak/connect-events'], count: inputs?.events.length ?? 0 },
      'geographic-concentration': { sources: ['/api/memtrak/members'], count: inputs?.organizations.length ?? 0 },
    };
    const entry = sourceMap[preset?.slug ?? ''] ?? { sources: ['/api/memtrak'], count: 0 };
    return { sources: entry.sources, recordCount: entry.count };
  }, [preset, inputs]);

  const exportCsv = () => {
    if (!result || !preset) return;
    const blob = new Blob([reportToCSV(result)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${preset.slug}-${todayIso()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printBranded = () => {
    if (!result || !preset) return;
    // Capture the on-screen chart canvas (if any) so the printed/exported report
    // carries the same visualization the user sees, not just the table.
    let chartImage: string | undefined;
    const canvas = chartWrapRef.current?.querySelector('canvas');
    if (canvas instanceof HTMLCanvasElement) {
      try { chartImage = canvas.toDataURL('image/png'); } catch { chartImage = undefined; }
    }
    printReport(preset, result, provenance, chartImage);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/reports" className="inline-flex items-center gap-1 text-xs no-print" style={{ color: 'var(--accent)' }}>
          <ChevronLeft className="w-3 h-3" /> Back to reports
        </Link>
        <div className="flex items-end justify-between gap-3 mt-2">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>{preset.title}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{preset.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button onClick={exportCsv} disabled={!result} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-50" style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button onClick={printBranded} disabled={!result} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-50" style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        </div>
      </div>

      {error && (
        <Card glass>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#D94A4A' }}>
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        </Card>
      )}

      {loading || !result ? (
        <SkeletonCard height={500} />
      ) : (
        <>
          {result.kpis && result.kpis.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
              {result.kpis.map((k) => (
                <Card key={k.label} glass>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{k.label}</div>
                  <div className="text-2xl font-extrabold tabular-nums mt-1" style={{ color: k.color ?? 'var(--heading)' }}>{k.value}</div>
                  {k.sub && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{k.sub}</div>}
                </Card>
              ))}
            </div>
          )}

          {result.chart && result.chart.kind !== 'none' && result.chart.points.length > 0 && (
            <div ref={chartWrapRef}>
            <Card glass title={result.chart.title}>
              {result.chart.kind === 'bar' && (
                <ClientChart
                  type="bar"
                  height={260}
                  data={{
                    labels: result.chart.points.map((p) => p.label),
                    datasets: [{
                      label: result.chart.title,
                      data: result.chart.points.map((p) => p.value),
                      backgroundColor: result.chart.points.map((p) => p.color ?? '#4A90D9'),
                      borderRadius: 6,
                    }],
                  }}
                  options={{
                    plugins: { legend: { display: false }, datalabels: { display: false } },
                    scales: {
                      y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
                      x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 10 } } },
                    },
                  }}
                />
              )}
              {result.chart.kind === 'horizontal-bar' && (
                <ClientChart
                  type="bar"
                  height={Math.max(180, result.chart.points.length * 28)}
                  data={{
                    labels: result.chart.points.map((p) => p.label),
                    datasets: [{
                      label: result.chart.title,
                      data: result.chart.points.map((p) => p.value),
                      backgroundColor: result.chart.points.map((p) => p.color ?? '#4A90D9'),
                      borderRadius: 6,
                    }],
                  }}
                  options={{
                    indexAxis: 'y' as const,
                    plugins: { legend: { display: false }, datalabels: { display: false } },
                    scales: {
                      x: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
                      y: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 10 } } },
                    },
                  }}
                />
              )}
              {result.chart.kind === 'pie' && (
                <ClientChart
                  type="pie"
                  height={240}
                  data={{
                    labels: result.chart.points.map((p) => p.label),
                    datasets: [{
                      data: result.chart.points.map((p) => p.value),
                      backgroundColor: result.chart.points.map((p) => p.color ?? '#4A90D9'),
                      borderWidth: 0,
                    }],
                  }}
                  options={{
                    plugins: {
                      legend: { display: true, position: 'right' as const, labels: { color: '#8899aa', font: { size: 10 }, padding: 12 } },
                      datalabels: { display: false },
                    },
                  }}
                />
              )}
            </Card>
            </div>
          )}

          <Card glass title="Detail" subtitle={`${result.rows.length} rows`} noPad>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'var(--table-header)', color: 'var(--text-muted)' }}>
                    {result.columns.map((c, i) => (
                      <th key={i} className={`px-3 py-2.5 font-semibold text-[10px] uppercase tracking-wider ${i === 0 ? 'text-left' : 'text-right'}`}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.length === 0 ? (
                    <tr><td colSpan={result.columns.length} className="px-3 py-6 text-center" style={{ color: 'var(--text-muted)' }}>No data.</td></tr>
                  ) : result.rows.map((row, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--card-border)' }}>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`px-3 py-2.5 ${cell.numeric ? 'text-right tabular-nums' : ''} ${cell.bold ? 'font-bold' : ''}`}
                          style={{ color: cell.bold ? 'var(--heading)' : j === 0 ? 'var(--heading)' : 'var(--text-muted)' }}
                        >
                          {cell.value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {result.note && (
            <p className="text-[10px] pt-2" style={{ color: 'var(--text-muted)' }}>{result.note}</p>
          )}
        </>
      )}
    </div>
  );
}
