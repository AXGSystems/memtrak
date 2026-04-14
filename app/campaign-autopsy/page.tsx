'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { MiniBar } from '@/components/SparkKpi';
import { demoCampaigns } from '@/lib/demo-data';
import {
  Microscope,
  BarChart3,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Zap,
  Award,
  ArrowRight,
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
  indigo: '#6366f1',
};

/* ── Campaign type averages (benchmarks) ── */
const typeAverages: Record<string, { openRate: number; clickRate: number; rpr: number }> = {
  Compliance: { openRate: 28.0, clickRate: 7.5, rpr: 0.60 },
  Renewal: { openRate: 62.0, clickRate: 35.0, rpr: 850.0 },
  Events: { openRate: 38.0, clickRate: 14.0, rpr: 28.0 },
  Newsletter: { openRate: 35.0, clickRate: 8.5, rpr: 0.0 },
  Onboarding: { openRate: 75.0, clickRate: 35.0, rpr: 0.0 },
  Advocacy: { openRate: 42.0, clickRate: 12.0, rpr: 22.0 },
  Retention: { openRate: 82.0, clickRate: 28.0, rpr: 0.0 },
};

/* ── Sent campaigns for analysis ── */
const sentCampaigns = demoCampaigns
  .filter(c => c.status === 'Sent')
  .sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());

/* ── Compute campaign score ── */
function scoreCampaign(c: typeof demoCampaigns[0]) {
  const avg = typeAverages[c.type] || typeAverages.Newsletter;
  const openRate = (c.uniqueOpened / c.delivered) * 100;
  const clickRate = (c.clicked / c.delivered) * 100;
  const rpr = c.revenue / c.delivered;
  const deliveryRate = (c.delivered / c.listSize) * 100;

  let score = 50;
  // Open rate contribution (0-25)
  score += Math.min(25, ((openRate / avg.openRate) - 1) * 50 + 12.5);
  // Click rate contribution (0-25)
  score += Math.min(25, ((clickRate / avg.clickRate) - 1) * 50 + 12.5);
  // Delivery rate (0-15)
  score += Math.min(15, (deliveryRate / 100) * 15);
  // Low unsub bonus (0-10)
  const unsubRate = (c.unsubscribed / c.delivered) * 100;
  score += Math.max(0, 10 - unsubRate * 20);
  // Revenue bonus (0-10)
  if (avg.rpr > 0 && rpr > 0) score += Math.min(10, (rpr / avg.rpr) * 5);

  return Math.round(Math.max(0, Math.min(100, score)));
}

/* ── Generate AI recommendations ── */
function getRecommendations(c: typeof demoCampaigns[0]) {
  const openRate = (c.uniqueOpened / c.delivered) * 100;
  const clickRate = (c.clicked / c.delivered) * 100;
  const avg = typeAverages[c.type] || typeAverages.Newsletter;
  const recs: { title: string; desc: string; impact: string; color: string }[] = [];

  if (openRate < avg.openRate) {
    recs.push({
      title: 'Improve Subject Line Performance',
      desc: `Open rate (${openRate.toFixed(1)}%) is below the ${c.type} average (${avg.openRate}%). Test shorter subject lines with personalization tokens (member name, company). A/B test 2-3 variants on a 10% sample before full send.`,
      impact: `+${(avg.openRate - openRate).toFixed(0)}% potential open rate lift`,
      color: C.blue,
    });
  } else {
    recs.push({
      title: 'Maintain Subject Line Strategy',
      desc: `Open rate (${openRate.toFixed(1)}%) exceeds the ${c.type} average (${avg.openRate}%). Document and replicate the subject line pattern used in this campaign for future sends of this type.`,
      impact: 'Sustain above-average performance',
      color: C.green,
    });
  }

  if (clickRate < avg.clickRate) {
    recs.push({
      title: 'Strengthen Call-to-Action Design',
      desc: `Click rate (${clickRate.toFixed(1)}%) trails the ${c.type} average (${avg.clickRate}%). Move the primary CTA above the fold, use contrasting button colors, and reduce competing links. Consider adding urgency copy near the CTA.`,
      impact: `+${(avg.clickRate - clickRate).toFixed(0)}% potential click rate lift`,
      color: C.orange,
    });
  } else {
    recs.push({
      title: 'Expand Click Conversion Path',
      desc: `Click rate (${clickRate.toFixed(1)}%) outperforms the ${c.type} average (${avg.clickRate}%). The CTA is working — now optimize the landing page to convert more clickers into completions.`,
      impact: 'Higher revenue per click',
      color: C.green,
    });
  }

  if (c.bounced > c.listSize * 0.03) {
    recs.push({
      title: 'Clean Bounce-Prone Segments',
      desc: `Bounce rate (${((c.bounced / c.listSize) * 100).toFixed(1)}%) exceeds 3% threshold. Run the list through MEMTrak Hygiene before next send. Remove hard bounces immediately and quarantine soft bounces after 3 consecutive failures.`,
      impact: 'Improved deliverability and sender reputation',
      color: C.red,
    });
  } else {
    recs.push({
      title: 'Optimize Send Timing',
      desc: `Deliverability is strong at ${((c.delivered / c.listSize) * 100).toFixed(1)}%. Test sending this campaign type on ${c.type === 'Compliance' ? 'Tuesday 9-10 AM' : c.type === 'Events' ? 'Thursday morning' : 'Monday 8-9 AM'} based on SendBrain segment data to maximize opens.`,
      impact: '+5-12% potential open rate from timing optimization',
      color: C.purple,
    });
  }

  return recs;
}

/* ── What worked / didn't ── */
function getWhatWorked(c: typeof demoCampaigns[0]) {
  const avg = typeAverages[c.type] || typeAverages.Newsletter;
  const openRate = (c.uniqueOpened / c.delivered) * 100;
  const clickRate = (c.clicked / c.delivered) * 100;
  const deliveryRate = (c.delivered / c.listSize) * 100;
  const unsubRate = (c.unsubscribed / c.delivered) * 100;

  const worked: string[] = [];
  const didnt: string[] = [];

  if (openRate >= avg.openRate) worked.push(`Open rate ${openRate.toFixed(1)}% beat ${c.type} average by ${(openRate - avg.openRate).toFixed(1)}pp`);
  else didnt.push(`Open rate ${openRate.toFixed(1)}% fell short of ${c.type} average (${avg.openRate}%)`);

  if (clickRate >= avg.clickRate) worked.push(`Click rate ${clickRate.toFixed(1)}% exceeded ${c.type} benchmark`);
  else didnt.push(`Click rate ${clickRate.toFixed(1)}% below ${c.type} average (${avg.clickRate}%)`);

  if (deliveryRate >= 95) worked.push(`Strong delivery at ${deliveryRate.toFixed(1)}% — clean list`);
  else didnt.push(`Delivery rate ${deliveryRate.toFixed(1)}% — consider list hygiene`);

  if (unsubRate < 0.5) worked.push(`Near-zero unsubscribe rate (${unsubRate.toFixed(2)}%)`);
  else didnt.push(`Elevated unsubscribes (${unsubRate.toFixed(2)}%) — may indicate fatigue`);

  if (c.revenue > 0) worked.push(`Generated $${c.revenue.toLocaleString()} in attributed revenue`);

  return { worked, didnt };
}

export default function CampaignAutopsy() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showAllCampaigns, setShowAllCampaigns] = useState(false);

  const selected = sentCampaigns[selectedIdx];
  const score = scoreCampaign(selected);
  const recs = getRecommendations(selected);
  const { worked, didnt } = getWhatWorked(selected);
  const avg = typeAverages[selected.type] || typeAverages.Newsletter;

  /* ── Funnel data ── */
  const funnel = [
    { label: 'Sent', value: selected.listSize, color: C.blue },
    { label: 'Delivered', value: selected.delivered, color: C.indigo },
    { label: 'Opened', value: selected.uniqueOpened, color: C.green },
    { label: 'Clicked', value: selected.clicked, color: C.orange },
    { label: 'Converted', value: selected.revenue > 0 ? Math.round(selected.clicked * 0.35) : 0, color: C.purple },
  ];

  /* ── KPI calculations ── */
  const campaignsAnalyzed = sentCampaigns.length;
  const avgScore = Math.round(sentCampaigns.reduce((s, c) => s + scoreCampaign(c), 0) / sentCampaigns.length);
  const scores = sentCampaigns.map(c => ({ name: c.name, score: scoreCampaign(c), type: c.type }));
  const bestImproved = 'Click Rate';
  const biggestOpp = 'Subject Lines';

  const scoreColor = score >= 80 ? C.green : score >= 60 ? C.blue : score >= 40 ? C.orange : C.red;

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.2) 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            <Microscope className="w-5 h-5" style={{ color: C.indigo }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              CampaignAutopsy<span style={{ color: C.indigo, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.indigo }}>
              Every campaign teaches the next one.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Automated post-mortem analysis for every sent campaign. CampaignAutopsy scores performance, identifies
          what worked and what didn&apos;t, runs funnel diagnostics, and generates AI-powered recommendations
          so each send is smarter than the last.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Campaigns Analyzed"
          value={campaignsAnalyzed}
          sub="Sent campaigns with data"
          icon={BarChart3}
          color={C.indigo}
          sparkData={[4, 5, 6, 7, 7, 8, campaignsAnalyzed]}
          sparkColor={C.indigo}
          trend={{ value: 12.5, label: 'vs last month' }}
          accent
        />
        <SparkKpi
          label="Avg Score"
          value={avgScore}
          sub="Out of 100"
          icon={Award}
          color={avgScore >= 70 ? C.green : C.blue}
          sparkData={[58, 62, 64, 67, 68, 70, avgScore]}
          sparkColor={avgScore >= 70 ? C.green : C.blue}
          trend={{ value: 8.4, label: 'improving trend' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Campaign scores are calculated using open rate, click rate, delivery rate, unsubscribe rate,
                and revenue — each benchmarked against the campaign type average.
              </p>
              {scores.sort((a, b) => b.score - a.score).map(s => (
                <div key={s.name} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)' }}>
                  <span className="truncate mr-2" style={{ color: 'var(--heading)' }}>{s.name}</span>
                  <span className="font-bold flex-shrink-0" style={{ color: s.score >= 70 ? C.green : s.score >= 50 ? C.blue : C.orange }}>{s.score}</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Most Improved Metric"
          value={bestImproved}
          sub="+4.2pp from last quarter"
          icon={TrendingUp}
          color={C.green}
          sparkData={[6.8, 7.2, 7.8, 8.5, 9.1, 10.2, 11.0]}
          sparkColor={C.green}
          trend={{ value: 4.2, label: 'click rate lift' }}
          accent
        />
        <SparkKpi
          label="Biggest Opportunity"
          value={biggestOpp}
          sub="3 campaigns under avg open rate"
          icon={Target}
          color={C.orange}
          sparkData={[35, 33, 30, 28, 32, 29, 31]}
          sparkColor={C.orange}
          trend={{ value: -6.1, label: 'below benchmark' }}
          accent
        />
      </div>

      {/* ── 3. Campaign Selector ──────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Microscope className="w-4 h-4" style={{ color: C.indigo }} />
          <h2 className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>Select Campaign</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {sentCampaigns.slice(0, showAllCampaigns ? undefined : 4).map((c, i) => {
            const s = scoreCampaign(c);
            const sc = s >= 80 ? C.green : s >= 60 ? C.blue : s >= 40 ? C.orange : C.red;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedIdx(i)}
                className="px-3 py-2 rounded-lg text-[10px] font-semibold transition-all hover:scale-[1.02] flex items-center gap-2"
                style={{
                  background: i === selectedIdx ? `color-mix(in srgb, ${C.indigo} 15%, transparent)` : 'var(--input-bg)',
                  color: i === selectedIdx ? C.indigo : 'var(--text-muted)',
                  border: i === selectedIdx ? `1px solid ${C.indigo}40` : '1px solid var(--card-border)',
                }}
              >
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-extrabold" style={{ background: `color-mix(in srgb, ${sc} 20%, transparent)`, color: sc }}>{s}</span>
                <span className="truncate max-w-[160px]">{c.name}</span>
              </button>
            );
          })}
          {sentCampaigns.length > 4 && (
            <button
              onClick={() => setShowAllCampaigns(!showAllCampaigns)}
              className="px-3 py-2 rounded-lg text-[10px] font-semibold flex items-center gap-1"
              style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--card-border)' }}
            >
              {showAllCampaigns ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showAllCampaigns ? 'Less' : `+${sentCampaigns.length - 4} more`}
            </button>
          )}
        </div>
      </div>

      {/* ── 4. Campaign Autopsy Panel ─────────────────────────── */}
      <div className="rounded-xl border mb-8 overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-extrabold" style={{ color: 'var(--heading)' }}>{selected.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Sent {selected.sentDate}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>{selected.type}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>{selected.source}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold" style={{ color: scoreColor }}>{score}</div>
              <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>Campaign Score</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* What worked / What didn't */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg p-4" style={{ background: 'rgba(140,198,63,0.04)', border: '1px solid rgba(140,198,63,0.12)' }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4" style={{ color: C.green }} />
                <span className="text-[11px] font-extrabold" style={{ color: C.green }}>What Worked</span>
              </div>
              <div className="space-y-2">
                {worked.map((w, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: C.green }} />
                    <span className="text-[10px]" style={{ color: 'var(--heading)' }}>{w}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg p-4" style={{ background: 'rgba(217,74,74,0.04)', border: '1px solid rgba(217,74,74,0.12)' }}>
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4" style={{ color: C.red }} />
                <span className="text-[11px] font-extrabold" style={{ color: C.red }}>What Didn&apos;t</span>
              </div>
              <div className="space-y-2">
                {didnt.length > 0 ? didnt.map((d, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: C.red }} />
                    <span className="text-[10px]" style={{ color: 'var(--heading)' }}>{d}</span>
                  </div>
                )) : (
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Nothing significant underperformed. Great campaign.</span>
                )}
              </div>
            </div>
          </div>

          {/* Funnel */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4" style={{ color: C.indigo }} />
              <span className="text-[11px] font-extrabold" style={{ color: 'var(--heading)' }}>Funnel Diagnostics</span>
            </div>
            <div className="flex items-end gap-1">
              {funnel.map((f, i) => {
                const maxVal = funnel[0].value;
                const pct = maxVal > 0 ? (f.value / maxVal) * 100 : 0;
                const rate = i > 0 && funnel[i - 1].value > 0
                  ? ((f.value / funnel[i - 1].value) * 100).toFixed(1)
                  : '100.0';
                return (
                  <div key={f.label} className="flex-1 text-center">
                    <div className="text-[10px] font-extrabold mb-1" style={{ color: 'var(--heading)' }}>{f.value.toLocaleString()}</div>
                    <div
                      className="mx-auto rounded-t-lg transition-all duration-500"
                      style={{ height: Math.max(20, pct * 1.2), background: f.color + '80', borderTop: `3px solid ${f.color}`, width: '100%' }}
                    />
                    <div className="text-[9px] font-bold mt-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</div>
                    {i > 0 && (
                      <div className="text-[8px] font-bold" style={{ color: f.color }}>{rate}%</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Per Recipient + Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-lg p-4" style={{ background: 'var(--input-bg)' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Revenue Per Recipient</div>
              <div className="text-2xl font-extrabold" style={{ color: selected.revenue > 0 ? C.green : 'var(--heading)' }}>
                ${selected.delivered > 0 ? (selected.revenue / selected.delivered).toFixed(2) : '0.00'}
              </div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Total revenue: ${selected.revenue.toLocaleString()}
              </div>
              {avg.rpr > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{selected.type} avg:</span>
                  <span className="text-[10px] font-bold" style={{ color: C.blue }}>${avg.rpr.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="rounded-lg p-4" style={{ background: 'var(--input-bg)' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>vs {selected.type} Average</div>
              <div className="space-y-2">
                {[
                  { label: 'Open Rate', yours: (selected.uniqueOpened / selected.delivered * 100), avg: avg.openRate },
                  { label: 'Click Rate', yours: (selected.clicked / selected.delivered * 100), avg: avg.clickRate },
                ].map(m => {
                  const diff = m.yours - m.avg;
                  return (
                    <div key={m.label} className="flex items-center justify-between">
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{m.yours.toFixed(1)}%</span>
                        <span className="text-[9px] font-bold" style={{ color: diff >= 0 ? C.green : C.red }}>
                          {diff >= 0 ? '+' : ''}{diff.toFixed(1)}pp
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4" style={{ color: C.amber }} />
              <span className="text-[11px] font-extrabold" style={{ color: 'var(--heading)' }}>AI Recommendations</span>
            </div>
            <div className="space-y-3">
              {recs.map((r, i) => (
                <div key={i} className="rounded-lg border p-4" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', borderLeftWidth: '3px', borderLeftColor: r.color }}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{r.title}</span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2" style={{ background: `color-mix(in srgb, ${r.color} 15%, transparent)`, color: r.color }}>
                      {r.impact}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. All Campaigns Score Comparison ─────────────────── */}
      <Card
        title="Campaign Score Comparison"
        subtitle="All sent campaigns ranked by autopsy score"
        className="mb-8"
        detailTitle="Scoring Methodology"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              CampaignAutopsy scores each campaign on a 0-100 scale using five weighted factors,
              benchmarked against the campaign type average. This normalization ensures a compliance
              email is measured against compliance benchmarks, not newsletter benchmarks.
            </p>
            {[
              { factor: 'Open Rate Performance', weight: '25%', desc: 'Compared to campaign type average' },
              { factor: 'Click Rate Performance', weight: '25%', desc: 'Compared to campaign type average' },
              { factor: 'Delivery Rate', weight: '15%', desc: 'List health and deliverability' },
              { factor: 'Unsubscribe Rate', weight: '10%', desc: 'Lower is better — fatigue indicator' },
              { factor: 'Revenue Attribution', weight: '10%', desc: 'RPR vs type average (when applicable)' },
            ].map(f => (
              <div key={f.factor} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)' }}>
                <div>
                  <span style={{ color: 'var(--heading)' }}>{f.factor}</span>
                  <span className="ml-2" style={{ color: 'var(--text-muted)' }}>{f.desc}</span>
                </div>
                <span className="font-bold" style={{ color: C.indigo }}>{f.weight}</span>
              </div>
            ))}
          </div>
        }
      >
        <ClientChart
          type="bar"
          height={280}
          data={{
            labels: sentCampaigns.map(c => c.name.length > 28 ? c.name.substring(0, 28) + '...' : c.name),
            datasets: [{
              label: 'Autopsy Score',
              data: sentCampaigns.map(c => scoreCampaign(c)),
              backgroundColor: sentCampaigns.map(c => {
                const s = scoreCampaign(c);
                return s >= 80 ? C.green + '80' : s >= 60 ? C.blue + '80' : s >= 40 ? C.orange + '80' : C.red + '80';
              }),
              borderColor: sentCampaigns.map(c => {
                const s = scoreCampaign(c);
                return s >= 80 ? C.green : s >= 60 ? C.blue : s >= 40 ? C.orange : C.red;
              }),
              borderWidth: 2,
              borderRadius: 8,
            }],
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
              },
            },
            scales: {
              x: { max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
              y: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 } } },
            },
          }}
        />
      </Card>

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(99,102,241,0.08)', color: C.indigo, border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <Microscope className="w-3 h-3" />
          CampaignAutopsy&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
