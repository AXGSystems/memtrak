'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Mail,
  Phone,
  Calendar,
  Headphones,
  AlertTriangle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
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

/* ── Sentiment by channel ───────────────────────────── */
const channels = [
  { name: 'Email Replies', score: 7.8, icon: Mail, color: C.blue, trend: +0.4, count: 1240 },
  { name: 'Phone Calls', score: 6.9, icon: Phone, color: C.orange, trend: -0.3, count: 380 },
  { name: 'Event Feedback', score: 8.1, icon: Calendar, color: C.green, trend: +0.6, count: 520 },
  { name: 'Support Tickets', score: 5.4, icon: Headphones, color: C.red, trend: -0.8, count: 165 },
];

/* ── 6-month trend data ─────────────────────────────── */
const trendMonths = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
const trendScores = [6.8, 6.9, 7.0, 7.1, 7.0, 7.2];

/* ── Word cloud data ────────────────────────────────── */
const positiveWords = [
  { word: 'helpful', weight: 94 },
  { word: 'responsive', weight: 82 },
  { word: 'excellent', weight: 78 },
  { word: 'grateful', weight: 72 },
  { word: 'professional', weight: 68 },
  { word: 'knowledgeable', weight: 61 },
  { word: 'friendly', weight: 55 },
  { word: 'efficient', weight: 49 },
  { word: 'thorough', weight: 42 },
  { word: 'appreciated', weight: 36 },
];

const negativeWords = [
  { word: 'slow', weight: 88 },
  { word: 'confusing', weight: 74 },
  { word: 'expensive', weight: 65 },
  { word: 'automated', weight: 58 },
  { word: 'frustrating', weight: 52 },
  { word: 'complicated', weight: 46 },
  { word: 'unresponsive', weight: 40 },
  { word: 'outdated', weight: 34 },
  { word: 'impersonal', weight: 28 },
  { word: 'unclear', weight: 22 },
];

/* ── Recent sentiment signals ───────────────────────── */
const recentSignals = [
  {
    member: 'First American Title',
    channel: 'Email',
    score: 8.5,
    quote: '"The PFL compliance notice was incredibly clear and saved us hours of research."',
    date: 'Apr 12, 2026',
    sentiment: 'positive' as const,
  },
  {
    member: 'Heritage Abstract LLC',
    channel: 'Support Ticket',
    score: 3.2,
    quote: '"Waited 3 days for a response on my membership renewal question. Very disappointed."',
    date: 'Apr 11, 2026',
    sentiment: 'negative' as const,
  },
  {
    member: 'Liberty Title Group',
    channel: 'Event Feedback',
    score: 9.1,
    quote: '"ALTA ONE 2026 Early Bird session was the best networking event I have attended in years."',
    date: 'Apr 10, 2026',
    sentiment: 'positive' as const,
  },
  {
    member: 'National Title Services',
    channel: 'Phone',
    score: 6.0,
    quote: '"The automated phone system is hard to navigate but once I reached a person, they were great."',
    date: 'Apr 9, 2026',
    sentiment: 'neutral' as const,
  },
  {
    member: 'Commonwealth Land Title',
    channel: 'Email',
    score: 8.8,
    quote: '"Your team went above and beyond helping us with the state legislation alert. Thank you."',
    date: 'Apr 8, 2026',
    sentiment: 'positive' as const,
  },
];

/* ── Recommendations ────────────────────────────────── */
const recommendations = [
  {
    priority: 'High',
    color: C.red,
    title: 'Support ticket sentiment declining',
    desc: 'Average response time has increased to 2.8 days. Investigate staffing and triage processes to bring sentiment back above 6.0.',
  },
  {
    priority: 'Medium',
    color: C.orange,
    title: 'Phone call sentiment dipping',
    desc: 'Members cite automated menus as friction. Consider adding a direct-dial option for ACU underwriters.',
  },
  {
    priority: 'Low',
    color: C.blue,
    title: 'Leverage event momentum',
    desc: 'Event feedback is at an all-time high (8.1). Send post-event follow-ups within 48 hours to capitalize on positive sentiment.',
  },
];

/* ── Pulsing Meter Component ────────────────────────── */
function PulsingMeter({ score, max = 10 }: { score: number; max?: number }) {
  const [pulseOpacity, setPulseOpacity] = useState(0.4);

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(() => {
      if (!mounted) return;
      setPulseOpacity((prev) => (prev === 0.4 ? 0.8 : 0.4));
    }, 1500);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const pct = (score / max) * 100;
  const color = score >= 7 ? C.green : score >= 5 ? C.orange : C.red;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-1000"
          style={{
            background: color,
            opacity: pulseOpacity * 0.15,
            transform: 'scale(1.3)',
            filter: 'blur(20px)',
          }}
        />
        <ProgressRing value={pct} max={100} color={color} size={120} />
      </div>
      <div className="text-center">
        <div className="text-3xl font-extrabold" style={{ color: 'var(--heading)' }}>
          {score}<span className="text-lg" style={{ color: 'var(--text-muted)' }}>/{max}</span>
        </div>
        <div className="text-[10px] font-semibold" style={{ color }}>
          {score >= 8 ? 'Excellent' : score >= 7 ? 'Good' : score >= 5 ? 'Needs Attention' : 'Critical'}
        </div>
      </div>
    </div>
  );
}

export default function SentimentPulse() {
  const [selectedSignal, setSelectedSignal] = useState<typeof recentSignals[0] | null>(null);

  const overallSentiment = 7.2;
  const positivePct = 68;
  const negativePct = 14;

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(140,198,63,0.2) 0%, rgba(74,144,217,0.2) 100%)',
              border: '1px solid rgba(140,198,63,0.3)',
            }}
          >
            <Heart className="w-5 h-5" style={{ color: C.green }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              SentimentPulse<span style={{ color: C.green, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.blue }}>
              Feel the mood of your membership.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Real-time member communication sentiment analysis across every channel. Understand how members
          feel about ALTA&apos;s services, identify friction points, and act on trends before they become problems.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SparkKpi
          label="Overall Sentiment"
          value="7.2 / 10"
          sub="Across all channels"
          icon={Heart}
          color={C.green}
          sparkData={[6.8, 6.9, 7.0, 7.1, 7.0, 7.2]}
          sparkColor={C.green}
          trend={{ value: 5.9, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Positive %"
          value={`${positivePct}%`}
          sub="Of all interactions"
          icon={ThumbsUp}
          color={C.blue}
          sparkData={[62, 63, 65, 66, 67, 68]}
          sparkColor={C.blue}
          trend={{ value: 3.0, label: 'vs last month' }}
          accent
        />
        <SparkKpi
          label="Negative %"
          value={`${negativePct}%`}
          sub="Needs attention"
          icon={ThumbsDown}
          color={C.red}
          sparkData={[18, 17, 16, 16, 15, 14]}
          sparkColor={C.red}
          trend={{ value: 6.7, label: 'improving' }}
          accent
        />
        <SparkKpi
          label="Trend Direction"
          value="Improving"
          sub="+0.4 pts over 6 months"
          icon={TrendingUp}
          color={C.teal}
          sparkData={[6.8, 6.9, 7.0, 7.1, 7.0, 7.2]}
          sparkColor={C.teal}
          trend={{ value: 5.9, label: 'steady climb' }}
          accent
        />
      </div>

      {/* ── 3. Overall Score + Channel Breakdown ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card title="Overall Sentiment Score" subtitle="Weighted across all channels">
          <div className="flex justify-center py-4">
            <PulsingMeter score={overallSentiment} />
          </div>
        </Card>

        <Card title="Sentiment by Channel" subtitle="Scores by communication type" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            {channels.map((ch) => (
              <div
                key={ch.name}
                className="rounded-xl border p-4 transition-all hover:translate-y-[-1px]"
                style={{
                  background: 'var(--input-bg)',
                  borderColor: 'var(--card-border)',
                  borderLeftWidth: '3px',
                  borderLeftColor: ch.color,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <ch.icon className="w-4 h-4" style={{ color: ch.color }} />
                  <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{ch.name}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-extrabold" style={{ color: ch.color }}>
                      {ch.score}
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/10</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {ch.trend > 0 ? (
                        <TrendingUp className="w-3 h-3" style={{ color: C.green }} />
                      ) : (
                        <TrendingDown className="w-3 h-3" style={{ color: C.red }} />
                      )}
                      <span
                        className="text-[10px] font-bold"
                        style={{ color: ch.trend > 0 ? C.green : C.red }}
                      >
                        {ch.trend > 0 ? '+' : ''}{ch.trend}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{ch.count}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>interactions</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 4. Sentiment Trend Chart ──────────────────────────── */}
      <Card
        title="Sentiment Trend"
        subtitle="6-month overall sentiment score trajectory"
        className="mb-8"
        detailTitle="Sentiment Trend Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Overall sentiment has risen steadily from 6.8 to 7.2 over six months, driven primarily
              by improvements in email reply tone and event feedback. The slight dip in March (7.0)
              correlated with delayed support ticket responses during the PFL compliance push.
            </p>
            <div className="space-y-2">
              {trendMonths.map((m, i) => (
                <div
                  key={m}
                  className="flex items-center justify-between p-2 rounded-lg text-xs"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <span style={{ color: 'var(--heading)' }}>{m} 2026</span>
                  <span className="font-bold" style={{ color: trendScores[i] >= 7 ? C.green : C.orange }}>
                    {trendScores[i]} / 10
                  </span>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <ClientChart
          type="line"
          height={260}
          data={{
            labels: trendMonths,
            datasets: [
              {
                label: 'Sentiment Score',
                data: trendScores,
                borderColor: C.green,
                backgroundColor: C.green + '15',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: C.green,
                pointBorderColor: 'var(--card)',
                pointBorderWidth: 2,
                pointHoverRadius: 7,
              },
            ],
          }}
          options={{
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx: { raw: number }) => `Sentiment: ${ctx.raw}/10`,
                },
              },
            },
            scales: {
              y: {
                min: 5,
                max: 10,
                grid: { color: '#1e3350' },
                ticks: {
                  color: '#8899aa',
                  callback: (v: number | string) => v + '/10',
                  stepSize: 1,
                },
                title: { display: true, text: 'Sentiment Score', color: '#8899aa', font: { size: 10 } },
              },
              x: { grid: { display: false }, ticks: { color: '#8899aa' } },
            },
          }}
        />
      </Card>

      {/* ── 5. Word Cloud Effect ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Positive Keywords" subtitle="Most common positive sentiment words">
          <div className="flex flex-wrap gap-2 items-center justify-center py-2">
            {positiveWords.map((w) => {
              const fontSize = 10 + (w.weight / 100) * 18;
              const opacity = 0.5 + (w.weight / 100) * 0.5;
              return (
                <span
                  key={w.word}
                  className="font-bold transition-all hover:scale-110 cursor-default"
                  style={{
                    fontSize: `${fontSize}px`,
                    color: C.green,
                    opacity,
                  }}
                >
                  {w.word}
                </span>
              );
            })}
          </div>
        </Card>

        <Card title="Negative Keywords" subtitle="Most common negative sentiment words">
          <div className="flex flex-wrap gap-2 items-center justify-center py-2">
            {negativeWords.map((w) => {
              const fontSize = 10 + (w.weight / 100) * 18;
              const opacity = 0.5 + (w.weight / 100) * 0.5;
              return (
                <span
                  key={w.word}
                  className="font-bold transition-all hover:scale-110 cursor-default"
                  style={{
                    fontSize: `${fontSize}px`,
                    color: C.red,
                    opacity,
                  }}
                >
                  {w.word}
                </span>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── 6. Recent Sentiment Signals ───────────────────────── */}
      <Card
        title="Recent Sentiment Signals"
        subtitle="Latest member interactions with sentiment analysis"
        className="mb-8"
      >
        <div className="space-y-3">
          {recentSignals.map((signal) => {
            const sentimentColor =
              signal.sentiment === 'positive' ? C.green : signal.sentiment === 'negative' ? C.red : C.orange;
            const sentimentBg =
              signal.sentiment === 'positive'
                ? 'rgba(140,198,63,0.1)'
                : signal.sentiment === 'negative'
                  ? 'rgba(217,74,74,0.1)'
                  : 'rgba(232,146,63,0.1)';

            return (
              <div
                key={signal.member + signal.date}
                className="rounded-xl border p-4 transition-all hover:translate-y-[-1px] cursor-pointer"
                style={{
                  background: 'var(--input-bg)',
                  borderColor: 'var(--card-border)',
                  borderLeftWidth: '3px',
                  borderLeftColor: sentimentColor,
                }}
                onClick={() => setSelectedSignal(signal)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>
                        {signal.member}
                      </span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--card)', color: 'var(--text-muted)' }}
                      >
                        {signal.channel}
                      </span>
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{ background: sentimentBg, color: sentimentColor }}
                      >
                        {signal.sentiment}
                      </span>
                    </div>
                    <p
                      className="text-[10px] italic leading-relaxed"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {signal.quote}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-extrabold" style={{ color: sentimentColor }}>
                      {signal.score}
                    </div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{signal.date}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Signal detail modal ───────────────────────────────── */}
      {selectedSignal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedSignal(null)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md"
              style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}
            >
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Sentiment Signal Detail</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedSignal.member}</p>
              </div>
              <button
                onClick={() => setSelectedSignal(null)}
                className="p-1.5 rounded-lg"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="text-4xl font-extrabold"
                  style={{
                    color:
                      selectedSignal.sentiment === 'positive'
                        ? C.green
                        : selectedSignal.sentiment === 'negative'
                          ? C.red
                          : C.orange,
                  }}
                >
                  {selectedSignal.score}
                </div>
                <div>
                  <div className="text-xs font-bold capitalize" style={{ color: 'var(--heading)' }}>
                    {selectedSignal.sentiment} Sentiment
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    via {selectedSignal.channel} on {selectedSignal.date}
                  </div>
                </div>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                  Member Quote
                </div>
                <p className="text-xs italic leading-relaxed" style={{ color: 'var(--heading)' }}>
                  {selectedSignal.quote}
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                  Analysis
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {selectedSignal.sentiment === 'positive'
                    ? 'This interaction reflects strong satisfaction. Consider using this feedback in testimonials and case studies.'
                    : selectedSignal.sentiment === 'negative'
                      ? 'This interaction signals dissatisfaction. Prioritize follow-up outreach and investigate the root cause.'
                      : 'This interaction has mixed signals. The member appreciates staff quality but is frustrated by process barriers.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Recommendations ────────────────────────────────── */}
      <Card title="Recommendations" subtitle="AI-generated action items from sentiment analysis">
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div
              key={rec.title}
              className="rounded-xl border p-4"
              style={{
                background: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                borderLeftWidth: '3px',
                borderLeftColor: rec.color,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                  style={{
                    background: `${rec.color}15`,
                    border: `1px solid ${rec.color}30`,
                  }}
                >
                  <Lightbulb className="w-3.5 h-3.5" style={{ color: rec.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>
                      {rec.title}
                    </span>
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${rec.color}15`, color: rec.color }}
                    >
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {rec.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer badge */}
      <div className="text-center py-4 mt-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(140,198,63,0.08)',
            color: C.green,
            border: '1px solid rgba(140,198,63,0.15)',
          }}
        >
          <Heart className="w-3 h-3" />
          SentimentPulse&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
