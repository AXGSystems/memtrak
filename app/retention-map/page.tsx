'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import {
  Map,
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  AlertTriangle,
  Target,
  ChevronRight,
  Lightbulb,
  Award,
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

/* ── Retention by member type ────────────────────────────── */
const memberTypes = [
  { code: 'ACA', label: 'ACA Title Agents', rate: 85, trend: 1.2, color: C.blue },
  { code: 'ACU', label: 'ACU Underwriters', rate: 98, trend: 0.3, color: C.green },
  { code: 'REA', label: 'REA Attorneys', rate: 82, trend: -1.8, color: C.orange },
  { code: 'ACB', label: 'ACB Abstracters', rate: 80, trend: -2.4, color: C.amber },
  { code: 'AS', label: 'AS Surveyors', rate: 75, trend: -3.1, color: C.red },
  { code: 'ATXA', label: 'ATXA Affiliates', rate: 78, trend: 0.5, color: C.teal },
  { code: 'REB', label: 'REB Agents', rate: 72, trend: -4.2, color: C.red },
];

/* ── Cohort retention data ───────────────────────────────── */
const cohortData = {
  labels: ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
  datasets: [
    {
      label: 'Still Active %',
      data: [68, 72, 78, 82, 86, 91, 96],
      backgroundColor: [
        'rgba(74,144,217,0.6)',
        'rgba(74,144,217,0.65)',
        'rgba(74,144,217,0.7)',
        'rgba(74,144,217,0.75)',
        'rgba(74,144,217,0.8)',
        'rgba(74,144,217,0.85)',
        'rgba(140,198,63,0.9)',
      ],
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
};

const cohortOptions = {
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      grid: { color: '#1e3350' },
      ticks: { color: '#8899aa', callback: (v: number) => `${v}%` },
    },
    x: { grid: { display: false }, ticks: { color: '#8899aa' } },
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: (ctx: { raw: number }) => `${ctx.raw}% still active`,
      },
    },
  },
};

/* ── Funnel data ─────────────────────────────────────────── */
const funnelStages = [
  { label: 'Year 1', rate: 76, color: C.amber },
  { label: 'Year 2', rate: 84, color: C.blue },
  { label: 'Year 3', rate: 89, color: C.teal },
  { label: 'Year 5+', rate: 95, color: C.green },
];

/* ── At-risk members ─────────────────────────────────────── */
const atRisk = [
  { org: 'Valley Abstract Co.', type: 'ACB', renewalDate: 'May 2026', engScore: 18, dues: 441, lastOpen: '62 days ago' },
  { org: 'Pacific Title Services', type: 'REA', renewalDate: 'Jun 2026', engScore: 22, dues: 441, lastOpen: '45 days ago' },
  { org: 'Mountain State Surveyors', type: 'AS', renewalDate: 'May 2026', engScore: 12, dues: 290, lastOpen: '78 days ago' },
  { org: 'Lone Star Affiliates', type: 'ATXA', renewalDate: 'Jul 2026', engScore: 28, dues: 517, lastOpen: '34 days ago' },
  { org: 'Crossroads Title Group', type: 'REB', renewalDate: 'May 2026', engScore: 8, dues: 290, lastOpen: '90+ days ago' },
];

/* ── Recommendations ─────────────────────────────────────── */
const recommendations = [
  { title: 'First-year onboarding series', impact: '+8% Year-1 retention', desc: 'Automated 6-email welcome series with resource guides, event invites, and personal check-in from staff liaison.', color: C.green },
  { title: 'REB segment targeted outreach', impact: '+12% REB retention', desc: 'Quarterly phone calls to REB agents plus exclusive webinar content addressing their specific pain points.', color: C.blue },
  { title: 'Renewal reminder acceleration', impact: '+5% overall retention', desc: 'Start renewal reminders 90 days out instead of 60. Add SMS channel for members with low email engagement.', color: C.orange },
  { title: 'Win-back campaign for lapsed', impact: 'Recover 40-60 members/year', desc: 'Targeted re-engagement for members who lapsed in last 12 months with special re-join incentive and value summary.', color: C.purple },
];

export default function RetentionMap() {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(74,144,217,0.2) 0%, rgba(140,198,63,0.2) 100%)',
              border: '1px solid rgba(74,144,217,0.3)',
            }}
          >
            <Map className="w-5 h-5" style={{ color: C.blue }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              RetentionMap<span style={{ color: C.blue, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.green }}>
              See where members stay and where they leave.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Geographic and temporal retention visualization that breaks down membership persistence by type, join
          cohort, and tenure stage. Identifies at-risk segments before renewal deadlines and surfaces data-driven
          recommendations to improve retention across every member category.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SparkKpi
          label="Overall Retention"
          value="84.3%"
          sub="Across all member types"
          icon={Shield}
          color={C.blue}
          sparkData={[80.1, 81.4, 82.0, 82.8, 83.2, 83.9, 84.3]}
          sparkColor={C.blue}
          trend={{ value: 1.4, label: 'vs last year' }}
          accent
        />
        <SparkKpi
          label="Best Segment"
          value="ACU 98%"
          sub="Underwriter retention"
          icon={Award}
          color={C.green}
          sparkData={[96, 96.5, 97, 97.2, 97.5, 97.8, 98]}
          sparkColor={C.green}
          trend={{ value: 0.3, label: 'vs last year' }}
          accent
        />
        <SparkKpi
          label="Worst Segment"
          value="REB 72%"
          sub="Real estate broker agents"
          icon={AlertTriangle}
          color={C.red}
          sparkData={[78, 77, 76, 75, 74, 73, 72]}
          sparkColor={C.red}
          trend={{ value: -4.2, label: 'vs last year' }}
          accent
        />
        <SparkKpi
          label="Year-1 Retention"
          value="76%"
          sub="First-year member retention"
          icon={Target}
          color={C.orange}
          sparkData={[68, 70, 71, 72, 73, 74, 76]}
          sparkColor={C.orange}
          trend={{ value: 3.8, label: 'vs last year' }}
          accent
        />
      </div>

      {/* ── 3. Overall Retention + Pulsing Meter ──────────────── */}
      <Card title="Overall Retention Rate" subtitle="All active member types combined">
        <div className="flex items-center gap-8 py-4">
          <ProgressRing value={84.3} max={100} color={C.blue} size={120} />
          <div className="flex-1">
            <div className="text-3xl font-extrabold" style={{ color: 'var(--heading)' }}>84.3%</div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              of members who were active 12 months ago have renewed or remain in good standing.
              This represents a <span className="font-bold" style={{ color: C.green }}>+1.4%</span> improvement
              year-over-year.
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span className="font-bold" style={{ color: 'var(--heading)' }}>4,209</span> retained
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span className="font-bold" style={{ color: C.red }}>785</span> lapsed
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span className="font-bold" style={{ color: C.orange }}>312</span> at-risk
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 4. Retention by Member Type ───────────────────────── */}
      <div className="mt-6">
        <Card title="Retention by Member Type" subtitle="Click a segment for detailed breakdown">
          <div className="space-y-3 mt-2">
            {memberTypes.map((t) => (
              <button
                key={t.code}
                className="w-full text-left"
                onClick={() => setSelectedType(selectedType === t.code ? null : t.code)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{t.code}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold" style={{ color: t.color }}>{t.rate}%</span>
                        <div className="flex items-center gap-0.5">
                          {t.trend >= 0
                            ? <TrendingUp className="w-3 h-3" style={{ color: C.green }} />
                            : <TrendingDown className="w-3 h-3" style={{ color: C.red }} />}
                          <span className="text-[9px] font-bold" style={{ color: t.trend >= 0 ? C.green : C.red }}>
                            {t.trend > 0 ? '+' : ''}{t.trend}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${t.rate}%`, background: t.color }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 5. Cohort Retention + Funnel ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card title="Retention by Join Year Cohort" subtitle="% of each cohort still active today">
          <ClientChart type="bar" data={cohortData} options={cohortOptions} height={260} />
          <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Newer cohorts show higher initial retention thanks to improved onboarding. The 2026 cohort
            is at 96% — too early to compare fully, but trending positively.
          </p>
        </Card>

        <Card title="Retention Funnel by Tenure" subtitle="How retention improves with member age">
          <div className="space-y-4 mt-3">
            {funnelStages.map((stage, i) => {
              const widthPct = (stage.rate / 100) * 100;
              return (
                <div key={stage.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{stage.label}</span>
                    <span className="text-sm font-extrabold" style={{ color: stage.color }}>{stage.rate}%</span>
                  </div>
                  <div className="relative h-8 rounded-lg overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg flex items-center justify-end pr-3 transition-all duration-700"
                      style={{ width: `${widthPct}%`, background: `color-mix(in srgb, ${stage.color} 30%, transparent)`, borderRight: `3px solid ${stage.color}` }}
                    >
                      <span className="text-[10px] font-bold" style={{ color: stage.color }}>
                        {stage.rate}% retained
                      </span>
                    </div>
                  </div>
                  {i < funnelStages.length - 1 && (
                    <div className="flex justify-center my-1">
                      <ChevronRight className="w-4 h-4 rotate-90" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                </div>
              );
            })}
            <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
              The critical inflection point is Year 1: members who survive the first year reach 84%+ in Year 2.
              By Year 5+, retention climbs to 95% — these are lifetime members.
            </p>
          </div>
        </Card>
      </div>

      {/* ── 6. At-Risk Retention Segment ──────────────────────── */}
      <div className="mt-6">
        <Card title="At-Risk Retention Segment" subtitle="Members approaching renewal with engagement below threshold">
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: 'var(--text-muted)' }}>
                  <th className="text-left pb-3 font-semibold text-[10px] uppercase tracking-wider">Organization</th>
                  <th className="text-left pb-3 font-semibold text-[10px] uppercase tracking-wider">Type</th>
                  <th className="text-left pb-3 font-semibold text-[10px] uppercase tracking-wider">Renewal</th>
                  <th className="text-left pb-3 font-semibold text-[10px] uppercase tracking-wider">Engagement</th>
                  <th className="text-left pb-3 font-semibold text-[10px] uppercase tracking-wider">Last Open</th>
                  <th className="text-right pb-3 font-semibold text-[10px] uppercase tracking-wider">Dues</th>
                </tr>
              </thead>
              <tbody>
                {atRisk.map((m) => (
                  <tr key={m.org} className="border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <td className="py-2.5 font-bold" style={{ color: 'var(--heading)' }}>{m.org}</td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
                        {m.type}
                      </span>
                    </td>
                    <td className="py-2.5" style={{ color: C.orange }}>{m.renewalDate}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${m.engScore}%`, background: m.engScore < 20 ? C.red : m.engScore < 30 ? C.orange : C.amber }}
                          />
                        </div>
                        <span className="font-bold" style={{ color: m.engScore < 20 ? C.red : C.orange }}>{m.engScore}%</span>
                      </div>
                    </td>
                    <td className="py-2.5" style={{ color: 'var(--text-muted)' }}>{m.lastOpen}</td>
                    <td className="py-2.5 text-right font-bold" style={{ color: 'var(--heading)' }}>${m.dues}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 rounded-lg" style={{ background: 'color-mix(in srgb, var(--accent) 5%, transparent)' }}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: C.orange }} />
              <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>
                5 members with $1,979 in combined dues approaching renewal with sub-30% engagement
              </span>
            </div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              These members have engagement scores below the 30% threshold and renewal dates within the next 90 days.
              Immediate personalized outreach recommended.
            </p>
          </div>
        </Card>
      </div>

      {/* ── 7. Retention Improvement Recommendations ──────────── */}
      <div className="mt-6">
        <Card title="Retention Improvement Recommendations" subtitle="Data-driven actions with expected impact">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {recommendations.map((rec) => (
              <div
                key={rec.title}
                className="p-4 rounded-xl border transition-all duration-200 hover:translate-y-[-1px]"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--card-border)',
                  borderLeftWidth: '4px',
                  borderLeftColor: rec.color,
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-3.5 h-3.5" style={{ color: rec.color }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{rec.title}</span>
                  </div>
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `color-mix(in srgb, ${rec.color} 15%, transparent)`, color: rec.color }}
                  >
                    {rec.impact}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{rec.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 8. Footer ─────────────────────────────────────────── */}
      <div className="mt-8 text-center">
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          RetentionMap&trade; &mdash; Sample data for demonstration &bull; MEMTrak by ALTA
        </p>
      </div>
    </div>
  );
}
