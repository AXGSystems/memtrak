'use client';

import { useState } from 'react';
import { Layers, Zap, BarChart3, Activity, CheckCircle, XCircle, MinusCircle, Info, X, Radio, Mail, Globe, Server } from 'lucide-react';
import Card from '@/components/Card';
import SparkKpi, { MiniBar } from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { demoCampaigns, demoMonthly, type DemoCampaign } from '@/lib/demo-data';

/* ── Palette ──────────────────────────────────────────────── */
const C = {
  navy: '#002D5C',
  blue: '#4A90D9',
  green: '#8CC63F',
  amber: '#E8923F',
  red: '#D94A4A',
  purple: '#7C5CFC',
  cyan: '#22d3ee',
};

const SOURCE_COLORS: Record<string, string> = {
  MEMTrak: C.green,
  'Higher Logic': C.blue,
  Outlook: C.amber,
};

const SOURCE_ICONS: Record<string, typeof Server> = {
  MEMTrak: Server,
  'Higher Logic': Globe,
  Outlook: Mail,
};

/* ── Helpers ──────────────────────────────────────────────── */
const sentCampaigns = demoCampaigns.filter(c => c.status === 'Sent');

function getSourceStats(source: DemoCampaign['source']) {
  const campaigns = sentCampaigns.filter(c => c.source === source);
  const totalSent = campaigns.reduce((s, c) => s + c.delivered, 0);
  const totalOpened = campaigns.reduce((s, c) => s + c.uniqueOpened, 0);
  const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
  return { campaigns, count: campaigns.length, totalSent, totalOpened, avgOpenRate };
}

const memtrakStats = getSourceStats('MEMTrak');
const hlStats = getSourceStats('Higher Logic');
const outlookStats = getSourceStats('Outlook');

const combinedSends = sentCampaigns.reduce((s, c) => s + c.delivered, 0);
const combinedOpened = sentCampaigns.reduce((s, c) => s + c.uniqueOpened, 0);
const unifiedOpenRate = combinedSends > 0 ? (combinedOpened / combinedSends) * 100 : 0;

/* sorted timeline — all sent campaigns by date descending */
const timeline = [...sentCampaigns]
  .filter(c => c.sentDate)
  .sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());

/* ── Coverage Matrix Data ─────────────────────────────────── */
const coverageMatrix = [
  { capability: 'Open Tracking',        memtrak: 'Full',         hl: 'Aggregate',    outlook: 'None' },
  { capability: 'Click Tracking',       memtrak: 'Per-link',     hl: 'Aggregate',    outlook: 'None' },
  { capability: 'Revenue Attribution',  memtrak: 'Full',         hl: 'None',         outlook: 'None' },
  { capability: 'A/B Testing',          memtrak: 'Full',         hl: 'Subject only', outlook: 'None' },
  { capability: 'Automation',           memtrak: 'Full',         hl: 'Basic',        outlook: 'None' },
  { capability: 'Staff Attribution',    memtrak: 'Full',         hl: 'None',         outlook: 'Manual' },
];

function CoverageIcon({ val }: { val: string }) {
  if (val === 'None') return <XCircle className="w-3.5 h-3.5 inline" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />;
  if (val === 'Full') return <CheckCircle className="w-3.5 h-3.5 inline" style={{ color: C.green }} />;
  return <MinusCircle className="w-3.5 h-3.5 inline" style={{ color: C.blue }} />;
}

/* ── Monthly combined metrics (from demoMonthly) ──────────── */
const monthLabels = demoMonthly.map(m => m.month);
const monthlySent = demoMonthly.map(m => m.sent);
const monthlyOpened = demoMonthly.map(m => m.opened);

/* ═══════════════════════════════════════════════════════════ */
export default function UnifiedPulsePage() {
  const [detailModal, setDetailModal] = useState<{ title: string; content: React.ReactNode } | null>(null);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">

      {/* ── 1. Branded Header ─────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #7C5CFC 0%, #4A90D9 100%)' }}
          >
            <Layers className="w-5 h-5" style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              UnifiedPulse<span style={{ color: C.purple }}>&#8482;</span>
            </h1>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              One view. Every email. Every platform.
            </p>
          </div>
        </div>
        <div
          className="mt-3 rounded-lg px-3 py-2 flex items-center gap-2 text-[11px]"
          style={{ background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--text-muted)' }}
        >
          <Radio className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.green }} />
          <span>
            Cross-platform intelligence aggregation across <strong style={{ color: 'var(--heading)' }}>3 connected platforms</strong> &mdash; MEMTrak, Higher Logic, and Outlook.
          </span>
        </div>
      </header>

      {/* ── 2. SparkKpi Row ───────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <SparkKpi
          label="Total Platforms"
          value="3"
          sub="MEMTrak + Higher Logic + Outlook"
          icon={Layers}
          color={C.purple}
          accent
          sparkData={[1, 1, 2, 2, 3, 3, 3]}
          sparkColor={C.purple}
          detail={
            <div>
              <div className="space-y-3 text-xs" style={{ color: 'var(--text)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: C.green }} />
                  <strong>MEMTrak</strong> &mdash; Full tracking, revenue attribution, automation
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: C.blue }} />
                  <strong>Higher Logic</strong> &mdash; Open/click aggregate data, basic automation
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: C.amber }} />
                  <strong>Outlook</strong> &mdash; Manual logging, staff attribution only
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Combined Sends"
          value={combinedSends.toLocaleString()}
          sub={`${sentCampaigns.length} campaigns across all platforms`}
          icon={Zap}
          color={C.cyan}
          accent
          sparkData={monthlySent}
          sparkColor={C.cyan}
          trend={{ value: 8.2, label: 'vs last quarter' }}
          detail={
            <div className="space-y-2 text-xs" style={{ color: 'var(--text)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Delivered emails across all connected platforms this period.</p>
              <div className="space-y-1.5 mt-3">
                {(['MEMTrak', 'Higher Logic', 'Outlook'] as const).map(src => {
                  const s = getSourceStats(src);
                  return (
                    <div key={src} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: SOURCE_COLORS[src] }} />
                        <span>{src}</span>
                      </div>
                      <span className="font-bold" style={{ color: 'var(--heading)' }}>{s.totalSent.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Unified Open Rate"
          value={`${unifiedOpenRate.toFixed(1)}%`}
          sub="Weighted average across all sources"
          icon={BarChart3}
          color={C.green}
          accent
          sparkData={demoMonthly.map(m => m.delivered > 0 ? (m.opened / m.delivered) * 100 : 0)}
          sparkColor={C.green}
          trend={{ value: 3.1, label: 'vs last quarter' }}
          detail={
            <div className="space-y-2 text-xs" style={{ color: 'var(--text)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Open rate calculated as weighted average (unique opens / delivered) across all sources.</p>
              <div className="space-y-2 mt-3">
                {(['MEMTrak', 'Higher Logic', 'Outlook'] as const).map(src => {
                  const s = getSourceStats(src);
                  return (
                    <div key={src}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: SOURCE_COLORS[src] }} />
                          <span>{src}</span>
                        </div>
                        <span className="font-bold" style={{ color: 'var(--heading)' }}>{s.avgOpenRate.toFixed(1)}%</span>
                      </div>
                      <MiniBar value={s.avgOpenRate} color={SOURCE_COLORS[src]} />
                    </div>
                  );
                })}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Data Freshness"
          value="Real-time"
          sub="All platforms syncing"
          icon={Activity}
          color={C.green}
          accent
          sparkData={[95, 96, 98, 97, 99, 100, 100]}
          sparkColor={C.green}
          detail={
            <div className="space-y-3 text-xs" style={{ color: 'var(--text)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Sync cadence by platform:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>MEMTrak</span>
                  <span className="font-bold" style={{ color: C.green }}>Real-time (webhook)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Higher Logic</span>
                  <span className="font-bold" style={{ color: C.blue }}>Every 15 min (API poll)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Outlook</span>
                  <span className="font-bold" style={{ color: C.amber }}>Manual entry (staff logged)</span>
                </div>
              </div>
            </div>
          }
        />
      </section>

      {/* ── 3. Platform Health Cards ──────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {([
          {
            name: 'MEMTrak' as const,
            stats: memtrakStats,
            status: 'Full Tracking',
            statusColor: C.green,
            desc: 'Complete open, click, revenue, and automation tracking with per-link granularity.',
          },
          {
            name: 'Higher Logic' as const,
            stats: hlStats,
            status: 'Open/Click Data',
            statusColor: C.blue,
            desc: 'Aggregate open and click metrics via API integration. No per-link or revenue data.',
          },
          {
            name: 'Outlook' as const,
            stats: outlookStats,
            status: 'Manual Logging',
            statusColor: C.amber,
            desc: 'Staff-logged sends with self-reported open data. No automated tracking.',
          },
        ]).map(platform => {
          const Icon = SOURCE_ICONS[platform.name];
          return (
            <Card
              key={platform.name}
              title={platform.name}
              subtitle={platform.desc}
              accent={SOURCE_COLORS[platform.name]}
              detailTitle={`${platform.name} — Platform Details`}
              detailContent={
                <div className="space-y-4 text-xs" style={{ color: 'var(--text)' }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                      <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Campaigns</div>
                      <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{platform.stats.count}</div>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                      <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Total Delivered</div>
                      <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{platform.stats.totalSent.toLocaleString()}</div>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                      <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Unique Opens</div>
                      <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{platform.stats.totalOpened.toLocaleString()}</div>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                      <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Avg Open Rate</div>
                      <div className="text-lg font-extrabold" style={{ color: SOURCE_COLORS[platform.name] }}>{platform.stats.avgOpenRate.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Campaigns</div>
                    <div className="space-y-1.5">
                      {platform.stats.campaigns.map(c => (
                        <div key={c.id} className="flex items-center justify-between py-1 border-b" style={{ borderColor: 'var(--card-border)' }}>
                          <span className="truncate mr-3">{c.name}</span>
                          <span className="font-bold flex-shrink-0" style={{ color: 'var(--heading)' }}>{c.delivered.toLocaleString()} sent</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              }
            >
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4" style={{ color: SOURCE_COLORS[platform.name] }} />
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${platform.statusColor} 15%, transparent)`,
                      color: platform.statusColor,
                    }}
                  >
                    {platform.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Campaigns</div>
                    <div className="text-base font-extrabold" style={{ color: 'var(--heading)' }}>{platform.stats.count}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Delivered</div>
                    <div className="text-base font-extrabold" style={{ color: 'var(--heading)' }}>{platform.stats.totalSent.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Open Rate</div>
                    <div className="text-base font-extrabold" style={{ color: SOURCE_COLORS[platform.name] }}>{platform.stats.avgOpenRate.toFixed(1)}%</div>
                  </div>
                </div>
                <MiniBar value={platform.stats.avgOpenRate} color={SOURCE_COLORS[platform.name]} />
              </div>
            </Card>
          );
        })}
      </section>

      {/* ── 4. Unified Timeline ───────────────────────────── */}
      <Card
        title="Unified Timeline"
        subtitle="All campaigns across all sources, sorted by date"
        className="mb-6"
        detailTitle="Unified Campaign Timeline"
        detailContent={
          <div className="space-y-2 text-xs" style={{ color: 'var(--text)' }}>
            {timeline.map(c => (
              <div key={c.id} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold" style={{ color: 'var(--heading)' }}>{c.name}</span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `color-mix(in srgb, ${SOURCE_COLORS[c.source]} 15%, transparent)`, color: SOURCE_COLORS[c.source] }}
                  >
                    {c.source}
                  </span>
                </div>
                <div className="flex items-center gap-4" style={{ color: 'var(--text-muted)' }}>
                  <span>{new Date(c.sentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>{c.delivered.toLocaleString()} delivered</span>
                  <span>{c.uniqueOpened.toLocaleString()} opens</span>
                  <span>{c.delivered > 0 ? ((c.uniqueOpened / c.delivered) * 100).toFixed(1) : 0}% rate</span>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="relative pl-6 space-y-0 mt-2">
          {/* vertical timeline line */}
          <div
            className="absolute left-[9px] top-2 bottom-2 w-px"
            style={{ background: 'var(--card-border)' }}
          />
          {timeline.map((c, i) => {
            const color = SOURCE_COLORS[c.source];
            const openRate = c.delivered > 0 ? ((c.uniqueOpened / c.delivered) * 100).toFixed(1) : '0.0';
            return (
              <div key={c.id} className="relative pb-4 last:pb-0">
                {/* dot */}
                <div
                  className="absolute -left-6 top-1.5 w-[10px] h-[10px] rounded-full border-2"
                  style={{ background: color, borderColor: 'var(--card)' }}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold truncate" style={{ color: 'var(--heading)' }}>
                        {c.name}
                      </span>
                      <span
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
                      >
                        {c.source}
                      </span>
                    </div>
                    <div className="text-[10px] flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
                      <span>{new Date(c.sentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>{c.delivered.toLocaleString()} delivered</span>
                      <span>{c.uniqueOpened.toLocaleString()} opens</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm font-extrabold" style={{ color }}>{openRate}%</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>open rate</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── 5. Source Comparison Charts ────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card title="Volume by Source" subtitle="Total emails delivered per platform">
          <div className="mt-2">
            <ClientChart
              type="bar"
              height={240}
              data={{
                labels: ['MEMTrak', 'Higher Logic', 'Outlook'],
                datasets: [{
                  label: 'Delivered',
                  data: [memtrakStats.totalSent, hlStats.totalSent, outlookStats.totalSent],
                  backgroundColor: [
                    `color-mix(in srgb, ${C.green} 75%, transparent)`,
                    `color-mix(in srgb, ${C.blue} 75%, transparent)`,
                    `color-mix(in srgb, ${C.amber} 75%, transparent)`,
                  ],
                  borderColor: [C.green, C.blue, C.amber],
                  borderWidth: 1,
                  borderRadius: 6,
                }],
              }}
              options={{
                plugins: {
                  legend: { display: false },
                  datalabels: {
                    display: true,
                    color: '#8899aa',
                    anchor: 'end' as const,
                    align: 'top' as const,
                    font: { size: 11, weight: 'bold' as const },
                    formatter: (v: number) => v.toLocaleString(),
                  },
                },
                scales: {
                  y: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
                  x: { grid: { display: false }, ticks: { color: '#8899aa' } },
                },
              }}
            />
          </div>
        </Card>

        <Card title="Open Rate by Source" subtitle="Which platform performs best">
          <div className="mt-2">
            <ClientChart
              type="bar"
              height={240}
              data={{
                labels: ['MEMTrak', 'Higher Logic', 'Outlook'],
                datasets: [{
                  label: 'Open Rate %',
                  data: [
                    parseFloat(memtrakStats.avgOpenRate.toFixed(1)),
                    parseFloat(hlStats.avgOpenRate.toFixed(1)),
                    parseFloat(outlookStats.avgOpenRate.toFixed(1)),
                  ],
                  backgroundColor: [
                    `color-mix(in srgb, ${C.green} 75%, transparent)`,
                    `color-mix(in srgb, ${C.blue} 75%, transparent)`,
                    `color-mix(in srgb, ${C.amber} 75%, transparent)`,
                  ],
                  borderColor: [C.green, C.blue, C.amber],
                  borderWidth: 1,
                  borderRadius: 6,
                }],
              }}
              options={{
                plugins: {
                  legend: { display: false },
                  datalabels: {
                    display: true,
                    color: '#8899aa',
                    anchor: 'end' as const,
                    align: 'top' as const,
                    font: { size: 11, weight: 'bold' as const },
                    formatter: (v: number) => `${v}%`,
                  },
                },
                scales: {
                  y: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => `${v}%` }, max: 100 },
                  x: { grid: { display: false }, ticks: { color: '#8899aa' } },
                },
              }}
            />
          </div>
        </Card>
      </section>

      {/* ── 6. Platform Coverage Matrix ───────────────────── */}
      <Card
        title="Platform Coverage Matrix"
        subtitle="What each connected platform can track"
        className="mb-6"
        detailTitle="Platform Capabilities Breakdown"
        detailContent={
          <div className="text-xs space-y-4" style={{ color: 'var(--text)' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              UnifiedPulse normalizes data from all sources, but each platform provides different levels of granularity.
              MEMTrak provides the most comprehensive tracking, while Outlook relies on manual staff logging.
            </p>
            {coverageMatrix.map(row => (
              <div key={row.capability} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="font-bold mb-2" style={{ color: 'var(--heading)' }}>{row.capability}</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5"><CoverageIcon val={row.memtrak} /> MEMTrak: {row.memtrak}</div>
                  <div className="flex items-center gap-1.5"><CoverageIcon val={row.hl} /> Higher Logic: {row.hl}</div>
                  <div className="flex items-center gap-1.5"><CoverageIcon val={row.outlook} /> Outlook: {row.outlook}</div>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs" style={{ color: 'var(--text)' }}>
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
                <th className="text-left py-2 pr-4 text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Capability</th>
                <th className="text-center py-2 px-3 text-[9px] uppercase tracking-wider font-bold" style={{ color: C.green }}>
                  <div className="flex items-center justify-center gap-1"><Server className="w-3 h-3" /> MEMTrak</div>
                </th>
                <th className="text-center py-2 px-3 text-[9px] uppercase tracking-wider font-bold" style={{ color: C.blue }}>
                  <div className="flex items-center justify-center gap-1"><Globe className="w-3 h-3" /> Higher Logic</div>
                </th>
                <th className="text-center py-2 px-3 text-[9px] uppercase tracking-wider font-bold" style={{ color: C.amber }}>
                  <div className="flex items-center justify-center gap-1"><Mail className="w-3 h-3" /> Outlook</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {coverageMatrix.map((row, i) => (
                <tr key={row.capability} className="border-b" style={{ borderColor: 'var(--card-border)' }}>
                  <td className="py-2.5 pr-4 font-semibold" style={{ color: 'var(--heading)' }}>{row.capability}</td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <CoverageIcon val={row.memtrak} />
                      <span style={{ color: row.memtrak === 'None' ? 'var(--text-muted)' : 'var(--text)' }}>{row.memtrak === 'None' ? '' : row.memtrak}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <CoverageIcon val={row.hl} />
                      <span style={{ color: row.hl === 'None' ? 'var(--text-muted)' : 'var(--text)' }}>{row.hl === 'None' ? '' : row.hl}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <CoverageIcon val={row.outlook} />
                      <span style={{ color: row.outlook === 'None' ? 'var(--text-muted)' : 'var(--text)' }}>{row.outlook === 'None' ? '' : row.outlook}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 7. Unified Metrics Over Time ──────────────────── */}
      <Card
        title="Unified Metrics Over Time"
        subtitle="Combined sends and opens across all platforms by month"
        className="mb-6"
      >
        <div className="mt-2">
          <ClientChart
            type="line"
            height={280}
            data={{
              labels: monthLabels,
              datasets: [
                {
                  label: 'Total Sent',
                  data: monthlySent,
                  borderColor: C.purple,
                  backgroundColor: `color-mix(in srgb, ${C.purple} 10%, transparent)`,
                  fill: true,
                  tension: 0.35,
                  pointRadius: 4,
                  pointBackgroundColor: C.purple,
                  pointBorderColor: 'var(--card)',
                  pointBorderWidth: 2,
                },
                {
                  label: 'Total Opened',
                  data: monthlyOpened,
                  borderColor: C.green,
                  backgroundColor: `color-mix(in srgb, ${C.green} 10%, transparent)`,
                  fill: true,
                  tension: 0.35,
                  pointRadius: 4,
                  pointBackgroundColor: C.green,
                  pointBorderColor: 'var(--card)',
                  pointBorderWidth: 2,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom' as const,
                  labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 11 } },
                },
              },
              scales: {
                y: {
                  grid: { color: '#1e3350' },
                  ticks: { color: '#8899aa', callback: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v },
                },
                x: { grid: { display: false }, ticks: { color: '#8899aa' } },
              },
            }}
          />
        </div>
      </Card>

      {/* ── 8. Why UnifiedPulse Matters ───────────────────── */}
      <Card className="mb-6">
        <div className="flex items-start gap-4">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 mt-0.5"
            style={{ background: 'linear-gradient(135deg, #7C5CFC 0%, #4A90D9 100%)' }}
          >
            <Info className="w-5 h-5" style={{ color: '#fff' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--heading)' }}>
              Why UnifiedPulse Matters
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text)' }}>
              Most organizations use 3&ndash;5 tools for email. Each has its own dashboard, its own metrics, its own definition
              of &ldquo;open rate.&rdquo; UnifiedPulse normalizes everything into one view so you can answer
              &ldquo;how are our emails performing?&rdquo; without checking 3 logins.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.purple }}>Before UnifiedPulse</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>3 logins, 3 dashboards, 3 definitions of success. Hours of manual reconciliation.</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.green }}>After UnifiedPulse</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>One dashboard. Normalized metrics. Instant cross-platform comparison. Real answers in seconds.</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.cyan }}>The Advantage</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>See which platform drives the best engagement. Identify gaps. Make data-driven decisions about where to send.</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Detail Modal (generic) ────────────────────────── */}
      {detailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{detailModal.title}</h3>
              <button onClick={() => setDetailModal(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">{detailModal.content}</div>
          </div>
        </div>
      )}
    </div>
  );
}
