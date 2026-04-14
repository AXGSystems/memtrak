'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import { demoDecayAlerts, demoChurnScores } from '@/lib/demo-data';
import {
  Radio,
  AlertTriangle,
  DollarSign,
  Users,
  TrendingDown,
  Clock,
  Mail,
  ChevronRight,
  Shield,
  Activity,
  Eye,
  Target,
} from 'lucide-react';

const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
};

const trendConfig: Record<string, { color: string; bg: string; label: string }> = {
  'Gone Dark': { color: C.red, bg: 'rgba(217,74,74,0.12)', label: 'Gone Dark' },
  Declining: { color: C.orange, bg: 'rgba(232,146,63,0.12)', label: 'Declining' },
  Slipping: { color: C.amber, bg: 'rgba(245,158,11,0.12)', label: 'Slipping' },
  Stable: { color: C.green, bg: 'rgba(140,198,63,0.12)', label: 'Stable' },
};

/* Synthetic decay timeline data for the top 3 at-risk members */
const decayTimelineMonths = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
const decayTimelines = [
  { label: 'Heritage Abstract LLC', color: C.red, data: [58, 52, 40, 25, 12, 4, 0] },
  { label: 'First American Title', color: C.orange, data: [82, 80, 74, 62, 45, 30, 20] },
  { label: 'National Title Services', color: C.amber, data: [72, 70, 68, 60, 50, 38, 30] },
];

/* Revenue at risk by severity tier */
const severityTiers = [
  { tier: 'Critical', range: '75-100% decay', revenue: 62071, color: C.red, count: 2 },
  { tier: 'High', range: '50-74% decay', revenue: 441, color: C.orange, count: 1 },
  { tier: 'Medium', range: '25-49% decay', revenue: 1216, color: C.amber, count: 1 },
  { tier: 'Low', range: '0-24% decay', revenue: 1216, color: C.green, count: 1 },
];

/* Recommended actions per alert */
const alertActions: Record<string, string> = {
  'Heritage Abstract LLC': 'Immediate phone outreach — member has gone completely dark. Escalate to membership team.',
  'First American Title': 'CEO-level check-in required. $61K account showing 75% engagement decline. Priority 1.',
  'National Title Services': 'Send personalized value email highlighting PFL resources and upcoming regional events.',
  'Liberty Title Group': 'Nurture sequence — soft touch with event invite. Consider upgrade conversation.',
  'Commonwealth Land Title': 'No action needed. Monitor baseline — minor fluctuation within normal range.',
};

export default function DecayRadar() {
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  /* KPI calculations */
  const monitored = 4994;
  const activeAlerts = demoDecayAlerts.filter((d) => d.decay >= 50);
  const activeAlertCount = activeAlerts.length;
  const revenueAtRisk = activeAlerts.reduce((s, d) => s + d.revenue, 0);
  const avgDecay = Math.round(
    demoDecayAlerts.filter((d) => d.decay > 0).reduce((s, d) => s + d.decay, 0) /
      demoDecayAlerts.filter((d) => d.decay > 0).length
  );

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(217,74,74,0.2) 0%, rgba(232,146,63,0.2) 100%)',
              border: '1px solid rgba(217,74,74,0.3)',
            }}
          >
            <Radio className="w-5 h-5" style={{ color: C.red }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              DecayRadar<span style={{ color: C.red, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.orange }}>
              See churn coming 6 months before it happens.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Engagement decay detection engine that monitors each member&apos;s personal engagement baseline and flags
          when they deviate. A member who historically opens 80% of emails dropping to 20% triggers an alert with
          revenue at risk — weighted by annual dues so underwriter alerts always surface first.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Members Monitored"
          value={monitored.toLocaleString()}
          sub="All active members"
          icon={Users}
          color={C.blue}
          sparkData={[4200, 4350, 4500, 4620, 4750, 4880, 4994]}
          sparkColor={C.blue}
          trend={{ value: 3.2, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Active Alerts"
          value={activeAlertCount}
          sub={`${demoDecayAlerts.length} total tracked`}
          icon={AlertTriangle}
          color={C.red}
          sparkData={[1, 1, 2, 2, 2, 3, 3]}
          sparkColor={C.red}
          trend={{ value: -50, label: 'new this month' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--heading)' }}>{activeAlertCount} members</strong> have decay rates
                at or above 50% — meaning their current engagement is less than half their historical baseline.
              </p>
              {activeAlerts.map((a) => (
                <div
                  key={a.email}
                  className="flex items-center justify-between p-2 rounded-lg text-xs"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <span style={{ color: 'var(--heading)' }}>{a.org}</span>
                  <span className="font-bold" style={{ color: C.red }}>
                    {a.decay}% decay
                  </span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Revenue at Risk"
          value={`$${revenueAtRisk.toLocaleString()}`}
          sub="From high-decay members"
          icon={DollarSign}
          color={C.orange}
          sparkData={[18000, 24000, 32000, 45000, 52000, 58000, revenueAtRisk]}
          sparkColor={C.orange}
          trend={{ value: -12.4, label: 'growing exposure' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Revenue at risk is calculated from annual dues of members with decay rates at or above 50%.
                ACU underwriter accounts dominate due to their $61,554 annual dues.
              </p>
              {activeAlerts.map((a) => (
                <div
                  key={a.email}
                  className="flex items-center justify-between p-2 rounded-lg text-xs"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <span style={{ color: 'var(--heading)' }}>
                    {a.org}{' '}
                    <span style={{ color: 'var(--text-muted)' }}>({a.type})</span>
                  </span>
                  <span className="font-bold" style={{ color: C.orange }}>
                    ${a.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Avg Decay Rate"
          value={`${avgDecay}%`}
          sub="Across alerted members"
          icon={TrendingDown}
          color={C.amber}
          sparkData={[35, 40, 44, 48, 52, 58, avgDecay]}
          sparkColor={C.amber}
          trend={{ value: -8.2, label: 'worsening' }}
          accent
        />
      </div>

      {/* ── 3. Decay Alert Cards ──────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4" style={{ color: C.red }} />
          <h2 className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>
            Decay Alerts
          </h2>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(217,74,74,0.15)', color: C.red }}
          >
            {demoDecayAlerts.length} members
          </span>
        </div>

        <div className="space-y-3">
          {demoDecayAlerts.map((alert) => {
            const tc = trendConfig[alert.trend] || trendConfig.Stable;
            const isExpanded = expandedAlert === alert.org;
            const action = alertActions[alert.org] || 'Monitor engagement patterns.';

            return (
              <div
                key={alert.email}
                className="rounded-xl border overflow-hidden transition-all duration-200 hover:translate-y-[-1px]"
                style={{
                  background: 'var(--card)',
                  borderColor: isExpanded ? tc.color : 'var(--card-border)',
                  borderLeftWidth: '4px',
                  borderLeftColor: tc.color,
                  boxShadow: isExpanded
                    ? `0 4px 24px rgba(0,0,0,0.15), 0 0 0 1px ${tc.color}20`
                    : '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedAlert(isExpanded ? null : alert.org)}
                >
                  <div className="flex items-start gap-4">
                    {/* Decay ring */}
                    <ProgressRing
                      value={alert.decay}
                      max={100}
                      color={tc.color}
                      size={56}
                    />

                    {/* Member info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: 'var(--heading)' }}>
                          {alert.org}
                        </span>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}
                        >
                          {alert.type}
                        </span>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: tc.bg, color: tc.color }}
                        >
                          {tc.label}
                        </span>
                      </div>

                      <div
                        className="text-[10px] mt-1 flex items-center gap-1"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        {alert.email}
                      </div>

                      {/* Decay bar: historical → current */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[9px] mb-1">
                          <span style={{ color: 'var(--text-muted)' }}>
                            Historical: {alert.historical}%
                          </span>
                          <span style={{ color: tc.color }}>
                            Current: {alert.recent}%
                          </span>
                        </div>
                        <div
                          className="relative h-2 rounded-full overflow-hidden"
                          style={{ background: 'var(--input-bg)' }}
                        >
                          {/* Historical baseline (ghost bar) */}
                          <div
                            className="absolute top-0 left-0 h-full rounded-full opacity-25"
                            style={{
                              width: `${alert.historical}%`,
                              background: tc.color,
                            }}
                          />
                          {/* Current rate (solid bar) */}
                          <div
                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${alert.recent}%`,
                              background: tc.color,
                              boxShadow: `0 0 8px ${tc.color}60`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Revenue + expand */}
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <div className="text-lg font-extrabold" style={{ color: C.red }}>
                        ${alert.revenue.toLocaleString()}
                      </div>
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        annual revenue at risk
                      </div>
                      <div
                        className="flex items-center gap-1 text-[10px] mt-1"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Clock className="w-3 h-3" />
                        {alert.lastOpen}
                      </div>
                      <ChevronRight
                        className="w-4 h-4 mt-1 transition-transform duration-200"
                        style={{
                          color: 'var(--text-muted)',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div
                    className="px-4 pb-4 pt-0 border-t"
                    style={{ borderColor: 'var(--card-border)' }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                        <div
                          className="text-[9px] uppercase tracking-wider font-bold mb-1"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Decay Breakdown
                        </div>
                        <div className="space-y-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <div className="flex justify-between">
                            <span>Historical open rate</span>
                            <span style={{ color: 'var(--heading)' }}>{alert.historical}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Current open rate</span>
                            <span style={{ color: tc.color }}>{alert.recent}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Decay percentage</span>
                            <span className="font-bold" style={{ color: tc.color }}>
                              {alert.decay}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                        <div
                          className="text-[9px] uppercase tracking-wider font-bold mb-1"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Churn Score
                        </div>
                        {(() => {
                          const churn = demoChurnScores.find(
                            (c) =>
                              alert.org.includes(c.org) || c.org.includes(alert.org.split(' ')[0])
                          );
                          if (!churn)
                            return (
                              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                No churn data
                              </div>
                            );
                          return (
                            <div className="space-y-1">
                              <div
                                className="text-2xl font-extrabold"
                                style={{
                                  color:
                                    churn.score >= 70
                                      ? C.red
                                      : churn.score >= 50
                                        ? C.orange
                                        : C.green,
                                }}
                              >
                                {churn.score}
                              </div>
                              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                {churn.factors.slice(0, 2).join(' | ')}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="rounded-lg p-3" style={{ background: 'rgba(140,198,63,0.06)' }}>
                        <div
                          className="text-[9px] uppercase tracking-wider font-bold mb-1"
                          style={{ color: C.green }}
                        >
                          Recommended Action
                        </div>
                        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--heading)' }}>
                          {action}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Decay Timeline Chart ───────────────────────────── */}
      <Card
        title="Engagement Decay Timeline"
        subtitle="90-day rolling open rate for top 3 at-risk members"
        className="mb-8"
        detailTitle="Decay Timeline Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              This chart tracks the 90-day rolling email open rate for the three members with the highest
              decay scores. Each line represents a member&apos;s engagement trajectory — the steeper the
              decline, the more urgent the intervention needed.
            </p>
            <div className="space-y-2">
              {decayTimelines.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between p-2 rounded-lg text-xs"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                    <span style={{ color: 'var(--heading)' }}>{t.label}</span>
                  </div>
                  <span style={{ color: t.color }}>
                    {t.data[0]}% &rarr; {t.data[t.data.length - 1]}%
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Heritage Abstract LLC has reached 0% engagement — a &quot;gone dark&quot; state that typically
              precedes non-renewal. First American Title&apos;s steep decline from 82% to 20% is particularly
              alarming given their $61,554 annual dues.
            </p>
          </div>
        }
      >
        <ClientChart
          type="line"
          height={280}
          data={{
            labels: decayTimelineMonths,
            datasets: decayTimelines.map((t) => ({
              label: t.label,
              data: t.data,
              borderColor: t.color,
              backgroundColor: t.color + '15',
              fill: true,
              tension: 0.4,
              borderWidth: 2.5,
              pointRadius: 4,
              pointBackgroundColor: t.color,
              pointBorderColor: 'var(--card)',
              pointBorderWidth: 2,
              pointHoverRadius: 6,
            })),
          }}
          options={{
            plugins: {
              legend: {
                display: true,
                position: 'top' as const,
                labels: {
                  color: '#8899aa',
                  usePointStyle: true,
                  pointStyle: 'circle',
                  padding: 16,
                  font: { size: 10 },
                },
              },
              tooltip: {
                callbacks: {
                  label: (ctx: { dataset: { label: string }; raw: number }) =>
                    `${ctx.dataset.label}: ${ctx.raw}% open rate`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                grid: { color: '#1e3350' },
                ticks: {
                  color: '#8899aa',
                  callback: (v: number | string) => v + '%',
                },
                title: {
                  display: true,
                  text: 'Open Rate',
                  color: '#8899aa',
                  font: { size: 10 },
                },
              },
              x: {
                grid: { display: false },
                ticks: { color: '#8899aa' },
              },
            },
          }}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ── 5. How DecayRadar Works ──────────────────────────── */}
        <Card
          title="How DecayRadar Works"
          subtitle="The algorithm behind the alerts"
          detailTitle="DecayRadar Algorithm"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                DecayRadar is a personalized engagement monitoring system. Unlike segment-level averages that
                miss individual declines, it tracks each member against their own historical baseline — what
                &quot;normal&quot; looks like for that specific organization.
              </p>
              <div className="space-y-3">
                {[
                  {
                    step: '1. Baseline Calculation',
                    desc: 'For each member, we calculate a 180-day rolling average of email open and click rates. This becomes their personal engagement baseline — not a segment average.',
                  },
                  {
                    step: '2. Rolling Comparison',
                    desc: 'Every week, we compare the member\'s last 90 days of engagement against their baseline. The decay percentage represents how far they\'ve fallen from their norm.',
                  },
                  {
                    step: '3. Revenue Weighting',
                    desc: 'Alerts are weighted by annual dues. An ACU underwriter ($61,554/yr) showing 50% decay ranks higher than an ACB member ($517/yr) showing 100% decay.',
                  },
                  {
                    step: '4. Trend Classification',
                    desc: 'Members are classified into tiers: Gone Dark (75-100%), Declining (50-74%), Slipping (25-49%), and Stable (0-24%). Each tier triggers different workflow actions.',
                  },
                  {
                    step: '5. Automated Response',
                    desc: 'Critical alerts trigger automated re-engagement workflows — personalized emails, staff notifications, and CRM task creation.',
                  },
                ].map((s) => (
                  <div key={s.step} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                    <div className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--heading)' }}>
                      {s.step}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {s.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <div className="space-y-3">
            {[
              {
                icon: Eye,
                title: 'Monitors 90-day rolling open/click rates per member',
                desc: 'Personal engagement tracking, not segment averages',
              },
              {
                icon: Target,
                title: 'Compares against personal historical baseline',
                desc: 'Each member measured against their own norm',
              },
              {
                icon: AlertTriangle,
                title: 'Flags when current rate drops below 50% of baseline',
                desc: 'Catches decline early, before it becomes non-renewal',
              },
              {
                icon: DollarSign,
                title: 'Weights alerts by annual revenue',
                desc: 'ACU underwriter alert > ACA agent alert',
              },
              {
                icon: Shield,
                title: 'Triggers automated re-engagement workflow',
                desc: 'Personalized outreach based on decay severity',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 mt-0.5"
                  style={{
                    background: 'rgba(217,74,74,0.08)',
                    border: '1px solid rgba(217,74,74,0.15)',
                  }}
                >
                  <item.icon className="w-3.5 h-3.5" style={{ color: C.red }} />
                </div>
                <div>
                  <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>
                    {item.title}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 6. Revenue Impact Summary ────────────────────────── */}
        <Card
          title="Revenue Impact by Severity"
          subtitle="Total annual revenue at risk per decay tier"
          detailTitle="Revenue Impact Analysis"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Revenue at risk is dominated by the Critical tier due to First American Title&apos;s
                $61,554 ACU dues. Even a single underwriter entering decay can represent more revenue
                risk than hundreds of individual agent accounts.
              </p>
              <div className="space-y-2">
                {severityTiers.map((t) => (
                  <div
                    key={t.tier}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'var(--input-bg)' }}
                  >
                    <div>
                      <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
                        {t.tier}
                        <span className="ml-2 font-normal" style={{ color: 'var(--text-muted)' }}>
                          {t.range}
                        </span>
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {t.count} member{t.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-sm font-extrabold" style={{ color: t.color }}>
                      ${t.revenue.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg border"
                style={{ borderColor: 'var(--card-border)', background: 'var(--card)' }}
              >
                <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
                  Total Revenue at Risk
                </span>
                <span className="text-base font-extrabold" style={{ color: C.red }}>
                  ${severityTiers.reduce((s, t) => s + t.revenue, 0).toLocaleString()}
                </span>
              </div>
            </div>
          }
        >
          <ClientChart
            type="bar"
            height={240}
            data={{
              labels: severityTiers.map((t) => t.tier),
              datasets: [
                {
                  label: 'Revenue at Risk',
                  data: severityTiers.map((t) => t.revenue),
                  backgroundColor: severityTiers.map((t) => t.color + '80'),
                  borderColor: severityTiers.map((t) => t.color),
                  borderWidth: 2,
                  borderRadius: 8,
                },
              ],
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
                  formatter: (v: number) => '$' + v.toLocaleString(),
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: { color: '#1e3350' },
                  ticks: {
                    color: '#8899aa',
                    callback: (v: number | string) =>
                      '$' + Number(v).toLocaleString(),
                  },
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#8899aa', font: { weight: 'bold' as const } },
                },
              },
            }}
          />

          {/* Summary row below chart */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {severityTiers.map((t) => (
              <div key={t.tier} className="text-center p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase font-bold" style={{ color: t.color }}>
                  {t.tier}
                </div>
                <div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>
                  {t.count}
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  member{t.count !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

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
          <Radio className="w-3 h-3" />
          DecayRadar&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
