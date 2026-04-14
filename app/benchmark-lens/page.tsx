'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  Target, TrendingUp, TrendingDown, Minus, Award,
  BarChart3, Gauge, Trophy, ArrowUp, ArrowDown,
  X, Zap, Users, Mail, MousePointer, UserMinus, DollarSign,
} from 'lucide-react';

/* ── palette ───────────────────────────────────────────────── */
const C = {
  navy: '#002D5C',
  blue: '#4A90D9',
  green: '#8CC63F',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F5C542',
  purple: '#a855f7',
  teal: '#14b8a6',
  cyan: '#06b6d4',
};

/* ── benchmark data (Higher Logic 2026 benchmarks) ────────── */
interface BenchmarkMetric {
  name: string;
  altaValue: number;
  industryAvg: number;
  unit: string;
  icon: typeof Mail;
  color: string;
  desc: string;
  trend: number[]; // 4 months of ALTA data
  industryTrend: number[]; // 4 months of industry data
}

const benchmarks: BenchmarkMetric[] = [
  {
    name: 'Open Rate',
    altaValue: 40.4,
    industryAvg: 33.54,
    unit: '%',
    icon: Mail,
    color: C.green,
    desc: 'Unique opens as a percentage of delivered emails',
    trend: [36.2, 37.8, 39.1, 40.4],
    industryTrend: [33.1, 33.3, 33.4, 33.54],
  },
  {
    name: 'Click Rate',
    altaValue: 3.82,
    industryAvg: 2.68,
    unit: '%',
    icon: MousePointer,
    color: C.blue,
    desc: 'Unique clicks as a percentage of delivered emails',
    trend: [3.1, 3.3, 3.6, 3.82],
    industryTrend: [2.65, 2.66, 2.67, 2.68],
  },
  {
    name: 'Bounce Rate',
    altaValue: 3.7,
    industryAvg: 5.2,
    unit: '%',
    icon: Zap,
    color: C.teal,
    desc: 'Hard and soft bounces as a percentage of sent emails (lower is better)',
    trend: [5.1, 4.6, 4.2, 3.7],
    industryTrend: [5.3, 5.2, 5.2, 5.2],
  },
  {
    name: 'Unsubscribe Rate',
    altaValue: 0.18,
    industryAvg: 0.32,
    unit: '%',
    icon: UserMinus,
    color: C.purple,
    desc: 'Unsubscribe requests as a percentage of delivered (lower is better)',
    trend: [0.24, 0.22, 0.20, 0.18],
    industryTrend: [0.33, 0.32, 0.32, 0.32],
  },
  {
    name: 'List Growth Rate',
    altaValue: 2.4,
    industryAvg: 1.1,
    unit: '%',
    icon: Users,
    color: C.amber,
    desc: 'Net new subscribers per month as a percentage of total list',
    trend: [1.6, 1.8, 2.1, 2.4],
    industryTrend: [1.0, 1.1, 1.1, 1.1],
  },
  {
    name: 'Revenue per Email',
    altaValue: 1.18,
    industryAvg: 0.72,
    unit: '$',
    icon: DollarSign,
    color: C.orange,
    desc: 'Average revenue attributed per email sent',
    trend: [0.82, 0.92, 1.05, 1.18],
    industryTrend: [0.70, 0.71, 0.71, 0.72],
  },
];

/* ── radar dimensions ─────────────────────────────────────── */
const radarDimensions = ['Open Rate', 'Click Rate', 'List Health', 'Revenue', 'Growth', 'Retention'];
const altaRadar = [82, 78, 88, 75, 85, 92];
const industryRadar = [65, 55, 70, 50, 45, 60];

/* ── helpers ──────────────────────────────────────────────── */
function isAboveAvg(metric: BenchmarkMetric): boolean {
  const lowerIsBetter = metric.name === 'Bounce Rate' || metric.name === 'Unsubscribe Rate';
  return lowerIsBetter ? metric.altaValue < metric.industryAvg : metric.altaValue > metric.industryAvg;
}

function gapPct(metric: BenchmarkMetric): number {
  const diff = metric.altaValue - metric.industryAvg;
  return Math.round((diff / metric.industryAvg) * 100);
}

/* ══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function BenchmarkLensPage() {
  const [selectedMetric, setSelectedMetric] = useState<BenchmarkMetric | null>(null);

  const aboveAvgCount = benchmarks.filter(isAboveAvg).length;
  const biggestGapMetric = [...benchmarks].sort((a, b) => Math.abs(gapPct(b)) - Math.abs(gapPct(a)))[0];
  const bestPerforming = [...benchmarks].filter(isAboveAvg).sort((a, b) => Math.abs(gapPct(b)) - Math.abs(gapPct(a)))[0];

  const months = ['Jan', 'Feb', 'Mar', 'Apr'];

  return (
    <div className="p-6 space-y-6">
      {/* ── 1. Branded Header ──────────────────────────────── */}
      <div className="flex items-center gap-3 mb-1">
        <div className="relative">
          <Target className="w-9 h-9" style={{ color: C.blue }} />
          <Trophy className="absolute -bottom-0.5 -right-1 w-4 h-4" style={{ color: C.amber }} />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            BenchmarkLens<span className="align-super text-[9px] font-black" style={{ color: 'var(--accent)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Know if you&apos;re winning <strong style={{ color: 'var(--heading)' }}>without asking.</strong>
          </p>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
        BenchmarkLens compares ALTA&apos;s email performance against{' '}
        <strong style={{ color: 'var(--heading)' }}>Higher Logic&apos;s 2026 association industry benchmarks</strong> (33.54% open rate, 2.68% click rate).
        See where you lead, where you lag, and how the gap is changing.
      </p>

      {/* ── 2. SparkKpi Row ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SparkKpi
          label="Metrics Above Avg"
          value={`${aboveAvgCount} / ${benchmarks.length}`}
          icon={Award}
          color={C.green}
          sparkData={[3, 3, 4, 5, 5, 6, aboveAvgCount]}
          sparkColor={C.green}
          trend={{ value: 16.7, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ALTA outperforms the industry average in {aboveAvgCount} out of {benchmarks.length} tracked metrics.
              </p>
              <div className="space-y-2">
                {benchmarks.map(m => (
                  <div key={m.name} className="flex items-center justify-between text-[11px] py-1 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <span className="flex items-center gap-1.5">
                      {isAboveAvg(m) ? <ArrowUp className="w-3 h-3" style={{ color: C.green }} /> : <ArrowDown className="w-3 h-3" style={{ color: C.red }} />}
                      <span style={{ color: 'var(--heading)' }}>{m.name}</span>
                    </span>
                    <span className="font-bold" style={{ color: isAboveAvg(m) ? C.green : C.red }}>
                      {isAboveAvg(m) ? 'Above' : 'Below'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Biggest Gap"
          value={`${biggestGapMetric.name}`}
          sub={`${gapPct(biggestGapMetric) > 0 ? '+' : ''}${gapPct(biggestGapMetric)}% vs industry`}
          icon={BarChart3}
          color={C.orange}
          sparkData={biggestGapMetric.trend}
          sparkColor={C.orange}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                The biggest performance gap between ALTA and the industry average is in <strong style={{ color: 'var(--heading)' }}>{biggestGapMetric.name}</strong>.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3 text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>ALTA</div>
                  <div className="text-xl font-extrabold" style={{ color: C.green }}>{biggestGapMetric.unit === '$' ? '$' : ''}{biggestGapMetric.altaValue}{biggestGapMetric.unit === '%' ? '%' : ''}</div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Industry</div>
                  <div className="text-xl font-extrabold" style={{ color: 'var(--text-muted)' }}>{biggestGapMetric.unit === '$' ? '$' : ''}{biggestGapMetric.industryAvg}{biggestGapMetric.unit === '%' ? '%' : ''}</div>
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Best Performing Area"
          value={bestPerforming.name}
          sub={`+${Math.abs(gapPct(bestPerforming))}% above avg`}
          icon={Trophy}
          color={C.amber}
          sparkData={bestPerforming.trend}
          sparkColor={C.amber}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ALTA&apos;s strongest metric relative to industry benchmarks. <strong style={{ color: 'var(--heading)' }}>{bestPerforming.name}</strong> leads the industry
                by {Math.abs(gapPct(bestPerforming))}%.
              </p>
            </div>
          }
        />
        <SparkKpi
          label="Industry Rank Estimate"
          value="Top 15%"
          sub="Among US trade associations"
          icon={Gauge}
          color={C.blue}
          sparkData={[25, 22, 20, 18, 17, 16, 15]}
          sparkColor={C.blue}
          trend={{ value: 5, label: 'percentile improvement' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Based on composite scoring across all 6 tracked metrics, ALTA ranks in the <strong style={{ color: 'var(--heading)' }}>top 15th percentile</strong> of
                US trade associations tracked by Higher Logic. This is up from 20th percentile at the start of 2026.
              </p>
              <div className="w-full rounded-full overflow-hidden" style={{ height: 12, background: 'var(--card-border)' }}>
                <div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: '85%', background: `linear-gradient(90deg, ${C.blue}, ${C.green})` }}>
                  <span className="text-[8px] font-bold" style={{ color: '#FFFFFF' }}>ALTA</span>
                </div>
              </div>
              <div className="flex justify-between text-[8px]" style={{ color: 'var(--text-muted)' }}>
                <span>Bottom</span>
                <span>Top 15%</span>
              </div>
            </div>
          }
        />
      </div>

      {/* ── 3. Radar Chart + Benchmark Cards ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          title="ALTA vs Industry Performance"
          subtitle="Normalized scores across 6 dimensions"
          detailTitle="Radar Analysis"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Each dimension is scored on a 0-100 scale relative to the industry range. A score of 100 represents the top performer
                in Higher Logic&apos;s benchmark dataset; 50 represents the median.
              </p>
              {radarDimensions.map((dim, i) => (
                <div key={dim} className="flex items-center justify-between text-[11px] py-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                  <span style={{ color: 'var(--heading)' }}>{dim}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold" style={{ color: C.green }}>ALTA: {altaRadar[i]}</span>
                    <span style={{ color: 'var(--text-muted)' }}>Industry: {industryRadar[i]}</span>
                    <span className="font-bold text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(140,198,63,0.15)', color: C.green }}>
                      +{altaRadar[i] - industryRadar[i]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <ClientChart
            type="radar"
            height={300}
            data={{
              labels: radarDimensions,
              datasets: [
                {
                  label: 'ALTA',
                  data: altaRadar,
                  backgroundColor: `${C.green}30`,
                  borderColor: C.green,
                  borderWidth: 2,
                  pointBackgroundColor: C.green,
                  pointRadius: 4,
                },
                {
                  label: 'Industry Avg',
                  data: industryRadar,
                  backgroundColor: `${C.blue}20`,
                  borderColor: C.blue,
                  borderWidth: 2,
                  borderDash: [5, 3],
                  pointBackgroundColor: C.blue,
                  pointRadius: 3,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom' as const,
                  labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 10 } },
                },
              },
              scales: {
                r: {
                  angleLines: { color: '#1e3350' },
                  grid: { color: '#1e3350' },
                  pointLabels: { color: '#8899aa', font: { size: 10 } },
                  ticks: { display: false },
                  suggestedMin: 0,
                  suggestedMax: 100,
                },
              },
            }}
          />
        </Card>

        <div className="space-y-3">
          <div className="text-[11px] font-bold px-1" style={{ color: 'var(--heading)' }}>Per-Metric Benchmark Cards</div>
          <div className="grid grid-cols-1 gap-3">
            {benchmarks.map(metric => {
              const above = isAboveAvg(metric);
              const gap = gapPct(metric);
              return (
                <div
                  key={metric.name}
                  className="rounded-xl border p-3 cursor-pointer transition-all duration-200 hover:translate-y-[-1px]"
                  style={{
                    background: 'var(--card)',
                    borderColor: 'var(--card-border)',
                    borderLeftWidth: 4,
                    borderLeftColor: above ? C.green : C.red,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                  onClick={() => setSelectedMetric(metric)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
                      <div>
                        <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{metric.name}</div>
                        <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{metric.desc}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>ALTA</div>
                          <div className="text-sm font-extrabold" style={{ color: C.green }}>
                            {metric.unit === '$' ? '$' : ''}{metric.altaValue}{metric.unit === '%' ? '%' : ''}
                          </div>
                        </div>
                        <div className="text-[10px] px-1" style={{ color: 'var(--text-muted)' }}>vs</div>
                        <div>
                          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Avg</div>
                          <div className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                            {metric.unit === '$' ? '$' : ''}{metric.industryAvg}{metric.unit === '%' ? '%' : ''}
                          </div>
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1"
                        style={{ background: above ? 'rgba(140,198,63,0.15)' : 'rgba(217,74,74,0.15)', color: above ? C.green : C.red }}
                      >
                        {above ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                        {above ? 'Above' : 'Below'} Avg ({gap > 0 ? '+' : ''}{gap}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Trend Over Time ────────────────────────────── */}
      <Card
        title="ALTA vs Benchmark Trend"
        subtitle="How ALTA's performance vs industry average has changed (Jan-Apr 2026)"
        detailTitle="Monthly Trend Data"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Four-month trend showing ALTA&apos;s trajectory against industry benchmarks. ALTA is improving across all metrics
              while industry averages remain relatively flat.
            </p>
            {benchmarks.map(m => (
              <div key={m.name} className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)' }}>
                <div className="text-[11px] font-bold mb-2" style={{ color: 'var(--heading)' }}>{m.name}</div>
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  {months.map((month, i) => (
                    <div key={month} className="text-center">
                      <div style={{ color: 'var(--text-muted)' }}>{month}</div>
                      <div className="font-bold" style={{ color: C.green }}>{m.unit === '$' ? '$' : ''}{m.trend[i]}{m.unit === '%' ? '%' : ''}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{m.unit === '$' ? '$' : ''}{m.industryTrend[i]}{m.unit === '%' ? '%' : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        }
      >
        <ClientChart
          type="line"
          height={280}
          data={{
            labels: months,
            datasets: [
              {
                label: 'ALTA Open Rate',
                data: benchmarks[0].trend,
                borderColor: C.green,
                backgroundColor: `${C.green}20`,
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: C.green,
              },
              {
                label: 'Industry Open Rate',
                data: benchmarks[0].industryTrend,
                borderColor: C.blue,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 3],
                tension: 0.3,
                pointRadius: 3,
                pointBackgroundColor: C.blue,
              },
              {
                label: 'ALTA Click Rate',
                data: benchmarks[1].trend,
                borderColor: C.amber,
                backgroundColor: `${C.amber}15`,
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: C.amber,
              },
              {
                label: 'Industry Click Rate',
                data: benchmarks[1].industryTrend,
                borderColor: C.purple,
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 3],
                tension: 0.3,
                pointRadius: 3,
                pointBackgroundColor: C.purple,
              },
            ],
          }}
          options={{
            plugins: {
              legend: {
                display: true,
                position: 'bottom' as const,
                labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 10, font: { size: 9 } },
              },
            },
            scales: {
              y: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => `${v}%` } },
              x: { grid: { display: false }, ticks: { color: '#8899aa' } },
            },
          }}
        />
      </Card>

      {/* ── 5. Summary Row ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Where ALTA Leads" subtitle="Strengths vs industry" accent={C.green}>
          <div className="space-y-2 mt-2">
            {benchmarks.filter(isAboveAvg).map(m => (
              <div key={m.name} className="flex items-center justify-between text-[10px] py-1.5 px-3 rounded-lg" style={{ background: 'rgba(140,198,63,0.06)' }}>
                <span className="flex items-center gap-1.5">
                  <m.icon className="w-3 h-3" style={{ color: m.color }} />
                  <span style={{ color: 'var(--heading)' }}>{m.name}</span>
                </span>
                <span className="font-bold" style={{ color: C.green }}>+{Math.abs(gapPct(m))}%</span>
              </div>
            ))}
            <div className="rounded-lg p-2 mt-2" style={{ background: 'rgba(140,198,63,0.08)' }}>
              <div className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
                ALTA outperforms in <strong style={{ color: C.green }}>{aboveAvgCount} of {benchmarks.length}</strong> key metrics
              </div>
            </div>
          </div>
        </Card>

        <Card title="Improvement Velocity" subtitle="Rate of gap closure over 4 months">
          <div className="space-y-3 mt-2">
            {benchmarks.slice(0, 4).map(m => {
              const janGap = m.trend[0] - m.industryTrend[0];
              const aprGap = m.trend[3] - m.industryTrend[3];
              const improvement = aprGap - janGap;
              const lowerBetter = m.name === 'Bounce Rate' || m.name === 'Unsubscribe Rate';
              const positive = lowerBetter ? improvement < 0 : improvement > 0;
              return (
                <div key={m.name}>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span style={{ color: 'var(--heading)' }}>{m.name}</span>
                    <span className="flex items-center gap-1 font-bold" style={{ color: positive ? C.green : C.orange }}>
                      {positive ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {improvement > 0 ? '+' : ''}{improvement.toFixed(1)} pts
                    </span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.abs(aprGap) * 5 + 20)}%`,
                        background: positive ? C.green : C.orange,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Key Takeaways" subtitle="What the benchmarks tell us">
          <div className="space-y-3 mt-2">
            {[
              {
                title: 'Open rate leads by +20%',
                desc: 'ALTA\'s 40.4% open rate significantly outperforms the 33.54% industry average. Content relevance and sender reputation are strong.',
                color: C.green,
              },
              {
                title: 'Click rate improving fast',
                desc: 'Click rate gap widened from +0.45 to +1.14 pts in 4 months. PredictiveContent personalization is driving this.',
                color: C.blue,
              },
              {
                title: 'List hygiene is paying off',
                desc: 'Bounce rate dropped from 5.1% to 3.7% while industry stays flat at 5.2%. InboxGuard automation is working.',
                color: C.teal,
              },
              {
                title: 'Revenue per email nearly 2x',
                desc: 'At $1.18 vs $0.72 industry avg, ALTA generates 64% more revenue per email sent. Renewals and events drive this.',
                color: C.amber,
              },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-2 text-[10px]">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                <div>
                  <strong style={{ color: 'var(--heading)' }}>{item.title}</strong>
                  <div style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Metric Detail Modal ───────────────────────────── */}
      {selectedMetric && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedMetric(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-3">
                <selectedMetric.icon className="w-5 h-5" style={{ color: selectedMetric.color }} />
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedMetric.name}</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedMetric.desc}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMetric(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Big comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(140,198,63,0.08)' }}>
                  <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>ALTA</div>
                  <div className="text-3xl font-extrabold" style={{ color: C.green }}>
                    {selectedMetric.unit === '$' ? '$' : ''}{selectedMetric.altaValue}{selectedMetric.unit === '%' ? '%' : ''}
                  </div>
                </div>
                <div className="rounded-xl p-4 text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Industry Avg</div>
                  <div className="text-3xl font-extrabold" style={{ color: 'var(--text-muted)' }}>
                    {selectedMetric.unit === '$' ? '$' : ''}{selectedMetric.industryAvg}{selectedMetric.unit === '%' ? '%' : ''}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="rounded-lg p-3 text-center" style={{ background: isAboveAvg(selectedMetric) ? 'rgba(140,198,63,0.1)' : 'rgba(217,74,74,0.1)' }}>
                <span className="text-[12px] font-bold" style={{ color: isAboveAvg(selectedMetric) ? C.green : C.red }}>
                  {isAboveAvg(selectedMetric) ? 'Above' : 'Below'} Industry Average by {Math.abs(gapPct(selectedMetric))}%
                </span>
              </div>

              {/* Monthly trend */}
              <div>
                <div className="text-[11px] font-bold mb-2" style={{ color: 'var(--heading)' }}>4-Month Trend</div>
                <div className="space-y-2">
                  {months.map((month, i) => (
                    <div key={month} className="flex items-center gap-3 text-[10px]">
                      <span className="w-8 font-bold" style={{ color: 'var(--text-muted)' }}>{month}</span>
                      <div className="flex-1">
                        <div className="flex gap-1 h-4">
                          <div className="rounded-sm" style={{ width: `${(selectedMetric.trend[i] / Math.max(...selectedMetric.trend)) * 100}%`, background: C.green }} />
                          <div className="rounded-sm" style={{ width: `${(selectedMetric.industryTrend[i] / Math.max(...selectedMetric.trend)) * 100}%`, background: `${C.blue}60` }} />
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        <span className="font-bold" style={{ color: C.green }}>{selectedMetric.unit === '$' ? '$' : ''}{selectedMetric.trend[i]}{selectedMetric.unit === '%' ? '%' : ''}</span>
                        <span style={{ color: 'var(--text-muted)' }}> / {selectedMetric.unit === '$' ? '$' : ''}{selectedMetric.industryTrend[i]}{selectedMetric.unit === '%' ? '%' : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
