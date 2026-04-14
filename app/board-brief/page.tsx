'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { getCampaignTotals, demoCampaigns, demoMonthly, demoDecayAlerts, demoChurnScores, demoHygiene } from '@/lib/demo-data';
import {
  Presentation,
  FileText,
  Copy,
  Mail,
  CheckCircle2,
  Download,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Heart,
  Shield,
  Printer,
  X,
} from 'lucide-react';

/* ── Palette ── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  gold: '#C6A75E',
};

/* ── Computed data ── */
const totals = getCampaignTotals();
const sentCampaigns = demoCampaigns.filter(c => c.status === 'Sent');
const openRate = ((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1);
const clickRate = ((totals.totalClicked / totals.totalDelivered) * 100).toFixed(1);
const deliveryRate = ((totals.totalDelivered / totals.totalSent) * 100).toFixed(1);
const bounceRate = ((totals.totalBounced / totals.totalSent) * 100).toFixed(1);
const decayHigh = demoDecayAlerts.filter(d => d.decay >= 70);
const decayRevenue = decayHigh.reduce((s, d) => s + d.revenue, 0);
const topCampaign = [...sentCampaigns].sort((a, b) => b.revenue - a.revenue)[0];

/* ── Engagement tiers ── */
const engagementTiers = [
  { label: 'Champions (90-100)', count: 420, color: C.green },
  { label: 'Engaged (70-89)', count: 1850, color: C.blue },
  { label: 'At Risk (50-69)', count: 1520, color: C.orange },
  { label: 'Disengaged (25-49)', count: 860, color: C.red },
  { label: 'Gone Dark (0-24)', count: 344, color: '#888888' },
];
const totalMembers = engagementTiers.reduce((s, t) => s + t.count, 0);

/* ── Cost comparison ── */
const costComparison = [
  { tool: 'MEMTrak (Current)', annual: 0, note: 'Built in-house — zero license cost' },
  { tool: 'Salesforce Marketing Cloud', annual: 48000, note: 'Enterprise tier for association needs' },
  { tool: 'HubSpot Marketing Hub', annual: 21600, note: 'Professional tier with comparable features' },
  { tool: 'Marketo Engage', annual: 54000, note: 'Advanced analytics package' },
  { tool: 'Pardot (Account Engagement)', annual: 15000, note: 'Plus tier' },
];
const avgAlternativeCost = Math.round(costComparison.filter(c => c.annual > 0).reduce((s, c) => s + c.annual, 0) / costComparison.filter(c => c.annual > 0).length);

/* ── Revenue attribution ── */
const revenueByType = [
  { type: 'Renewals', revenue: 406992, color: C.green },
  { type: 'Events', revenue: 196000, color: C.blue },
  { type: 'Advocacy', revenue: 67500, color: C.purple },
  { type: 'Compliance', revenue: 2532, color: C.orange },
];
const totalRevenue = revenueByType.reduce((s, r) => s + r.revenue, 0);

export default function BoardBrief() {
  const [copied, setCopied] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  /* ── Executive summary sentences ── */
  const execSummary = [
    `ALTA's email program delivered ${totals.totalSent.toLocaleString()} messages across ${totals.campaignCount} campaigns this period, achieving a ${openRate}% unique open rate — placing ALTA in the top decile of association email programs nationally (industry average: 25-35%).`,
    `Email-attributed revenue reached $${totalRevenue.toLocaleString()}, driven primarily by $${(406992).toLocaleString()} in membership renewals and $${(196000).toLocaleString()} in event registrations, demonstrating MEMTrak's direct contribution to ALTA's financial goals.`,
    `${decayHigh.length} high-priority engagement decay alerts have been identified, representing $${decayRevenue.toLocaleString()} in annual revenue at risk — DecayRadar is actively monitoring these members with automated re-engagement workflows to prevent non-renewal.`,
  ];

  /* ── Build board brief HTML for copy/print ── */
  const briefHtml = `
<div style="max-width:680px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#2c3e50;line-height:1.7;padding:40px 32px;">
  <div style="display:flex;align-items:flex-end;justify-content:space-between;border-bottom:3px solid #C6A75E;padding-bottom:16px;margin-bottom:32px;">
    <div>
      <div style="font-size:26px;font-weight:800;color:#002D5C;letter-spacing:-0.5px;">MEMTrak</div>
      <div style="font-size:14px;color:#002D5C;font-weight:600;margin-top:3px;">Board Performance Brief</div>
      <div style="font-size:11px;color:#7a8898;margin-top:2px;">${date}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:12px;color:#5a6d82;font-weight:600;">American Land Title Association</div>
      <div style="font-size:9px;color:#9a9690;">Prepared by MEMTrak Intelligence</div>
    </div>
  </div>

  <div style="margin-bottom:28px;">
    <div style="font-size:14px;font-weight:700;color:#002D5C;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e8ecf0;">Executive Summary</div>
    ${execSummary.map(s => `<p style="font-size:12px;color:#4a5568;margin:0 0 10px 0;">${s}</p>`).join('')}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px;">
    <div style="background:#f7f9fb;border-radius:10px;padding:16px;border-left:4px solid ${C.blue};">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#8899aa;font-weight:700;">Open Rate</div>
      <div style="font-size:28px;font-weight:800;color:#002D5C;">${openRate}%</div>
      <div style="font-size:10px;color:#8899aa;">Industry avg: 25-35%</div>
    </div>
    <div style="background:#f7f9fb;border-radius:10px;padding:16px;border-left:4px solid ${C.green};">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#8899aa;font-weight:700;">Email Revenue</div>
      <div style="font-size:28px;font-weight:800;color:#002D5C;">$${totalRevenue.toLocaleString()}</div>
      <div style="font-size:10px;color:#8899aa;">${totals.campaignCount} campaigns attributed</div>
    </div>
    <div style="background:#f7f9fb;border-radius:10px;padding:16px;border-left:4px solid ${C.orange};">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#8899aa;font-weight:700;">Click Rate</div>
      <div style="font-size:28px;font-weight:800;color:#002D5C;">${clickRate}%</div>
      <div style="font-size:10px;color:#8899aa;">Industry avg: 3-5%</div>
    </div>
    <div style="background:#f7f9fb;border-radius:10px;padding:16px;border-left:4px solid ${C.purple};">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#8899aa;font-weight:700;">List Health</div>
      <div style="font-size:28px;font-weight:800;color:#002D5C;">${demoHygiene.healthy.pct}%</div>
      <div style="font-size:10px;color:#8899aa;">${demoHygiene.total.toLocaleString()} total contacts</div>
    </div>
  </div>

  <div style="margin-bottom:28px;">
    <div style="font-size:14px;font-weight:700;color:#002D5C;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e8ecf0;">Revenue Attribution</div>
    ${revenueByType.map(r => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f2f5;">
      <span style="font-size:12px;color:#4a5568;">${r.type}</span>
      <span style="font-size:12px;font-weight:700;color:#002D5C;">$${r.revenue.toLocaleString()}</span>
    </div>`).join('')}
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;margin-top:4px;">
      <span style="font-size:13px;font-weight:700;color:#002D5C;">Total Email-Attributed Revenue</span>
      <span style="font-size:16px;font-weight:800;color:${C.green};">$${totalRevenue.toLocaleString()}</span>
    </div>
  </div>

  <div style="margin-bottom:28px;">
    <div style="font-size:14px;font-weight:700;color:#002D5C;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e8ecf0;">Member Health Distribution</div>
    ${engagementTiers.map(t => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;">
      <div style="width:10px;height:10px;border-radius:50%;background:${t.color};flex-shrink:0;"></div>
      <span style="font-size:11px;color:#4a5568;width:160px;">${t.label}</span>
      <div style="flex:1;height:8px;background:#e8ecf0;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${((t.count / totalMembers) * 100).toFixed(1)}%;background:${t.color};border-radius:4px;"></div>
      </div>
      <span style="font-size:11px;font-weight:600;color:#002D5C;width:50px;text-align:right;">${t.count}</span>
    </div>`).join('')}
  </div>

  <div style="margin-bottom:28px;">
    <div style="font-size:14px;font-weight:700;color:#002D5C;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e8ecf0;">Cost Savings vs Alternatives</div>
    <p style="font-size:12px;color:#4a5568;margin:0 0 12px 0;">MEMTrak is built in-house at zero license cost. Average annual cost of comparable commercial platforms: <strong>$${avgAlternativeCost.toLocaleString()}</strong>.</p>
    ${costComparison.map(c => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f2f5;">
      <span style="font-size:11px;color:#4a5568;">${c.tool}</span>
      <span style="font-size:11px;font-weight:700;color:${c.annual === 0 ? C.green : '#002D5C'};">${c.annual === 0 ? '$0 (in-house)' : '$' + c.annual.toLocaleString() + '/yr'}</span>
    </div>`).join('')}
  </div>

  <div style="text-align:center;padding-top:20px;border-top:2px solid #e8ecf0;margin-top:32px;">
    <div style="font-size:9px;color:#9a9690;">Generated by MEMTrak Intelligence &middot; American Land Title Association &middot; ${date}</div>
    <div style="font-size:8px;color:#bbb;margin-top:4px;">CONFIDENTIAL &mdash; For Board of Directors distribution only</div>
  </div>
</div>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(briefHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback */
      const ta = document.createElement('textarea');
      ta.value = briefHtml;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>MEMTrak Board Brief</title><style>@media print{body{margin:0;padding:0;}}</style></head><body>${briefHtml}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  };

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(198,167,94,0.2) 0%, rgba(0,45,92,0.2) 100%)',
              border: '1px solid rgba(198,167,94,0.3)',
            }}
          >
            <Presentation className="w-5 h-5" style={{ color: C.gold }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              BoardBrief<span style={{ color: C.gold, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.gold }}>
              Board-ready in one click.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Executive report generator that produces polished, board-ready performance briefs from live MEMTrak data.
          One click generates a comprehensive report with KPIs, revenue attribution, member health, engagement trends,
          and cost savings — formatted for direct distribution to ALTA&apos;s Board of Directors.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Open Rate"
          value={`${openRate}%`}
          sub="Top decile nationally"
          icon={TrendingUp}
          color={C.blue}
          sparkData={[34.2, 35.8, 37.1, 38.5, 39.2, 40.1, Number(openRate)]}
          sparkColor={C.blue}
          trend={{ value: 5.2, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Email Revenue"
          value={`$${(totalRevenue / 1000).toFixed(0)}K`}
          sub={`${totals.campaignCount} campaigns attributed`}
          icon={DollarSign}
          color={C.green}
          sparkData={[420, 480, 520, 560, 610, 645, totalRevenue / 1000]}
          sparkColor={C.green}
          trend={{ value: 12.8, label: 'growth' }}
          accent
        />
        <SparkKpi
          label="Member Health"
          value={`${demoHygiene.healthy.pct}%`}
          sub={`${demoHygiene.total.toLocaleString()} total contacts`}
          icon={Heart}
          color={C.purple}
          sparkData={[72.1, 73.5, 74.8, 75.2, 76.0, 76.8, demoHygiene.healthy.pct]}
          sparkColor={C.purple}
          trend={{ value: 2.4, label: 'improving' }}
          accent
        />
        <SparkKpi
          label="Cost Savings"
          value={`$${(avgAlternativeCost / 1000).toFixed(0)}K/yr`}
          sub="vs avg commercial platform"
          icon={Shield}
          color={C.gold}
          sparkData={[28, 30, 32, 34, 35, 36, avgAlternativeCost / 1000]}
          sparkColor={C.gold}
          trend={{ value: 100, label: 'MEMTrak is $0' }}
          accent
        />
      </div>

      {/* ── 3. Action Buttons ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
          style={{ background: C.gold, color: '#fff', boxShadow: '0 4px 16px rgba(198,167,94,0.3)' }}
        >
          <Printer className="w-4 h-4" />
          Generate PDF
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
          style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}
        >
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied HTML' : 'Copy HTML'}
        </button>
        <button
          onClick={() => setShowEmailModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
          style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}
        >
          <Mail className="w-4 h-4" />
          Email to Board
        </button>
      </div>

      {/* ── 4. Live Report Preview ────────────────────────────── */}
      <Card
        title="Board Brief Preview"
        subtitle={`Live render — ${date}`}
        className="mb-8"
        detailTitle="Full Report Preview"
        detailContent={
          <div dangerouslySetInnerHTML={{ __html: briefHtml }} />
        }
      >
        {/* Inline preview of the report */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: '#ffffff', borderColor: '#e8ecf0' }}
        >
          <div dangerouslySetInnerHTML={{ __html: briefHtml }} />
        </div>
      </Card>

      {/* ── 5. Engagement Trend Chart ─────────────────────────── */}
      <Card
        title="Engagement Trend"
        subtitle="Monthly performance overview"
        className="mb-8"
        detailTitle="Monthly Engagement Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Monthly engagement metrics show consistent performance with a notable uptick in March due to
              increased campaign activity around PFL compliance and ALTA ONE promotion. April data is
              partial (mid-month) and on pace to match March volumes.
            </p>
            {demoMonthly.map(m => (
              <div key={m.month} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)' }}>
                <span style={{ color: 'var(--heading)' }}>{m.month} 2026</span>
                <div className="flex items-center gap-4">
                  <span style={{ color: 'var(--text-muted)' }}>{m.sent.toLocaleString()} sent</span>
                  <span style={{ color: C.green }}>{((m.opened / m.delivered) * 100).toFixed(1)}% open</span>
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
            labels: demoMonthly.map(m => m.month),
            datasets: [
              {
                label: 'Sent',
                data: demoMonthly.map(m => m.sent),
                borderColor: C.blue,
                backgroundColor: C.blue + '15',
                fill: true,
                tension: 0.4,
                borderWidth: 2.5,
                pointRadius: 5,
                pointBackgroundColor: C.blue,
                pointBorderColor: 'var(--card)',
                pointBorderWidth: 2,
              },
              {
                label: 'Opened',
                data: demoMonthly.map(m => m.opened),
                borderColor: C.green,
                backgroundColor: C.green + '10',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: C.green,
                pointBorderColor: 'var(--card)',
                pointBorderWidth: 2,
              },
              {
                label: 'Clicked',
                data: demoMonthly.map(m => m.clicked),
                borderColor: C.orange,
                backgroundColor: C.orange + '08',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: C.orange,
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
            },
            scales: {
              y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number | string) => Number(v).toLocaleString() } },
              x: { grid: { display: false }, ticks: { color: '#8899aa' } },
            },
          }}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ── 6. Revenue Attribution ──────────────────────────── */}
        <Card
          title="Revenue Attribution"
          subtitle="Email-attributed revenue by campaign type"
          detailTitle="Revenue Attribution Detail"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Revenue is attributed to email campaigns through tracked conversion events — renewal completions,
                event registrations, and advocacy pledges that originated from an email click within a 7-day attribution window.
              </p>
              {revenueByType.map(r => (
                <div key={r.type} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: r.color }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{r.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold" style={{ color: r.color }}>${r.revenue.toLocaleString()}</span>
                    <span className="text-[9px] ml-2" style={{ color: 'var(--text-muted)' }}>{((r.revenue / totalRevenue) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--card-border)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Total</span>
                <span className="text-base font-extrabold" style={{ color: C.green }}>${totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          }
        >
          <ClientChart
            type="doughnut"
            height={240}
            data={{
              labels: revenueByType.map(r => r.type),
              datasets: [{
                data: revenueByType.map(r => r.revenue),
                backgroundColor: revenueByType.map(r => r.color + '80'),
                borderColor: revenueByType.map(r => r.color),
                borderWidth: 2,
              }],
            }}
          />
          <div className="text-center mt-4">
            <div className="text-2xl font-extrabold" style={{ color: C.green }}>${totalRevenue.toLocaleString()}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total email-attributed revenue</div>
          </div>
        </Card>

        {/* ── 7. Cost Savings ─────────────────────────────────── */}
        <Card
          title="Cost Savings vs Alternatives"
          subtitle="MEMTrak vs commercial email platforms"
          detailTitle="Cost Analysis Detail"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                MEMTrak was built in-house by ALTA IT, eliminating per-seat licensing fees that commercial platforms
                charge. This comparison reflects publicly listed enterprise pricing for associations of ALTA&apos;s size
                (18,000+ contacts, multiple campaign types, advanced analytics).
              </p>
              {costComparison.map(c => (
                <div key={c.tool} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div>
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{c.tool}</span>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{c.note}</div>
                  </div>
                  <span className="text-sm font-extrabold" style={{ color: c.annual === 0 ? C.green : 'var(--heading)' }}>
                    {c.annual === 0 ? '$0' : `$${c.annual.toLocaleString()}/yr`}
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
              labels: costComparison.map(c => c.tool.split(' ')[0]),
              datasets: [{
                label: 'Annual Cost',
                data: costComparison.map(c => c.annual),
                backgroundColor: costComparison.map(c => c.annual === 0 ? C.green + '80' : C.red + '50'),
                borderColor: costComparison.map(c => c.annual === 0 ? C.green : C.red),
                borderWidth: 2,
                borderRadius: 8,
              }],
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
                  formatter: (v: number) => v === 0 ? '$0' : '$' + (v / 1000).toFixed(0) + 'K',
                },
              },
              scales: {
                y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number | string) => '$' + (Number(v) / 1000).toFixed(0) + 'K' } },
                x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 } } },
              },
            }}
          />
          <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(198,167,94,0.06)', border: '1px solid rgba(198,167,94,0.15)' }}>
            <div className="text-[10px] font-bold mb-0.5" style={{ color: C.gold }}>Board Talking Point</div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              MEMTrak saves ALTA an estimated <strong style={{ color: 'var(--heading)' }}>${avgAlternativeCost.toLocaleString()}/year</strong> compared
              to the average commercial platform — while providing deeper association-specific features like
              DecayRadar, FatigueShield, and CampaignAutopsy that commercial tools do not offer.
            </p>
          </div>
        </Card>
      </div>

      {/* ── 8. Member Health Distribution ─────────────────────── */}
      <Card
        title="Member Health Distribution"
        subtitle={`${totalMembers.toLocaleString()} members by engagement tier`}
        className="mb-8"
        detailTitle="Engagement Tier Breakdown"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Members are scored on a 0-100 engagement scale based on email opens, clicks, event attendance,
              website visits, and advocacy participation. The distribution shows a healthy program with
              {' '}{((engagementTiers[0].count + engagementTiers[1].count) / totalMembers * 100).toFixed(0)}% of
              members in the Engaged or Champions tier.
            </p>
            {engagementTiers.map(t => (
              <div key={t.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{t.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold" style={{ color: t.color }}>{t.count.toLocaleString()}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{((t.count / totalMembers) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <ClientChart
          type="bar"
          height={220}
          data={{
            labels: engagementTiers.map(t => t.label.split('(')[0].trim()),
            datasets: [{
              label: 'Members',
              data: engagementTiers.map(t => t.count),
              backgroundColor: engagementTiers.map(t => t.color + '80'),
              borderColor: engagementTiers.map(t => t.color),
              borderWidth: 2,
              borderRadius: 8,
            }],
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
                formatter: (v: number) => v.toLocaleString(),
              },
            },
            scales: {
              y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
              x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 } } },
            },
          }}
        />
      </Card>

      {/* ── Email Modal ── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowEmailModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border p-6"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(198,167,94,0.15)' }}>
                <Mail className="w-5 h-5" style={{ color: C.gold }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Email Board Brief</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Send formatted report to distribution list</p>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="ml-auto p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>To</div>
                <div className="text-[11px]" style={{ color: 'var(--heading)' }}>board@alta.org</div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Subject</div>
                <div className="text-[11px]" style={{ color: 'var(--heading)' }}>MEMTrak Board Performance Brief — {date}</div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Content</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Full HTML board brief with KPIs, revenue, and member health data</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 py-2.5 rounded-lg text-[10px] font-bold"
                style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 py-2.5 rounded-lg text-[10px] font-bold transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                style={{ background: C.gold, color: '#fff' }}
              >
                <Mail className="w-3.5 h-3.5" />
                Send Brief
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(198,167,94,0.08)', color: C.gold, border: '1px solid rgba(198,167,94,0.15)' }}
        >
          <Presentation className="w-3 h-3" />
          BoardBrief&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
