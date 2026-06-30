'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ClientChart from '@/components/ClientChart';
import Card, { KpiCard } from '@/components/Card';
import { exportCSV } from '@/lib/export-utils';
import { Download, Calendar, Users, DollarSign, Clock, ExternalLink } from 'lucide-react';
import type { Organization } from '@/lib/member-data';

const C = { navy: '#1B3A5C', blue: '#4A90D9', green: '#8CC63F', red: '#D94A4A', orange: '#E8923F' };

const segments = [
  { type: 'ACA', name: 'Title Insurance Agents', count: 3208, avgDues: 1216, estRate: 85 },
  { type: 'REA', name: 'Real Estate Attorneys', count: 926, avgDues: 441, estRate: 82 },
  { type: 'ATXA', name: 'Texas Agents', count: 257, avgDues: 840, estRate: 78 },
  { type: 'ACB', name: 'Title Abstracters', count: 244, avgDues: 517, estRate: 80 },
  { type: 'AS', name: 'Associates', count: 229, avgDues: 777, estRate: 75 },
  { type: 'ACU', name: 'Underwriters', count: 40, avgDues: 61554, estRate: 98 },
  { type: 'REB', name: 'RE Attorneys (non-Agent)', count: 41, avgDues: 461, estRate: 72 },
];

const timeline = [
  { month: 'Aug', action: 'Pre-renewal awareness — early bird messaging', target: 'All', status: 'Planned' },
  { month: 'Sep', action: 'Renewal notice #1 — standard renewal email', target: 'All', status: 'Planned' },
  { month: 'Oct', action: 'ACU white-glove outreach — CEO personal calls', target: 'ACU (40)', status: 'Planned' },
  { month: 'Oct', action: 'Renewal reminder #2 — non-responders', target: 'Non-responders', status: 'Planned' },
  { month: 'Nov', action: 'Final notice — urgency messaging', target: 'Non-renewed', status: 'Planned' },
  { month: 'Dec', action: 'Lapsed member re-engagement', target: 'Non-renewed', status: 'Planned' },
];

const expectedRevenue = segments.reduce((s, r) => s + Math.round(r.count * r.estRate / 100) * r.avgDues, 0);

const isoOffset = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export default function Renewals() {
  const [upcoming, setUpcoming] = useState<Organization[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  useEffect(() => {
    const from = isoOffset(0);
    const to = isoOffset(90);
    fetch(`/api/memtrak/members?renewal_from=${from}&renewal_to=${to}&pageSize=100&sort=renewal_date&order=asc`)
      .then((r) => r.json())
      .then((d: { rows: Organization[] }) => setUpcoming(d.rows ?? []))
      .catch(() => setUpcoming([]))
      .finally(() => setUpcomingLoading(false));
  }, []);

  const upcomingDues = upcoming.reduce((s, o) => s + (o.annual_dues ?? 0), 0);
  const upcomingAtRisk = upcoming.filter((o) => (o.churn_risk ?? 0) >= 50).length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>Renewal Season Campaign</h1>
        <button onClick={() => exportCSV(['Type', 'Name', 'Members', 'Avg Dues', 'Est Rate', 'Expected Renewals', 'Expected Revenue'], segments.map(s => [s.type, s.name, s.count, s.avgDues, s.estRate + '%', Math.round(s.count * s.estRate / 100), Math.round(s.count * s.estRate / 100) * s.avgDues]), 'MEMTrak_Renewal_Plan')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#8CC63F] hover:bg-[#6fa030]"><Download className="w-3 h-3" /> Export Plan</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6 stagger-children">
        <KpiCard
          label="Members to Renew"
          value="4,994"
          icon={Users}
          detail={
            <div className="space-y-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>Total members eligible for 2026 renewal across all 7 membership segments.</p>
              <div className="space-y-1.5">
                {segments.map(s => (
                  <div key={s.type} className="flex justify-between">
                    <span>{s.type} — {s.name}</span>
                    <span className="font-bold" style={{ color: 'var(--heading)' }}>{s.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <p className="pt-2" style={{ color: 'var(--text-muted)' }}>ACA members represent 64% of total renewals and are the primary volume driver.</p>
            </div>
          }
        />
        <KpiCard
          label="Expected Revenue"
          value={`$${(expectedRevenue / 1e6).toFixed(1)}M`}
          icon={DollarSign}
          color="#8CC63F"
          detail={
            <div className="space-y-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>Projected revenue based on estimated renewal rates and average dues per segment.</p>
              <div className="space-y-1.5">
                {segments.map(s => {
                  const exp = Math.round(s.count * s.estRate / 100);
                  const rev = exp * s.avgDues;
                  return (
                    <div key={s.type} className="flex justify-between">
                      <span>{s.type} ({s.estRate}% rate)</span>
                      <span className="font-bold text-green-400">${rev >= 1e6 ? (rev / 1e6).toFixed(2) + 'M' : (rev / 1e3).toFixed(0) + 'K'}</span>
                    </div>
                  );
                })}
              </div>
              <p className="pt-2">ACU underwriters contribute the most revenue per member ($61,554 avg dues) despite having only 40 members.</p>
            </div>
          }
        />
        <KpiCard
          label="Campaign Window"
          value="Aug–Dec"
          icon={Calendar}
          color="#4A90D9"
          detail={
            <div className="space-y-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>The 2026 renewal campaign runs August through December with 6 planned touchpoints.</p>
              <div className="space-y-2">
                {timeline.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="font-bold w-8" style={{ color: 'var(--heading)' }}>{t.month}</span>
                    <span>{t.action}</span>
                  </div>
                ))}
              </div>
              <p className="pt-2">Early-bird messaging in August sets the stage for the primary renewal push in September/October.</p>
            </div>
          }
        />
      </div>

      {/* Renewals Due — Next 90 Days (live) */}
      <Card
        title="Renewals Due — Next 90 Days"
        className="mb-6"
        detailTitle="Upcoming Renewals — Detail"
        detailContent={
          <div className="space-y-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <p>{upcoming.length} member organizations have renewal dates in the next 90 days, representing <span className="font-bold" style={{ color: 'var(--heading)' }}>${upcomingDues.toLocaleString()}</span> in dues. {upcomingAtRisk > 0 && <span><strong style={{ color: '#D94A4A' }}>{upcomingAtRisk} are at-risk (churn ≥ 50)</strong> — prioritize for outreach.</span>}</p>
            <div className="space-y-1.5">
              {upcoming.slice(0, 25).map((o) => (
                <div key={o.id} className="flex justify-between gap-3 p-2 rounded-md" style={{ background: 'var(--input-bg)' }}>
                  <span style={{ color: 'var(--heading)' }}>{o.org_name}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{o.org_type} · churn {o.churn_risk}</span>
                  <span className="font-semibold tabular-nums" style={{ color: 'var(--heading)' }}>{o.renewal_date}</span>
                  <span className="font-semibold tabular-nums" style={{ color: '#8CC63F' }}>${o.annual_dues.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
            <Clock className="w-4 h-4 mx-auto mb-1" style={{ color: '#4A90D9' }} />
            <div className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--heading)' }}>{upcomingLoading ? '…' : upcoming.length}</div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Members due</div>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
            <DollarSign className="w-4 h-4 mx-auto mb-1" style={{ color: '#8CC63F' }} />
            <div className="text-xl font-extrabold tabular-nums" style={{ color: 'var(--heading)' }}>{upcomingLoading ? '…' : `$${(upcomingDues / 1000).toFixed(0)}K`}</div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Dues at stake</div>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
            <Users className="w-4 h-4 mx-auto mb-1" style={{ color: upcomingAtRisk > 0 ? '#D94A4A' : '#8CC63F' }} />
            <div className="text-xl font-extrabold tabular-nums" style={{ color: upcomingAtRisk > 0 ? '#D94A4A' : 'var(--heading)' }}>{upcomingLoading ? '…' : upcomingAtRisk}</div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>At-risk renewals</div>
          </div>
        </div>
        {!upcomingLoading && upcoming.length > 0 && (
          <div className="space-y-1.5">
            {upcoming.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                href={`/member-360?id=${encodeURIComponent(o.id)}`}
                className="flex items-center justify-between gap-3 p-2.5 rounded-md transition-all hover:translate-x-0.5"
                style={{ background: 'var(--input-bg)' }}
              >
                <span className="text-xs font-bold flex-1 min-w-0 truncate" style={{ color: 'var(--heading)' }}>{o.org_name}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{o.org_type}</span>
                <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--text-muted)' }}>{o.renewal_date}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: '#8CC63F' }}>${o.annual_dues.toLocaleString()}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
              </Link>
            ))}
            {upcoming.length > 5 && (
              <div className="text-[10px] text-center pt-1" style={{ color: 'var(--text-muted)' }}>
                + {upcoming.length - 5} more — open detail to see full list
              </div>
            )}
          </div>
        )}
        {!upcomingLoading && upcoming.length === 0 && (
          <div className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>
            No renewals coming due in the next 90 days.
          </div>
        )}
      </Card>

      {/* Segment Table */}
      <Card
        title="Renewal Projections by Segment"
        className="mb-6 overflow-x-auto"
        detailTitle="Segment Risk Analysis"
        detailContent={
          <div className="space-y-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <p>Per-segment risk analysis based on historical renewal rates, revenue impact, and engagement trends.</p>
            {segments.map(s => {
              const exp = Math.round(s.count * s.estRate / 100);
              const atRisk = s.count - exp;
              const riskLevel = s.estRate >= 90 ? 'Low' : s.estRate >= 80 ? 'Medium' : 'High';
              const riskColor = s.estRate >= 90 ? 'text-green-400' : s.estRate >= 80 ? 'text-blue-400' : 'text-amber-400';
              return (
                <div key={s.type} className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold" style={{ color: 'var(--heading)' }}>{s.type} — {s.name}</span>
                    <span className={`font-bold ${riskColor}`}>{riskLevel} Risk</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Members</div>
                      <div className="font-bold" style={{ color: 'var(--heading)' }}>{s.count.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Est. Renewals</div>
                      <div className="font-bold" style={{ color: 'var(--heading)' }}>{exp.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>At-Risk</div>
                      <div className="font-bold text-amber-400">{atRisk.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Revenue at Risk</div>
                      <div className="font-bold text-red-400">${(atRisk * s.avgDues).toLocaleString()}</div>
                    </div>
                  </div>
                  {s.estRate < 80 && (
                    <div className="mt-2 text-[10px] text-amber-400">
                      Recommendation: Targeted outreach and personalized value-prop messaging for this segment.
                    </div>
                  )}
                </div>
              );
            })}
            <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="font-bold mb-1" style={{ color: 'var(--heading)' }}>Total Revenue at Risk</div>
              <div className="text-lg font-extrabold text-red-400">
                ${segments.reduce((sum, s) => sum + (s.count - Math.round(s.count * s.estRate / 100)) * s.avgDues, 0).toLocaleString()}
              </div>
            </div>
          </div>
        }
      >
        <table className="w-full text-xs">
          <thead><tr className="text-[10px] uppercase" style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
            <th className="text-left pb-2">Type</th><th className="text-left pb-2">Name</th><th className="text-right pb-2">Members</th><th className="text-right pb-2">Avg Dues</th><th className="text-right pb-2">Est. Rate</th><th className="text-right pb-2">Expected</th><th className="text-right pb-2">Revenue</th>
          </tr></thead>
          <tbody>
            {segments.map(s => {
              const exp = Math.round(s.count * s.estRate / 100);
              return (
                <tr key={s.type} style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
                  <td className="py-2 font-bold" style={{ color: 'var(--heading)' }}>{s.type}</td>
                  <td className="py-2">{s.name}</td>
                  <td className="py-2 text-right">{s.count.toLocaleString()}</td>
                  <td className="py-2 text-right">${s.avgDues.toLocaleString()}</td>
                  <td className="py-2 text-right"><span className={`font-bold ${s.estRate >= 90 ? 'text-green-400' : s.estRate >= 80 ? 'text-blue-400' : 'text-amber-400'}`}>{s.estRate}%</span></td>
                  <td className="py-2 text-right">{exp.toLocaleString()}</td>
                  <td className="py-2 text-right text-green-400 font-bold">${(exp * s.avgDues).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Revenue chart */}
      <Card title="Expected Revenue by Segment" className="mb-6">
        <ClientChart type="bar" height={260} data={{ labels: segments.map(s => s.type), datasets: [{ label: 'Expected Revenue', data: segments.map(s => Math.round(s.count * s.estRate / 100) * s.avgDues), backgroundColor: segments.map((_, i) => [C.navy, C.blue, C.green, C.orange, C.red, '#8CC63F', '#6ba8e8'][i]), borderRadius: 6 }] }} options={{ plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: '#e2e8f0', font: { weight: 'bold' as const, size: 9 }, formatter: (v: number) => v >= 1e6 ? '$' + (v / 1e6).toFixed(1) + 'M' : '$' + (v / 1e3).toFixed(0) + 'K' } }, scales: { y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => '$' + (v / 1e6).toFixed(1) + 'M' } }, x: { grid: { display: false }, ticks: { color: '#8899aa' } } } }} />
      </Card>

      {/* Campaign Timeline */}
      <Card
        title="Outreach Timeline"
        detailTitle="Campaign Timeline Details"
        detailContent={
          <div className="space-y-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <p>Detailed breakdown of each campaign touchpoint, expected impact, and channel strategy.</p>
            {timeline.map((t, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-bold" style={{ color: '#8CC63F' }}>{t.month}</span>
                  <span className="font-bold" style={{ color: 'var(--heading)' }}>{t.action}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><span style={{ color: 'var(--text-muted)' }}>Target: </span><span style={{ color: 'var(--heading)' }}>{t.target}</span></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Status: </span><span className="text-blue-400 font-semibold">{t.status}</span></div>
                </div>
                <div className="mt-1" style={{ color: 'var(--text-muted)' }}>
                  {i === 0 && 'Channel: Email + social media teasers. Sets context for renewal season.'}
                  {i === 1 && 'Channel: Email (primary), postal mail for ACU. Standard renewal with payment link.'}
                  {i === 2 && 'Channel: CEO phone calls + personal emails. High-value retention critical.'}
                  {i === 3 && 'Channel: Email with urgency framing. Segment by engagement level.'}
                  {i === 4 && 'Channel: Email + phone for high-value. Last chance messaging with lapse consequences.'}
                  {i === 5 && 'Channel: Win-back email + staff outreach. Offer assistance with any barriers.'}
                </div>
              </div>
            ))}
            <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="font-bold mb-1" style={{ color: 'var(--heading)' }}>Success Metrics</div>
              <ul className="space-y-1 list-disc list-inside" style={{ color: 'var(--text-muted)' }}>
                <li>Overall renewal rate target: 84% (up from 82%)</li>
                <li>ACU retention target: 98% (white-glove outreach)</li>
                <li>Lapsed member recovery target: 15% of non-renewed</li>
              </ul>
            </div>
          </div>
        }
      >
        <div className="space-y-2">
          {timeline.map((t, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <span className="text-xs font-bold text-[#8CC63F] w-10">{t.month}</span>
              <div className="flex-1">
                <div className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{t.action}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target: {t.target}</div>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">{t.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
