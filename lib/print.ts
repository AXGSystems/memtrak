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
