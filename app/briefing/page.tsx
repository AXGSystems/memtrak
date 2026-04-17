'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi, { MiniBar } from '@/components/SparkKpi';
import ProgressRing from '@/components/ProgressRing';
import PageGuide, { type GuideContent } from '@/components/PageGuide';

import {
  getCampaignTotals, demoDecayAlerts, demoChurnScores,
  demoCampaigns, demoSendTimes, demoRelationships, demoHygiene, demoMonthly,
} from '@/lib/demo-data';
import {
  BookOpen, Printer, Copy, CheckCircle, Mail, Shield,
  AlertTriangle, TrendingDown, Target,
  ArrowRight, Zap, Heart, Star, UserX, Eye, MousePointerClick,
  DollarSign, AlertOctagon, CalendarClock,
} from 'lucide-react';

/* ── Colors ─────────────────────────────────────────────── */
const GOLD = '#C6A75E';
const C = { navy: '#002D5C', blue: '#4A90D9', green: '#8CC63F', red: '#D94A4A', orange: '#E8923F', gray: '#888888' };

/* ── Computed data ──────────────────────────────────────── */
const totals = getCampaignTotals();
const sent = demoCampaigns.filter(c => c.status === 'Sent');
const topCamp = [...sent].sort((a, b) => b.revenue - a.revenue)[0];
const openRate = ((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1);
const clickRate = ((totals.totalClicked / totals.totalDelivered) * 100).toFixed(1);
const bounceRate = ((totals.totalBounced / totals.totalSent) * 100).toFixed(1);
const decayHigh = demoDecayAlerts.filter(d => d.decay >= 70);
const churnHigh = demoChurnScores.filter(c => c.score >= 70);
const decayRevenue = decayHigh.reduce((s, d) => s + d.revenue, 0);

/* funnel */
const funnelSent = totals.totalSent;
const funnelDelivered = totals.totalDelivered;
const funnelOpened = totals.totalOpened;
const funnelClicked = totals.totalClicked;
const funnelDelivPct = ((funnelDelivered / funnelSent) * 100).toFixed(1);
const funnelOpenPct = ((funnelOpened / funnelDelivered) * 100).toFixed(1);
const funnelClickPct = ((funnelClicked / funnelOpened) * 100).toFixed(1);

/* engagement tiers */
const engagementTiers = [
  { label: 'Champions (90-100)', count: 420, color: C.green, icon: Star },
  { label: 'Engaged (70-89)', count: 1850, color: C.blue, icon: Heart },
  { label: 'At Risk (50-69)', count: 1520, color: C.orange, icon: AlertTriangle },
  { label: 'Disengaged (25-49)', count: 860, color: C.red, icon: TrendingDown },
  { label: 'Gone Dark (0-24)', count: 344, color: C.gray, icon: UserX },
];
const maxTier = Math.max(...engagementTiers.map(t => t.count));
const totalMembers = engagementTiers.reduce((s, t) => s + t.count, 0);

/* sparkline data derived from monthly */
const openRateSpark = demoMonthly.map(m => parseFloat(((m.opened / m.delivered) * 100).toFixed(1)));
const clickRateSpark = demoMonthly.map(m => parseFloat(((m.clicked / m.delivered) * 100).toFixed(1)));
const revenueSpark = [214000, 198000, 287000, totals.totalRevenue];
const bounceSpark = demoMonthly.map(m => parseFloat(((m.bounced / m.sent) * 100).toFixed(1)));

/* ── Section label ──────────────────────────────────────── */
function SectionLabel({ children }: { children: string }) {
  return (
    <div
      className="text-[10px] font-extrabold tracking-[2.5px] uppercase mb-4"
      style={{ color: GOLD }}
    >
      {children}
    </div>
  );
}

/* ── Funnel Step ────────────────────────────────────────── */
function FunnelStep({ label, value, pct, color, maxVal }: { label: string; value: number; pct: string; color: string; maxVal: number }) {
  const widthPct = (value / maxVal) * 100;
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="w-[72px] text-right">
        <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{label}</span>
      </div>
      <div className="flex-1 relative" style={{ height: 28 }}>
        <div
          className="absolute inset-y-0 left-0 rounded-md flex items-center justify-end pr-3 transition-all duration-700"
          style={{ width: `${widthPct}%`, background: color, minWidth: 80 }}
        >
          <span className="text-[11px] font-extrabold" style={{ color: '#ffffff' }}>{value.toLocaleString()}</span>
        </div>
      </div>
      <div className="w-[52px] text-right">
        <span className="text-[10px] font-bold" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

/* ── Guide ──────────────────────────────────────────────── */
const briefingGuide: GuideContent = {
  title: 'Daily Intelligence Report',
  purpose: 'A premium intelligence dashboard summarizing email performance, priority actions, and staff outreach. Use the action buttons to generate email-formatted HTML for Outlook or print as PDF.',
  steps: [
    { label: 'Review the dashboard', detail: 'The report renders natively below using your latest campaign data. Scroll through to review KPIs, alerts, and recommendations.' },
    { label: 'Copy HTML for email', detail: 'Click "Copy HTML" to place the full email markup on your clipboard. Open Outlook, create a new message, and paste — formatting is preserved via inline styles.' },
    { label: 'Print as PDF', detail: 'Click "Print PDF" to open the briefing in a clean print window. Save as PDF for archival or attachment.' },
    { label: 'Send to Team', detail: 'Use "Send to Team" to distribute the briefing to the membership team distribution list (coming soon).' },
  ],
  keyMetrics: [
    { label: 'Open Rate', why: 'Percentage of delivered emails opened at least once. Association industry average is 25-35%. ALTA consistently outperforms.' },
    { label: 'Delivery Funnel', why: 'Tracks attrition from send to click. Each drop-off point reveals where to optimize.' },
    { label: 'Engagement Decay', why: 'Members whose open rates have dropped significantly. High-decay members are 3-5x more likely to not renew.' },
    { label: 'Revenue Attribution', why: 'Revenue tied to email campaigns through tracked conversions.' },
  ],
  tips: [
    'Send the briefing every Monday and Thursday morning for consistent team visibility.',
    'Use the Priority Actions section in staff meetings to assign follow-up owners.',
    'Compare open rates week-over-week to spot subject line patterns that work.',
  ],
};

/* ═══════════════════════════════════════════════════════════
   EMAIL HTML BUILDER — used ONLY for Copy / Print / Send
   ═══════════════════════════════════════════════════════════ */
function buildBriefingHtml(date: string) {
  const execNarrative = topCamp
    ? `This week's analysis reveals a membership engagement program performing well above industry benchmarks. Your ${openRate}% open rate places ALTA in the top decile of association email programs nationally — the industry average hovers between 25% and 35%. The standout campaign, <strong>${topCamp.name}</strong>, generated <strong>$${(topCamp.revenue / 1000).toFixed(0)}K in attributed revenue</strong> from ${topCamp.listSize.toLocaleString()} recipients, demonstrating the direct revenue impact of targeted member communications.${decayHigh.length > 0 ? ` However, ${decayHigh.length} high-priority engagement decay alerts demand attention — <strong style="color:#D94A4A;">$${decayRevenue.toLocaleString()} in annual revenue</strong> is at risk from members who have stopped opening emails, a pattern that historically precedes non-renewal within 3 to 6 months.` : ''}`
    : `Your ${totals.campaignCount} campaigns this period reached ${totals.totalSent.toLocaleString()} recipients with a ${openRate}% open rate — well above the 25-35% association industry average.`;

  return `<div style="max-width:640px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#2c3e50;line-height:1.6;">
  <div style="background:linear-gradient(135deg,#002D5C 0%,#0a3d6b 50%,#1B3A5C 100%);padding:32px 36px 28px;border-radius:12px 12px 0 0;">
    <table style="width:100%;border-collapse:collapse;"><tr>
      <td style="vertical-align:top;">
        <div style="font-size:11px;font-weight:800;color:#C6A75E;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:6px;">MEMTrak Intelligence</div>
        <div style="font-size:22px;font-weight:800;color:#ffffff;line-height:1.2;margin-bottom:4px;">Daily Email Briefing</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.55);margin-top:8px;">${date}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px;">Prepared for the ALTA Membership Team</div>
      </td>
      <td style="text-align:right;vertical-align:top;padding-top:4px;">
        <div style="font-size:10px;color:rgba(255,255,255,0.3);line-height:1.5;">American Land Title Association<br>by AXG Systems</div>
        <div style="margin-top:10px;display:inline-block;padding:4px 12px;border-radius:20px;background:rgba(198,167,94,0.15);border:1px solid rgba(198,167,94,0.3);">
          <span style="font-size:10px;font-weight:700;color:#C6A75E;letter-spacing:0.5px;">CONFIDENTIAL</span>
        </div>
      </td>
    </tr></table>
  </div>
  <div style="background:#ffffff;padding:0;border:1px solid #e2e5ea;border-top:none;">
    <div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Executive Summary</div>
      <p style="font-size:13px;color:#2c3e50;line-height:1.9;margin:0;">${execNarrative}</p>
    </div>
    <div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Performance Dashboard</div>
      <table style="width:100%;border-collapse:collapse;"><tr>
        <td style="width:25%;padding:0 6px 0 0;vertical-align:top;"><div style="background:#f8f9fb;border:1px solid #e2e5ea;border-top:3px solid #8CC63F;border-radius:8px;padding:16px 14px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#002D5C;">${openRate}%</div><div style="font-size:10px;color:#6b7280;margin-top:4px;font-weight:600;">Open Rate</div><div style="font-size:9px;color:#8CC63F;font-weight:700;margin-top:6px;">vs 25-35% industry</div></div></td>
        <td style="width:25%;padding:0 3px;vertical-align:top;"><div style="background:#f8f9fb;border:1px solid #e2e5ea;border-top:3px solid #8CC63F;border-radius:8px;padding:16px 14px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#002D5C;">${clickRate}%</div><div style="font-size:10px;color:#6b7280;margin-top:4px;font-weight:600;">Click Rate</div><div style="font-size:9px;color:#8CC63F;font-weight:700;margin-top:6px;">3x industry avg</div></div></td>
        <td style="width:25%;padding:0 3px;vertical-align:top;"><div style="background:#f8f9fb;border:1px solid #e2e5ea;border-top:3px solid #4A90D9;border-radius:8px;padding:16px 14px;text-align:center;"><div style="font-size:24px;font-weight:800;color:#002D5C;">$${(totals.totalRevenue / 1000).toFixed(0)}K</div><div style="font-size:10px;color:#6b7280;margin-top:4px;font-weight:600;">Revenue</div><div style="font-size:9px;color:#4A90D9;font-weight:700;margin-top:6px;">${sent.filter(c => c.revenue > 0).length} campaigns</div></div></td>
        <td style="width:25%;padding:0 0 0 6px;vertical-align:top;"><div style="background:#f8f9fb;border:1px solid #e2e5ea;border-top:3px solid ${parseFloat(bounceRate) > 3 ? '#D94A4A' : '#8CC63F'};border-radius:8px;padding:16px 14px;text-align:center;"><div style="font-size:24px;font-weight:800;color:${parseFloat(bounceRate) > 3 ? '#D94A4A' : '#002D5C'};">${bounceRate}%</div><div style="font-size:10px;color:#6b7280;margin-top:4px;font-weight:600;">Bounce Rate</div><div style="font-size:9px;color:${parseFloat(bounceRate) > 3 ? '#D94A4A' : '#8CC63F'};font-weight:700;margin-top:6px;">vs &lt;2% target</div></div></td>
      </tr></table>
    </div>
    <div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Delivery Funnel</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="width:80px;padding:6px 0;font-size:11px;font-weight:700;color:#002D5C;">Sent</td><td style="padding:6px 8px;"><div style="background:#002D5C;height:28px;border-radius:4px;width:100%;position:relative;"><div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:800;color:#ffffff;">${funnelSent.toLocaleString()}</div></div></td><td style="width:60px;padding:6px 0;font-size:10px;color:#6b7280;text-align:right;">100%</td></tr>
        <tr><td style="width:80px;padding:6px 0;font-size:11px;font-weight:700;color:#002D5C;">Delivered</td><td style="padding:6px 8px;"><div style="background:#1B3A5C;height:28px;border-radius:4px;width:${funnelDelivPct}%;position:relative;"><div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:800;color:#ffffff;">${funnelDelivered.toLocaleString()}</div></div></td><td style="width:60px;padding:6px 0;font-size:10px;color:#8CC63F;text-align:right;font-weight:700;">${funnelDelivPct}%</td></tr>
        <tr><td style="width:80px;padding:6px 0;font-size:11px;font-weight:700;color:#002D5C;">Opened</td><td style="padding:6px 8px;"><div style="background:#4A90D9;height:28px;border-radius:4px;width:${(funnelOpened / funnelSent * 100).toFixed(1)}%;position:relative;"><div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:800;color:#ffffff;">${funnelOpened.toLocaleString()}</div></div></td><td style="width:60px;padding:6px 0;font-size:10px;color:#4A90D9;text-align:right;font-weight:700;">${funnelOpenPct}%</td></tr>
        <tr><td style="width:80px;padding:6px 0;font-size:11px;font-weight:700;color:#002D5C;">Clicked</td><td style="padding:6px 8px;"><div style="background:#8CC63F;height:28px;border-radius:4px;width:${(funnelClicked / funnelSent * 100).toFixed(1)}%;min-width:80px;position:relative;"><div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:800;color:#ffffff;">${funnelClicked.toLocaleString()}</div></div></td><td style="width:60px;padding:6px 0;font-size:10px;color:#8CC63F;text-align:right;font-weight:700;">${funnelClickPct}%</td></tr>
      </table>
    </div>
    ${decayHigh.length > 0 ? `<div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;"><div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Priority Actions</div>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-left:5px solid #D94A4A;border-radius:8px;padding:16px 18px;margin-bottom:14px;">
        <div style="font-size:13px;font-weight:800;color:#991b1b;">${decayHigh.length} Engagement Decay Alerts — $${decayRevenue.toLocaleString()}/yr at risk</div>
        <table style="width:100%;font-size:11px;margin-top:8px;border-collapse:collapse;">${decayHigh.map(d => `<tr style="border-top:1px solid #fecaca;"><td style="padding:6px 0;font-weight:700;color:#991b1b;">${d.org}</td><td style="text-align:right;padding:6px 0;font-weight:800;color:#D94A4A;">$${d.revenue.toLocaleString()}/yr</td></tr>`).join('')}</table>
      </div>
    </div>` : ''}
    <div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Campaign Performance</div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <tr style="background:#002D5C;"><th style="padding:10px 12px;text-align:left;color:#ffffff;font-weight:700;font-size:10px;">Campaign</th><th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Sent</th><th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Open Rate</th><th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Clicks</th><th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Revenue</th></tr>
        ${[...sent].sort((a, b) => b.revenue - a.revenue).slice(0, 7).map((c, i) => {
          const or = (c.uniqueOpened / c.delivered * 100);
          const orColor = or >= 50 ? '#8CC63F' : or >= 35 ? '#4A90D9' : or >= 25 ? '#E8923F' : '#D94A4A';
          return `<tr style="border-bottom:1px solid #e2e5ea;${i % 2 === 1 ? 'background:#f8f9fb;' : ''}"><td style="padding:10px 12px;font-weight:600;color:#002D5C;">${c.name}</td><td style="padding:10px 12px;text-align:right;color:#6b7280;">${c.listSize.toLocaleString()}</td><td style="padding:10px 12px;text-align:right;font-weight:800;color:${orColor};">${or.toFixed(1)}%</td><td style="padding:10px 12px;text-align:right;color:#6b7280;">${c.clicked.toLocaleString()}</td><td style="padding:10px 12px;text-align:right;font-weight:700;${c.revenue > 0 ? 'color:#8CC63F;' : 'color:#d1d5db;'}">${c.revenue > 0 ? '$' + (c.revenue >= 1000 ? (c.revenue / 1000).toFixed(0) + 'K' : c.revenue.toLocaleString()) : '\u2014'}</td></tr>`;
        }).join('')}
      </table>
    </div>
    <div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Staff Outreach Performance</div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <tr style="background:#002D5C;"><th style="padding:10px 12px;text-align:left;color:#ffffff;font-weight:700;font-size:10px;">Staff</th><th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Outreach</th><th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Reply Rate</th><th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Response</th></tr>
        ${demoRelationships.map((r, i) => {
          const replyColor = r.replyRate >= 50 ? '#8CC63F' : r.replyRate >= 30 ? '#4A90D9' : '#E8923F';
          return `<tr style="border-bottom:1px solid #e2e5ea;${i % 2 === 1 ? 'background:#f8f9fb;' : ''}"><td style="padding:10px 12px;font-weight:600;color:#002D5C;">${r.staff}</td><td style="padding:10px 12px;text-align:right;color:#6b7280;">${r.outreach}</td><td style="padding:10px 12px;text-align:right;font-weight:800;color:${replyColor};">${r.replyRate}%</td><td style="padding:10px 12px;text-align:right;color:#6b7280;">${r.responseTime}</td></tr>`;
        }).join('')}
      </table>
    </div>
    <div style="padding:28px 36px;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Optimal Send Windows</div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        ${demoSendTimes.map((s, i) => `<tr style="border-bottom:1px solid #e2e5ea;${i % 2 === 1 ? 'background:#f8f9fb;' : ''}"><td style="padding:10px 12px;font-weight:600;color:#002D5C;">${s.segment}</td><td style="padding:10px 12px;color:#6b7280;">${s.day}, ${s.time}</td><td style="padding:10px 12px;text-align:right;font-weight:800;color:${s.openRate >= 50 ? '#8CC63F' : '#4A90D9'};">${s.openRate}% predicted</td></tr>`).join('')}
      </table>
    </div>
  </div>
  <div style="background:linear-gradient(135deg,#f8f9fb 0%,#eef0f4 100%);padding:24px 36px;border:1px solid #e2e5ea;border-top:none;border-radius:0 0 12px 12px;text-align:center;">
    <div style="font-size:10px;font-weight:700;color:#002D5C;">MEMTrak — Email Intelligence Platform</div>
    <div style="font-size:9px;color:#9ca3af;margin-top:4px;">American Land Title Association — Built by AXG Systems<br>Generated ${new Date().toLocaleString()} — Confidential: Internal Use Only</div>
  </div>
</div>`;
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function Briefing() {
  const [copied, setCopied] = useState(false);
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const briefingHtml = buildBriefingHtml(date);

  /* Exec narrative (plain text version for native rendering) */
  const narrativeParts: React.ReactNode[] = [];
  if (topCamp) {
    narrativeParts.push(
      <span key="n1">
        This week&rsquo;s analysis reveals a membership engagement program performing well above industry benchmarks.
        Your <strong style={{ color: C.green }}>{openRate}%</strong> open rate places ALTA in the top decile of
        association email programs nationally — the industry average hovers between 25% and 35%. The standout campaign,{' '}
        <strong style={{ color: 'var(--heading)' }}>{topCamp.name}</strong>, generated{' '}
        <strong style={{ color: C.green }}>${(topCamp.revenue / 1000).toFixed(0)}K in attributed revenue</strong> from{' '}
        {topCamp.listSize.toLocaleString()} recipients, demonstrating the direct revenue impact of targeted member communications.
      </span>
    );
    if (decayHigh.length > 0) {
      narrativeParts.push(
        <span key="n2">
          {' '}However, {decayHigh.length} high-priority engagement decay alerts demand attention —{' '}
          <strong style={{ color: C.red }}>${decayRevenue.toLocaleString()} in annual revenue</strong> is at risk
          from members who have stopped opening emails, a pattern that historically precedes non-renewal within 3 to 6 months.
        </span>
      );
    }
  }

  return (
    <div className="p-6 space-y-6">

      {/* ═══════════ 1. HEADER ═══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
            style={{ background: `color-mix(in srgb, ${GOLD} 15%, transparent)` }}
          >
            <BookOpen className="w-5 h-5" style={{ color: GOLD }} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>Daily Intelligence Report</h1>
              <span
                className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide"
                style={{ background: `color-mix(in srgb, ${GOLD} 12%, transparent)`, color: GOLD, border: `1px solid color-mix(in srgb, ${GOLD} 25%, transparent)` }}
              >
                CONFIDENTIAL
              </span>
              <PageGuide pageId="briefing" guide={briefingGuide} />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {date} &mdash; Prepared for the ALTA Membership Team
            </p>
          </div>
        </div>
        <div className="flex gap-2 no-print flex-shrink-0">
          <button
            onClick={() => {
              const w = window.open('', '_blank');
              if (!w) return;
              w.document.write(`<!DOCTYPE html><html><head><title>MEMTrak Daily Briefing</title><style>
                body { margin: 0; padding: 40px; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                @media print { body { padding: 20px; } @page { margin: 0.5in; } }
              </style></head><body>${briefingHtml}</body></html>`);
              w.document.close();
              setTimeout(() => { w.print(); w.close(); }, 500);
            }}
            className="flex items-center gap-2 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              padding: '10px 16px',
              background: 'linear-gradient(135deg, var(--glass-bg) 0%, transparent 100%)',
              border: '1px solid var(--glass-border)',
              color: 'var(--heading)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              backdropFilter: 'blur(16px)',
            }}
          >
            <Printer className="w-3.5 h-3.5" /> Print PDF
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(briefingHtml);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-2 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              padding: '10px 16px',
              background: C.blue,
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {copied
              ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</>
              : <><Copy className="w-3.5 h-3.5" /> Copy HTML</>
            }
          </button>
          <button
            className="flex items-center gap-2 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              padding: '10px 16px',
              background: 'var(--accent)',
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Mail className="w-3.5 h-3.5" /> Send to Team
          </button>
        </div>
      </div>

      {/* ═══════════ 2. EXECUTIVE SUMMARY ═══════════ */}
      <Card glass>
        <SectionLabel>Executive Summary</SectionLabel>
        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {narrativeParts.length > 0 ? narrativeParts : (
            <>Your {totals.campaignCount} campaigns this period reached {totals.totalSent.toLocaleString()} recipients with a {openRate}% open rate.</>
          )}
        </p>
      </Card>

      {/* ═══════════ 3. PERFORMANCE DASHBOARD ═══════════ */}
      <div>
        <SectionLabel>Performance Dashboard &mdash; April YTD</SectionLabel>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
          <SparkKpi
            label="Open Rate"
            value={`${openRate}%`}
            sub="vs 25-35% industry avg"
            sparkData={openRateSpark}
            sparkColor={C.green}
            color={C.green}
            icon={Eye}
            accent
            trend={{ value: parseFloat((openRateSpark[openRateSpark.length - 1] - openRateSpark[openRateSpark.length - 2]).toFixed(1)), label: 'vs last month' }}
            detail={
              <div className="space-y-3">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  ALTA&rsquo;s {openRate}% open rate places you in the top decile of association email programs. The industry average is 25-35%.
                </p>
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Monthly Trend</div>
                {demoMonthly.map(m => (
                  <div key={m.month} className="flex items-center gap-2">
                    <span className="text-[10px] w-8 font-bold" style={{ color: 'var(--text-muted)' }}>{m.month}</span>
                    <MiniBar value={(m.opened / m.delivered) * 100} max={60} color={C.green} height={6} />
                    <span className="text-[10px] font-bold" style={{ color: C.green }}>{((m.opened / m.delivered) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            }
          />
          <SparkKpi
            label="Click Rate"
            value={`${clickRate}%`}
            sub="3x industry avg"
            sparkData={clickRateSpark}
            sparkColor={C.green}
            color={C.green}
            icon={MousePointerClick}
            accent
            trend={{ value: parseFloat((clickRateSpark[clickRateSpark.length - 1] - clickRateSpark[clickRateSpark.length - 2]).toFixed(1)), label: 'vs last month' }}
            detail={
              <div className="space-y-3">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click-through rate by campaign with CTA analysis.</p>
                <div className="space-y-1">
                  {sent.filter(c => c.clicked > 0).slice(0, 5).map(c => {
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
            label="Revenue"
            value={`$${(totals.totalRevenue / 1000).toFixed(0)}K`}
            sub={`${sent.filter(c => c.revenue > 0).length} attributed campaigns`}
            sparkData={revenueSpark}
            sparkColor={C.blue}
            color={C.blue}
            icon={DollarSign}
            accent
            trend={{ value: parseFloat(((totals.totalRevenue - revenueSpark[2]) / revenueSpark[2] * 100).toFixed(1)), label: 'vs Mar' }}
            detail={
              <div className="space-y-3">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Revenue attributed to email campaigns via tracked conversions.</p>
                <div className="space-y-1">
                  {sent.filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--background)' }}>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold truncate block" style={{ color: 'var(--heading)' }}>{c.name}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.listSize.toLocaleString()} sent</span>
                      </div>
                      <span className="text-sm font-extrabold" style={{ color: C.green }}>${(c.revenue / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              </div>
            }
          />
          <SparkKpi
            label="Bounce Rate"
            value={`${bounceRate}%`}
            sub={parseFloat(bounceRate) > 2 ? 'Above 2% target' : 'Within 2% target'}
            sparkData={bounceSpark}
            sparkColor={parseFloat(bounceRate) > 3 ? C.red : C.green}
            color={parseFloat(bounceRate) > 3 ? C.red : C.green}
            icon={AlertOctagon}
            accent
            detail={
              <div className="space-y-2">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Current bounce rate of {bounceRate}% {parseFloat(bounceRate) > 2 ? 'exceeds' : 'is near'} the 2% industry ceiling.
                  Running address hygiene cleanup would improve delivery rate from {demoHygiene.currentDelivery}% to {demoHygiene.projectedDelivery}%.
                </p>
                <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                  <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Hygiene Breakdown</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Bounced: <strong style={{ color: C.red }}>{demoHygiene.bounced.count}</strong></div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Stale: <strong style={{ color: C.orange }}>{demoHygiene.stale.count.toLocaleString()}</strong></div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Invalid: <strong style={{ color: C.red }}>{demoHygiene.invalid.count}</strong></div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Risky: <strong style={{ color: C.orange }}>{demoHygiene.risky.count}</strong></div>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </div>

      {/* ═══════════ 4. DELIVERY FUNNEL ═══════════ */}
      <Card
        glass
        title="Delivery Funnel"
        subtitle={`${totals.campaignCount} campaigns — ${funnelSent.toLocaleString()} sent`}
        detailTitle="Delivery Funnel — Full Breakdown"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Funnel conversion: {funnelDelivPct}% delivery &rarr; {funnelOpenPct}% of delivered opened &rarr; {funnelClickPct}% of opened clicked.
              Your open-to-click conversion of {funnelClickPct}% indicates strong content relevance — the industry average is 15-20%.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                <div className="text-lg font-extrabold" style={{ color: C.green }}>{funnelDelivPct}%</div>
                <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>Delivery Rate</div>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                <div className="text-lg font-extrabold" style={{ color: C.blue }}>{funnelOpenPct}%</div>
                <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>Open Rate</div>
              </div>
              <div className="text-center p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                <div className="text-lg font-extrabold" style={{ color: C.green }}>{funnelClickPct}%</div>
                <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>Click-to-Open</div>
              </div>
            </div>
          </div>
        }
      >
        <SectionLabel>Delivery Funnel</SectionLabel>
        <div className="space-y-0">
          <FunnelStep label="Sent" value={funnelSent} pct="100" color={C.navy} maxVal={funnelSent} />
          <div className="flex items-center gap-1 ml-[84px] my-1">
            <ArrowRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            <span className="text-[9px] font-bold" style={{ color: C.green }}>{funnelDelivPct}% delivered</span>
          </div>
          <FunnelStep label="Delivered" value={funnelDelivered} pct={funnelDelivPct} color="#1B3A5C" maxVal={funnelSent} />
          <div className="flex items-center gap-1 ml-[84px] my-1">
            <ArrowRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            <span className="text-[9px] font-bold" style={{ color: C.blue }}>{funnelOpenPct}% opened</span>
          </div>
          <FunnelStep label="Opened" value={funnelOpened} pct={((funnelOpened / funnelSent) * 100).toFixed(1)} color={C.blue} maxVal={funnelSent} />
          <div className="flex items-center gap-1 ml-[84px] my-1">
            <ArrowRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            <span className="text-[9px] font-bold" style={{ color: C.green }}>{funnelClickPct}% clicked</span>
          </div>
          <FunnelStep label="Clicked" value={funnelClicked} pct={((funnelClicked / funnelSent) * 100).toFixed(1)} color={C.green} maxVal={funnelSent} />
        </div>
        <div className="mt-4 rounded-lg p-3 text-[10px]" style={{ background: 'var(--background)', color: 'var(--text-muted)' }}>
          Your open-to-click conversion of {funnelClickPct}% indicates strong content relevance — the industry average is 15-20%.
        </div>
      </Card>

      {/* ═══════════ 5. PRIORITY ACTIONS ═══════════ */}
      <div>
        <SectionLabel>Priority Actions</SectionLabel>
        <div className="space-y-3">
          {/* Decay Alerts */}
          {decayHigh.length > 0 && (
            <Card glass accent={C.red}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide mb-2"
                    style={{ background: `color-mix(in srgb, ${C.red} 20%, transparent)`, color: C.red }}
                  >
                    URGENT
                  </span>
                  <h4 className="text-[13px] font-extrabold" style={{ color: 'var(--heading)' }}>
                    {decayHigh.length} Engagement Decay Alerts
                  </h4>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    These members have stopped opening emails — a pattern that predicts non-renewal within 3-6 months.
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[9px] font-bold" style={{ color: C.red }}>REVENUE AT RISK</div>
                  <div className="text-xl font-extrabold" style={{ color: C.red }}>${decayRevenue.toLocaleString()}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>per year</div>
                </div>
              </div>
              <div className="mt-3 space-y-0">
                {decayHigh.map(d => (
                  <div key={d.org} className="flex items-center justify-between py-2" style={{ borderTop: `1px solid color-mix(in srgb, ${C.red} 15%, transparent)` }}>
                    <div>
                      <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{d.org}</span>
                      <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>{d.type}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Last open: {d.lastOpen}</span>
                      <span className="text-[11px] font-extrabold" style={{ color: C.red }}>${d.revenue.toLocaleString()}/yr</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg p-3 text-[10px] font-semibold leading-relaxed" style={{ background: `color-mix(in srgb, ${C.red} 8%, transparent)`, color: C.red }}>
                Recommended: Assign personal outreach within 48 hours. For First American ($61,554/yr), escalate to CEO-level check-in.
              </div>
            </Card>
          )}

          {/* Bounce Cleanup */}
          <Card glass accent={C.orange}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide mb-2"
                  style={{ background: `color-mix(in srgb, ${C.orange} 20%, transparent)`, color: C.orange }}
                >
                  MEDIUM
                </span>
                <h4 className="text-[13px] font-extrabold" style={{ color: 'var(--heading)' }}>
                  {totals.totalBounced} Bounced Addresses Need Cleanup
                </h4>
                <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Sending to invalid addresses damages domain reputation. Current bounce rate ({bounceRate}%) {parseFloat(bounceRate) > 2 ? 'exceeds' : 'is near'} the 2% industry ceiling.
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[9px] font-bold" style={{ color: C.orange }}>BOUNCE RATE</div>
                <div className="text-xl font-extrabold" style={{ color: C.orange }}>{bounceRate}%</div>
              </div>
            </div>
            <div className="mt-3 rounded-lg p-3 text-[10px] font-semibold leading-relaxed" style={{ background: `color-mix(in srgb, ${C.orange} 8%, transparent)`, color: C.orange }}>
              Recommended: Run Address Hygiene cleanup. Removing {totals.totalBounced} bounced addresses will improve delivery from {demoHygiene.currentDelivery}% to {demoHygiene.projectedDelivery}%.
            </div>
          </Card>

          {/* Churn Risk */}
          {churnHigh.length > 0 && (
            <Card glass accent={C.red}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide mb-2"
                    style={{ background: `color-mix(in srgb, ${C.red} 20%, transparent)`, color: C.red }}
                  >
                    URGENT
                  </span>
                  <h4 className="text-[13px] font-extrabold" style={{ color: 'var(--heading)' }}>
                    {churnHigh.length} Members at High Churn Risk
                  </h4>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[9px] font-bold" style={{ color: C.red }}>COMBINED RISK</div>
                  <div className="text-xl font-extrabold" style={{ color: C.red }}>${churnHigh.reduce((s, c) => s + c.revenue, 0).toLocaleString()}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>per year</div>
                </div>
              </div>
              <div className="mt-3 space-y-0">
                {churnHigh.map(c => (
                  <div key={c.org} className="flex items-center justify-between py-2" style={{ borderTop: `1px solid color-mix(in srgb, ${C.red} 15%, transparent)` }}>
                    <div>
                      <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{c.org}</span>
                      <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>{c.type}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-extrabold"
                        style={{ background: `color-mix(in srgb, ${C.red} 15%, transparent)`, color: C.red }}
                      >
                        {c.score}% risk
                      </span>
                      <span className="text-[10px] font-semibold" style={{ color: C.green }}>{c.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Renewal Planning */}
          <Card glass accent={C.blue}>
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide mb-2"
              style={{ background: `color-mix(in srgb, ${C.blue} 20%, transparent)`, color: C.blue }}
            >
              PLANNING
            </span>
            <h4 className="text-[13px] font-extrabold" style={{ color: 'var(--heading)' }}>
              Renewal Season Preparation
            </h4>
            <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              4,994 members need renewal communications by Q4. The automated renewal sequence should be finalized by July.
              ACU underwriters ($61,554/yr each) should receive CEO-personal outreach — MEMTrak relationship data shows Chris Morton has an 88% reply rate with ACU members.
            </p>
          </Card>
        </div>
      </div>

      {/* ═══════════ 6. CAMPAIGN PERFORMANCE ═══════════ */}
      <Card
        glass
        title="Campaign Performance"
        subtitle={`${sent.length} sent campaigns — sorted by revenue`}
        detailTitle="Campaign Performance — Full Detail"
        detailContent={
          <div className="space-y-3">
            {[...sent].sort((a, b) => b.revenue - a.revenue).map(c => {
              const or = (c.uniqueOpened / c.delivered * 100);
              const orColor = or >= 50 ? C.green : or >= 35 ? C.blue : or >= 25 ? C.orange : C.red;
              return (
                <div key={c.id} className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{c.name}</div>
                    <div className="text-xs font-extrabold" style={{ color: c.revenue > 0 ? C.green : 'var(--text-muted)' }}>
                      {c.revenue > 0 ? `$${(c.revenue / 1000).toFixed(0)}K` : '\u2014'}
                    </div>
                  </div>
                  <div className="flex gap-4 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Sent: {c.listSize.toLocaleString()}</span>
                    <span>Open: <strong style={{ color: orColor }}>{or.toFixed(1)}%</strong></span>
                    <span>Clicks: {c.clicked.toLocaleString()}</span>
                    <span>Bounced: {c.bounced}</span>
                  </div>
                </div>
              );
            })}
          </div>
        }
      >
        <SectionLabel>Campaign Performance</SectionLabel>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th className="text-left pb-3 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Campaign</th>
                <th className="text-right pb-3 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Sent</th>
                <th className="text-right pb-3 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Open Rate</th>
                <th className="pb-3 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)', width: 80, textAlign: 'center' }}></th>
                <th className="text-right pb-3 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Clicks</th>
                <th className="text-right pb-3 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[...sent].sort((a, b) => b.revenue - a.revenue).slice(0, 7).map((c) => {
                const or = (c.uniqueOpened / c.delivered * 100);
                const orColor = or >= 50 ? C.green : or >= 35 ? C.blue : or >= 25 ? C.orange : C.red;
                return (
                  <tr key={c.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold text-[11px]" style={{ color: 'var(--heading)' }}>{c.name}</span>
                    </td>
                    <td className="py-2.5 text-right" style={{ color: 'var(--text-muted)' }}>{c.listSize.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-extrabold" style={{ color: orColor }}>{or.toFixed(1)}%</td>
                    <td className="py-2.5 px-2"><MiniBar value={or} max={100} color={orColor} height={4} /></td>
                    <td className="py-2.5 text-right" style={{ color: 'var(--text-muted)' }}>{c.clicked.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-bold" style={{ color: c.revenue > 0 ? C.green : 'var(--text-muted)' }}>
                      {c.revenue > 0 ? `$${c.revenue >= 1000 ? (c.revenue / 1000).toFixed(0) + 'K' : c.revenue.toLocaleString()}` : '\u2014'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {topCamp && (
          <div className="mt-4 rounded-lg p-3" style={{ background: `color-mix(in srgb, ${C.green} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${C.green} 15%, transparent)` }}>
            <div className="text-[11px] font-extrabold" style={{ color: C.green }}>
              Top Performer: {topCamp.name}
            </div>
            <p className="text-[10px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {topCamp.listSize.toLocaleString()} sent — {(topCamp.uniqueOpened / topCamp.delivered * 100).toFixed(1)}% open rate — {topCamp.clicked} clicks — <strong style={{ color: C.green }}>${(topCamp.revenue / 1000).toFixed(0)}K revenue attributed</strong>
            </p>
          </div>
        )}
      </Card>

      {/* ═══════════ 7. ENGAGEMENT HEALTH ═══════════ */}
      <Card
        glass
        title="Engagement Health"
        subtitle={`${totalMembers.toLocaleString()} total members across 5 tiers`}
        detailTitle="Engagement Health — Deep Dive"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {((engagementTiers[0].count + engagementTiers[1].count) / totalMembers * 100).toFixed(1)}% of members are in the Engaged or Champion tier.
              A healthy association targets 50%+. The {engagementTiers[2].count.toLocaleString()} &quot;At Risk&quot; members represent the highest-ROI group for intervention.
            </p>
            {engagementTiers.map(t => (
              <div key={t.label} className="flex items-center gap-3">
                <ProgressRing value={t.count} max={maxTier} color={t.color} size={48} />
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{t.label}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.count.toLocaleString()} members ({(t.count / totalMembers * 100).toFixed(1)}%)</div>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <SectionLabel>Engagement Health</SectionLabel>
        <div className="space-y-3">
          {engagementTiers.map(t => {
            const TierIcon = t.icon;
            const pctOfTotal = (t.count / totalMembers * 100).toFixed(1);
            return (
              <div key={t.label} className="flex items-center gap-3">
                <TierIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.color }} />
                <div className="w-[130px] flex-shrink-0">
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--heading)' }}>{t.label}</span>
                </div>
                <div className="flex-1">
                  <div className="relative" style={{ height: 22 }}>
                    <div className="absolute inset-0 rounded-md" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    <div
                      className="absolute inset-y-0 left-0 rounded-md transition-all duration-700"
                      style={{ width: `${(t.count / maxTier) * 100}%`, background: t.color, opacity: 0.85 }}
                    />
                    <div
                      className="absolute inset-y-0 right-2 flex items-center"
                    >
                      <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{t.count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="w-[42px] text-right flex-shrink-0">
                  <span className="text-[10px] font-bold" style={{ color: t.color }}>{pctOfTotal}%</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-lg p-3 text-[10px] leading-relaxed" style={{ background: 'var(--background)', color: 'var(--text-muted)' }}>
          {((engagementTiers[0].count + engagementTiers[1].count) / totalMembers * 100).toFixed(1)}% of members are Engaged or Champions — a healthy association targets 50%+.
          The {engagementTiers[2].count.toLocaleString()} &quot;At Risk&quot; members represent the highest-ROI group for intervention. Moving 20% back to Engaged would protect approximately $278K in annual dues revenue.
        </div>
      </Card>

      {/* ═══════════ 8. RECOMMENDED ACTIONS ═══════════ */}
      <div>
        <SectionLabel>Recommended Next Actions</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[
            {
              color: C.red,
              title: 'Launch First American Rescue Campaign',
              desc: 'Schedule CEO-personal outreach to First American Title within 48 hours. This $61,554/yr ACU member is declining and needs high-touch engagement.',
              impact: '$61K',
              icon: AlertTriangle,
            },
            {
              color: C.orange,
              title: 'Run Address Hygiene Cleanup',
              desc: `Remove ${totals.totalBounced} hard bounces and ${demoHygiene.stale.count.toLocaleString()} stale addresses. Projected to improve delivery from ${demoHygiene.currentDelivery}% to ${demoHygiene.projectedDelivery}%.`,
              impact: '+2.6%',
              icon: Shield,
            },
            {
              color: C.blue,
              title: 'Replicate Renewal Campaign Success',
              desc: 'The April Renewal Batch generated $407K from just 420 recipients. Build a second wave targeting May renewals using the same template and send-time optimization.',
              impact: '$300K+',
              icon: Target,
            },
            {
              color: C.green,
              title: 'Target "At Risk" with Re-engagement Series',
              desc: '1,520 members are trending down but not yet disengaged. A 3-email re-engagement series with value-focused content could move 20% back to Engaged, protecting $278K in annual dues.',
              impact: '$278K',
              icon: Zap,
            },
          ].map((action) => {
            const ActionIcon = action.icon;
            return (
              <Card key={action.title} glass accent={action.color}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `color-mix(in srgb, ${action.color} 15%, transparent)` }}
                    >
                      <ActionIcon className="w-4 h-4" style={{ color: action.color }} />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-extrabold" style={{ color: 'var(--heading)' }}>{action.title}</h4>
                      <p className="text-[10px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{action.desc}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[8px] font-bold uppercase tracking-wider" style={{ color: action.color }}>Impact</div>
                    <div className="text-base font-extrabold" style={{ color: action.color }}>{action.impact}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ═══════════ 9. STAFF PERFORMANCE ═══════════ */}
      <Card
        glass
        title="Staff Outreach Performance"
        subtitle="Personal outreach volume and reply metrics"
        detailTitle="Staff Outreach — Full Breakdown"
        detailContent={
          <div className="space-y-3">
            {demoRelationships.map(r => {
              const replyColor = r.replyRate >= 50 ? C.green : r.replyRate >= 30 ? C.blue : C.orange;
              return (
                <div key={r.staff} className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{r.staff}</span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-extrabold"
                      style={{ background: `color-mix(in srgb, ${replyColor} 15%, transparent)`, color: replyColor }}
                    >
                      {r.strength}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span>Outreach: <strong>{r.outreach}</strong></span>
                    <span>Reply: <strong style={{ color: replyColor }}>{r.replyRate}%</strong></span>
                    <span>Response: {r.responseTime}</span>
                  </div>
                  <MiniBar value={r.replyRate} max={100} color={replyColor} height={3} />
                </div>
              );
            })}
          </div>
        }
      >
        <SectionLabel>Staff Outreach Performance</SectionLabel>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th className="text-left pb-3 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Staff Member</th>
                <th className="text-right pb-3 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Outreach</th>
                <th className="text-right pb-3 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Reply Rate</th>
                <th className="pb-3" style={{ width: 60 }}></th>
                <th className="text-right pb-3 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Avg Response</th>
                <th className="text-right pb-3 text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Strength</th>
              </tr>
            </thead>
            <tbody>
              {demoRelationships.map(r => {
                const replyColor = r.replyRate >= 50 ? C.green : r.replyRate >= 30 ? C.blue : C.orange;
                const strengthColor = r.strength === 'Exceptional' ? C.green : r.strength === 'Strong' ? C.blue : C.orange;
                return (
                  <tr key={r.staff} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td className="py-2.5 pr-3">
                      <span className="font-semibold" style={{ color: 'var(--heading)' }}>{r.staff}</span>
                    </td>
                    <td className="py-2.5 text-right" style={{ color: 'var(--text-muted)' }}>{r.outreach}</td>
                    <td className="py-2.5 text-right font-extrabold" style={{ color: replyColor }}>{r.replyRate}%</td>
                    <td className="py-2.5 px-2"><MiniBar value={r.replyRate} max={100} color={replyColor} height={3} /></td>
                    <td className="py-2.5 text-right" style={{ color: 'var(--text-muted)' }}>{r.responseTime}</td>
                    <td className="py-2.5 text-right">
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-extrabold"
                        style={{ background: `color-mix(in srgb, ${strengthColor} 12%, transparent)`, color: strengthColor }}
                      >
                        {r.strength}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 rounded-lg p-3 text-[10px] leading-relaxed" style={{ background: 'var(--background)', color: 'var(--text-muted)' }}>
          Chris Morton (CEO) maintains an exceptional 88% reply rate — route high-value member conversations through his office. Taylor Spolidoro leads in volume (342 contacts) with a solid 34% reply rate.
        </div>
      </Card>

      {/* ═══════════ 10. OPTIMAL SEND WINDOWS ═══════════ */}
      <Card
        glass
        title="Optimal Send Windows"
        subtitle="Segment-specific timing recommendations for this week"
      >
        <SectionLabel>Optimal Send Windows</SectionLabel>
        <div className="space-y-2">
          {demoSendTimes.map(s => (
            <div key={s.segment} className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <CalendarClock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.openRate >= 50 ? C.green : C.blue }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--heading)' }}>{s.segment}</span>
                  <span className="text-[11px] font-extrabold" style={{ color: s.openRate >= 50 ? C.green : C.blue }}>
                    {s.openRate}% <span className="text-[9px] font-normal" style={{ color: 'var(--text-muted)' }}>predicted</span>
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.day}, {s.time}</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>n={s.sample.toLocaleString()}</span>
                </div>
                <MiniBar value={s.openRate} max={100} color={s.openRate >= 50 ? C.green : C.blue} height={3} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ═══════════ FOOTER ═══════════ */}
      <div className="text-center py-4">
        <p className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
          MEMTrak &mdash; Email Intelligence Platform &mdash; American Land Title Association
        </p>
        <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          Generated {new Date().toLocaleString()} &mdash; Confidential: Internal Use Only &mdash; Data reflects campaigns processed through {date}
        </p>
      </div>
    </div>
  );
}
