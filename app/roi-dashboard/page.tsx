'use client';

import { useState, useEffect, useRef } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import {
  DollarSign,
  TrendingUp,
  PiggyBank,
  Calculator,
  BarChart3,
  ArrowRight,
  Zap,
  Target,
  Award,
  ChevronRight,
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

/* ── AnimatedCounter (useEffect-safe) ────────────────── */
function AnimatedCounter({ target, prefix = '', suffix = '', duration = 2000 }: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return (
    <span>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

/* ── Cost breakdown data ─────────────────────────────── */
const costBreakdown = [
  { item: 'MEMTrak Hosting', monthly: 75, annual: 900, color: C.green },
  { item: 'Per-Seat Fees', monthly: 0, annual: 0, color: C.blue },
  { item: 'Setup/Onboarding', monthly: 0, annual: 0, color: C.teal },
];

/* ── Competitor cost comparison ───────────────────────── */
const competitorCosts = [
  { name: 'ActiveCampaign', monthly: 186, annual: 2232 },
  { name: 'Mailchimp', monthly: 230, annual: 2760 },
  { name: 'Klaviyo', monthly: 350, annual: 4200 },
  { name: 'Higher Logic', monthly: 400, annual: 4800 },
  { name: 'HubSpot', monthly: 890, annual: 10680 },
];

const avgCompetitorMonthly = Math.round(
  competitorCosts.reduce((s, c) => s + c.monthly, 0) / competitorCosts.length
);
const monthlySavings = avgCompetitorMonthly - 75;
const annualSavings = monthlySavings * 12;

/* ── Revenue attribution by campaign ─────────────────── */
const campaignROI = [
  { campaign: 'Membership Renewal — April Batch', cost: 45, revenue: 406992, roi: 9044 },
  { campaign: 'ALTA ONE 2026 — Early Bird', cost: 120, revenue: 162000, roi: 1350 },
  { campaign: 'TIPAC Q2 Pledge Drive', cost: 35, revenue: 67500, roi: 1929 },
  { campaign: 'EDge Program — Spring Cohort', cost: 60, revenue: 34000, roi: 567 },
  { campaign: 'PFL Compliance — April Wave 3', cost: 80, revenue: 2532, roi: 32 },
];

const totalRevenue = 673024;
const totalCost = 900;

/* ── Waterfall chart data ────────────────────────────── */
const waterfallLabels = ['MEMTrak Cost', 'Renewal Revenue', 'Event Revenue', 'Advocacy Revenue', 'Program Revenue', 'Compliance Revenue', 'Cost Savings', 'Total Value'];
const waterfallValues = [-900, 406992, 162000, 67500, 34000, 2532, 36120, 709144];

/* ── 5-year projection ───────────────────────────────── */
const projectionYears = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
const projectionRevenue = [709144, 780058, 858064, 943870, 1038257];
const projectionCosts = [900, 900, 900, 900, 900];

/* ── ROI comparison data ─────────────────────────────── */
const roiComparison = [
  { name: 'MEMTrak', roi: 36, color: C.green },
  { name: 'Industry Avg', roi: 12, color: C.blue },
  { name: 'ActiveCampaign', roi: 8, color: '#356AE6' },
  { name: 'HubSpot', roi: 6, color: '#FF7A59' },
  { name: 'Mailchimp', roi: 4, color: '#FFE01B' },
];

export default function ROIDashboard() {
  const [selectedCampaign, setSelectedCampaign] = useState<typeof campaignROI[0] | null>(null);

  const overallROI = 36;
  const fiveYearProjection = projectionRevenue.reduce((s, v) => s + v, 0);

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(140,198,63,0.2) 0%, rgba(232,146,63,0.2) 100%)',
              border: '1px solid rgba(140,198,63,0.3)',
            }}
          >
            <DollarSign className="w-5 h-5" style={{ color: C.green }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              ROIDashboard<span style={{ color: C.green, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.orange }}>
              Prove the value of every dollar spent.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Comprehensive return-on-investment analysis showing exactly how MEMTrak turns $75/month into
          hundreds of thousands in attributed revenue and tens of thousands in annual cost savings.
          Every metric is traceable to real campaign performance.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SparkKpi
          label="Overall ROI"
          value="36x"
          sub="For every $1 spent"
          icon={TrendingUp}
          color={C.green}
          sparkData={[22, 24, 28, 30, 33, 36]}
          sparkColor={C.green}
          trend={{ value: 9.1, label: 'vs last year' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                MEMTrak delivers $36 in value for every $1 invested. This includes both direct revenue
                attribution ($673K from campaigns) and cost savings vs alternatives ($36K/yr).
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Industry average email marketing ROI is $12 for every $1 spent.
                  MEMTrak&apos;s association-specific features drive 3x the industry benchmark.
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Revenue Attributed"
          value="$673K"
          sub="From campaign tracking"
          icon={DollarSign}
          color={C.blue}
          sparkData={[420000, 480000, 540000, 590000, 640000, 673024]}
          sparkColor={C.blue}
          trend={{ value: 14.2, label: 'vs last year' }}
          accent
        />
        <SparkKpi
          label="Annual Savings"
          value={`$${annualSavings.toLocaleString()}`}
          sub="vs avg competitor cost"
          icon={PiggyBank}
          color={C.orange}
          sparkData={[28000, 30000, 32000, 34000, 35000, annualSavings]}
          sparkColor={C.orange}
          trend={{ value: 8.2, label: 'growing savings' }}
          accent
        />
        <SparkKpi
          label="5-Year Projection"
          value={`$${(fiveYearProjection / 1000000).toFixed(1)}M`}
          sub="Cumulative value"
          icon={Target}
          color={C.purple}
          sparkData={projectionRevenue.map((v) => v / 1000)}
          sparkColor={C.purple}
          trend={{ value: 10, label: 'annual growth' }}
          accent
        />
      </div>

      {/* ── 3. Hero ROI Display ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Overall ROI" subtitle="Return for every $1 invested">
          <div className="flex flex-col items-center py-6">
            <div className="text-5xl font-extrabold mb-1" style={{ color: C.green }}>
              $<AnimatedCounter target={overallROI} />
            </div>
            <div className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
              for every <span style={{ color: 'var(--heading)' }}>$1</span> spent
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span
                className="text-[9px] font-bold px-2 py-1 rounded-full"
                style={{ background: 'rgba(140,198,63,0.12)', color: C.green }}
              >
                3x Industry Average
              </span>
            </div>
            <div className="w-full mt-4 rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>MEMTrak</div>
                  <div className="text-lg font-extrabold" style={{ color: C.green }}>36x</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Industry Avg</div>
                  <div className="text-lg font-extrabold" style={{ color: C.blue }}>12x</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Cost Breakdown" subtitle="MEMTrak annual investment" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {costBreakdown.map((c) => (
              <div
                key={c.item}
                className="rounded-xl p-4 text-center"
                style={{
                  background: c.annual > 0 ? `${c.color}08` : 'var(--input-bg)',
                  border: `1px solid ${c.annual > 0 ? c.color + '25' : 'var(--card-border)'}`,
                }}
              >
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: c.color }}>
                  {c.item}
                </div>
                <div className="text-xl font-extrabold" style={{ color: c.annual > 0 ? c.color : 'var(--heading)' }}>
                  ${c.monthly}/mo
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  ${c.annual.toLocaleString()}/yr
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(140,198,63,0.06)', border: '1px solid rgba(140,198,63,0.15)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Total Annual Investment</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>$75/mo hosting + $0 per-seat + $0 setup</div>
              </div>
              <div className="text-2xl font-extrabold" style={{ color: C.green }}>$900/yr</div>
            </div>
          </div>

          {/* Value delivered */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-lg p-3 text-center" style={{ background: 'var(--input-bg)' }}>
              <div className="text-[9px] uppercase font-bold" style={{ color: C.blue }}>Revenue Attributed</div>
              <div className="text-lg font-extrabold" style={{ color: C.blue }}>$673K</div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: 'var(--input-bg)' }}>
              <div className="text-[9px] uppercase font-bold" style={{ color: C.orange }}>Cost Savings</div>
              <div className="text-lg font-extrabold" style={{ color: C.orange }}>${(annualSavings / 1000).toFixed(0)}K</div>
            </div>
            <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(140,198,63,0.06)' }}>
              <div className="text-[9px] uppercase font-bold" style={{ color: C.green }}>Total Value</div>
              <div className="text-lg font-extrabold" style={{ color: C.green }}>$709K</div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 4. Cost Savings vs Alternatives ───────────────────── */}
      <Card
        title="Cost Savings vs Alternatives"
        subtitle="Monthly and annual savings compared to each competitor"
        className="mb-8"
        detailTitle="Savings Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              MEMTrak at $75/mo is significantly less expensive than every major competitor in the space.
              The average competitor costs ${avgCompetitorMonthly}/mo, meaning MEMTrak saves
              ${monthlySavings}/mo or ${annualSavings.toLocaleString()}/yr on average.
            </p>
            {competitorCosts.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between p-2 rounded-lg text-xs"
                style={{ background: 'var(--input-bg)' }}
              >
                <span style={{ color: 'var(--heading)' }}>{c.name}</span>
                <div className="flex items-center gap-3 text-[10px]">
                  <span style={{ color: C.red }}>${c.monthly}/mo</span>
                  <span className="font-bold" style={{ color: C.green }}>
                    Save ${(c.monthly - 75)}/mo
                  </span>
                </div>
              </div>
            ))}
            <div className="rounded-lg p-3 border" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex justify-between text-xs">
                <span className="font-bold" style={{ color: 'var(--heading)' }}>Average Annual Savings</span>
                <span className="font-bold" style={{ color: C.green }}>${annualSavings.toLocaleString()}/yr</span>
              </div>
            </div>
          </div>
        }
      >
        <ClientChart
          type="bar"
          height={260}
          data={{
            labels: ['MEMTrak', ...competitorCosts.map((c) => c.name)],
            datasets: [
              {
                label: 'Monthly Cost',
                data: [75, ...competitorCosts.map((c) => c.monthly)],
                backgroundColor: [
                  C.green + '90',
                  ...competitorCosts.map(() => C.red + '50'),
                ],
                borderColor: [
                  C.green,
                  ...competitorCosts.map(() => C.red),
                ],
                borderWidth: 2,
                borderRadius: 8,
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
                color: '#e2e8f0',
                font: { weight: 'bold' as const, size: 10 },
                formatter: (v: number) => '$' + v + '/mo',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#1e3350' },
                ticks: {
                  color: '#8899aa',
                  callback: (v: number | string) => '$' + v,
                },
              },
              x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 } } },
            },
          }}
        />
      </Card>

      {/* ── 5. ROI Waterfall + Comparison ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card
          title="ROI Waterfall"
          subtitle="How each component contributes to total value"
          detailTitle="Value Component Breakdown"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                The waterfall shows how MEMTrak&apos;s $900/yr cost is offset by $673K in attributed revenue
                and $36K in cost savings, delivering a total value of $709K.
              </p>
              {waterfallLabels.map((l, i) => (
                <div
                  key={l}
                  className="flex items-center justify-between p-2 rounded-lg text-xs"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <span style={{ color: 'var(--heading)' }}>{l}</span>
                  <span
                    className="font-bold"
                    style={{ color: waterfallValues[i] < 0 ? C.red : i === waterfallLabels.length - 1 ? C.green : C.blue }}
                  >
                    {waterfallValues[i] < 0 ? '-' : '+'}${Math.abs(waterfallValues[i]).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          }
        >
          <ClientChart
            type="bar"
            height={300}
            data={{
              labels: waterfallLabels,
              datasets: [
                {
                  label: 'Value',
                  data: waterfallValues.map((v) => Math.abs(v)),
                  backgroundColor: waterfallValues.map((v, i) =>
                    i === 0 ? C.red + '70' : i === waterfallLabels.length - 1 ? C.green + '70' : C.blue + '50'
                  ),
                  borderColor: waterfallValues.map((v, i) =>
                    i === 0 ? C.red : i === waterfallLabels.length - 1 ? C.green : C.blue
                  ),
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
                  color: '#e2e8f0',
                  font: { weight: 'bold' as const, size: 8 },
                  formatter: (v: number, ctx: { dataIndex: number }) => {
                    const orig = waterfallValues[ctx.dataIndex];
                    if (Math.abs(orig) >= 1000) {
                      return (orig < 0 ? '-' : '') + '$' + (Math.abs(orig) / 1000).toFixed(0) + 'K';
                    }
                    return (orig < 0 ? '-' : '') + '$' + Math.abs(orig);
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: '#1e3350' },
                  ticks: {
                    color: '#8899aa',
                    callback: (v: number | string) => {
                      const num = Number(v);
                      return num >= 1000 ? '$' + (num / 1000).toFixed(0) + 'K' : '$' + num;
                    },
                  },
                },
                x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 8 }, maxRotation: 45 } },
              },
            }}
          />
        </Card>

        <Card
          title="ROI Comparison"
          subtitle="MEMTrak vs industry and competitors"
          detailTitle="ROI Benchmark Analysis"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                MEMTrak&apos;s 36x ROI significantly outperforms both the industry average (12x) and
                every major competitor. This is driven by MEMTrak&apos;s low cost ($75/mo) combined
                with association-specific features that maximize engagement and revenue attribution.
              </p>
              {roiComparison.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between p-2 rounded-lg text-xs"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <span style={{ color: r.name === 'MEMTrak' ? C.green : 'var(--heading)' }}>{r.name}</span>
                  <span className="font-bold" style={{ color: r.color }}>{r.roi}x ROI</span>
                </div>
              ))}
            </div>
          }
        >
          <ClientChart
            type="bar"
            height={300}
            data={{
              labels: roiComparison.map((r) => r.name),
              datasets: [
                {
                  label: 'ROI Multiple',
                  data: roiComparison.map((r) => r.roi),
                  backgroundColor: roiComparison.map((r) => r.color + '70'),
                  borderColor: roiComparison.map((r) => r.color),
                  borderWidth: 2,
                  borderRadius: 8,
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
                  color: '#e2e8f0',
                  font: { weight: 'bold' as const, size: 12 },
                  formatter: (v: number) => v + 'x',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: '#1e3350' },
                  ticks: {
                    color: '#8899aa',
                    callback: (v: number | string) => v + 'x',
                  },
                  title: { display: true, text: 'ROI Multiple', color: '#8899aa', font: { size: 10 } },
                },
                x: { grid: { display: false }, ticks: { color: '#8899aa', font: { weight: 'bold' as const, size: 10 } } },
              },
            }}
          />
        </Card>
      </div>

      {/* ── 6. Per-Campaign ROI Table ─────────────────────────── */}
      <Card
        title="Per-Campaign ROI"
        subtitle="Revenue and ROI for each tracked campaign"
        className="mb-8"
        detailTitle="Campaign ROI Breakdown"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Membership renewals drive the vast majority of attributed revenue. The April renewal
              batch alone generated $407K from a $45 send cost, representing a 9,044x return.
              Event campaigns also show strong performance with 567-1,350x returns.
            </p>
            {campaignROI.map((c) => (
              <div
                key={c.campaign}
                className="rounded-lg p-3"
                style={{ background: 'var(--input-bg)' }}
              >
                <div className="text-xs font-bold mb-1" style={{ color: 'var(--heading)' }}>{c.campaign}</div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Cost: </span>
                    <span style={{ color: C.red }}>${c.cost}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Revenue: </span>
                    <span style={{ color: C.blue }}>${c.revenue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>ROI: </span>
                    <span className="font-bold" style={{ color: C.green }}>{c.roi.toLocaleString()}x</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
                <th className="text-left py-2 px-2 font-bold" style={{ color: 'var(--text-muted)' }}>Campaign</th>
                <th className="text-right py-2 px-2 font-bold" style={{ color: 'var(--text-muted)' }}>Send Cost</th>
                <th className="text-right py-2 px-2 font-bold" style={{ color: 'var(--text-muted)' }}>Revenue</th>
                <th className="text-right py-2 px-2 font-bold" style={{ color: 'var(--text-muted)' }}>ROI Multiple</th>
              </tr>
            </thead>
            <tbody>
              {campaignROI.map((c) => (
                <tr
                  key={c.campaign}
                  className="border-b cursor-pointer transition-all hover:bg-[var(--input-bg)]"
                  style={{ borderColor: 'var(--card-border)' }}
                  onClick={() => setSelectedCampaign(c)}
                >
                  <td className="py-3 px-2 font-semibold" style={{ color: 'var(--heading)' }}>
                    <div className="flex items-center gap-1.5">
                      {c.campaign}
                      <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right font-bold" style={{ color: C.red }}>${c.cost}</td>
                  <td className="py-3 px-2 text-right font-bold" style={{ color: C.blue }}>
                    ${c.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span
                      className="font-extrabold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(140,198,63,0.12)', color: C.green }}
                    >
                      {c.roi.toLocaleString()}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2" style={{ borderColor: 'var(--heading)' }}>
                <td className="py-3 px-2 font-bold" style={{ color: 'var(--heading)' }}>Total</td>
                <td className="py-3 px-2 text-right font-bold" style={{ color: C.red }}>
                  ${campaignROI.reduce((s, c) => s + c.cost, 0)}
                </td>
                <td className="py-3 px-2 text-right font-bold" style={{ color: C.blue }}>
                  ${totalRevenue.toLocaleString()}
                </td>
                <td className="py-3 px-2 text-right">
                  <span
                    className="font-extrabold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(140,198,63,0.12)', color: C.green }}
                  >
                    {Math.round(totalRevenue / campaignROI.reduce((s, c) => s + c.cost, 0)).toLocaleString()}x
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* ── Campaign detail modal ─────────────────────────────── */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedCampaign(null)}
        >
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
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Campaign ROI Detail</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedCampaign.campaign}</p>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-1.5 rounded-lg"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg p-3 text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-[9px] uppercase font-bold" style={{ color: C.red }}>Send Cost</div>
                  <div className="text-xl font-extrabold" style={{ color: C.red }}>${selectedCampaign.cost}</div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-[9px] uppercase font-bold" style={{ color: C.blue }}>Revenue</div>
                  <div className="text-xl font-extrabold" style={{ color: C.blue }}>
                    ${selectedCampaign.revenue.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(140,198,63,0.06)' }}>
                  <div className="text-[9px] uppercase font-bold" style={{ color: C.green }}>ROI</div>
                  <div className="text-xl font-extrabold" style={{ color: C.green }}>
                    {selectedCampaign.roi.toLocaleString()}x
                  </div>
                </div>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                  ROI Calculation
                </div>
                <div className="space-y-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex justify-between">
                    <span>Revenue Generated</span>
                    <span style={{ color: 'var(--heading)' }}>${selectedCampaign.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Send Cost</span>
                    <span style={{ color: 'var(--heading)' }}>${selectedCampaign.cost}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <span className="font-bold">Net Return</span>
                    <span className="font-bold" style={{ color: C.green }}>
                      ${(selectedCampaign.revenue - selectedCampaign.cost).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">ROI Multiple</span>
                    <span className="font-bold" style={{ color: C.green }}>
                      {selectedCampaign.roi.toLocaleString()}x
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. 5-Year Projection Chart ────────────────────────── */}
      <Card
        title="5-Year Value Projection"
        subtitle="Projected cumulative value with 10% annual growth"
        detailTitle="Projection Methodology"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Projection assumes 10% annual growth in campaign revenue based on historical trends
              and expanded campaign coverage. MEMTrak cost remains fixed at $900/yr.
            </p>
            {projectionYears.map((y, i) => (
              <div
                key={y}
                className="flex items-center justify-between p-2 rounded-lg text-xs"
                style={{ background: 'var(--input-bg)' }}
              >
                <span style={{ color: 'var(--heading)' }}>{y}</span>
                <div className="flex items-center gap-4 text-[10px]">
                  <span style={{ color: C.red }}>Cost: $900</span>
                  <span style={{ color: C.blue }}>Value: ${(projectionRevenue[i] / 1000).toFixed(0)}K</span>
                  <span className="font-bold" style={{ color: C.green }}>
                    ROI: {Math.round(projectionRevenue[i] / 900)}x
                  </span>
                </div>
              </div>
            ))}
            <div className="rounded-lg p-3 border" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex justify-between text-xs">
                <span className="font-bold" style={{ color: 'var(--heading)' }}>5-Year Cumulative</span>
                <span className="font-bold" style={{ color: C.green }}>
                  ${(fiveYearProjection / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>
          </div>
        }
      >
        <ClientChart
          type="line"
          height={280}
          data={{
            labels: projectionYears,
            datasets: [
              {
                label: 'Projected Value',
                data: projectionRevenue,
                borderColor: C.green,
                backgroundColor: C.green + '15',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: C.green,
                pointBorderColor: 'var(--card)',
                pointBorderWidth: 3,
                pointHoverRadius: 8,
              },
              {
                label: 'Annual Cost',
                data: projectionCosts,
                borderColor: C.red,
                backgroundColor: C.red + '10',
                fill: true,
                tension: 0,
                borderWidth: 2,
                borderDash: [6, 3],
                pointRadius: 4,
                pointBackgroundColor: C.red,
                pointBorderColor: 'var(--card)',
                pointBorderWidth: 2,
              },
            ],
          }}
          options={{
            plugins: {
              legend: {
                display: true,
                position: 'top' as const,
                labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 10 } },
              },
              datalabels: {
                display: (ctx: { datasetIndex: number }) => ctx.datasetIndex === 0,
                anchor: 'end' as const,
                align: 'top' as const,
                color: '#e2e8f0',
                font: { weight: 'bold' as const, size: 9 },
                formatter: (v: number) => '$' + (v / 1000).toFixed(0) + 'K',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#1e3350' },
                ticks: {
                  color: '#8899aa',
                  callback: (v: number | string) => {
                    const num = Number(v);
                    return num >= 1000000 ? '$' + (num / 1000000).toFixed(1) + 'M' : '$' + (num / 1000).toFixed(0) + 'K';
                  },
                },
                title: { display: true, text: 'Value ($)', color: '#8899aa', font: { size: 10 } },
              },
              x: { grid: { display: false }, ticks: { color: '#8899aa' } },
            },
          }}
        />

        {/* 5-year summary row */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <div className="text-center">
            <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>5-Year Cost</div>
            <div className="text-lg font-extrabold" style={{ color: C.red }}>$4,500</div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>$900/yr x 5</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>5-Year Value</div>
            <div className="text-lg font-extrabold" style={{ color: C.green }}>
              ${(fiveYearProjection / 1000000).toFixed(1)}M
            </div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>cumulative</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>5-Year ROI</div>
            <div className="text-lg font-extrabold" style={{ color: C.purple }}>
              {Math.round(fiveYearProjection / 4500).toLocaleString()}x
            </div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>return</div>
          </div>
        </div>
      </Card>

      {/* Footer badge */}
      <div className="text-center py-4 mt-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(140,198,63,0.08)',
            color: C.green,
            border: '1px solid rgba(140,198,63,0.15)',
          }}
        >
          <DollarSign className="w-3 h-3" />
          ROIDashboard&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
