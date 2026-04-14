'use client';

import { getCampaignTotals, demoDecayAlerts, demoChurnScores, demoCampaigns, demoSendTimes, demoRelationships, demoHygiene } from '@/lib/demo-data';
import { printContent } from '@/lib/export-utils';
import PageGuide, { type GuideContent } from '@/components/PageGuide';
import { Printer, Mail, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

/* ── computed data ──────────────────────────────────────────── */
const totals = getCampaignTotals();
const sent = demoCampaigns.filter(c => c.status === 'Sent');
const topCamp = [...sent].sort((a, b) => b.revenue - a.revenue)[0];
const openRate = ((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1);
const clickRate = ((totals.totalClicked / totals.totalDelivered) * 100).toFixed(1);
const bounceRate = ((totals.totalBounced / totals.totalSent) * 100).toFixed(1);
const deliveryRate = ((totals.totalDelivered / totals.totalSent) * 100).toFixed(1);
const decayHigh = demoDecayAlerts.filter(d => d.decay >= 70);
const churnHigh = demoChurnScores.filter(c => c.score >= 70);

/* engagement tiers — from scoring model */
const engagementTiers = [
  { label: 'Champions (90-100)', count: 420, color: '#8CC63F' },
  { label: 'Engaged (70-89)', count: 1850, color: '#4A90D9' },
  { label: 'At Risk (50-69)', count: 1520, color: '#E8923F' },
  { label: 'Disengaged (25-49)', count: 860, color: '#D94A4A' },
  { label: 'Gone Dark (0-24)', count: 344, color: '#888888' },
];
const maxTier = Math.max(...engagementTiers.map(t => t.count));
const totalMembers = engagementTiers.reduce((s, t) => s + t.count, 0);

/* ── guide ──────────────────────────────────────────────────── */
const briefingGuide: GuideContent = {
  title: 'Daily Email Briefing',
  purpose: 'Generates a premium intelligence report summarizing email performance, priority actions, and staff outreach — formatted as email-ready HTML you can paste directly into Outlook or print as a PDF.',
  steps: [
    { label: 'Review the preview', detail: 'The briefing renders live below using your latest campaign data. Scroll through to review KPIs, alerts, and recommendations before sending.' },
    { label: 'Copy HTML for email', detail: 'Click "Copy HTML" to place the full email markup on your clipboard. Open Outlook, create a new message, and paste — formatting is preserved via inline styles.' },
    { label: 'Print as PDF', detail: 'Click "Print PDF" to open the briefing in a clean print window. Save as PDF for archival or attachment.' },
    { label: 'Send to Team', detail: 'Use "Send to Team" to distribute the briefing to the membership team distribution list (coming soon).' },
  ],
  keyMetrics: [
    { label: 'Open Rate', why: 'Percentage of delivered emails opened at least once. Association industry average is 25-35%. ALTA consistently outperforms.' },
    { label: 'Delivery Funnel', why: 'Tracks attrition from send to click. Each drop-off point reveals where to optimize — deliverability, subject lines, or content.' },
    { label: 'Engagement Decay', why: 'Members whose open rates have dropped significantly. High-decay members are 3-5x more likely to not renew within 6 months.' },
    { label: 'Revenue Attribution', why: 'Revenue tied to email campaigns through tracked conversions — renewals, event registrations, and TIPAC pledges.' },
  ],
  tips: [
    'Send the briefing every Monday and Thursday morning for consistent team visibility.',
    'Use the Priority Actions section in staff meetings to assign follow-up owners.',
    'Compare open rates week-over-week to spot subject line patterns that work.',
    'The engagement tiers chart helps you gauge overall membership health at a glance.',
  ],
};

/* ── component ──────────────────────────────────────────────── */
export default function Briefing() {
  const [copied, setCopied] = useState(false);
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  /* ── Revenue impact for decay alerts ── */
  const decayRevenue = decayHigh.reduce((s, d) => s + d.revenue, 0);

  /* ── Funnel numbers ── */
  const funnelSent = totals.totalSent;
  const funnelDelivered = totals.totalDelivered;
  const funnelOpened = totals.totalOpened;
  const funnelClicked = totals.totalClicked;
  const funnelDelivPct = ((funnelDelivered / funnelSent) * 100).toFixed(1);
  const funnelOpenPct = ((funnelOpened / funnelDelivered) * 100).toFixed(1);
  const funnelClickPct = ((funnelClicked / funnelOpened) * 100).toFixed(1);

  /* ── Narrative summary ── */
  const execNarrative = topCamp
    ? `This week's analysis reveals a membership engagement program performing well above industry benchmarks. Your ${openRate}% open rate places ALTA in the top decile of association email programs nationally — the industry average hovers between 25% and 35%. The standout campaign, <strong>${topCamp.name}</strong>, generated <strong>$${(topCamp.revenue / 1000).toFixed(0)}K in attributed revenue</strong> from ${topCamp.listSize.toLocaleString()} recipients, demonstrating the direct revenue impact of targeted member communications.${decayHigh.length > 0 ? ` However, ${decayHigh.length} high-priority engagement decay alerts demand attention — <strong style="color:#D94A4A;">$${decayRevenue.toLocaleString()} in annual revenue</strong> is at risk from members who have stopped opening emails, a pattern that historically precedes non-renewal within 3 to 6 months.` : ''}`
    : `Your ${totals.campaignCount} campaigns this period reached ${totals.totalSent.toLocaleString()} recipients with a ${openRate}% open rate — well above the 25-35% association industry average. ${decayHigh.length > 0 ? `${decayHigh.length} engagement decay alerts require immediate attention.` : 'No critical engagement decay alerts at this time.'}`;

  /* ── Build the email HTML ── */
  const briefingHtml = `
<div style="max-width:640px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#2c3e50;line-height:1.6;">

  <!-- ═══════════════════ HEADER ═══════════════════ -->
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

  <!-- ═══════════════════ BODY ═══════════════════ -->
  <div style="background:#ffffff;padding:0;border:1px solid #e2e5ea;border-top:none;">

    <!-- ── EXECUTIVE SUMMARY ── -->
    <div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Executive Summary</div>
      <p style="font-size:13px;color:#2c3e50;line-height:1.9;margin:0;">
        ${execNarrative}
      </p>
    </div>

    <!-- ── PERFORMANCE DASHBOARD (4 KPI Cards) ── -->
    <div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Performance Dashboard — April YTD</div>
      <table style="width:100%;border-collapse:collapse;"><tr>
        <!-- Open Rate -->
        <td style="width:25%;padding:0 6px 0 0;vertical-align:top;">
          <div style="background:#f8f9fb;border:1px solid #e2e5ea;border-top:3px solid #8CC63F;border-radius:8px;padding:16px 14px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:#002D5C;line-height:1;">${openRate}%</div>
            <div style="font-size:10px;color:#6b7280;margin-top:4px;font-weight:600;">Open Rate</div>
            <div style="margin:10px auto 6px;width:80%;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;">
              <div style="width:${Math.min(parseFloat(openRate) / 60 * 100, 100)}%;height:100%;background:#8CC63F;border-radius:3px;"></div>
            </div>
            <div style="font-size:9px;color:#8CC63F;font-weight:700;">&#9650; vs 25-35% industry</div>
          </div>
        </td>
        <!-- Click Rate -->
        <td style="width:25%;padding:0 3px;vertical-align:top;">
          <div style="background:#f8f9fb;border:1px solid #e2e5ea;border-top:3px solid #8CC63F;border-radius:8px;padding:16px 14px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:#002D5C;line-height:1;">${clickRate}%</div>
            <div style="font-size:10px;color:#6b7280;margin-top:4px;font-weight:600;">Click Rate</div>
            <div style="margin:10px auto 6px;width:80%;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;">
              <div style="width:${Math.min(parseFloat(clickRate) / 15 * 100, 100)}%;height:100%;background:#8CC63F;border-radius:3px;"></div>
            </div>
            <div style="font-size:9px;color:#8CC63F;font-weight:700;">&#9650; vs 3-5% industry</div>
          </div>
        </td>
        <!-- Revenue -->
        <td style="width:25%;padding:0 3px;vertical-align:top;">
          <div style="background:#f8f9fb;border:1px solid #e2e5ea;border-top:3px solid #4A90D9;border-radius:8px;padding:16px 14px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:#002D5C;line-height:1;">$${(totals.totalRevenue / 1000).toFixed(0)}K</div>
            <div style="font-size:10px;color:#6b7280;margin-top:4px;font-weight:600;">Revenue</div>
            <div style="margin:10px auto 6px;width:80%;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;">
              <div style="width:${Math.min(totals.totalRevenue / 800000 * 100, 100)}%;height:100%;background:#4A90D9;border-radius:3px;"></div>
            </div>
            <div style="font-size:9px;color:#4A90D9;font-weight:700;">${sent.filter(c => c.revenue > 0).length} attributed campaigns</div>
          </div>
        </td>
        <!-- Bounce Rate -->
        <td style="width:25%;padding:0 0 0 6px;vertical-align:top;">
          <div style="background:#f8f9fb;border:1px solid #e2e5ea;border-top:3px solid ${parseFloat(bounceRate) > 3 ? '#D94A4A' : '#8CC63F'};border-radius:8px;padding:16px 14px;text-align:center;">
            <div style="font-size:24px;font-weight:800;color:${parseFloat(bounceRate) > 3 ? '#D94A4A' : '#002D5C'};line-height:1;">${bounceRate}%</div>
            <div style="font-size:10px;color:#6b7280;margin-top:4px;font-weight:600;">Bounce Rate</div>
            <div style="margin:10px auto 6px;width:80%;height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;">
              <div style="width:${Math.min(parseFloat(bounceRate) / 8 * 100, 100)}%;height:100%;background:${parseFloat(bounceRate) > 3 ? '#D94A4A' : '#8CC63F'};border-radius:3px;"></div>
            </div>
            <div style="font-size:9px;color:${parseFloat(bounceRate) > 3 ? '#D94A4A' : '#8CC63F'};font-weight:700;">${parseFloat(bounceRate) > 2 ? '&#9660;' : '&#9650;'} vs &lt;2% target</div>
          </div>
        </td>
      </tr></table>
    </div>

    <!-- ── DELIVERY FUNNEL ── -->
    <div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Delivery Funnel — ${totals.campaignCount} Campaigns</div>
      <table style="width:100%;border-collapse:collapse;">
        <!-- Sent -->
        <tr>
          <td style="width:80px;padding:6px 0;font-size:11px;font-weight:700;color:#002D5C;vertical-align:middle;">Sent</td>
          <td style="padding:6px 8px;vertical-align:middle;">
            <div style="background:#002D5C;height:28px;border-radius:4px;width:100%;position:relative;">
              <div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:800;color:#ffffff;">${funnelSent.toLocaleString()}</div>
            </div>
          </td>
          <td style="width:60px;padding:6px 0;font-size:10px;color:#6b7280;text-align:right;vertical-align:middle;">100%</td>
        </tr>
        <!-- Delivered -->
        <tr>
          <td style="width:80px;padding:6px 0;font-size:11px;font-weight:700;color:#002D5C;vertical-align:middle;">Delivered</td>
          <td style="padding:6px 8px;vertical-align:middle;">
            <div style="background:#1B3A5C;height:28px;border-radius:4px;width:${funnelDelivPct}%;position:relative;">
              <div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:800;color:#ffffff;">${funnelDelivered.toLocaleString()}</div>
            </div>
          </td>
          <td style="width:60px;padding:6px 0;font-size:10px;color:#8CC63F;text-align:right;vertical-align:middle;font-weight:700;">${funnelDelivPct}%</td>
        </tr>
        <!-- Opened -->
        <tr>
          <td style="width:80px;padding:6px 0;font-size:11px;font-weight:700;color:#002D5C;vertical-align:middle;">Opened</td>
          <td style="padding:6px 8px;vertical-align:middle;">
            <div style="background:#4A90D9;height:28px;border-radius:4px;width:${(funnelOpened / funnelSent * 100).toFixed(1)}%;position:relative;">
              <div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:800;color:#ffffff;">${funnelOpened.toLocaleString()}</div>
            </div>
          </td>
          <td style="width:60px;padding:6px 0;font-size:10px;color:#4A90D9;text-align:right;vertical-align:middle;font-weight:700;">${funnelOpenPct}%</td>
        </tr>
        <!-- Clicked -->
        <tr>
          <td style="width:80px;padding:6px 0;font-size:11px;font-weight:700;color:#002D5C;vertical-align:middle;">Clicked</td>
          <td style="padding:6px 8px;vertical-align:middle;">
            <div style="background:#8CC63F;height:28px;border-radius:4px;width:${(funnelClicked / funnelSent * 100).toFixed(1)}%;min-width:80px;position:relative;">
              <div style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:800;color:#ffffff;">${funnelClicked.toLocaleString()}</div>
            </div>
          </td>
          <td style="width:60px;padding:6px 0;font-size:10px;color:#8CC63F;text-align:right;vertical-align:middle;font-weight:700;">${funnelClickPct}%</td>
        </tr>
      </table>
      <div style="margin-top:10px;padding:10px 14px;background:#f8f9fb;border-radius:6px;font-size:10px;color:#6b7280;line-height:1.6;">
        Funnel conversion: ${funnelDelivPct}% delivery &#8594; ${funnelOpenPct}% of delivered opened &#8594; ${funnelClickPct}% of opened clicked. Your open-to-click conversion of ${funnelClickPct}% indicates strong content relevance — the industry average is 15-20%.
      </div>
    </div>

    <!-- ── PRIORITY ACTIONS ── -->
    <div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Priority Actions</div>

      ${decayHigh.length > 0 ? `
      <!-- RED: Engagement Decay -->
      <div style="background:#fef2f2;border:1px solid #fecaca;border-left:5px solid #D94A4A;border-radius:8px;padding:16px 18px;margin-bottom:14px;">
        <table style="width:100%;border-collapse:collapse;"><tr>
          <td style="vertical-align:top;">
            <div style="display:inline-block;padding:2px 10px;border-radius:12px;background:#D94A4A;font-size:9px;font-weight:800;color:#ffffff;letter-spacing:0.5px;margin-bottom:8px;">URGENT</div>
            <div style="font-size:13px;font-weight:800;color:#991b1b;margin-top:6px;">${decayHigh.length} Engagement Decay Alerts</div>
            <p style="font-size:11px;color:#7f1d1d;margin:8px 0 0;line-height:1.7;">These members have stopped opening emails — a pattern that predicts non-renewal within 3-6 months.</p>
          </td>
          <td style="width:100px;text-align:right;vertical-align:top;">
            <div style="font-size:9px;color:#991b1b;font-weight:600;margin-bottom:2px;">REVENUE AT RISK</div>
            <div style="font-size:20px;font-weight:800;color:#D94A4A;">$${decayRevenue.toLocaleString()}</div>
            <div style="font-size:9px;color:#991b1b;">per year</div>
          </td>
        </tr></table>
        <table style="width:100%;font-size:11px;margin-top:12px;border-collapse:collapse;">
          ${decayHigh.map(d => `<tr style="border-top:1px solid #fecaca;"><td style="padding:8px 0;font-weight:700;color:#991b1b;">${d.org}</td><td style="padding:8px 4px;color:#7f1d1d;font-size:10px;">${d.type}</td><td style="text-align:right;padding:8px 0;font-weight:800;color:#D94A4A;">$${d.revenue.toLocaleString()}/yr</td><td style="text-align:right;padding:8px 0;font-size:10px;color:#9ca3af;">Last open: ${d.lastOpen}</td></tr>`).join('')}
        </table>
        <div style="margin-top:12px;padding:10px 14px;background:#fee2e2;border-radius:6px;font-size:10px;font-weight:600;color:#991b1b;line-height:1.5;">
          Recommended: Assign personal outreach within 48 hours. For First American ($61,554/yr), escalate to CEO-level check-in. Use MEMTrak relationship data to route to the staff member with the strongest existing relationship.
        </div>
      </div>` : ''}

      <!-- ORANGE: Bounce Cleanup -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-left:5px solid #E8923F;border-radius:8px;padding:16px 18px;margin-bottom:14px;">
        <table style="width:100%;border-collapse:collapse;"><tr>
          <td style="vertical-align:top;">
            <div style="display:inline-block;padding:2px 10px;border-radius:12px;background:#E8923F;font-size:9px;font-weight:800;color:#ffffff;letter-spacing:0.5px;margin-bottom:8px;">MEDIUM</div>
            <div style="font-size:13px;font-weight:800;color:#92400e;margin-top:6px;">${totals.totalBounced} Bounced Addresses Need Cleanup</div>
            <p style="font-size:11px;color:#78350f;margin:8px 0 0;line-height:1.7;">Sending to invalid addresses damages domain reputation, reducing deliverability for all future campaigns. Current bounce rate (${bounceRate}%) ${parseFloat(bounceRate) > 2 ? 'exceeds' : 'is near'} the 2% industry ceiling.</p>
          </td>
          <td style="width:100px;text-align:right;vertical-align:top;">
            <div style="font-size:9px;color:#92400e;font-weight:600;margin-bottom:2px;">DELIVERABILITY</div>
            <div style="font-size:20px;font-weight:800;color:#E8923F;">${bounceRate}%</div>
            <div style="font-size:9px;color:#92400e;">bounce rate</div>
          </td>
        </tr></table>
        <div style="margin-top:12px;padding:10px 14px;background:#fef3c7;border-radius:6px;font-size:10px;font-weight:600;color:#92400e;line-height:1.5;">
          Recommended: Run Address Hygiene cleanup within 48 hours. Removing ${totals.totalBounced} bounced addresses will improve delivery rate from ${demoHygiene.currentDelivery}% to a projected ${demoHygiene.projectedDelivery}%.
        </div>
      </div>

      ${churnHigh.length > 0 ? `
      <!-- RED: Churn Risk -->
      <div style="background:#fef2f2;border:1px solid #fecaca;border-left:5px solid #D94A4A;border-radius:8px;padding:16px 18px;margin-bottom:14px;">
        <table style="width:100%;border-collapse:collapse;"><tr>
          <td style="vertical-align:top;">
            <div style="display:inline-block;padding:2px 10px;border-radius:12px;background:#D94A4A;font-size:9px;font-weight:800;color:#ffffff;letter-spacing:0.5px;margin-bottom:8px;">URGENT</div>
            <div style="font-size:13px;font-weight:800;color:#991b1b;margin-top:6px;">${churnHigh.length} Members at High Churn Risk</div>
          </td>
          <td style="width:100px;text-align:right;vertical-align:top;">
            <div style="font-size:9px;color:#991b1b;font-weight:600;margin-bottom:2px;">COMBINED RISK</div>
            <div style="font-size:20px;font-weight:800;color:#D94A4A;">$${churnHigh.reduce((s, c) => s + c.revenue, 0).toLocaleString()}</div>
            <div style="font-size:9px;color:#991b1b;">per year</div>
          </td>
        </tr></table>
        <table style="width:100%;font-size:11px;margin-top:12px;border-collapse:collapse;">
          ${churnHigh.map(c => `<tr style="border-top:1px solid #fecaca;"><td style="padding:8px 0;font-weight:700;color:#991b1b;">${c.org}</td><td style="padding:8px 4px;text-align:center;"><span style="display:inline-block;padding:2px 10px;border-radius:12px;background:#fca5a5;color:#7f1d1d;font-size:10px;font-weight:800;">${c.score}% risk</span></td><td style="text-align:right;padding:8px 0;font-size:10px;color:#16a34a;font-weight:600;">${c.action}</td></tr>`).join('')}
        </table>
      </div>` : ''}

      <!-- BLUE: Strategic -->
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-left:5px solid #4A90D9;border-radius:8px;padding:16px 18px;">
        <table style="width:100%;border-collapse:collapse;"><tr>
          <td style="vertical-align:top;">
            <div style="display:inline-block;padding:2px 10px;border-radius:12px;background:#4A90D9;font-size:9px;font-weight:800;color:#ffffff;letter-spacing:0.5px;margin-bottom:8px;">PLANNING</div>
            <div style="font-size:13px;font-weight:800;color:#1e40af;margin-top:6px;">Renewal Season Preparation</div>
            <p style="font-size:11px;color:#1e3a5f;margin:8px 0 0;line-height:1.7;">4,994 members need renewal communications by Q4. The automated renewal sequence should be finalized by July. ACU underwriters ($61,554/yr each) should receive CEO-personal outreach — MEMTrak relationship data shows Chris Morton has an 88% reply rate with ACU members.</p>
          </td>
        </tr></table>
      </div>
    </div>

    <!-- ── CAMPAIGN PERFORMANCE TABLE ── -->
    <div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Campaign Performance</div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <tr style="background:#002D5C;">
          <th style="padding:10px 12px;text-align:left;color:#ffffff;font-weight:700;font-size:10px;">Campaign</th>
          <th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Sent</th>
          <th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Open Rate</th>
          <th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Clicks</th>
          <th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Revenue</th>
        </tr>
        ${[...sent].sort((a, b) => b.revenue - a.revenue).slice(0, 7).map((c, i) => {
          const or = (c.uniqueOpened / c.delivered * 100);
          const orStr = or.toFixed(1);
          const orColor = or >= 50 ? '#8CC63F' : or >= 35 ? '#4A90D9' : or >= 25 ? '#E8923F' : '#D94A4A';
          return `<tr style="border-bottom:1px solid #e2e5ea;${i % 2 === 1 ? 'background:#f8f9fb;' : ''}">
          <td style="padding:10px 12px;font-weight:600;color:#002D5C;max-width:200px;">${c.name}</td>
          <td style="padding:10px 12px;text-align:right;color:#6b7280;">${c.listSize.toLocaleString()}</td>
          <td style="padding:10px 12px;text-align:right;">
            <span style="font-weight:800;color:${orColor};">${orStr}%</span>
          </td>
          <td style="padding:10px 12px;text-align:right;color:#6b7280;">${c.clicked.toLocaleString()}</td>
          <td style="padding:10px 12px;text-align:right;font-weight:700;${c.revenue > 0 ? 'color:#8CC63F;' : 'color:#d1d5db;'}">
            ${c.revenue > 0 ? '$' + (c.revenue >= 1000 ? (c.revenue / 1000).toFixed(0) + 'K' : c.revenue.toLocaleString()) : '—'}
          </td>
        </tr>`;
        }).join('')}
      </table>
      ${topCamp ? `
      <div style="margin-top:14px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 18px;">
        <div style="font-size:12px;font-weight:800;color:#166534;">Top Performer: ${topCamp.name}</div>
        <p style="font-size:11px;color:#14532d;margin:6px 0 0;line-height:1.6;">${topCamp.listSize.toLocaleString()} sent — ${(topCamp.uniqueOpened / topCamp.delivered * 100).toFixed(1)}% open rate — ${topCamp.clicked} clicks — <strong>$${(topCamp.revenue / 1000).toFixed(0)}K revenue attributed</strong>. Renewal campaigns continue to be the highest-revenue channel for ALTA.</p>
      </div>` : ''}
    </div>

    <!-- ── ENGAGEMENT HEALTH (Mini Bar Chart) ── -->
    <div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Engagement Health — ${totalMembers.toLocaleString()} Members</div>
      <table style="width:100%;border-collapse:collapse;">
        ${engagementTiers.map(t => {
          const pct = (t.count / maxTier * 100).toFixed(0);
          const pctOfTotal = (t.count / totalMembers * 100).toFixed(1);
          return `<tr>
          <td style="width:140px;padding:7px 0;font-size:11px;font-weight:600;color:#002D5C;">${t.label}</td>
          <td style="padding:7px 8px;">
            <div style="background:#f3f4f6;height:22px;border-radius:4px;overflow:hidden;position:relative;">
              <div style="background:${t.color};height:100%;width:${pct}%;border-radius:4px;"></div>
              <div style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:10px;font-weight:700;color:#374151;">${t.count.toLocaleString()}</div>
            </div>
          </td>
          <td style="width:50px;padding:7px 0;font-size:10px;color:#6b7280;text-align:right;font-weight:600;">${pctOfTotal}%</td>
        </tr>`;
        }).join('')}
      </table>
      <div style="margin-top:12px;padding:10px 14px;background:#f8f9fb;border-radius:6px;font-size:10px;color:#6b7280;line-height:1.6;">
        ${((engagementTiers[0].count + engagementTiers[1].count) / totalMembers * 100).toFixed(1)}% of members are in the Engaged or Champion tier — a healthy association targets 50%+. The ${engagementTiers[2].count.toLocaleString()} "At Risk" members represent the highest-ROI group for intervention. Moving 20% of them back to Engaged would protect approximately $278K in annual dues revenue.
      </div>
    </div>

    <!-- ── RECOMMENDED NEXT ACTIONS ── -->
    <div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Recommended Next Actions</div>
      <table style="width:100%;border-collapse:collapse;">
        <!-- Action 1 -->
        <tr>
          <td style="padding:0 0 12px 0;">
            <div style="background:#f8f9fb;border:1px solid #e2e5ea;border-left:4px solid #D94A4A;border-radius:8px;padding:14px 16px;">
              <table style="width:100%;border-collapse:collapse;"><tr>
                <td style="vertical-align:top;">
                  <div style="font-size:12px;font-weight:800;color:#002D5C;">Launch First American Rescue Campaign</div>
                  <p style="font-size:11px;color:#6b7280;margin:4px 0 0;line-height:1.6;">Schedule CEO-personal outreach to First American Title within 48 hours. This $61,554/yr ACU member is declining and needs high-touch engagement.</p>
                </td>
                <td style="width:80px;text-align:right;vertical-align:top;">
                  <div style="font-size:9px;color:#D94A4A;font-weight:700;">IMPACT</div>
                  <div style="font-size:16px;font-weight:800;color:#D94A4A;">$61K</div>
                </td>
              </tr></table>
            </div>
          </td>
        </tr>
        <!-- Action 2 -->
        <tr>
          <td style="padding:0 0 12px 0;">
            <div style="background:#f8f9fb;border:1px solid #e2e5ea;border-left:4px solid #E8923F;border-radius:8px;padding:14px 16px;">
              <table style="width:100%;border-collapse:collapse;"><tr>
                <td style="vertical-align:top;">
                  <div style="font-size:12px;font-weight:800;color:#002D5C;">Run Address Hygiene Cleanup</div>
                  <p style="font-size:11px;color:#6b7280;margin:4px 0 0;line-height:1.6;">Remove ${totals.totalBounced} hard bounces and ${demoHygiene.stale.count.toLocaleString()} stale addresses. Projected to improve delivery rate from ${demoHygiene.currentDelivery}% to ${demoHygiene.projectedDelivery}%.</p>
                </td>
                <td style="width:80px;text-align:right;vertical-align:top;">
                  <div style="font-size:9px;color:#E8923F;font-weight:700;">IMPACT</div>
                  <div style="font-size:16px;font-weight:800;color:#E8923F;">+2.6%</div>
                </td>
              </tr></table>
            </div>
          </td>
        </tr>
        <!-- Action 3 -->
        <tr>
          <td style="padding:0 0 12px 0;">
            <div style="background:#f8f9fb;border:1px solid #e2e5ea;border-left:4px solid #4A90D9;border-radius:8px;padding:14px 16px;">
              <table style="width:100%;border-collapse:collapse;"><tr>
                <td style="vertical-align:top;">
                  <div style="font-size:12px;font-weight:800;color:#002D5C;">Replicate Renewal Campaign Success</div>
                  <p style="font-size:11px;color:#6b7280;margin:4px 0 0;line-height:1.6;">The April Renewal Batch generated $407K from just 420 recipients. Build a second wave targeting May renewals using the same template and send-time optimization.</p>
                </td>
                <td style="width:80px;text-align:right;vertical-align:top;">
                  <div style="font-size:9px;color:#4A90D9;font-weight:700;">IMPACT</div>
                  <div style="font-size:16px;font-weight:800;color:#4A90D9;">$300K+</div>
                </td>
              </tr></table>
            </div>
          </td>
        </tr>
        <!-- Action 4 -->
        <tr>
          <td style="padding:0;">
            <div style="background:#f8f9fb;border:1px solid #e2e5ea;border-left:4px solid #8CC63F;border-radius:8px;padding:14px 16px;">
              <table style="width:100%;border-collapse:collapse;"><tr>
                <td style="vertical-align:top;">
                  <div style="font-size:12px;font-weight:800;color:#002D5C;">Target "At Risk" Tier with Re-engagement Series</div>
                  <p style="font-size:11px;color:#6b7280;margin:4px 0 0;line-height:1.6;">1,520 members are trending down but not yet disengaged. A 3-email re-engagement series with value-focused content could move 20% back to Engaged, protecting $278K in annual dues.</p>
                </td>
                <td style="width:80px;text-align:right;vertical-align:top;">
                  <div style="font-size:9px;color:#8CC63F;font-weight:700;">IMPACT</div>
                  <div style="font-size:16px;font-weight:800;color:#8CC63F;">$278K</div>
                </td>
              </tr></table>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- ── STAFF PERFORMANCE ── -->
    <div style="padding:28px 36px;border-bottom:1px solid #e2e5ea;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Staff Outreach Performance</div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        <tr style="background:#002D5C;">
          <th style="padding:10px 12px;text-align:left;color:#ffffff;font-weight:700;font-size:10px;">Staff Member</th>
          <th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Outreach Vol.</th>
          <th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Reply Rate</th>
          <th style="padding:10px 12px;text-align:right;color:#ffffff;font-weight:700;font-size:10px;">Avg Response</th>
        </tr>
        ${demoRelationships.map((r, i) => {
          const replyColor = r.replyRate >= 50 ? '#8CC63F' : r.replyRate >= 30 ? '#4A90D9' : '#E8923F';
          return `<tr style="border-bottom:1px solid #e2e5ea;${i % 2 === 1 ? 'background:#f8f9fb;' : ''}">
          <td style="padding:10px 12px;font-weight:600;color:#002D5C;">${r.staff}</td>
          <td style="padding:10px 12px;text-align:right;color:#6b7280;">${r.outreach}</td>
          <td style="padding:10px 12px;text-align:right;">
            <span style="font-weight:800;color:${replyColor};">${r.replyRate}%</span>
          </td>
          <td style="padding:10px 12px;text-align:right;color:#6b7280;">${r.responseTime}</td>
        </tr>`;
        }).join('')}
      </table>
      <div style="margin-top:12px;padding:10px 14px;background:#f8f9fb;border-radius:6px;font-size:10px;color:#6b7280;line-height:1.6;">
        Chris Morton (CEO) maintains an exceptional 88% reply rate — route high-value member conversations through his office for maximum impact. Taylor Spolidoro leads in outreach volume (342 contacts) with a solid 34% reply rate, demonstrating consistent member engagement at scale.
      </div>
    </div>

    <!-- ── OPTIMAL SEND TIMES ── -->
    <div style="padding:28px 36px;">
      <div style="font-size:10px;font-weight:800;color:#C6A75E;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">Optimal Send Windows — This Week</div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;">
        ${demoSendTimes.map((s, i) => `<tr style="border-bottom:1px solid #e2e5ea;${i % 2 === 1 ? 'background:#f8f9fb;' : ''}">
          <td style="padding:10px 12px;font-weight:600;color:#002D5C;">${s.segment}</td>
          <td style="padding:10px 12px;color:#6b7280;">${s.day}, ${s.time}</td>
          <td style="padding:10px 12px;text-align:right;">
            <span style="font-weight:800;color:${s.openRate >= 50 ? '#8CC63F' : '#4A90D9'};">${s.openRate}%</span>
            <span style="font-size:9px;color:#9ca3af;"> predicted</span>
          </td>
        </tr>`).join('')}
      </table>
    </div>

  </div>

  <!-- ═══════════════════ FOOTER ═══════════════════ -->
  <div style="background:linear-gradient(135deg,#f8f9fb 0%,#eef0f4 100%);padding:24px 36px;border:1px solid #e2e5ea;border-top:none;border-radius:0 0 12px 12px;text-align:center;">
    <div style="font-size:10px;font-weight:700;color:#002D5C;margin-bottom:4px;">MEMTrak — Email Intelligence Platform</div>
    <div style="font-size:9px;color:#9ca3af;line-height:1.6;">American Land Title Association — Built by AXG Systems<br>Generated ${new Date().toLocaleString()} — Confidential: Internal Use Only</div>
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #e2e5ea;">
      <span style="font-size:8px;color:#d1d5db;">This report was automatically generated by MEMTrak. Data reflects campaigns processed through ${date}. Revenue figures are based on tracked attribution and may not reflect all downstream conversions.</span>
    </div>
  </div>

</div>`;

  return (
    <div style={{ padding: '24px' }}>
      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h1 style={{ color: 'var(--heading)', fontSize: '18px', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Daily Email Briefing</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: '4px 0 0', lineHeight: 1.4 }}>
              Premium intelligence report for the membership team. Copy the HTML and paste into Outlook, or print as PDF.
            </p>
          </div>
          <PageGuide pageId="briefing" guide={briefingGuide} />
        </div>
        <div className="flex gap-2 no-print">
          <button
            onClick={() => printContent('MEMTrak Daily Briefing', briefingHtml)}
            className="flex items-center gap-2 rounded-xl"
            style={{
              padding: '10px 16px',
              background: 'var(--card)',
              border: '1px solid var(--card-border)',
              color: 'var(--heading)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Printer style={{ width: '14px', height: '14px' }} /> Print PDF
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(briefingHtml);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-2 rounded-xl"
            style={{
              padding: '10px 16px',
              background: '#4A90D9',
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {copied
              ? <><CheckCircle style={{ width: '14px', height: '14px' }} /> Copied!</>
              : <><Copy style={{ width: '14px', height: '14px' }} /> Copy HTML</>
            }
          </button>
          <button
            className="flex items-center gap-2 rounded-xl"
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
            <Mail style={{ width: '14px', height: '14px' }} /> Send to Team
          </button>
        </div>
      </div>

      {/* ── Live preview ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--card-border)' }}
      >
        <div style={{ background: '#ffffff', padding: 0 }}>
          <div dangerouslySetInnerHTML={{ __html: briefingHtml }} />
        </div>
      </div>

      {/* ── Help text ── */}
      <div style={{ marginTop: '16px', padding: '12px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '10px', margin: 0, lineHeight: 1.6 }}>
          This briefing includes: executive summary, performance dashboard with benchmarks, delivery funnel, priority actions with revenue impact, campaign performance, engagement health distribution, recommended next actions, staff outreach performance, and optimal send windows. All inline-styled for email compatibility.
        </p>
      </div>
    </div>
  );
}
