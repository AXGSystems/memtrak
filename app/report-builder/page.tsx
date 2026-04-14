'use client';

import { useState, useRef } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import {
  FileText, Calendar, Check, Eye, Download, Copy, Clock,
  BarChart3, Users, DollarSign, Heart, Shield, Mail, TrendingUp,
  Zap, Target, Briefcase, Printer, X, ChevronDown,
} from 'lucide-react';
import { getCampaignTotals, demoCampaigns, demoMonthly, demoDecayAlerts, demoChurnScores, demoHygiene, demoRelationships, demoSendTimes } from '@/lib/demo-data';

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

/* ── Section definitions ── */
const SECTIONS = [
  { id: 'executive-summary', label: 'Executive Summary', icon: Briefcase, color: C.navy },
  { id: 'campaign-performance', label: 'Campaign Performance', icon: BarChart3, color: C.blue },
  { id: 'engagement-metrics', label: 'Engagement Metrics', icon: TrendingUp, color: C.green },
  { id: 'revenue-attribution', label: 'Revenue Attribution', icon: DollarSign, color: C.gold },
  { id: 'member-health', label: 'Member Health', icon: Heart, color: C.red },
  { id: 'delivery-stats', label: 'Delivery Stats', icon: Mail, color: C.purple },
  { id: 'staff-performance', label: 'Staff Performance', icon: Users, color: C.orange },
  { id: 'address-hygiene', label: 'Address Hygiene', icon: Shield, color: C.amber },
  { id: 'churn-risk', label: 'Churn Risk', icon: Target, color: C.red },
  { id: 'industry-benchmarks', label: 'Industry Benchmarks', icon: Zap, color: C.blue },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

/* ── Date presets ── */
const DATE_PRESETS = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: 'quarter', label: 'Quarter' },
  { id: 'year', label: 'Year' },
] as const;

/* ── Template presets ── */
const TEMPLATES = [
  { id: 'board', label: 'Board Meeting', icon: Briefcase, sections: ['executive-summary', 'campaign-performance', 'revenue-attribution', 'member-health', 'industry-benchmarks'] as SectionId[] },
  { id: 'monthly', label: 'Monthly Review', icon: Calendar, sections: ['executive-summary', 'campaign-performance', 'engagement-metrics', 'delivery-stats', 'address-hygiene'] as SectionId[] },
  { id: 'postmortem', label: 'Campaign Post-Mortem', icon: Target, sections: ['campaign-performance', 'engagement-metrics', 'delivery-stats', 'staff-performance'] as SectionId[] },
  { id: 'quarterly', label: 'Quarterly Planning', icon: TrendingUp, sections: ['executive-summary', 'campaign-performance', 'revenue-attribution', 'churn-risk', 'member-health', 'industry-benchmarks'] as SectionId[] },
];

/* ── Demo report history ── */
const REPORT_HISTORY = [
  { title: 'Q1 2026 Board Report', date: '2026-04-01', sections: 5, template: 'Board Meeting' },
  { title: 'March Monthly Review', date: '2026-03-31', sections: 6, template: 'Monthly Review' },
  { title: 'PFL Campaign Analysis', date: '2026-03-28', sections: 4, template: 'Campaign Post-Mortem' },
  { title: 'Renewal Season Kickoff', date: '2026-03-15', sections: 7, template: 'Custom' },
  { title: 'February Monthly Review', date: '2026-02-28', sections: 5, template: 'Monthly Review' },
];

/* ── Computed ── */
const totals = getCampaignTotals();
const sentCampaigns = demoCampaigns.filter(c => c.status === 'Sent');
const openRate = ((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1);
const clickRate = ((totals.totalClicked / totals.totalDelivered) * 100).toFixed(1);
const bounceRate = ((totals.totalBounced / totals.totalSent) * 100).toFixed(1);
const deliveryRate = ((totals.totalDelivered / totals.totalSent) * 100).toFixed(1);

/* ── Section Renderers ── */
function SectionPreview({ id }: { id: SectionId }) {
  switch (id) {
    case 'executive-summary':
      return (
        <div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            During the reporting period, ALTA sent <strong style={{ color: 'var(--heading)' }}>{totals.campaignCount} campaigns</strong> reaching{' '}
            <strong style={{ color: 'var(--heading)' }}>{totals.totalSent.toLocaleString()}</strong> recipients.
            Email engagement remains strong with a <strong style={{ color: C.green }}>{openRate}%</strong> open rate and{' '}
            <strong style={{ color: C.blue }}>{clickRate}%</strong> click-through rate, significantly outperforming industry benchmarks.
            Revenue attributed to email campaigns totals <strong style={{ color: C.gold }}>${totals.totalRevenue.toLocaleString()}</strong>.
          </p>
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { l: 'Campaigns Sent', v: totals.campaignCount, c: C.blue },
              { l: 'Total Recipients', v: totals.totalSent.toLocaleString(), c: C.green },
              { l: 'Open Rate', v: `${openRate}%`, c: C.orange },
              { l: 'Revenue', v: `$${(totals.totalRevenue / 1000).toFixed(0)}K`, c: C.gold },
            ].map(m => (
              <div key={m.l} className="rounded-lg border p-3 text-center" style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--card) 50%, var(--background))' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>{m.l}</div>
                <div className="text-lg font-extrabold mt-1" style={{ color: m.c }}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'campaign-performance':
      return (
        <div>
          <div className="space-y-2">
            {sentCampaigns.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: 'var(--heading)' }}>{c.name}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.type} | {c.source} | {c.sentDate}</div>
                </div>
                <div className="flex gap-4 text-right flex-shrink-0 ml-4">
                  <div>
                    <div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Opens</div>
                    <div className="text-xs font-bold" style={{ color: C.green }}>{((c.uniqueOpened / c.delivered) * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Clicks</div>
                    <div className="text-xs font-bold" style={{ color: C.blue }}>{((c.clicked / c.delivered) * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Revenue</div>
                    <div className="text-xs font-bold" style={{ color: C.gold }}>${c.revenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'engagement-metrics':
      return (
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: 'Open Rate', v: `${openRate}%`, bench: '21.3%', delta: '+' + (parseFloat(openRate) - 21.3).toFixed(1) + '%', c: C.green },
            { l: 'Click Rate', v: `${clickRate}%`, bench: '2.7%', delta: '+' + (parseFloat(clickRate) - 2.7).toFixed(1) + '%', c: C.blue },
            { l: 'Bounce Rate', v: `${bounceRate}%`, bench: '2.1%', delta: (parseFloat(bounceRate) - 2.1).toFixed(1) + '%', c: C.red },
          ].map(m => (
            <div key={m.l} className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--card) 50%, var(--background))' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>{m.l}</div>
              <div className="text-xl font-extrabold mt-1" style={{ color: m.c }}>{m.v}</div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Industry: {m.bench} <span style={{ color: C.green }}>({m.delta})</span>
              </div>
            </div>
          ))}
          <div className="col-span-3 mt-2">
            <div className="text-[10px] font-bold mb-2" style={{ color: 'var(--text-muted)' }}>MONTHLY TREND</div>
            <div className="flex gap-2">
              {demoMonthly.map(m => (
                <div key={m.month} className="flex-1 rounded-lg border p-2 text-center" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.month}</div>
                  <div className="text-xs font-bold mt-0.5" style={{ color: 'var(--heading)' }}>{m.sent.toLocaleString()}</div>
                  <div className="text-[9px]" style={{ color: C.green }}>{((m.opened / m.delivered) * 100).toFixed(0)}% open</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'revenue-attribution': {
      const revenueByType = [
        { type: 'Renewals', revenue: 406992, color: C.green },
        { type: 'Events', revenue: 196000, color: C.blue },
        { type: 'Advocacy', revenue: 67500, color: C.purple },
        { type: 'Compliance', revenue: 2532, color: C.orange },
      ];
      const totalRev = revenueByType.reduce((s, r) => s + r.revenue, 0);
      return (
        <div>
          <div className="text-2xl font-extrabold mb-3" style={{ color: C.gold }}>${totalRev.toLocaleString()}</div>
          <div className="space-y-2">
            {revenueByType.map(r => (
              <div key={r.type} className="flex items-center gap-3">
                <div className="text-xs font-semibold w-24" style={{ color: 'var(--heading)' }}>{r.type}</div>
                <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(r.revenue / totalRev) * 100}%`, background: r.color }} />
                </div>
                <div className="text-xs font-bold w-20 text-right" style={{ color: r.color }}>${(r.revenue / 1000).toFixed(0)}K</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'member-health': {
      const tiers = [
        { label: 'Champions', count: 420, color: C.green },
        { label: 'Engaged', count: 1850, color: C.blue },
        { label: 'At Risk', count: 1520, color: C.orange },
        { label: 'Disengaged', count: 860, color: C.red },
        { label: 'Gone Dark', count: 344, color: '#888888' },
      ];
      const total = tiers.reduce((s, t) => s + t.count, 0);
      return (
        <div className="grid grid-cols-5 gap-2">
          {tiers.map(t => (
            <div key={t.label} className="rounded-lg border p-3 text-center" style={{ borderColor: 'var(--card-border)', borderTopWidth: 3, borderTopColor: t.color }}>
              <div className="text-lg font-extrabold" style={{ color: t.color }}>{t.count}</div>
              <div className="text-[9px] font-bold mt-0.5" style={{ color: 'var(--text-muted)' }}>{t.label}</div>
              <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{((t.count / total) * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      );
    }

    case 'delivery-stats':
      return (
        <div className="grid grid-cols-2 gap-3">
          {[
            { l: 'Delivery Rate', v: `${deliveryRate}%`, c: C.green },
            { l: 'Bounce Rate', v: `${bounceRate}%`, c: C.red },
            { l: 'Total Delivered', v: totals.totalDelivered.toLocaleString(), c: C.blue },
            { l: 'Total Bounced', v: totals.totalBounced.toLocaleString(), c: C.orange },
          ].map(m => (
            <div key={m.l} className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--card) 50%, var(--background))' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>{m.l}</div>
              <div className="text-lg font-extrabold mt-1" style={{ color: m.c }}>{m.v}</div>
            </div>
          ))}
        </div>
      );

    case 'staff-performance':
      return (
        <div className="space-y-2">
          {demoRelationships.map(s => (
            <div key={s.staff} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
              <div>
                <div className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{s.staff}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.outreach} outreach | {s.responseTime} avg response</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-bold" style={{ color: s.replyRate >= 40 ? C.green : s.replyRate >= 30 ? C.blue : C.orange }}>{s.replyRate}% reply</div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{
                  background: s.strength === 'Exceptional' ? `${C.green}22` : s.strength === 'Strong' ? `${C.blue}22` : `${C.orange}22`,
                  color: s.strength === 'Exceptional' ? C.green : s.strength === 'Strong' ? C.blue : C.orange,
                }}>{s.strength}</span>
              </div>
            </div>
          ))}
        </div>
      );

    case 'address-hygiene':
      return (
        <div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--card) 50%, var(--background))' }}>
              <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Total Addresses</div>
              <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{demoHygiene.total.toLocaleString()}</div>
            </div>
            <div className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--card) 50%, var(--background))' }}>
              <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Healthy</div>
              <div className="text-lg font-extrabold" style={{ color: C.green }}>{demoHygiene.healthy.pct}%</div>
            </div>
            <div className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--card) 50%, var(--background))' }}>
              <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Projected Delivery</div>
              <div className="text-lg font-extrabold" style={{ color: C.blue }}>{demoHygiene.projectedDelivery}%</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              { l: 'Stale', v: demoHygiene.stale, c: C.orange },
              { l: 'Bounced', v: demoHygiene.bounced, c: C.red },
              { l: 'Unsubscribed', v: demoHygiene.unsubscribed, c: C.amber },
              { l: 'Invalid', v: demoHygiene.invalid, c: C.red },
              { l: 'Risky', v: demoHygiene.risky, c: C.purple },
            ].map(h => (
              <div key={h.l} className="flex items-center gap-2 text-[10px]">
                <div className="w-16 font-semibold" style={{ color: 'var(--heading)' }}>{h.l}</div>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${h.v.pct * 5}%`, background: h.c }} />
                </div>
                <div className="w-16 text-right font-bold" style={{ color: h.c }}>{h.v.count.toLocaleString()} ({h.v.pct}%)</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'churn-risk':
      return (
        <div className="space-y-2">
          {demoChurnScores.map(c => (
            <div key={c.org} className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--card) 50%, var(--background))' }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{c.org}</span>
                  <span className="text-[9px] ml-2 px-1.5 py-0.5 rounded font-bold" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>{c.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: c.score >= 70 ? C.red : c.score >= 50 ? C.orange : C.green }}>{c.score}%</span>
                  <span className="text-[10px] font-semibold" style={{ color: C.gold }}>${c.revenue.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{c.action}</div>
            </div>
          ))}
        </div>
      );

    case 'industry-benchmarks':
      return (
        <div>
          <div className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>ALTA vs Association Industry Averages</div>
          <div className="space-y-2">
            {[
              { metric: 'Open Rate', alta: parseFloat(openRate), industry: 21.3, unit: '%' },
              { metric: 'Click Rate', alta: parseFloat(clickRate), industry: 2.7, unit: '%' },
              { metric: 'Bounce Rate', alta: parseFloat(bounceRate), industry: 2.1, unit: '%', lower: true },
              { metric: 'Delivery Rate', alta: parseFloat(deliveryRate), industry: 95.2, unit: '%' },
            ].map(b => {
              const better = b.lower ? b.alta < b.industry : b.alta > b.industry;
              return (
                <div key={b.metric} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="text-xs font-semibold w-28" style={{ color: 'var(--heading)' }}>{b.metric}</div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: C.green }}>{b.alta}{b.unit}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>vs</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{b.industry}{b.unit}</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{
                    background: better ? `${C.green}22` : `${C.red}22`,
                    color: better ? C.green : C.red,
                  }}>{better ? 'Above' : 'Below'}</span>
                </div>
              );
            })}
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default function ReportBuilder() {
  const [title, setTitle] = useState('ALTA Email Intelligence Report');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [selectedSections, setSelectedSections] = useState<Set<SectionId>>(
    new Set(['executive-summary', 'campaign-performance', 'engagement-metrics', 'revenue-attribution'])
  );
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const toggleSection = (id: SectionId) => {
    setSelectedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const applyTemplate = (template: typeof TEMPLATES[number]) => {
    setSelectedSections(new Set(template.sections));
    setTitle(`ALTA ${template.label} — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
  };

  const handleGeneratePDF = () => {
    setGenerating(true);
    setTimeout(() => {
      window.print();
      setGenerating(false);
    }, 400);
  };

  const handleCopyHTML = () => {
    if (previewRef.current) {
      const html = previewRef.current.innerHTML;
      navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const orderedSelected = SECTIONS.filter(s => selectedSections.has(s.id));

  return (
    <div className="p-6 space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* SparkKPIs */}
      <div className="grid grid-cols-4 gap-4">
        <SparkKpi
          label="Reports Generated"
          value={47}
          icon={FileText}
          color={C.blue}
          sparkData={[12, 15, 10, 18, 14, 22, 17, 20, 24, 19, 28, 31]}
          trend={{ value: 18.5, label: 'vs last month' }}
          sub="This quarter"
        />
        <SparkKpi
          label="Avg Sections Per Report"
          value="5.2"
          icon={BarChart3}
          color={C.green}
          sparkData={[4, 5, 4, 6, 5, 5, 6, 5, 4, 6, 5, 5]}
          trend={{ value: 4.0, label: 'vs last month' }}
          sub="Most include 4-7 sections"
        />
        <SparkKpi
          label="Most Popular Section"
          value="Executive"
          icon={Briefcase}
          color={C.gold}
          sparkData={[42, 44, 40, 45, 43, 47, 44, 46, 47, 45, 46, 47]}
          sub="Included in 94% of reports"
        />
        <SparkKpi
          label="Last Generated"
          value="2h ago"
          icon={Clock}
          color={C.purple}
          sparkData={[1, 3, 2, 1, 4, 2, 3, 1, 2, 3, 2, 1]}
          sub="Board Meeting template"
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Controls */}
        <div className="col-span-4 space-y-4">
          {/* Report Title */}
          <Card title="Report Title">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm font-semibold border outline-none transition-all focus:ring-2"
              style={{
                background: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                color: 'var(--heading)',
                // @ts-ignore
                '--tw-ring-color': 'var(--accent)',
              }}
              placeholder="Enter report title..."
            />
          </Card>

          {/* Date Range */}
          <Card title="Date Range">
            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setDateRange(p.id)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200"
                  style={{
                    background: dateRange === p.id ? 'var(--accent)' : 'var(--input-bg)',
                    color: dateRange === p.id ? '#fff' : 'var(--text-muted)',
                    border: `1px solid ${dateRange === p.id ? 'var(--accent)' : 'var(--card-border)'}`,
                    transform: dateRange === p.id ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Template Presets */}
          <Card title="Template Presets" subtitle="Quick-start with pre-selected sections">
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-[11px] font-semibold transition-all duration-200 hover:translate-y-[-1px] border"
                    style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', color: 'var(--heading)' }}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Section Checklist */}
          <Card title="Report Sections" subtitle="Toggle sections to include">
            <div className="space-y-1.5">
              {SECTIONS.map(s => {
                const Icon = s.icon;
                const isOn = selectedSections.has(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSection(s.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 border"
                    style={{
                      background: isOn ? 'color-mix(in srgb, var(--accent) 8%, var(--card))' : 'var(--input-bg)',
                      borderColor: isOn ? 'var(--accent)' : 'var(--card-border)',
                      color: isOn ? 'var(--heading)' : 'var(--text-muted)',
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: isOn ? s.color : 'transparent',
                        border: isOn ? 'none' : '1.5px solid var(--card-border)',
                      }}
                    >
                      {isOn && <Check className="w-2.5 h-2.5" style={{ color: '#fff' }} />}
                    </div>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isOn ? s.color : 'var(--text-muted)' }} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <div className="space-y-2">
              <button
                onClick={handleGeneratePDF}
                disabled={generating || selectedSections.size === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 hover:translate-y-[-1px]"
                style={{
                  background: generating ? 'var(--card-border)' : 'var(--accent)',
                  color: '#fff',
                  opacity: selectedSections.size === 0 ? 0.4 : 1,
                }}
              >
                {generating ? <><span className="animate-spin">&#9696;</span> Generating...</> : <><Download className="w-3.5 h-3.5" /> Generate PDF</>}
              </button>
              <button
                onClick={handleCopyHTML}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 hover:translate-y-[-1px] border"
                style={{ borderColor: 'var(--card-border)', color: copied ? C.green : 'var(--heading)', background: 'var(--input-bg)' }}
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy HTML</>}
              </button>
            </div>
          </Card>

          {/* Report History */}
          <Card title="Recent Reports" subtitle="Last 5 generated">
            <div className="space-y-2">
              {REPORT_HISTORY.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold truncate" style={{ color: 'var(--heading)' }}>{r.title}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{r.date} | {r.sections} sections | {r.template}</div>
                  </div>
                  <button className="flex-shrink-0 ml-2 p-1 rounded" style={{ color: 'var(--accent)' }}>
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Live Preview */}
        <div className="col-span-8">
          <Card title="Live Preview" subtitle={`${selectedSections.size} sections selected`}>
            <div ref={previewRef} className="space-y-6">
              {/* Report Header */}
              <div className="border-b pb-4" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--accent)' }}>MEMTrak Report</div>
                    <h1 className="text-xl font-extrabold mt-1" style={{ color: 'var(--heading)' }}>{title}</h1>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                        {DATE_PRESETS.find(p => p.id === dateRange)?.label} Range
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, transparent))',
                      color: '#fff',
                    }}
                  >
                    M
                  </div>
                </div>
              </div>

              {/* Sections */}
              {orderedSelected.length === 0 && (
                <div className="py-16 text-center">
                  <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--card-border)' }} />
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No sections selected</div>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Toggle sections on the left to build your report</div>
                </div>
              )}
              {orderedSelected.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.id}
                    className="rounded-xl border p-5"
                    style={{
                      borderColor: 'var(--card-border)',
                      background: 'color-mix(in srgb, var(--card) 70%, var(--background))',
                      animation: `slideUp 0.3s ease-out ${i * 0.05}s both`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${s.color}22` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                      </div>
                      <h2 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{s.label}</h2>
                    </div>
                    <SectionPreview id={s.id} />
                  </div>
                );
              })}

              {/* Report Footer */}
              {orderedSelected.length > 0 && (
                <div className="border-t pt-4 flex items-center justify-between" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    Generated by MEMTrak Report Builder | {new Date().toLocaleDateString()} | Confidential
                  </div>
                  <div className="text-[9px] font-bold" style={{ color: 'var(--accent)' }}>
                    Page 1 of 1
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
