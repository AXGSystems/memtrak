'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  PenLine, Rocket, Bell, FileText, X,
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

/* greeting is computed inside the component to avoid SSR/client hydration mismatch */

/* next campaign (static reference — Date.now() computed inside component) */
const nextCampaign = demoCampaigns.find(c => c.status === 'Scheduled');

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
  const router = useRouter();
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [countdownDetail, setCountdownDetail] = useState<string | null>(null);
  const [healthDetail, setHealthDetail] = useState<string | null>(null);

  /* Greeting + time-dependent values — client-side only to avoid hydration mismatch */
  const [greeting, setGreeting] = useState('Good morning');
  const [todayStr, setTodayStr] = useState('');
  const [daysUntilPFL, setDaysUntilPFL] = useState(20);
  const [daysUntilBounceClean, setDaysUntilBounceClean] = useState(0);
  useEffect(() => {
    const now = Date.now();
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
    setTodayStr(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));
    setDaysUntilPFL(Math.max(0, Math.ceil((new Date('2026-05-05').getTime() - now) / (1000 * 60 * 60 * 24))));
    setDaysUntilBounceClean(nextCampaign ? Math.max(0, Math.ceil((new Date(nextCampaign.sentDate).getTime() - now) / (1000 * 60 * 60 * 24))) : 0);
  }, []);

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
          1. COMMAND BAR — compact, data-dense, one row
          ─────────────────────────────────────────────────────── */}
      <section
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 14%, var(--background)), var(--background))',
          border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
        }}
      >
        {/* shimmer */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, color-mix(in srgb, var(--accent) 5%, transparent) 50%, transparent 60%)', backgroundSize: '200% 100%', animation: 'heroShimmer 6s ease-in-out infinite' }} />

        {/* Top strip: greeting + actions */}
        <div className="relative flex items-center justify-between px-6 py-3">
          <div className="flex items-start gap-3">
            <span className="relative flex h-2 w-2 mt-1.5"><span className="absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.green, animation: 'livePulse 2s ease-in-out infinite' }} /><span className="relative inline-flex rounded-full h-2 w-2" style={{ background: C.green }} /></span>
            <div>
              <h1 className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>
                <Typewriter text={`${greeting}, Von. Here is your daily intelligence briefing.`} speed={20} delay={200} onComplete={() => setTypewriterDone(true)} />
              </h1>
              <div className="mt-3 space-y-2 transition-all duration-700" style={{ opacity: typewriterDone ? 1 : 0, transform: typewriterDone ? 'translateY(0)' : 'translateY(8px)' }}>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Since your last session, MEMTrak has processed <strong style={{ color: 'var(--heading)' }}>{totals.totalSent.toLocaleString()} emails</strong> across {totals.campaignCount} campaigns, generating <strong style={{ color: C.green }}>${(totals.totalRevenue / 1000).toFixed(0)}K in attributed revenue</strong>. Your open rate of <strong style={{ color: parseFloat(openRate) >= 35 ? C.green : C.orange }}>{openRate}%</strong> continues to outperform the 25–35% industry benchmark for association email programs.
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {demoDecayAlerts.filter(d => d.decay >= 50).length > 0
                    ? <>There {demoDecayAlerts.filter(d => d.decay >= 50).length === 1 ? 'is' : 'are'} <strong style={{ color: C.red }}>{demoDecayAlerts.filter(d => d.decay >= 50).length} engagement decay {demoDecayAlerts.filter(d => d.decay >= 50).length === 1 ? 'alert' : 'alerts'}</strong> requiring attention, representing <strong style={{ color: C.red }}>${demoDecayAlerts.filter(d => d.decay >= 50).reduce((s, d) => s + d.revenue, 0).toLocaleString()}</strong> in annual revenue at risk. Your next scheduled campaign — PFL May Wave 1 — launches in {daysUntilPFL} days with {totals.totalBounced} addresses still needing cleanup before send.</>
                    : <>No critical engagement decay alerts at this time. Your next scheduled campaign — PFL May Wave 1 — launches in {daysUntilPFL} days.</>
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 no-print flex-shrink-0">
            <PageGuide pageId="dashboard" guide={dashGuide} />
            <button onClick={() => exportCSV(['Metric', 'Value'], [['Sent', totals.totalSent], ['Open Rate', openRate + '%'], ['Click Rate', clickRate + '%'], ['Revenue', '$' + totals.totalRevenue]], 'MEMTrak_Brief')} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-semibold border transition-all hover:scale-105" style={{ color: 'var(--accent)', borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--accent) 6%, transparent)' }}><Download className="w-3 h-3" /> CSV</button>
            <button onClick={() => memtrakPrint('daily')} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-semibold border transition-all hover:scale-105" style={{ color: 'var(--accent)', borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--accent) 6%, transparent)' }}><Printer className="w-3 h-3" /> Print</button>
          </div>
        </div>

      </section>

      {/* ── 1B. SYSTEM HEALTH ── */}
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent) 0%, color-mix(in srgb, var(--accent) 4%, transparent) 100%)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }}>
          <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>System Health</span>
        </div>
        <div className="flex-1 h-px" style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--card-border))' }} />
        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>4 indicators &middot; Real-time</span>
      </div>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" style={{ opacity: typewriterDone ? 1 : 0.3, transition: 'opacity 1s ease 0.3s' }}>
        {[
          { label: 'Delivery', value: demoHygiene.currentDelivery, target: '98%+' },
          { label: 'Hygiene', value: demoHygiene.healthy.pct, target: '85%+' },
          { label: 'Engagement', value: 72, target: '75+' },
          { label: 'Reputation', value: 87, target: '85+' },
        ].map(h => (
          <div key={h.label} onClick={() => setHealthDetail(h.label)} className="rounded-xl border p-3 cursor-pointer transition-all duration-300 hover:translate-y-[-2px] flex items-center gap-3" style={{
            background: 'linear-gradient(135deg, var(--glass-bg) 0%, transparent 100%)',
            borderColor: 'var(--glass-border)',
            backdropFilter: 'blur(16px) saturate(1.2)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
            <PulsingMeter value={h.value} label="" color={meterColor(h.value)} size="sm" showPulse={h.value < 80} />
            <div>
              <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{h.label}</div>
              <div className="text-lg font-extrabold leading-none" style={{ color: meterColor(h.value) }}>{h.value}%</div>
              <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Target: {h.target}</div>
            </div>
          </div>
        ))}
      </section>

      {healthDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setHealthDetail(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', animation: 'scaleIn 0.2s ease-out' }} onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{healthDetail} Health — Details</h3>
              <button onClick={() => setHealthDetail(null)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              {healthDetail === 'Delivery' && (
                <div className="space-y-3">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Email delivery rate across all campaigns. Target: 98%+. Below 95% indicates domain reputation issues.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg text-center" style={{ background: 'var(--background)' }}><div className="text-2xl font-extrabold" style={{ color: '#8CC63F' }}>{demoHygiene.currentDelivery}%</div><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Current Rate</div></div>
                    <div className="p-3 rounded-lg text-center" style={{ background: 'var(--background)' }}><div className="text-2xl font-extrabold" style={{ color: '#4A90D9' }}>{demoHygiene.projectedDelivery}%</div><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>After Cleanup</div></div>
                  </div>
                  <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(140,198,63,0.06)', color: 'var(--text-muted)' }}>Cleaning {totals.totalBounced} bounced addresses will improve delivery by {(demoHygiene.projectedDelivery - demoHygiene.currentDelivery).toFixed(1)} percentage points.</div>
                </div>
              )}
              {healthDetail === 'Hygiene' && (
                <div className="space-y-3">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Address list health score. Healthy addresses actively engage. Stale addresses have not opened in 6+ months.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg text-center" style={{ background: 'var(--background)' }}><div className="text-2xl font-extrabold" style={{ color: '#8CC63F' }}>{demoHygiene.healthy.pct}%</div><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Healthy</div></div>
                    <div className="p-3 rounded-lg text-center" style={{ background: 'var(--background)' }}><div className="text-2xl font-extrabold" style={{ color: '#E8923F' }}>{demoHygiene.stale.count.toLocaleString()}</div><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Stale Addresses</div></div>
                  </div>
                </div>
              )}
              {healthDetail === 'Engagement' && (
                <div className="space-y-3">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Overall member engagement index across email opens, clicks, events, and committee participation. Scored 0-100.</p>
                  <div className="p-3 rounded-lg text-center" style={{ background: 'var(--background)' }}><div className="text-3xl font-extrabold" style={{ color: '#E8923F' }}>72/100</div><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target: 75+</div></div>
                  <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(232,146,63,0.06)', color: 'var(--text-muted)' }}>Engagement is 3 points below target. The 1,520 &quot;At Risk&quot; members are the primary drag. A re-engagement campaign targeting this group could push the index above 75.</div>
                </div>
              )}
              {healthDetail === 'Reputation' && (
                <div className="space-y-3">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Domain sender reputation score based on SPF/DKIM/DMARC compliance, complaint rate, and bounce rate. ISPs use this to decide inbox placement.</p>
                  <div className="p-3 rounded-lg text-center" style={{ background: 'var(--background)' }}><div className="text-3xl font-extrabold" style={{ color: '#8CC63F' }}>87/100</div><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Target: 85+</div></div>
                  <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(140,198,63,0.06)', color: 'var(--text-muted)' }}>Domain reputation is healthy. SPF, DKIM, and DMARC are all configured. Complaint rate is well below Google&apos;s 0.3% threshold.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────
          2. COUNTDOWN + PIPELINE — compact row
          ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent) 0%, color-mix(in srgb, var(--accent) 4%, transparent) 100%)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }}>
          <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Upcoming &amp; Pipeline</span>
        </div>
        <div className="flex-1 h-px" style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--card-border))' }} />
        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Countdowns &middot; Campaign status</span>
      </div>
      {/* Row 1: Two countdown tiles */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Next Campaign */}
        <div
          className="rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-2px]"
          onClick={() => setCountdownDetail('campaign')}
          style={{
            background: 'linear-gradient(135deg, var(--glass-bg) 0%, transparent 100%)',
            borderColor: 'var(--glass-border)',
            backdropFilter: 'blur(16px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Glassmorphic tab header */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(74,144,217,0.12) 0%, rgba(74,144,217,0.04) 100%)', borderBottom: '1px solid rgba(74,144,217,0.15)' }}>
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" style={{ color: C.blue }} />
              <span className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>Next Campaign</span>
            </div>
            <span className="text-[9px] px-2.5 py-1 rounded-full font-bold" style={{ background: 'rgba(74,144,217,0.15)', color: C.blue }}>SCHEDULED</span>
          </div>
          <div className="p-5">
            <div className="text-xs font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>PFL Compliance — May Wave 1 (Illinois Focus)</div>
            <div className="flex items-center justify-center mb-4">
              <CountdownClock targetDate="2026-05-05T09:00:00" label="" color={C.blue} size="sm" startDate="2026-04-09" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Recipients', value: '1,029', color: 'var(--heading)' },
                { label: 'Expected Open', value: '~29.9%', color: C.blue },
                { label: 'From Address', value: 'licensing@', color: 'var(--heading)' },
                { label: 'A/B Test', value: '2 variants', color: C.green },
              ].map(s => (
                <div key={s.label} className="text-center p-2.5 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                  <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                  <div className="text-sm font-extrabold" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="text-[10px] font-semibold text-center mt-3" style={{ color: 'var(--accent)' }}>Click for full campaign details &rarr;</div>
          </div>
        </div>

        {/* Renewal Season */}
        <div
          className="rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-2px]"
          onClick={() => setCountdownDetail('renewal')}
          style={{
            background: 'linear-gradient(135deg, var(--glass-bg) 0%, transparent 100%)',
            borderColor: 'var(--glass-border)',
            backdropFilter: 'blur(16px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Glassmorphic tab header */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(232,146,63,0.12) 0%, rgba(232,146,63,0.04) 100%)', borderBottom: '1px solid rgba(232,146,63,0.15)' }}>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: C.orange }} />
              <span className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>Renewal Season</span>
            </div>
            <span className="text-[9px] px-2.5 py-1 rounded-full font-bold" style={{ background: 'rgba(232,146,63,0.15)', color: C.orange }}>PLANNING</span>
          </div>
          <div className="p-5">
            <div className="text-xs font-semibold mb-4" style={{ color: 'var(--text-muted)' }}>4,994 members &middot; August 1 – December 31, 2026</div>
            <div className="flex items-center justify-center mb-4">
              <CountdownClock targetDate="2026-08-01T00:00:00" label="" color={C.orange} size="sm" startDate="2026-01-01" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Members', value: '4,994', color: 'var(--heading)' },
                { label: 'Revenue', value: '$4.2M', color: C.green },
                { label: 'Target Rate', value: '84.3%', color: C.orange },
                { label: 'Sequence', value: '6 emails', color: 'var(--heading)' },
              ].map(s => (
                <div key={s.label} className="text-center p-2.5 rounded-lg" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                  <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                  <div className="text-sm font-extrabold" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div className="text-[10px] font-semibold text-center mt-3" style={{ color: 'var(--accent)' }}>Click for renewal milestones &rarr;</div>
          </div>
        </div>
      </section>

      {/* Row 2: Campaigns in Flight — full width with detailed status cards */}
      <section
        className="rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-2px]"
        onClick={() => setCountdownDetail('pipeline')}
        style={{
          background: 'linear-gradient(135deg, var(--glass-bg) 0%, transparent 100%)',
          borderColor: 'var(--glass-border)',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Glassmorphic tab header */}
        <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(140,198,63,0.10) 0%, rgba(140,198,63,0.03) 100%)', borderBottom: '1px solid rgba(140,198,63,0.12)' }}>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4" style={{ color: C.green }} />
            <span className="text-sm font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>Campaigns in Flight</span>
            <span className="text-xs font-bold ml-2 px-2 py-0.5 rounded-full" style={{ background: 'rgba(140,198,63,0.12)', color: C.green }}>{demoCampaigns.length} total</span>
          </div>
          <div className="text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>Click for full pipeline &rarr;</div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Active */}
            <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(140,198,63,0.04)', border: '1px solid rgba(140,198,63,0.12)' }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.green, animation: 'livePulse 2s ease-in-out infinite' }} />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: C.green }} />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.green }}>Active</span>
              </div>
              <div className="text-3xl font-extrabold mb-1" style={{ color: C.green }}>{totals.campaignCount}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Sent &amp; tracking engagement</div>
              <div className="mt-3 text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Latest: <strong style={{ color: 'var(--heading)' }}>{sentCampaigns[0]?.name}</strong>
                <br />{sentCampaigns[0]?.sentDate} &middot; {sentCampaigns[0]?.listSize.toLocaleString()} recipients
              </div>
            </div>
            {/* Scheduled */}
            <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(74,144,217,0.04)', border: '1px solid rgba(74,144,217,0.12)' }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="flex h-2.5 w-2.5 rounded-full" style={{ background: C.blue }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.blue }}>Scheduled</span>
              </div>
              <div className="text-3xl font-extrabold mb-1" style={{ color: C.blue }}>{totals.scheduled}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Queued &amp; ready to send</div>
              {nextCampaign && (
                <div className="mt-3 text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Next: <strong style={{ color: C.blue }}>{nextCampaign.name}</strong>
                  <br />{nextCampaign.sentDate} &middot; {nextCampaign.listSize.toLocaleString()} recipients
                </div>
              )}
            </div>
            {/* Drafts */}
            <div className="rounded-xl p-4 text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="flex h-2.5 w-2.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Drafts</span>
              </div>
              <div className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text-muted)' }}>{totals.drafts}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>In progress &amp; pending review</div>
              <div className="mt-3 text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {demoCampaigns.filter(c => c.status === 'Draft').slice(0, 1).map(c => (
                  <span key={c.id}><strong style={{ color: 'var(--heading)' }}>{c.name}</strong><br />{c.listSize.toLocaleString()} recipients planned</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Detail Modal */}
      {countdownDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setCountdownDetail(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', animation: 'scaleIn 0.2s ease-out' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>
                  {countdownDetail === 'campaign' ? 'PFL May Wave 1 — Campaign Details' : countdownDetail === 'renewal' ? 'Renewal Season Preparation' : 'Campaign Pipeline Overview'}
                </h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {countdownDetail === 'campaign' ? 'Upcoming campaign timeline & checklist' : countdownDetail === 'renewal' ? 'Strategic renewal milestones' : 'All campaigns by status'}
                </p>
              </div>
              <button onClick={() => setCountdownDetail(null)} className="p-1.5 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              {countdownDetail === 'campaign' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Campaign Type', value: 'Print Fulfillment (PFL)' },
                      { label: 'Send Date', value: 'May 5, 2026' },
                      { label: 'Target Audience', value: 'Active Members' },
                      { label: 'Est. List Size', value: '2,400' },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                        <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                        <div className="text-sm font-bold mt-1" style={{ color: 'var(--heading)' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Preparation Checklist</div>
                    {['List segmentation finalized', 'Creative assets approved', 'A/B subject lines configured', 'Suppression list updated', 'Send-time optimization set'].map((step, i) => (
                      <div key={step} className="flex items-center gap-2 py-1.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold" style={{ background: i < 3 ? '#8CC63F' : 'var(--card-border)', color: i < 3 ? '#fff' : 'var(--text-muted)' }}>
                          {i < 3 ? '\u2713' : String(i + 1)}
                        </div>
                        <span className="text-xs" style={{ color: i < 3 ? 'var(--heading)' : 'var(--text-muted)', textDecoration: i < 3 ? 'line-through' : 'none', opacity: i < 3 ? 0.6 : 1 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(74,144,217,0.06)', color: 'var(--text-muted)' }}>
                    <strong style={{ color: '#4A90D9' }}>Last PFL Performance:</strong> March wave achieved 48.2% open rate and $12K revenue from 1,800 recipients.
                  </div>
                </div>
              )}
              {countdownDetail === 'renewal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Members Renewing', value: '4,994', color: '#4A90D9' },
                      { label: 'Revenue at Stake', value: '$2.4M', color: '#8CC63F' },
                      { label: 'Prior Year Rate', value: '87.3%', color: '#8CC63F' },
                      { label: 'At-Risk Members', value: '12', color: '#E8923F' },
                    ].map(item => (
                      <div key={item.label} className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                        <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                        <div className="text-lg font-extrabold mt-1" style={{ color: item.color }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Key Milestones</div>
                    {[
                      { date: 'Jun 1', task: 'Finalize renewal email sequence (3 touches)' },
                      { date: 'Jun 15', task: 'Segment members by engagement tier' },
                      { date: 'Jul 1', task: 'Launch early-bird renewal incentive' },
                      { date: 'Aug 1', task: 'Renewal season opens — automated sequence activates' },
                      { date: 'Oct 15', task: 'Final push — personal outreach to non-responders' },
                    ].map(m => (
                      <div key={m.date} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
                        <span className="text-[10px] font-bold w-14 flex-shrink-0" style={{ color: '#4A90D9' }}>{m.date}</span>
                        <span className="text-xs" style={{ color: 'var(--heading)' }}>{m.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {countdownDetail === 'pipeline' && (
                <div className="space-y-2">
                  {demoCampaigns.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate" style={{ color: 'var(--heading)' }}>{c.name}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {c.source} &middot; {c.sentDate || 'Not scheduled'} &middot; {c.listSize.toLocaleString()} recipients
                        </div>
                      </div>
                      <StatusPill status={c.status === 'Sent' ? 'active' : c.status === 'Scheduled' ? 'scheduled' : 'draft'} size="xs" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────
          4. SMART KPI GRID (8 metrics)
          ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent) 0%, color-mix(in srgb, var(--accent) 4%, transparent) 100%)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }}>
          <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Performance Metrics</span>
        </div>
        <div className="flex-1 h-px" style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--card-border))' }} />
        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>8 KPIs &middot; Click any tile for details</span>
      </div>
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <SparkKpi
          label="Emails Sent"
          value={totals.totalSent.toLocaleString()}
          icon={Send}
          color={C.blue}
          size="lg"
          accent
          sparkData={mSent}
          sparkColor={C.blue}
          trend={{ value: delta(mSent), label: 'vs last month' }}
          sub={`${totals.campaignCount} campaigns`}
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Monthly send volume across all platforms.</p>
              <div className="space-y-1">
                {demoMonthly.map(m => (
                  <div key={m.month} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--background)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{m.month}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-20"><MiniBar value={m.sent} max={Math.max(...mSent)} color={C.blue} height={5} /></div>
                      <span className="text-xs font-bold tabular-nums w-14 text-right" style={{ color: C.blue }}>{m.sent.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2.5 rounded-lg text-[10px]" style={{ background: 'rgba(74,144,217,0.06)', color: 'var(--text-muted)' }}>
                Peak: March ({Math.max(...mSent).toLocaleString()} sends) driven by ALTA ONE promotion.
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Delivered"
          value={totals.totalDelivered.toLocaleString()}
          icon={Mail}
          color={C.blue}
          size="lg"
          accent
          sparkData={mDeliv}
          sparkColor={C.blue}
          trend={{ value: delta(mDeliv), label: 'vs last month' }}
          sub={`${((totals.totalDelivered / totals.totalSent) * 100).toFixed(1)}% delivery rate`}
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Delivery rate trend and bounce impact analysis.</p>
              <div className="space-y-1">
                {demoMonthly.map(m => {
                  const dr = ((m.delivered / m.sent) * 100).toFixed(1);
                  return (
                    <div key={m.month} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--background)' }}>
                      <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{m.month}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-20"><MiniBar value={parseFloat(dr)} max={100} color={parseFloat(dr) >= 95 ? C.green : C.orange} height={5} /></div>
                        <span className="text-xs font-bold tabular-nums w-14 text-right" style={{ color: parseFloat(dr) >= 95 ? C.green : C.orange }}>{dr}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-2.5 rounded-lg text-[10px]" style={{ background: 'rgba(140,198,63,0.06)', color: 'var(--text-muted)' }}>
                Current: {demoHygiene.currentDelivery}% delivery. Cleaning {demoHygiene.stale.count.toLocaleString()} stale addresses projects {demoHygiene.projectedDelivery}%.
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Open Rate"
          value={openRate + '%'}
          icon={Eye}
          color={parseFloat(openRate) >= 35 ? C.green : C.orange}
          size="lg"
          accent
          sparkData={mOpenRates}
          sparkColor={parseFloat(openRate) >= 35 ? C.green : C.orange}
          trend={{ value: delta(mOpenRates), label: 'vs last month' }}
          sub="Industry avg: 25-35%"
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Open rate by campaign — industry average is 25-35%.</p>
              <div className="space-y-1">
                {sentCampaigns.slice(0, 6).map(c => {
                  const or = (c.uniqueOpened / c.delivered * 100).toFixed(1);
                  return (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--background)' }}>
                      <span className="text-xs font-semibold truncate max-w-[180px]" style={{ color: 'var(--heading)' }}>{c.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16"><MiniBar value={parseFloat(or)} max={100} color={parseFloat(or) >= 40 ? C.green : parseFloat(or) >= 25 ? C.orange : C.red} height={5} /></div>
                        <span className="text-xs font-bold tabular-nums" style={{ color: parseFloat(or) >= 40 ? C.green : C.orange }}>{or}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-2.5 rounded-lg text-[10px]" style={{ background: 'rgba(140,198,63,0.06)', color: 'var(--text-muted)' }}>
                ALTA&apos;s {openRate}% average puts you in the top decile of association email programs nationally.
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Click Rate"
          value={clickRate + '%'}
          icon={MousePointerClick}
          color={C.green}
          size="lg"
          accent
          sparkData={mClicked}
          sparkColor={C.green}
          trend={{ value: delta(mClicked), label: 'vs last month' }}
          sub="100% reliable metric"
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click-through rate by campaign with CTA analysis.</p>
              <div className="space-y-1">
                {sentCampaigns.filter(c => c.clicked > 0).slice(0, 6).map(c => {
                  const ctr = (c.clicked / c.uniqueOpened * 100).toFixed(1);
                  return (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--background)' }}>
                      <span className="text-xs font-semibold truncate max-w-[180px]" style={{ color: 'var(--heading)' }}>{c.name}</span>
                      <span className="text-xs font-bold tabular-nums" style={{ color: C.green }}>{ctr}% CTR</span>
                    </div>
                  );
                })}
              </div>
              <div className="p-2.5 rounded-lg text-[10px]" style={{ background: 'rgba(140,198,63,0.06)', color: 'var(--text-muted)' }}>
                Top CTA: &quot;Renew Your Membership&quot; at 39.2% — 8x better than generic &quot;Learn More&quot; links.
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Bounce Rate"
          value={bounceRate + '%'}
          icon={AlertTriangle}
          color={parseFloat(bounceRate) > 3 ? C.red : C.green}
          size="lg"
          accent
          sparkData={mBounced}
          sparkColor={parseFloat(bounceRate) > 3 ? C.red : C.green}
          trend={{ value: delta(mBounced), label: 'vs last month' }}
          sub={`${totals.totalBounced.toLocaleString()} addresses`}
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Bounce analysis and list hygiene status. Target: under 2%.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Total Bounced</div>
                  <div className="text-lg font-extrabold mt-1" style={{ color: C.red }}>{totals.totalBounced.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Stale Addresses</div>
                  <div className="text-lg font-extrabold mt-1" style={{ color: C.orange }}>{demoHygiene.stale.count.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Current Delivery</div>
                  <div className="text-lg font-extrabold mt-1" style={{ color: C.green }}>{demoHygiene.currentDelivery}%</div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                  <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>After Cleanup</div>
                  <div className="text-lg font-extrabold mt-1" style={{ color: C.green }}>{demoHygiene.projectedDelivery}%</div>
                </div>
              </div>
              <div className="p-2.5 rounded-lg text-[10px]" style={{ background: 'rgba(217,74,74,0.06)', color: 'var(--text-muted)' }}>
                Action: Run Address Hygiene cleanup to remove {totals.totalBounced} bounced + {demoHygiene.stale.count.toLocaleString()} stale addresses before the May 5 campaign.
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Revenue"
          value={'$' + (totals.totalRevenue / 1000).toFixed(0) + 'K'}
          icon={DollarSign}
          color={C.green}
          size="lg"
          accent
          sparkData={[148000, 212000, 340000, totals.totalRevenue]}
          sparkColor={C.green}
          trend={{ value: +((totals.totalRevenue - 340000) / 340000 * 100).toFixed(1), label: 'vs last month' }}
          sub="Attributed to email"
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Revenue attributed to email campaigns via tracked conversions.</p>
              <div className="space-y-1">
                {sentCampaigns.filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--background)' }}>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold truncate block" style={{ color: 'var(--heading)' }}>{c.name}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.listSize.toLocaleString()} sent</span>
                    </div>
                    <span className="text-sm font-extrabold" style={{ color: C.green }}>${(c.revenue / 1000).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
              <div className="p-2.5 rounded-lg text-[10px]" style={{ background: 'rgba(140,198,63,0.06)', color: 'var(--text-muted)' }}>
                Renewal campaigns drive {sentCampaigns.filter(c => c.revenue > 0).length > 0 ? Math.round(sentCampaigns.filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue)[0].revenue / totals.totalRevenue * 100) : 0}% of total attributed revenue.
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Decay Alerts"
          value={String(demoDecayAlerts.filter(d => d.decay >= 50).length)}
          icon={TrendingDown}
          color={C.red}
          size="lg"
          accent
          sparkData={[1, 2, 2, demoDecayAlerts.filter(d => d.decay >= 50).length]}
          sparkColor={C.red}
          trend={{ value: 50, label: 'vs last month' }}
          sub={'$' + demoDecayAlerts.filter(d => d.decay >= 50).reduce((s, d) => s + d.revenue, 0).toLocaleString() + ' at risk'}
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Members whose engagement has dropped significantly — high decay predicts non-renewal within 3-6 months.</p>
              <div className="space-y-1">
                {demoDecayAlerts.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--background)', borderLeft: d.decay >= 70 ? '3px solid #D94A4A' : d.decay >= 50 ? '3px solid #E8923F' : '3px solid var(--card-border)' }}>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{d.org}</span>
                      <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>{d.type} &middot; Last open: {d.lastOpen}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold" style={{ color: d.decay >= 70 ? C.red : C.orange }}>{d.decay}% decay</div>
                      <div className="text-[10px] font-semibold" style={{ color: C.red }}>${d.revenue.toLocaleString()}/yr</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Active Workflows"
          value="4"
          icon={Workflow}
          color={C.purple}
          size="lg"
          accent
          sparkData={[2, 3, 3, 4]}
          sparkColor={C.purple}
          trend={{ value: 33.3, label: 'vs last month' }}
          sub="$124K revenue protected"
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Automated email sequences currently running in the pipeline.</p>
              <div className="space-y-1">
                {[
                  { name: 'Welcome Series', status: 'Active', triggers: 'New member signup', emails: 4, openRate: '62%' },
                  { name: 'Renewal Sequence', status: 'Active', triggers: '90 days before expiry', emails: 3, openRate: '54%' },
                  { name: 'PFL Follow-up', status: 'Active', triggers: 'Post-print fulfillment', emails: 2, openRate: '48%' },
                  { name: 'Advocacy Nurture', status: 'Active', triggers: 'TIPAC interest signal', emails: 5, openRate: '41%' },
                ].map(w => (
                  <div key={w.name} className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{w.name}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(140,198,63,0.12)', color: '#8CC63F' }}>{w.status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      <span>Trigger: {w.triggers}</span>
                      <span>{w.emails} emails</span>
                      <span style={{ color: '#8CC63F', fontWeight: 700 }}>{w.openRate} open</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
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
                pointRadius: 3,
                pointHoverRadius: 5,
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
                pointRadius: 3,
                pointHoverRadius: 5,
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
                pointRadius: 3,
                pointHoverRadius: 5,
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
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
        <Card title="Delivery Pipeline Funnel" subtitle="Where recipients drop off across the journey" detailTitle="Funnel Step Analysis" detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Each step shows where recipients are lost. The biggest drop-off point is your highest-leverage optimization target.</p>
            {funnelSteps.map((step, i) => {
              const dropoff = i > 0 ? +((1 - step.value / funnelSteps[i - 1].value) * 100).toFixed(1) : 0;
              return (
                <div key={step.label} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--background)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{step.label}</span>
                  <div className="text-right">
                    <span className="text-xs font-bold" style={{ color: step.color }}>{step.value.toLocaleString()}</span>
                    {i > 0 && <span className="text-[10px] ml-2" style={{ color: dropoff > 10 ? C.red : 'var(--text-muted)' }}>-{dropoff}%</span>}
                  </div>
                </div>
              );
            })}
            <div className="p-2.5 rounded-lg text-[10px]" style={{ background: 'rgba(74,144,217,0.06)', color: 'var(--text-muted)' }}>Biggest drop: Opened to Clicked ({((1 - funnelSteps[3].value / funnelSteps[2].value) * 100).toFixed(1)}%). Improving CTAs could recover hundreds of clicks.</div>
          </div>
        }>
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
        <Card title="Source Distribution" subtitle="Email volume by sending platform" detailTitle="Source Breakdown" detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Recipient volume split across sending platforms. MEMTrak consolidates reporting from all sources.</p>
            {Object.entries(sourceCounts).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--background)' }}>
                <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{source}</span>
                <div className="text-right">
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{count.toLocaleString()}</span>
                  <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>{((count / Object.values(sourceCounts).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
            <div className="p-2.5 rounded-lg text-[10px]" style={{ background: 'rgba(140,198,63,0.06)', color: 'var(--text-muted)' }}>MEMTrak unifies data from all platforms into a single reporting view, eliminating manual spreadsheet merges.</div>
          </div>
        }>
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
        <div className="space-y-3">
          {[
            {
              urgency: 'CRITICAL',
              color: C.red,
              icon: AlertTriangle,
              text: `${demoDecayAlerts.filter(d => d.decay >= 70).length} engagement decay alerts — $${demoDecayAlerts.filter(d => d.decay >= 70).reduce((s, d) => s + d.revenue, 0).toLocaleString()} at risk`,
              action: 'View in Intelligence',
              href: '/decay-radar',
              revenue: '$62,071 revenue impact',
              pulse: true,
            },
            {
              urgency: 'HIGH',
              color: C.red,
              icon: Shield,
              text: `${totals.totalBounced} bounced addresses need cleanup before May 5 send`,
              action: 'Clean in Address Hygiene',
              href: '/hygiene',
              revenue: `${daysUntilBounceClean} days to clean — protects domain reputation`,
              pulse: true,
            },
            {
              urgency: 'MEDIUM',
              color: C.orange,
              icon: Send,
              text: `${totals.scheduled} campaign scheduled, ${totals.drafts} draft needs review`,
              action: 'Review in Campaigns',
              href: '/campaign-builder',
              revenue: 'Pipeline continuity',
              pulse: false,
            },
            {
              urgency: 'PLAN',
              color: C.blue,
              icon: Users,
              text: 'Renewal season: 4,994 members need comms by Q4',
              action: 'Plan in Renewals',
              href: '/renewals',
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
                    background: `color-mix(in srgb, ${item.color} 20%, transparent)`,
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
                <div className="flex items-center gap-1 text-[10px] font-bold flex-shrink-0 mt-0.5 cursor-pointer" style={{ color: 'var(--accent)' }} onClick={(e) => { e.stopPropagation(); router.push(item.href); }}>
                  {item.action} <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
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
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Churn risk is scored 0-100 by combining email engagement decay, event attendance, dues payment patterns, and member type. Scores above 70 predict non-renewal with 85% accuracy.
              </p>
              {demoChurnScores.map(c => (
                <div key={c.org} className="p-3 rounded-lg" style={{ background: 'var(--background)', borderLeft: `3px solid ${c.score >= 70 ? C.red : c.score >= 50 ? C.orange : C.green}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{c.org}</span>
                    <span className="text-xs font-extrabold" style={{ color: c.score >= 70 ? C.red : c.score >= 50 ? C.orange : C.green }}>{c.score}% risk</span>
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.type} &middot; ${c.revenue.toLocaleString()}/yr</div>
                  <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Factors: {c.factors.join(', ')}</div>
                  <div className="text-[10px] mt-1 font-semibold" style={{ color: C.green }}>Action: {c.action}</div>
                </div>
              ))}
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
        <Card title="Member Health Distribution" subtitle="5 engagement tiers with revenue breakdown"
          accent={C.blue}
          detailTitle="Member Health — Full Breakdown"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Members are scored into 5 engagement tiers based on email opens, clicks, event attendance, and committee participation.
              </p>
              {healthTiers.map(tier => (
                <div key={tier.label} className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: tier.color }}>{tier.label}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{tier.count.toLocaleString()} members</span>
                  </div>
                  <MiniBar value={tier.pct} max={100} color={tier.color} height={6} />
                  <div className="flex items-center justify-between mt-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>{tier.pct}% of total</span>
                    <span>${(tier.revenue / 1000).toFixed(0)}K annual revenue</span>
                  </div>
                </div>
              ))}
              <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(140,198,63,0.06)', color: 'var(--text-muted)' }}>
                Moving 20% of &quot;At Risk&quot; members back to Engaged would protect approximately $278K in annual dues revenue.
              </div>
            </div>
          }
        >
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
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent) 0%, color-mix(in srgb, var(--accent) 4%, transparent) 100%)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }}>
          <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Intelligence Insights</span>
        </div>
        <div className="flex-1 h-px" style={{ background: 'color-mix(in srgb, var(--accent) 15%, var(--card-border))' }} />
        <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>AI-driven recommendations</span>
      </div>
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
            href: '/send-brain',
          },
          {
            icon: MousePointerClick,
            label: 'Top CTA',
            metric: '"Renew Your Membership"',
            numericValue: 39.2,
            numericSuffix: '% CTR',
            note: '8x better than "Learn More"',
            color: C.green,
            href: '/campaigns',
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
            href: '/roi-calc',
          },
          {
            icon: Heart,
            label: 'Address Health',
            metric: '',
            numericValue: demoHygiene.healthy.pct,
            numericSuffix: '% healthy',
            note: `${demoHygiene.total.toLocaleString()} addresses — ${demoHygiene.projectedDelivery}% projected delivery`,
            color: demoHygiene.healthy.pct >= 75 ? C.green : C.orange,
            href: '/hygiene',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="rounded-xl border p-5 backdrop-blur-md transition-all duration-200 hover:translate-y-[-2px] cursor-pointer"
              onClick={() => router.push(card.href)}
              style={{
                background: 'var(--glass-bg)',
                borderColor: 'var(--glass-border)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
                borderTopWidth: '2px',
                borderTopColor: card.color,
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
                    className="text-left px-5 py-3 text-[9px] uppercase tracking-wider font-bold"
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
                    className="cursor-pointer transition-colors"
                    onClick={() => router.push('/campaigns')}
                    style={{ borderBottom: '1px solid var(--card-border)' }}
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
                            <MiniBar value={or} max={100} color={or >= 40 ? C.green : or >= 25 ? C.orange : C.red} height={5} />
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
          11. QUICK ACTIONS BAR (Floating Bottom)
          ─────────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 no-print"
        style={{
          background: 'linear-gradient(to top, var(--background) 0%, var(--background) 40%, transparent 100%)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 pb-4 pt-6">
          <div
            className="flex items-center justify-center gap-2 md:gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl"
            style={{
              background: 'color-mix(in srgb, var(--card) 85%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent) 20%, var(--card-border))',
              boxShadow: '0 -4px 32px rgba(0,0,0,0.2), 0 0 0 1px color-mix(in srgb, var(--accent) 8%, transparent)',
            }}
          >
            {[
              { icon: PenLine, label: 'Log Outreach', color: C.blue, href: '/engagement-log' },
              { icon: Rocket, label: 'Send Campaign', color: C.green, href: '/campaign-builder' },
              { icon: Bell, label: 'Check Alerts', color: C.orange, href: '/decay-radar' },
              { icon: FileText, label: 'Print Report', color: C.purple, href: '' },
            ].map((btn, i) => {
              const BtnIcon = btn.icon;
              return (
                <button
                  key={i}
                  aria-label={btn.label}
                  title={btn.label}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-200 hover:scale-[1.03] group"
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
                    else if (btn.href) router.push(btn.href);
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
