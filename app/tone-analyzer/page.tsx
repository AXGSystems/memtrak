'use client';

import { useState } from 'react';
import {
  MessageSquare, Sparkles, BarChart3, AlertTriangle, CheckCircle2,
  Zap, Eye, Type, Hash, TrendingUp, X, Search,
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

/* ── Word balance categories ── */
interface WordBalance {
  common: number;
  uncommon: number;
  emotional: number;
  power: number;
}

/* ── Scoring breakdown ── */
interface ScoreBreakdown {
  clarity: number;
  urgency: number;
  emotion: number;
  spamRisk: number;
  readability: number;
  length: number;
}

/* ── Historical subject line data ── */
const historicalLines = [
  { subject: 'Your membership renewal is due — act now', score: 88, openRate: 42.1, tone: 'Urgency', campaign: 'Membership Renewal — April', date: '2026-04-01', breakdown: { clarity: 92, urgency: 95, emotion: 78, spamRisk: 8, readability: 90, length: 85 } },
  { subject: 'ALTA ONE 2026 early bird pricing ends Friday', score: 84, openRate: 38.6, tone: 'Urgency + FOMO', campaign: 'ALTA ONE Early Bird', date: '2026-04-07', breakdown: { clarity: 88, urgency: 90, emotion: 72, spamRisk: 12, readability: 85, length: 80 } },
  { subject: 'Title News Weekly — Closing costs surge in Q1', score: 79, openRate: 35.2, tone: 'Informational', campaign: 'Title News #15', date: '2026-04-11', breakdown: { clarity: 90, urgency: 45, emotion: 65, spamRisk: 5, readability: 88, length: 78 } },
  { subject: 'We miss you — here is what you have been missing', score: 72, openRate: 31.4, tone: 'Emotional', campaign: 'Win-back Q1', date: '2026-03-15', breakdown: { clarity: 70, urgency: 50, emotion: 90, spamRisk: 18, readability: 80, length: 82 } },
  { subject: 'Important: PFL compliance deadline approaching', score: 68, openRate: 29.8, tone: 'Urgency + Compliance', campaign: 'PFL April Wave 3', date: '2026-04-09', breakdown: { clarity: 85, urgency: 80, emotion: 30, spamRisk: 22, readability: 75, length: 70 } },
  { subject: 'Q2 TIPAC pledge drive — your voice matters', score: 82, openRate: 37.1, tone: 'Emotional + Action', campaign: 'TIPAC Q2 Pledge', date: '2026-03-25', breakdown: { clarity: 82, urgency: 60, emotion: 88, spamRisk: 10, readability: 86, length: 76 } },
  { subject: 'New member? Start here for your first 30 days', score: 91, openRate: 44.3, tone: 'Helpful', campaign: 'Welcome Series #1', date: '2026-03-20', breakdown: { clarity: 95, urgency: 55, emotion: 80, spamRisk: 4, readability: 94, length: 88 } },
  { subject: 'State legislation alert: TX & FL updates you need', score: 76, openRate: 33.8, tone: 'Informational + Urgency', campaign: 'Advocacy Alert', date: '2026-03-28', breakdown: { clarity: 80, urgency: 78, emotion: 40, spamRisk: 15, readability: 78, length: 72 } },
  { subject: 'EDge spring cohort — 12 spots remaining', score: 86, openRate: 40.0, tone: 'Scarcity', campaign: 'EDge Spring Invite', date: '2026-03-15', breakdown: { clarity: 88, urgency: 92, emotion: 68, spamRisk: 6, readability: 82, length: 84 } },
  { subject: 'FREE webinar: Navigating wire fraud in 2026', score: 55, openRate: 22.1, tone: 'Spam-adjacent', campaign: 'Webinar Promo', date: '2026-02-18', breakdown: { clarity: 72, urgency: 40, emotion: 35, spamRisk: 55, readability: 70, length: 68 } },
];

/* ── Tone distribution chart data ── */
const toneDistData = {
  labels: ['Urgency', 'Emotional', 'Informational', 'Helpful', 'Scarcity', 'Spam-adjacent'],
  datasets: [{
    data: [28, 22, 20, 15, 10, 5],
    backgroundColor: [C.amber, C.purple, C.blue, C.green, C.navy, C.red],
    borderWidth: 0,
    borderRadius: 4,
  }],
};

/* ── Engagement by tone type ── */
const engagementByTone = {
  labels: ['Emotional', 'Urgency', 'Scarcity', 'Helpful', 'Informational', 'Rational'],
  datasets: [{
    label: 'Avg Open Rate %',
    data: [31, 29, 27, 25, 22, 16],
    backgroundColor: [
      `${C.purple}cc`, `${C.amber}cc`, `${C.navy}cc`,
      `${C.green}cc`, `${C.blue}cc`, `${C.gray}cc`,
    ],
    borderWidth: 0,
    borderRadius: 6,
  }],
};

/* ── Scoring helper (simulated real-time) ── */
function analyzeSubjectLine(text: string): { score: number; breakdown: ScoreBreakdown; wordBalance: WordBalance } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const len = words.length;

  const powerWords = ['free', 'urgent', 'now', 'act', 'limited', 'exclusive', 'deadline', 'last', 'hurry', 'important', 'breaking', 'alert'];
  const emotionalWords = ['love', 'miss', 'matters', 'believe', 'dream', 'hope', 'proud', 'heart', 'together', 'voice', 'care'];
  const spamWords = ['free', 'guaranteed', 'winner', 'click', 'buy', 'discount', 'offer', 'deal', 'cash', 'prize', 'congratulations', '!!!', '???', 'act now'];

  const lower = text.toLowerCase();
  const powerCount = powerWords.filter(w => lower.includes(w)).length;
  const emotionalCount = emotionalWords.filter(w => lower.includes(w)).length;
  const spamCount = spamWords.filter(w => lower.includes(w)).length;
  const uncommonCount = powerCount + emotionalCount;
  const commonCount = Math.max(0, len - uncommonCount);

  const clarity = len === 0 ? 0 : Math.min(100, Math.max(30, 95 - Math.abs(len - 8) * 3));
  const urgency = Math.min(100, powerCount * 25 + (lower.includes('!') ? 15 : 0));
  const emotion = Math.min(100, emotionalCount * 20 + (lower.includes('?') ? 10 : 0));
  const spamRisk = Math.min(100, spamCount * 20 + (text === text.toUpperCase() && len > 2 ? 30 : 0) + ((text.match(/!/g) || []).length > 1 ? 20 : 0));
  const readability = len === 0 ? 0 : Math.min(100, Math.max(20, 100 - (words.filter(w => w.length > 10).length * 15)));
  const lengthScore = len === 0 ? 0 : (len >= 5 && len <= 12) ? 90 : (len >= 3 && len <= 15) ? 70 : 40;

  const score = len === 0 ? 0 : Math.round(
    (clarity * 0.2 + urgency * 0.15 + emotion * 0.15 + (100 - spamRisk) * 0.2 + readability * 0.15 + lengthScore * 0.15)
  );

  return {
    score,
    breakdown: { clarity, urgency, emotion, spamRisk, readability, length: lengthScore },
    wordBalance: {
      common: commonCount,
      uncommon: Math.max(0, uncommonCount - emotionalCount),
      emotional: emotionalCount,
      power: powerCount,
    },
  };
}

/* ── Score breakdown detail modal ── */
function ScoreDetailModal({ line, onClose }: { line: typeof historicalLines[0]; onClose: () => void }) {
  const factors = [
    { label: 'Clarity', value: line.breakdown.clarity, color: line.breakdown.clarity >= 80 ? C.green : C.amber },
    { label: 'Urgency', value: line.breakdown.urgency, color: line.breakdown.urgency >= 60 ? C.blue : C.gray },
    { label: 'Emotion', value: line.breakdown.emotion, color: line.breakdown.emotion >= 60 ? C.purple : C.gray },
    { label: 'Spam Risk', value: line.breakdown.spamRisk, color: line.breakdown.spamRisk <= 15 ? C.green : C.red, invert: true },
    { label: 'Readability', value: line.breakdown.readability, color: line.breakdown.readability >= 75 ? C.green : C.amber },
    { label: 'Length', value: line.breakdown.length, color: line.breakdown.length >= 75 ? C.green : C.amber },
  ];

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
            <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Tone Score Breakdown</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{line.campaign}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
            <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Subject Line</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--heading)' }}>{line.subject}</p>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="text-3xl font-extrabold" style={{ color: line.score >= 80 ? C.green : line.score >= 60 ? C.amber : C.red }}>{line.score}</div>
            <div>
              <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{line.tone}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{line.openRate}% open rate</div>
            </div>
          </div>
          <div className="space-y-2">
            {factors.map(f => (
              <div key={f.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{f.label}</span>
                  <span className="text-[11px] font-extrabold" style={{ color: f.color }}>{f.value}/100</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${f.value}%`, background: f.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${C.blue} 8%, transparent)` }}>
            <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Emotional subject lines average 31% engagement vs 16% for purely rational ones.
              {line.breakdown.spamRisk > 20 && ' This subject line has elevated spam risk due to trigger words.'}
              {line.breakdown.clarity >= 90 && ' Excellent clarity score — the intent is immediately understood.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function ToneAnalyzer() {
  const [inputText, setInputText] = useState('');
  const [selectedLine, setSelectedLine] = useState<typeof historicalLines[0] | null>(null);

  const analysis = analyzeSubjectLine(inputText);
  const hasInput = inputText.trim().length > 0;

  const scoreColor = analysis.score >= 80 ? C.green : analysis.score >= 60 ? C.amber : analysis.score >= 40 ? C.red : C.gray;

  return (
    <div className="p-6 space-y-6">

      {/* ── 1. Branded Header ── */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #9B6DD7, #5B3A8C)',
            boxShadow: '0 4px 20px rgba(155,109,215,0.3)',
          }}
        >
          <MessageSquare className="w-6 h-6" style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            ToneAnalyzer<span className="text-[10px] align-super font-bold" style={{ color: 'var(--text-muted)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Write subject lines that feel right.
          </p>
        </div>
      </div>

      {/* ── 2. SparkKpi Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <SparkKpi
          label="Lines Analyzed"
          value="1,247"
          sub="Across all campaigns this quarter"
          icon={Search}
          color={C.blue}
          sparkData={[180, 210, 195, 240, 220, 260, 280]}
          sparkColor={C.blue}
          trend={{ value: 14.2, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Total subject lines analyzed by ToneAnalyzer across all campaigns, A/B tests, and manual inputs this quarter.
              </p>
              <div className="space-y-2">
                {[
                  { source: 'Campaign subjects', count: 842 },
                  { source: 'A/B test variants', count: 268 },
                  { source: 'Manual inputs', count: 137 },
                ].map(s => (
                  <div key={s.source} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.source}</span>
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Avg Score"
          value="76"
          sub="Composite tone score out of 100"
          icon={Sparkles}
          color={C.green}
          sparkData={[68, 70, 72, 74, 73, 75, 76]}
          sparkColor={C.green}
          trend={{ value: 5.6, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Best Performing Tone"
          value="Emotional"
          sub="31% avg engagement rate"
          icon={TrendingUp}
          color={C.purple}
          sparkData={[24, 26, 28, 27, 30, 29, 31]}
          sparkColor={C.purple}
          trend={{ value: 8.1, label: 'vs rational (16%)' }}
          accent
        />
        <SparkKpi
          label="Spam Risk Flags"
          value="23"
          sub="Subject lines flagged this quarter"
          icon={AlertTriangle}
          color={C.amber}
          sparkData={[8, 6, 5, 7, 4, 3, 2]}
          sparkColor={C.amber}
          trend={{ value: -18.5, label: 'vs last quarter' }}
          accent
        />
      </div>

      {/* ── 3. Real-Time Subject Line Scorer ── */}
      <Card title="Subject Line Scorer" subtitle="Type or paste a subject line for real-time tone analysis">
        <div className="space-y-4">
          {/* Input field */}
          <div className="relative">
            <input
              type="text"
              placeholder="Enter a subject line to analyze..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all"
              style={{
                background: 'var(--input-bg)',
                borderColor: hasInput ? scoreColor : 'var(--card-border)',
                color: 'var(--heading)',
              }}
              maxLength={150}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {inputText.length}/150
            </div>
          </div>

          {/* Score output */}
          {hasInput && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Overall score */}
              <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--card-border)" strokeWidth="2.5" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={scoreColor}
                      strokeWidth="2.5"
                      strokeDasharray={`${analysis.score} ${100 - analysis.score}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-extrabold" style={{ color: scoreColor }}>{analysis.score}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Overall Score</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {analysis.score >= 80 ? 'Excellent — high engagement predicted' : analysis.score >= 60 ? 'Good — room for improvement' : 'Needs work — consider revising'}
                  </div>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="lg:col-span-2 p-4 rounded-xl border space-y-2.5" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                {[
                  { label: 'Clarity', value: analysis.breakdown.clarity, icon: Eye, color: analysis.breakdown.clarity >= 80 ? C.green : C.amber },
                  { label: 'Urgency', value: analysis.breakdown.urgency, icon: Zap, color: analysis.breakdown.urgency >= 40 ? C.blue : C.gray },
                  { label: 'Emotion', value: analysis.breakdown.emotion, icon: Sparkles, color: analysis.breakdown.emotion >= 40 ? C.purple : C.gray },
                  { label: 'Spam Risk', value: analysis.breakdown.spamRisk, icon: AlertTriangle, color: analysis.breakdown.spamRisk <= 15 ? C.green : C.red },
                  { label: 'Readability', value: analysis.breakdown.readability, icon: Type, color: analysis.breakdown.readability >= 75 ? C.green : C.amber },
                  { label: 'Length', value: analysis.breakdown.length, icon: Hash, color: analysis.breakdown.length >= 75 ? C.green : C.amber },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3">
                    <f.icon className="w-3 h-3 flex-shrink-0" style={{ color: f.color }} />
                    <span className="text-[10px] font-bold w-16 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{f.label}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${f.value}%`, background: f.color }} />
                    </div>
                    <span className="text-[10px] font-extrabold w-8 text-right" style={{ color: f.color }}>{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Word balance */}
          {hasInput && (
            <div className="p-4 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
              <p className="text-[9px] uppercase tracking-wider font-bold mb-3" style={{ color: 'var(--text-muted)' }}>Word Balance Analysis</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Common', count: analysis.wordBalance.common, color: C.gray, desc: 'Standard vocabulary' },
                  { label: 'Uncommon', count: analysis.wordBalance.uncommon, color: C.blue, desc: 'Attention-grabbing' },
                  { label: 'Emotional', count: analysis.wordBalance.emotional, color: C.purple, desc: 'Feeling triggers' },
                  { label: 'Power', count: analysis.wordBalance.power, color: C.amber, desc: 'Action drivers' },
                ].map(w => (
                  <div key={w.label} className="text-center p-2 rounded-lg" style={{ background: `color-mix(in srgb, ${w.color} 8%, transparent)` }}>
                    <div className="text-lg font-extrabold" style={{ color: w.color }}>{w.count}</div>
                    <div className="text-[10px] font-bold" style={{ color: w.color }}>{w.label}</div>
                    <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{w.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── 4. Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Engagement by Tone Type" subtitle="Emotional subject lines significantly outperform rational ones">
          <ClientChart
            type="bar"
            data={engagementByTone}
            height={260}
            options={{
              indexAxis: 'y',
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => `${v}%` } },
                y: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 11 } } },
              },
            }}
          />
          <div className="mt-3 p-2.5 rounded-lg" style={{ background: `color-mix(in srgb, ${C.purple} 8%, transparent)` }}>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="font-bold" style={{ color: C.purple }}>Key insight:</span> Emotional subject lines drive 31% engagement vs 16% for rational — nearly 2x the performance.
            </p>
          </div>
        </Card>

        <Card title="Tone Distribution" subtitle="Breakdown of tone types across all analyzed subject lines">
          <ClientChart
            type="doughnut"
            data={toneDistData}
            height={260}
            options={{
              cutout: '65%',
              plugins: {
                legend: { display: true, position: 'bottom', labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 12, font: { size: 10 } } },
              },
            }}
          />
        </Card>
      </div>

      {/* ── 5. Historical Subject Line Performance ── */}
      <Card
        title="Historical Subject Line Performance"
        subtitle="Past campaign subject lines ranked by tone score"
        detailTitle="Full Subject Line Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Complete breakdown of all analyzed subject lines with performance metrics and tone classification.
              Emotional and urgency-driven subject lines consistently outperform informational ones.
            </p>
            {historicalLines.map((line, i) => (
              <div key={i} className="p-3 rounded-lg border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-xs font-semibold leading-snug" style={{ color: 'var(--heading)' }}>{line.subject}</p>
                  <span className="text-sm font-extrabold flex-shrink-0" style={{ color: line.score >= 80 ? C.green : line.score >= 60 ? C.amber : C.red }}>{line.score}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(line.breakdown).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="text-[9px] capitalize" style={{ color: 'var(--text-muted)' }}>{key}:</span>
                      <span className="text-[9px] font-bold" style={{ color: val >= 70 ? C.green : val >= 40 ? C.amber : C.red }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {['Subject Line', 'Score', 'Open Rate', 'Tone', 'Campaign'].map(h => (
                  <th key={h} className="text-[9px] uppercase tracking-wider font-bold pb-3 pr-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historicalLines.sort((a, b) => b.score - a.score).map((line, i) => (
                <tr
                  key={i}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--card-border)' }}
                  onClick={() => setSelectedLine(line)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--input-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="py-2.5 pr-4 text-xs font-medium max-w-[280px] truncate" style={{ color: 'var(--heading)' }}>{line.subject}</td>
                  <td className="py-2.5 pr-4">
                    <span className="text-xs font-extrabold" style={{ color: line.score >= 80 ? C.green : line.score >= 60 ? C.amber : C.red }}>{line.score}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-xs" style={{ color: 'var(--text-muted)' }}>{line.openRate}%</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `color-mix(in srgb, ${line.tone.includes('Emotional') || line.tone.includes('Scarcity') ? C.purple : line.tone.includes('Urgency') ? C.amber : line.tone.includes('Spam') ? C.red : C.blue} 12%, transparent)`,
                        color: line.tone.includes('Emotional') || line.tone.includes('Scarcity') ? C.purple : line.tone.includes('Urgency') ? C.amber : line.tone.includes('Spam') ? C.red : C.blue,
                      }}
                    >
                      {line.tone}
                    </span>
                  </td>
                  <td className="py-2.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>{line.campaign}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Detail Modal ── */}
      {selectedLine && <ScoreDetailModal line={selectedLine} onClose={() => setSelectedLine(null)} />}
    </div>
  );
}
