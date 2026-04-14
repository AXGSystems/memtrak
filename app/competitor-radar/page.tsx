'use client';

import { useState, useEffect, useCallback } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  Radar,
  Shield,
  DollarSign,
  Zap,
  Trophy,
  Star,
  Check,
  Minus,
  X,
  Target,
  Award,
  TrendingUp,
  ChevronRight,
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

/* ── Competitor comparison matrix ────────────────────── */
type Rating = 'Full' | 'Partial' | 'None';

interface Competitor {
  name: string;
  color: string;
  price: string;
  priceNum: number;
  ratings: Record<string, Rating>;
}

const dimensions = [
  'Email Tracking',
  'Automation',
  'Scoring',
  'A/B Testing',
  'Deliverability',
  'Revenue Attribution',
  'Physical Mail',
  'Member Lifecycle',
  'White Label',
];

const competitors: Competitor[] = [
  {
    name: 'MEMTrak',
    color: C.green,
    price: '$75/mo',
    priceNum: 75,
    ratings: {
      'Email Tracking': 'Full',
      'Automation': 'Full',
      'Scoring': 'Full',
      'A/B Testing': 'Full',
      'Deliverability': 'Full',
      'Revenue Attribution': 'Full',
      'Physical Mail': 'Full',
      'Member Lifecycle': 'Full',
      'White Label': 'Full',
    },
  },
  {
    name: 'ActiveCampaign',
    color: '#356AE6',
    price: '$186/mo',
    priceNum: 186,
    ratings: {
      'Email Tracking': 'Full',
      'Automation': 'Full',
      'Scoring': 'Full',
      'A/B Testing': 'Full',
      'Deliverability': 'Partial',
      'Revenue Attribution': 'Partial',
      'Physical Mail': 'None',
      'Member Lifecycle': 'Partial',
      'White Label': 'None',
    },
  },
  {
    name: 'HubSpot',
    color: '#FF7A59',
    price: '$890/mo',
    priceNum: 890,
    ratings: {
      'Email Tracking': 'Full',
      'Automation': 'Full',
      'Scoring': 'Full',
      'A/B Testing': 'Full',
      'Deliverability': 'Full',
      'Revenue Attribution': 'Full',
      'Physical Mail': 'None',
      'Member Lifecycle': 'Partial',
      'White Label': 'Partial',
    },
  },
  {
    name: 'Klaviyo',
    color: '#12B886',
    price: '$350/mo',
    priceNum: 350,
    ratings: {
      'Email Tracking': 'Full',
      'Automation': 'Full',
      'Scoring': 'Partial',
      'A/B Testing': 'Full',
      'Deliverability': 'Full',
      'Revenue Attribution': 'Full',
      'Physical Mail': 'None',
      'Member Lifecycle': 'None',
      'White Label': 'None',
    },
  },
  {
    name: 'Mailchimp',
    color: '#FFE01B',
    price: '$230/mo',
    priceNum: 230,
    ratings: {
      'Email Tracking': 'Full',
      'Automation': 'Partial',
      'Scoring': 'Partial',
      'A/B Testing': 'Full',
      'Deliverability': 'Partial',
      'Revenue Attribution': 'None',
      'Physical Mail': 'Partial',
      'Member Lifecycle': 'None',
      'White Label': 'None',
    },
  },
  {
    name: 'Higher Logic',
    color: '#7C3AED',
    price: '$400/mo',
    priceNum: 400,
    ratings: {
      'Email Tracking': 'Partial',
      'Automation': 'Partial',
      'Scoring': 'None',
      'A/B Testing': 'Partial',
      'Deliverability': 'Partial',
      'Revenue Attribution': 'None',
      'Physical Mail': 'None',
      'Member Lifecycle': 'Full',
      'White Label': 'None',
    },
  },
];

/* ── "Why MEMTrak Wins" cards ────────────────────────── */
const advantages = [
  {
    title: 'PhysicalBridge',
    icon: Zap,
    desc: 'Send physical postcards & letters triggered by email decay. No other platform does this.',
    color: C.green,
  },
  {
    title: 'StaffPulse',
    icon: Shield,
    desc: 'Track staff-to-member relationship health with reply rate monitoring. Unique to MEMTrak.',
    color: C.blue,
  },
  {
    title: 'DecayRadar',
    icon: Target,
    desc: 'Personal engagement baselines per member, not segment averages. Catch churn 6 months early.',
    color: C.red,
  },
  {
    title: 'Zero Per-Seat Cost',
    icon: DollarSign,
    desc: '$75/mo flat. Competitors charge $15-45 per user. A 10-person team saves $1,800-5,400/yr.',
    color: C.orange,
  },
  {
    title: 'Association-Native',
    icon: Award,
    desc: 'Built for membership orgs from day one. Dues tracking, PFL compliance, member lifecycle stages.',
    color: C.purple,
  },
  {
    title: 'White Label Ready',
    icon: Star,
    desc: 'Full white-label capability. Brand as your own platform for state affiliates and partners.',
    color: C.teal,
  },
];

/* ── Radar chart dimensions ──────────────────────────── */
const radarLabels = ['Email', 'Automation', 'Scoring', 'Analytics', 'Deliverability', 'Integrations', 'Lifecycle', 'Value'];
const radarData = {
  memtrak: [95, 90, 92, 88, 94, 85, 96, 98],
  hubspot: [92, 95, 88, 92, 90, 95, 60, 40],
  activecampaign: [88, 90, 85, 75, 70, 80, 55, 65],
};

function RatingBadge({ rating }: { rating: Rating }) {
  const config = {
    Full: { icon: Check, color: C.green, bg: 'rgba(140,198,63,0.12)' },
    Partial: { icon: Minus, color: C.orange, bg: 'rgba(232,146,63,0.12)' },
    None: { icon: X, color: C.red, bg: 'rgba(217,74,74,0.12)' },
  };
  const c = config[rating];
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-md"
      style={{ background: c.bg }}
    >
      <c.icon className="w-3 h-3" style={{ color: c.color }} />
    </span>
  );
}

export default function CompetitorRadarPage() {
  const [annualSeats, setAnnualSeats] = useState(5);
  const [showMatrixDetail, setShowMatrixDetail] = useState(false);

  /* ── Savings calculator ────────────────────────────── */
  const memtrakAnnual = 75 * 12;
  const avgCompetitorMonthly = Math.round(
    competitors.filter((c) => c.name !== 'MEMTrak').reduce((s, c) => s + c.priceNum, 0) /
      (competitors.length - 1)
  );
  const avgCompetitorAnnual = avgCompetitorMonthly * 12;
  const monthlySavings = avgCompetitorMonthly - 75;
  const annualSavings = monthlySavings * 12;

  /* Feature count calculation */
  const featureCounts = competitors.map((c) => ({
    name: c.name,
    full: Object.values(c.ratings).filter((r) => r === 'Full').length,
    partial: Object.values(c.ratings).filter((r) => r === 'Partial').length,
    none: Object.values(c.ratings).filter((r) => r === 'None').length,
  }));

  const memtrakFullFeatures = featureCounts.find((f) => f.name === 'MEMTrak')?.full || 0;
  const featuresAhead =
    memtrakFullFeatures -
    Math.max(
      ...featureCounts.filter((f) => f.name !== 'MEMTrak').map((f) => f.full)
    );

  const uniqueFeatures = 4; // PhysicalBridge, StaffPulse, DecayRadar, White Label

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
            <Radar className="w-5 h-5" style={{ color: C.blue }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              CompetitorRadar<span style={{ color: C.blue, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.purple }}>
              Know where you stand in the market.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Competitive intelligence dashboard showing how MEMTrak stacks up against the leading email marketing
          and membership platforms. Feature-by-feature, dollar-for-dollar — see why MEMTrak is purpose-built
          for associations.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SparkKpi
          label="Features Ahead"
          value={`+${featuresAhead}`}
          sub="vs next-best competitor"
          icon={Trophy}
          color={C.green}
          sparkData={[2, 2, 3, 3, 3, 4, featuresAhead]}
          sparkColor={C.green}
          trend={{ value: 33, label: 'vs last audit' }}
          accent
        />
        <SparkKpi
          label="Annual Savings"
          value={`$${annualSavings.toLocaleString()}`}
          sub="vs avg competitor cost"
          icon={DollarSign}
          color={C.blue}
          sparkData={[28000, 30000, 32000, 34000, 35000, 36000, annualSavings]}
          sparkColor={C.blue}
          trend={{ value: 8.2, label: 'vs last year' }}
          accent
        />
        <SparkKpi
          label="Unique Features"
          value={uniqueFeatures}
          sub="No competitor offers"
          icon={Star}
          color={C.orange}
          sparkData={[2, 2, 3, 3, 4, 4, uniqueFeatures]}
          sparkColor={C.orange}
          trend={{ value: 33, label: 'new this year' }}
          accent
        />
        <SparkKpi
          label="Market Position"
          value="#1"
          sub="For association email"
          icon={Award}
          color={C.purple}
          sparkData={[3, 3, 2, 2, 1, 1, 1]}
          sparkColor={C.purple}
          trend={{ value: 100, label: 'moved to top' }}
          accent
        />
      </div>

      {/* ── 3. Comparison Matrix ──────────────────────────────── */}
      <Card
        title="Feature Comparison Matrix"
        subtitle="MEMTrak vs leading platforms across key dimensions"
        className="mb-8"
        detailTitle="Full Feature Comparison"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              MEMTrak achieves full coverage across all 9 evaluated dimensions. No competitor matches
              this breadth — HubSpot comes closest but at 12x the price and without Physical Mail
              or full Member Lifecycle tracking.
            </p>
            <div className="space-y-2">
              {featureCounts.map((f) => (
                <div
                  key={f.name}
                  className="flex items-center justify-between p-2 rounded-lg text-xs"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <span
                    className="font-bold"
                    style={{ color: f.name === 'MEMTrak' ? C.green : 'var(--heading)' }}
                  >
                    {f.name}
                  </span>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span style={{ color: C.green }}>{f.full} Full</span>
                    <span style={{ color: C.orange }}>{f.partial} Partial</span>
                    <span style={{ color: C.red }}>{f.none} None</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-[10px]" style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th className="text-left py-2 px-2 font-bold" style={{ color: 'var(--text-muted)' }}>
                  Feature
                </th>
                {competitors.map((c) => (
                  <th key={c.name} className="py-2 px-2 text-center">
                    <div className="font-bold" style={{ color: c.name === 'MEMTrak' ? C.green : 'var(--heading)' }}>
                      {c.name}
                    </div>
                    <div className="font-normal" style={{ color: 'var(--text-muted)' }}>{c.price}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dimensions.map((dim) => (
                <tr
                  key={dim}
                  className="border-t"
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  <td className="py-2.5 px-2 font-semibold" style={{ color: 'var(--heading)' }}>
                    {dim}
                  </td>
                  {competitors.map((c) => (
                    <td key={c.name + dim} className="py-2.5 px-2 text-center">
                      <div className="flex justify-center">
                        <RatingBadge rating={c.ratings[dim]} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-1.5 text-[9px]" style={{ color: 'var(--text-muted)' }}>
            <RatingBadge rating="Full" /> <span>Full Support</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px]" style={{ color: 'var(--text-muted)' }}>
            <RatingBadge rating="Partial" /> <span>Partial</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px]" style={{ color: 'var(--text-muted)' }}>
            <RatingBadge rating="None" /> <span>Not Available</span>
          </div>
        </div>
      </Card>

      {/* ── 4. Cost Comparison + Radar Chart ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card
          title="Monthly Cost Comparison"
          subtitle="MEMTrak vs competitors (per month)"
          detailTitle="Cost Analysis"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                MEMTrak&apos;s flat $75/month pricing includes unlimited seats, all features, and
                white-label capability. Competitors charge per-seat fees and lock advanced features
                behind higher tiers.
              </p>
              {competitors.map((c) => (
                <div
                  key={c.name}
                  className="flex items-center justify-between p-2 rounded-lg text-xs"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <span style={{ color: c.name === 'MEMTrak' ? C.green : 'var(--heading)' }}>{c.name}</span>
                  <span className="font-bold" style={{ color: c.name === 'MEMTrak' ? C.green : 'var(--heading)' }}>
                    {c.price}
                  </span>
                </div>
              ))}
            </div>
          }
        >
          <ClientChart
            type="bar"
            height={280}
            data={{
              labels: competitors.map((c) => c.name),
              datasets: [
                {
                  label: 'Monthly Cost',
                  data: competitors.map((c) => c.priceNum),
                  backgroundColor: competitors.map((c) =>
                    c.name === 'MEMTrak' ? C.green + '90' : c.color + '50'
                  ),
                  borderColor: competitors.map((c) =>
                    c.name === 'MEMTrak' ? C.green : c.color
                  ),
                  borderWidth: 2,
                  borderRadius: 8,
                },
              ],
            }}
            options={{
              indexAxis: 'y' as const,
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
                x: {
                  beginAtZero: true,
                  grid: { color: '#1e3350' },
                  ticks: {
                    color: '#8899aa',
                    callback: (v: number | string) => '$' + v,
                  },
                },
                y: {
                  grid: { display: false },
                  ticks: { color: '#8899aa', font: { weight: 'bold' as const, size: 10 } },
                },
              },
            }}
          />
        </Card>

        <Card
          title="Feature Radar"
          subtitle="MEMTrak vs top 2 competitors across 8 dimensions"
          detailTitle="Feature Radar Detail"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                The radar chart shows capability scores (0-100) across 8 key dimensions.
                MEMTrak leads in Lifecycle, Value, and Deliverability. HubSpot leads in
                Integrations and Automation but at 12x the cost.
              </p>
              {radarLabels.map((label, i) => (
                <div
                  key={label}
                  className="flex items-center justify-between p-2 rounded-lg text-xs"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <span style={{ color: 'var(--heading)' }}>{label}</span>
                  <div className="flex items-center gap-4 text-[10px]">
                    <span style={{ color: C.green }}>MEMTrak: {radarData.memtrak[i]}</span>
                    <span style={{ color: '#FF7A59' }}>HubSpot: {radarData.hubspot[i]}</span>
                    <span style={{ color: '#356AE6' }}>ActiveCampaign: {radarData.activecampaign[i]}</span>
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
              labels: radarLabels,
              datasets: [
                {
                  label: 'MEMTrak',
                  data: radarData.memtrak,
                  borderColor: C.green,
                  backgroundColor: C.green + '20',
                  borderWidth: 2,
                  pointBackgroundColor: C.green,
                  pointRadius: 4,
                },
                {
                  label: 'HubSpot',
                  data: radarData.hubspot,
                  borderColor: '#FF7A59',
                  backgroundColor: '#FF7A5920',
                  borderWidth: 2,
                  pointBackgroundColor: '#FF7A59',
                  pointRadius: 3,
                },
                {
                  label: 'ActiveCampaign',
                  data: radarData.activecampaign,
                  borderColor: '#356AE6',
                  backgroundColor: '#356AE620',
                  borderWidth: 2,
                  pointBackgroundColor: '#356AE6',
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
                  beginAtZero: true,
                  max: 100,
                  grid: { color: '#1e3350' },
                  angleLines: { color: '#1e3350' },
                  ticks: { display: false },
                  pointLabels: { color: '#8899aa', font: { size: 9 } },
                },
              },
            }}
          />
        </Card>
      </div>

      {/* ── 5. Why MEMTrak Wins ───────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4" style={{ color: C.green }} />
          <h2 className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>
            Why MEMTrak Wins
          </h2>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(140,198,63,0.15)', color: C.green }}
          >
            {advantages.length} unique advantages
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advantages.map((adv) => (
            <div
              key={adv.title}
              className="rounded-xl border p-4 transition-all hover:translate-y-[-2px]"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--card-border)',
                borderTopWidth: '3px',
                borderTopColor: adv.color,
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg"
                  style={{ background: `${adv.color}15`, border: `1px solid ${adv.color}30` }}
                >
                  <adv.icon className="w-4 h-4" style={{ color: adv.color }} />
                </div>
                <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>
                  {adv.title}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {adv.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Annual Savings Calculator ──────────────────────── */}
      <Card
        title="Total Annual Savings Calculator"
        subtitle="Compare MEMTrak cost vs industry average"
        detailTitle="Savings Breakdown"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              MEMTrak&apos;s flat-rate pricing eliminates per-seat fees that inflate costs as your team grows.
              The average competitor charges ${avgCompetitorMonthly}/mo as a base, plus $15-45 per additional
              user seat.
            </p>
            <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: 'var(--text-muted)' }}>MEMTrak Annual</span>
                <span className="font-bold" style={{ color: C.green }}>${memtrakAnnual.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: 'var(--text-muted)' }}>Avg Competitor Annual</span>
                <span className="font-bold" style={{ color: C.red }}>${avgCompetitorAnnual.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t" style={{ borderColor: 'var(--card-border)' }}>
                <span className="font-bold" style={{ color: 'var(--heading)' }}>You Save</span>
                <span className="font-bold" style={{ color: C.green }}>${annualSavings.toLocaleString()}/yr</span>
              </div>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(140,198,63,0.06)', border: '1px solid rgba(140,198,63,0.15)' }}>
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.green }}>
              MEMTrak Annual
            </div>
            <div className="text-2xl font-extrabold" style={{ color: C.green }}>
              ${memtrakAnnual.toLocaleString()}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>$75/mo &times; 12 + $0 per seat</div>
          </div>

          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(217,74,74,0.06)', border: '1px solid rgba(217,74,74,0.15)' }}>
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.red }}>
              Avg Competitor Annual
            </div>
            <div className="text-2xl font-extrabold" style={{ color: C.red }}>
              ${avgCompetitorAnnual.toLocaleString()}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>${avgCompetitorMonthly}/mo average</div>
          </div>

          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.15)' }}>
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.blue }}>
              Annual Savings
            </div>
            <div className="text-2xl font-extrabold" style={{ color: C.blue }}>
              ${annualSavings.toLocaleString()}
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>${monthlySavings}/mo saved</div>
          </div>
        </div>

        {/* Seat adjustment */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>Team size:</span>
            <input
              type="range"
              min={1}
              max={25}
              value={annualSeats}
              onChange={(e) => setAnnualSeats(Number(e.target.value))}
              className="flex-1 accent-[#4A90D9]"
            />
            <span className="text-xs font-bold w-14 text-right" style={{ color: 'var(--heading)' }}>
              {annualSeats} seats
            </span>
          </div>
          <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
            With {annualSeats} team members, competitors average an additional{' '}
            <strong style={{ color: C.red }}>${(annualSeats * 25 * 12).toLocaleString()}/yr</strong> in per-seat
            fees alone. MEMTrak remains <strong style={{ color: C.green }}>$900/yr flat</strong>.
          </p>
        </div>
      </Card>

      {/* Footer badge */}
      <div className="text-center py-4 mt-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(74,144,217,0.08)',
            color: C.blue,
            border: '1px solid rgba(74,144,217,0.15)',
          }}
        >
          <Radar className="w-3 h-3" />
          CompetitorRadar&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
