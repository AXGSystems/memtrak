'use client';

import { useState } from 'react';
import {
  UserX, UserCheck, Clock, Sunset, Mail, TrendingUp, Users, Eye,
  AlertTriangle, CheckCircle2, ArrowRight, X, RefreshCw, Timer,
} from 'lucide-react';
import SparkKpi from '@/components/SparkKpi';
import Card from '@/components/Card';
import ClientChart from '@/components/ClientChart';

/* ── Palette ── */
const C = {
  green: '#8CC63F',
  red: '#D94A4A',
  amber: '#E8923F',
  blue: '#4A90D9',
  purple: '#9B6DD7',
  gray: '#6B7A8D',
  navy: '#1B3A5C',
};

/* ── Sunset policy thresholds ── */
const thresholds = [
  { days: 30, label: 'Cooling Off', color: C.amber, desc: 'No opens in 30 days. Enters monitoring.', count: 1840, pct: 10.0 },
  { days: 60, label: 'At Risk', color: C.red, desc: 'No opens in 60 days. Winback sequence triggered.', count: 980, pct: 5.3 },
  { days: 90, label: 'Sunset Candidate', color: C.gray, desc: 'No opens in 90+ days. Recommend list removal.', count: 420, pct: 2.3 },
];

/* ── Inactive members by tier ── */
const inactiveByTier = [
  { tier: 'ACA (Title Agents)', total: 4200, inactive30: 380, inactive60: 210, inactive90: 95, color: C.blue },
  { tier: 'ACB (Small Title)', total: 3100, inactive30: 520, inactive60: 280, inactive90: 140, color: C.amber },
  { tier: 'ACU (Underwriters)', total: 280, inactive30: 18, inactive60: 12, inactive90: 5, color: C.green },
  { tier: 'REA (Attorneys)', total: 1200, inactive30: 190, inactive60: 98, inactive90: 42, color: C.purple },
  { tier: 'AFF (Affiliates)', total: 2400, inactive30: 420, inactive60: 230, inactive90: 95, color: C.navy },
  { tier: 'LMI (Land Members)', total: 780, inactive30: 312, inactive60: 150, inactive90: 43, color: C.red },
];

/* ── Winback sequence ── */
const winbackSequence = [
  {
    email: 1,
    subject: 'We noticed you have been away — here is what you missed',
    timing: 'Day 0 (trigger)',
    openRate: 28.4,
    clickRate: 8.2,
    tone: 'Warm re-engagement',
    content: 'Personalized digest of missed content, events, and member benefits. Includes top 3 articles and upcoming deadlines. Soft, non-pushy tone.',
    status: 'active',
  },
  {
    email: 2,
    subject: 'Your ALTA membership benefits — are you using them all?',
    timing: 'Day 7',
    openRate: 22.1,
    clickRate: 6.5,
    tone: 'Value reminder',
    content: 'Highlights underutilized benefits based on member type (ACA vs ACU vs REA). Includes dollar-value breakdown of membership ROI. Links to benefit activation.',
    status: 'active',
  },
  {
    email: 3,
    subject: 'Final check-in: shall we keep your preferences active?',
    timing: 'Day 21',
    openRate: 18.7,
    clickRate: 5.1,
    tone: 'Respectful last call',
    content: 'Transparent message about email preferences. Offers frequency reduction option, topic preferences, or clean unsubscribe. Sets expectations for sunset policy.',
    status: 'active',
  },
];

/* ── Success metrics ── */
const successMetrics = [
  { label: 'Winback Open Rate', value: '28.4%', sub: 'Email 1 avg', benchmark: '18% industry avg', color: C.green },
  { label: 'Re-engagement Rate', value: '45%', sub: 'Opened future emails', benchmark: '30% industry avg', color: C.green },
  { label: 'Sequence Completion', value: '72%', sub: 'Received all 3 emails', benchmark: 'N/A', color: C.blue },
  { label: 'Unsubscribe from Winback', value: '8.2%', sub: 'Clean list removal', benchmark: '12% industry avg', color: C.green },
];

/* ── Re-engagement trend ── */
const reEngagementTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [
    {
      label: 'Entered Winback',
      data: [320, 280, 310, 345],
      backgroundColor: `${C.amber}cc`,
      borderRadius: 6,
      borderWidth: 0,
    },
    {
      label: 'Re-engaged',
      data: [128, 119, 148, 155],
      backgroundColor: `${C.green}cc`,
      borderRadius: 6,
      borderWidth: 0,
    },
    {
      label: 'Sunset (removed)',
      data: [95, 82, 78, 88],
      backgroundColor: `${C.gray}cc`,
      borderRadius: 6,
      borderWidth: 0,
    },
  ],
};

/* ── Sunset candidates ── */
const sunsetCandidates = [
  { org: 'Heritage Abstract LLC', type: 'ACB', email: 'info@heritageabstract.com', lastOpen: '142 days ago', winbackResult: 'No opens', revenue: '$517', action: 'Remove' },
  { org: 'Cornerstone Title', type: 'ACB', email: 'contact@cornerstonetitle.com', lastOpen: '118 days ago', winbackResult: 'Opened Email 1 only', revenue: '$441', action: 'Final attempt' },
  { org: 'Pacific Coast Escrow', type: 'ACA', email: 'admin@pacificescrow.com', lastOpen: '105 days ago', winbackResult: 'No opens', revenue: '$1,216', action: 'Phone outreach' },
  { org: 'Summit Title Services', type: 'REA', email: 'legal@summittitle.com', lastOpen: '97 days ago', winbackResult: 'Clicked Email 2', revenue: '$441', action: 'Extend 30 days' },
  { org: 'Liberty National Title', type: 'ACA', email: 'ops@libertynational.com', lastOpen: '134 days ago', winbackResult: 'No opens', revenue: '$1,216', action: 'Remove' },
  { org: 'Eagle Land Title', type: 'LMI', email: 'info@eagleland.com', lastOpen: '112 days ago', winbackResult: 'Opened Email 1 only', revenue: '$220', action: 'Remove' },
];

/* ── Sunset candidate detail modal ── */
function CandidateModal({ candidate, onClose }: { candidate: typeof sunsetCandidates[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{candidate.org}</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Sunset Candidate Review</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Member Type', value: candidate.type },
              { label: 'Annual Revenue', value: candidate.revenue },
              { label: 'Last Open', value: candidate.lastOpen },
              { label: 'Winback Result', value: candidate.winbackResult },
            ].map(f => (
              <div key={f.label} className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                <p className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{f.value}</p>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
            <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Email</p>
            <p className="text-xs font-mono" style={{ color: 'var(--heading)' }}>{candidate.email}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${candidate.action === 'Remove' ? C.red : candidate.action === 'Phone outreach' ? C.amber : C.blue} 10%, transparent)` }}>
            <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Recommended Action</p>
            <p className="text-sm font-bold" style={{ color: candidate.action === 'Remove' ? C.red : candidate.action === 'Phone outreach' ? C.amber : C.blue }}>
              {candidate.action}
            </p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
              {candidate.action === 'Remove' ? 'This member has shown no engagement after the full winback sequence. Removing preserves deliverability.' :
               candidate.action === 'Phone outreach' ? 'High-value member warrants personal contact before sunset.' :
               candidate.action === 'Final attempt' ? 'Partial engagement detected. One more targeted email before sunset.' :
               'Recent engagement signal detected. Extending monitoring window.'}
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Winback Sequence Timeline</p>
            <div className="space-y-2">
              {winbackSequence.map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{
                      background: `color-mix(in srgb, ${i === 0 && candidate.winbackResult.includes('1') ? C.green : candidate.winbackResult.includes('2') && i <= 1 ? C.green : candidate.winbackResult === 'No opens' ? C.red : C.gray} 15%, transparent)`,
                      color: i === 0 && candidate.winbackResult.includes('1') ? C.green : candidate.winbackResult.includes('2') && i <= 1 ? C.green : candidate.winbackResult === 'No opens' ? C.red : C.gray,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold truncate" style={{ color: 'var(--heading)' }}>{step.subject}</p>
                    <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{step.timing}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function WinbackEngine() {
  const [selectedCandidate, setSelectedCandidate] = useState<typeof sunsetCandidates[0] | null>(null);
  const [selectedSequence, setSelectedSequence] = useState<typeof winbackSequence[0] | null>(null);

  const totalInactive = thresholds.reduce((s, t) => s + t.count, 0);

  return (
    <div className="p-6 space-y-6">

      {/* ── 1. Branded Header ── */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #E8923F, #D94A4A)',
            boxShadow: '0 4px 20px rgba(232,146,63,0.3)',
          }}
        >
          <RefreshCw className="w-6 h-6" style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            WinbackEngine<span className="text-[10px] align-super font-bold" style={{ color: 'var(--text-muted)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Bring them back before they&apos;re gone.
          </p>
        </div>
      </div>

      {/* ── 2. SparkKpi Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <SparkKpi
          label="Inactive Members"
          value={totalInactive.toLocaleString()}
          sub="No email opens in 30+ days"
          icon={UserX}
          color={C.red}
          sparkData={[3400, 3200, 3100, 3240]}
          sparkColor={C.red}
          trend={{ value: -4.7, label: 'vs last month' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Members with no email opens across all campaigns. Broken down by inactivity window:
              </p>
              {thresholds.map(t => (
                <div key={t.days} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{t.days}+ days ({t.label})</span>
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: t.color }}>{t.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="In Winback Sequence"
          value="980"
          sub="Currently receiving winback emails"
          icon={Mail}
          color={C.amber}
          sparkData={[320, 280, 310, 345, 360, 380, 345]}
          sparkColor={C.amber}
          trend={{ value: 11.3, label: 'vs last month' }}
          accent
        />
        <SparkKpi
          label="Re-engaged"
          value="45%"
          sub="Opened future emails after winback"
          icon={UserCheck}
          color={C.green}
          sparkData={[38, 40, 42, 41, 43, 44, 45]}
          sparkColor={C.green}
          trend={{ value: 7.1, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Sunset Candidates"
          value="420"
          sub="90+ days inactive, recommend removal"
          icon={Sunset}
          color={C.gray}
          sparkData={[480, 460, 440, 430, 425, 420]}
          sparkColor={C.gray}
          trend={{ value: -12.5, label: 'vs last month' }}
          accent
        />
      </div>

      {/* ── 3. Sunset Policy Configuration ── */}
      <Card title="Sunset Policy Configuration" subtitle="Automated thresholds for member inactivity management">
        <div className="space-y-4">
          {thresholds.map((t, i) => (
            <div key={t.days} className="relative">
              <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', borderLeftWidth: '4px', borderLeftColor: t.color }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${t.color} 12%, transparent)` }}>
                  <Timer className="w-5 h-5" style={{ color: t.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>{t.days} Days</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${t.color} 15%, transparent)`, color: t.color }}>{t.label}</span>
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-extrabold" style={{ color: t.color }}>{t.count.toLocaleString()}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{t.pct}% of list</div>
                </div>
              </div>
              {i < thresholds.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowRight className="w-4 h-4 rotate-90" style={{ color: 'var(--text-muted)' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ── 4. Inactive Members by Tier ── */}
      <Card
        title="Inactive Members by Tier"
        subtitle="Breakdown of inactivity across membership tiers"
        detailTitle="Tier Inactivity Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Detailed inactivity breakdown by membership tier. ACB (Small Title) and LMI (Land Members) show the highest
              inactivity rates proportional to their membership size.
            </p>
            {inactiveByTier.map(tier => {
              const totalInact = tier.inactive30 + tier.inactive60 + tier.inactive90;
              const pct = ((totalInact / tier.total) * 100).toFixed(1);
              return (
                <div key={tier.tier} className="p-3 rounded-lg border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{tier.tier}</span>
                    <span className="text-[10px] font-bold" style={{ color: tier.color }}>{pct}% inactive</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Total</div>
                      <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{tier.total.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[9px]" style={{ color: C.amber }}>30d</div>
                      <div className="text-xs font-bold" style={{ color: C.amber }}>{tier.inactive30}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[9px]" style={{ color: C.red }}>60d</div>
                      <div className="text-xs font-bold" style={{ color: C.red }}>{tier.inactive60}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[9px]" style={{ color: C.gray }}>90d</div>
                      <div className="text-xs font-bold" style={{ color: C.gray }}>{tier.inactive90}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {['Tier', 'Total', '30-Day', '60-Day', '90-Day', '% Inactive'].map(h => (
                  <th key={h} className="text-[9px] uppercase tracking-wider font-bold pb-3 pr-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inactiveByTier.map(tier => {
                const totalInact = tier.inactive30 + tier.inactive60 + tier.inactive90;
                const pct = ((totalInact / tier.total) * 100).toFixed(1);
                return (
                  <tr key={tier.tier} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tier.color }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{tier.tier}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-xs" style={{ color: 'var(--text-muted)' }}>{tier.total.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-xs font-bold" style={{ color: C.amber }}>{tier.inactive30}</td>
                    <td className="py-2.5 pr-4 text-xs font-bold" style={{ color: C.red }}>{tier.inactive60}</td>
                    <td className="py-2.5 pr-4 text-xs font-bold" style={{ color: C.gray }}>{tier.inactive90}</td>
                    <td className="py-2.5 pr-4 text-xs font-bold" style={{ color: parseFloat(pct) > 15 ? C.red : C.amber }}>{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 5. Winback Sequence ── */}
      <Card title="Automated Winback Sequence" subtitle="3-email re-engagement series with timing and performance">
        <div className="space-y-4">
          {winbackSequence.map((step, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border cursor-pointer transition-all hover:translate-y-[-1px]"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}
              onClick={() => setSelectedSequence(step)}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${C.blue} 12%, transparent)` }}>
                  <span className="text-sm font-extrabold" style={{ color: C.blue }}>#{step.email}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-bold truncate" style={{ color: 'var(--heading)' }}>{step.subject}</p>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `color-mix(in srgb, ${C.green} 15%, transparent)`, color: C.green }}>{step.status}</span>
                  </div>
                  <p className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>{step.tone} &middot; {step.timing}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3 h-3" style={{ color: C.blue }} />
                      <span className="text-[10px] font-bold" style={{ color: C.blue }}>{step.openRate}% open</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" style={{ color: C.green }} />
                      <span className="text-[10px] font-bold" style={{ color: C.green }}>{step.clickRate}% click</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[8px] mt-2 font-semibold" style={{ color: 'var(--accent)' }}>Click for details</div>
            </div>
          ))}
          <div className="p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${C.green} 8%, transparent)` }}>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="font-bold" style={{ color: C.green }}>Key metric:</span> 45% of winback recipients open at least one future email — proving re-engagement works when timed correctly.
            </p>
          </div>
        </div>
      </Card>

      {/* ── 6. Re-engagement Trend + Success Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Re-engagement Trend" subtitle="Monthly winback entries, re-engagements, and sunsets">
          <ClientChart
            type="bar"
            data={reEngagementTrend}
            height={260}
            options={{
              plugins: {
                legend: { display: true, position: 'bottom', labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 12, font: { size: 10 } } },
              },
              scales: {
                y: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
                x: { grid: { display: false }, ticks: { color: '#8899aa' } },
              },
            }}
          />
        </Card>

        <Card title="Success Metrics" subtitle="Winback sequence performance vs industry benchmarks">
          <div className="space-y-3">
            {successMetrics.map(m => (
              <div key={m.label} className="p-3 rounded-lg border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                  <span className="text-sm font-extrabold" style={{ color: m.color }}>{m.value}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{m.sub}</span>
                  <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.benchmark}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 7. Sunset Candidates ── */}
      <Card
        title="Sunset Candidates"
        subtitle="Members recommended for list removal after failed winback"
        detailTitle="Sunset Candidate Details"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              These members have been inactive for 90+ days and have completed the winback sequence without re-engaging.
              Removing them improves deliverability metrics and sender reputation.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg text-center" style={{ background: `color-mix(in srgb, ${C.red} 8%, transparent)` }}>
                <div className="text-lg font-extrabold" style={{ color: C.red }}>3</div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Remove</div>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ background: `color-mix(in srgb, ${C.amber} 8%, transparent)` }}>
                <div className="text-lg font-extrabold" style={{ color: C.amber }}>2</div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Last attempt</div>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ background: `color-mix(in srgb, ${C.blue} 8%, transparent)` }}>
                <div className="text-lg font-extrabold" style={{ color: C.blue }}>1</div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Extend</div>
              </div>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {['Organization', 'Type', 'Last Open', 'Winback Result', 'Revenue', 'Action'].map(h => (
                  <th key={h} className="text-[9px] uppercase tracking-wider font-bold pb-3 pr-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sunsetCandidates.map((c, i) => (
                <tr
                  key={i}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--card-border)' }}
                  onClick={() => setSelectedCandidate(c)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--input-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="py-2.5 pr-4 text-xs font-semibold" style={{ color: 'var(--heading)' }}>{c.org}</td>
                  <td className="py-2.5 pr-4 text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.type}</td>
                  <td className="py-2.5 pr-4 text-[10px]" style={{ color: C.red }}>{c.lastOpen}</td>
                  <td className="py-2.5 pr-4 text-[10px]" style={{ color: c.winbackResult === 'No opens' ? C.red : C.amber }}>{c.winbackResult}</td>
                  <td className="py-2.5 pr-4 text-xs font-bold" style={{ color: 'var(--heading)' }}>{c.revenue}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `color-mix(in srgb, ${c.action === 'Remove' ? C.red : c.action === 'Phone outreach' ? C.amber : C.blue} 12%, transparent)`,
                        color: c.action === 'Remove' ? C.red : c.action === 'Phone outreach' ? C.amber : C.blue,
                      }}
                    >
                      {c.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Modals ── */}
      {selectedCandidate && <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />}

      {selectedSequence && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedSequence(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Email #{selectedSequence.email}</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedSequence.tone}</p>
              </div>
              <button onClick={() => setSelectedSequence(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Subject Line</p>
                <p className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedSequence.subject}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${C.blue} 8%, transparent)` }}>
                  <div className="text-lg font-extrabold" style={{ color: C.blue }}>{selectedSequence.openRate}%</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Open Rate</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${C.green} 8%, transparent)` }}>
                  <div className="text-lg font-extrabold" style={{ color: C.green }}>{selectedSequence.clickRate}%</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Click Rate</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${C.amber} 8%, transparent)` }}>
                  <div className="text-lg font-extrabold" style={{ color: C.amber }}>{selectedSequence.timing}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Send Timing</div>
                </div>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Email Content Strategy</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{selectedSequence.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
