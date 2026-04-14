'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  AlertTriangle,
  Activity,
  Clock,
  Shield,
  Zap,
  TrendingDown,
  TrendingUp,
  Mail,
  MousePointerClick,
  UserMinus,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertOctagon,
} from 'lucide-react';

const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  cyan: '#06b6d4',
};

/* ── Demo anomaly events ──────────────────────────── */
const anomalies = [
  {
    id: 'a1',
    date: 'Apr 9, 2026',
    metric: 'Bounce Rate',
    severity: 'Critical' as const,
    icon: Mail,
    deviation: '+340%',
    baseline: '3.2%',
    actual: '14.1%',
    campaign: 'PFL Compliance Notice — April Wave 3',
    description: 'Bounce rate spiked to 14.1% on April Wave 3 compliance mailing. Baseline is 3.2%. 220 hard bounces detected — likely stale list segment from ACB members who changed email providers.',
    action: 'Quarantine bounced addresses. Run hygiene scan on ACB segment. Pause Wave 4 until list is cleaned.',
  },
  {
    id: 'a2',
    date: 'Apr 7, 2026',
    metric: 'Open Rate',
    severity: 'Warning' as const,
    icon: TrendingDown,
    deviation: '-28%',
    baseline: '52.1%',
    actual: '37.5%',
    campaign: 'ALTA ONE 2026 — Early Bird Registration',
    description: 'Open rate for ALTA ONE Early Bird dropped to 37.5% vs. 52.1% baseline for event emails. Subject line may not have conveyed urgency. Send time was Thursday 2pm vs. optimal Tuesday 9am.',
    action: 'A/B test subject lines for follow-up. Reschedule next send to Tuesday 9-10am window. Consider adding deadline urgency.',
  },
  {
    id: 'a3',
    date: 'Apr 5, 2026',
    metric: 'Unsubscribes',
    severity: 'Warning' as const,
    icon: UserMinus,
    deviation: '+180%',
    baseline: '0.08%',
    actual: '0.22%',
    campaign: 'TIPAC Q2 Pledge Drive',
    description: 'Unsubscribe rate for TIPAC Pledge Drive reached 0.22%, nearly 3x the baseline of 0.08%. Cluster analysis shows 68% of unsubs are from REA attorney segment who may view advocacy asks as irrelevant.',
    action: 'Segment REA attorneys out of advocacy-heavy cadences. Add preference center link prominently. Review frequency for this segment.',
  },
  {
    id: 'a4',
    date: 'Apr 2, 2026',
    metric: 'Click Rate',
    severity: 'Info' as const,
    icon: MousePointerClick,
    deviation: '+62%',
    baseline: '8.4%',
    actual: '13.6%',
    campaign: 'Title News Weekly — Issue #14',
    description: 'Click rate surged to 13.6% (baseline 8.4%) on Title News #14. The "State Legislation Roundup" article drove 72% of all clicks. Positive anomaly indicating high-value content.',
    action: 'Replicate this content format. Feature legislative roundups more prominently. Consider dedicated legislation alert series.',
  },
];

const severityConfig: Record<string, { color: string; bg: string }> = {
  Critical: { color: C.red, bg: 'rgba(217,74,74,0.12)' },
  Warning: { color: C.orange, bg: 'rgba(232,146,63,0.12)' },
  Info: { color: C.blue, bg: 'rgba(74,144,217,0.12)' },
};

/* ── Monitored metrics with health status ─────────── */
const monitoredMetrics = [
  { metric: 'Open Rate', current: '42.8%', baseline: '41.5%', status: 'green' as const, delta: '+1.3pp' },
  { metric: 'Click Rate', current: '10.2%', baseline: '9.8%', status: 'green' as const, delta: '+0.4pp' },
  { metric: 'Bounce Rate', current: '4.8%', baseline: '3.2%', status: 'red' as const, delta: '+1.6pp' },
  { metric: 'Unsubscribe Rate', current: '0.15%', baseline: '0.08%', status: 'yellow' as const, delta: '+0.07pp' },
  { metric: 'Delivery Rate', current: '96.2%', baseline: '97.1%', status: 'yellow' as const, delta: '-0.9pp' },
  { metric: 'Spam Complaint Rate', current: '0.01%', baseline: '0.02%', status: 'green' as const, delta: '-0.01pp' },
  { metric: 'Reply Rate', current: '2.4%', baseline: '2.2%', status: 'green' as const, delta: '+0.2pp' },
  { metric: 'List Growth Rate', current: '1.8%', baseline: '2.1%', status: 'yellow' as const, delta: '-0.3pp' },
];

const statusColors = {
  green: { dot: C.green, bg: 'rgba(140,198,63,0.10)', label: 'Healthy' },
  yellow: { dot: C.amber, bg: 'rgba(245,158,11,0.10)', label: 'Watch' },
  red: { dot: C.red, bg: 'rgba(217,74,74,0.10)', label: 'Alert' },
};

/* ── Chart data: bounce rate with anomaly ─────────── */
const bounceChartDays = ['Mar 28', 'Mar 29', 'Mar 30', 'Mar 31', 'Apr 1', 'Apr 2', 'Apr 3', 'Apr 4', 'Apr 5', 'Apr 6', 'Apr 7', 'Apr 8', 'Apr 9', 'Apr 10', 'Apr 11'];
const bounceChartData = [3.1, 3.0, 3.4, 3.2, 3.5, 3.1, 2.9, 3.3, 3.2, 3.0, 3.1, 3.4, 14.1, 4.2, 3.6];
const bounceBaseline = bounceChartDays.map(() => 3.2);

export default function AnomalyAlert() {
  const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null);

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
            <Zap className="w-5 h-5" style={{ color: C.amber }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              AnomalyAlert<span style={{ color: C.amber, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.orange }}>
              Catch problems before they become crises.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Real-time anomaly detection engine that monitors every email metric against rolling baselines.
          When a metric deviates beyond statistical thresholds, AnomalyAlert fires immediately with severity
          classification, root cause analysis, and recommended corrective actions.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Anomalies Detected (30d)"
          value="12"
          sub="4 this week"
          icon={AlertTriangle}
          color={C.red}
          sparkData={[2, 3, 1, 4, 2, 3, 5, 4, 3, 2, 4, 3]}
          sparkColor={C.red}
          trend={{ value: 15.4, label: 'vs last month' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                12 anomalies detected in the last 30 days across all monitored metrics. 3 Critical, 6 Warning, 3 Info.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Critical', count: 3, color: C.red },
                  { label: 'Warning', count: 6, color: C.orange },
                  { label: 'Info', count: 3, color: C.blue },
                ].map((s) => (
                  <div key={s.label} className="text-center p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                    <div className="text-lg font-extrabold" style={{ color: s.color }}>{s.count}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Active Alerts"
          value="3"
          sub="Requiring action"
          icon={AlertOctagon}
          color={C.orange}
          sparkData={[1, 2, 1, 3, 2, 1, 2, 3, 2, 3]}
          sparkColor={C.orange}
          trend={{ value: -25, label: 'vs last week' }}
          accent
        />
        <SparkKpi
          label="Avg Detection Time"
          value="4.2m"
          sub="From event to alert"
          icon={Clock}
          color={C.blue}
          sparkData={[8, 7, 6, 5.5, 5, 4.8, 4.5, 4.2]}
          sparkColor={C.blue}
          trend={{ value: -12.5, label: 'faster this month' }}
          accent
        />
        <SparkKpi
          label="False Positive Rate"
          value="3.8%"
          sub="Industry avg: 12%"
          icon={Shield}
          color={C.green}
          sparkData={[8, 7, 6.5, 5.8, 5.2, 4.5, 4.0, 3.8]}
          sparkColor={C.green}
          trend={{ value: -18.3, label: 'improving' }}
          accent
        />
      </div>

      {/* ── 3. Anomaly Timeline ───────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4" style={{ color: C.amber }} />
          <h2 className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>
            Recent Anomalies
          </h2>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.15)', color: C.amber }}
          >
            {anomalies.length} events
          </span>
        </div>

        <div className="space-y-3">
          {anomalies.map((a) => {
            const sc = severityConfig[a.severity];
            const isExpanded = expandedAnomaly === a.id;
            const isPositive = a.deviation.startsWith('+') && a.severity === 'Info';

            return (
              <div
                key={a.id}
                className="rounded-xl border overflow-hidden transition-all duration-200 hover:translate-y-[-1px]"
                style={{
                  background: 'var(--card)',
                  borderColor: isExpanded ? sc.color : 'var(--card-border)',
                  borderLeftWidth: '4px',
                  borderLeftColor: sc.color,
                  boxShadow: isExpanded
                    ? `0 4px 24px rgba(0,0,0,0.15), 0 0 0 1px ${sc.color}20`
                    : '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedAnomaly(isExpanded ? null : a.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                      style={{ background: sc.bg, border: `1px solid ${sc.color}30` }}
                    >
                      <a.icon className="w-5 h-5" style={{ color: sc.color }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: 'var(--heading)' }}>
                          {a.metric}
                        </span>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          {a.severity}
                        </span>
                        {isPositive && (
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(140,198,63,0.12)', color: C.green }}
                          >
                            Positive
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                        {a.campaign}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          Baseline: <span className="font-bold" style={{ color: 'var(--heading)' }}>{a.baseline}</span>
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          Actual: <span className="font-bold" style={{ color: sc.color }}>{a.actual}</span>
                        </div>
                        <div className="text-[10px] font-bold" style={{ color: isPositive ? C.green : sc.color }}>
                          {a.deviation} from baseline
                        </div>
                      </div>
                    </div>

                    {/* Date + expand */}
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                        {a.date}
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
                  <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                        <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                          Analysis
                        </div>
                        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--heading)' }}>
                          {a.description}
                        </p>
                      </div>
                      <div className="rounded-lg p-3" style={{ background: 'rgba(140,198,63,0.06)' }}>
                        <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.green }}>
                          Recommended Action
                        </div>
                        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--heading)' }}>
                          {a.action}
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

      {/* ── 4. Bounce Rate Anomaly Chart ──────────────────────── */}
      <Card
        title="Bounce Rate Anomaly — Apr 9"
        subtitle="Daily bounce rate with baseline overlay and anomaly point highlighted"
        className="mb-8"
        detailTitle="Bounce Rate Spike Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              The April 9 bounce rate spike to 14.1% was a 340% deviation from the 3.2% baseline.
              Root cause: 220 hard bounces from stale ACB member email addresses that had changed
              providers. The spike was isolated to the PFL Compliance April Wave 3 send.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Peak Rate', value: '14.1%', color: C.red },
                { label: 'Hard Bounces', value: '220', color: C.orange },
                { label: 'Recovery Time', value: '2 days', color: C.green },
              ].map((s) => (
                <div key={s.label} className="text-center p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <ClientChart
          type="line"
          height={280}
          data={{
            labels: bounceChartDays,
            datasets: [
              {
                label: 'Bounce Rate',
                data: bounceChartData,
                borderColor: C.red,
                backgroundColor: C.red + '15',
                fill: true,
                tension: 0.3,
                borderWidth: 2.5,
                pointRadius: bounceChartData.map((v) => (v > 10 ? 8 : 3)),
                pointBackgroundColor: bounceChartData.map((v) => (v > 10 ? C.red : C.red + '80')),
                pointBorderColor: bounceChartData.map((v) => (v > 10 ? '#fff' : 'var(--card)')),
                pointBorderWidth: bounceChartData.map((v) => (v > 10 ? 3 : 2)),
                pointHoverRadius: 7,
              },
              {
                label: 'Baseline (3.2%)',
                data: bounceBaseline,
                borderColor: C.blue + '60',
                borderDash: [6, 4],
                borderWidth: 1.5,
                pointRadius: 0,
                fill: false,
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
              tooltip: {
                callbacks: {
                  label: (ctx: { dataset: { label: string }; raw: number }) =>
                    `${ctx.dataset.label}: ${ctx.raw}%`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 18,
                grid: { color: '#1e3350' },
                ticks: {
                  color: '#8899aa',
                  callback: (v: number | string) => v + '%',
                },
                title: { display: true, text: 'Bounce Rate', color: '#8899aa', font: { size: 10 } },
              },
              x: {
                grid: { display: false },
                ticks: { color: '#8899aa', maxRotation: 45 },
              },
            },
          }}
        />
      </Card>

      {/* ── 5. Metric Health Dashboard ────────────────────────── */}
      <Card
        title="Metric Health Dashboard"
        subtitle="Real-time status of all 8 monitored metrics"
        className="mb-8"
        detailTitle="Monitored Metrics Detail"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              AnomalyAlert continuously monitors 8 core email metrics. Each metric is compared against a 90-day
              rolling baseline. Status thresholds: Green (&lt;1 std dev), Yellow (1-2 std dev), Red (&gt;2 std dev).
            </p>
            {monitoredMetrics.map((m) => {
              const sc = statusColors[m.status];
              return (
                <div key={m.metric} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: sc.dot }} />
                    <span style={{ color: 'var(--heading)' }}>{m.metric}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span style={{ color: 'var(--text-muted)' }}>Baseline: {m.baseline}</span>
                    <span className="font-bold" style={{ color: sc.dot }}>{m.current}</span>
                    <span className="text-[10px]" style={{ color: sc.dot }}>{m.delta}</span>
                  </div>
                </div>
              );
            })}
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {monitoredMetrics.map((m) => {
            const sc = statusColors[m.status];
            return (
              <div
                key={m.metric}
                className="rounded-lg p-3 transition-all duration-200"
                style={{ background: sc.bg, border: `1px solid ${sc.dot}20` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: sc.dot }} />
                  <span className="text-[8px] font-bold uppercase" style={{ color: sc.dot }}>{sc.label}</span>
                </div>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>
                  {m.metric}
                </div>
                <div className="text-base font-extrabold" style={{ color: 'var(--heading)' }}>
                  {m.current}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    Base: {m.baseline}
                  </span>
                  <span className="text-[9px] font-bold" style={{ color: sc.dot }}>
                    {m.delta}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ── 6. How AnomalyAlert Works ───────────────────────── */}
        <Card
          title="How AnomalyAlert Works"
          subtitle="Statistical anomaly detection pipeline"
          detailTitle="Detection Algorithm"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                AnomalyAlert uses a multi-layer detection approach combining statistical thresholds,
                trend analysis, and campaign context to minimize false positives while catching
                real issues within minutes.
              </p>
              <div className="space-y-3">
                {[
                  { step: '1. Baseline Calculation', desc: 'Rolling 90-day mean and standard deviation for each metric, recalculated daily. Seasonal patterns are accounted for.' },
                  { step: '2. Real-Time Monitoring', desc: 'Every campaign send is compared against baselines within 60 seconds of delivery. Metrics are checked at 1hr, 4hr, and 24hr windows.' },
                  { step: '3. Severity Classification', desc: 'Deviations >2 std dev = Warning, >3 std dev = Critical. Positive anomalies (better than expected) are flagged as Info.' },
                  { step: '4. Context Analysis', desc: 'Campaign type, audience segment, send time, and content are analyzed to identify likely root causes.' },
                  { step: '5. Action Recommendation', desc: 'Each alert includes specific corrective actions based on the anomaly type, severity, and historical resolution patterns.' },
                ].map((s) => (
                  <div key={s.step} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                    <div className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--heading)' }}>{s.step}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <div className="space-y-3">
            {[
              { icon: Activity, title: 'Monitors 8 core metrics in real-time', desc: 'Open, click, bounce, unsub, delivery, spam, reply, list growth' },
              { icon: TrendingUp, title: '90-day rolling baselines per metric', desc: 'Personalized thresholds that adapt to your sending patterns' },
              { icon: AlertTriangle, title: 'Statistical deviation detection', desc: 'Alerts fire when metrics breach 2+ standard deviations' },
              { icon: Clock, title: '4.2 minute average detection time', desc: 'From anomaly occurrence to alert notification' },
              { icon: Shield, title: '96.2% accuracy rate', desc: 'Context-aware filtering keeps false positives under 4%' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
                >
                  <item.icon className="w-3.5 h-3.5" style={{ color: C.amber }} />
                </div>
                <div>
                  <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{item.title}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 7. Anomaly Distribution Chart ───────────────────── */}
        <Card
          title="Anomalies by Metric (30d)"
          subtitle="Distribution of detected anomalies across monitored metrics"
          detailTitle="Anomaly Distribution"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Bounce rate anomalies dominate this period due to the stale ACB segment. Open rate
                anomalies are second, driven by subject line testing variations. The click rate anomaly
                was a positive deviation worth replicating.
              </p>
            </div>
          }
        >
          <ClientChart
            type="bar"
            height={240}
            data={{
              labels: ['Bounce Rate', 'Open Rate', 'Unsub Rate', 'Click Rate', 'Delivery', 'Spam', 'Reply', 'Growth'],
              datasets: [
                {
                  label: 'Anomalies',
                  data: [4, 3, 2, 1, 1, 0, 1, 0],
                  backgroundColor: [C.red + '80', C.orange + '80', C.orange + '80', C.blue + '80', C.amber + '80', C.green + '80', C.blue + '80', C.green + '80'],
                  borderColor: [C.red, C.orange, C.orange, C.blue, C.amber, C.green, C.blue, C.green],
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
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 6,
                  grid: { color: '#1e3350' },
                  ticks: { color: '#8899aa', stepSize: 1 },
                  title: { display: true, text: 'Count', color: '#8899aa', font: { size: 10 } },
                },
                x: {
                  grid: { display: false },
                  ticks: { color: '#8899aa', font: { size: 9 } },
                },
              },
            }}
          />
        </Card>
      </div>

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(245,158,11,0.08)',
            color: C.amber,
            border: '1px solid rgba(245,158,11,0.15)',
          }}
        >
          <Zap className="w-3 h-3" />
          AnomalyAlert&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
