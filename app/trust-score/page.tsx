'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import SparkKpi from '@/components/SparkKpi';
import { exportCSV } from '@/lib/export-utils';
import {
  ShieldCheck, Heart, TrendingUp, TrendingDown, Minus,
  AlertTriangle, Users, DollarSign, Download, X,
  BookOpen, Clock, MessageCircle, Megaphone,
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
};

/* ── trust tier config ────────────────────────────────────── */
const trustTiers = [
  { label: 'Champions',  range: '90-100', count: 380,  color: C.green },
  { label: 'Trusted',    range: '70-89',  count: 1420, color: C.blue },
  { label: 'Neutral',    range: '50-69',  count: 1850, color: C.amber },
  { label: 'Eroding',    range: '25-49',  count: 920,  color: C.orange },
  { label: 'Broken',     range: '0-24',   count: 424,  color: C.red },
];

/* ── trust framework factors ──────────────────────────────── */
const trustFactors = [
  {
    name: 'Credibility',
    weight: 25,
    score: 78,
    color: C.blue,
    icon: BookOpen,
    question: 'Do they believe your content is accurate?',
    measured: 'Click-through on educational content, resource downloads, guide completion rates',
  },
  {
    name: 'Reliability',
    weight: 25,
    score: 81,
    color: C.green,
    icon: Clock,
    question: 'Do you deliver consistently?',
    measured: 'Deliverability rate, send cadence consistency, promise fulfillment, on-time event starts',
  },
  {
    name: 'Intimacy',
    weight: 25,
    score: 64,
    color: C.purple,
    icon: MessageCircle,
    question: 'Do they feel personally connected?',
    measured: 'Reply rate, event attendance, committee participation, personal outreach responses',
  },
  {
    name: 'Self-Orientation',
    weight: 25,
    score: 35,
    color: C.red,
    icon: Megaphone,
    question: 'Do they feel marketed AT vs. served?',
    measured: 'Unsubscribe rate, complaint rate, email frequency tolerance, promotional-to-value ratio',
    negative: true,
  },
];

/* ── per-member trust data (consistent with scoring page orgs) ── */
const memberTrust = [
  { org: 'First American Title',      type: 'ACU', trust: 92, cred: 90, rel: 95, int: 88, so: 15, trend: 'stable',    revenue: 308000, engagement: 94 },
  { org: 'Commonwealth Land Title',   type: 'ACA', trust: 84, cred: 82, rel: 88, int: 80, so: 20, trend: 'rising',    revenue: 12160,  engagement: 87 },
  { org: 'Old Republic Title',        type: 'ACU', trust: 78, cred: 80, rel: 82, int: 72, so: 22, trend: 'stable',    revenue: 246000, engagement: 82 },
  { org: 'Westcor Land Title',        type: 'ACA', trust: 68, cred: 72, rel: 70, int: 60, so: 30, trend: 'declining', revenue: 9800,   engagement: 45 },
  { org: 'Liberty Title Group',       type: 'ACA', trust: 52, cred: 55, rel: 60, int: 48, so: 40, trend: 'declining', revenue: 8512,   engagement: 65 },
  { org: 'Stewart Title',             type: 'ACU', trust: 34, cred: 40, rel: 38, int: 25, so: 62, trend: 'declining', revenue: 184662, engagement: 88 },
  { org: 'National Title Services',   type: 'REA', trust: 22, cred: 28, rel: 30, int: 15, so: 70, trend: 'declining', revenue: 2646,   engagement: 72 },
  { org: 'Heritage Abstract LLC',     type: 'ACB', trust: 11, cred: 12, rel: 15, int: 8,  so: 85, trend: 'gone-dark', revenue: 1551,   engagement: 5 },
];

/* ── scatter data: trust vs engagement ────────────────────── */
const scatterMembers = [
  { x: 94, y: 92, label: 'First American' },
  { x: 87, y: 84, label: 'Commonwealth' },
  { x: 82, y: 78, label: 'Old Republic' },
  { x: 45, y: 68, label: 'Westcor' },       // low engagement, decent trust
  { x: 65, y: 52, label: 'Liberty Title' },
  { x: 88, y: 34, label: 'Stewart Title' },  // HIGH engagement, LOW trust
  { x: 72, y: 22, label: 'National Title' }, // high engagement, broken trust
  { x: 5,  y: 11, label: 'Heritage' },
];

/* ── trend data (4 months) ────────────────────────────────── */
const trendMonths = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026'];
const trendScores = [68, 70, 71, 72];

/* ── helpers ──────────────────────────────────────────────── */
function trustColor(score: number) {
  if (score >= 90) return C.green;
  if (score >= 70) return C.blue;
  if (score >= 50) return C.amber;
  if (score >= 25) return C.orange;
  return C.red;
}

function trustTier(score: number) {
  if (score >= 90) return 'Champion';
  if (score >= 70) return 'Trusted';
  if (score >= 50) return 'Neutral';
  if (score >= 25) return 'Eroding';
  return 'Broken';
}

function TrendBadge({ trend }: { trend: string }) {
  const cfg: Record<string, { icon: typeof TrendingUp; bg: string; fg: string }> = {
    rising:    { icon: TrendingUp,   bg: 'rgba(140,198,63,0.15)', fg: C.green },
    stable:    { icon: Minus,        bg: 'rgba(74,144,217,0.15)', fg: C.blue },
    declining: { icon: TrendingDown, bg: 'rgba(232,146,63,0.15)', fg: C.orange },
    'gone-dark': { icon: AlertTriangle, bg: 'rgba(217,74,74,0.15)', fg: C.red },
  };
  const c = cfg[trend] || cfg.stable;
  const Icon = c.icon;
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.fg }}>
      <Icon className="w-2.5 h-2.5" /> {trend}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function TrustScorePage() {
  const [selectedMember, setSelectedMember] = useState<typeof memberTrust[0] | null>(null);

  const totalMembers = trustTiers.reduce((s, t) => s + t.count, 0);

  return (
    <div className="p-6 space-y-6">
      {/* ── 1. Branded Header ──────────────────────────────── */}
      <div className="flex items-center gap-3 mb-1">
        <div className="relative">
          <ShieldCheck className="w-9 h-9" style={{ color: C.blue }} />
          <Heart className="absolute -bottom-0.5 -right-1 w-4 h-4" style={{ color: C.red }} />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            TrustScore<span className="align-super text-[9px] font-black" style={{ color: 'var(--accent)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Measure what actually matters: <strong style={{ color: 'var(--heading)' }}>trust.</strong>
          </p>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
        Based on the MarTech 2026 trust framework. <strong style={{ color: 'var(--heading)' }}>Credibility + Reliability + Intimacy &minus; Self-Orientation = Trust.</strong> TrustScore measures the <em>relationship</em>, not just the engagement.
      </p>

      {/* ── 2. SparkKpi Row ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <SparkKpi
          label="Avg Trust Score"
          value="72 / 100"
          icon={ShieldCheck}
          color={C.blue}
          sparkData={trendScores}
          sparkColor={C.blue}
          trend={{ value: 2.9, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                The org-wide average TrustScore across {totalMembers.toLocaleString()} scored members. Weighted equally across credibility, reliability, intimacy, and self-orientation.
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Benchmark</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Industry average for trade associations is 58/100. ALTA at 72 is in the top quartile.
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="High Trust (80+)"
          value="1,800"
          icon={Users}
          color={C.green}
          sparkData={[1620, 1680, 1740, 1800]}
          sparkColor={C.green}
          trend={{ value: 5.1, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Members scoring 80+ on the TrustScore index. These are your strongest relationships — they believe in your mission, trust your communications, and feel genuinely connected to ALTA.
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Action</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Leverage these members as advocates, testimonial sources, and committee candidates. They are your most likely referral generators.
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="At-Risk Trust (<40)"
          value="420"
          icon={AlertTriangle}
          color={C.orange}
          sparkData={[480, 460, 440, 420]}
          sparkColor={C.orange}
          trend={{ value: -6.2, label: 'improving' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Members with eroding or broken trust. They may still open emails, but they no longer feel served by the relationship. High complaint rates, unsubscribes, or complete disengagement characterize this group.
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Action</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Personal outreach, not automated campaigns. Ask what they need rather than telling them what you offer. Reduce promotional frequency immediately.
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Revenue in Trust Deficit"
          value="$312K"
          icon={DollarSign}
          color={C.red}
          sparkData={[340, 328, 318, 312]}
          sparkColor={C.red}
          trend={{ value: -8.2, label: 'improving' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Total annual revenue tied to members with trust scores below 40. This revenue is at immediate risk of non-renewal. The single largest leverage point for retention.
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Impact</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Recovering even 30% of trust-deficit members would save ~$94K in annual dues revenue and prevent downstream LTV losses of $400K+.
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* ── 3. Trust Distribution + 4. Trust Framework ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doughnut */}
        <Card
          title="Trust Score Distribution"
          subtitle={`${totalMembers.toLocaleString()} scored members across 5 trust tiers`}
          detailTitle="Trust Score Distribution — Full Breakdown"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Distribution of all scored members into trust tiers, based on the composite TrustScore formula.
              </p>
              {trustTiers.map(t => (
                <div key={t.label} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--heading)' }}>{t.label} ({t.range})</span>
                      <span className="font-bold" style={{ color: t.color }}>{t.count.toLocaleString()} ({((t.count / totalMembers) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 rounded-full mt-1" style={{ background: 'var(--card-border)' }}>
                      <div className="h-2 rounded-full" style={{ width: `${(t.count / totalMembers) * 100}%`, background: t.color }} />
                    </div>
                  </div>
                </div>
              ))}
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Insight</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  The largest tier is Neutral (37%) — these members have neither strong trust nor distrust. They represent the highest-leverage segment: a targeted trust-building campaign here could shift hundreds of members into the Trusted tier.
                </div>
              </div>
            </div>
          }
        >
          <ClientChart
            type="doughnut"
            height={300}
            data={{
              labels: trustTiers.map(t => `${t.label} (${t.range})`),
              datasets: [{
                data: trustTiers.map(t => t.count),
                backgroundColor: trustTiers.map(t => t.color),
                borderWidth: 2,
                borderColor: 'var(--card)',
                hoverOffset: 12,
              }],
            }}
          />
        </Card>

        {/* Trust Framework */}
        <Card
          title="Trust Equation Framework"
          subtitle="Credibility + Reliability + Intimacy - Self-Orientation"
          detailTitle="The Trust Equation — How TrustScore Works"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                TrustScore is computed using the MarTech 2026 trust framework. Three positive factors contribute to trust, while self-orientation detracts from it. Each factor is scored 0-100 and weighted equally at 25%.
              </p>
              <div className="rounded-lg p-4 text-center" style={{ background: 'var(--background)' }}>
                <div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>
                  Trust = (Credibility + Reliability + Intimacy) - Self-Orientation
                </div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Normalized to 0-100 scale. Self-Orientation inverted: lower is better.
                </div>
              </div>
              {trustFactors.map(f => (
                <div key={f.name} className="rounded-lg p-3" style={{ background: 'var(--background)', borderLeft: `3px solid ${f.color}` }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{f.name} {f.negative && '(negative)'}</span>
                    <span className="text-xs font-extrabold" style={{ color: f.color }}>{f.score}/100</span>
                  </div>
                  <p className="text-[10px] italic mb-1" style={{ color: 'var(--accent)' }}>&ldquo;{f.question}&rdquo;</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--heading)' }}>Measured by:</strong> {f.measured}
                  </p>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-5 pt-2">
            {trustFactors.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.name} className="flex items-center gap-4">
                  <ProgressRing value={f.score} max={100} color={f.color} size={56} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: f.color }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
                        {f.name}
                        {f.negative && <span className="text-[9px] font-normal ml-1" style={{ color: C.red }}>(negative factor)</span>}
                      </span>
                      <span className="text-[9px] font-semibold ml-auto" style={{ color: f.color }}>{f.weight}%</span>
                    </div>
                    <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>&ldquo;{f.question}&rdquo;</p>
                    <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{f.measured}</p>
                  </div>
                </div>
              );
            })}
            <div className="rounded-lg p-3 mt-2 text-center" style={{ background: 'var(--background)', border: '1px dashed var(--card-border)' }}>
              <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>
                Org-wide: (78 + 81 + 64) &minus; 35 = <span style={{ color: C.blue }}>188 &rarr; normalized 72/100</span>
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 5. Per-Member Trust Table ─────────────────────── */}
      <Card
        title="Per-Member Trust Scoreboard"
        subtitle="Trust factor breakdown for each member organization"
        detailTitle="Per-Member Trust Analysis"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Expanded trust profiles for each member, showing how each factor of the trust equation contributes to their overall TrustScore.
            </p>
            {memberTrust.map(m => (
              <div key={m.org} className="rounded-lg p-4" style={{ background: 'var(--background)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{m.org}</span>
                    <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>({m.type})</span>
                  </div>
                  <span className="text-sm font-extrabold" style={{ color: trustColor(m.trust) }}>{m.trust}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                  <div><span style={{ color: 'var(--text-muted)' }}>Credibility:</span> <strong style={{ color: 'var(--heading)' }}>{m.cred}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Reliability:</span> <strong style={{ color: 'var(--heading)' }}>{m.rel}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Intimacy:</span> <strong style={{ color: 'var(--heading)' }}>{m.int}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Self-Orient:</span> <strong style={{ color: m.so > 50 ? C.red : m.so > 30 ? C.orange : C.green }}>{m.so}</strong></div>
                </div>
                <div className="flex items-center justify-between text-[10px] pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tier: <strong style={{ color: trustColor(m.trust) }}>{trustTier(m.trust)}</strong></span>
                  <span style={{ color: 'var(--text-muted)' }}>Revenue: <strong style={{ color: 'var(--accent)' }}>${m.revenue.toLocaleString()}</strong></span>
                </div>
                <div className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--heading)' }}>Insight: </strong>
                  {m.trust >= 80 && 'Strong trust relationship. Ideal candidate for advocacy programs and testimonials.'}
                  {m.trust >= 50 && m.trust < 80 && 'Moderate trust. Focus on increasing intimacy through personal outreach and reducing promotional volume.'}
                  {m.trust >= 25 && m.trust < 50 && 'Trust is eroding. High self-orientation score suggests this member feels marketed at. Switch to value-first communication immediately.'}
                  {m.trust < 25 && 'Trust is broken. Automated campaigns will make this worse. Requires direct human relationship repair.'}
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="flex items-center justify-end mb-3">
          <button
            onClick={() =>
              exportCSV(
                ['Organization', 'Type', 'Trust Score', 'Credibility', 'Reliability', 'Intimacy', 'Self-Orientation', 'Trend', 'Revenue'],
                memberTrust.map(m => [m.org, m.type, m.trust, m.cred, m.rel, m.int, m.so, m.trend, '$' + m.revenue.toLocaleString()]),
                'MEMTrak_TrustScores',
              )
            }
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ color: 'var(--accent)', border: '1px solid var(--card-border)' }}
          >
            <Download className="w-3 h-3" /> CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th className="text-left pb-2" style={{ color: 'var(--text-muted)' }}>Organization</th>
                <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Trust</th>
                <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Cred</th>
                <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Rel</th>
                <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Int</th>
                <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Self-O</th>
                <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Trend</th>
                <th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {memberTrust.map(m => (
                <tr
                  key={m.org}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--card-border)' }}
                  onClick={() => setSelectedMember(m)}
                >
                  <td className="py-2.5 font-semibold" style={{ color: 'var(--heading)' }}>
                    {m.org} <span className="font-normal" style={{ color: 'var(--text-muted)' }}>({m.type})</span>
                  </td>
                  <td className="py-2.5">
                    <div className="flex justify-center">
                      <ProgressRing value={m.trust} max={100} color={trustColor(m.trust)} size={36} />
                    </div>
                  </td>
                  <td className="py-2.5 text-center font-bold" style={{ color: 'var(--heading)' }}>{m.cred}</td>
                  <td className="py-2.5 text-center font-bold" style={{ color: 'var(--heading)' }}>{m.rel}</td>
                  <td className="py-2.5 text-center font-bold" style={{ color: 'var(--heading)' }}>{m.int}</td>
                  <td className="py-2.5 text-center font-bold" style={{ color: m.so > 50 ? C.red : m.so > 30 ? C.orange : C.green }}>{m.so}</td>
                  <td className="py-2.5 text-center"><TrendBadge trend={m.trend} /></td>
                  <td className="py-2.5 text-right font-bold" style={{ color: 'var(--accent)' }}>${m.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Member Detail Modal ───────────────────────────── */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedMember(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--heading)' }}>{selectedMember.org}</h2>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>TrustScore Detail &mdash; {selectedMember.type}</p>
              </div>
              <button onClick={() => setSelectedMember(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Big score */}
              <div className="flex items-center justify-center gap-4">
                <ProgressRing value={selectedMember.trust} max={100} color={trustColor(selectedMember.trust)} size={80} />
                <div>
                  <div className="text-2xl font-extrabold" style={{ color: trustColor(selectedMember.trust) }}>
                    {selectedMember.trust}/100
                  </div>
                  <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                    Tier: {trustTier(selectedMember.trust)}
                  </div>
                </div>
              </div>

              {/* Factor bars */}
              <div className="space-y-3">
                {[
                  { label: 'Credibility', val: selectedMember.cred, color: C.blue },
                  { label: 'Reliability', val: selectedMember.rel, color: C.green },
                  { label: 'Intimacy', val: selectedMember.int, color: C.purple },
                  { label: 'Self-Orientation', val: selectedMember.so, color: C.red, negative: true },
                ].map(f => (
                  <div key={f.label}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span style={{ color: 'var(--heading)' }}>{f.label} {f.negative && '(lower is better)'}</span>
                      <span className="font-bold" style={{ color: f.color }}>{f.val}/100</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'var(--card-border)' }}>
                      <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${f.val}%`, background: f.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-3 rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>Engagement Score:</span>
                  <div className="font-bold" style={{ color: 'var(--heading)' }}>{selectedMember.engagement}</div>
                </div>
                <div className="text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>Annual Revenue:</span>
                  <div className="font-bold" style={{ color: 'var(--accent)' }}>${selectedMember.revenue.toLocaleString()}</div>
                </div>
                <div className="text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>Trend:</span>
                  <div className="mt-0.5"><TrendBadge trend={selectedMember.trend} /></div>
                </div>
                <div className="text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>Trust vs Engagement Gap:</span>
                  <div className="font-bold" style={{ color: Math.abs(selectedMember.trust - selectedMember.engagement) > 20 ? C.red : C.green }}>
                    {selectedMember.trust - selectedMember.engagement > 0 ? '+' : ''}{selectedMember.trust - selectedMember.engagement} pts
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Recommended Action</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {selectedMember.trust >= 80 && 'This member has strong trust. Recruit for advocacy, committees, and testimonials. Maintain personal touch.'}
                  {selectedMember.trust >= 50 && selectedMember.trust < 80 && 'Moderate trust — focus on increasing intimacy through personal outreach. Ensure content delivers on promises. Reduce self-serving communications.'}
                  {selectedMember.trust >= 25 && selectedMember.trust < 50 && 'Trust is eroding. Stop automated marketing immediately. Switch to value-first, personally relevant communications. Staff outreach within 14 days.'}
                  {selectedMember.trust < 25 && 'Trust is broken. No amount of email will fix this. Requires direct human intervention — phone call, in-person meeting, or personalized service recovery. Remove from all automated campaigns.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Trust vs Engagement Scatter ────────────────── */}
      <Card
        title="Trust vs. Engagement — They Are Not the Same"
        subtitle="Some members engage heavily but don't trust you. Others trust deeply but engage quietly."
        detailTitle="Understanding the Trust-Engagement Gap"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              This scatter plot reveals the gap between engagement (activity-based) and trust (relationship-based). Members in the lower-right quadrant are the most dangerous: they open everything but have broken trust — high complaint rates, spam reports, or never reply.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: C.green }}>High Trust + High Engagement</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>True advocates. They open, click, attend, AND they trust the relationship. Protect these at all costs.</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: C.amber }}>High Trust + Low Engagement</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Quiet supporters. They trust ALTA but prefer phone calls, in-person events, or direct staff contact. Engagement scoring misses them entirely.</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: C.red }}>Low Trust + High Engagement</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Dangerous false positive. They open emails obsessively but report spam, never reply, and complain to staff. Traditional scoring says they are "engaged" — TrustScore says the relationship is broken.</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Low Trust + Low Engagement</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Gone dark. Both systems agree — this member has disengaged and the relationship has collapsed.</div>
              </div>
            </div>
            <div className="space-y-2">
              {scatterMembers.map(m => (
                <div key={m.label} className="flex items-center justify-between text-[10px] rounded-lg p-2" style={{ background: 'var(--background)' }}>
                  <span className="font-bold" style={{ color: 'var(--heading)' }}>{m.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Engagement: <strong style={{ color: C.blue }}>{m.x}</strong> &nbsp;|&nbsp; Trust: <strong style={{ color: trustColor(m.y) }}>{m.y}</strong>
                    {Math.abs(m.x - m.y) > 20 && (
                      <span className="ml-2 font-bold" style={{ color: C.red }}>GAP: {Math.abs(m.x - m.y)}pts</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <ClientChart
          type="scatter"
          height={300}
          data={{
            datasets: [{
              label: 'Members',
              data: scatterMembers.map(m => ({ x: m.x, y: m.y })),
              backgroundColor: scatterMembers.map(m => trustColor(m.y)),
              borderColor: scatterMembers.map(m => trustColor(m.y)),
              pointRadius: 8,
              pointHoverRadius: 11,
            }],
          }}
          options={{
            scales: {
              x: {
                title: { display: true, text: 'Engagement Score', color: 'var(--text-muted)', font: { size: 11, weight: 'bold' as const } },
                min: 0, max: 100,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'var(--text-muted)' },
              },
              y: {
                title: { display: true, text: 'Trust Score', color: 'var(--text-muted)', font: { size: 11, weight: 'bold' as const } },
                min: 0, max: 100,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'var(--text-muted)' },
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx: { raw: { x: number; y: number }; dataIndex: number }) => {
                    const m = scatterMembers[ctx.dataIndex];
                    return `${m.label}: Engagement ${m.x}, Trust ${m.y}`;
                  },
                },
              },
              // Quadrant lines
              annotation: {
                annotations: {
                  hLine: { type: 'line', yMin: 50, yMax: 50, borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderDash: [4, 4] },
                  vLine: { type: 'line', xMin: 50, xMax: 50, borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderDash: [4, 4] },
                },
              },
            },
          }}
        />
        {/* Quadrant labels */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="text-center text-[9px] font-bold rounded-lg py-1.5" style={{ background: 'rgba(245,197,66,0.08)', color: C.amber }}>
            High Trust / Low Engagement
          </div>
          <div className="text-center text-[9px] font-bold rounded-lg py-1.5" style={{ background: 'rgba(140,198,63,0.08)', color: C.green }}>
            High Trust / High Engagement
          </div>
          <div className="text-center text-[9px] font-bold rounded-lg py-1.5" style={{ background: 'rgba(128,128,128,0.08)', color: 'var(--text-muted)' }}>
            Low Trust / Low Engagement
          </div>
          <div className="text-center text-[9px] font-bold rounded-lg py-1.5" style={{ background: 'rgba(217,74,74,0.08)', color: C.red }}>
            Low Trust / High Engagement
          </div>
        </div>
      </Card>

      {/* ── 7. Trust Trend Over Time ──────────────────────── */}
      <Card
        title="Org-Wide Trust Trend"
        subtitle="Average TrustScore over the past 4 months"
        detailTitle="Trust Trend Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              The organization-wide average TrustScore has increased 4 points over 4 months, from 68 to 72. This upward trend reflects improvements in deliverability (reliability), reduced promotional email frequency (self-orientation), and increased event attendance (intimacy).
            </p>
            <div className="space-y-2">
              {trendMonths.map((month, i) => (
                <div key={month} className="flex items-center justify-between text-xs rounded-lg p-2" style={{ background: 'var(--background)' }}>
                  <span style={{ color: 'var(--heading)' }}>{month}</span>
                  <span className="font-extrabold" style={{ color: C.blue }}>{trendScores[i]}/100</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
              <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Key Drivers</div>
              <ul className="text-[10px] space-y-1" style={{ color: 'var(--text-muted)' }}>
                <li>- Deliverability improved from 94.2% to 96.8% (Reliability up)</li>
                <li>- Promotional emails reduced from 4/mo to 2/mo (Self-Orientation down)</li>
                <li>- Spring conference attendance up 12% YoY (Intimacy up)</li>
                <li>- Educational content click-through up 8% (Credibility stable+)</li>
              </ul>
            </div>
          </div>
        }
      >
        <ClientChart
          type="line"
          height={220}
          data={{
            labels: trendMonths,
            datasets: [{
              label: 'Avg TrustScore',
              data: trendScores,
              borderColor: C.blue,
              backgroundColor: 'rgba(74,144,217,0.12)',
              fill: true,
              tension: 0.35,
              pointRadius: 5,
              pointBackgroundColor: C.blue,
              pointBorderColor: 'var(--card)',
              pointBorderWidth: 2,
              pointHoverRadius: 8,
            }],
          }}
          options={{
            scales: {
              y: {
                min: 60, max: 80,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: 'var(--text-muted)', stepSize: 5 },
              },
              x: {
                grid: { display: false },
                ticks: { color: 'var(--text-muted)' },
              },
            },
            plugins: {
              legend: { display: false },
              datalabels: {
                display: true,
                anchor: 'end' as const,
                align: 'top' as const,
                color: 'var(--heading)',
                font: { weight: 'bold' as const, size: 12 },
              },
            },
          }}
        />
      </Card>

      {/* ── 8. TrustScore vs Engagement Scoring ──────────── */}
      <Card
        title="How TrustScore Differs from Engagement Scoring"
        subtitle="Why measuring trust matters more than measuring clicks"
        detailTitle="TrustScore vs. Engagement Scoring — Full Comparison"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Traditional engagement scoring counts activity: opens, clicks, page views. TrustScore measures the underlying relationship. Here is why that distinction matters for member retention and revenue.
            </p>
            <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
              <div className="text-[10px] font-bold mb-2" style={{ color: 'var(--heading)' }}>The Core Difference</div>
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div>
                  <div className="font-bold mb-1" style={{ color: C.orange }}>Engagement Scoring</div>
                  <ul className="space-y-1" style={{ color: 'var(--text-muted)' }}>
                    <li>- Measures activity (did they open?)</li>
                    <li>- Rewards frequency of interaction</li>
                    <li>- Treats all opens/clicks equally</li>
                    <li>- Ignores negative signals</li>
                    <li>- Cannot detect "hate-reading"</li>
                  </ul>
                </div>
                <div>
                  <div className="font-bold mb-1" style={{ color: C.blue }}>TrustScore</div>
                  <ul className="space-y-1" style={{ color: 'var(--text-muted)' }}>
                    <li>- Measures relationship (do they value it?)</li>
                    <li>- Rewards quality of connection</li>
                    <li>- Weighs positive AND negative signals</li>
                    <li>- Penalizes self-orientation</li>
                    <li>- Detects broken relationships</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
              <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Real-World Examples at ALTA</div>
              <div className="text-[10px] space-y-2" style={{ color: 'var(--text-muted)' }}>
                <p><strong style={{ color: C.red }}>Stewart Title:</strong> Engagement score 88 (opens everything), Trust score 34 (high complaint rate, never replies, high self-orientation). Traditional scoring says "engaged." TrustScore says "relationship is broken." Without TrustScore, this member would never be flagged for intervention.</p>
                <p><strong style={{ color: C.amber }}>Westcor Land Title:</strong> Engagement score 45 (rarely opens emails), Trust score 68 (calls staff directly, attends events, refers new members). Traditional scoring says "disengaged." TrustScore says "deeply connected through non-digital channels." Without TrustScore, this member would receive unnecessary re-engagement campaigns.</p>
              </div>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Comparison grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ background: 'rgba(232,146,63,0.06)', border: '1px solid rgba(232,146,63,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(232,146,63,0.15)' }}>
                  <Users className="w-3 h-3" style={{ color: C.orange }} />
                </div>
                <span className="text-xs font-bold" style={{ color: C.orange }}>Engagement Scoring</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Activity-based. Did they open? Did they click? How many times? Treats all interactions as positive signals regardless of intent or sentiment.
              </p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,144,217,0.15)' }}>
                  <ShieldCheck className="w-3 h-3" style={{ color: C.blue }} />
                </div>
                <span className="text-xs font-bold" style={{ color: C.blue }}>TrustScore</span>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Relationship-based. Do they value the connection? Do they feel served or marketed at? Weighs both positive and negative relationship signals.
              </p>
            </div>
          </div>

          {/* Key examples */}
          <div className="space-y-2">
            <div className="rounded-lg p-3" style={{ background: 'var(--background)', borderLeft: `3px solid ${C.red}` }}>
              <div className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--heading)' }}>
                High Engagement, Broken Trust
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                A member who opens every email but reports spam has high engagement but broken trust.
                Traditional scoring misses this entirely.
              </p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--background)', borderLeft: `3px solid ${C.green}` }}>
              <div className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--heading)' }}>
                Low Engagement, High Trust
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                A member who rarely opens emails but calls staff directly has low engagement but high trust.
                Engagement scoring would flag them for re-engagement campaigns they do not need.
              </p>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--background)', borderLeft: `3px solid ${C.blue}` }}>
              <div className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--heading)' }}>
                TrustScore captures what engagement scoring misses
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                The difference between "activity" and "relationship" is the difference between counting clicks and understanding whether a member values their connection to ALTA. One predicts opens. The other predicts renewals.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
