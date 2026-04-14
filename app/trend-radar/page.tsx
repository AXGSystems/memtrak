'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import PulsingMeter from '@/components/PulsingMeter';
import AnimatedCounter from '@/components/AnimatedCounter';
import {
  Radar, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2,
  Search, Zap, ChevronRight, X, Eye, Mail, Clock, DollarSign,
  Users, Shield, Activity, BarChart3, ArrowUpRight, ArrowDownRight,
  Lightbulb, Target, AlertOctagon,
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
  teal: '#14b8a6',
};

/* ── trend data ──────────────────────────────────────────── */
interface Trend {
  id: string;
  title: string;
  description: string;
  confidence: 'High' | 'Medium' | 'Low';
  direction: 'up' | 'down' | 'neutral';
  color: string;
  sparkData: number[];
  impact: string;
  recommendation: string;
  detailInsight: string;
  metric: string;
  metricValue: string;
}

const trends: Trend[] = [
  {
    id: 'open-rate-improving',
    title: 'Open rates improving +2.3% month-over-month',
    description: 'Consistent upward trend in email open rates across all member segments since January. Improved subject lines and send-time optimization contributing factors.',
    confidence: 'High',
    direction: 'up',
    color: C.green,
    sparkData: [36.2, 37.1, 38.0, 38.8, 39.5, 40.4],
    impact: 'Positive — increased engagement drives retention and revenue',
    recommendation: 'Continue A/B testing subject lines. Double down on Tuesday sends and CEO-signed campaigns.',
    detailInsight: 'Open rates have increased every month since January. The sharpest improvement came after implementing send-time optimization in February (+1.2% that month alone). Subject line personalization with member org name added another 0.8% lift.',
    metric: 'Open Rate',
    metricValue: '40.4%',
  },
  {
    id: 'tuesday-outperform',
    title: 'Tuesday sends outperforming Thursday by 18%',
    description: 'Analysis of 42 campaigns shows Tuesday 9-10 AM sends consistently outperform Thursday sends across all metrics.',
    confidence: 'High',
    direction: 'up',
    color: C.blue,
    sparkData: [8, 10, 12, 14, 16, 18],
    impact: 'Actionable — shift high-priority campaigns to Tuesday slots',
    recommendation: 'Move compliance and renewal campaigns to Tuesday morning. Reserve Thursday for lower-priority newsletters.',
    detailInsight: 'Tuesday 9-10 AM ET shows 52% open rate vs 34% for Thursday sends. The gap has been widening over 4 months. Board members and ACU underwriters show the strongest Tuesday preference (90% and 52% respectively).',
    metric: 'Tue vs Thu Delta',
    metricValue: '+18%',
  },
  {
    id: 'pfl-bounce',
    title: 'PFL compliance emails have 3x higher bounce rate',
    description: 'PFL-related compliance mailings are bouncing at 7.4% compared to the 2.4% average for other campaign types.',
    confidence: 'Medium',
    direction: 'up',
    color: C.orange,
    sparkData: [4.8, 5.2, 5.9, 6.4, 6.9, 7.4],
    impact: 'Negative — damaging sender reputation and deliverability',
    recommendation: 'Audit PFL mailing lists immediately. Run hygiene pass and re-verify all PFL-segment addresses before May Wave 1.',
    detailInsight: 'The PFL compliance list has not been cleaned since Q3 2025. Many addresses belong to state regulators and government domains with strict filtering. 220 of the 680 total bounced addresses (32%) are from PFL campaigns alone.',
    metric: 'PFL Bounce Rate',
    metricValue: '7.4%',
  },
  {
    id: 'acu-declining',
    title: 'ACU underwriter engagement declining since Q1',
    description: 'The 40 ACU underwriter accounts (representing $61K+ each in annual dues) show a steady decline in email engagement since January.',
    confidence: 'High',
    direction: 'down',
    color: C.red,
    sparkData: [82, 76, 68, 58, 45, 36],
    impact: 'Critical — $2.46M in aggregate dues at risk from underwriter disengagement',
    recommendation: 'Initiate CEO-level outreach to top 5 ACU accounts. Create dedicated underwriter content track.',
    detailInsight: 'First American Title ($61K) is the most concerning — 75% engagement decay. But the pattern is systemic: 7 of 40 ACU accounts now show >50% decay. The decline correlates with reduced event attendance and a shift to competitor webinar platforms.',
    metric: 'ACU Engagement',
    metricValue: '-46pts',
  },
  {
    id: 'ceo-emails',
    title: 'CEO-signed emails generating 25% more replies',
    description: 'Emails sent from or signed by Chris Morton (CEO) consistently outperform standard sends in reply rate and downstream engagement.',
    confidence: 'High',
    direction: 'up',
    color: C.green,
    sparkData: [18, 20, 22, 23, 24, 25],
    impact: 'Positive — personal touch from leadership dramatically improves responsiveness',
    recommendation: 'Increase CEO-signed touchpoints for high-value accounts. Create a quarterly CEO letter series for all members.',
    detailInsight: 'Across 48 CEO-initiated outreach messages, the reply rate is 88% with 0.5-day average response time. Compare this to the org-wide 34% reply rate. The effect is most pronounced with board members (90% open rate) and ACU underwriters.',
    metric: 'Reply Premium',
    metricValue: '+25%',
  },
  {
    id: 'onboarding-dropoff',
    title: 'New member onboarding sequence losing engagement after Day 14',
    description: 'The 5-email onboarding series shows strong opens for emails 1-3 but a steep drop-off after Day 14.',
    confidence: 'Medium',
    direction: 'down',
    color: C.amber,
    sparkData: [92, 85, 72, 48, 32, 28],
    impact: 'Risk — early disengagement predicts lower first-year retention',
    recommendation: 'Redesign emails 4-5 with more value-driven content. Consider adding an interactive element or event invite at Day 14.',
    detailInsight: 'Email #1 (Welcome): 92% open. Email #2 (Getting Started): 85%. Email #3 (Benefits): 72%. Email #4 (Directory): 48%. Email #5 (Survey): 28%. The Day 14 drop-off point is critical — members who engage with email 4 have 2.3x higher first-year retention.',
    metric: 'Day 14 Drop-off',
    metricValue: '-44pts',
  },
  {
    id: 'revenue-concentration',
    title: 'Revenue attribution concentrated in 2 campaigns (80/20 rule)',
    description: 'The Membership Renewal and ALTA ONE campaigns account for 84% of all tracked campaign revenue while representing only 22% of sends.',
    confidence: 'High',
    direction: 'neutral',
    color: C.blue,
    sparkData: [78, 80, 82, 83, 84, 84],
    impact: 'Strategic — concentration risk but also clear ROI signal',
    recommendation: 'Protect the two cash-cow campaigns with priority resources. Explore revenue attribution for TIPAC and EDge campaigns.',
    detailInsight: 'Renewal campaign: $406,992 (61%). ALTA ONE: $162,000 (24%). TIPAC: $67,500 (10%). All others combined: $36,532 (5%). This 80/20 pattern is stable — it has been within 2% for 4 consecutive months.',
    metric: 'Revenue Concentration',
    metricValue: '84%',
  },
  {
    id: 'spam-trending',
    title: 'Spam complaint rate trending upward 0.02%/month',
    description: 'While still below industry thresholds, the spam complaint rate has been steadily climbing since December.',
    confidence: 'Low',
    direction: 'up',
    color: C.amber,
    sparkData: [0.04, 0.05, 0.06, 0.07, 0.08, 0.10],
    impact: 'Early warning — continued increase will trigger ISP throttling at 0.3%',
    recommendation: 'Investigate complaint sources by segment. Consider adding preference center links and one-click unsubscribe to all campaigns.',
    detailInsight: 'Current rate: 0.10%. Google threshold: 0.30%. At current trajectory (+0.02%/month), we reach the danger zone in 10 months. The increase appears concentrated in the ACA Title Agent segment which receives the highest volume of emails.',
    metric: 'Complaint Rate',
    metricValue: '0.10%',
  },
];

const confidenceConfig: Record<string, { color: string; bg: string }> = {
  High: { color: C.green, bg: `color-mix(in srgb, ${C.green} 15%, transparent)` },
  Medium: { color: C.amber, bg: `color-mix(in srgb, ${C.amber} 15%, transparent)` },
  Low: { color: C.orange, bg: `color-mix(in srgb, ${C.orange} 15%, transparent)` },
};

/* ── radar chart dimensions ──────────────────────────────── */
const radarDimensions = [
  { label: 'Engagement', value: 72 },
  { label: 'Deliverability', value: 85 },
  { label: 'Revenue', value: 68 },
  { label: 'Growth', value: 48 },
  { label: 'Retention', value: 76 },
  { label: 'Reputation', value: 82 },
];

export default function TrendRadar() {
  const [detailTrend, setDetailTrend] = useState<Trend | null>(null);

  const highConf = trends.filter(t => t.confidence === 'High').length;
  const positiveCount = trends.filter(t => t.color === C.green || (t.color === C.blue && t.direction === 'up')).length;
  const negativeCount = trends.filter(t => t.color === C.red).length;

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
            <Radar className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>TrendRadar&#8482;</h1>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>See what&#39;s emerging before everyone else.</p>
      </div>

      {/* ── Summary KPIs ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SparkKpi label="Trends Detected" value={trends.length} icon={Radar} color="var(--accent)" sub="Active pattern signals" accent />
        <SparkKpi label="High Confidence" value={highConf} icon={CheckCircle2} color={C.green} sub="Actionable with certainty" accent />
        <SparkKpi label="Positive Trends" value={positiveCount} icon={TrendingUp} color={C.green} sub="Working in your favor" accent />
        <SparkKpi label="Risk Signals" value={negativeCount} icon={AlertTriangle} color={C.red} sub="Require attention" accent />
      </div>

      {/* ── Radar Chart ──────────────────────────────────────── */}
      <Card title="Trend Strength Radar" subtitle="Performance across 6 key dimensions">
        <ClientChart
          type="radar"
          height={320}
          data={{
            labels: radarDimensions.map(d => d.label),
            datasets: [{
              label: 'Current Performance',
              data: radarDimensions.map(d => d.value),
              backgroundColor: 'rgba(74,144,217,0.15)',
              borderColor: C.blue,
              borderWidth: 2,
              pointBackgroundColor: C.blue,
              pointBorderColor: 'var(--card)',
              pointBorderWidth: 2,
              pointRadius: 5,
            }, {
              label: 'Target',
              data: [85, 95, 85, 70, 85, 90],
              backgroundColor: 'rgba(140,198,63,0.08)',
              borderColor: C.green,
              borderDash: [4, 4],
              borderWidth: 1.5,
              pointBackgroundColor: C.green,
              pointBorderColor: 'var(--card)',
              pointBorderWidth: 1,
              pointRadius: 3,
            }],
          }}
          options={{
            plugins: {
              legend: { display: true, position: 'bottom' as const, labels: { color: 'var(--text-muted)', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 10 } } },
            },
            scales: {
              r: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(255,255,255,0.06)' },
                angleLines: { color: 'rgba(255,255,255,0.06)' },
                pointLabels: { color: 'var(--text-muted)', font: { size: 10, weight: 'bold' as const } },
                ticks: { display: false },
              },
            },
          }}
        />
      </Card>

      {/* ── Trend Cards ──────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Detected Trends</h2>
        {trends.map((t) => {
          const confStyle = confidenceConfig[t.confidence];
          const DirectionIcon = t.direction === 'up' ? ArrowUpRight : t.direction === 'down' ? ArrowDownRight : Minus;

          return (
            <div
              key={t.id}
              className="rounded-xl border p-4 transition-all duration-200 hover:translate-y-[-2px]"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--card-border)',
                borderLeftWidth: '4px',
                borderLeftColor: t.color,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              {/* Top row: title + badges */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <DirectionIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: t.color }} />
                  <h3 className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{t.title}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[8px] uppercase font-bold px-2 py-0.5 rounded-full" style={{ background: confStyle.bg, color: confStyle.color }}>
                    {t.confidence}
                  </span>
                </div>
              </div>

              {/* Description + sparkline */}
              <div className="flex items-end justify-between gap-4 mb-3">
                <p className="text-[10px] flex-1" style={{ color: 'var(--text-muted)' }}>{t.description}</p>
                <div className="flex-shrink-0">
                  <MiniSparkline data={t.sparkData} color={t.color} />
                </div>
              </div>

              {/* Metric + impact */}
              <div className="flex items-center gap-3 mb-3">
                <div className="px-2 py-1 rounded-lg" style={{ background: 'var(--background)' }}>
                  <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{t.metric}: </span>
                  <span className="text-xs font-extrabold" style={{ color: t.color }}>{t.metricValue}</span>
                </div>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.impact}</span>
              </div>

              {/* Recommendation + investigate button */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg" style={{ background: `color-mix(in srgb, ${t.color} 6%, transparent)` }}>
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: t.color }} />
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--heading)' }}>{t.recommendation}</span>
                </div>
                <button
                  onClick={() => setDetailTrend(t)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:scale-105 flex-shrink-0"
                  style={{ background: `color-mix(in srgb, ${t.color} 15%, transparent)`, color: t.color }}
                >
                  <Search className="w-3 h-3" /> Investigate
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Detail Modal ─────────────────────────────────────── */}
      {detailTrend && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setDetailTrend(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: `color-mix(in srgb, ${detailTrend.color} 15%, transparent)` }}>
                  <Radar className="w-4 h-4" style={{ color: detailTrend.color }} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold truncate" style={{ color: 'var(--heading)' }}>Trend Investigation</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Deep analysis</p>
                </div>
              </div>
              <button onClick={() => setDetailTrend(null)} className="p-1.5 rounded-lg flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-6 space-y-4">
              <h4 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{detailTrend.title}</h4>

              {/* Confidence + Direction badges */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full"
                  style={{ background: confidenceConfig[detailTrend.confidence].bg, color: confidenceConfig[detailTrend.confidence].color }}>
                  {detailTrend.confidence} Confidence
                </span>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `color-mix(in srgb, ${detailTrend.color} 15%, transparent)`, color: detailTrend.color }}>
                  {detailTrend.direction === 'up' ? 'Trending Up' : detailTrend.direction === 'down' ? 'Trending Down' : 'Neutral'}
                </span>
              </div>

              {/* Key metric */}
              <div className="p-4 rounded-xl text-center" style={{ background: 'var(--background)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{detailTrend.metric}</div>
                <div className="text-3xl font-extrabold" style={{ color: detailTrend.color }}>{detailTrend.metricValue}</div>
              </div>

              {/* Sparkline */}
              <div className="p-3 rounded-xl" style={{ background: 'var(--background)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>6-Month Trend</div>
                <div className="flex justify-center">
                  <MiniSparkline data={detailTrend.sparkData} color={detailTrend.color} width={200} height={60} />
                </div>
              </div>

              {/* Detailed insight */}
              <div>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Analysis</div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--heading)' }}>{detailTrend.detailInsight}</p>
              </div>

              {/* Impact */}
              <div className="p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${detailTrend.color} 8%, transparent)`, borderLeft: `3px solid ${detailTrend.color}` }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Impact</div>
                <p className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{detailTrend.impact}</p>
              </div>

              {/* Recommendation */}
              <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                <div className="flex items-center gap-1 mb-1">
                  <Lightbulb className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Recommended Action</div>
                </div>
                <p className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{detailTrend.recommendation}</p>
              </div>

              <button
                onClick={() => setDetailTrend(null)}
                className="w-full py-2.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                style={{ background: detailTrend.color, color: '#fff' }}
              >
                Close Investigation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Mini Sparkline helper ───────────────────────────────── */
function MiniSparkline({ data, color, width = 100, height = 32 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 3;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });

  const fillPoints = [...points, `${pad + ((data.length - 1) / (data.length - 1)) * (width - pad * 2)},${height}`, `${pad},${height}`];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`trend-fill-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={fillPoints.join(' ')}
        fill={`url(#trend-fill-${color.replace(/[^a-z0-9]/gi, '')})`}
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {(() => {
        const lastPoint = points[points.length - 1].split(',');
        return <circle cx={lastPoint[0]} cy={lastPoint[1]} r="3" fill={color} />;
      })()}
    </svg>
  );
}
