'use client';

import { getCampaignTotals, demoDecayAlerts, demoChurnScores, demoCampaigns, demoMonthly, demoSendTimes, demoRelationships, demoHygiene } from '@/lib/demo-data';
import { printContent } from '@/lib/export-utils';
import { Printer, Mail, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const totals = getCampaignTotals();
const sent = demoCampaigns.filter(c => c.status === 'Sent');
const topCamp = sent.sort((a, b) => b.revenue - a.revenue)[0];
const openRate = ((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1);
const clickRate = ((totals.totalClicked / totals.totalDelivered) * 100).toFixed(1);
const bounceRate = ((totals.totalBounced / totals.totalSent) * 100).toFixed(1);
const decayHigh = demoDecayAlerts.filter(d => d.decay >= 70);
const churnHigh = demoChurnScores.filter(c => c.score >= 70);

export default function Briefing() {
  const [copied, setCopied] = useState(false);
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const briefingHtml = `
<div style="max-width:640px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1B3A5C;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#002D5C 0%,#1B3A5C 100%);padding:28px 32px;border-radius:12px 12px 0 0;">
    <table style="width:100%;"><tr>
      <td><h1 style="color:white;font-size:20px;margin:0;font-weight:800;">MEMTrak Daily Briefing</h1><p style="color:rgba(255,255,255,0.5);font-size:11px;margin:4px 0 0;">${date} — Prepared for the ALTA Membership Team</p></td>
      <td style="text-align:right;"><span style="color:rgba(255,255,255,0.4);font-size:10px;">American Land Title Association<br>by AXG Systems</span></td>
    </tr></table>
  </div>

  <!-- Body -->
  <div style="background:white;padding:28px 32px;border:1px solid #e5e7eb;border-top:none;">

    <!-- Exec Summary -->
    <p style="font-size:13px;color:#2c3e50;line-height:1.8;margin:0 0 20px;">
      Good morning. Here's your daily MEMTrak intelligence briefing. ${totals.campaignCount} campaigns sent this month reaching ${totals.totalSent.toLocaleString()} recipients. Your ${openRate}% open rate exceeds the association industry average (25-35%), and ${clickRate}% click-through rate is 3x the industry norm. ${decayHigh.length > 0 ? `<strong style="color:#D94A4A;">${decayHigh.length} engagement decay alerts require immediate attention</strong> — $${decayHigh.reduce((s, d) => s + d.revenue, 0).toLocaleString()} in annual revenue is at risk.` : 'No critical decay alerts today.'}
    </p>

    <!-- KPI Table -->
    <h2 style="color:#002D5C;font-size:14px;border-bottom:3px solid #C6A75E;padding-bottom:6px;margin:24px 0 12px;">Performance Metrics — April YTD</h2>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <tr style="background:#002D5C;color:white;"><th style="padding:10px 12px;text-align:left;">Metric</th><th style="padding:10px 12px;text-align:right;">Value</th><th style="padding:10px 12px;text-align:right;">Industry Avg</th><th style="padding:10px 12px;text-align:center;">Status</th></tr>
      <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:10px 12px;font-weight:600;">Total Emails Sent</td><td style="padding:10px 12px;text-align:right;font-weight:700;">${totals.totalSent.toLocaleString()}</td><td style="padding:10px 12px;text-align:right;color:#888;">—</td><td style="padding:10px 12px;text-align:center;">${totals.campaignCount} campaigns</td></tr>
      <tr style="background:#f8f9fb;border-bottom:1px solid #e5e7eb;"><td style="padding:10px 12px;font-weight:600;">Open Rate</td><td style="padding:10px 12px;text-align:right;font-weight:700;color:#8CC63F;">${openRate}%</td><td style="padding:10px 12px;text-align:right;color:#888;">25-35%</td><td style="padding:10px 12px;text-align:center;color:#8CC63F;font-weight:700;">✓ Above Avg</td></tr>
      <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:10px 12px;font-weight:600;">Click-Through Rate</td><td style="padding:10px 12px;text-align:right;font-weight:700;color:#8CC63F;">${clickRate}%</td><td style="padding:10px 12px;text-align:right;color:#888;">3-5%</td><td style="padding:10px 12px;text-align:center;color:#8CC63F;font-weight:700;">✓ 3x Industry</td></tr>
      <tr style="background:#f8f9fb;border-bottom:1px solid #e5e7eb;"><td style="padding:10px 12px;font-weight:600;">Bounce Rate</td><td style="padding:10px 12px;text-align:right;font-weight:700;${parseFloat(bounceRate) > 3 ? 'color:#D94A4A;' : ''}">${bounceRate}%</td><td style="padding:10px 12px;text-align:right;color:#888;">&lt;2%</td><td style="padding:10px 12px;text-align:center;${parseFloat(bounceRate) > 3 ? 'color:#D94A4A;font-weight:700;' : ''}">⚠ ${parseFloat(bounceRate) > 3 ? 'Above' : 'Within'} Avg</td></tr>
      <tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:10px 12px;font-weight:600;">Revenue Attributed</td><td style="padding:10px 12px;text-align:right;font-weight:700;color:#8CC63F;">$${(totals.totalRevenue / 1000).toFixed(0)}K</td><td style="padding:10px 12px;text-align:right;color:#888;">—</td><td style="padding:10px 12px;text-align:center;">${sent.filter(c => c.revenue > 0).length} campaigns with revenue</td></tr>
      <tr style="background:#f8f9fb;"><td style="padding:10px 12px;font-weight:600;">Delivery Rate</td><td style="padding:10px 12px;text-align:right;font-weight:700;">${((totals.totalDelivered / totals.totalSent) * 100).toFixed(1)}%</td><td style="padding:10px 12px;text-align:right;color:#888;">94-96%</td><td style="padding:10px 12px;text-align:center;color:#8CC63F;font-weight:700;">✓ On Target</td></tr>
    </table>

    <!-- Priority Actions -->
    <h2 style="color:#002D5C;font-size:14px;border-bottom:3px solid #C6A75E;padding-bottom:6px;margin:28px 0 12px;">⚡ Priority Actions</h2>

    ${decayHigh.length > 0 ? `
    <div style="background:#fef2f2;border:1px solid #fca5a5;border-left:4px solid #D94A4A;border-radius:8px;padding:14px 16px;margin-bottom:12px;">
      <strong style="color:#D94A4A;font-size:12px;">HIGH: ${decayHigh.length} Engagement Decay Alerts</strong>
      <p style="font-size:11px;color:#7f1d1d;margin:6px 0 0;line-height:1.6;">These members have stopped opening emails — a pattern that predicts non-renewal within 3-6 months. Combined annual revenue at risk: <strong>$${decayHigh.reduce((s, d) => s + d.revenue, 0).toLocaleString()}</strong>.</p>
      <table style="width:100%;font-size:11px;margin-top:8px;border-collapse:collapse;">
        ${decayHigh.map(d => `<tr><td style="padding:4px 0;font-weight:600;">${d.org} (${d.type})</td><td style="text-align:right;color:#D94A4A;font-weight:700;">$${d.revenue.toLocaleString()}/yr</td><td style="text-align:right;color:#888;">Last open: ${d.lastOpen}</td></tr>`).join('')}
      </table>
    </div>` : ''}

    <div style="background:#fffbeb;border:1px solid #fbbf24;border-left:4px solid #E8923F;border-radius:8px;padding:14px 16px;margin-bottom:12px;">
      <strong style="color:#92400e;font-size:12px;">MEDIUM: ${totals.totalBounced} Bounced Addresses Need Cleanup</strong>
      <p style="font-size:11px;color:#78350f;margin:6px 0 0;line-height:1.6;">Sending to invalid addresses damages ALTA's domain reputation, which reduces deliverability for ALL future emails. Remove bounced addresses via the Address Hygiene page within 48 hours. Current bounce rate (${bounceRate}%) is above the ${parseFloat(bounceRate) > 3 ? '<strong>2% industry recommendation</strong>' : 'industry average'}.</p>
    </div>

    ${churnHigh.length > 0 ? `
    <div style="background:#fef2f2;border:1px solid #fca5a5;border-left:4px solid #D94A4A;border-radius:8px;padding:14px 16px;margin-bottom:12px;">
      <strong style="color:#D94A4A;font-size:12px;">HIGH: ${churnHigh.length} Members at High Churn Risk</strong>
      <table style="width:100%;font-size:11px;margin-top:8px;border-collapse:collapse;">
        ${churnHigh.map(c => `<tr><td style="padding:4px 0;font-weight:600;">${c.org}</td><td style="text-align:center;"><span style="background:#fca5a5;color:#7f1d1d;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;">${c.score}% risk</span></td><td style="text-align:right;color:#8CC63F;font-size:10px;">${c.action}</td></tr>`).join('')}
      </table>
    </div>` : ''}

    <div style="background:#eff6ff;border:1px solid #93c5fd;border-left:4px solid #4A90D9;border-radius:8px;padding:14px 16px;margin-bottom:12px;">
      <strong style="color:#1e40af;font-size:12px;">PLANNING: Renewal Season Approaching</strong>
      <p style="font-size:11px;color:#1e3a5f;margin:6px 0 0;line-height:1.6;">4,994 members need renewal communications by Q4. The automated renewal sequence should be finalized by July. ACU underwriters ($61,554/yr each) should receive CEO-personal outreach — MEMTrak's relationship data shows Chris Morton has an 88% reply rate with ACU members.</p>
    </div>

    <!-- Top Campaigns -->
    <h2 style="color:#002D5C;font-size:14px;border-bottom:3px solid #C6A75E;padding-bottom:6px;margin:28px 0 12px;">📊 Campaign Performance</h2>
    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      <tr style="background:#002D5C;color:white;"><th style="padding:8px 10px;text-align:left;">Campaign</th><th style="padding:8px 10px;text-align:right;">Sent</th><th style="padding:8px 10px;text-align:right;">Open Rate</th><th style="padding:8px 10px;text-align:right;">Clicks</th><th style="padding:8px 10px;text-align:right;">Revenue</th></tr>
      ${sent.slice(0, 5).map((c, i) => `<tr style="${i % 2 ? 'background:#f8f9fb;' : ''}border-bottom:1px solid #e5e7eb;">
        <td style="padding:8px 10px;font-weight:600;">${c.name}</td>
        <td style="padding:8px 10px;text-align:right;">${c.listSize.toLocaleString()}</td>
        <td style="padding:8px 10px;text-align:right;font-weight:700;color:${(c.uniqueOpened / c.delivered) >= 0.4 ? '#8CC63F' : '#E8923F'};">${(c.uniqueOpened / c.delivered * 100).toFixed(1)}%</td>
        <td style="padding:8px 10px;text-align:right;">${c.clicked.toLocaleString()}</td>
        <td style="padding:8px 10px;text-align:right;font-weight:700;${c.revenue > 0 ? 'color:#8CC63F;' : 'color:#888;'}">${c.revenue > 0 ? '$' + (c.revenue / 1000).toFixed(0) + 'K' : '—'}</td>
      </tr>`).join('')}
    </table>

    ${topCamp ? `
    <div style="background:#f0fdf4;border:1px solid #8CC63F;border-radius:8px;padding:14px 16px;margin-top:12px;">
      <strong style="color:#166534;font-size:12px;">🏆 Top Campaign: ${topCamp.name}</strong>
      <p style="font-size:11px;color:#14532d;margin:6px 0 0;">${topCamp.listSize.toLocaleString()} sent · ${(topCamp.uniqueOpened / topCamp.delivered * 100).toFixed(1)}% open rate · ${topCamp.clicked} clicks · <strong>$${(topCamp.revenue / 1000).toFixed(0)}K revenue generated</strong></p>
    </div>` : ''}

    <!-- Address Health -->
    <h2 style="color:#002D5C;font-size:14px;border-bottom:3px solid #C6A75E;padding-bottom:6px;margin:28px 0 12px;">📧 Address Health Snapshot</h2>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <tr><td style="padding:6px 0;">Healthy addresses:</td><td style="text-align:right;font-weight:700;color:#8CC63F;">${demoHygiene.healthy.count.toLocaleString()} (${demoHygiene.healthy.pct}%)</td></tr>
      <tr><td style="padding:6px 0;">Stale (6mo+ no opens):</td><td style="text-align:right;font-weight:700;color:#E8923F;">${demoHygiene.stale.count.toLocaleString()}</td></tr>
      <tr><td style="padding:6px 0;">Bounced (hard):</td><td style="text-align:right;font-weight:700;color:#D94A4A;">${demoHygiene.bounced.count}</td></tr>
      <tr><td style="padding:6px 0;">Projected delivery after cleanup:</td><td style="text-align:right;font-weight:700;color:#8CC63F;">${demoHygiene.projectedDelivery}% (from ${demoHygiene.currentDelivery}%)</td></tr>
    </table>

    <!-- Optimal Send Time -->
    <h2 style="color:#002D5C;font-size:14px;border-bottom:3px solid #C6A75E;padding-bottom:6px;margin:28px 0 12px;">⏰ Today's Optimal Send Times</h2>
    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      ${demoSendTimes.slice(0, 3).map(s => `<tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:8px 0;font-weight:600;">${s.segment}</td><td style="text-align:right;">${s.day} ${s.time}</td><td style="text-align:right;font-weight:700;color:#8CC63F;">${s.openRate}% expected</td></tr>`).join('')}
    </table>

    <!-- Staff Performance -->
    <h2 style="color:#002D5C;font-size:14px;border-bottom:3px solid #C6A75E;padding-bottom:6px;margin:28px 0 12px;">👥 Staff Outreach Performance</h2>
    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      <tr style="background:#002D5C;color:white;"><th style="padding:8px 10px;text-align:left;">Staff</th><th style="padding:8px 10px;text-align:right;">Outreach</th><th style="padding:8px 10px;text-align:right;">Reply Rate</th><th style="padding:8px 10px;text-align:right;">Avg Response</th></tr>
      ${demoRelationships.map((r, i) => `<tr style="${i % 2 ? 'background:#f8f9fb;' : ''}border-bottom:1px solid #e5e7eb;">
        <td style="padding:8px 10px;font-weight:600;">${r.staff}</td>
        <td style="padding:8px 10px;text-align:right;">${r.outreach}</td>
        <td style="padding:8px 10px;text-align:right;font-weight:700;">${r.replyRate}%</td>
        <td style="padding:8px 10px;text-align:right;">${r.responseTime}</td>
      </tr>`).join('')}
    </table>

  </div>

  <!-- Footer -->
  <div style="background:#f4f6f8;padding:16px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center;">
    <p style="font-size:10px;color:#888;margin:0;">MEMTrak — Email Intelligence Platform for the American Land Title Association</p>
    <p style="font-size:9px;color:#aaa;margin:4px 0 0;">Built by AXG Systems · Generated ${new Date().toLocaleString()} · Confidential: Internal Use Only</p>
  </div>

</div>`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>Daily Email Briefing</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Rich, detailed daily report for the membership team. Copy HTML → paste in Outlook → send. Or print as PDF.</p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={() => printContent('MEMTrak Daily Briefing', briefingHtml)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold" style={{ background: 'var(--card)', border: '1px solid var(--card-border)', color: 'var(--heading)' }}>
            <Printer className="w-3.5 h-3.5" /> Print PDF
          </button>
          <button onClick={() => { navigator.clipboard.writeText(briefingHtml); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold" style={{ background: '#4A90D9', color: 'white' }}>
            {copied ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy HTML for Email</>}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold" style={{ background: 'var(--accent)', color: 'white' }}>
            <Mail className="w-3.5 h-3.5" /> Send to Team
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--card-border)' }}>
        <div className="bg-white p-0">
          <div dangerouslySetInnerHTML={{ __html: briefingHtml }} />
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>
        This briefing includes: performance metrics with industry benchmarks, priority actions with revenue impact, top campaigns with revenue attribution, address health snapshot, optimal send times, and staff performance. Copy the HTML and paste directly into Outlook to send as a formatted email.
      </div>
    </div>
  );
}
