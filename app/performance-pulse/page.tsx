'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { MiniBar } from '@/components/SparkKpi';
import ProgressRing from '@/components/ProgressRing';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  AlertTriangle,
  CheckCircle2,
  Mail,
  Eye,
  MousePointerClick,
  ShieldAlert,
  DollarSign,
  Users,
  ArrowUp,
  ArrowDown,
  Star,
  Calendar,
  BarChart3,
  Sparkles,
} from 'lucide-react';

/* -- Palette -- */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  indigo: '#6366f1',
  teal: '#14b8a6',
  rose: '#f43f5e',
};

/* -- Grade calculation -- */
function gradeFromScore(score: number): string {
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  return 'C-';
}

function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return C.green;
  if (grade.startsWith('B')) return C.blue;
  if (grade.startsWith('C')) return C.orange;
  return C.red;
}

interface WeeklyMetric {
  label: string;
  value: string;
  rawValue: number;
  delta: number;
  deltaLabel: string;
  explanation: string;
  icon: typeof Mail;
  iconColor: string;
  sparkData: number[];
  weight: number;
  maxScore: number;
}

const metrics: WeeklyMetric[] = [
  {
    label: 'Emails Sent',
    value: '13,454',
    rawValue: 13454,
    delta: -8,
    deltaLabel: 'vs last week - expected, fewer campaigns',
    explanation: 'Lower send volume this week due to planned campaign calendar gap. Not a concern.',
    icon: Mail,
    iconColor: C.blue,
    sparkData: [14200, 15100, 14800, 13900, 14600, 14600, 13454],
    weight: 10,
    maxScore: 10,
  },
  {
    label: 'Open Rate',
    value: '40.4%',
    rawValue: 40.4,
    delta: 3.2,
    deltaLabel: 'vs last week - improving',
    explanation: 'Open rate climbing due to improved subject lines and SendBrain timing optimization.',
    icon: Eye,
    iconColor: C.green,
    sparkData: [35.2, 36.1, 37.0, 37.8, 38.5, 37.2, 40.4],
    weight: 25,
    maxScore: 25,
  },
  {
    label: 'Click Rate',
    value: '12.6%',
    rawValue: 12.6,
    delta: 1.8,
    deltaLabel: 'vs last week',
    explanation: 'Click rate up across all campaign types. CTA placement improvements paying off.',
    icon: MousePointerClick,
    iconColor: C.teal,
    sparkData: [9.8, 10.2, 10.5, 10.8, 11.0, 10.8, 12.6],
    weight: 25,
    maxScore: 25,
  },
  {
    label: 'Bounce Rate',
    value: '3.7%',
    rawValue: 3.7,
    delta: -0.4,
    deltaLabel: 'vs last week - hygiene working',
    explanation: 'Bounce rate dropping after list hygiene cleanup. Approaching the 3% target.',
    icon: ShieldAlert,
    iconColor: C.orange,
    sparkData: [4.8, 4.5, 4.3, 4.2, 4.1, 4.1, 3.7],
    weight: 15,
    maxScore: 15,
  },
  {
    label: 'Revenue',
    value: '$673K',
    rawValue: 673000,
    delta: 15,
    deltaLabel: 'vs last week - renewal batch',
    explanation: 'Revenue spike from April renewal batch. Membership renewal campaign driving bulk of attributed revenue.',
    icon: DollarSign,
    iconColor: C.green,
    sparkData: [320, 410, 480, 520, 550, 585, 673],
    weight: 15,
    maxScore: 15,
  },
  {
    label: 'Staff Outreach',
    value: '24 entries',
    rawValue: 24,
    delta: 33,
    deltaLabel: 'vs last week',
    explanation: 'Staff outreach up significantly. RelationshipIQ tracking more personal touches this week.',
    icon: Users,
    iconColor: C.purple,
    sparkData: [12, 14, 15, 16, 17, 18, 24],
    weight: 10,
    maxScore: 10,
  },
];

/* -- Calculate overall score -- */
function calcOverallScore(): number {
  let score = 0;
  // Open rate: 40.4% vs 35% target = great (22/25)
  score += 22;
  // Click rate: 12.6% vs 10% target = great (23/25)
  score += 23;
  // Bounce rate: 3.7% vs 3% target = ok (11/15)
  score += 11;
  // Revenue: $673K vs $500K target = excellent (14/15)
  score += 14;
  // Emails sent: volume fine (8/10)
  score += 8;
  // Staff outreach: great improvement (9/10)
  score += 9;
  return score;
}

const overallScore = calcOverallScore();
const overallGrade = gradeFromScore(overallScore);

/* -- Wins & Needs Attention -- */
const wins = [
  { text: 'Renewal batch hit 69.9% open rate', detail: 'Well above the 62% Renewal average. Subject line and timing both optimized.' },
  { text: 'Bounce rate dropping after cleanup', detail: 'Down 0.4pp from last week, trending toward 3% target. Hygiene automation working.' },
  { text: 'Staff outreach up 33%', detail: '24 personal touches logged this week. RelationshipIQ showing increased engagement.' },
  { text: 'Click rate best week of Q2', detail: '12.6% across all campaigns. CTA improvements from CampaignAutopsy recommendations.' },
];

const needsAttention = [
  { text: 'PFL bounce rate still above 3%', severity: 'amber' as const, detail: 'PFL Compliance campaigns running at 6.9% bounce rate. Specific list segments need deeper hygiene.' },
  { text: 'Heritage Abstract unresponsive', severity: 'red' as const, detail: 'Zero engagement for 90+ days. Churn score: 92. Needs immediate phone outreach.' },
  { text: 'Newsletter click rate trailing', severity: 'amber' as const, detail: 'Title News Weekly click rate at 10.0% vs. 12.6% overall. Content or CTA needs refresh.' },
];

/* -- Grade history -- */
const gradeHistory = [
  { week: 'Mar 17', grade: 'B', score: 83 },
  { week: 'Mar 24', grade: 'B+', score: 87 },
  { week: 'Mar 31', grade: 'A-', score: 90 },
  { week: 'Apr 7', grade: 'A-', score: overallScore },
];

export default function PerformancePulse() {
  const [selectedMetricIdx, setSelectedMetricIdx] = useState<number | null>(null);

  const bestMetric = metrics.reduce((best, m) => m.delta > best.delta ? m : best, metrics[0]);
  const worstMetric = metrics.reduce((worst, m) => m.delta < worst.delta ? m : worst, metrics[0]);

  /* Compute weekly change as avg of positive deltas */
  const avgDelta = +(metrics.reduce((s, m) => s + m.delta, 0) / metrics.length).toFixed(1);

  return (
    <div className="p-6">
      {/* -- 1. Branded Header -- */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(168,85,247,0.2) 100%)',
              border: '1px solid rgba(244,63,94,0.3)',
            }}
          >
            <Activity className="w-5 h-5" style={{ color: C.rose }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              PerformancePulse<span style={{ color: C.rose, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.rose }}>
              Your weekly performance heartbeat.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Automated weekly performance digest. PerformancePulse grades your week, highlights wins,
          flags what needs attention, and tracks trends so you always know where you stand.
        </p>
      </div>

      {/* -- 2. SparkKpi Row -- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SparkKpi
          label="Weekly Grade"
          value={overallGrade}
          sub={`Score: ${overallScore}/100`}
          icon={Award}
          color={gradeColor(overallGrade)}
          sparkData={gradeHistory.map(g => g.score)}
          sparkColor={gradeColor(overallGrade)}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Weighted score combining open rate (25%), click rate (25%), bounce rate (15%),
                revenue (15%), send volume (10%), and staff outreach (10%).
              </p>
              {gradeHistory.map(g => (
                <div key={g.week} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{g.week}</span>
                  <span className="text-sm font-extrabold" style={{ color: gradeColor(g.grade) }}>{g.grade}</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Best Metric"
          value={bestMetric.label}
          sub={`+${bestMetric.delta}% this week`}
          icon={TrendingUp}
          color={C.green}
          sparkData={bestMetric.sparkData}
          sparkColor={C.green}
          trend={{ value: bestMetric.delta, label: 'week-over-week' }}
          accent
        />
        <SparkKpi
          label="Worst Metric"
          value={worstMetric.label}
          sub={`${worstMetric.delta}% this week`}
          icon={TrendingDown}
          color={C.orange}
          sparkData={worstMetric.sparkData}
          sparkColor={C.orange}
          trend={{ value: worstMetric.delta, label: 'week-over-week' }}
          accent
        />
        <SparkKpi
          label="Week-over-Week Change"
          value={`${avgDelta > 0 ? '+' : ''}${avgDelta}%`}
          sub="Average across all metrics"
          icon={BarChart3}
          color={avgDelta >= 0 ? C.blue : C.orange}
          sparkData={[3.2, 4.1, 2.8, 5.2, 3.9, 6.1, avgDelta]}
          sparkColor={avgDelta >= 0 ? C.blue : C.orange}
          accent
        />
      </div>

      {/* -- 3. Weekly Report Card Header -- */}
      <div className="rounded-xl border mb-8 overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--card-border)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" style={{ color: C.rose }} />
              <h2 className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>Week of April 7-11, 2026</h2>
            </div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Automated performance digest generated by PerformancePulse
            </p>
          </div>
          <div className="text-center">
            <ProgressRing value={overallScore} max={100} color={gradeColor(overallGrade)} size={72} />
            <div className="text-[9px] font-bold mt-1" style={{ color: 'var(--text-muted)' }}>Overall: {overallGrade}</div>
          </div>
        </div>

        {/* -- 4. Metric Cards -- */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {metrics.map((m, idx) => {
              const Icon = m.icon;
              const isPositive = m.delta > 0;
              const isNegative = m.delta < 0;
              /* For bounce rate, down is good */
              const isBounce = m.label === 'Bounce Rate';
              const deltaGood = isBounce ? isNegative : isPositive;
              const deltaColor = deltaGood ? C.green : (isBounce ? (isPositive ? C.red : C.green) : (isNegative ? C.orange : 'var(--text-muted)'));
              const DeltaArrow = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;

              return (
                <div
                  key={m.label}
                  className="rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:translate-y-[-2px]"
                  style={{
                    background: selectedMetricIdx === idx ? `color-mix(in srgb, ${m.iconColor} 4%, var(--card))` : 'var(--card)',
                    borderColor: selectedMetricIdx === idx ? m.iconColor + '40' : 'var(--card-border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                  onClick={() => setSelectedMetricIdx(selectedMetricIdx === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: m.iconColor }} />
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DeltaArrow className="w-3 h-3" style={{ color: deltaColor }} />
                      <span className="text-[10px] font-bold" style={{ color: deltaColor }}>
                        {m.delta > 0 ? '+' : ''}{m.delta}%
                      </span>
                    </div>
                  </div>

                  <div className="text-2xl font-extrabold mb-1" style={{ color: 'var(--heading)' }}>{m.value}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{m.deltaLabel}</div>

                  {/* Mini sparkline */}
                  <div className="mt-3">
                    <div className="text-[8px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>7-WEEK TREND</div>
                    <MiniBar value={m.rawValue} max={m.label === 'Bounce Rate' ? 6 : (m.label === 'Revenue' ? 800000 : (m.label === 'Staff Outreach' ? 30 : (m.label === 'Emails Sent' ? 20000 : 50)))} color={m.iconColor} height={3} />
                  </div>

                  {selectedMetricIdx === idx && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
                      <p className="text-[10px] leading-relaxed" style={{ color: 'var(--heading)' }}>{m.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* -- 5. Wins & Needs Attention -- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Wins */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4" style={{ color: C.green }} />
                <span className="text-[11px] font-extrabold" style={{ color: C.green }}>Wins This Week</span>
              </div>
              <div className="space-y-2">
                {wins.map((w, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: 'rgba(140,198,63,0.04)', border: '1px solid rgba(140,198,63,0.12)' }}>
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: C.green }} />
                      <div>
                        <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{w.text}</div>
                        <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{w.detail}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Attention */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" style={{ color: C.amber }} />
                <span className="text-[11px] font-extrabold" style={{ color: C.amber }}>Needs Attention</span>
              </div>
              <div className="space-y-2">
                {needsAttention.map((n, i) => {
                  const sevColor = n.severity === 'red' ? C.red : C.amber;
                  return (
                    <div key={i} className="rounded-lg p-3" style={{ background: `color-mix(in srgb, ${sevColor} 4%, transparent)`, border: `1px solid ${sevColor}18` }}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: sevColor }} />
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{n.text}</div>
                            <span className="text-[7px] font-extrabold uppercase px-1 py-0.5 rounded" style={{ background: `${sevColor}20`, color: sevColor }}>
                              {n.severity}
                            </span>
                          </div>
                          <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.detail}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* -- 6. Sparkline Trends Chart -- */}
          <Card
            title="Week-over-Week Trends"
            subtitle="Key metrics tracked over the past 7 weeks"
          >
            <ClientChart
              type="line"
              height={260}
              data={{
                labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
                datasets: [
                  {
                    label: 'Open Rate %',
                    data: [35.2, 36.1, 37.0, 37.8, 38.5, 37.2, 40.4],
                    borderColor: C.green,
                    backgroundColor: C.green + '20',
                    tension: 0.3,
                    pointRadius: 3,
                    pointBackgroundColor: C.green,
                    fill: true,
                  },
                  {
                    label: 'Click Rate %',
                    data: [9.8, 10.2, 10.5, 10.8, 11.0, 10.8, 12.6],
                    borderColor: C.teal,
                    backgroundColor: C.teal + '20',
                    tension: 0.3,
                    pointRadius: 3,
                    pointBackgroundColor: C.teal,
                    fill: true,
                  },
                  {
                    label: 'Bounce Rate %',
                    data: [4.8, 4.5, 4.3, 4.2, 4.1, 4.1, 3.7],
                    borderColor: C.orange,
                    backgroundColor: C.orange + '20',
                    tension: 0.3,
                    pointRadius: 3,
                    pointBackgroundColor: C.orange,
                    fill: true,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: { display: true, position: 'bottom' as const, labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 10 } } },
                },
                scales: {
                  y: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => v + '%' } },
                  x: { grid: { display: false }, ticks: { color: '#8899aa' } },
                },
              }}
            />
          </Card>
        </div>
      </div>

      {/* -- 7. Grade History -- */}
      <Card
        title="Grade History"
        subtitle="Performance grades over the last 4 weeks"
        className="mb-8"
      >
        <div className="flex items-center justify-center gap-6 py-4">
          {gradeHistory.map((g, i) => (
            <div key={g.week} className="text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-all"
                style={{
                  background: i === gradeHistory.length - 1 ? `color-mix(in srgb, ${gradeColor(g.grade)} 15%, transparent)` : 'var(--input-bg)',
                  border: i === gradeHistory.length - 1 ? `2px solid ${gradeColor(g.grade)}40` : '1px solid var(--card-border)',
                }}
              >
                <span className="text-2xl font-extrabold" style={{ color: gradeColor(g.grade) }}>{g.grade}</span>
              </div>
              <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{g.week}</div>
              <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{g.score}/100</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(244,63,94,0.08)', color: C.rose, border: '1px solid rgba(244,63,94,0.15)' }}
        >
          <Activity className="w-3 h-3" />
          PerformancePulse&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
