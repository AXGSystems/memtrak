'use client';

import Card from '@/components/Card';
import SparkKpi, { MiniBar } from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { demoCampaigns, demoMonthly } from '@/lib/demo-data';
import {
  DollarSign,
  Send,
  Trophy,
  Clock,
  ArrowRight,
  Zap,
  TrendingUp,
  Target,
  Info,
} from 'lucide-react';

/* ── Color palette ──────────────────────────────────── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  emerald: '#10B981',
  teal: '#14B8A6',
  gold: '#D4A843',
};

/* ── Type colors for charts ──────────────────────────── */
const typeColors: Record<string, string> = {
  Compliance: C.blue,
  Renewal: C.green,
  Events: C.purple,
  Newsletter: C.teal,
  Onboarding: C.orange,
  Advocacy: C.amber,
  Retention: C.emerald,
};

/* ── Data derivation ─────────────────────────────────── */
const sentCampaigns = demoCampaigns.filter((c) => c.status === 'Sent');
const revenueCampaigns = sentCampaigns.filter((c) => c.revenue > 0).sort((a, b) => b.revenue - a.revenue);
const totalRevenue = sentCampaigns.reduce((s, c) => s + c.revenue, 0);
const totalSent = sentCampaigns.reduce((s, c) => s + c.listSize, 0);
const revenuePerSend = totalRevenue / totalSent;
const topCampaign = revenueCampaigns[0];
const AVG_TRANSACTION = 1216; // average transaction value for conversion calc

/* Revenue by type aggregation */
const revenueByType: Record<string, number> = {};
sentCampaigns.forEach((c) => {
  if (c.revenue > 0) {
    revenueByType[c.type] = (revenueByType[c.type] || 0) + c.revenue;
  }
});
const typeLabels = Object.keys(revenueByType);
const typeValues = Object.values(revenueByType);
const typeChartColors = typeLabels.map((t) => typeColors[t] || C.blue);

/* Synthetic monthly revenue trend based on demoMonthly clicks with multiplier */
const monthlyRevenueTrend = demoMonthly.map((m) => ({
  month: m.month,
  revenue: Math.round(m.clicked * 135 + m.opened * 8),
}));

/* Table data — attribution breakdown */
const tableRows = sentCampaigns
  .filter((c) => c.revenue > 0 || c.clicked > 0)
  .sort((a, b) => b.revenue - a.revenue)
  .map((c) => {
    const conversions = c.revenue > 0 ? Math.round(c.revenue / AVG_TRANSACTION) : 0;
    const revPerEmail = c.listSize > 0 ? c.revenue / c.listSize : 0;
    const cost = c.listSize * 0.012; // synthetic cost: $0.012 per send
    const roi = cost > 0 ? ((c.revenue - cost) / cost) * 100 : 0;
    return { ...c, conversions, revPerEmail, roi };
  });

export default function RevenueTrace() {
  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(140,198,63,0.2) 0%, rgba(212,168,67,0.2) 100%)',
              border: '1px solid rgba(140,198,63,0.3)',
            }}
          >
            <DollarSign className="w-5 h-5" style={{ color: C.green }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              RevenueTrace<span style={{ color: C.green, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.gold }}>
              Every dollar traced to the email that earned it.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Per-email, per-subject-line revenue attribution with a 14-day attribution window and multi-touch
          weighting. RevenueTrace connects every renewal, registration, and pledge back to the specific
          campaign that drove it — giving you true ROI for every send.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Total Attributed Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          sub="All sent campaigns"
          icon={DollarSign}
          color={C.green}
          sparkData={monthlyRevenueTrend.map((m) => m.revenue)}
          sparkColor={C.green}
          trend={{ value: 18.4, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Revenue Per Send"
          value={`$${revenuePerSend.toFixed(2)}`}
          sub={`${totalSent.toLocaleString()} total sends`}
          icon={Send}
          color={C.blue}
          sparkData={[28.2, 30.1, 32.5, 35.8, 38.2, 42.1, revenuePerSend]}
          sparkColor={C.blue}
          trend={{ value: 12.1, label: 'vs last month' }}
          accent
        />
        <SparkKpi
          label="Top Campaign Revenue"
          value={`$${topCampaign.revenue.toLocaleString()}`}
          sub={topCampaign.name.length > 30 ? topCampaign.name.slice(0, 30) + '...' : topCampaign.name}
          icon={Trophy}
          color={C.gold}
          sparkData={revenueCampaigns.slice(0, 7).map((c) => c.revenue).reverse()}
          sparkColor={C.gold}
          accent
          detail={
            <div>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                Top 5 revenue-generating campaigns in the current period:
              </p>
              <div className="space-y-3">
                {revenueCampaigns.slice(0, 5).map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span
                      className="text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--heading)' }}>{c.name}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {c.type} &middot; {c.listSize.toLocaleString()} sent
                      </p>
                    </div>
                    <span className="text-sm font-extrabold" style={{ color: C.green }}>
                      ${c.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Attribution Window"
          value="14 days"
          sub="Multi-touch weighted"
          icon={Clock}
          color={C.purple}
          accent
          detail={
            <div>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                RevenueTrace uses a 14-day attribution window with multi-touch weighting:
              </p>
              <div className="space-y-3">
                {[
                  { label: 'First Touch', pct: '30%', desc: 'First email the member opened in the window', color: C.blue },
                  { label: 'Last Touch', pct: '40%', desc: 'Last email before conversion event', color: C.green },
                  { label: 'Assist Touches', pct: '30%', desc: 'All emails opened between first and last', color: C.purple },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg p-3 border" style={{ borderColor: 'var(--card-border)', background: 'var(--input-bg)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{m.label}</span>
                      <span className="text-xs font-extrabold" style={{ color: m.color }}>{m.pct}</span>
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(140,198,63,0.08)', border: '1px solid rgba(140,198,63,0.2)' }}>
                <p className="text-[10px] font-semibold" style={{ color: C.green }}>
                  Why 14 days? Our analysis of ALTA member behavior shows 92% of conversions happen within 14 days of the first email interaction. Longer windows dilute attribution accuracy.
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* ── 3. Revenue Waterfall Chart ────────────────────────── */}
      <Card
        title="Revenue by Campaign"
        subtitle="Attributed revenue per campaign — sorted by highest earners"
        className="mb-6"
        detailTitle="Revenue Waterfall — Full Breakdown"
        detailContent={
          <div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Each bar shows the total revenue attributed to a campaign within the 14-day window.
              Multi-touch attribution distributes credit across all emails the member opened before converting.
            </p>
            <div className="space-y-2">
              {revenueCampaigns.map((c) => {
                const pct = (c.revenue / totalRevenue) * 100;
                return (
                  <div key={c.id} className="rounded-lg p-3 border" style={{ borderColor: 'var(--card-border)', background: 'var(--input-bg)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold truncate max-w-[60%]" style={{ color: 'var(--heading)' }}>{c.name}</span>
                      <span className="text-xs font-extrabold" style={{ color: C.green }}>${c.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MiniBar value={pct} max={100} color={typeColors[c.type] || C.green} />
                      <span className="text-[10px] font-bold flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{pct.toFixed(1)}%</span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      {c.type} &middot; {c.listSize.toLocaleString()} sent &middot; {c.uniqueOpened.toLocaleString()} opened &middot; {c.clicked.toLocaleString()} clicked
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        }
      >
        <div className="pt-2">
          <ClientChart
            type="bar"
            height={280}
            data={{
              labels: revenueCampaigns.map((c) =>
                c.name.length > 28 ? c.name.slice(0, 28) + '...' : c.name
              ),
              datasets: [
                {
                  label: 'Attributed Revenue',
                  data: revenueCampaigns.map((c) => c.revenue),
                  backgroundColor: revenueCampaigns.map((c) => typeColors[c.type] || C.green),
                  borderRadius: 6,
                  borderSkipped: false,
                  barThickness: 24,
                },
              ],
            }}
            options={{
              indexAxis: 'y' as const,
              scales: {
                x: {
                  grid: { color: '#1e3350' },
                  ticks: {
                    color: '#8899aa',
                    callback: (v: number) => `$${(v / 1000).toFixed(0)}k`,
                  },
                },
                y: {
                  grid: { display: false },
                  ticks: { color: '#8899aa', font: { size: 10 } },
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (ctx: { raw: number }) => ` $${ctx.raw.toLocaleString()}`,
                  },
                },
              },
            }}
          />
        </div>
      </Card>

      {/* ── 4. Attribution Breakdown Table ────────────────────── */}
      <Card
        title="Attribution Breakdown"
        subtitle="Per-campaign revenue attribution with ROI metrics"
        className="mb-6"
        noPad
        detailTitle="Attribution Methodology"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Revenue is attributed using a 14-day multi-touch model. Conversions are estimated using the average transaction value of ${AVG_TRANSACTION.toLocaleString()}. ROI is calculated against an estimated cost of $0.012 per send.
            </p>
            <div className="rounded-lg p-3" style={{ background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)' }}>
              <p className="text-[10px] font-semibold" style={{ color: C.blue }}>
                Note: In production, RevenueTrace connects directly to your AMS and payment processor for exact conversion tracking. Demo values use estimated averages.
              </p>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ color: 'var(--foreground)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {['Campaign', 'Type', 'Sent', 'Opens', 'Clicks', 'Conv.', 'Revenue', '$/Email', 'ROI'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-[9px] uppercase tracking-wider font-bold text-left"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr
                  key={row.id}
                  className="transition-colors"
                  style={{
                    borderBottom: i < tableRows.length - 1 ? '1px solid var(--card-border)' : undefined,
                    background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(140,198,63,0.04)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)')}
                >
                  <td className="px-4 py-3">
                    <span className="font-semibold" style={{ color: 'var(--heading)' }}>
                      {row.name.length > 35 ? row.name.slice(0, 35) + '...' : row.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `color-mix(in srgb, ${typeColors[row.type] || C.blue} 12%, transparent)`,
                        color: typeColors[row.type] || C.blue,
                      }}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                    {row.listSize.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                    {row.uniqueOpened.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                    {row.clicked.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-bold" style={{ color: row.conversions > 0 ? C.green : 'var(--text-muted)' }}>
                    {row.conversions}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-extrabold" style={{ color: row.revenue > 0 ? C.green : 'var(--text-muted)' }}>
                      {row.revenue > 0 ? `$${row.revenue.toLocaleString()}` : '$0'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold" style={{ color: row.revPerEmail > 0 ? 'var(--heading)' : 'var(--text-muted)' }}>
                    ${row.revPerEmail.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {row.roi > 0 ? (
                      <span className="font-extrabold" style={{ color: C.green }}>
                        {row.roi >= 10000 ? `${(row.roi / 1000).toFixed(0)}k` : row.roi.toFixed(0)}%
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 5. Multi-Touch Attribution Model ─────────────────── */}
      <Card
        title="Multi-Touch Attribution Model"
        subtitle="How RevenueTrace distributes credit across the member journey"
        className="mb-6"
        detailTitle="Attribution Model Deep Dive"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Unlike last-touch attribution which gives all credit to the final email, RevenueTrace uses a
              position-based multi-touch model that recognizes every email&apos;s contribution to the conversion.
            </p>
            <div className="space-y-2">
              {[
                { label: 'First Touch', pct: 30, color: C.blue, desc: 'The email that first captured attention and started the journey toward conversion. Gets 30% credit for initiating engagement.' },
                { label: 'Last Touch', pct: 40, color: C.green, desc: 'The final email before the member converted. Gets the highest weight (40%) because it directly preceded the action.' },
                { label: 'Assist Touches', pct: 30, color: C.purple, desc: 'All emails opened between first and last touch. Credit is split evenly among assists, recognizing their nurturing role.' },
              ].map((m) => (
                <div key={m.label} className="rounded-lg p-4 border" style={{ borderColor: 'var(--card-border)', background: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{m.label}</span>
                    <span className="text-lg font-extrabold" style={{ color: m.color }}>{m.pct}%</span>
                  </div>
                  <MiniBar value={m.pct} max={100} color={m.color} height={6} />
                  <p className="text-[10px] mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <div className="pt-2">
          {/* Attribution Weight Bars */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'First Touch', pct: 30, color: C.blue, icon: Zap, desc: 'First email opened' },
              { label: 'Last Touch', pct: 40, color: C.green, icon: Target, desc: 'Last email before conversion' },
              { label: 'Assist', pct: 30, color: C.purple, icon: ArrowRight, desc: 'All emails in between' },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-lg p-3 border text-center"
                style={{ borderColor: 'var(--card-border)', background: 'var(--input-bg)' }}
              >
                <m.icon className="w-4 h-4 mx-auto mb-2" style={{ color: m.color }} />
                <div className="text-lg font-extrabold" style={{ color: m.color }}>
                  {m.pct}%
                </div>
                <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>
                  {m.label}
                </div>
                <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {m.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Example Journey Visualization */}
          <div
            className="rounded-xl p-4 border"
            style={{
              borderColor: 'rgba(140,198,63,0.2)',
              background: 'linear-gradient(135deg, rgba(140,198,63,0.04) 0%, rgba(168,85,247,0.04) 100%)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-3.5 h-3.5" style={{ color: C.gold }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.gold }}>
                Example: Liberty Title Group Renewal ($1,216)
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Email 1 — First Touch */}
              <div
                className="flex-1 min-w-[120px] rounded-lg p-3 border text-center"
                style={{ borderColor: 'rgba(74,144,217,0.3)', background: 'rgba(74,144,217,0.06)' }}
              >
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.blue }}>
                  First Touch
                </div>
                <div className="text-[10px] font-semibold mb-1" style={{ color: 'var(--heading)' }}>
                  Renewal Reminder
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Opened Apr 1
                </div>
                <div className="text-sm font-extrabold mt-1" style={{ color: C.blue }}>
                  $364.80
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>30% credit</div>
              </div>

              <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />

              {/* Email 2 — Assist */}
              <div
                className="flex-1 min-w-[120px] rounded-lg p-3 border text-center"
                style={{ borderColor: 'rgba(168,85,247,0.3)', background: 'rgba(168,85,247,0.06)' }}
              >
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.purple }}>
                  Assist
                </div>
                <div className="text-[10px] font-semibold mb-1" style={{ color: 'var(--heading)' }}>
                  ALTA ONE Invite
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Opened Apr 7
                </div>
                <div className="text-sm font-extrabold mt-1" style={{ color: C.purple }}>
                  $364.80
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>30% credit</div>
              </div>

              <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />

              {/* Email 3 — Last Touch */}
              <div
                className="flex-1 min-w-[120px] rounded-lg p-3 border text-center"
                style={{ borderColor: 'rgba(140,198,63,0.3)', background: 'rgba(140,198,63,0.06)' }}
              >
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.green }}>
                  Last Touch
                </div>
                <div className="text-[10px] font-semibold mb-1" style={{ color: 'var(--heading)' }}>
                  Renewal Final Notice
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Opened Apr 10
                </div>
                <div className="text-sm font-extrabold mt-1" style={{ color: C.green }}>
                  $486.40
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>40% credit</div>
              </div>

              <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />

              {/* Conversion */}
              <div
                className="flex-shrink-0 rounded-lg p-3 border text-center"
                style={{
                  borderColor: 'rgba(140,198,63,0.4)',
                  background: 'rgba(140,198,63,0.1)',
                  minWidth: '90px',
                }}
              >
                <DollarSign className="w-5 h-5 mx-auto mb-1" style={{ color: C.green }} />
                <div className="text-sm font-extrabold" style={{ color: C.green }}>
                  $1,216
                </div>
                <div className="text-[9px] font-bold" style={{ color: C.green }}>
                  Renewed
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 6 & 7. Charts Row: Type Doughnut + Revenue Trend ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue by Campaign Type */}
        <Card
          title="Revenue by Campaign Type"
          subtitle="Distribution of attributed revenue across campaign categories"
          detailTitle="Revenue by Type — Details"
          detailContent={
            <div className="space-y-3">
              {typeLabels
                .map((t, i) => ({ type: t, value: typeValues[i], color: typeChartColors[i] }))
                .sort((a, b) => b.value - a.value)
                .map((item) => {
                  const pct = ((item.value / totalRevenue) * 100).toFixed(1);
                  return (
                    <div key={item.type} className="rounded-lg p-3 border" style={{ borderColor: 'var(--card-border)', background: 'var(--input-bg)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                          <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{item.type}</span>
                        </div>
                        <span className="text-xs font-extrabold" style={{ color: item.color }}>
                          ${item.value.toLocaleString()}
                        </span>
                      </div>
                      <MiniBar value={parseFloat(pct)} max={100} color={item.color} />
                      <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>{pct}% of total revenue</p>
                    </div>
                  );
                })}
            </div>
          }
        >
          <div className="pt-2">
            <ClientChart
              type="doughnut"
              height={280}
              data={{
                labels: typeLabels,
                datasets: [
                  {
                    data: typeValues,
                    backgroundColor: typeChartColors.map((c) => `${c}cc`),
                    borderColor: typeChartColors,
                    borderWidth: 2,
                    hoverOffset: 6,
                  },
                ],
              }}
              options={{
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (ctx: { label: string; raw: number; dataset: { data: number[] } }) => {
                        const total = ctx.dataset.data.reduce((s: number, v: number) => s + v, 0);
                        const pct = ((ctx.raw / total) * 100).toFixed(1);
                        return ` ${ctx.label}: $${ctx.raw.toLocaleString()} (${pct}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </Card>

        {/* Revenue Trend */}
        <Card
          title="Revenue Trend"
          subtitle="Monthly attributed revenue — 2026 YTD"
          detailTitle="Monthly Revenue Details"
          detailContent={
            <div className="space-y-3">
              {monthlyRevenueTrend.map((m) => (
                <div key={m.month} className="rounded-lg p-3 border" style={{ borderColor: 'var(--card-border)', background: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{m.month} 2026</span>
                    <span className="text-xs font-extrabold" style={{ color: C.green }}>${m.revenue.toLocaleString()}</span>
                  </div>
                  <MiniBar
                    value={m.revenue}
                    max={Math.max(...monthlyRevenueTrend.map((x) => x.revenue))}
                    color={C.green}
                  />
                </div>
              ))}
              <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(140,198,63,0.08)', border: '1px solid rgba(140,198,63,0.2)' }}>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <span className="font-bold" style={{ color: C.green }}>Trend insight:</span> March saw the highest attributed revenue driven by ALTA ONE early-bird registration and the TIPAC Q2 pledge drive.
                </p>
              </div>
            </div>
          }
        >
          <div className="pt-2">
            <ClientChart
              type="line"
              height={280}
              data={{
                labels: monthlyRevenueTrend.map((m) => m.month),
                datasets: [
                  {
                    label: 'Attributed Revenue',
                    data: monthlyRevenueTrend.map((m) => m.revenue),
                    borderColor: C.green,
                    backgroundColor: 'rgba(140,198,63,0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: C.green,
                    pointBorderColor: C.green,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    borderWidth: 2.5,
                  },
                ],
              }}
              options={{
                scales: {
                  y: {
                    grid: { color: '#1e3350' },
                    ticks: {
                      color: '#8899aa',
                      callback: (v: number) => `$${(v / 1000).toFixed(0)}k`,
                    },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: '#8899aa' },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (ctx: { raw: number }) => ` $${ctx.raw.toLocaleString()}`,
                    },
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>

      {/* ── Bottom Summary ───────────────────────────────────── */}
      <div
        className="rounded-xl p-4 border flex items-center gap-4"
        style={{
          borderColor: 'rgba(140,198,63,0.2)',
          background: 'linear-gradient(135deg, rgba(140,198,63,0.04) 0%, rgba(74,144,217,0.04) 100%)',
        }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
          style={{ background: 'rgba(140,198,63,0.12)' }}
        >
          <TrendingUp className="w-5 h-5" style={{ color: C.green }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
            RevenueTrace has attributed <span style={{ color: C.green }}>${totalRevenue.toLocaleString()}</span> across{' '}
            {revenueCampaigns.length} campaigns this period.
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Membership renewals account for {((revenueByType['Renewal'] || 0) / totalRevenue * 100).toFixed(1)}% of total attributed revenue.
            Connect your AMS for real-time conversion tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
