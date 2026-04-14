'use client';

import { useState } from 'react';
import { Activity, Shield, AlertTriangle, TrendingDown, TrendingUp, ChevronDown, ChevronUp, Info } from 'lucide-react';
import Card from '@/components/Card';
import SparkKpi, { MiniBar } from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { demoCampaigns, demoMonthly } from '@/lib/demo-data';

/* ── Palette ─────────────────────────────────────────── */
const C = {
  navy: '#1B3A5C',
  blue: '#4A90D9',
  green: '#8CC63F',
  yellow: '#E8D44D',
  orange: '#E8923F',
  red: '#D94A4A',
  purple: '#7C5CFC',
};

/* ── Health bands ────────────────────────────────────── */
const bands = [
  { label: 'Excellent', min: 0, max: 10, color: C.green },
  { label: 'Good', min: 11, max: 25, color: C.blue },
  { label: 'Caution', min: 26, max: 50, color: C.yellow },
  { label: 'Warning', min: 51, max: 75, color: C.orange },
  { label: 'Critical', min: 76, max: 100, color: C.red },
] as const;

function getBand(score: number) {
  return bands.find(b => score >= b.min && score <= b.max) || bands[4];
}

/* ── Per-campaign index calculation ──────────────────── */
interface CampaignIndex {
  id: string;
  name: string;
  type: string;
  sent: number;
  listSize: number;
  bounceRate: number;
  unsubRate: number;
  complaintEst: number;
  complaintRate: number;
  index: number;
  band: typeof bands[number];
}

function computeCampaignIndexes(): CampaignIndex[] {
  return demoCampaigns
    .filter(c => c.status === 'Sent')
    .map(c => {
      const bounceRate = c.listSize > 0 ? (c.bounced / c.listSize) * 100 : 0;
      const unsubRate = c.listSize > 0 ? (c.unsubscribed / c.listSize) * 100 : 0;
      const complaintEst = Math.round(c.delivered * 0.001); // ~0.1% of sent
      const complaintRate = c.listSize > 0 ? (complaintEst / c.listSize) * 100 : 0;

      // Index formula: bounce weight 40 + unsub weight 40 + complaint weight 20
      const rawIndex =
        (c.bounced / c.listSize) * 40 * 100 +
        (c.unsubscribed / c.listSize) * 40 * 100 +
        (complaintEst / c.listSize) * 20 * 100;

      const index = Math.min(100, Math.round(rawIndex * 10) / 10);

      return {
        id: c.id,
        name: c.name,
        type: c.type,
        sent: c.delivered,
        listSize: c.listSize,
        bounceRate: Math.round(bounceRate * 100) / 100,
        unsubRate: Math.round(unsubRate * 100) / 100,
        complaintEst,
        complaintRate: Math.round(complaintRate * 100) / 100,
        index,
        band: getBand(Math.round(index)),
      };
    });
}

/* ── Monthly trend (synthetic) ───────────────────────── */
function computeMonthlyTrend() {
  return demoMonthly.map(m => {
    const unsubEst = Math.round(m.sent * 0.0025); // ~0.25% unsub rate
    const complaintEst = Math.round(m.sent * 0.001); // ~0.1% complaint
    const rawIndex =
      (m.bounced / m.sent) * 40 * 100 +
      (unsubEst / m.sent) * 40 * 100 +
      (complaintEst / m.sent) * 20 * 100;
    return {
      month: m.month,
      index: Math.round(rawIndex * 10) / 10,
      bounceComponent: Math.round((m.bounced / m.sent) * 40 * 100 * 10) / 10,
      unsubComponent: Math.round((unsubEst / m.sent) * 40 * 100 * 10) / 10,
      complaintComponent: Math.round((complaintEst / m.sent) * 20 * 100 * 10) / 10,
    };
  });
}

/* ── Component ───────────────────────────────────────── */
export default function DisaffectionIndex() {
  const campaigns = computeCampaignIndexes();
  const monthlyTrend = computeMonthlyTrend();

  const [sortKey, setSortKey] = useState<'index' | 'name' | 'bounceRate' | 'unsubRate'>('index');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...campaigns].sort((a, b) => {
    const mul = sortAsc ? 1 : -1;
    if (sortKey === 'name') return mul * a.name.localeCompare(b.name);
    return mul * ((a[sortKey] as number) - (b[sortKey] as number));
  });

  const overallIndex = campaigns.length > 0
    ? Math.round((campaigns.reduce((s, c) => s + c.index, 0) / campaigns.length) * 10) / 10
    : 0;

  const worstCampaign = campaigns.reduce((w, c) => (c.index > w.index ? c : w), campaigns[0]);
  const bestCampaign = campaigns.reduce((b, c) => (c.index < b.index ? c : b), campaigns[0]);

  const trendValues = monthlyTrend.map(m => m.index);
  const trendChange = trendValues.length >= 2
    ? Math.round((trendValues[trendValues.length - 1] - trendValues[trendValues.length - 2]) * 10) / 10
    : 0;

  // Distribution counts
  const distribution = bands.map(b => ({
    ...b,
    count: campaigns.filter(c => Math.round(c.index) >= b.min && Math.round(c.index) <= b.max).length,
  }));

  // Top 3 worst for detail cards
  const worstThree = [...campaigns].sort((a, b) => b.index - a.index).slice(0, 3);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'name'); }
  }

  const SortIcon = ({ col }: { col: typeof sortKey }) => {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">

      {/* ── 1. Branded Header ──────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(124,92,252,0.15), rgba(74,144,217,0.15))' }}>
            <Shield className="w-6 h-6" style={{ color: C.purple }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              DisaffectionIndex<span className="text-[10px] align-super font-bold" style={{ color: C.purple }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              The metric that actually predicts your inbox future.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl mt-2" style={{ color: 'var(--text-secondary)' }}>
          A composite health score combining <strong style={{ color: 'var(--heading)' }}>bounce rate</strong>,{' '}
          <strong style={{ color: 'var(--heading)' }}>unsubscribe rate</strong>, and{' '}
          <strong style={{ color: 'var(--heading)' }}>complaint rate</strong> into a single 0&ndash;100 index per campaign.
          Lower is healthier. The next-generation replacement for open rate &mdash; based on MarTech&rsquo;s 2026 research.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <SparkKpi
          label="Overall Index"
          value={overallIndex}
          sub={`${getBand(Math.round(overallIndex)).label} range`}
          icon={Shield}
          color={getBand(Math.round(overallIndex)).color}
          sparkData={trendValues}
          sparkColor={getBand(Math.round(overallIndex)).color}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                The Overall Index is the weighted average of all sent campaign indexes. A score of{' '}
                <strong style={{ color: 'var(--heading)' }}>{overallIndex}</strong> places ALTA in the{' '}
                <strong style={{ color: getBand(Math.round(overallIndex)).color }}>{getBand(Math.round(overallIndex)).label}</strong> band.
              </p>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] font-bold mb-2" style={{ color: 'var(--heading)' }}>Band Scale</div>
                {bands.map(b => (
                  <div key={b.label} className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: b.color }} />
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {b.label}: {b.min}&ndash;{b.max}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Campaigns Measured"
          value={campaigns.length}
          sub={`of ${demoCampaigns.length} total`}
          icon={Activity}
          color={C.blue}
        />
        <SparkKpi
          label="Highest Risk"
          value={worstCampaign.index}
          sub={worstCampaign.name.length > 28 ? worstCampaign.name.slice(0, 28) + '...' : worstCampaign.name}
          icon={AlertTriangle}
          color={worstCampaign.band.color}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--heading)' }}>{worstCampaign.name}</strong> has the highest DisaffectionIndex
                at <strong style={{ color: worstCampaign.band.color }}>{worstCampaign.index}</strong>.
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Bounce Rate', value: `${worstCampaign.bounceRate}%`, weight: '40%' },
                  { label: 'Unsub Rate', value: `${worstCampaign.unsubRate}%`, weight: '40%' },
                  { label: 'Complaint Rate', value: `${worstCampaign.complaintRate}%`, weight: '20%' },
                ].map(f => (
                  <div key={f.label} className="flex justify-between text-[11px] p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{f.label} <span className="opacity-50">({f.weight})</span></span>
                    <span className="font-bold" style={{ color: 'var(--heading)' }}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Index Trend"
          value={`${trendChange > 0 ? '+' : ''}${trendChange}`}
          sub={trendChange <= 0 ? 'Improving (lower is better)' : 'Increasing — investigate'}
          icon={trendChange <= 0 ? TrendingDown : TrendingUp}
          color={trendChange <= 0 ? C.green : C.red}
          trend={{ value: trendChange <= 0 ? Math.abs(trendChange) : -Math.abs(trendChange), label: 'vs last month' }}
          sparkData={trendValues}
          sparkColor={trendChange <= 0 ? C.green : C.red}
        />
      </div>

      {/* ── 3. Per-Campaign Index Table ────────────────── */}
      <Card
        title="Per-Campaign DisaffectionIndex"
        subtitle={`${campaigns.length} sent campaigns scored — click column headers to sort`}
        className="mb-8"
        detailTitle="How the Index is Calculated"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              The DisaffectionIndex is a weighted composite of three negative engagement signals:
            </p>
            <div className="space-y-2">
              {[
                { label: 'Bounce Rate', weight: 40, desc: 'Hard + soft bounces as a percentage of list size. Indicates list hygiene quality.', color: C.orange },
                { label: 'Unsubscribe Rate', weight: 40, desc: 'Opt-outs as a percentage of list size. Indicates content relevance and send frequency tolerance.', color: C.red },
                { label: 'Complaint Rate', weight: 20, desc: 'Estimated spam complaints as a percentage of list size. The most dangerous signal to ISPs.', color: C.purple },
              ].map(f => (
                <div key={f.label} className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: f.color }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{f.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(124,92,252,0.15)', color: C.purple }}>{f.weight}% weight</span>
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(124,92,252,0.08)', border: '1px solid rgba(124,92,252,0.2)' }}>
              <p className="text-[10px] font-semibold" style={{ color: C.purple }}>
                Formula: (bounced/listSize &times; 40) + (unsubscribed/listSize &times; 40) + (complaints/listSize &times; 20)
              </p>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
                {[
                  { key: 'name' as const, label: 'Campaign' },
                  { key: null, label: 'Sent' },
                  { key: 'bounceRate' as const, label: 'Bounce %' },
                  { key: 'unsubRate' as const, label: 'Unsub %' },
                  { key: null, label: 'Complaint Est.' },
                  { key: 'index' as const, label: 'INDEX' },
                  { key: null, label: 'Health' },
                ].map((col, i) => (
                  <th
                    key={i}
                    onClick={col.key ? () => toggleSort(col.key!) : undefined}
                    className={`text-[9px] uppercase tracking-wider font-bold py-2 pr-3 ${col.key ? 'cursor-pointer select-none' : ''}`}
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {col.label}
                      {col.key && <SortIcon col={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(c => (
                <tr key={c.id} className="border-b transition-colors" style={{ borderColor: 'color-mix(in srgb, var(--card-border) 50%, transparent)' }}>
                  <td className="py-2.5 pr-3">
                    <div className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{c.name}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{c.type}</div>
                  </td>
                  <td className="py-2.5 pr-3 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {c.sent.toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-3 text-xs font-medium" style={{ color: c.bounceRate > 5 ? C.red : c.bounceRate > 3 ? C.orange : 'var(--text-secondary)' }}>
                    {c.bounceRate}%
                  </td>
                  <td className="py-2.5 pr-3 text-xs font-medium" style={{ color: c.unsubRate > 1 ? C.red : c.unsubRate > 0.3 ? C.orange : 'var(--text-secondary)' }}>
                    {c.unsubRate}%
                  </td>
                  <td className="py-2.5 pr-3 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    ~{c.complaintEst}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="text-sm font-extrabold" style={{ color: c.band.color }}>{c.index}</span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <MiniBar value={c.index} max={100} color={c.band.color} height={6} />
                      </div>
                      <span
                        className="text-[8px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap"
                        style={{ background: `${c.band.color}20`, color: c.band.color }}
                      >
                        {c.band.label}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 4 & 5. Charts Row ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Distribution Chart */}
        <Card
          title="Index Distribution"
          subtitle="Campaign count by health band"
          detailTitle="Distribution Analysis"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Shows how ALTA&rsquo;s campaigns distribute across the five health bands. Ideally, most campaigns should cluster in the Excellent and Good bands.
              </p>
              {distribution.map(d => (
                <div key={d.label} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{d.label}</span>
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>({d.min}&ndash;{d.max})</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: d.color }}>
                    {d.count} campaign{d.count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          }
        >
          <ClientChart
            type="bar"
            height={240}
            data={{
              labels: distribution.map(d => d.label),
              datasets: [{
                label: 'Campaigns',
                data: distribution.map(d => d.count),
                backgroundColor: distribution.map(d => d.color + '80'),
                borderColor: distribution.map(d => d.color),
                borderWidth: 1.5,
                borderRadius: 6,
                barPercentage: 0.6,
              }],
            }}
            options={{
              plugins: {
                legend: { display: false },
                datalabels: {
                  display: true,
                  anchor: 'end' as const,
                  align: 'top' as const,
                  color: '#8899aa',
                  font: { size: 11, weight: 'bold' as const },
                  formatter: (v: number) => v > 0 ? v : '',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: '#1e3350' },
                  ticks: { color: '#8899aa', stepSize: 1 },
                  title: { display: true, text: 'Campaigns', color: '#8899aa', font: { size: 10 } },
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#8899aa', font: { size: 10 } },
                },
              },
            }}
          />
        </Card>

        {/* Trend Over Time */}
        <Card
          title="Monthly Index Trend"
          subtitle="Disaffection Index by month (lower is better)"
          detailTitle="Trend Breakdown"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                The monthly trend tracks the composite DisaffectionIndex across all sends. Each month&rsquo;s score is broken down by component:
              </p>
              {monthlyTrend.map(m => (
                <div key={m.month} className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{m.month}</span>
                    <span className="text-sm font-extrabold" style={{ color: getBand(Math.round(m.index)).color }}>{m.index}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Bounce</span>
                      <div className="font-bold" style={{ color: C.orange }}>{m.bounceComponent}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Unsub</span>
                      <div className="font-bold" style={{ color: C.red }}>{m.unsubComponent}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Complaint</span>
                      <div className="font-bold" style={{ color: C.purple }}>{m.complaintComponent}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <ClientChart
            type="line"
            height={240}
            data={{
              labels: monthlyTrend.map(m => m.month),
              datasets: [
                {
                  label: 'DisaffectionIndex',
                  data: monthlyTrend.map(m => m.index),
                  borderColor: C.purple,
                  backgroundColor: 'rgba(124,92,252,0.1)',
                  borderWidth: 2.5,
                  fill: true,
                  tension: 0.35,
                  pointRadius: 5,
                  pointBackgroundColor: monthlyTrend.map(m => getBand(Math.round(m.index)).color),
                  pointBorderColor: monthlyTrend.map(m => getBand(Math.round(m.index)).color),
                  pointBorderWidth: 2,
                },
                {
                  label: 'Bounce Component',
                  data: monthlyTrend.map(m => m.bounceComponent),
                  borderColor: C.orange,
                  borderWidth: 1.5,
                  borderDash: [4, 4],
                  fill: false,
                  tension: 0.35,
                  pointRadius: 3,
                },
                {
                  label: 'Unsub Component',
                  data: monthlyTrend.map(m => m.unsubComponent),
                  borderColor: C.red,
                  borderWidth: 1.5,
                  borderDash: [4, 4],
                  fill: false,
                  tension: 0.35,
                  pointRadius: 3,
                },
              ],
            }}
            options={{
              plugins: {
                legend: { display: true, position: 'top' as const, labels: { color: '#8899aa', usePointStyle: true, padding: 14, font: { size: 10 } } },
                datalabels: { display: false },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: '#1e3350' },
                  ticks: { color: '#8899aa' },
                  title: { display: true, text: 'Index Score', color: '#8899aa', font: { size: 10 } },
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#8899aa' },
                },
              },
            }}
          />
        </Card>
      </div>

      {/* ── 6. Why This Replaces Open Rate ─────────────── */}
      <Card
        title="Why This Replaces Open Rate"
        subtitle="The case for negative-signal measurement in 2026"
        className="mb-8"
        accent={C.purple}
        detailTitle="The Death of Open Rate"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Open rate has been the default email metric since the 1990s. It relies on a tracking pixel loaded when the email is rendered. In 2026, this mechanism is fundamentally broken:
            </p>
            <div className="space-y-3">
              {[
                { title: 'Apple Mail Privacy Protection (MPP)', body: 'Since iOS 15 (2021), Apple pre-fetches all email images — including tracking pixels — regardless of whether the user reads the email. This inflates open rates by approximately 30% for audiences with significant Apple Mail share. ALTA\'s membership skews heavily toward iPhone users.', color: C.red },
                { title: 'Gmail & Outlook Image Proxying', body: 'Both Gmail and Outlook proxy images through their own servers, stripping location data and sometimes pre-loading images. This further erodes open rate accuracy across all major mailbox providers.', color: C.orange },
                { title: 'ISP Filtering Evolution', body: 'In 2026, mailbox providers weight negative signals (bounces, complaints, unsubscribes) far more heavily than positive ones when deciding inbox placement. A sender with a 50% open rate but 2% complaint rate will be throttled faster than one with a 25% open rate and 0.01% complaints.', color: C.yellow },
                { title: 'The DisaffectionIndex Advantage', body: 'By measuring what ISPs actually care about — bounces, complaints, and unsubscribes — the DisaffectionIndex provides a reliable, unfakeable signal of list health. Unlike open rate, these metrics cannot be inflated by privacy features.', color: C.green },
              ].map(item => (
                <div key={item.title} className="p-3 rounded-lg border-l-2" style={{ background: 'var(--input-bg)', borderLeftColor: item.color }}>
                  <div className="text-xs font-bold mb-1" style={{ color: 'var(--heading)' }}>{item.title}</div>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.body}</p>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg text-[10px]" style={{ background: 'rgba(124,92,252,0.08)', border: '1px solid rgba(124,92,252,0.2)' }}>
              <span className="font-bold" style={{ color: C.purple }}>Sources:</span>{' '}
              <span style={{ color: 'var(--text-muted)' }}>MarTech 2026 State of Email, Validity Sender Score Research, Litmus State of Email Analytics 2026</span>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {[
              { icon: AlertTriangle, text: 'Apple MPP inflates open rate by ~30% — your "40% open rate" may actually be 28%.', color: C.red },
              { icon: Shield, text: 'Mailbox providers in 2026 weight negative signals (bounces, complaints) more than positive ones for inbox placement.', color: C.orange },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <item.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: item.color }} />
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.text}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[
              { icon: Activity, text: 'The DisaffectionIndex captures what ISPs actually care about — unfakeable negative engagement signals.', color: C.purple },
              { icon: Info, text: 'Based on 2026 research from MarTech, Validity, and Litmus on mailbox provider filtering behavior.', color: C.blue },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <item.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: item.color }} />
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── 7. Per-Campaign Detail Cards (Worst 3) ─────── */}
      <div className="mb-2">
        <h2 className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>Highest-Risk Campaign Breakdowns</h2>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Detailed factor analysis for the {worstThree.length} campaigns with the highest DisaffectionIndex scores
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {worstThree.map((c, rank) => {
          const bounceContrib = Math.round((c.bounceRate / 100) * 40 * 100 * 10) / 10;
          const unsubContrib = Math.round((c.unsubRate / 100) * 40 * 100 * 10) / 10;
          const complaintContrib = Math.round((c.complaintRate / 100) * 20 * 100 * 10) / 10;

          return (
            <Card
              key={c.id}
              accent={c.band.color}
              detailTitle={`${c.name} — Factor Analysis`}
              detailContent={
                <div className="space-y-4">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Detailed breakdown of how each factor contributes to the overall score of{' '}
                    <strong style={{ color: c.band.color }}>{c.index}</strong>:
                  </p>

                  <div className="space-y-3">
                    {/* Bounce */}
                    <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Bounce Rate</span>
                        <span className="text-xs font-extrabold" style={{ color: C.orange }}>{c.bounceRate}%</span>
                      </div>
                      <MiniBar value={bounceContrib} max={c.index || 1} color={C.orange} height={6} />
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Weight: 40%</span>
                        <span className="text-[9px] font-bold" style={{ color: C.orange }}>Contributes {bounceContrib} pts</span>
                      </div>
                    </div>

                    {/* Unsub */}
                    <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Unsubscribe Rate</span>
                        <span className="text-xs font-extrabold" style={{ color: C.red }}>{c.unsubRate}%</span>
                      </div>
                      <MiniBar value={unsubContrib} max={c.index || 1} color={C.red} height={6} />
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Weight: 40%</span>
                        <span className="text-[9px] font-bold" style={{ color: C.red }}>Contributes {unsubContrib} pts</span>
                      </div>
                    </div>

                    {/* Complaint */}
                    <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Complaint Rate (Est.)</span>
                        <span className="text-xs font-extrabold" style={{ color: C.purple }}>{c.complaintRate}%</span>
                      </div>
                      <MiniBar value={complaintContrib} max={c.index || 1} color={C.purple} height={6} />
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Weight: 20%</span>
                        <span className="text-[9px] font-bold" style={{ color: C.purple }}>Contributes {complaintContrib} pts</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg" style={{ background: 'rgba(124,92,252,0.08)', border: '1px solid rgba(124,92,252,0.2)' }}>
                    <div className="text-[10px] font-bold mb-1" style={{ color: C.purple }}>Recommendation</div>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {c.bounceRate > 5
                        ? 'High bounce rate is the primary driver. Run list verification before next send and remove invalid addresses.'
                        : c.unsubRate > 0.5
                        ? 'Elevated unsubscribe rate suggests content mismatch or over-sending. Review audience segmentation and send frequency.'
                        : 'Scores are within acceptable range. Continue monitoring and maintain current list hygiene practices.'}
                    </p>
                  </div>
                </div>
              }
            >
              <div className="p-4">
                {/* Rank badge + score */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: `${c.band.color}20`, color: c.band.color }}
                    >
                      #{rank + 1} Risk
                    </span>
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: `${c.band.color}20`, color: c.band.color }}
                    >
                      {c.band.label}
                    </span>
                  </div>
                  <span className="text-2xl font-extrabold" style={{ color: c.band.color }}>{c.index}</span>
                </div>

                {/* Campaign name */}
                <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--heading)' }}>{c.name}</div>
                <div className="text-[9px] mb-3" style={{ color: 'var(--text-muted)' }}>{c.type} &middot; {c.sent.toLocaleString()} delivered</div>

                {/* Factor bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[9px] mb-1">
                      <span style={{ color: 'var(--text-muted)' }}>Bounce ({c.bounceRate}%)</span>
                      <span className="font-bold" style={{ color: C.orange }}>{bounceContrib} pts</span>
                    </div>
                    <MiniBar value={bounceContrib} max={Math.max(bounceContrib, unsubContrib, complaintContrib, 1)} color={C.orange} height={5} />
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] mb-1">
                      <span style={{ color: 'var(--text-muted)' }}>Unsub ({c.unsubRate}%)</span>
                      <span className="font-bold" style={{ color: C.red }}>{unsubContrib} pts</span>
                    </div>
                    <MiniBar value={unsubContrib} max={Math.max(bounceContrib, unsubContrib, complaintContrib, 1)} color={C.red} height={5} />
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] mb-1">
                      <span style={{ color: 'var(--text-muted)' }}>Complaint ({c.complaintRate}%)</span>
                      <span className="font-bold" style={{ color: C.purple }}>{complaintContrib} pts</span>
                    </div>
                    <MiniBar value={complaintContrib} max={Math.max(bounceContrib, unsubContrib, complaintContrib, 1)} color={C.purple} height={5} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Footer attribution ─────────────────────────── */}
      <div className="text-center py-4">
        <p className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>
          DisaffectionIndex&trade; &mdash; A MEMTrak proprietary metric &middot; Demo data for proof-of-concept
        </p>
      </div>
    </div>
  );
}
