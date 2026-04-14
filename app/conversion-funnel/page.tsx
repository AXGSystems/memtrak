'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Target,
  ArrowDownRight,
  ChevronDown,
  Layers,
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
};

/* ── Funnel stages ───────────────────────────────────────── */
const stages = [
  { label: 'List Size', count: 18400, color: C.navy },
  { label: 'Sent', count: 17454, note: 'after suppression', color: C.blue },
  { label: 'Delivered', count: 16808, color: '#5BA3E0' },
  { label: 'Opened', count: 7252, color: C.teal },
  { label: 'Clicked', count: 2174, color: C.amber },
  { label: 'Converted', count: 892, note: 'action taken', color: C.orange },
  { label: 'Revenue', count: 673024, isRevenue: true, color: C.green },
];

function convRate(from: number, to: number) {
  return ((to / from) * 100).toFixed(1);
}

function dropOff(from: number, to: number) {
  return from - to;
}

/* ── Mini funnel data per campaign type ──────────────────── */
const miniFunnels = [
  {
    type: 'Compliance',
    color: C.blue,
    stages: [
      { label: 'Sent', count: 3200 },
      { label: 'Delivered', count: 2980 },
      { label: 'Opened', count: 1042 },
      { label: 'Clicked', count: 267 },
      { label: 'Converted', count: 108 },
    ],
  },
  {
    type: 'Renewal',
    color: C.green,
    stages: [
      { label: 'Sent', count: 420 },
      { label: 'Delivered', count: 398 },
      { label: 'Opened', count: 312 },
      { label: 'Clicked', count: 156 },
      { label: 'Converted', count: 94 },
    ],
  },
  {
    type: 'Events',
    color: C.purple,
    stages: [
      { label: 'Sent', count: 4994 },
      { label: 'Delivered', count: 4780 },
      { label: 'Opened', count: 2580 },
      { label: 'Clicked', count: 780 },
      { label: 'Converted', count: 312 },
    ],
  },
];

/* ── Drop-off analysis ───────────────────────────────────── */
const dropOffAnalysis = [
  {
    stage: 'Delivered to Opened',
    dropPct: '56.8%',
    dropCount: 9556,
    severity: 'critical',
    color: C.red,
    reason: 'More than half of delivered emails go unopened. Subject lines and preview text are the primary lever.',
    recommendations: [
      'A/B test subject lines on every campaign (ABVault shows 29.6% avg lift)',
      'Implement personalized preheaders with member name and company',
      'Segment send times by member type (SendBrain data shows 21% improvement)',
      'Use CEO from-address for high-priority sends (25.6% lift proven)',
    ],
  },
  {
    stage: 'Opened to Clicked',
    dropPct: '70.0%',
    dropCount: 5078,
    severity: 'high',
    color: C.orange,
    reason: 'Members open but do not click. Content relevance and CTA placement need improvement.',
    recommendations: [
      'Move primary CTA above the fold in all templates',
      'Use short, direct CTAs ("Renew Now" proven 42% better than verbose)',
      'Add section-level CTAs for longer newsletter content',
      'Implement dynamic content blocks based on member type',
    ],
  },
  {
    stage: 'Clicked to Converted',
    dropPct: '59.0%',
    dropCount: 1282,
    severity: 'medium',
    color: C.amber,
    reason: 'Landing page experience is losing interested members. Form friction or unclear next steps.',
    recommendations: [
      'Audit top 5 landing pages for load time and mobile responsiveness',
      'Simplify renewal form to 3 fields maximum',
      'Add progress indicators for multi-step processes',
      'Implement pre-filled forms for logged-in members',
    ],
  },
];

/* ── Trend chart data (4-month funnel conversion improvement) */
const trendData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [
    {
      label: 'Open Rate %',
      data: [36.0, 36.8, 40.0, 43.1],
      borderColor: C.teal,
      backgroundColor: 'rgba(20,184,166,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: C.teal,
      borderWidth: 2,
    },
    {
      label: 'Click Rate %',
      data: [10.8, 10.8, 12.0, 12.9],
      borderColor: C.amber,
      backgroundColor: 'rgba(245,158,11,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: C.amber,
      borderWidth: 2,
    },
    {
      label: 'Conversion Rate %',
      data: [4.0, 4.2, 4.6, 5.3],
      borderColor: C.green,
      backgroundColor: 'rgba(140,198,63,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: C.green,
      borderWidth: 2,
    },
  ],
};

const trendOptions = {
  scales: {
    y: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => `${v}%` } },
    x: { grid: { display: false }, ticks: { color: '#8899aa' } },
  },
  plugins: {
    legend: { display: true, position: 'bottom' as const, labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 11 } } },
  },
};

/* ── Helpers ──────────────────────────────────────────────── */
const overallConversion = ((892 / 18400) * 100).toFixed(1);
const revenuePerSub = (673024 / 18400).toFixed(2);

export default function ConversionFunnel() {
  const [selectedDropOff, setSelectedDropOff] = useState<number | null>(null);

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(140,198,63,0.2) 0%, rgba(74,144,217,0.2) 100%)',
              border: '1px solid rgba(140,198,63,0.3)',
            }}
          >
            <Filter className="w-5 h-5" style={{ color: C.green }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              ConversionFunnel<span style={{ color: C.green, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.blue }}>
              From inbox to revenue, visualized.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          End-to-end conversion funnel visualization showing every stage from list to revenue. Pinpoints the exact
          drop-off points where members disengage and provides actionable recommendations to widen the funnel at
          each bottleneck.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SparkKpi
          label="Overall Conversion"
          value={`${overallConversion}%`}
          sub="List to conversion"
          icon={Target}
          color={C.green}
          sparkData={[3.8, 4.0, 4.2, 4.4, 4.6, 4.8, 5.3]}
          sparkColor={C.green}
          trend={{ value: 10.4, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Biggest Drop-off"
          value="Delivered to Opened"
          sub="56.8% lost at this stage"
          icon={AlertTriangle}
          color={C.red}
          sparkData={[62, 60, 59, 58, 57, 57, 56.8]}
          sparkColor={C.red}
          trend={{ value: 3.2, label: 'improving' }}
          accent
        />
        <SparkKpi
          label="Best Converting Type"
          value="Renewal"
          sub="23.6% sent-to-converted"
          icon={Zap}
          color={C.purple}
          sparkData={[18, 19, 20, 21, 22, 23, 23.6]}
          sparkColor={C.purple}
          trend={{ value: 8.1, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Revenue Per Subscriber"
          value={`$${revenuePerSub}`}
          sub="Total revenue / list size"
          icon={DollarSign}
          color={C.blue}
          sparkData={[28, 30, 32, 33, 34, 35, 36.58]}
          sparkColor={C.blue}
          trend={{ value: 12.8, label: 'vs last quarter' }}
          accent
        />
      </div>

      {/* ── 3. Main Funnel Visualization ──────────────────────── */}
      <Card title="Full Conversion Funnel" subtitle="Every stage from list to revenue">
        <div className="space-y-0 mt-4">
          {stages.map((stage, i) => {
            const maxCount = stages[0].count;
            const widthPct = stage.isRevenue ? 100 : Math.max(12, (stage.count / maxCount) * 100);
            const prevStage = i > 0 ? stages[i - 1] : null;
            const conversionFromPrev = prevStage && !stage.isRevenue ? convRate(prevStage.count, stage.count) : null;
            const dropFromPrev = prevStage && !stage.isRevenue ? dropOff(prevStage.count, stage.count) : null;

            return (
              <div key={stage.label}>
                {/* Conversion rate between stages */}
                {conversionFromPrev && (
                  <div className="flex items-center justify-center gap-2 py-1.5">
                    <div className="h-px flex-1 max-w-[60px]" style={{ background: 'var(--card-border)' }} />
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'var(--input-bg)' }}>
                      <ArrowDownRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{conversionFromPrev}%</span>
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        &middot; {dropFromPrev!.toLocaleString()} lost
                      </span>
                    </div>
                    <div className="h-px flex-1 max-w-[60px]" style={{ background: 'var(--card-border)' }} />
                  </div>
                )}

                {/* Stage bar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 text-right flex-shrink-0">
                    <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{stage.label}</div>
                    {stage.note && <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{stage.note}</div>}
                  </div>
                  <div className="flex-1">
                    {stage.isRevenue ? (
                      <div
                        className="h-12 rounded-xl flex items-center justify-center gap-2 border"
                        style={{
                          background: `linear-gradient(135deg, color-mix(in srgb, ${C.green} 15%, transparent) 0%, color-mix(in srgb, ${C.blue} 10%, transparent) 100%)`,
                          borderColor: `color-mix(in srgb, ${C.green} 30%, transparent)`,
                        }}
                      >
                        <DollarSign className="w-5 h-5" style={{ color: C.green }} />
                        <span className="text-xl font-extrabold" style={{ color: C.green }}>
                          ${stage.count.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <div className="relative h-10 rounded-lg overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                        <div
                          className="absolute inset-y-0 left-0 rounded-lg flex items-center transition-all duration-700"
                          style={{
                            width: `${widthPct}%`,
                            background: `color-mix(in srgb, ${stage.color} 25%, transparent)`,
                            borderRight: `3px solid ${stage.color}`,
                          }}
                        >
                          <span className="ml-3 text-sm font-extrabold" style={{ color: stage.color }}>
                            {stage.count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── 4. Drop-off Analysis ─────────────────────────────── */}
      <div className="mt-6">
        <Card title="Drop-off Analysis" subtitle="Biggest bottlenecks with targeted recommendations">
          <div className="space-y-4 mt-2">
            {dropOffAnalysis.map((d, i) => (
              <div
                key={d.stage}
                className="rounded-xl border overflow-hidden"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--card-border)',
                  borderLeftWidth: '4px',
                  borderLeftColor: d.color,
                }}
              >
                <button
                  className="w-full text-left p-4"
                  onClick={() => setSelectedDropOff(selectedDropOff === i ? null : i)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: `color-mix(in srgb, ${d.color} 15%, transparent)` }}
                      >
                        <AlertTriangle className="w-4 h-4" style={{ color: d.color }} />
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{d.stage}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{d.reason}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                      <div className="text-right">
                        <div className="text-sm font-extrabold" style={{ color: d.color }}>{d.dropPct}</div>
                        <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{d.dropCount.toLocaleString()} lost</div>
                      </div>
                      <ChevronDown
                        className="w-4 h-4 transition-transform"
                        style={{
                          color: 'var(--text-muted)',
                          transform: selectedDropOff === i ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      />
                    </div>
                  </div>
                </button>
                {selectedDropOff === i && (
                  <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="mt-3 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--heading)' }}>
                        Recommendations
                      </div>
                      {d.recommendations.map((rec, ri) => (
                        <div key={ri} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: `color-mix(in srgb, ${d.color} 20%, transparent)` }}
                          >
                            <span className="text-[8px] font-bold" style={{ color: d.color }}>{ri + 1}</span>
                          </div>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 5. Per-Campaign Type Mini Funnels ────────────────── */}
      <div className="mt-6">
        <Card title="Funnel by Campaign Type" subtitle="Side-by-side comparison of Compliance, Renewal, and Events">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
            {miniFunnels.map((funnel) => {
              const maxCount = funnel.stages[0].count;
              const lastStage = funnel.stages[funnel.stages.length - 1];
              const overallConv = ((lastStage.count / maxCount) * 100).toFixed(1);

              return (
                <div key={funnel.type}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: funnel.color }}
                      />
                      <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{funnel.type}</span>
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: funnel.color }}>
                      {overallConv}% conversion
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {funnel.stages.map((s, si) => {
                      const widthPct = Math.max(10, (s.count / maxCount) * 100);
                      return (
                        <div key={s.label}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                            <span className="text-[9px] font-bold" style={{ color: 'var(--heading)' }}>
                              {s.count.toLocaleString()}
                              {si > 0 && (
                                <span className="ml-1" style={{ color: 'var(--text-muted)' }}>
                                  ({convRate(funnel.stages[si - 1].count, s.count)}%)
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="h-3 rounded overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                            <div
                              className="h-full rounded transition-all duration-700"
                              style={{
                                width: `${widthPct}%`,
                                background: `color-mix(in srgb, ${funnel.color} ${40 + si * 10}%, transparent)`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: C.green }}>Renewal</strong> has the highest sent-to-converted rate (22.4%)
              because members have clear intent. <strong style={{ color: C.purple }}>Events</strong> converts at 6.2%
              with the largest absolute volume. <strong style={{ color: C.blue }}>Compliance</strong> at 3.4% has
              room to improve with better CTA placement and landing page optimization.
            </p>
          </div>
        </Card>
      </div>

      {/* ── 6. Trend Chart ────────────────────────────────────── */}
      <div className="mt-6">
        <Card title="Funnel Conversion Trend" subtitle="4-month improvement in key conversion rates">
          <ClientChart type="line" data={trendData} options={trendOptions} height={280} />
          <p className="text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>
            All three key rates are trending upward. Open rate improved from 36.0% to 43.1% (+19.7% relative),
            click rate from 10.8% to 12.9% (+19.4%), and conversion rate from 4.0% to 5.3% (+32.5%).
            A/B testing insights from ABVault&trade; and send-time optimization from SendBrain&trade; are the
            primary drivers of improvement.
          </p>
        </Card>
      </div>

      {/* ── 7. Footer ─────────────────────────────────────────── */}
      <div className="mt-8 text-center">
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          ConversionFunnel&trade; &mdash; Sample data for demonstration &bull; MEMTrak by ALTA
        </p>
      </div>
    </div>
  );
}
