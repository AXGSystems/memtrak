'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  Radio,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  FileText,
  Layers,
  DollarSign,
  Users,
  Zap,
  BarChart3,
  X,
} from 'lucide-react';

const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  teal: '#14b8a6',
  pink: '#ec4899',
};

/* ── Channel performance data ────────────────────────────── */
const channels = [
  {
    name: 'Email',
    icon: Mail,
    color: C.blue,
    metrics: [
      { label: 'Open Rate', value: '40.4%' },
      { label: 'Click Rate', value: '12.6%' },
      { label: 'Revenue', value: '$673K' },
    ],
    sparkData: [32, 34, 36, 38, 39, 40, 40.4],
    trend: { value: 3.8, label: 'vs last quarter' },
    share: 52,
    roi: 42,
  },
  {
    name: 'Phone',
    icon: Phone,
    color: C.green,
    metrics: [
      { label: 'Contact Rate', value: '62%' },
      { label: 'Meeting Scheduled', value: '34%' },
      { label: 'Revenue Impact', value: '$128K' },
    ],
    sparkData: [55, 56, 58, 59, 60, 61, 62],
    trend: { value: 5.2, label: 'vs last quarter' },
    share: 18,
    roi: 28,
  },
  {
    name: 'Events',
    icon: Calendar,
    color: C.purple,
    metrics: [
      { label: 'Attendance', value: '2,840' },
      { label: 'Engagement Lift', value: '+24%' },
      { label: 'Revenue', value: '$196K' },
    ],
    sparkData: [2100, 2200, 2400, 2500, 2650, 2750, 2840],
    trend: { value: 8.4, label: 'vs last quarter' },
    share: 16,
    roi: 35,
  },
  {
    name: 'Community',
    icon: MessageSquare,
    color: C.teal,
    metrics: [
      { label: 'Post Rate', value: '8%' },
      { label: 'Reply Rate', value: '22%' },
      { label: 'Platform', value: 'Higher Logic' },
    ],
    sparkData: [5, 5.5, 6, 6.5, 7, 7.5, 8],
    trend: { value: 12.0, label: 'vs last quarter' },
    share: 8,
    roi: 18,
  },
  {
    name: 'Direct Mail',
    icon: FileText,
    color: C.orange,
    metrics: [
      { label: 'Response Rate', value: '3.2%' },
      { label: 'Cost/Response', value: '$18' },
      { label: 'Reach', value: '4,200' },
    ],
    sparkData: [2.8, 2.9, 3.0, 3.0, 3.1, 3.1, 3.2],
    trend: { value: -1.2, label: 'vs last quarter' },
    share: 6,
    roi: 8,
  },
];

/* ── Engagement share doughnut ───────────────────────────── */
const engagementShareData = {
  labels: channels.map((c) => c.name),
  datasets: [
    {
      data: channels.map((c) => c.share),
      backgroundColor: channels.map((c) => c.color),
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
};

/* ── Channel ROI comparison ──────────────────────────────── */
const roiData = {
  labels: channels.map((c) => c.name),
  datasets: [
    {
      label: 'ROI Score',
      data: channels.map((c) => c.roi),
      backgroundColor: channels.map((c) => `color-mix(in srgb, ${c.color} 70%, transparent)`),
      borderColor: channels.map((c) => c.color),
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
};

const roiOptions = {
  indexAxis: 'y' as const,
  scales: {
    x: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
    y: { grid: { display: false }, ticks: { color: '#8899aa', font: { weight: 'bold' as const } } },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (ctx: { raw: number }) => `ROI Score: ${ctx.raw}`,
      },
    },
  },
};

/* ── Member type channel preference (stacked bar) ────────── */
const memberTypeLabels = ['ACA', 'ACU', 'REA', 'ACB', 'AS'];
const preferenceData = {
  labels: memberTypeLabels,
  datasets: [
    { label: 'Email', data: [65, 48, 58, 62, 55], backgroundColor: C.blue, borderRadius: 4, borderSkipped: false },
    { label: 'Phone', data: [10, 28, 12, 8, 10], backgroundColor: C.green, borderRadius: 4, borderSkipped: false },
    { label: 'Events', data: [15, 18, 20, 18, 22], backgroundColor: C.purple, borderRadius: 4, borderSkipped: false },
    { label: 'Community', data: [6, 4, 8, 8, 10], backgroundColor: C.teal, borderRadius: 4, borderSkipped: false },
    { label: 'Direct Mail', data: [4, 2, 2, 4, 3], backgroundColor: C.orange, borderRadius: 4, borderSkipped: false },
  ],
};

const preferenceOptions = {
  scales: {
    x: { stacked: true, grid: { display: false }, ticks: { color: '#8899aa' } },
    y: { stacked: true, max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => `${v}%` } },
  },
  plugins: {
    legend: { display: true, position: 'bottom' as const, labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 11 } } },
  },
};

/* ── Detail modal state ──────────────────────────────────── */
export default function ChannelMix() {
  const [detailChannel, setDetailChannel] = useState<string | null>(null);

  const selectedChannel = channels.find((c) => c.name === detailChannel);

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(74,144,217,0.2) 0%, rgba(168,85,247,0.2) 100%)',
              border: '1px solid rgba(74,144,217,0.3)',
            }}
          >
            <Layers className="w-5 h-5" style={{ color: C.blue }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              ChannelMix<span style={{ color: C.purple, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.teal }}>
              Know which channel works for which member.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Cross-channel engagement analysis showing performance, ROI, and member preference across email, phone,
          events, community, and direct mail. Understand which channels drive results for each member segment and
          optimize your outreach mix accordingly.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SparkKpi
          label="Channels Active"
          value="5"
          sub="All channels operating"
          icon={Layers}
          color={C.blue}
          sparkData={[3, 3, 4, 4, 5, 5, 5]}
          sparkColor={C.blue}
          trend={{ value: 25, label: 'vs last year' }}
          accent
        />
        <SparkKpi
          label="Best ROI Channel"
          value="Email"
          sub="ROI Score: 42"
          icon={Mail}
          color={C.green}
          sparkData={[34, 36, 37, 38, 39, 41, 42]}
          sparkColor={C.green}
          trend={{ value: 8.2, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Total Touchpoints"
          value="48,260"
          sub="Across all channels this quarter"
          icon={Zap}
          color={C.purple}
          sparkData={[32000, 35000, 38000, 41000, 43000, 46000, 48260]}
          sparkColor={C.purple}
          trend={{ value: 14.6, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Cross-Channel Members"
          value="2,418"
          sub="Engaged on 2+ channels"
          icon={Users}
          color={C.orange}
          sparkData={[1800, 1920, 2050, 2150, 2250, 2340, 2418]}
          sparkColor={C.orange}
          trend={{ value: 6.8, label: 'vs last quarter' }}
          accent
        />
      </div>

      {/* ── 3. Channel Performance Cards ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {channels.map((ch) => {
          const Icon = ch.icon;
          return (
            <div
              key={ch.name}
              className="rounded-xl border p-4 transition-all duration-200 hover:translate-y-[-2px] cursor-pointer"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--card-border)',
                borderTopWidth: '3px',
                borderTopColor: ch.color,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
              onClick={() => setDetailChannel(ch.name)}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${ch.color} 15%, transparent)` }}
                >
                  <Icon className="w-4 h-4" style={{ color: ch.color }} />
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{ch.name}</span>
              </div>
              <div className="space-y-2">
                {ch.metrics.map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                    <span className="text-xs font-extrabold" style={{ color: ch.color }}>{m.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Engagement Share</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{ch.share}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden mt-1" style={{ background: 'var(--card-border)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${ch.share}%`, background: ch.color }} />
                </div>
              </div>
              <div className="text-[8px] mt-2 font-semibold" style={{ color: 'var(--accent)' }}>Click for details</div>
            </div>
          );
        })}
      </div>

      {/* ── 4. Charts Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Engagement Share by Channel" subtitle="Proportion of total member touchpoints">
          <ClientChart type="doughnut" data={engagementShareData} height={280} />
        </Card>

        <Card title="Channel ROI Comparison" subtitle="Relative return on investment score">
          <ClientChart type="bar" data={roiData} options={roiOptions} height={280} />
        </Card>
      </div>

      {/* ── 5. Member Type Channel Preference ────────────────── */}
      <Card title="Channel Preference by Member Type" subtitle="Which channels each member type engages with most (%)">
        <ClientChart type="bar" data={preferenceData} options={preferenceOptions} height={300} />
        <p className="text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>
          ACU Underwriters show the strongest phone preference (28%) — reflecting their high-touch relationship model.
          AS Surveyors over-index on events (22%) and community (10%) compared to other segments. Email dominates
          across all types but its share varies from 48% (ACU) to 65% (ACA).
        </p>
      </Card>

      {/* ── 6. Channel Detail Modal ──────────────────────────── */}
      {detailChannel && selectedChannel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setDetailChannel(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md"
              style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${selectedChannel.color} 15%, transparent)` }}
                >
                  <selectedChannel.icon className="w-4.5 h-4.5" style={{ color: selectedChannel.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedChannel.name} Channel</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Detailed performance breakdown</p>
                </div>
              </div>
              <button onClick={() => setDetailChannel(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                {selectedChannel.metrics.map((m) => (
                  <div key={m.label} className="p-3 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                    <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
                    <div className="text-lg font-extrabold" style={{ color: selectedChannel.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
              {/* Trend */}
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Trend</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold" style={{ color: selectedChannel.trend.value > 0 ? C.green : C.red }}>
                    {selectedChannel.trend.value > 0 ? '+' : ''}{selectedChannel.trend.value}%
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedChannel.trend.label}</span>
                </div>
              </div>
              {/* Engagement share */}
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] font-bold mb-2" style={{ color: 'var(--heading)' }}>Engagement Share</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${selectedChannel.share}%`, background: selectedChannel.color }} />
                  </div>
                  <span className="text-sm font-extrabold" style={{ color: selectedChannel.color }}>{selectedChannel.share}%</span>
                </div>
              </div>
              {/* ROI */}
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>ROI Score</div>
                <div className="text-2xl font-extrabold" style={{ color: selectedChannel.color }}>{selectedChannel.roi}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Relative effectiveness per dollar invested (higher is better)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Footer ─────────────────────────────────────────── */}
      <div className="mt-8 text-center">
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          ChannelMix&trade; &mdash; Sample data for demonstration &bull; MEMTrak by ALTA
        </p>
      </div>
    </div>
  );
}
