'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import {
  Shield,
  AlertTriangle,
  DollarSign,
  CheckCircle,
  X,
  Target,
  TrendingDown,
  Zap,
  Eye,
  ArrowRight,
} from 'lucide-react';

/* ── Brand Colors ─────────────────────────────────────────── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  darkRed: '#991B1B',
  teal: '#14b8a6',
};

/* ── Risk Data ────────────────────────────────────────────── */
type LikelihoodLevel = 1 | 2 | 3 | 4 | 5;
type ImpactLevel = 1 | 2 | 3 | 4 | 5;

interface Risk {
  id: number;
  name: string;
  likelihood: LikelihoodLevel;
  impact: ImpactLevel;
  revenueExposure?: string;
  category: string;
  description: string;
  mitigation: string;
  owner: string;
  status: 'Active' | 'Monitoring' | 'Mitigated';
}

const LIKELIHOOD_LABELS = ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];
const IMPACT_LABELS = ['', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];

const risks: Risk[] = [
  {
    id: 1, name: 'Heritage Abstract churn', likelihood: 4, impact: 2,
    revenueExposure: '$517', category: 'Retention',
    description: 'Heritage Abstract LLC has gone completely dark. Zero engagement for 90+ days with late dues payment. Single ACB member but early indicator of broader small-org disengagement.',
    mitigation: 'Immediate phone outreach by membership team. Schedule personal check-in call. If no response in 14 days, escalate to director-level follow-up.',
    owner: 'Taylor Spolidoro', status: 'Active',
  },
  {
    id: 2, name: 'First American disengagement', likelihood: 3, impact: 5,
    revenueExposure: '$61K', category: 'Retention',
    description: 'First American Title, an ACU underwriter paying $61,554/year, is showing 75% engagement decay. They skipped the Summit and only maintain webinar attendance. Major revenue risk.',
    mitigation: 'CEO-level outreach from Chris Morton. Schedule executive briefing. Offer exclusive underwriter roundtable invitation. This is a priority 1 account.',
    owner: 'Chris Morton', status: 'Active',
  },
  {
    id: 3, name: 'Bounce rate domain damage', likelihood: 3, impact: 4,
    revenueExposure: undefined, category: 'Deliverability',
    description: 'Current bounce rate of 4.8% is approaching the 5% threshold where major ISPs begin throttling. 680 invalid emails remain in active send lists.',
    mitigation: 'Run immediate batch email verification. Suppress all hard bounces. Implement real-time verification on new email capture. Target: under 2% bounce rate.',
    owner: 'Von Scott', status: 'Active',
  },
  {
    id: 4, name: 'PFL non-compliance surge', likelihood: 4, impact: 3,
    revenueExposure: undefined, category: 'Compliance',
    description: 'Producer Filing Library compliance rates are declining. 340 members have not filed required documents for the current period. Growing backlog creates regulatory exposure.',
    mitigation: 'Launch targeted compliance campaign (May Wave 1 already planned). Escalate chronic non-filers to compliance committee. Consider late filing fee structure.',
    owner: 'Taylor Spolidoro', status: 'Monitoring',
  },
  {
    id: 5, name: 'Renewal season underperformance', likelihood: 2, impact: 5,
    revenueExposure: '$1.2M', category: 'Revenue',
    description: 'If Q4 renewal season performs 10% below historical average, ALTA could see a $1.2M revenue shortfall. Engagement metrics show slight downward trend for renewal-eligible members.',
    mitigation: 'Start renewal pre-warming in July. Implement multi-touch sequence. Segment by engagement tier for personalized messaging. Prepare contingency outreach for non-responders.',
    owner: 'Caroline Ehrenfeld', status: 'Monitoring',
  },
  {
    id: 6, name: 'Staff turnover knowledge loss', likelihood: 2, impact: 4,
    revenueExposure: undefined, category: 'Operations',
    description: 'Key institutional knowledge concentrated in 2-3 staff members. Departure of any primary relationship owner could disrupt member engagement continuity.',
    mitigation: 'Document all member relationship playbooks in MEMTrak. Cross-train staff on key accounts. Implement automated workflow triggers that survive personnel changes.',
    owner: 'Paul Martin', status: 'Monitoring',
  },
  {
    id: 7, name: 'Higher Logic outage', likelihood: 2, impact: 3,
    revenueExposure: undefined, category: 'Technology',
    description: 'Higher Logic platform dependency for newsletter delivery. An extended outage during critical send windows (renewal, ALTA ONE) could delay time-sensitive communications.',
    mitigation: 'Maintain backup sending capability through MEMTrak direct integration. Keep emergency contact lists exportable. Negotiate SLA with Higher Logic for priority support.',
    owner: 'Von Scott', status: 'Mitigated',
  },
  {
    id: 8, name: 'List hygiene degradation', likelihood: 4, impact: 3,
    revenueExposure: undefined, category: 'Data Quality',
    description: 'Without consistent list cleaning, database quality degrades at ~2% per month. Currently at 77.2% healthy records. If unmanaged, could fall below 70% by Q4.',
    mitigation: 'Implement monthly automated list cleaning. Run quarterly full database audit. Set alert thresholds for quality score drops. DataQuality dashboard monitors this in real time.',
    owner: 'Von Scott', status: 'Active',
  },
  {
    id: 9, name: 'ACU underwriter churn wave', likelihood: 2, impact: 5,
    revenueExposure: '$2.4M', category: 'Revenue',
    description: 'If 3+ ACU underwriters ($61,554/year each) were to churn simultaneously, revenue impact would be catastrophic. Industry consolidation could trigger this scenario.',
    mitigation: 'Implement quarterly underwriter health check. Assign dedicated relationship manager per ACU account. Create exclusive underwriter benefits program. Early warning via DecayRadar.',
    owner: 'Chris Morton', status: 'Monitoring',
  },
  {
    id: 10, name: 'Email fatigue increase', likelihood: 3, impact: 3,
    revenueExposure: undefined, category: 'Engagement',
    description: 'Increasing unsubscribe rate (currently 0.12%) and declining open rates suggest audience fatigue. Risk of accelerated list erosion if send cadence is not optimized.',
    mitigation: 'Implement FatigueShield frequency caps. Use SendBrain for optimal timing. Reduce overlapping campaign sends. CampaignPlanner collision warnings address this.',
    owner: 'Paul Martin', status: 'Active',
  },
];

/* ── Zone color calculation ───────────────────────────────── */
function getZoneColor(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 16) return C.darkRed;
  if (score >= 10) return C.red;
  if (score >= 5) return C.amber;
  return C.green;
}

function getZoneBg(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 16) return 'rgba(153,27,27,0.25)';
  if (score >= 10) return 'rgba(217,74,74,0.18)';
  if (score >= 5) return 'rgba(245,158,11,0.12)';
  return 'rgba(140,198,63,0.10)';
}

function getZoneLabel(likelihood: number, impact: number): string {
  const score = likelihood * impact;
  if (score >= 16) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
}

export default function RiskMatrix() {
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  /* Summary calculations */
  const criticalRisks = risks.filter((r) => r.likelihood * r.impact >= 16).length;
  const highRisks = risks.filter((r) => r.likelihood * r.impact >= 10 && r.likelihood * r.impact < 16).length;
  const totalRevenueExposure = risks
    .filter((r) => r.revenueExposure)
    .reduce((sum, r) => {
      const match = r.revenueExposure!.match(/[\d,.]+/);
      if (!match) return sum;
      const val = parseFloat(match[0].replace(/,/g, ''));
      if (r.revenueExposure!.includes('K')) return sum + val * 1000;
      if (r.revenueExposure!.includes('M')) return sum + val * 1000000;
      return sum + val;
    }, 0);
  const mitigationsActive = risks.filter((r) => r.status === 'Active' || r.status === 'Mitigated').length;

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(217,74,74,0.2) 0%, rgba(245,158,11,0.2) 100%)',
              border: '1px solid rgba(217,74,74,0.3)',
            }}
          >
            <Shield className="w-5 h-5" style={{ color: C.red }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              RiskMatrix<span style={{ color: C.red, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.red }}>
              See all your risks in one view.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Visual risk assessment grid plotting 10 organizational risks by likelihood and impact. Each risk
          includes revenue exposure, mitigation strategy, and ownership. Click any risk for full details.
        </p>
      </div>

      {/* ── 2. Summary Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Total Risks"
          value={risks.length}
          sub="Across all categories"
          icon={Shield}
          color={C.blue}
          sparkData={[6, 7, 7, 8, 9, 9, 10]}
          sparkColor={C.blue}
          trend={{ value: 11.1, label: 'new this quarter' }}
          accent
        />
        <SparkKpi
          label="Critical Risks"
          value={criticalRisks + highRisks}
          sub={`${criticalRisks} critical, ${highRisks} high`}
          icon={AlertTriangle}
          color={C.red}
          sparkData={[2, 2, 3, 3, 3, 4, criticalRisks + highRisks]}
          sparkColor={C.red}
          trend={{ value: -25, label: 'need attention' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Risks in the red and dark-red zones of the matrix require immediate attention and active mitigation plans.
              </p>
              {risks.filter((r) => r.likelihood * r.impact >= 10).map((r) => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)' }}>
                  <span style={{ color: 'var(--heading)' }}>{r.name}</span>
                  <span className="font-bold" style={{ color: getZoneColor(r.likelihood, r.impact) }}>
                    {getZoneLabel(r.likelihood, r.impact)}
                  </span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Revenue Exposure"
          value={`$${(totalRevenueExposure / 1000000).toFixed(1)}M`}
          sub="Total quantified risk"
          icon={DollarSign}
          color={C.orange}
          sparkData={[2.1, 2.4, 2.8, 3.0, 3.2, 3.5, totalRevenueExposure / 1000000]}
          sparkColor={C.orange}
          trend={{ value: -8.4, label: 'growing exposure' }}
          accent
        />
        <SparkKpi
          label="Mitigations Active"
          value={mitigationsActive}
          sub={`of ${risks.length} risks addressed`}
          icon={CheckCircle}
          color={C.green}
          sparkData={[3, 4, 4, 5, 5, 6, mitigationsActive]}
          sparkColor={C.green}
          trend={{ value: 16.7, label: 'improving' }}
          accent
        />
      </div>

      {/* ── 3. Risk Matrix Grid ───────────────────────────────── */}
      <Card title="Risk Assessment Matrix" subtitle="Likelihood (X) vs Impact (Y) - click any risk dot for details" className="mb-8">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 600 }}>
            <div className="flex">
              {/* Y-axis label */}
              <div className="flex flex-col justify-center items-center w-8 flex-shrink-0">
                <span
                  className="text-[9px] font-bold uppercase tracking-wider transform -rotate-90 whitespace-nowrap"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Impact
                </span>
              </div>

              {/* Grid area */}
              <div className="flex-1">
                {/* Grid rows - top to bottom: Very High impact to Very Low */}
                {[5, 4, 3, 2, 1].map((impactLevel) => (
                  <div key={impactLevel} className="flex items-stretch">
                    {/* Y-axis tick */}
                    <div className="w-16 flex-shrink-0 flex items-center justify-end pr-2">
                      <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
                        {IMPACT_LABELS[impactLevel]}
                      </span>
                    </div>

                    {/* 5 cells per row */}
                    {[1, 2, 3, 4, 5].map((likelihoodLevel) => {
                      const cellKey = `${likelihoodLevel}-${impactLevel}`;
                      const cellRisks = risks.filter(
                        (r) => r.likelihood === likelihoodLevel && r.impact === impactLevel
                      );
                      const isHovered = hoveredCell === cellKey;

                      return (
                        <div
                          key={cellKey}
                          className="flex-1 min-h-[72px] border rounded-lg m-0.5 relative transition-all duration-150 flex items-center justify-center flex-wrap gap-1 p-2"
                          style={{
                            background: isHovered
                              ? getZoneBg(likelihoodLevel, impactLevel).replace(/[\d.]+\)$/, (m) => `${parseFloat(m) * 1.8})`)
                              : getZoneBg(likelihoodLevel, impactLevel),
                            borderColor: isHovered ? getZoneColor(likelihoodLevel, impactLevel) : 'var(--card-border)',
                          }}
                          onMouseEnter={() => setHoveredCell(cellKey)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {cellRisks.map((risk) => (
                            <button
                              key={risk.id}
                              onClick={() => setSelectedRisk(risk)}
                              className="group relative w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-125 hover:z-10"
                              style={{
                                background: getZoneColor(risk.likelihood, risk.impact),
                                boxShadow: `0 0 12px ${getZoneColor(risk.likelihood, risk.impact)}60`,
                                border: '2px solid var(--card)',
                              }}
                              title={risk.name}
                            >
                              <span className="text-[7px] font-extrabold" style={{ color: '#fff' }}>
                                {risk.id}
                              </span>
                              {/* Tooltip on hover */}
                              <div
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
                                style={{
                                  background: 'var(--card)',
                                  color: 'var(--heading)',
                                  border: '1px solid var(--card-border)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                }}
                              >
                                {risk.name}
                                {risk.revenueExposure && (
                                  <span className="ml-1" style={{ color: C.orange }}>({risk.revenueExposure})</span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* X-axis labels */}
                <div className="flex mt-1">
                  <div className="w-16 flex-shrink-0" />
                  {[1, 2, 3, 4, 5].map((l) => (
                    <div key={l} className="flex-1 text-center">
                      <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>
                        {LIKELIHOOD_LABELS[l]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Likelihood
                  </span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
              {[
                { label: 'Low', color: C.green, bg: 'rgba(140,198,63,0.10)' },
                { label: 'Medium', color: C.amber, bg: 'rgba(245,158,11,0.12)' },
                { label: 'High', color: C.red, bg: 'rgba(217,74,74,0.18)' },
                { label: 'Critical', color: C.darkRed, bg: 'rgba(153,27,27,0.25)' },
              ].map((zone) => (
                <div key={zone.label} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded" style={{ background: zone.bg, border: `1px solid ${zone.color}40` }} />
                  <span className="text-[9px] font-bold" style={{ color: zone.color }}>{zone.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── 4. Risk List ──────────────────────────────────────── */}
      <Card title="All Risks" subtitle="Full risk register with mitigation status" className="mb-8">
        <div className="space-y-2">
          {risks.map((risk) => {
            const zoneColor = getZoneColor(risk.likelihood, risk.impact);
            const zoneLabel = getZoneLabel(risk.likelihood, risk.impact);
            const statusColors: Record<string, { bg: string; text: string }> = {
              Active: { bg: 'rgba(217,74,74,0.15)', text: C.red },
              Monitoring: { bg: 'rgba(74,144,217,0.15)', text: C.blue },
              Mitigated: { bg: 'rgba(140,198,63,0.15)', text: C.green },
            };
            const sc = statusColors[risk.status];

            return (
              <div
                key={risk.id}
                className="rounded-lg border p-3 cursor-pointer transition-all hover:translate-y-[-1px]"
                style={{
                  background: 'var(--input-bg)',
                  borderColor: 'var(--card-border)',
                  borderLeftWidth: '4px',
                  borderLeftColor: zoneColor,
                }}
                onClick={() => setSelectedRisk(risk)}
              >
                <div className="flex items-center gap-3">
                  {/* Risk number dot */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: zoneColor, boxShadow: `0 0 8px ${zoneColor}40` }}
                  >
                    <span className="text-[9px] font-extrabold" style={{ color: '#fff' }}>{risk.id}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{risk.name}</span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${zoneColor}20`, color: zoneColor }}>
                        {zoneLabel}
                      </span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>
                        {risk.status}
                      </span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded" style={{ background: 'var(--card)', color: 'var(--text-muted)' }}>
                        {risk.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                      <span>Likelihood: <span style={{ color: 'var(--heading)' }}>{LIKELIHOOD_LABELS[risk.likelihood]}</span></span>
                      <span>Impact: <span style={{ color: 'var(--heading)' }}>{IMPACT_LABELS[risk.impact]}</span></span>
                      {risk.revenueExposure && (
                        <span>Revenue: <span className="font-bold" style={{ color: C.orange }}>{risk.revenueExposure}</span></span>
                      )}
                      <span>Owner: <span style={{ color: 'var(--heading)' }}>{risk.owner}</span></span>
                    </div>
                  </div>

                  <Eye className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── 5. Risk Categories Distribution ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Risks by Category" subtitle="Distribution across risk categories">
          <div className="space-y-3">
            {(() => {
              const categories = [...new Set(risks.map((r) => r.category))];
              const catColors: Record<string, string> = {
                Retention: C.red,
                Deliverability: C.orange,
                Compliance: C.amber,
                Revenue: C.blue,
                Operations: C.purple,
                Technology: C.teal,
                'Data Quality': C.green,
                Engagement: C.navy,
              };
              return categories.map((cat) => {
                const catRisks = risks.filter((r) => r.category === cat);
                const color = catColors[cat] || C.blue;
                const maxScore = Math.max(...catRisks.map((r) => r.likelihood * r.impact));
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <div className="w-20 text-[10px] font-bold flex-shrink-0" style={{ color: 'var(--heading)' }}>{cat}</div>
                    <div className="flex-1 relative h-5 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500 flex items-center px-2"
                        style={{
                          width: `${(catRisks.length / risks.length) * 100}%`,
                          minWidth: 40,
                          background: `${color}60`,
                          border: `1px solid ${color}`,
                        }}
                      >
                        <span className="text-[8px] font-bold" style={{ color }}>{catRisks.length}</span>
                      </div>
                    </div>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{
                        background: maxScore >= 16 ? `${C.darkRed}20` : maxScore >= 10 ? `${C.red}20` : `${C.amber}20`,
                        color: maxScore >= 16 ? C.darkRed : maxScore >= 10 ? C.red : C.amber,
                      }}
                    >
                      {maxScore >= 16 ? 'Critical' : maxScore >= 10 ? 'High' : 'Medium'}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </Card>

        <Card title="Risk Heatmap Summary" subtitle="Score distribution across the matrix">
          <div className="space-y-3">
            {[
              { zone: 'Critical', range: 'Score 16-25', count: risks.filter((r) => r.likelihood * r.impact >= 16).length, color: C.darkRed, bg: 'rgba(153,27,27,0.12)' },
              { zone: 'High', range: 'Score 10-15', count: risks.filter((r) => r.likelihood * r.impact >= 10 && r.likelihood * r.impact < 16).length, color: C.red, bg: 'rgba(217,74,74,0.12)' },
              { zone: 'Medium', range: 'Score 5-9', count: risks.filter((r) => r.likelihood * r.impact >= 5 && r.likelihood * r.impact < 10).length, color: C.amber, bg: 'rgba(245,158,11,0.12)' },
              { zone: 'Low', range: 'Score 1-4', count: risks.filter((r) => r.likelihood * r.impact < 5).length, color: C.green, bg: 'rgba(140,198,63,0.12)' },
            ].map((tier) => (
              <div
                key={tier.zone}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: tier.bg }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ background: tier.color }} />
                  <div>
                    <div className="text-[11px] font-bold" style={{ color: tier.color }}>{tier.zone}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{tier.range}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold" style={{ color: tier.color }}>{tier.count}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>risk{tier.count !== 1 ? 's' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Risk Detail Modal ─────────────────────────────────── */}
      {selectedRisk && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedRisk(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md"
              style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: getZoneColor(selectedRisk.likelihood, selectedRisk.impact),
                    boxShadow: `0 0 12px ${getZoneColor(selectedRisk.likelihood, selectedRisk.impact)}40`,
                  }}
                >
                  <span className="text-sm font-extrabold" style={{ color: '#fff' }}>{selectedRisk.id}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedRisk.name}</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Risk Assessment Detail</p>
                </div>
              </div>
              <button onClick={() => setSelectedRisk(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: `${getZoneColor(selectedRisk.likelihood, selectedRisk.impact)}20`,
                    color: getZoneColor(selectedRisk.likelihood, selectedRisk.impact),
                  }}
                >
                  {getZoneLabel(selectedRisk.likelihood, selectedRisk.impact)} Risk
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
                  {selectedRisk.category}
                </span>
                {selectedRisk.revenueExposure && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(232,146,63,0.15)', color: C.orange }}>
                    {selectedRisk.revenueExposure} exposure
                  </span>
                )}
              </div>

              {/* Score grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg p-3 text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Likelihood</div>
                  <div className="text-lg font-extrabold mt-0.5" style={{ color: 'var(--heading)' }}>{selectedRisk.likelihood}/5</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{LIKELIHOOD_LABELS[selectedRisk.likelihood]}</div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Impact</div>
                  <div className="text-lg font-extrabold mt-0.5" style={{ color: 'var(--heading)' }}>{selectedRisk.impact}/5</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{IMPACT_LABELS[selectedRisk.impact]}</div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: `${getZoneColor(selectedRisk.likelihood, selectedRisk.impact)}15` }}>
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Risk Score</div>
                  <div className="text-lg font-extrabold mt-0.5" style={{ color: getZoneColor(selectedRisk.likelihood, selectedRisk.impact) }}>
                    {selectedRisk.likelihood * selectedRisk.impact}
                  </div>
                  <div className="text-[9px]" style={{ color: getZoneColor(selectedRisk.likelihood, selectedRisk.impact) }}>
                    {getZoneLabel(selectedRisk.likelihood, selectedRisk.impact)}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Description</div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--heading)' }}>
                  {selectedRisk.description}
                </p>
              </div>

              {/* Mitigation */}
              <div className="rounded-lg p-3" style={{ background: 'rgba(140,198,63,0.06)' }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: C.green }}>
                  Mitigation Strategy
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--heading)' }}>
                  {selectedRisk.mitigation}
                </p>
              </div>

              {/* Owner + Status */}
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div>
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Risk Owner</div>
                  <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{selectedRisk.owner}</div>
                </div>
                <span
                  className="text-[9px] font-bold px-2 py-1 rounded-full"
                  style={{
                    background: selectedRisk.status === 'Active' ? 'rgba(217,74,74,0.15)' : selectedRisk.status === 'Mitigated' ? 'rgba(140,198,63,0.15)' : 'rgba(74,144,217,0.15)',
                    color: selectedRisk.status === 'Active' ? C.red : selectedRisk.status === 'Mitigated' ? C.green : C.blue,
                  }}
                >
                  {selectedRisk.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(217,74,74,0.08)',
            color: C.red,
            border: '1px solid rgba(217,74,74,0.15)',
          }}
        >
          <Shield className="w-3 h-3" />
          RiskMatrix&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
