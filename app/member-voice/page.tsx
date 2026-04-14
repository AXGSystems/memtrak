'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Mail,
  Quote,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Star,
  Users,
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

/* ── NPS data ────────────────────────────────────────── */
const npsQuarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
const npsScores = [55, 62, 68, 72];
const npsCategories = [
  { label: 'Promoters', pct: 52, color: C.green },
  { label: 'Passives', pct: 28, color: C.amber },
  { label: 'Detractors', pct: 20, color: C.red },
];

/* ── Feedback themes ─────────────────────────────────── */
const positiveThemes = [
  {
    theme: 'Event Quality',
    count: 342,
    score: 8.9,
    trend: +0.4,
    quote: '"ALTA ONE sessions were more practical and actionable than any conference I have attended."',
  },
  {
    theme: 'Staff Responsiveness',
    count: 289,
    score: 8.2,
    trend: +0.6,
    quote: '"Called with a question and had an answer within 2 hours. That level of service is rare."',
  },
  {
    theme: 'PFL Resources',
    count: 215,
    score: 7.8,
    trend: +0.3,
    quote: '"The PFL compliance toolkit saved our firm thousands in legal research costs."',
  },
  {
    theme: 'Advocacy Impact',
    count: 178,
    score: 7.5,
    trend: +0.2,
    quote: '"Seeing ALTA actively fight for our industry in DC gives me confidence in my membership."',
  },
  {
    theme: 'Networking',
    count: 156,
    score: 7.3,
    trend: +0.5,
    quote: '"Connected with three new business partners at the spring cohort event alone."',
  },
];

const negativeThemes = [
  {
    theme: 'Support Response Time',
    count: 98,
    score: 4.2,
    trend: -0.8,
    quote: '"Waited over 3 days for a simple membership renewal question. Unacceptable."',
  },
  {
    theme: 'Website Navigation',
    count: 82,
    score: 4.8,
    trend: -0.3,
    quote: '"I cannot find what I need on the site. The search function returns irrelevant results."',
  },
  {
    theme: 'Communication Overload',
    count: 67,
    score: 5.1,
    trend: -0.5,
    quote: '"I receive too many emails. It is hard to know which ones are actually important."',
  },
  {
    theme: 'Pricing Transparency',
    count: 54,
    score: 5.4,
    trend: -0.2,
    quote: '"The tiered dues structure is confusing. A clearer breakdown would be appreciated."',
  },
  {
    theme: 'Regional Event Access',
    count: 41,
    score: 5.6,
    trend: -0.1,
    quote: '"All the good events are on the coasts. Midwest members feel left out."',
  },
];

/* ── Reply rate by campaign type ─────────────────────── */
const replyRates = [
  { type: 'Renewal Notices', replies: 156, sent: 398, rate: 39.2, color: C.green },
  { type: 'CEO Personal', replies: 42, sent: 48, rate: 87.5, color: C.blue },
  { type: 'Event Invites', replies: 245, sent: 6494, rate: 3.8, color: C.purple },
  { type: 'Compliance Alerts', replies: 89, sent: 3200, rate: 2.8, color: C.orange },
  { type: 'Newsletters', replies: 34, sent: 4650, rate: 0.7, color: C.amber },
  { type: 'Advocacy Alerts', replies: 118, sent: 2100, rate: 5.6, color: C.teal },
];

/* ── Testimonials ────────────────────────────────────── */
const testimonials = [
  {
    name: 'Sarah Mitchell',
    title: 'VP, First American Title',
    type: 'ACU',
    quote: 'ALTA has been an indispensable partner for our compliance team. The PFL resources alone have saved us hundreds of hours.',
    sentiment: 'positive' as const,
    rating: 5,
  },
  {
    name: 'James Richardson',
    title: 'Owner, Liberty Title Group',
    type: 'ACA',
    quote: 'The networking opportunities at ALTA ONE were game-changing. We have closed three new partnerships since attending.',
    sentiment: 'positive' as const,
    rating: 5,
  },
  {
    name: 'Maria Gonzalez',
    title: 'Director, National Title Services',
    type: 'REA',
    quote: 'The advocacy work ALTA does in DC is the primary reason we maintain our membership. Someone needs to fight for our industry.',
    sentiment: 'positive' as const,
    rating: 4,
  },
  {
    name: 'David Thompson',
    title: 'President, Heritage Abstract LLC',
    type: 'ACB',
    quote: 'The membership value is there, but communication could be better. I sometimes feel out of the loop on important changes. Faster responses would go a long way.',
    sentiment: 'constructive' as const,
    rating: 3,
  },
];

/* ── Action items ────────────────────────────────────── */
const actionItems = [
  {
    priority: 'High',
    color: C.red,
    title: 'Reduce support ticket response time to under 24 hours',
    desc: 'Current average is 2.8 days. Hire additional support staff or implement tiered triage system. Support sentiment (5.4) is dragging overall scores down.',
    status: 'Open',
  },
  {
    priority: 'Medium',
    color: C.orange,
    title: 'Launch email preference center to combat communication fatigue',
    desc: '67 members cited communication overload. Allow members to select topics and frequency preferences to reduce unsubscribes and improve engagement.',
    status: 'Open',
  },
  {
    priority: 'Medium',
    color: C.blue,
    title: 'Add 3 regional events in Midwest for 2026-2027',
    desc: '41 members feel underserved geographically. Partner with state affiliates in IL, OH, and MN for co-hosted regional events.',
    status: 'Open',
  },
];

export default function MemberVoice() {
  const [selectedTestimonial, setSelectedTestimonial] = useState<typeof testimonials[0] | null>(null);

  const currentNps = npsScores[npsScores.length - 1];
  const repliesThisMonth = replyRates.reduce((s, r) => s + r.replies, 0);
  const positiveSentPct = 74;

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(74,144,217,0.2) 0%, rgba(20,184,166,0.2) 100%)',
              border: '1px solid rgba(74,144,217,0.3)',
            }}
          >
            <MessageCircle className="w-5 h-5" style={{ color: C.blue }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              MemberVoice<span style={{ color: C.blue, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.teal }}>
              Listen to what members are actually saying.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Aggregated member feedback and communication analysis across all touchpoints. Track NPS trends,
          identify recurring themes, surface testimonials, and generate actionable improvements from
          real member voices.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SparkKpi
          label="NPS Score"
          value={currentNps}
          sub="Net Promoter Score"
          icon={BarChart3}
          color={C.green}
          sparkData={npsScores}
          sparkColor={C.green}
          trend={{ value: 5.9, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Replies This Month"
          value={repliesThisMonth.toLocaleString()}
          sub="Across all campaigns"
          icon={Mail}
          color={C.blue}
          sparkData={[520, 560, 610, 640, 660, 684]}
          sparkColor={C.blue}
          trend={{ value: 8.4, label: 'vs last month' }}
          accent
        />
        <SparkKpi
          label="Positive Sentiment %"
          value={`${positiveSentPct}%`}
          sub="Of all feedback"
          icon={ThumbsUp}
          color={C.teal}
          sparkData={[68, 69, 71, 72, 73, 74]}
          sparkColor={C.teal}
          trend={{ value: 2.8, label: 'improving' }}
          accent
        />
        <SparkKpi
          label="Action Items Open"
          value={actionItems.length}
          sub="From feedback analysis"
          icon={AlertCircle}
          color={C.orange}
          sparkData={[6, 5, 5, 4, 4, 3]}
          sparkColor={C.orange}
          trend={{ value: 25, label: 'resolved this quarter' }}
          accent
        />
      </div>

      {/* ── 3. NPS Trend Chart ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card
          title="NPS Trend"
          subtitle="Net Promoter Score over 4 quarters"
          className="lg:col-span-2"
          detailTitle="NPS Analysis"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                NPS has climbed 17 points over the past year, from 55 to 72. The biggest jump (55 to 62)
                came after launching the new event format. The most recent improvement (68 to 72) correlates
                with faster staff response times and the PFL compliance toolkit.
              </p>
              <div className="space-y-2">
                {npsQuarters.map((q, i) => (
                  <div
                    key={q}
                    className="flex items-center justify-between p-2 rounded-lg text-xs"
                    style={{ background: 'var(--input-bg)' }}
                  >
                    <span style={{ color: 'var(--heading)' }}>{q}</span>
                    <span className="font-bold" style={{ color: npsScores[i] >= 70 ? C.green : npsScores[i] >= 60 ? C.blue : C.orange }}>
                      {npsScores[i]}
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
              labels: npsQuarters,
              datasets: [
                {
                  label: 'NPS Score',
                  data: npsScores,
                  borderColor: C.green,
                  backgroundColor: C.green + '15',
                  fill: true,
                  tension: 0.4,
                  borderWidth: 3,
                  pointRadius: 6,
                  pointBackgroundColor: C.green,
                  pointBorderColor: 'var(--card)',
                  pointBorderWidth: 3,
                  pointHoverRadius: 8,
                },
              ],
            }}
            options={{
              plugins: {
                legend: { display: false },
                datalabels: {
                  display: true,
                  anchor: 'end' as const,
                  align: 'top' as const,
                  color: '#e2e8f0',
                  font: { weight: 'bold' as const, size: 13 },
                },
                tooltip: {
                  callbacks: {
                    label: (ctx: { raw: number }) => `NPS: ${ctx.raw}`,
                  },
                },
              },
              scales: {
                y: {
                  min: 40,
                  max: 85,
                  grid: { color: '#1e3350' },
                  ticks: { color: '#8899aa', stepSize: 10 },
                  title: { display: true, text: 'NPS Score', color: '#8899aa', font: { size: 10 } },
                },
                x: { grid: { display: false }, ticks: { color: '#8899aa' } },
              },
            }}
          />
        </Card>

        <Card title="NPS Breakdown" subtitle="Current quarter distribution">
          <div className="space-y-4 py-2">
            {npsCategories.map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{cat.label}</span>
                  <span className="text-sm font-extrabold" style={{ color: cat.color }}>{cat.pct}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.pct}%`, background: cat.color, boxShadow: `0 0 8px ${cat.color}40` }}
                  />
                </div>
              </div>
            ))}
            <div className="rounded-lg p-3 mt-2" style={{ background: 'rgba(140,198,63,0.06)' }}>
              <div className="text-center">
                <div className="text-2xl font-extrabold" style={{ color: C.green }}>{currentNps}</div>
                <div className="text-[9px] font-bold" style={{ color: C.green }}>Excellent</div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Industry avg: 45</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 4. Feedback Themes ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card
          title="Top Positive Themes"
          subtitle="What members love most"
          detailTitle="Positive Feedback Themes"
          detailContent={
            <div className="space-y-3">
              {positiveThemes.map((t) => (
                <div key={t.theme} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{t.theme}</span>
                    <span className="text-xs font-bold" style={{ color: C.green }}>{t.score}/10</span>
                  </div>
                  <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>{t.quote}</p>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-3">
            {positiveThemes.map((theme) => (
              <div
                key={theme.theme}
                className="rounded-lg border p-3 transition-all hover:translate-y-[-1px]"
                style={{
                  background: 'var(--input-bg)',
                  borderColor: 'var(--card-border)',
                  borderLeftWidth: '3px',
                  borderLeftColor: C.green,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-3 h-3" style={{ color: C.green }} />
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{theme.theme}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold" style={{ color: C.green }}>
                      {theme.score}/10
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(140,198,63,0.12)', color: C.green }}
                    >
                      {theme.count} mentions
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" style={{ color: C.green }} />
                  <span className="text-[9px]" style={{ color: C.green }}>+{theme.trend} this quarter</span>
                </div>
                <p className="text-[10px] italic mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {theme.quote}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Top Negative Themes"
          subtitle="Where members see room for improvement"
          detailTitle="Negative Feedback Themes"
          detailContent={
            <div className="space-y-3">
              {negativeThemes.map((t) => (
                <div key={t.theme} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{t.theme}</span>
                    <span className="text-xs font-bold" style={{ color: C.red }}>{t.score}/10</span>
                  </div>
                  <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>{t.quote}</p>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-3">
            {negativeThemes.map((theme) => (
              <div
                key={theme.theme}
                className="rounded-lg border p-3 transition-all hover:translate-y-[-1px]"
                style={{
                  background: 'var(--input-bg)',
                  borderColor: 'var(--card-border)',
                  borderLeftWidth: '3px',
                  borderLeftColor: C.red,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="w-3 h-3" style={{ color: C.red }} />
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{theme.theme}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold" style={{ color: C.red }}>
                      {theme.score}/10
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(217,74,74,0.12)', color: C.red }}
                    >
                      {theme.count} mentions
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="w-3 h-3" style={{ color: C.red }} />
                  <span className="text-[9px]" style={{ color: C.red }}>{theme.trend} this quarter</span>
                </div>
                <p className="text-[10px] italic mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {theme.quote}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 5. Reply Rate by Campaign Type ────────────────────── */}
      <Card
        title="Reply Rate by Campaign Type"
        subtitle="Which campaigns generate the most member replies"
        className="mb-8"
        detailTitle="Reply Rate Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              CEO personal outreach has the highest reply rate (87.5%) but lowest volume. Renewal notices
              drive the most actionable replies. Newsletters have the lowest reply rate — consider adding
              reply prompts or feedback links.
            </p>
            {replyRates.map((r) => (
              <div
                key={r.type}
                className="flex items-center justify-between p-2 rounded-lg text-xs"
                style={{ background: 'var(--input-bg)' }}
              >
                <span style={{ color: 'var(--heading)' }}>{r.type}</span>
                <div className="flex items-center gap-3 text-[10px]">
                  <span style={{ color: 'var(--text-muted)' }}>{r.replies}/{r.sent} sent</span>
                  <span className="font-bold" style={{ color: r.color }}>{r.rate}%</span>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <ClientChart
          type="bar"
          height={260}
          data={{
            labels: replyRates.map((r) => r.type),
            datasets: [
              {
                label: 'Reply Rate',
                data: replyRates.map((r) => r.rate),
                backgroundColor: replyRates.map((r) => r.color + '70'),
                borderColor: replyRates.map((r) => r.color),
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
                formatter: (v: number) => v.toFixed(1) + '%',
              },
              tooltip: {
                callbacks: {
                  label: (ctx: { raw: number; label: string }) => {
                    const r = replyRates.find((rr) => rr.type === ctx.label);
                    return `${ctx.raw.toFixed(1)}% (${r?.replies || 0} replies)`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#1e3350' },
                ticks: {
                  color: '#8899aa',
                  callback: (v: number | string) => v + '%',
                },
                title: { display: true, text: 'Reply Rate', color: '#8899aa', font: { size: 10 } },
              },
              x: {
                grid: { display: false },
                ticks: { color: '#8899aa', font: { size: 9 } },
              },
            },
          }}
        />
      </Card>

      {/* ── 6. Member Testimonials ────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Quote className="w-4 h-4" style={{ color: C.blue }} />
          <h2 className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>
            Member Testimonials
          </h2>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(74,144,217,0.15)', color: C.blue }}
          >
            {testimonials.length} featured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((t) => {
            const isConstructive = t.sentiment === 'constructive';
            const accentColor = isConstructive ? C.orange : C.green;
            return (
              <div
                key={t.name}
                className="rounded-xl border p-5 transition-all hover:translate-y-[-2px] cursor-pointer"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--card-border)',
                  borderTopWidth: '3px',
                  borderTopColor: accentColor,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}
                onClick={() => setSelectedTestimonial(t)}
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3 h-3"
                      style={{
                        color: i < t.rating ? C.amber : 'var(--card-border)',
                        fill: i < t.rating ? C.amber : 'none',
                      }}
                    />
                  ))}
                </div>
                <p className="text-[11px] italic leading-relaxed mb-3" style={{ color: 'var(--heading)' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{t.name}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{t.title}</div>
                  </div>
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded capitalize"
                    style={{
                      background: isConstructive ? 'rgba(232,146,63,0.12)' : 'rgba(140,198,63,0.12)',
                      color: accentColor,
                    }}
                  >
                    {t.sentiment}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Testimonial detail modal ──────────────────────────── */}
      {selectedTestimonial && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelectedTestimonial(null)}
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
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Member Testimonial</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedTestimonial.name}</p>
              </div>
              <button
                onClick={() => setSelectedTestimonial(null)}
                className="p-1.5 rounded-lg"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4"
                    style={{
                      color: i < selectedTestimonial.rating ? C.amber : 'var(--card-border)',
                      fill: i < selectedTestimonial.rating ? C.amber : 'none',
                    }}
                  />
                ))}
              </div>
              <p className="text-sm italic leading-relaxed" style={{ color: 'var(--heading)' }}>
                &ldquo;{selectedTestimonial.quote}&rdquo;
              </p>
              <div className="rounded-lg p-4" style={{ background: 'var(--input-bg)' }}>
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{selectedTestimonial.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedTestimonial.title}</div>
                <div className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>Membership type: {selectedTestimonial.type}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Action Items ───────────────────────────────────── */}
      <Card title="Action Items from Feedback" subtitle="AI-generated recommendations from member feedback analysis">
        <div className="space-y-3">
          {actionItems.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border p-4"
              style={{
                background: 'var(--input-bg)',
                borderColor: 'var(--card-border)',
                borderLeftWidth: '3px',
                borderLeftColor: item.color,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                >
                  <Lightbulb className="w-3.5 h-3.5" style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>
                      {item.title}
                    </span>
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${item.color}15`, color: item.color }}
                    >
                      {item.priority}
                    </span>
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(232,146,63,0.12)', color: C.orange }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {item.desc}
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
            background: 'rgba(74,144,217,0.08)',
            color: C.blue,
            border: '1px solid rgba(74,144,217,0.15)',
          }}
        >
          <MessageCircle className="w-3 h-3" />
          MemberVoice&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
