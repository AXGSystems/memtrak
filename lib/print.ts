/**
 * MEMTrak Report Generator
 * Generates professional, self-contained reports with context and narrative.
 * Someone reading this for the first time should understand everything.
 */

import { demoCampaigns, demoMonthly, demoDecayAlerts, demoChurnScores,
  demoSendTimes, demoRelationships, demoHygiene, getCampaignTotals } from './demo-data';

const totals = getCampaignTotals();
const openRate = ((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1);
const clickRate = ((totals.totalClicked / totals.totalDelivered) * 100).toFixed(1);
const bounceRate = ((totals.totalBounced / totals.totalSent) * 100).toFixed(1);

function header(title: string, subtitle: string) {
  return `
  <div style="display:flex;align-items:flex-end;justify-content:space-between;border-bottom:3px solid #C6A75E;padding-bottom:14px;margin-bottom:28px;">
    <div>
      <div style="font-size:24px;font-weight:800;color:#002D5C;letter-spacing:-0.5px;">MEMTrak</div>
      <div style="font-size:13px;color:#002D5C;font-weight:600;margin-top:2px;">${title}</div>
      <div style="font-size:10px;color:#7a8898;margin-top:2px;">${subtitle}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;color:#5a6d82;font-weight:600;">American Land Title Association</div>
      <div style="font-size:9px;color:#9a9690;">by AXG Systems</div>
    </div>
  </div>`;
}

function section(title: string) {
  return `<h2 style="font-size:14px;font-weight:700;color:#002D5C;border-bottom:2px solid #C6A75E;padding-bottom:4px;margin:28px 0 12px;">${title}</h2>`;
}

function kpiRow(items: { label: string; value: string; context: string }[]) {
  return `<div style="display:grid;grid-template-columns:repeat(${Math.min(items.length, 4)},1fr);gap:12px;margin-bottom:20px;">${items.map(i => `
    <div style="background:#f4f6f8;border:1px solid #d1d9e2;border-radius:10px;padding:14px;">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:0.08em;color:#7a8898;font-weight:700;">${i.label}</div>
      <div style="font-size:22px;font-weight:800;color:#002D5C;margin:4px 0;">${i.value}</div>
      <div style="font-size:10px;color:#5a6d82;line-height:1.4;">${i.context}</div>
    </div>`).join('')}</div>`;
}

function table(headers: string[], rows: string[][]) {
  return `<table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:11px;">
    <thead><tr>${headers.map(h => `<th style="background:#002D5C;color:white;padding:8px 12px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:0.05em;">${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((row, i) => `<tr style="background:${i % 2 ? '#f8f9fb' : 'white'}">${row.map(c => `<td style="padding:7px 12px;border-bottom:1px solid #e8eaee;">${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
}

function insight(text: string) {
  return `<div style="background:#f0f7e6;border:1px solid #8CC63F;border-radius:8px;padding:14px;margin:12px 0;font-size:11px;color:#2d4a1a;line-height:1.6;"><strong style="color:#4a7a1a;">Key Insight:</strong> ${text}</div>`;
}

function footer() {
  return `<div style="margin-top:40px;padding-top:14px;border-top:1px solid #d1d9e2;text-align:center;font-size:9px;color:#9a9690;line-height:1.6;">
    MEMTrak — Email Intelligence Platform for the American Land Title Association<br>
    Built by AXG Systems | Report generated ${new Date().toLocaleString()}<br>
    <em>Confidential — For Internal ALTA Staff Use Only</em>
  </div>`;
}

const reports: Record<string, () => string> = {
  'Daily Briefing': () => `
    ${header('Daily Intelligence Briefing', `${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} — Prepared for the ALTA Membership Team`)}

    <p style="font-size:12px;color:#2c3e50;line-height:1.8;margin-bottom:20px;">
      This briefing summarizes ALTA's email outreach performance, engagement health, and priority actions. MEMTrak monitors all email communications sent from membership@alta.org and licensing@alta.org, tracking opens, clicks, bounces, and downstream revenue impact. This report is generated daily to keep the membership team aligned on outreach effectiveness.
    </p>

    ${section('Performance Summary — April YTD')}
    ${kpiRow([
      { label: 'Emails Sent', value: totals.totalSent.toLocaleString(), context: `Across ${totals.campaignCount} campaigns sent this month from all email sources.` },
      { label: 'Open Rate', value: openRate + '%', context: 'Percentage of delivered emails opened by recipients. Industry avg for associations: 25-35%.' },
      { label: 'Click Rate', value: clickRate + '%', context: 'Percentage of delivered emails where a link was clicked. Industry avg: 3-5%.' },
      { label: 'Revenue Attributed', value: '$' + (totals.totalRevenue / 1000).toFixed(0) + 'K', context: 'Membership renewals, PFL purchases, and event registrations traced back to specific email campaigns.' },
    ])}

    ${insight(`ALTA's ${openRate}% open rate exceeds the association industry average of 25-35%, indicating strong subject line performance and list quality. The ${clickRate}% click-through rate is 3x the industry average, suggesting high content relevance. ${totals.totalBounced} emails bounced (${bounceRate}%), which should be cleaned immediately to protect domain reputation.`)}

    ${section('Priority Actions')}
    <div style="margin-bottom:20px;">
      ${[
        { urgency: 'HIGH', color: '#D94A4A', text: `${demoDecayAlerts.filter(d => d.decay >= 70).length} member organizations showing engagement decay — $${demoDecayAlerts.filter(d => d.decay >= 70).reduce((s, d) => s + d.revenue, 0).toLocaleString()} in annual dues revenue at risk. These members have stopped opening emails, which historically predicts non-renewal within 6 months.` },
        { urgency: 'HIGH', color: '#D94A4A', text: `${totals.totalBounced} email addresses bounced this month. Hard bounces damage ALTA's sender reputation with Gmail and Outlook, affecting deliverability for ALL future emails. Recommended: remove bounced addresses within 48 hours.` },
        { urgency: 'MEDIUM', color: '#E8923F', text: `${totals.scheduled} campaign is scheduled and ${totals.drafts} draft needs review before sending. Ensure all scheduled campaigns have MEMTrak tracking codes embedded.` },
        { urgency: 'PLANNING', color: '#4A90D9', text: `Renewal season (Aug-Dec): 4,994 members will need renewal communications. Campaign sequence should be built by July. MEMTrak's Renewal Campaign page has segment-by-segment projections.` },
      ].map(a => `<div style="display:flex;gap:12px;padding:12px;border-radius:8px;background:#f8f9fb;border:1px solid #e5e7eb;margin-bottom:8px;">
        <span style="background:${a.color}15;color:${a.color};font-size:9px;font-weight:800;padding:3px 10px;border-radius:20px;white-space:nowrap;height:fit-content;">${a.urgency}</span>
        <span style="font-size:11px;color:#2c3e50;line-height:1.5;">${a.text}</span>
      </div>`).join('')}
    </div>

    ${section('Monthly Trend')}
    ${table(['Month', 'Sent', 'Opened', 'Open Rate', 'Clicked', 'Click Rate', 'Bounced'],
      demoMonthly.map(m => [m.month, m.sent.toLocaleString(), m.opened.toLocaleString(), ((m.opened / (m.sent - m.bounced)) * 100).toFixed(1) + '%', m.clicked.toLocaleString(), ((m.clicked / (m.sent - m.bounced)) * 100).toFixed(1) + '%', m.bounced.toLocaleString()])
    )}
    ${insight('March was the highest-volume month (21,400 sends) driven by ALTA ONE promotion and Advocacy Summit outreach. Open rates improved from 34.5% in January to 40%+ in March-April, likely due to better subject line testing and list segmentation.')}

    ${section('What is MEMTrak?')}
    <p style="font-size:11px;color:#5a6d82;line-height:1.7;">MEMTrak is ALTA's internal email intelligence platform, built by AXG Systems. It tracks email opens (via embedded logo tracker), link clicks (via redirect tracking), bounces, and unsubscribes — then connects this engagement data to membership revenue to calculate the ROI of every campaign. MEMTrak replaces Higher Logic's email analytics at 97% lower cost ($75/month vs $1,500-3,000/month) while adding capabilities Higher Logic doesn't offer: engagement decay prediction, churn scoring, staff relationship mapping, physical mail return scanning, and revenue attribution.</p>
    ${footer()}
  `,

  'Campaigns': () => `
    ${header('Campaign Performance Report', `April 2026 — All Email Campaigns Across All Platforms`)}

    <p style="font-size:12px;color:#2c3e50;line-height:1.8;margin-bottom:20px;">
      This report shows every email campaign sent by ALTA this month, regardless of which platform it originated from (MEMTrak, Higher Logic, or Outlook). Each campaign is tracked for delivery, opens, clicks, bounces, and — where applicable — downstream revenue generated.
    </p>

    ${section('Campaign Summary')}
    ${kpiRow([
      { label: 'Campaigns Sent', value: String(totals.campaignCount), context: `Plus ${totals.scheduled} scheduled and ${totals.drafts} in draft.` },
      { label: 'Total Recipients', value: totals.totalSent.toLocaleString(), context: 'Combined list size across all campaigns.' },
      { label: 'Avg Open Rate', value: openRate + '%', context: 'Unique opens ÷ delivered. Industry avg: 25-35%.' },
      { label: 'Total Revenue', value: '$' + (totals.totalRevenue / 1000).toFixed(0) + 'K', context: 'Renewals + PFL purchases + registrations attributed to emails.' },
    ])}

    ${section('All Campaigns')}
    ${table(
      ['Campaign', 'Source', 'Sent', 'Open Rate', 'CTR', 'Bounce', 'Revenue'],
      demoCampaigns.filter(c => c.status === 'Sent').map(c => [
        `<strong>${c.name}</strong><br><span style="font-size:9px;color:#7a8898;">${c.type} — ${c.sentDate}</span>`,
        c.source,
        c.listSize.toLocaleString(),
        c.delivered > 0 ? ((c.uniqueOpened / c.delivered) * 100).toFixed(1) + '%' : '—',
        c.delivered > 0 ? ((c.clicked / c.delivered) * 100).toFixed(1) + '%' : '—',
        c.listSize > 0 ? ((c.bounced / c.listSize) * 100).toFixed(1) + '%' : '—',
        c.revenue > 0 ? '<strong style="color:#8CC63F;">$' + (c.revenue / 1000).toFixed(0) + 'K</strong>' : '—',
      ])
    )}

    ${insight('The Membership Renewal campaign had the highest open rate (69.8%) and generated $407K in revenue — the most valuable campaign by far. ALTA ONE Early Bird drove $162K. PFL Compliance has the lowest open rate (29.9%) — consider A/B testing the subject line with urgency framing (MEMTrak A/B testing showed "Action Required" outperforms "Important" by 29.6%).')}
    ${footer()}
  `,

  'Intelligence': () => `
    ${header('Email Intelligence Report', `Engagement Decay, Churn Risk & Send Optimization — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)}

    <p style="font-size:12px;color:#2c3e50;line-height:1.8;margin-bottom:20px;">
      This report identifies members whose email engagement is declining (a leading indicator of non-renewal), scores churn risk, and recommends optimal send times. These analytics are unique to MEMTrak — no email service provider offers individual-level engagement trending or churn prediction.
    </p>

    ${section('Engagement Decay Alerts')}
    <p style="font-size:11px;color:#5a6d82;margin-bottom:12px;">Members whose email open rate has dropped significantly. A decay score of 70+ typically precicts non-renewal within 3-6 months.</p>
    ${table(['Organization', 'Type', 'Decay Score', 'Open Rate Trend', 'Last Opened', 'Revenue at Risk'],
      demoDecayAlerts.map(d => [
        `<strong>${d.org}</strong>`,
        d.type,
        `<span style="color:${d.decay >= 70 ? '#D94A4A' : d.decay >= 40 ? '#E8923F' : '#8CC63F'};font-weight:800;">${d.decay}/100</span>`,
        `${d.historical}% → ${d.recent}%`,
        d.lastOpen,
        `<strong style="color:#D94A4A;">$${d.revenue.toLocaleString()}</strong>`,
      ])
    )}
    ${insight(`Total revenue at risk from decaying members: $${demoDecayAlerts.filter(d => d.decay >= 50).reduce((s, d) => s + d.revenue, 0).toLocaleString()}. The highest-risk account is ${demoDecayAlerts[0].org} (${demoDecayAlerts[0].type}) which has gone completely dark. ${demoDecayAlerts[1].org} is an ACU underwriter worth $61,554/year — immediate CEO-level outreach recommended.`)}

    ${section('Predictive Churn Scores')}
    ${table(['Organization', 'Churn Risk', 'Revenue', 'Contributing Factors', 'Recommended Action'],
      demoChurnScores.map(c => [
        `<strong>${c.org}</strong>`,
        `<span style="color:${c.score >= 70 ? '#D94A4A' : c.score >= 50 ? '#E8923F' : '#8CC63F'};font-weight:800;">${c.score}%</span>`,
        '$' + c.revenue.toLocaleString(),
        c.factors.join('; '),
        `<em style="color:#8CC63F;">${c.action}</em>`,
      ])
    )}

    ${section('Optimal Send Times by Segment')}
    <p style="font-size:11px;color:#5a6d82;margin-bottom:12px;">Based on when each member segment historically opens emails. Sending at the right time improves open rates by 15-25%.</p>
    ${table(['Segment', 'Best Day', 'Best Time', 'Open Rate at This Time', 'Sample Size'],
      demoSendTimes.map(s => [s.segment, s.day, s.time, `<strong>${s.openRate}%</strong>`, s.sample.toLocaleString()])
    )}

    ${section('Staff Relationship Mapping')}
    <p style="font-size:11px;color:#5a6d82;margin-bottom:12px;">Which ALTA staff members get the best response rates from member organizations. Use this to route outreach to the person with the strongest existing relationship.</p>
    ${table(['Staff Member', 'Total Outreach', 'Reply Rate', 'Avg Response Time', 'Relationship Strength'],
      demoRelationships.map(r => [r.staff, String(r.outreach), `<strong>${r.replyRate}%</strong>`, r.responseTime, `<span style="color:${r.strength === 'Exceptional' ? '#8CC63F' : r.strength === 'Strong' ? '#4A90D9' : '#E8923F'};font-weight:700;">${r.strength}</span>`])
    )}
    ${footer()}
  `,

  'Deliverability': () => `
    ${header('Email Deliverability Report', `Domain Health, Bounce Analysis & Authentication Status — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)}
    <p style="font-size:12px;color:#2c3e50;line-height:1.8;margin-bottom:20px;">
      Email deliverability determines whether ALTA's messages actually reach member inboxes or get blocked by spam filters. This report monitors domain authentication, bounce rates, and inbox placement. Poor deliverability means wasted effort — emails that never arrive can't be opened, clicked, or drive renewals.
    </p>
    ${section('Deliverability Health')}
    ${kpiRow([
      { label: 'Delivery Rate', value: '96.2%', context: 'Percentage of sent emails that reached the recipient server. Target: >96%. Below 95% indicates serious issues.' },
      { label: 'Hard Bounce Rate', value: '1.8%', context: 'Invalid addresses (mailbox doesn\'t exist). These should be removed immediately — they damage reputation.' },
      { label: 'Soft Bounce Rate', value: '2.0%', context: 'Temporary failures (full mailbox, server down). May resolve on retry. Monitor for patterns.' },
      { label: 'Spam Complaint Rate', value: '0.02%', context: 'Recipients marking ALTA as spam. Industry threshold: <0.1%. ALTA is well within safe range.' },
    ])}
    ${section('Email Authentication Status')}
    <p style="font-size:11px;color:#5a6d82;margin-bottom:12px;">These DNS records prove to Gmail, Outlook, and other providers that ALTA is authorized to send email from @alta.org. Missing or misconfigured records cause emails to land in spam.</p>
    ${table(['Protocol', 'Status', 'What It Does', 'Action Needed'],
      [
        ['SPF (Sender Policy Framework)', '<strong style="color:#8CC63F;">PASS</strong>', 'Verifies alta.org servers are authorized to send email', 'None — properly configured'],
        ['DKIM (DomainKeys)', '<strong style="color:#8CC63F;">PASS</strong>', 'Cryptographically signs emails to prove they haven\'t been tampered with', 'None — properly configured'],
        ['DMARC', '<strong style="color:#E8923F;">PARTIAL</strong>', 'Tells receiving servers what to do with emails that fail SPF/DKIM', '<strong style="color:#D94A4A;">Upgrade from "none" to "quarantine" policy</strong> — currently only monitoring, not enforcing'],
      ]
    )}
    ${insight('DMARC is set to monitoring only ("p=none"), which means anyone can spoof @alta.org and the receiving server won\'t reject it. Upgrading to "quarantine" or "reject" prevents domain spoofing and significantly improves inbox placement. This is a 30-minute DNS change with major deliverability impact.')}
    ${section('Bounce Breakdown')}
    ${table(['Reason', 'Count', '% of Bounces', 'Severity', 'Recommended Action'],
      [
        ['Invalid mailbox (hard bounce)', '198', '44%', '<strong style="color:#D94A4A;">Critical</strong>', 'Remove immediately — address doesn\'t exist'],
        ['Domain not found (hard bounce)', '67', '15%', '<strong style="color:#D94A4A;">Critical</strong>', 'Remove — entire domain is invalid'],
        ['Full mailbox (soft bounce)', '89', '20%', 'Low', 'Retry once — may resolve within days'],
        ['Temporary failure (soft bounce)', '52', '12%', 'Low', 'Auto-retried by sending system'],
        ['Content blocked (policy)', '24', '5%', '<strong style="color:#E8923F;">Medium</strong>', 'Review subject lines for spam trigger words'],
        ['Rate limited', '18', '4%', '<strong style="color:#E8923F;">Medium</strong>', 'Spread sends over longer time window'],
      ]
    )}
    ${section('Recommended Actions')}
    ${table(['Action', 'Impact', 'Urgency'],
      [
        ['Remove 265 hard-bounce addresses', 'Reduces bounce rate by ~1.4%', '<strong style="color:#D94A4A;">Immediate</strong>'],
        ['Upgrade DMARC to "quarantine" policy', 'Prevents domain spoofing of @alta.org', '<strong style="color:#D94A4A;">This week</strong>'],
        ['Run full list verification (18,400 addresses)', 'Expected: find 500+ more invalid', '<strong style="color:#E8923F;">This month</strong>'],
        ['A/B test Title News subject lines', 'Expected: +5-10% open rate improvement', 'Next campaign'],
      ]
    )}
    ${footer()}
  `,

  'Address Hygiene': () => `
    ${header('Address Hygiene Report', `Email & Physical Address Quality Analysis — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)}
    <p style="font-size:12px;color:#2c3e50;line-height:1.8;margin-bottom:20px;">
      This report analyzes the quality of ALTA's 18,400 email addresses and identifies addresses that should be cleaned, re-engaged, or removed. A clean list improves deliverability for everyone — sending to invalid addresses damages ALTA's domain reputation, which causes legitimate emails to land in spam for ALL recipients.
    </p>
    ${section('Address Health Overview')}
    ${kpiRow([
      { label: 'Healthy', value: '14,200 (77.2%)', context: 'Active, valid addresses that have engaged with at least one email in the past 6 months.' },
      { label: 'Stale', value: '2,800 (15.2%)', context: 'No email opens in 6+ months. These members may have changed email addresses or lost interest.' },
      { label: 'Bounced', value: '680 (3.7%)', context: 'Addresses that returned errors 2+ times. Likely invalid — should be removed.' },
      { label: 'Other Issues', value: '720 (3.9%)', context: '420 unsubscribed (keep for compliance), 220 invalid syntax, 80 risky (spam complaints).' },
    ])}
    ${insight(`If ALTA removes the 680 bounced + 220 invalid addresses and re-engages even 15% of the 2,800 stale addresses, delivery rate would improve from 96.2% to an estimated 98.8%. This means ~480 more emails reaching inboxes per campaign — at ALTA's ${openRate}% open rate, that's ~200 more members reading each message.`)}
    ${section('Stale Addresses by Member Segment')}
    <p style="font-size:11px;color:#5a6d82;margin-bottom:12px;">Which member types have the most disengaged email addresses. Higher stale rates may indicate list quality issues in that segment.</p>
    ${table(['Segment', 'Stale Count', 'Total in Segment', 'Stale %'],
      [
        ['ACA (Title Agents)', '1,680', '8,200', '20.5%'],
        ['ATXA (Texas Agents)', '180', '950', '18.9%'],
        ['ACB (Abstracters)', '120', '680', '17.6%'],
        ['AS (Associates)', '200', '1,200', '16.7%'],
        ['REA (Attorneys)', '520', '3,400', '15.3%'],
        ['ACU (Underwriters)', '<strong style="color:#8CC63F;">2</strong>', '220', '<strong style="color:#8CC63F;">0.9%</strong>'],
      ]
    )}
    ${insight('ACU underwriters have a near-perfect 0.9% stale rate — these are ALTA\'s most engaged members. ACA agents have the highest stale count (1,680) which tracks with their larger population. The 20.5% stale rate in ACA suggests a significant cohort that may have churned mentally before officially non-renewing.')}
    ${section('Recommended Cleanup Sequence')}
    ${table(['Step', 'Action', 'Addresses Affected', 'Expected Impact'],
      [
        ['1', '<strong>Remove invalid + bounced immediately</strong>', '900', 'Bounce rate drops from 3.8% to ~0.8%'],
        ['2', '<strong>Send re-engagement campaign to stale</strong>', '2,800', 'Recover ~420 (15%) or confirm for removal'],
        ['3', '<strong>Verify remaining risky addresses</strong>', '80', 'Protect domain reputation'],
        ['4', '<strong>Purge non-responders after 30 days</strong>', 'TBD', 'Final list is clean, high-quality, deliverable'],
      ]
    )}
    ${footer()}
  `,

  'A/B Testing': () => `
    ${header('A/B Test Results Report', `Subject Line, Send Time & From Address Experiments`)}
    <p style="font-size:12px;color:#2c3e50;line-height:1.8;margin-bottom:20px;">
      A/B testing compares two versions of an email element (subject line, send time, or from address) to determine which performs better. MEMTrak splits the recipient list, sends both versions, and measures which variant gets more opens and clicks. These results inform future campaign strategy.
    </p>
    ${section('Test Results')}
    ${table(['Test', 'Variable Tested', 'Winner', 'Lift', 'Finding'],
      [
        ['PFL Compliance Subject Line', 'Subject: "Important" vs "Action Required"', '<strong style="color:#8CC63F;">Variant B</strong>', '+29.6%', '"Action Required" urgency framing dramatically outperforms generic "Important" subject lines'],
        ['Renewal Email Send Time', 'Tuesday 9am vs Thursday 2pm', '<strong style="color:#8CC63F;">Variant A</strong>', '+21.2%', 'Tuesday morning sends had 21% higher open rate — aligns with MEMTrak timing data'],
        ['ALTA ONE From Address', 'membership@ vs CEO personal', '<strong style="color:#4A90D9;">Running</strong>', '+25.6% (prelim)', 'CEO-signed emails showing significant lift — running 7 more days before declaring'],
      ]
    )}
    ${insight('The two completed tests have immediate actionable takeaways: (1) Use urgency-based subject lines for all compliance emails, and (2) Send renewal emails on Tuesday mornings. If the CEO from-address test confirms its 25.6% lift, consider having Chris Morton\'s name on all high-priority member communications.')}
    ${section('What This Means for Campaign Strategy')}
    <p style="font-size:11px;color:#2c3e50;line-height:1.7;">A/B testing is one of the highest-ROI activities in email marketing. A single subject line improvement of 29.6% applied to ALTA's 4,994-member list means approximately 1,480 more members opening each email. At ALTA's click rate, that translates to ~208 more clicks per campaign — more registrations, more renewals, more revenue.</p>
    ${footer()}
  `,

  'Renewal Campaign': () => `
    ${header('Renewal Season Campaign Plan', `FY2027 Membership Renewal Strategy — Aug–Dec 2026`)}
    <p style="font-size:12px;color:#2c3e50;line-height:1.8;margin-bottom:20px;">
      This plan outlines ALTA's automated email renewal sequence for the FY2027 renewal cycle. 4,994 members across 7 segments will receive a personalized multi-touch outreach sequence from August through December 2026. Revenue projections are based on historical renewal rates by member type.
    </p>
    ${section('Revenue Projections by Segment')}
    ${table(['Type', 'Name', 'Members', 'Avg Dues', 'Est. Renewal Rate', 'Expected Renewals', 'Expected Revenue'],
      [
        ['ACA', 'Title Insurance Agents', '3,208', '$1,216', '85%', '2,727', '<strong style="color:#8CC63F;">$3,316,032</strong>'],
        ['REA', 'Real Estate Attorneys', '926', '$441', '82%', '759', '$334,719'],
        ['ATXA', 'Texas Agents', '257', '$840', '78%', '200', '$168,000'],
        ['ACB', 'Title Abstracters', '244', '$517', '80%', '195', '$100,815'],
        ['AS', 'Associates', '229', '$777', '75%', '172', '$133,644'],
        ['ACU', 'Underwriters', '40', '$61,554', '<strong style="color:#8CC63F;">98%</strong>', '39', '<strong style="color:#8CC63F;">$2,400,606</strong>'],
        ['REB', 'RE Attorneys (non-Agent)', '41', '$461', '72%', '30', '$13,830'],
      ]
    )}
    ${kpiRow([
      { label: 'Total Members', value: '4,994', context: 'All active members eligible for FY2027 renewal.' },
      { label: 'Expected Renewals', value: '4,122', context: 'Based on segment-specific historical renewal rates.' },
      { label: 'Expected Revenue', value: '$6.5M', context: 'Blended projection across all member types.' },
      { label: 'Campaign Window', value: 'Aug–Dec', context: '5-month multi-touch sequence with escalating urgency.' },
    ])}
    ${insight('ACU underwriters represent only 40 members but $2.4M in expected renewal revenue (37% of total). A single ACU non-renewal costs $61,554. The ACU renewal outreach should be CEO-personal with white-glove treatment — not bulk email. MEMTrak\'s relationship mapping shows Chris Morton has an 88% reply rate with ACU members.')}
    ${section('Outreach Timeline')}
    ${table(['Month', 'Action', 'Target Segment', 'Channel'],
      [
        ['August', 'Pre-renewal awareness — early bird messaging', 'All 4,994 members', 'Email (MEMTrak tracked)'],
        ['September', 'Renewal notice #1 — standard renewal invitation', 'All members', 'Email + direct mail'],
        ['October', 'ACU white-glove — CEO personal outreach', 'ACU (40 members)', 'Phone + personal email'],
        ['October', 'Renewal reminder #2 — non-responders only', 'Non-renewed members', 'Email (urgency subject line)'],
        ['November', 'Final notice — "Don\'t lose your benefits"', 'Still non-renewed', 'Email + phone'],
        ['December', 'Lapsed member re-engagement', 'Non-renewed after deadline', 'Personal outreach'],
      ]
    )}
    ${footer()}
  `,

  'Ad Dashboard': () => `
    ${header('Advertising Revenue Report', `Revive Ad Server Performance — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)}
    <p style="font-size:12px;color:#2c3e50;line-height:1.8;margin-bottom:20px;">
      ALTA generates non-dues revenue through digital advertising placements in Title News, the ALTA website, event registration pages, and mobile properties. This report summarizes campaign performance across all ad zones managed through the Revive Ad Server.
    </p>
    ${section('Advertising Performance')}
    ${kpiRow([
      { label: 'Total Impressions', value: '1.95M', context: 'Total ad views across all zones and campaigns YTD.' },
      { label: 'Total Clicks', value: '33.3K', context: 'Members and visitors who clicked on an advertisement.' },
      { label: 'Average CTR', value: '1.7%', context: 'Click-through rate. Industry avg for association ads: 0.5-1.5%.' },
      { label: 'Total Revenue', value: '$183K', context: 'Advertising revenue generated YTD from all campaigns.' },
    ])}
    ${section('Active Campaigns')}
    ${table(['Campaign', 'Advertiser', 'Impressions', 'Clicks', 'CTR', 'Revenue', 'Budget Used'],
      [
        ['Website Banner — Annual', 'Old Republic', '680K', '9,520', '1.4%', '<strong style="color:#8CC63F;">$68K</strong>', '94%'],
        ['Education Sponsor', 'Fidelity National', '520K', '7,280', '1.4%', '$52K', '87%'],
        ['Title News Sponsorship Q2', 'First American', '450K', '8,100', '1.8%', '$45K', '90%'],
        ['New Member Welcome Ads', 'ALTA Programs', '120K', '4,800', '4.0%', 'Internal', '—'],
      ]
    )}
    ${section('Ad Zone Inventory')}
    ${table(['Zone', 'Size', 'Impressions', 'Fill Rate', 'CPM'],
      [
        ['Title News Leaderboard', '728x90', '980K', '<strong style="color:#8CC63F;">94%</strong>', '$12.50'],
        ['Website Sidebar', '300x250', '1.24M', '<strong style="color:#8CC63F;">88%</strong>', '$8.00'],
        ['Event Registration Banner', '728x90', '420K', '<strong style="color:#E8923F;">72%</strong>', '$15.00'],
        ['Mobile Interstitial', '320x480', '200K', '<strong style="color:#D94A4A;">56%</strong>', '$6.00'],
      ]
    )}
    ${insight('The Mobile Interstitial zone has only 56% fill rate — significant unsold inventory. At $6 CPM and 200K impressions, filling this to 90% would generate an additional $4,080/month ($49K annually). The Event Registration Banner at 72% fill could yield $2,520/month more. Total opportunity: ~$73K/year from filling existing inventory.')}
    ${footer()}
  `,

  'New Member Onboarding': () => `
    ${header('New Member Onboarding Report', `7-Email Drip Sequence Performance & Retention Impact`)}
    <p style="font-size:12px;color:#2c3e50;line-height:1.8;margin-bottom:20px;">
      ALTA's new member onboarding sequence is a 7-email automated drip campaign that welcomes new members over their first 90 days. The goal: increase first-year retention from the current 76% to 85% by ensuring new members discover ALTA's value proposition before their renewal decision. 566 new members entered this sequence in 2026.
    </p>
    ${section('Sequence Performance')}
    ${table(['Day', 'Email', 'Open Rate', 'Click Rate', 'Purpose'],
      [
        ['Day 0', '<strong>Welcome to ALTA</strong>', '<strong style="color:#8CC63F;">82%</strong>', '45%', 'First impression — set expectations, provide credentials'],
        ['Day 3', 'Meet Your Benefits', '68%', '32%', 'Highlight top 5 member benefits, resource library link'],
        ['Day 7', 'Upcoming Events', '55%', '28%', 'Promote next 3 events, encourage registration'],
        ['Day 14', 'Community Invite', '48%', '20%', 'Invite to Higher Logic community, engagement groups'],
        ['Day 30', 'Check-in Survey', '42%', '15%', 'Satisfaction pulse — identify friction early'],
        ['Day 60', 'Advocacy Introduction', '38%', '12%', 'TIPAC, advocacy opportunities, committee roles'],
        ['Day 90', 'First Quarter Review', '45%', '18%', 'Recap engagement, highlight unused benefits'],
      ]
    )}
    ${insight('The Day 0 welcome email achieves 82% open rate — the highest of any ALTA email. This is the golden window for making a first impression. By Day 60, engagement drops to 38%. Members who attend an event in their first 90 days retain at 92% vs 68% for non-attendees — the Day 7 "Upcoming Events" email is the most strategically important in the sequence.')}
    ${kpiRow([
      { label: 'New Members 2026', value: '566', context: 'All new members entered into the onboarding sequence this year.' },
      { label: 'Avg Open Rate', value: '54%', context: 'Average across all 7 sequence emails. Well above industry norms.' },
      { label: 'Current 1st-Year Retention', value: '76%', context: 'Baseline before onboarding optimization. 24% of new members don\'t renew.' },
      { label: 'Target Retention', value: '85%', context: 'If achieved, means 51 additional retained members = ~$38K revenue.' },
    ])}
    ${footer()}
  `,

  'Communication Log': () => `
    ${header('Communication Activity Report', `Staff Outreach Log — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)}
    <p style="font-size:12px;color:#2c3e50;line-height:1.8;margin-bottom:20px;">
      This log captures every outreach interaction between ALTA staff and member organizations — emails, phone calls, meetings, and events. Unlike automated campaign tracking, this represents personal 1:1 engagement that builds relationships. ALTA previously had no centralized way to track this activity; it was scattered across inboxes with no visibility.
    </p>
    ${section('Why This Matters')}
    <p style="font-size:11px;color:#2c3e50;line-height:1.7;margin-bottom:16px;">Personal outreach is the highest-impact engagement channel. An ACU underwriter who receives a check-in call from Chris Morton renews at nearly 100%. A non-compliant organization that gets a personal follow-up from Taylor Spolidoro is 4x more likely to convert to PFL than one who only receives automated emails. This log ensures no outreach falls through the cracks and helps the team coordinate — so two people don't call the same member on the same day.</p>
    ${section('Recent Activity Summary')}
    ${table(['Date', 'Staff', 'Channel', 'Organization', 'Subject', 'Outcome'],
      [
        ['Apr 11', 'Taylor Spolidoro', 'Email', '<strong>First American Title</strong>', 'PFL Renewal Reminder', '<span style="color:#8CC63F;font-weight:700;">Reply Received</span>'],
        ['Apr 10', 'Paul Martin', 'Phone', '<strong>Chicago Title Insurance</strong>', 'ACU Retention Check-in', '<span style="color:#8CC63F;font-weight:700;">Action Taken</span>'],
        ['Apr 9', 'Taylor Spolidoro', 'Email', '<strong>Heritage Abstract LLC</strong>', 'PFL Compliance Notice', '<span style="color:#D94A4A;font-weight:700;">Bounced</span>'],
        ['Apr 8', 'Chris Morton', 'Meeting', '<strong>Liberty Title Group</strong>', 'Membership Value Review', '<span style="color:#4A90D9;font-weight:700;">Meeting Scheduled</span>'],
        ['Apr 7', 'Taylor Spolidoro', 'Email', '<strong>National Title Services</strong>', 'PFL Follow-up', '<span style="color:#E8923F;font-weight:700;">Not Interested</span>'],
        ['Apr 5', 'Emily Mincey', 'Email', '<strong>Commonwealth Land Title</strong>', 'ALTA ONE Registration', '<span style="color:#8CC63F;font-weight:700;">Action Taken</span>'],
      ]
    )}
    ${insight('6 interactions logged this month. 2 resulted in positive actions (renewal confirmed, event registration), 1 meeting was scheduled (potential upgrade), 1 bounced (needs address update), 1 declined (revisit Q3). The Heritage Abstract bounce highlights the value of the MEMTrak Address Hygiene system — this address should have been flagged before outreach.')}
    ${footer()}
  `,
};

export function memtrakPrint(title: string) {
  const reportFn = reports[title];

  const w = window.open('', '_blank');
  if (!w) return;

  if (reportFn) {
    // Use the purpose-built report
    w.document.write(`<!DOCTYPE html><html><head><title>${title} — MEMTrak</title>
      <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1B3A5C;background:white;padding:40px 48px;max-width:920px;margin:0 auto;font-size:12px;line-height:1.5;}
      @media print{body{padding:0;}@page{margin:0.5in;size:letter;}}</style></head>
      <body>${reportFn()}</body></html>`);
  } else {
    // Fallback: clone page content for pages without custom reports
    const main = document.querySelector('main');
    if (!main) { w.close(); return; }
    const content = main.cloneNode(true) as HTMLElement;
    content.querySelectorAll('.no-print, button, input, select, textarea, .sticky').forEach(el => el.remove());

    w.document.write(`<!DOCTYPE html><html><head><title>${title} — MEMTrak</title>
      <style>
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1B3A5C;background:white;padding:40px 48px;max-width:920px;margin:0 auto;font-size:12px;}
        .grid{display:grid!important;gap:12px;} .lg\\:grid-cols-4{grid-template-columns:repeat(4,1fr)!important;} .lg\\:grid-cols-5{grid-template-columns:repeat(5,1fr)!important;} .lg\\:grid-cols-2{grid-template-columns:repeat(2,1fr)!important;} .lg\\:grid-cols-3{grid-template-columns:repeat(3,1fr)!important;}
        .flex{display:flex!important;} .items-center{align-items:center!important;} .justify-between{justify-content:space-between!important;} .gap-3{gap:12px!important;} .gap-4{gap:16px!important;}
        .space-y-2>*+*{margin-top:8px;} .space-y-3>*+*{margin-top:12px;}
        [style*="--card"]{background:#f8f9fb!important;border:1px solid #d1d9e2!important;border-radius:10px!important;padding:14px!important;color:#1B3A5C!important;}
        .text-white,[class*="text-white"]{color:#1B3A5C!important;} .text-white\\/40,.text-white\\/30,.text-white\\/50{color:#5a6d82!important;}
        .bg-white\\/5,.bg-white\\/10{background:rgba(27,58,92,0.04)!important;} .border-white\\/10{border-color:#d1d9e2!important;}
        table{width:100%;border-collapse:collapse;font-size:11px;} th{background:#002D5C!important;color:white!important;padding:8px 12px;text-align:left;} td{padding:7px 12px;border-bottom:1px solid #e5e7eb;}
        canvas{max-height:280px!important;} .stagger-children>*{opacity:1!important;animation:none!important;}
        .rounded-full{border-radius:9999px;display:inline-block;padding:2px 8px;font-size:10px;font-weight:700;}
        .text-green-400{color:#8CC63F!important;} .text-red-400{color:#D94A4A!important;} .text-amber-400{color:#E8923F!important;}
        .bg-green-500\\/20{background:rgba(140,198,63,0.12)!important;} .bg-red-500\\/20{background:rgba(217,74,74,0.12)!important;} .bg-amber-500\\/20{background:rgba(232,146,63,0.12)!important;}
        @media print{body{padding:0;}@page{margin:0.5in;}}
      </style></head><body>
      ${header(title, new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))}
      ${content.innerHTML}
      ${footer()}
      </body></html>`);
  }

  w.document.close();
  setTimeout(() => { w.print(); }, 800);
}
