'use client';

import { useState, useEffect, useRef } from 'react';
import SparkKpi, { MiniBar, StatusPill } from '@/components/SparkKpi';
import PageGuide, { type GuideContent } from '@/components/PageGuide';
import Card from '@/components/Card';
import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import Typewriter from '@/components/Typewriter';
import PulsingMeter from '@/components/PulsingMeter';
import CountdownClock from '@/components/CountdownClock';
import AnimatedCounter from '@/components/AnimatedCounter';
import {
  demoCampaigns, demoMonthly, demoDecayAlerts, demoChurnScores,
  demoSendTimes, demoHygiene, getCampaignTotals,
} from '@/lib/demo-data';
import { exportCSV } from '@/lib/export-utils';
import { memtrakPrint } from '@/lib/print';
import {
  Send, Eye, MousePointerClick, TrendingDown, TrendingUp,
  AlertTriangle, Download, DollarSign, Users, Clock, Zap,
  ArrowRight, Shield, Activity, Workflow, BarChart3, Target,
  Mail, Printer, ChevronRight, Sparkles, Heart, Radio,
  PenLine, Rocket, Bell, FileText,
} from 'lucide-react';

/* ── colour constants ────────────────────────────────────── */
const C = {
  navy: '#002D5C',
  blue: '#4A90D9',
  green: '#8CC63F',
  red: '#D94A4A',
  orange: '#E8923F',
  purple: '#a855f7',
};

/* ── computed data ───────────────────────────────────────── */
const totals    = getCampaignTotals();
const openRate  = ((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1);
const clickRate = ((totals.totalClicked / totals.totalDelivered) * 100).toFixed(1);
const bounceRate = ((totals.totalBounced / totals.totalSent) * 100).toFixed(1);
const sentCampaigns = demoCampaigns.filter(c => c.status === 'Sent');

/* monthly trend helpers */
const mSent    = demoMonthly.map(m => m.sent);
const mOpened  = demoMonthly.map(m => m.opened);
const mClicked = demoMonthly.map(m => m.clicked);
const mBounced = demoMonthly.map(m => m.bounced);
const mDeliv   = demoMonthly.map(m => m.delivered);
const mOpenRates = demoMonthly.map(m => +((m.opened / m.delivered) * 100).toFixed(1));
const avgOpenRate = (mOpenRates.reduce((a, b) => a + b, 0) / mOpenRates.length).toFixed(1);
const bestMonth  = demoMonthly.reduce((a, b) => (b.opened / b.delivered > a.opened / a.delivered ? b : a));
const worstMonth = demoMonthly.reduce((a, b) => (b.opened / b.delivered < a.opened / a.delivered ? b : a));
const totalMonthlyRevenue = totals.totalRevenue;

/* prev-month delta helper */
function delta(arr: number[]): number {
  if (arr.length < 2) return 0;
  const prev = arr[arr.length - 2];
  const curr = arr[arr.length - 1];
  if (prev === 0) return 0;
  return +((curr - prev) / prev * 100).toFixed(1);
}

/* source distribution */
const sourceCounts: Record<string, number> = {};
sentCampaigns.forEach(c => { sourceCounts[c.source] = (sourceCounts[c.source] || 0) + c.listSize; });

/* funnel data */
const funnelSteps = [
  { label: 'Sent',      value: totals.totalSent,      color: C.blue },
  { label: 'Delivered',  value: totals.totalDelivered,  color: C.blue },
  { label: 'Opened',     value: totals.totalOpened,     color: C.green },
  { label: 'Clicked',    value: totals.totalClicked,    color: C.green },
  { label: 'Converted',  value: sentCampaigns.filter(c => c.revenue > 0).length, color: C.purple },
];

/* member health tiers */
const healthTiers = [
  { label: 'Champions',   count: 1240, pct: 24, revenue: 892000, color: C.green },
  { label: 'Engaged',     count: 1680, pct: 33, revenue: 445000, color: C.blue },
  { label: 'At Risk',     count: 890,  pct: 17, revenue: 234000, color: C.orange },
  { label: 'Disengaged',  count: 820,  pct: 16, revenue: 156000, color: C.red },
  { label: 'Gone Dark',   count: 520,  pct: 10, revenue: 89000,  color: '#64748b' },
];

/* meter color helper */
function meterColor(v: number): string {
  if (v >= 80) return C.green;
  if (v >= 50) return C.orange;
  return C.red;
}

/* date for greeting */
const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const hour = new Date().getHours();
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

/* days until next campaign */
const nextCampaign = demoCampaigns.find(c => c.status === 'Scheduled');
const daysUntilBounceClean = nextCampaign
  ? Math.max(0, Math.ceil((new Date(nextCampaign.sentDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
  : 0;

/* ── PageGuide content ───────────────────────────────────── */
const dashGuide: GuideContent = {
  title: 'Daily Briefing Dashboard',
  purpose: 'Your command center for email intelligence. This page shows everything happening across all communication channels — performance metrics, engagement health, revenue attribution, and priority actions. Check it first thing every morning.',
  steps: [
    { label: 'Check the hero metrics', detail: 'The top section shows your three most important numbers: total emails sent, overall open rate, and revenue attributed to email. They count up on load for impact.' },
    { label: 'Review system pulse', detail: 'The 4 pulsing gauges give you instant health status on delivery, hygiene, engagement, and domain reputation. Green means healthy, amber needs watching.' },
    { label: 'Monitor countdowns', detail: 'Live countdown clocks keep campaign deadlines and renewal season front-of-mind so nothing sneaks up on you.' },
    { label: 'Review sparkline KPIs', detail: 'The 8-metric row gives you a pulse check on every dimension — delivery, engagement, bounces, revenue, and automation health.' },
    { label: 'Act on Priority Actions', detail: 'Red and orange items need attention today. They include the revenue impact of inaction.' },
    { label: 'Monitor the churn watchlist', detail: 'Members with declining engagement are flagged before they churn. Each card shows risk score and recommended action.' },
  ],
  tips: [
    'Click any SparkKpi card for a detailed breakdown and drill-down data.',
    'The delivery funnel shows where you\'re losing recipients — focus on the biggest drop-off.',
    'Use the print button to generate a PDF briefing for leadership meetings.',
    'Switch themes using the sidebar circles — AXG Gold and ALTA Brand are light themes for projector presentations.',
  ],
};

/* ════════════════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function DailyBriefing() {
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  /* Fade in hero metrics after typewriter finishes */
  useEffect(() => {
    if (typewriterDone) {
      const timer = setTimeout(() => setHeroVisible(true), 200);
      return () => clearTimeout(timer);
    }
  }, [typewriterDone]);

  return (
    <div className="space-y-6 pb-24">

      {/* ───────────────────────────────────────────────────────
          1. HERO: Typewriter Welcome + Live Pulse
          ─────────────────────────────────────────────────────── */}
      <section
        className="relative rounded-2xl overflow-hidden px-8 py-10"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, var(--background)), color-mix(in srgb, var(--accent) 5%, var(--background)), var(--background))',
          border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
        }}
      >
        {/* shimmer sweep */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, color-mix(in srgb, var(--accent) 6%, transparent) 50%, transparent 60%)',
            backgroundSize: '200% 100%',
            animation: 'heroShimmer 6s ease-in-out infinite',
          }}
        />

        {/* accent glow — top right */}
        <div
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'var(--accent)' }}
        />
        {/* accent glow — bottom left (subtle) */}
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ background: 'var(--accent)', opacity: 0.06 }}
        />

        {/* LIVE indicator */}
        <div className="absolute top-5 right-6 flex items-center gap-2 no-print">
          <span
            className="relative flex h-2.5 w-2.5"
          >
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: C.green, animation: 'livePulse 2s ease-in-out infinite' }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ background: C.green }}
            />
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: C.green }}>Live</span>
        </div>

        {/* top bar: actions */}
        <div className="relative flex items-start justify-between mb-6">
          <div />
          <div className="flex items-center gap-2 no-print flex-shrink-0">
            <PageGuide pageId="dashboard" guide={dashGuide} />
            <button
              onClick={() => exportCSV(
                ['Metric', 'Value'],
                [['Sent', totals.totalSent], ['Open Rate', openRate + '%'], ['Click Rate', clickRate + '%'], ['Bounce Rate', bounceRate + '%'], ['Revenue', '$' + totals.totalRevenue], ['Campaigns', totals.campaignCount]],
                'MEMTrak_Daily_Brief',
              )}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all hover:scale-105"
              style={{ color: 'var(--accent)', borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--accent) 6%, transparent)' }}
            >
              <Download className="w-3 h-3" /> CSV
            </button>
            <button
              onClick={() => memtrakPrint('daily')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all hover:scale-105"
              style={{ color: 'var(--accent)', borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--accent) 6%, transparent)' }}
            >
              <Printer className="w-3 h-3" /> Print
            </button>
          </div>
        </div>

        {/* Typewriter greeting */}
        <div className="relative mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-snug" style={{ minHeight: '2.4em' }}>
            <Typewriter
              text={`${greeting}, Von. ${totals.campaignCount} campaigns tracked, ${openRate}% open rate, $${(totals.totalRevenue / 1000).toFixed(0)}K attributed revenue. ${demoDecayAlerts.filter(d => d.decay >= 50).length} members need attention.`}
              speed={25}
              delay={300}
              onComplete={() => setTypewriterDone(true)}
            />
          </h1>
          <p
            className="text-[11px] mt-2 transition-opacity duration-700"
            style={{ color: 'var(--text-muted)', opacity: typewriterDone ? 1 : 0 }}
          >
            {todayStr} — MEMTrak Intelligence · {totals.totalSent.toLocaleString()} emails tracked across MEMTrak, Higher Logic, and Outlook
          </p>
        </div>

        {/* Hero metrics — fade/count in after typewriter */}
        <div
          className="relative grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
          }}
        >
          {/* Total Sent */}
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
              Total Emails Sent
            </div>
            <div className="flex items-end gap-4">
              <AnimatedCounter
                value={totals.totalSent}
                className="text-4xl md:text-5xl leading-none"
                duration={2000}
              />
              <svg width="100" height="40" viewBox="0 0 100 40" className="flex-shrink-0 mb-1">
                <defs>
                  <linearGradient id="hero-spark-sent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.blue} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={C.blue} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const data = mSent;
                  const min = Math.min(...data);
                  const max = Math.max(...data);
                  const range = max - min || 1;
                  const pts = data.map((v, i) => {
                    const x = 4 + (i / (data.length - 1)) * 92;
                    const y = 38 - ((v - min) / range) * 34;
                    return `${x},${y}`;
                  });
                  const fill = [...pts, '96,40', '4,40'];
                  return (
                    <>
                      <polygon points={fill.join(' ')} fill="url(#hero-spark-sent)" />
                      <polyline points={pts.join(' ')} fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="3" fill={C.blue} />
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
              {totals.campaignCount} campaigns this period
            </div>
          </div>

          {/* Open Rate */}
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
              Overall Open Rate
            </div>
            <div className="flex items-end gap-4">
              <AnimatedCounter
                value={parseFloat(openRate)}
                suffix="%"
                decimals={1}
                className="text-4xl md:text-5xl leading-none"
                color={parseFloat(openRate) >= 35 ? C.green : C.orange}
                duration={2000}
              />
              <svg width="100" height="40" viewBox="0 0 100 40" className="flex-shrink-0 mb-1">
                <defs>
                  <linearGradient id="hero-spark-open" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.green} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={C.green} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const data = mOpenRates;
                  const min = Math.min(...data);
                  const max = Math.max(...data);
                  const range = max - min || 1;
                  const pts = data.map((v, i) => {
                    const x = 4 + (i / (data.length - 1)) * 92;
                    const y = 38 - ((v - min) / range) * 34;
                    return `${x},${y}`;
                  });
                  const fill = [...pts, '96,40', '4,40'];
                  return (
                    <>
                      <polygon points={fill.join(' ')} fill="url(#hero-spark-open)" />
                      <polyline points={pts.join(' ')} fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="3" fill={C.green} />
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
              Industry avg: 25-35% for associations
            </div>
          </div>

          {/* Revenue */}
          <div>
            <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
              Revenue Attributed
            </div>
            <div className="flex items-end gap-4">
              <AnimatedCounter
                value={Math.round(totals.totalRevenue / 1000)}
                prefix="$"
                suffix="K"
                className="text-4xl md:text-5xl leading-none"
                color={C.green}
                duration={2000}
              />
              <svg width="100" height="40" viewBox="0 0 100 40" className="flex-shrink-0 mb-1">
                <defs>
                  <linearGradient id="hero-spark-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.green} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={C.green} stopOpacity="0" />
                  </linearGradient>
                </defs>
                {(() => {
                  const data = [148000, 212000, 340000, totals.totalRevenue];
                  const min = Math.min(...data);
                  const max = Math.max(...data);
                  const range = max - min || 1;
                  const pts = data.map((v, i) => {
                    const x = 4 + (i / (data.length - 1)) * 92;
                    const y = 38 - ((v - min) / range) * 34;
                    return `${x},${y}`;
                  });
                  const fill = [...pts, '96,40', '4,40'];
                  return (
                    <>
                      <polygon points={fill.join(' ')} fill="url(#hero-spark-rev)" />
                      <polyline points={pts.join(' ')} fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="3" fill={C.green} />
                    </>
                  );
                })()}
              </svg>
            </div>
            <div className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
              From renewals, events, PFL, and advocacy
            </div>
          </div>
        </div>

        {/* Keyframes for hero */}
        <style>{`
          @keyframes heroShimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @keyframes livePulse {
            0%, 100% { transform: scale(1); opacity: 0.75; }
            50% { transform: scale(2); opacity: 0; }
          }
        `}</style>
      </section>

      {/* ───────────────────────────────────────────────────────
          2. SYSTEM PULSE: Live PulsingMeters
          ─────────────────────────────────────────────────────── */}
      <section
        className="rounded-2xl border px-6 py-7"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--card-border)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}
          >
            <Activity className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>System Pulse</h2>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Real-time platform health indicators</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 place-items-center">
          <PulsingMeter
            value={demoHygiene.currentDelivery}
            label="Delivery"
            color={meterColor(demoHygiene.currentDelivery)}
            size="md"
          />
          <PulsingMeter
            value={demoHygiene.healthy.pct}
            label="Hygiene"
            color={meterColor(demoHygiene.healthy.pct)}
            size="md"
          />
          <PulsingMeter
            value={72}
            label="Engage"
            color={meterColor(72)}
            size="md"
          />
          <PulsingMeter
            value={87}
            label="Domain"
            color={meterColor(87)}
            size="md"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-3">
          <div className="text-center text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            Delivery Health — {demoHygiene.currentDelivery}%
          </div>
          <div className="text-center text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            List Hygiene — {demoHygiene.healthy.pct}%
          </div>
          <div className="text-center text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            Engagement Index — 72/100
          </div>
          <div className="text-center text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            Domain Reputation — 87/100
          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────
          3. COUNTDOWN: Active Campaigns + Renewal Timer
          ─────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next Campaign Countdown */}
        <Card glass title="Next Campaign" subtitle="PFL Compliance — May Wave 1 (Illinois Focus)" detailTitle="PFL May Wave 1 — Campaign Details" detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Illinois-focused PFL compliance notice targeting 1,029 non-compliant organizations. This is the third wave in the 2026 PFL compliance series.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}><div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Recipients</div><div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>1,029</div></div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}><div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Expected Open Rate</div><div className="text-lg font-extrabold" style={{ color: C.green }}>29.9%</div></div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}><div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Template</div><div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>PFL Compliance Notice</div></div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}><div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>From</div><div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>licensing@alta.org</div></div>
            </div>
            <div className="p-3 rounded-lg border-l-2" style={{ background: 'var(--input-bg)', borderColor: C.orange }}>
              <div className="text-xs font-bold" style={{ color: C.orange }}>Pre-Send Checklist</div>
              <div className="text-[10px] mt-1 space-y-1" style={{ color: 'var(--text-muted)' }}>
                <div>&#10003; Subject line A/B test completed (urgency framing won +29.6%)</div>
                <div>&#10003; Bounce list cleaned April 12</div>
                <div>&#9744; Final content review pending — Taylor Spolidoro</div>
                <div>&#9744; Illinois suppression list updated</div>
              </div>
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Previous waves: Wave 1 (Feb) — 29.9% open, Wave 2 (Mar) — 27.0% open. Urgency subject line expected to lift Wave 3 to ~35%.</div>
          </div>
        }>
          <div className="flex flex-col items-center">
            <CountdownClock
              targetDate="2026-05-05T09:00:00"
              label=""
              color={C.blue}
              size="sm"
              startDate="2026-04-09"
            />
            <div className="mt-3 w-full space-y-2">
              <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span>1,029 recipients</span>
                <span>licensing@alta.org</span>
              </div>
              <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span>Expected: ~29.9% open rate</span>
                <span>A/B tested &#10003;</span>
              </div>
              <MiniBar value={30} color={C.blue} />
            </div>
          </div>
        </Card>

        {/* Renewal Season Countdown */}
        <Card glass title="Renewal Season" subtitle="4,994 members · Aug 1 – Dec 31, 2026" detailTitle="Renewal Season Plan" detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Annual membership renewal campaign targeting all 4,994 active members across 7 membership types. Projected revenue: $4.2M at 84% renewal rate.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}><div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Members to Renew</div><div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>4,994</div></div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}><div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Projected Revenue</div><div className="text-lg font-extrabold" style={{ color: C.green }}>$4.2M</div></div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}><div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Target Renewal Rate</div><div className="text-lg font-extrabold" style={{ color: C.green }}>84.3%</div></div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}><div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>ACU White-Glove (40)</div><div className="text-lg font-extrabold" style={{ color: C.orange }}>$2.4M</div></div>
            </div>
            <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Outreach Timeline</div>
            {[
              { month: 'Aug', action: 'Pre-renewal awareness — early bird messaging' },
              { month: 'Sep', action: 'Renewal notice #1 — standard renewal email' },
              { month: 'Oct', action: 'ACU CEO personal calls + reminder #2' },
              { month: 'Nov', action: 'Final notice — urgency messaging' },
              { month: 'Dec', action: 'Lapsed member re-engagement' },
            ].map(t => (
              <div key={t.month} className="flex items-center gap-3 p-2 rounded" style={{ background: 'var(--input-bg)' }}>
                <span className="text-xs font-bold w-8" style={{ color: C.orange }}>{t.month}</span>
                <span className="text-[10px]" style={{ color: 'var(--heading)' }}>{t.action}</span>
              </div>
            ))}
          </div>
        }>
          <div className="flex flex-col items-center">
            <CountdownClock
              targetDate="2026-08-01T00:00:00"
              label=""
              color={C.orange}
              size="sm"
              startDate="2026-01-01"
            />
            <div className="mt-3 w-full space-y-2">
              <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span>4,994 members</span>
                <span>$4.2M projected</span>
              </div>
              <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span>84.3% target renewal rate</span>
                <span>6-email sequence</span>
              </div>
              <MiniBar value={49} color={C.orange} />
            </div>
          </div>
        </Card>

        {/* Campaigns in Flight */}
        <Card glass title="Campaigns in Flight" subtitle="Real-time pipeline status" detailTitle="All Campaigns — Pipeline View" detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>All campaigns across MEMTrak, Higher Logic, and Outlook — active, scheduled, and in draft.</p>
            {demoCampaigns.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{c.name}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.source} · {c.sentDate || 'No date'} · {c.listSize.toLocaleString()} recipients</div>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${c.status === 'Sent' ? 'bg-green-500/20 text-green-400' : c.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-400' : ''}`} style={c.status === 'Draft' ? { background: 'var(--input-bg)', color: 'var(--text-muted)' } : undefined}>{c.status}</span>
              </div>
            ))}
          </div>
        }>
          <div className="space-y-3">
            {/* Active row */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.green, animation: 'livePulse 2s ease-in-out infinite' }} />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: C.green }} />
                </span>
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Active</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Sent & tracking</div>
                </div>
              </div>
              <span className="text-2xl font-extrabold" style={{ color: C.green }}>{totals.campaignCount}</span>
            </div>
            {/* Scheduled row */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full" style={{ background: C.blue }} />
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Scheduled</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Queued for send</div>
                </div>
              </div>
              <span className="text-2xl font-extrabold" style={{ color: C.blue }}>{totals.scheduled}</span>
            </div>
            {/* Draft row */}
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Drafts</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>In progress</div>
                </div>
              </div>
              <span className="text-2xl font-extrabold" style={{ color: 'var(--text-muted)' }}>{totals.drafts}</span>
            </div>
            {/* Total + recent activity */}
            <div className="pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Pipeline</span>
                <span className="text-xl font-extrabold" style={{ color: 'var(--heading)' }}>{demoCampaigns.length}</span>
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Latest: <span style={{ color: 'var(--heading)' }}>{sentCampaigns[0]?.name}</span> · {sentCampaigns[0]?.sentDate}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Next: <span style={{ color: C.blue }}>{nextCampaign?.name}</span> · {nextCampaign?.sentDate}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ───────────────────────────────────────────────────────
          4. SMART KPI GRID (8 metrics)
          ─────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 stagger-children">
        <SparkKpi
          label="Emails Sent"
          value={totals.totalSent.toLocaleString()}
          icon={Send}
          color={C.blue}
          sparkData={mSent}
          sparkColor={C.blue}
          trend={{ value: delta(mSent), label: 'vs last month' }}
          sub={`${totals.campaignCount} campaigns`}
          detail={<div className="space-y-2">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total emails sent across all platforms this month.</p>
            {sentCampaigns.slice(0, 6).map(c => (
              <div key={c.id} className="flex justify-between items-center p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div><div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{c.name}</div><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.source} · {c.sentDate}</div></div>
                <span className="text-sm font-extrabold" style={{ color: C.blue }}>{c.listSize.toLocaleString()}</span>
              </div>
            ))}
          </div>}
        />
        <SparkKpi
          label="Delivered"
          value={totals.totalDelivered.toLocaleString()}
          icon={Mail}
          color={C.blue}
          sparkData={mDeliv}
          sparkColor={C.blue}
          trend={{ value: delta(mDeliv), label: 'vs last month' }}
          sub={`${((totals.totalDelivered / totals.totalSent) * 100).toFixed(1)}% delivery rate`}
          detail={<div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Emails that reached the recipient's mail server. Target: 98%+.</p>
            <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="flex justify-between text-xs mb-1"><span style={{ color: 'var(--heading)' }}>Delivery Rate</span><span className="font-bold" style={{ color: C.green }}>{((totals.totalDelivered / totals.totalSent) * 100).toFixed(1)}%</span></div>
              <MiniBar value={totals.totalDelivered} max={totals.totalSent} color={C.green} />
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="flex justify-between text-xs"><span style={{ color: 'var(--heading)' }}>Failed to deliver</span><span className="font-bold" style={{ color: C.red }}>{(totals.totalSent - totals.totalDelivered).toLocaleString()}</span></div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Hard bounces, invalid addresses, and blocks</div>
            </div>
          </div>}
        />
        <SparkKpi
          label="Open Rate"
          value={openRate + '%'}
          icon={Eye}
          color={parseFloat(openRate) >= 35 ? C.green : C.orange}
          sparkData={mOpenRates}
          sparkColor={parseFloat(openRate) >= 35 ? C.green : C.orange}
          trend={{ value: delta(mOpenRates), label: 'vs last month' }}
          sub="Industry avg: 25-35%"
          detail={<div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Percentage of delivered emails opened. ALTA exceeds the association industry average of 25-35%.</p>
            <div className="p-3 rounded-lg border-l-2" style={{ background: 'var(--input-bg)', borderColor: C.orange }}>
              <div className="text-xs font-bold" style={{ color: C.orange }}>Apple MPP Warning</div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Apple Mail Privacy Protection inflates open rates by ~30%. True open rate is likely ~{(parseFloat(openRate) * 0.7).toFixed(1)}%. Use click rate as the more reliable engagement metric.</div>
            </div>
            <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Monthly Trend</div>
            {demoMonthly.map(m => (
              <div key={m.month} className="flex items-center justify-between text-xs p-2 rounded" style={{ background: 'var(--input-bg)' }}>
                <span style={{ color: 'var(--heading)' }}>{m.month}</span>
                <div className="flex items-center gap-2"><MiniBar value={m.opened / m.delivered * 100} color={C.green} /><span className="font-bold w-12 text-right" style={{ color: C.green }}>{(m.opened / m.delivered * 100).toFixed(1)}%</span></div>
              </div>
            ))}
          </div>}
        />
        <SparkKpi
          label="Click Rate"
          value={clickRate + '%'}
          icon={MousePointerClick}
          color={C.green}
          sparkData={mClicked}
          sparkColor={C.green}
          trend={{ value: delta(mClicked), label: 'vs last month' }}
          sub="100% reliable metric"
          detail={<div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Percentage of delivered emails where a recipient clicked a link. This is MEMTrak's primary engagement metric — it cannot be inflated by Apple MPP or blocked by corporate Outlook.</p>
            <div className="p-3 rounded-lg" style={{ background: 'color-mix(in srgb, ' + C.green + ' 10%, transparent)' }}>
              <div className="text-xs font-bold" style={{ color: C.green }}>ALTA's {clickRate}% CTR is 3x the industry average of 3-5%</div>
            </div>
            <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Top Clicked Campaigns</div>
            {sentCampaigns.filter(c => c.clicked > 0).sort((a, b) => b.clicked - a.clicked).slice(0, 4).map(c => (
              <div key={c.id} className="flex justify-between text-xs p-2 rounded" style={{ background: 'var(--input-bg)' }}>
                <span style={{ color: 'var(--heading)' }}>{c.name}</span>
                <span className="font-bold" style={{ color: C.green }}>{c.clicked.toLocaleString()} clicks</span>
              </div>
            ))}
          </div>}
        />
        <SparkKpi
          label="Bounce Rate"
          value={bounceRate + '%'}
          icon={AlertTriangle}
          color={parseFloat(bounceRate) > 3 ? C.red : C.green}
          sparkData={mBounced}
          sparkColor={parseFloat(bounceRate) > 3 ? C.red : C.green}
          trend={{ value: delta(mBounced), label: 'vs last month' }}
          sub={`${totals.totalBounced.toLocaleString()} addresses`}
          detail={<div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Percentage of sent emails that bounced. Industry recommendation: keep below 2%. Above 3% damages domain reputation.</p>
            <div className="p-3 rounded-lg border-l-2" style={{ background: 'var(--input-bg)', borderColor: C.red }}>
              <div className="text-xs font-bold" style={{ color: C.red }}>Action Required</div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Remove {totals.totalBounced.toLocaleString()} bounced addresses via Address Hygiene before the next send. Current rate ({bounceRate}%) is above the 2% threshold.</div>
            </div>
            <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Impact on Deliverability</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Google blocks senders above 0.3% complaint rate. Yahoo blocks above 0.3%. Each bounce is a negative signal to these providers affecting ALL future sends.</div>
          </div>}
        />
        <SparkKpi
          label="Revenue"
          value={'$' + (totals.totalRevenue / 1000).toFixed(0) + 'K'}
          icon={DollarSign}
          color={C.green}
          sparkData={[148000, 212000, 340000, totals.totalRevenue]}
          sparkColor={C.green}
          trend={{ value: +((totals.totalRevenue - 340000) / 340000 * 100).toFixed(1), label: 'vs last month' }}
          sub="Attributed to email"
          detail={<div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Revenue directly attributed to email campaigns — renewals, PFL purchases, and event registrations within 14 days of an email send.</p>
            {sentCampaigns.filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue).map(c => (
              <div key={c.id} className="flex justify-between items-center p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div><div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{c.name}</div><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.type} · {c.sentDate}</div></div>
                <span className="text-sm font-extrabold" style={{ color: C.green }}>${(c.revenue / 1000).toFixed(0)}K</span>
              </div>
            ))}
            <div className="p-3 rounded-lg" style={{ background: 'color-mix(in srgb, ' + C.green + ' 10%, transparent)' }}>
              <div className="text-xs font-bold" style={{ color: C.green }}>ROI: $36 for every $1 spent on MEMTrak</div>
            </div>
          </div>}
        />
        <SparkKpi
          label="Decay Alerts"
          value={String(demoDecayAlerts.filter(d => d.decay >= 50).length)}
          icon={TrendingDown}
          color={C.red}
          sparkData={[1, 2, 2, demoDecayAlerts.filter(d => d.decay >= 50).length]}
          sparkColor={C.red}
          trend={{ value: 50, label: 'vs last month' }}
          sub={'$' + demoDecayAlerts.filter(d => d.decay >= 50).reduce((s, d) => s + d.revenue, 0).toLocaleString() + ' at risk'}
          detail={<div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Members whose engagement is declining — a leading indicator of non-renewal. Each alert represents revenue at risk.</p>
            {demoDecayAlerts.filter(d => d.decay >= 50).map(d => (
              <div key={d.email} className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="flex justify-between items-center">
                  <div><div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{d.org}</div><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{d.type} · Open rate: {d.historical}% → {d.recent}%</div></div>
                  <span className="text-sm font-extrabold" style={{ color: C.red }}>${d.revenue.toLocaleString()}/yr</span>
                </div>
                <div className="mt-2"><MiniBar value={d.decay} color={C.red} /><div className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>{d.decay}% decay · Last open: {d.lastOpen}</div></div>
              </div>
            ))}
          </div>}
        />
        <SparkKpi
          label="Active Workflows"
          value="4"
          icon={Workflow}
          color={C.purple}
          sparkData={[2, 3, 3, 4]}
          sparkColor={C.purple}
          trend={{ value: 33.3, label: 'vs last month' }}
          sub="$124K revenue protected"
          detail={<div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Automated workflows running right now, handling engagement decay, bounce cleanup, new member onboarding, and renewal sequences.</p>
            {[
              { name: 'Decay Re-engagement', enrolled: 344, converted: 52, revenue: '$78K protected' },
              { name: 'Bounce Auto-Cleanup', enrolled: 265, converted: 89, revenue: '$12K protected' },
              { name: 'New Member 30-Day', enrolled: 42, converted: 28, revenue: '$34K protected' },
              { name: 'Renewal Countdown', enrolled: 0, converted: 0, revenue: 'Starting Aug 1' },
            ].map(w => (
              <div key={w.name} className="flex justify-between items-center p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div><div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{w.name}</div><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{w.enrolled} enrolled · {w.converted} converted</div></div>
                <span className="text-[10px] font-bold" style={{ color: C.purple }}>{w.revenue}</span>
              </div>
            ))}
          </div>}
        />
      </section>

      {/* ───────────────────────────────────────────────────────
          5. ENGAGEMENT TIMELINE (full-width chart)
          ─────────────────────────────────────────────────────── */}
      <Card
        title="Engagement Timeline"
        subtitle="4-month trend across sends, opens, and clicks"
        detailTitle="Monthly Trend Analysis"
        detailContent={
          <div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              March was the highest-volume month driven by ALTA ONE promotion and Advocacy Summit. Open rates improved from January (34.5%) to April (40%+), likely due to A/B subject line testing and better list segmentation.
            </p>
            <div className="space-y-1 text-xs">
              {demoMonthly.map(m => (
                <div key={m.month} className="flex justify-between p-2 rounded" style={{ background: 'var(--background)' }}>
                  <span style={{ color: 'var(--heading)' }}>{m.month}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {m.sent.toLocaleString()} sent &middot; {((m.opened / m.delivered) * 100).toFixed(1)}% open &middot; {m.bounced} bounced
                  </span>
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
            labels: demoMonthly.map(m => m.month),
            datasets: [
              {
                label: 'Sent',
                data: mSent,
                borderColor: C.blue,
                backgroundColor: 'rgba(74,144,217,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: C.blue,
                borderWidth: 2.5,
              },
              {
                label: 'Opened',
                data: mOpened,
                borderColor: C.green,
                backgroundColor: 'rgba(140,198,63,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: C.green,
                borderWidth: 2.5,
              },
              {
                label: 'Clicked',
                data: mClicked,
                borderColor: C.orange,
                backgroundColor: 'rgba(232,146,63,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: C.orange,
                borderWidth: 2.5,
              },
            ],
          }}
          options={{
            plugins: {
              legend: { display: true, position: 'top' as const, labels: { color: 'var(--text-muted)', usePointStyle: true, padding: 20, font: { size: 10 } } },
              datalabels: { display: false },
            },
            scales: {
              y: { beginAtZero: true, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)', font: { size: 10 } } },
              x: { grid: { display: false }, ticks: { color: 'var(--text-muted)', font: { size: 10 } } },
            },
          }}
        />
        {/* mini-stats strip below chart */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Avg Open Rate</div>
            <div className="text-lg font-extrabold mt-0.5" style={{ color: 'var(--heading)' }}>{avgOpenRate}%</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Best Month</div>
            <div className="text-lg font-extrabold mt-0.5" style={{ color: C.green }}>{bestMonth.month}</div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{((bestMonth.opened / bestMonth.delivered) * 100).toFixed(1)}% open rate</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Worst Month</div>
            <div className="text-lg font-extrabold mt-0.5" style={{ color: C.orange }}>{worstMonth.month}</div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{((worstMonth.opened / worstMonth.delivered) * 100).toFixed(1)}% open rate</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Total Revenue</div>
            <div className="text-lg font-extrabold mt-0.5" style={{ color: C.green }}>${(totalMonthlyRevenue / 1000).toFixed(0)}K</div>
          </div>
        </div>
      </Card>

      {/* ───────────────────────────────────────────────────────
          6. TWO-COLUMN: Funnel + Source Distribution
          ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Pipeline Funnel */}
        <Card title="Delivery Pipeline Funnel" subtitle="Where recipients drop off across the journey">
          <div className="space-y-3 mt-1">
            {funnelSteps.map((step, i) => {
              const pct = i === 0 ? 100 : +((step.value / funnelSteps[0].value) * 100).toFixed(1);
              const dropoff = i > 0 ? +((1 - step.value / funnelSteps[i - 1].value) * 100).toFixed(1) : 0;
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{step.label}</span>
                      {i > 0 && dropoff > 0 && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: dropoff > 10 ? 'rgba(217,74,74,0.12)' : 'rgba(140,198,63,0.12)', color: dropoff > 10 ? C.red : C.green }}>
                          -{dropoff}% drop
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--heading)' }}>{step.value.toLocaleString()}</span>
                      <span className="text-[9px] font-semibold tabular-nums" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: 'var(--card-border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: step.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Source Distribution */}
        <Card title="Source Distribution" subtitle="Email volume by sending platform">
          <ClientChart
            type="doughnut"
            height={240}
            data={{
              labels: Object.keys(sourceCounts),
              datasets: [{
                data: Object.values(sourceCounts),
                backgroundColor: [C.green, C.blue, C.orange],
                borderWidth: 0,
                hoverOffset: 8,
              }],
            }}
            options={{
              cutout: '62%',
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom' as const,
                  labels: { color: 'var(--text-muted)', usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 10 } },
                },
                datalabels: { display: false },
              },
            }}
          />
          {/* legend counts */}
          <div className="flex justify-center gap-6 mt-2">
            {Object.entries(sourceCounts).map(([source, count]) => (
              <div key={source} className="text-center">
                <div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>{count.toLocaleString()}</div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{source}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ───────────────────────────────────────────────────────
          7. PRIORITY ACTIONS PANEL
          ─────────────────────────────────────────────────────── */}
      <Card
        title="Priority Actions"
        subtitle="What needs attention today"
        detailTitle="Action Item Details"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              These actions are generated automatically based on MEMTrak&apos;s analysis of engagement patterns, bounce rates, and campaign performance. Items are ranked by urgency and revenue impact.
            </p>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(217,74,74,0.06)' }}>
              <p className="text-xs font-bold" style={{ color: C.red }}>About Engagement Decay Alerts</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                When a member who historically opened 80% of emails drops to 20%, that&apos;s a decay signal. Research shows this pattern predicts non-renewal 3-6 months before it happens.
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-2">
          {[
            {
              urgency: 'CRITICAL',
              color: C.red,
              icon: AlertTriangle,
              text: `${demoDecayAlerts.filter(d => d.decay >= 70).length} engagement decay alerts — $${demoDecayAlerts.filter(d => d.decay >= 70).reduce((s, d) => s + d.revenue, 0).toLocaleString()} at risk`,
              action: 'View in Intelligence',
              revenue: '$62,071 revenue impact',
              pulse: true,
            },
            {
              urgency: 'HIGH',
              color: C.red,
              icon: Shield,
              text: `${totals.totalBounced} bounced addresses need cleanup before May 5 send`,
              action: 'Clean in Address Hygiene',
              revenue: `${daysUntilBounceClean} days to clean — protects domain reputation`,
              pulse: true,
            },
            {
              urgency: 'MEDIUM',
              color: C.orange,
              icon: Send,
              text: `${totals.scheduled} campaign scheduled, ${totals.drafts} draft needs review`,
              action: 'Review in Campaigns',
              revenue: 'Pipeline continuity',
              pulse: false,
            },
            {
              urgency: 'PLAN',
              color: C.blue,
              icon: Users,
              text: 'Renewal season: 4,994 members need comms by Q4',
              action: 'Plan in Renewals',
              revenue: '$2.4M renewal revenue',
              pulse: false,
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-xl transition-all hover:translate-x-1"
                style={{
                  background: 'color-mix(in srgb, var(--card-border) 30%, transparent)',
                  borderLeft: `3px solid ${item.color}`,
                }}
              >
                <span
                  className="flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-full font-bold flex-shrink-0 mt-0.5"
                  style={{
                    background: `color-mix(in srgb, ${item.color} 15%, transparent)`,
                    color: item.color,
                    animation: item.pulse ? 'actionPulse 2.5s ease-in-out infinite' : 'none',
                  }}
                >
                  <Icon className="w-3 h-3" />
                  {item.urgency}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{item.text}</span>
                  <div className="text-[10px] mt-0.5 font-medium" style={{ color: item.pulse ? item.color : 'var(--text-muted)' }}>{item.revenue}</div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold flex-shrink-0 mt-0.5 cursor-pointer" style={{ color: 'var(--accent)' }}>
                  {item.action} <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
        <style>{`
          @keyframes actionPulse {
            0%, 100% { box-shadow: 0 0 0 0 transparent; }
            50% { box-shadow: 0 0 12px 2px color-mix(in srgb, var(--accent) 20%, transparent); }
          }
        `}</style>
      </Card>

      {/* ───────────────────────────────────────────────────────
          8. TWO-COLUMN: Churn Watchlist + Member Health
          ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Watchlist */}
        <Card
          title="Churn Watchlist"
          subtitle="Highest risk members by revenue"
          accent={C.orange}
          detailTitle="Churn Risk Analysis"
          detailContent={
            <div>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                MEMTrak scores churn risk by combining email engagement decay, event attendance, dues payment patterns, and member type. Scores above 70 typically predict non-renewal.
              </p>
            </div>
          }
        >
          <div className="space-y-2">
            {demoChurnScores.map(c => (
              <div
                key={c.org}
                className="flex items-center gap-3 p-3 rounded-xl transition-all hover:translate-x-1"
                style={{ background: 'color-mix(in srgb, var(--card-border) 30%, transparent)' }}
              >
                <PulsingMeter
                  value={c.score}
                  label=""
                  color={c.score >= 70 ? C.red : c.score >= 50 ? C.orange : C.green}
                  size="sm"
                  showPulse={c.score >= 70}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
                    {c.org} <span className="font-normal" style={{ color: 'var(--text-muted)' }}>({c.type})</span>
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.factors[0]}</div>
                  <div className="text-[9px] mt-1 flex items-center gap-1 font-semibold" style={{ color: C.green }}>
                    <ChevronRight className="w-3 h-3" /> {c.action}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>At Risk</div>
                  <div className="text-sm font-extrabold" style={{ color: C.red }}>${c.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Member Health Distribution */}
        <Card title="Member Health Distribution" subtitle="5 engagement tiers with revenue breakdown">
          <div className="space-y-4 mt-1">
            {healthTiers.map(tier => (
              <div key={tier.label} className="flex items-center gap-4">
                <ProgressRing value={tier.pct} max={100} color={tier.color} size={52} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{tier.label}</span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--heading)' }}>{tier.count.toLocaleString()}</span>
                  </div>
                  <MiniBar value={tier.pct} max={100} color={tier.color} height={5} />
                  <div className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    ${(tier.revenue / 1000).toFixed(0)}K annual revenue &middot; {tier.pct}% of members
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ───────────────────────────────────────────────────────
          9. INTELLIGENCE STRIP (4 glass cards)
          ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Clock,
            label: 'Best Send Time',
            metric: `${demoSendTimes[0].day} ${demoSendTimes[0].time}`,
            numericValue: demoSendTimes[0].openRate,
            numericSuffix: '% open',
            note: `${demoSendTimes[0].segment} — top segment`,
            color: C.blue,
          },
          {
            icon: MousePointerClick,
            label: 'Top CTA',
            metric: '"Renew Your Membership"',
            numericValue: 39.2,
            numericSuffix: '% CTR',
            note: '8x better than "Learn More"',
            color: C.green,
          },
          {
            icon: DollarSign,
            label: 'Platform Savings',
            metric: '',
            numericValue: 3010,
            numericPrefix: '$',
            numericSuffix: '/mo',
            note: 'MEMTrak $75/mo vs $3,085/mo combined',
            color: C.green,
          },
          {
            icon: Heart,
            label: 'Address Health',
            metric: '',
            numericValue: demoHygiene.healthy.pct,
            numericSuffix: '% healthy',
            note: `${demoHygiene.total.toLocaleString()} addresses — ${demoHygiene.projectedDelivery}% projected delivery`,
            color: demoHygiene.healthy.pct >= 75 ? C.green : C.orange,
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="rounded-xl border p-5 backdrop-blur-md transition-all duration-200 hover:translate-y-[-2px]"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.08)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${card.color} 15%, transparent)` }}
                >
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
                  {card.label}
                </span>
              </div>
              {card.metric ? (
                <div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>{card.metric}</div>
              ) : null}
              <div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>
                <AnimatedCounter
                  value={card.numericValue}
                  prefix={(card as { numericPrefix?: string }).numericPrefix || ''}
                  suffix={card.numericSuffix}
                  decimals={card.numericValue % 1 !== 0 ? 1 : 0}
                  duration={1800}
                  className="text-sm"
                />
              </div>
              <div className="text-[10px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{card.note}</div>
            </div>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────
          10. RECENT CAMPAIGNS TABLE
          ─────────────────────────────────────────────────────── */}
      <Card
        title="Recent Campaigns"
        subtitle={`${demoCampaigns.length} campaigns across all platforms`}
        detailTitle="All Campaigns"
        detailContent={
          <div className="space-y-2">
            {sentCampaigns.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{c.name}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {c.source} &middot; {c.sentDate} &middot; {c.listSize.toLocaleString()} sent
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold" style={{ color: c.uniqueOpened / c.delivered >= 0.4 ? C.green : C.orange }}>
                    {(c.uniqueOpened / c.delivered * 100).toFixed(1)}% open
                  </div>
                  {c.revenue > 0 && <div className="text-[10px] font-bold" style={{ color: C.green }}>${(c.revenue / 1000).toFixed(0)}K</div>}
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-xs" style={{ minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {['Campaign', 'Source', 'Status', 'Sent', 'Open Rate', 'Clicks', 'Revenue'].map(h => (
                  <th
                    key={h}
                    className="text-left px-5 py-2.5 text-[9px] uppercase tracking-wider font-bold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {demoCampaigns.map(c => {
                const or = c.delivered > 0 ? (c.uniqueOpened / c.delivered * 100) : 0;
                return (
                  <tr
                    key={c.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--card-border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--card-border) 30%, transparent)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-5 py-3" style={{ color: 'var(--heading)' }}>
                      <div className="font-bold truncate max-w-[240px]">{c.name}</div>
                      <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.sentDate || 'Not scheduled'}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: c.source === 'MEMTrak' ? 'rgba(140,198,63,0.12)' : c.source === 'Higher Logic' ? 'rgba(74,144,217,0.12)' : 'rgba(232,146,63,0.12)',
                          color: c.source === 'MEMTrak' ? C.green : c.source === 'Higher Logic' ? C.blue : C.orange,
                        }}
                      >
                        {c.source}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={c.status === 'Sent' ? 'active' : c.status === 'Scheduled' ? 'scheduled' : 'draft'} size="xs" />
                    </td>
                    <td className="px-5 py-3 tabular-nums font-semibold" style={{ color: 'var(--heading)' }}>
                      {c.listSize.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      {c.delivered > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold tabular-nums" style={{ color: or >= 40 ? C.green : or >= 25 ? C.orange : C.red }}>
                            {or.toFixed(1)}%
                          </span>
                          <div className="w-16">
                            <MiniBar value={or} max={100} color={or >= 40 ? C.green : or >= 25 ? C.orange : C.red} height={4} />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>--</span>
                      )}
                    </td>
                    <td className="px-5 py-3 tabular-nums font-semibold" style={{ color: 'var(--heading)' }}>
                      {c.clicked > 0 ? c.clicked.toLocaleString() : '--'}
                    </td>
                    <td className="px-5 py-3 tabular-nums font-bold" style={{ color: c.revenue > 0 ? C.green : 'var(--text-muted)' }}>
                      {c.revenue > 0 ? '$' + (c.revenue / 1000).toFixed(0) + 'K' : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ───────────────────────────────────────────────────────
          11. EMBEDDED INTELLIGENCE REPORT
          ─────────────────────────────────────────────────────── */}
      <Card
        title="Daily Intelligence Report"
        subtitle="Full briefing — click Detail for print/export view"
        glass
        detailTitle="MEMTrak Daily Intelligence Report"
        detailContent={
          <div className="space-y-4 text-xs" style={{ color: 'var(--heading)' }}>
            <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>Print this modal for a formatted PDF report.</p>
            <h3 className="text-sm font-bold" style={{ color: '#C6A75E', borderBottom: '2px solid #C6A75E', paddingBottom: 4 }}>EXECUTIVE SUMMARY</h3>
            <p style={{ lineHeight: '1.8' }}>This week&apos;s analysis reveals a membership engagement program performing well above industry benchmarks. Your <strong>{openRate}%</strong> open rate places ALTA in the top decile of association email programs nationally. The standout campaign, <strong>{sentCampaigns.sort((a,b) => b.revenue - a.revenue)[0]?.name}</strong>, generated <strong style={{ color: C.green }}>${(sentCampaigns.sort((a,b) => b.revenue - a.revenue)[0]?.revenue / 1000).toFixed(0)}K in attributed revenue</strong>. {demoDecayAlerts.filter(d => d.decay >= 70).length > 0 && <span>However, <strong style={{ color: C.red }}>{demoDecayAlerts.filter(d => d.decay >= 70).length} high-priority decay alerts</strong> demand attention — ${demoDecayAlerts.filter(d => d.decay >= 70).reduce((s,d) => s + d.revenue, 0).toLocaleString()} in annual revenue is at risk.</span>}</p>
            <h3 className="text-sm font-bold mt-4" style={{ color: '#C6A75E', borderBottom: '2px solid #C6A75E', paddingBottom: 4 }}>PERFORMANCE METRICS</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Open Rate', value: openRate + '%', color: C.green, benchmark: '25-35%' },
                { label: 'Click Rate', value: clickRate + '%', color: C.green, benchmark: '3-5%' },
                { label: 'Revenue', value: '$' + (totals.totalRevenue/1000).toFixed(0) + 'K', color: C.green, benchmark: '—' },
                { label: 'Bounce Rate', value: bounceRate + '%', color: parseFloat(bounceRate) > 3 ? C.red : C.green, benchmark: '<2%' },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-2xl font-extrabold" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Industry: {m.benchmark}</div>
                </div>
              ))}
            </div>
            <h3 className="text-sm font-bold mt-4" style={{ color: '#C6A75E', borderBottom: '2px solid #C6A75E', paddingBottom: 4 }}>PRIORITY ACTIONS</h3>
            {demoDecayAlerts.filter(d => d.decay >= 70).map(d => (
              <div key={d.email} className="p-3 rounded-lg border-l-3" style={{ background: 'var(--input-bg)', borderLeftWidth: 3, borderLeftColor: C.red }}>
                <div className="font-bold" style={{ color: C.red }}>URGENT: {d.org} ({d.type})</div>
                <div style={{ color: 'var(--text-muted)' }}>Open rate dropped from {d.historical}% → {d.recent}%. ${d.revenue.toLocaleString()}/yr at risk. Last open: {d.lastOpen}.</div>
              </div>
            ))}
            <div className="p-3 rounded-lg border-l-3" style={{ background: 'var(--input-bg)', borderLeftWidth: 3, borderLeftColor: C.orange }}>
              <div className="font-bold" style={{ color: C.orange }}>MEDIUM: {totals.totalBounced} bounced addresses need cleanup</div>
              <div style={{ color: 'var(--text-muted)' }}>Current bounce rate ({bounceRate}%) is above the 2% threshold. Clean before next send.</div>
            </div>
            <h3 className="text-sm font-bold mt-4" style={{ color: '#C6A75E', borderBottom: '2px solid #C6A75E', paddingBottom: 4 }}>TOP CAMPAIGNS</h3>
            {sentCampaigns.sort((a,b) => b.revenue - a.revenue).slice(0,5).map(c => (
              <div key={c.id} className="flex justify-between items-center p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div><div className="font-bold" style={{ color: 'var(--heading)' }}>{c.name}</div><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.source} · {c.sentDate} · {c.listSize.toLocaleString()} sent</div></div>
                <div className="text-right"><div className="font-bold" style={{ color: (c.uniqueOpened/c.delivered) >= 0.4 ? C.green : C.orange }}>{(c.uniqueOpened/c.delivered*100).toFixed(1)}%</div>{c.revenue > 0 && <div className="font-bold" style={{ color: C.green }}>${(c.revenue/1000).toFixed(0)}K</div>}</div>
              </div>
            ))}
            <h3 className="text-sm font-bold mt-4" style={{ color: '#C6A75E', borderBottom: '2px solid #C6A75E', paddingBottom: 4 }}>RECOMMENDED ACTIONS</h3>
            {[
              { action: 'CEO outreach to First American Title', impact: '$61K account — engagement declining', color: C.red },
              { action: 'Clean bounce list before May 5 PFL send', impact: 'Protects domain reputation for 18K sends', color: C.orange },
              { action: 'Send ALTA ONE early bird reminder', impact: '$18-30K potential event revenue', color: C.blue },
              { action: 'Finalize sponsor thank-you email', impact: '$120K+ event partnership retention', color: C.green },
            ].map((r,i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="font-bold" style={{ color: r.color }}>{r.action}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.impact}</div>
              </div>
            ))}
          </div>
        }
      >
        {/* Inline summary of the report */}
        <div className="space-y-4">
          {/* Executive summary prose */}
          <div className="p-4 rounded-lg" style={{ background: 'var(--input-bg)', borderLeft: '3px solid #C6A75E' }}>
            <div className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: '#C6A75E' }}>Executive Summary</div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--heading)' }}>
              Your <strong>{openRate}%</strong> open rate places ALTA in the top decile nationally.
              <strong> {sentCampaigns.sort((a,b) => b.revenue - a.revenue)[0]?.name}</strong> generated
              <strong style={{ color: C.green }}> ${(sentCampaigns.sort((a,b) => b.revenue - a.revenue)[0]?.revenue / 1000).toFixed(0)}K revenue</strong> from {sentCampaigns.sort((a,b) => b.revenue - a.revenue)[0]?.listSize.toLocaleString()} recipients.
              {demoDecayAlerts.filter(d => d.decay >= 70).length > 0 && <span style={{ color: C.red }}> {demoDecayAlerts.filter(d => d.decay >= 70).length} decay alerts — ${demoDecayAlerts.filter(d => d.decay >= 70).reduce((s,d) => s + d.revenue, 0).toLocaleString()} at risk.</span>}
            </p>
          </div>

          {/* 4 inline KPI mini-cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Open Rate', value: openRate + '%', color: C.green, bar: parseFloat(openRate) },
              { label: 'Click Rate', value: clickRate + '%', color: C.green, bar: parseFloat(clickRate) * 3 },
              { label: 'Revenue', value: '$' + (totals.totalRevenue/1000).toFixed(0) + 'K', color: C.green, bar: 80 },
              { label: 'Bounce', value: bounceRate + '%', color: parseFloat(bounceRate) > 3 ? C.red : C.green, bar: parseFloat(bounceRate) * 15 },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                <div className="text-lg font-extrabold" style={{ color: m.color }}>{m.value}</div>
                <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
                <div className="mt-1.5"><MiniBar value={m.bar} color={m.color} /></div>
              </div>
            ))}
          </div>

          {/* Priority actions inline */}
          <div>
            <div className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: '#C6A75E' }}>Priority Actions</div>
            <div className="space-y-1.5">
              {demoDecayAlerts.filter(d => d.decay >= 70).map(d => (
                <div key={d.email} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(217,74,74,0.15)', color: C.red }}>URGENT</span>
                  <span className="text-xs" style={{ color: 'var(--heading)' }}>{d.org} — ${d.revenue.toLocaleString()}/yr at risk</span>
                </div>
              ))}
              <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(232,146,63,0.15)', color: C.orange }}>MEDIUM</span>
                <span className="text-xs" style={{ color: 'var(--heading)' }}>{totals.totalBounced} bounced addresses — clean before May 5</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(74,144,217,0.15)', color: C.blue }}>PLAN</span>
                <span className="text-xs" style={{ color: 'var(--heading)' }}>4,994 members need renewal comms by Q4</span>
              </div>
            </div>
          </div>

          {/* Top campaigns mini-table */}
          <div>
            <div className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: '#C6A75E' }}>Top Campaigns</div>
            {sentCampaigns.sort((a,b) => b.revenue - a.revenue).slice(0,4).map(c => (
              <div key={c.id} className="flex justify-between items-center p-2 rounded-lg mb-1" style={{ background: 'var(--input-bg)' }}>
                <div className="text-xs font-bold truncate" style={{ color: 'var(--heading)' }}>{c.name}</div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <span className="text-xs font-bold" style={{ color: (c.uniqueOpened/c.delivered) >= 0.4 ? C.green : C.orange }}>{(c.uniqueOpened/c.delivered*100).toFixed(1)}%</span>
                  {c.revenue > 0 && <span className="text-xs font-bold" style={{ color: C.green }}>${(c.revenue/1000).toFixed(0)}K</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="text-[9px] text-center pt-2" style={{ color: 'var(--accent)' }}>Click Detail for the full printable intelligence report →</div>
        </div>
      </Card>

      {/* ───────────────────────────────────────────────────────
          12. QUICK ACTIONS BAR (Floating Bottom)
          ─────────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 no-print"
        style={{
          background: 'linear-gradient(to top, var(--background) 60%, transparent)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 pb-4 pt-6">
          <div
            className="flex items-center justify-center gap-2 md:gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl"
            style={{
              background: 'color-mix(in srgb, var(--card) 85%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent) 20%, var(--card-border))',
              boxShadow: '0 -4px 32px rgba(0,0,0,0.2), 0 0 0 1px color-mix(in srgb, var(--accent) 8%, transparent)',
            }}
          >
            {[
              { icon: PenLine, label: 'Log Outreach', color: C.blue },
              { icon: Rocket, label: 'Send Campaign', color: C.green },
              { icon: Bell, label: 'Check Alerts', color: C.orange },
              { icon: FileText, label: 'Print Report', color: C.purple },
            ].map((btn, i) => {
              const BtnIcon = btn.icon;
              return (
                <button
                  key={i}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 hover:scale-105 group"
                  style={{
                    color: 'var(--heading)',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `color-mix(in srgb, ${btn.color} 12%, transparent)`;
                    e.currentTarget.style.boxShadow = `0 0 16px color-mix(in srgb, ${btn.color} 15%, transparent)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => {
                    if (btn.label === 'Print Report') memtrakPrint('daily');
                  }}
                >
                  <BtnIcon className="w-4 h-4" style={{ color: btn.color }} />
                  <span className="hidden sm:inline">{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
