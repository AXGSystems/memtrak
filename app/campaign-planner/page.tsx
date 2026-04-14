'use client';

import { useState, useMemo } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  Calendar,
  Send,
  TrendingUp,
  Users,
  AlertTriangle,
  Flag,
  ChevronRight,
  X,
  Clock,
  Target,
  Zap,
  Star,
  BarChart3,
} from 'lucide-react';

/* ── Brand Colors ─────────────────────────────────────────── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  gray: '#6b7f96',
  teal: '#14b8a6',
};

const TYPE_COLORS: Record<string, string> = {
  Compliance: C.red,
  Renewal: C.blue,
  Events: C.green,
  Newsletter: C.gray,
  Onboarding: C.teal,
  Advocacy: C.purple,
  Retention: C.orange,
};

/* ── Campaign Data ────────────────────────────────────────── */
interface PlannedCampaign {
  id: string;
  name: string;
  type: string;
  startMonth: number; // 4=Apr ... 12=Dec
  startDay: number;
  durationDays: number;
  audience: number;
  status: 'Planned' | 'Confirmed' | 'Draft';
  description: string;
  owner: string;
  expectedOpenRate: number;
  expectedRevenue: number;
}

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_OFFSETS: Record<number, number> = { 4: 0, 5: 1, 6: 2, 7: 3, 8: 4, 9: 5, 10: 6, 11: 7, 12: 8 };

const campaigns: PlannedCampaign[] = [
  { id: 'c1', name: 'PFL Compliance - May Wave', type: 'Compliance', startMonth: 5, startDay: 5, durationDays: 14, audience: 3200, status: 'Confirmed', description: 'Producer Filing Library compliance notices for IL-focused members.', owner: 'Taylor Spolidoro', expectedOpenRate: 35, expectedRevenue: 2800 },
  { id: 'c2', name: 'Membership Renewal - Q2', type: 'Renewal', startMonth: 5, startDay: 15, durationDays: 21, audience: 1850, status: 'Confirmed', description: 'Quarterly renewal batch for members expiring Jun-Aug.', owner: 'Caroline Ehrenfeld', expectedOpenRate: 72, expectedRevenue: 485000 },
  { id: 'c3', name: 'ALTA ONE Early Registration', type: 'Events', startMonth: 4, startDay: 14, durationDays: 30, audience: 4994, status: 'Confirmed', description: 'Early bird pricing push for ALTA ONE 2026 conference.', owner: 'Emily Mincey', expectedOpenRate: 52, expectedRevenue: 162000 },
  { id: 'c4', name: 'Title News Weekly', type: 'Newsletter', startMonth: 4, startDay: 7, durationDays: 270, audience: 4840, status: 'Confirmed', description: 'Ongoing weekly newsletter. Runs every Friday through December.', owner: 'Paul Martin', expectedOpenRate: 42, expectedRevenue: 0 },
  { id: 'c5', name: 'TIPAC Summer Drive', type: 'Advocacy', startMonth: 6, startDay: 1, durationDays: 21, audience: 2100, status: 'Planned', description: 'TIPAC political action committee fundraising push.', owner: 'Chris Morton', expectedOpenRate: 55, expectedRevenue: 95000 },
  { id: 'c6', name: 'New Member Welcome Series', type: 'Onboarding', startMonth: 4, startDay: 1, durationDays: 270, audience: 120, status: 'Confirmed', description: 'Automated 5-email welcome drip for all new joins.', owner: 'Taylor Spolidoro', expectedOpenRate: 80, expectedRevenue: 0 },
  { id: 'c7', name: 'Renewal Season Kickoff', type: 'Renewal', startMonth: 8, startDay: 1, durationDays: 14, audience: 4200, status: 'Planned', description: 'Annual renewal season launch. Multi-touch sequence.', owner: 'Caroline Ehrenfeld', expectedOpenRate: 68, expectedRevenue: 1200000 },
  { id: 'c8', name: 'ALTA ONE Countdown', type: 'Events', startMonth: 9, startDay: 15, durationDays: 30, audience: 4994, status: 'Planned', description: 'Final registration push with countdown to ALTA ONE.', owner: 'Emily Mincey', expectedOpenRate: 48, expectedRevenue: 340000 },
  { id: 'c9', name: 'ACU Retention Check-in', type: 'Retention', startMonth: 7, startDay: 1, durationDays: 7, audience: 42, status: 'Planned', description: 'Personalized outreach to underwriter contacts.', owner: 'Chris Morton', expectedOpenRate: 90, expectedRevenue: 0 },
  { id: 'c10', name: 'Year-End Compliance Push', type: 'Compliance', startMonth: 11, startDay: 1, durationDays: 30, audience: 3800, status: 'Draft', description: 'Final compliance reminder before year-end deadline.', owner: 'Taylor Spolidoro', expectedOpenRate: 38, expectedRevenue: 4200 },
  { id: 'c11', name: 'Holiday Giving Campaign', type: 'Advocacy', startMonth: 12, startDay: 1, durationDays: 21, audience: 4994, status: 'Draft', description: 'End-of-year TIPAC and charitable giving appeals.', owner: 'Chris Morton', expectedOpenRate: 30, expectedRevenue: 45000 },
  { id: 'c12', name: 'State Legislation Alert', type: 'Compliance', startMonth: 6, startDay: 15, durationDays: 7, audience: 2800, status: 'Planned', description: 'Urgent regulatory update for TX, FL, and CA markets.', owner: 'Paul Martin', expectedOpenRate: 55, expectedRevenue: 0 },
];

/* ── Milestones ───────────────────────────────────────────── */
const milestones = [
  { label: 'ALTA ONE', month: 10, day: 15, color: C.green, icon: Star },
  { label: 'Renewal Season Start', month: 8, day: 1, color: C.blue, icon: Flag },
  { label: 'Year End', month: 12, day: 31, color: C.red, icon: Clock },
];

/* ── Collision detection ──────────────────────────────────── */
function detectCollisions(campaigns: PlannedCampaign[]) {
  const collisions: { a: string; b: string; overlapDays: number }[] = [];
  for (let i = 0; i < campaigns.length; i++) {
    for (let j = i + 1; j < campaigns.length; j++) {
      const a = campaigns[i];
      const b = campaigns[j];
      if (a.audience < 1000 || b.audience < 1000) continue; // skip small targeted sends
      const aStart = (a.startMonth - 4) * 30 + a.startDay;
      const aEnd = aStart + a.durationDays;
      const bStart = (b.startMonth - 4) * 30 + b.startDay;
      const bEnd = bStart + b.durationDays;
      const overlap = Math.min(aEnd, bEnd) - Math.max(aStart, bStart);
      if (overlap > 0 && a.type !== 'Newsletter' && b.type !== 'Newsletter' && a.type !== 'Onboarding' && b.type !== 'Onboarding') {
        collisions.push({ a: a.name, b: b.name, overlapDays: overlap });
      }
    }
  }
  return collisions;
}

export default function CampaignPlanner() {
  const [selectedCampaign, setSelectedCampaign] = useState<PlannedCampaign | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const filteredCampaigns = typeFilter ? campaigns.filter((c) => c.type === typeFilter) : campaigns;
  const collisions = useMemo(() => detectCollisions(campaigns), []);

  /* Monthly send volumes */
  const monthlyVolumes = MONTHS.map((_, i) => {
    const monthNum = i + 4;
    return campaigns
      .filter((c) => {
        const cStart = c.startMonth;
        const cEndMonth = c.startMonth + Math.floor(c.durationDays / 30);
        return monthNum >= cStart && monthNum <= cEndMonth;
      })
      .reduce((sum, c) => sum + Math.round(c.audience / Math.max(1, Math.ceil(c.durationDays / 30))), 0);
  });

  const peakMonth = MONTHS[monthlyVolumes.indexOf(Math.max(...monthlyVolumes))];
  const totalSendsQuarter = monthlyVolumes.slice(0, 3).reduce((s, v) => s + v, 0);
  const uniqueAudience = new Set(campaigns.flatMap((c) => [c.audience]));
  const totalAudienceCoverage = Math.min(4994, campaigns.reduce((s, c) => s + c.audience, 0));

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(74,144,217,0.2) 0%, rgba(140,198,63,0.2) 100%)',
              border: '1px solid rgba(74,144,217,0.3)',
            }}
          >
            <Calendar className="w-5 h-5" style={{ color: C.blue }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              CampaignPlanner<span style={{ color: C.blue, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.blue }}>
              Plan your quarter. Visualize every send.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Visual campaign timeline spanning April through December 2026. See every planned send on a Gantt-style
          view, identify audience collisions, and ensure your communication cadence aligns with major milestones.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Campaigns Planned"
          value={campaigns.length}
          sub={`${campaigns.filter((c) => c.status === 'Confirmed').length} confirmed`}
          icon={Calendar}
          color={C.blue}
          sparkData={[5, 6, 7, 8, 9, 10, 12]}
          sparkColor={C.blue}
          trend={{ value: 20, label: 'vs last year' }}
          accent
        />
        <SparkKpi
          label="Sends This Quarter"
          value={totalSendsQuarter.toLocaleString()}
          sub="Apr - Jun projected"
          icon={Send}
          color={C.green}
          sparkData={[8200, 9100, 10400, 11200, 12800, 14100, totalSendsQuarter]}
          sparkColor={C.green}
          trend={{ value: 15.2, label: 'vs Q1' }}
          accent
        />
        <SparkKpi
          label="Peak Month"
          value={peakMonth}
          sub={`${Math.max(...monthlyVolumes).toLocaleString()} sends`}
          icon={TrendingUp}
          color={C.orange}
          sparkData={monthlyVolumes.slice(0, 7)}
          sparkColor={C.orange}
          accent
        />
        <SparkKpi
          label="Audience Coverage"
          value={`${Math.round((totalAudienceCoverage / 4994) * 100)}%`}
          sub="Of total membership"
          icon={Users}
          color={C.purple}
          sparkData={[60, 65, 70, 75, 82, 88, Math.round((totalAudienceCoverage / 4994) * 100)]}
          sparkColor={C.purple}
          trend={{ value: 8.0, label: 'expanding reach' }}
          accent
        />
      </div>

      {/* ── 3. Type filter chips ──────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Filter:</span>
        <button
          onClick={() => setTypeFilter(null)}
          className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
          style={{
            background: !typeFilter ? 'var(--accent)' : 'var(--input-bg)',
            color: !typeFilter ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${!typeFilter ? 'var(--accent)' : 'var(--card-border)'}`,
          }}
        >
          All
        </button>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <button
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? null : type)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
            style={{
              background: typeFilter === type ? color : 'var(--input-bg)',
              color: typeFilter === type ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${typeFilter === type ? color : 'var(--card-border)'}`,
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: typeFilter === type ? '#fff' : color }} />
            {type}
          </button>
        ))}
      </div>

      {/* ── 4. Gantt Timeline ─────────────────────────────────── */}
      <Card title="Campaign Timeline" subtitle="April - December 2026" className="mb-6">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 900 }}>
            {/* Month headers */}
            <div className="flex border-b" style={{ borderColor: 'var(--card-border)' }}>
              <div className="w-48 flex-shrink-0 p-2 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Campaign
              </div>
              <div className="flex-1 flex">
                {MONTHS.map((m, i) => (
                  <div
                    key={m}
                    className="flex-1 text-center p-2 text-[9px] font-bold uppercase tracking-wider border-l"
                    style={{ color: 'var(--text-muted)', borderColor: 'var(--card-border)' }}
                  >
                    {m}
                    {/* Milestone markers */}
                    {milestones.filter((ms) => ms.month === i + 4).map((ms) => (
                      <div key={ms.label} className="flex items-center justify-center gap-0.5 mt-0.5">
                        <ms.icon className="w-2.5 h-2.5" style={{ color: ms.color }} />
                        <span className="text-[7px] font-bold" style={{ color: ms.color }}>{ms.label}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign rows */}
            {filteredCampaigns.map((campaign) => {
              const color = TYPE_COLORS[campaign.type] || C.gray;
              const totalMonths = 9; // Apr-Dec
              const startPct = ((campaign.startMonth - 4) * 30 + campaign.startDay) / (totalMonths * 30) * 100;
              const widthPct = (campaign.durationDays / (totalMonths * 30)) * 100;

              return (
                <div
                  key={campaign.id}
                  className="flex border-b transition-colors cursor-pointer"
                  style={{ borderColor: 'var(--card-border)' }}
                  onClick={() => setSelectedCampaign(campaign)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--input-bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="w-48 flex-shrink-0 p-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold truncate" style={{ color: 'var(--heading)' }}>{campaign.name}</div>
                      <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                        {campaign.audience.toLocaleString()} recipients
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 relative py-2">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {MONTHS.map((_, i) => (
                        <div key={i} className="flex-1 border-l" style={{ borderColor: 'var(--card-border)' }} />
                      ))}
                    </div>
                    {/* Bar */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 rounded-full flex items-center px-2"
                      style={{
                        left: `${startPct}%`,
                        width: `${Math.max(widthPct, 2)}%`,
                        height: 20,
                        background: `${color}30`,
                        border: `1.5px solid ${color}`,
                        boxShadow: `0 0 8px ${color}20`,
                      }}
                    >
                      <span className="text-[7px] font-bold truncate" style={{ color }}>
                        {campaign.durationDays <= 14 ? '' : campaign.name.split(' - ')[0].slice(0, 15)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Milestone lines (vertical) overlaid */}
          </div>
        </div>
      </Card>

      {/* ── 5. Collisions + Monthly volume ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Collision Warnings */}
        <Card title="Collision Warnings" subtitle={`${collisions.length} audience overlaps detected`}>
          {collisions.length === 0 ? (
            <div className="text-center py-6">
              <Zap className="w-6 h-6 mx-auto mb-2" style={{ color: C.green }} />
              <p className="text-xs font-bold" style={{ color: C.green }}>No collisions detected!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collisions.map((col, i) => (
                <div
                  key={i}
                  className="rounded-lg border p-3"
                  style={{
                    background: 'rgba(232,146,63,0.04)',
                    borderColor: 'rgba(232,146,63,0.2)',
                    borderLeftWidth: '3px',
                    borderLeftColor: C.orange,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: C.orange }} />
                    <div>
                      <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>
                        {col.overlapDays}-day overlap
                      </div>
                      <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: C.orange }}>{col.a}</span> overlaps with <span style={{ color: C.orange }}>{col.b}</span>
                      </div>
                      <div className="text-[9px] mt-1" style={{ color: C.amber }}>
                        Risk: Audience fatigue from concurrent sends to overlapping lists.
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Monthly Send Volume */}
        <Card title="Monthly Send Volume" subtitle="Projected sends per month">
          <ClientChart
            type="bar"
            height={240}
            data={{
              labels: MONTHS,
              datasets: [
                {
                  label: 'Send Volume',
                  data: monthlyVolumes,
                  backgroundColor: MONTHS.map((_, i) => {
                    const vol = monthlyVolumes[i];
                    const maxVol = Math.max(...monthlyVolumes);
                    return vol === maxVol ? C.orange + '80' : C.blue + '60';
                  }),
                  borderColor: MONTHS.map((_, i) => {
                    const vol = monthlyVolumes[i];
                    const maxVol = Math.max(...monthlyVolumes);
                    return vol === maxVol ? C.orange : C.blue;
                  }),
                  borderWidth: 2,
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              plugins: {
                legend: { display: false },
                datalabels: {
                  display: true,
                  anchor: 'end' as const,
                  align: 'end' as const,
                  color: '#8899aa',
                  font: { weight: 'bold' as const, size: 9 },
                  formatter: (v: number) => v > 0 ? v.toLocaleString() : '',
                },
              },
              scales: {
                y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
                x: { grid: { display: false }, ticks: { color: '#8899aa' } },
              },
            }}
          />
        </Card>
      </div>

      {/* ── 6. Campaign List Table ────────────────────────────── */}
      <Card title="All Planned Campaigns" subtitle={`${campaigns.length} campaigns across ${Object.keys(TYPE_COLORS).length} categories`} className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--card-border)' }}>
                {['Campaign', 'Type', 'Status', 'Start', 'Duration', 'Audience', 'Exp. Open Rate', 'Revenue', ''].map((h) => (
                  <th key={h} className="text-left py-2 px-2 uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const color = TYPE_COLORS[c.type] || C.gray;
                const statusColors: Record<string, { bg: string; text: string }> = {
                  Confirmed: { bg: 'rgba(140,198,63,0.15)', text: C.green },
                  Planned: { bg: 'rgba(74,144,217,0.15)', text: C.blue },
                  Draft: { bg: 'var(--input-bg)', text: 'var(--text-muted)' },
                };
                const sc = statusColors[c.status] || statusColors.Draft;

                return (
                  <tr
                    key={c.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--card-border)' }}
                    onClick={() => setSelectedCampaign(c)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--input-bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="font-bold" style={{ color: 'var(--heading)' }}>{c.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: `${color}15`, color }}>
                        {c.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ background: sc.bg, color: sc.text }}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2" style={{ color: 'var(--text-muted)' }}>
                      {MONTHS[c.startMonth - 4]} {c.startDay}
                    </td>
                    <td className="py-2.5 px-2" style={{ color: 'var(--text-muted)' }}>
                      {c.durationDays}d
                    </td>
                    <td className="py-2.5 px-2 font-bold" style={{ color: 'var(--heading)' }}>
                      {c.audience.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2" style={{ color: c.expectedOpenRate >= 60 ? C.green : c.expectedOpenRate >= 40 ? C.amber : C.red }}>
                      {c.expectedOpenRate}%
                    </td>
                    <td className="py-2.5 px-2 font-bold" style={{ color: c.expectedRevenue > 0 ? C.green : 'var(--text-muted)' }}>
                      {c.expectedRevenue > 0 ? `$${c.expectedRevenue.toLocaleString()}` : '--'}
                    </td>
                    <td className="py-2.5 px-2">
                      <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Detail Modal ──────────────────────────────────────── */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedCampaign(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedCampaign.name}</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Campaign Details</p>
              </div>
              <button onClick={() => setSelectedCampaign(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Type + Status */}
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: `${TYPE_COLORS[selectedCampaign.type]}15`, color: TYPE_COLORS[selectedCampaign.type] }}>
                  {selectedCampaign.type}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: selectedCampaign.status === 'Confirmed' ? 'rgba(140,198,63,0.15)' : selectedCampaign.status === 'Planned' ? 'rgba(74,144,217,0.15)' : 'var(--input-bg)',
                    color: selectedCampaign.status === 'Confirmed' ? C.green : selectedCampaign.status === 'Planned' ? C.blue : 'var(--text-muted)',
                  }}
                >
                  {selectedCampaign.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {selectedCampaign.description}
              </p>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Start Date', value: `${MONTHS[selectedCampaign.startMonth - 4]} ${selectedCampaign.startDay}, 2026`, color: 'var(--heading)' },
                  { label: 'Duration', value: `${selectedCampaign.durationDays} days`, color: 'var(--heading)' },
                  { label: 'Audience Size', value: selectedCampaign.audience.toLocaleString(), color: C.blue },
                  { label: 'Owner', value: selectedCampaign.owner, color: 'var(--heading)' },
                  { label: 'Expected Open Rate', value: `${selectedCampaign.expectedOpenRate}%`, color: selectedCampaign.expectedOpenRate >= 60 ? C.green : C.amber },
                  { label: 'Expected Revenue', value: selectedCampaign.expectedRevenue > 0 ? `$${selectedCampaign.expectedRevenue.toLocaleString()}` : 'N/A', color: selectedCampaign.expectedRevenue > 0 ? C.green : 'var(--text-muted)' },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                    <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                    <div className="text-sm font-extrabold mt-0.5" style={{ color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Related collisions */}
              {collisions.filter((c) => c.a === selectedCampaign.name || c.b === selectedCampaign.name).length > 0 && (
                <div className="rounded-lg border p-3" style={{ borderColor: 'rgba(232,146,63,0.3)', background: 'rgba(232,146,63,0.04)' }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" style={{ color: C.orange }} />
                    <span className="text-[10px] font-bold" style={{ color: C.orange }}>Collision Warnings</span>
                  </div>
                  {collisions
                    .filter((c) => c.a === selectedCampaign.name || c.b === selectedCampaign.name)
                    .map((c, i) => (
                      <div key={i} className="text-[10px] py-1" style={{ color: 'var(--text-muted)' }}>
                        Overlaps <span style={{ color: 'var(--heading)' }}>{c.a === selectedCampaign.name ? c.b : c.a}</span> by {c.overlapDays} days
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(74,144,217,0.08)',
            color: C.blue,
            border: '1px solid rgba(74,144,217,0.15)',
          }}
        >
          <Calendar className="w-3 h-3" />
          CampaignPlanner&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
