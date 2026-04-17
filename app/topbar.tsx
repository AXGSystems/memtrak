'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Printer } from 'lucide-react';
import { memtrakPrint } from '@/lib/print';
import PageGuide, { type GuideContent } from '@/components/PageGuide';

const pageNames: Record<string, string> = {
  '/': 'Daily Briefing',
  '/briefing': 'Email Briefing',
  '/roi-calc': 'ROI Calculator',
  '/campaigns': 'Campaigns',
  '/campaign-builder': 'Campaign Builder',
  '/ai-writer': 'AI Subject Writer',
  '/ab-testing': 'A/B Testing',
  '/calendar': 'Send Calendar',
  '/renewals': 'Renewal Campaign',
  '/new-members': 'New Member Onboarding',
  '/live-feed': 'Live Activity Feed',
  '/member-health': 'Member Health',
  '/compare': 'Campaign Compare',
  '/intelligence': 'Intelligence',
  '/scoring': 'Engagement Scoring & LTV',
  '/journey': 'Member Journey',
  '/segments': 'Smart Segments',
  '/heatmap': 'Click Heatmap',
  '/content-analysis': 'Content Performance',
  '/nps': 'Member NPS',
  '/benchmarks': 'Industry Benchmarks',
  '/forecast': 'Revenue Forecast',
  '/privacy-metrics': 'Privacy-First Metrics',
  '/workflows': 'Automated Workflows',
  '/deliverability': 'Deliverability',
  '/spam-check': 'Spam Pre-Check',
  '/hygiene': 'Address Hygiene',
  '/scanner': 'Mail Scanner',
  '/log': 'Communication Log',
  '/event-tracker': 'Event Tracker',
  '/templates': 'Email Templates',
  '/ads': 'Ad Dashboard',
  '/ads/inventory': 'Ad Inventory',
  '/ads/request': 'Request Slot',
  '/generator': 'Code Generator',
  '/api-docs': 'API Documentation',
  '/integrations': 'Integrations Hub',
  '/data-export': 'Data Export',
  '/whats-new': "What's New",
  '/audit': 'Email Audit',
  '/roadmap': 'Tracking Roadmap',
  '/security': 'Security Dashboard',
  '/status': 'System Status',
  '/decay-radar': 'DecayRadar\u2122',
  '/disaffection-index': 'DisaffectionIndex\u2122',
  '/narrative-brief': 'NarrativeBrief\u2122',
  '/revenue-trace': 'RevenueTrace\u2122',
  '/trust-score': 'TrustScore\u2122',
  '/staff-pulse': 'StaffPulse\u2122',
  '/send-brain': 'SendBrain\u2122',
  '/unified-pulse': 'UnifiedPulse\u2122',
  '/inbox-guard': 'InboxGuard\u2122',
  '/fatigue-shield': 'FatigueShield\u2122',
  '/campaign-autopsy': 'CampaignAutopsy\u2122',
  '/compliance-vault': 'ComplianceVault\u2122',
  '/board-brief': 'BoardBrief\u2122',
  '/dark-mode-proof': 'DarkModeProof\u2122',
  '/whisper-score': 'WhisperScore\u2122',
  '/predictive-content': 'PredictiveContent\u2122',
  '/benchmark-lens': 'BenchmarkLens\u2122',
  '/member-prefer': 'MemberPrefer\u2122',
  '/cohort-view': 'CohortView\u2122',
  '/collision-guard': 'CollisionGuard\u2122',
  '/link-sentry': 'LinkSentry\u2122',
  '/tone-analyzer': 'ToneAnalyzer\u2122',
  '/winback-engine': 'WinbackEngine\u2122',
  '/seed-test': 'SeedTest\u2122',
  '/data-enrich': 'DataEnrich\u2122',
  '/anomaly-alert': 'AnomalyAlert\u2122',
  '/engage-points': 'EngagePoints\u2122',
  '/ghost-watch': 'GhostWatch\u2122',
  '/white-label': 'WhiteLabel\u2122',
  '/report-builder': 'Report Builder',
  '/notifications-center': 'Notification Center',
  '/engagement-log': 'Engagement Logger',
  '/memtrak-ai': 'MEMTrak AI',
  '/reminders': 'Email Reminders',
  '/activity-timeline': 'Activity Timeline',
  '/meeting-prep': 'Meeting Prep',
  '/member-360': 'Member360\u2122',
  '/goal-tracker': 'GoalTracker\u2122',
  '/impact-calc': 'ImpactCalc\u2122',
  '/trend-radar': 'TrendRadar\u2122',
  '/audience-builder': 'AudienceBuilder\u2122',
  '/campaign-planner': 'CampaignPlanner\u2122',
  '/data-quality': 'DataQuality\u2122',
  '/risk-matrix': 'RiskMatrix\u2122',
  '/template-vault': 'TemplateVault\u2122',
  '/opportunity-finder': 'OpportunityFinder\u2122',
  '/performance-pulse': 'PerformancePulse\u2122',
  '/system-dashboard': 'SystemDashboard\u2122',
  '/retention-map': 'RetentionMap\u2122',
  '/channel-mix': 'ChannelMix\u2122',
  '/ab-vault': 'ABVault\u2122',
  '/conversion-funnel': 'ConversionFunnel\u2122',
  '/sentiment-pulse': 'SentimentPulse\u2122',
  '/competitor-radar': 'CompetitorRadar\u2122',
  '/member-voice': 'MemberVoice\u2122',
  '/roi-dashboard': 'ROIDashboard\u2122',
};

const guides: Record<string, GuideContent> = {
  '/campaigns': {
    title: 'All Campaigns',
    purpose: 'View every email campaign sent from any source — MEMTrak, Higher Logic, or Outlook. Compare performance side-by-side, export data, and identify which campaigns drive the most revenue.',
    steps: [
      { label: 'Review the campaign table', detail: 'Each row shows send volume, open rate, click-through rate, bounce rate, and revenue attributed. Click any column to understand the metric.' },
      { label: 'Check source distribution', detail: 'The Source column shows where the campaign originated. MEMTrak campaigns have full tracking; Higher Logic has open/click data; Outlook shows manual logging.' },
      { label: 'Export for reporting', detail: 'Use the CSV button to export all campaign data for board reports or leadership meetings.' },
    ],
    keyMetrics: [
      { label: 'Open Rate', why: 'Percentage of delivered emails opened. Above 35% is excellent for associations. Note: Apple Mail Privacy Protection inflates this by ~30%.' },
      { label: 'Click Rate', why: 'The most reliable engagement metric. Cannot be faked by mail privacy. ALTA\'s 10%+ CTR is 3x the industry average.' },
      { label: 'Revenue Attribution', why: 'Renewals, registrations, and purchases tied to a specific campaign within 14 days of send.' },
    ],
    tips: [
      'Sort by revenue to find which campaigns generate the most value.',
      'Compare MEMTrak vs Higher Logic campaigns to see which platform performs better.',
      'Campaigns with high open rate but low click rate may need better call-to-action copy.',
    ],
  },
  '/intelligence': {
    title: 'Intelligence Dashboard',
    purpose: 'The analytics nerve center. Engagement decay alerts warn you about members going dark before they churn. Churn scores predict non-renewal. Send time optimization tells you when to reach each segment.',
    steps: [
      { label: 'Check engagement decay alerts', detail: 'Members whose open rate has dropped significantly are flagged. A drop from 80% to 20% predicts non-renewal within 3-6 months.' },
      { label: 'Review churn risk scores', detail: 'Each member gets a 0-100 churn probability based on engagement, payment, and event patterns. Focus on high-revenue members first.' },
      { label: 'Plan send times', detail: 'The optimal send time table shows when each segment is most likely to open. Use this to schedule campaigns for maximum impact.' },
    ],
    keyMetrics: [
      { label: 'Decay Score', why: 'Measures how much a member\'s engagement has declined. 100% = completely gone dark. 50%+ requires intervention.' },
      { label: 'Churn Score', why: 'AI-predicted probability of non-renewal. Combines 6 factors: email engagement, event attendance, payment history, committee participation, website activity, and member type.' },
    ],
    tips: [
      'ACU underwriters average $61K/year in dues — even a small churn probability is worth intervention.',
      'Route high-value decay alerts to Chris Morton for CEO-level personal outreach.',
      'The staff relationship mapping shows who has the best rapport with at-risk members.',
    ],
  },
  '/scoring': {
    title: 'Engagement Scoring & LTV',
    purpose: 'Every member gets a 0-100 engagement score based on 6 weighted factors. Combined with lifetime value projection, this tells you exactly who to prioritize for retention and who is at risk.',
    steps: [
      { label: 'Understand the scoring model', detail: 'The 6-factor model weights email opens (25%), clicks (20%), events (20%), committees (15%), dues (10%), and website activity (10%). Each factor is measured over the last 90 days.' },
      { label: 'Review the scoreboard', detail: 'The member table shows individual scores with LTV projections. Sort by score to find at-risk members, or by LTV to prioritize high-value retention.' },
      { label: 'Export for action', detail: 'Download the CSV and use it to build targeted campaigns for each engagement tier.' },
    ],
    keyMetrics: [
      { label: 'Engagement Score', why: 'Composite 0-100 score. Champions (90+), Engaged (70-89), At Risk (50-69), Disengaged (25-49), Gone Dark (0-24).' },
      { label: '5-Year LTV', why: 'Projected lifetime revenue based on dues amount, engagement trend, and member type retention rates.' },
    ],
    tips: [
      'Members scoring 50-69 are the intervention sweet spot — not yet gone, but trending down.',
      'An ACU underwriter at score 58 is worth more attention than 100 ACA agents at score 30.',
      'Compare this view with ActiveCampaign pricing: they charge $186/mo for the same scoring.',
    ],
  },
  '/workflows': {
    title: 'Automated Workflows',
    purpose: 'Event-triggered email sequences that run themselves. When a member\'s engagement drops, when an address bounces, when a renewal is approaching — workflows handle the first response automatically and escalate to staff when needed.',
    steps: [
      { label: 'Review active workflows', detail: 'Each workflow card shows the trigger condition, step-by-step actions, and conversion metrics. Click to expand the full timeline.' },
      { label: 'Check conversion rates', detail: 'The conversion rate shows what percentage of enrolled members re-engaged. Benchmark: 15%+ for decay re-engagement is good.' },
      { label: 'Monitor revenue protected', detail: 'Each workflow shows the dollar value of memberships it helped retain.' },
    ],
    tips: [
      'The engagement decay workflow saved $78K in the first quarter alone.',
      'Manual steps (phone calls) are critical — automated emails get 15% conversion, but personal calls push it to 66%.',
      'HubSpot charges $890/mo for this. ActiveCampaign charges $186/mo. MEMTrak includes it free.',
    ],
  },
  '/journey': {
    title: 'Member Journey',
    purpose: 'View the complete communication history for any member organization — every email, phone call, meeting, event, and payment in chronological order. This is the single source of truth for member relationships.',
    steps: [
      { label: 'Search for a member', detail: 'Use the search box to find any organization. The member list shows touchpoint count and membership duration.' },
      { label: 'Read the timeline', detail: 'Each event in the timeline is color-coded by type: green for opens, blue for sends, amber for calls, red for bounces.' },
      { label: 'Click for detail', detail: 'Click the member info card for a full profile including engagement score breakdown, touchpoint counts by type, and dues history.' },
    ],
    tips: [
      'Before calling a member, check their journey to see what emails they\'ve opened and events they\'ve attended.',
      'Bounced emails in the timeline indicate a possible address issue — cross-reference with Address Hygiene.',
      'This replaces manually checking membership@ and licensing@ inboxes.',
    ],
  },
  '/deliverability': {
    title: 'Deliverability Monitor',
    purpose: 'Protect ALTA\'s email reputation. Every bounced email damages domain reputation, reducing deliverability for ALL future sends. This dashboard tracks delivery rate, bounce reasons, authentication status, and recommended actions.',
    steps: [
      { label: 'Check the delivery rate', detail: 'Target: 98%+. Below 95% means significant addresses need cleanup.' },
      { label: 'Review bounce reasons', detail: 'The breakdown shows why emails bounce — invalid addresses, full mailboxes, or blocks. Each requires different action.' },
      { label: 'Act on recommendations', detail: 'The recommended actions panel prioritizes cleanup tasks by impact.' },
    ],
    keyMetrics: [
      { label: 'Delivery Rate', why: 'Percentage of sent emails that reached the inbox. Below 95% triggers ISP reputation damage.' },
      { label: 'Hard Bounce', why: 'Permanent failures (invalid address). These MUST be removed immediately.' },
      { label: 'Spam Complaints', why: 'Members marking email as spam. Above 0.1% triggers email provider sanctions.' },
    ],
    tips: [
      'Run address hygiene cleanup at least monthly — stale addresses accumulate fast.',
      'SPF, DKIM, and DMARC must all be configured for alta.org to maximize deliverability.',
      'A 3% bounce rate doesn\'t sound bad, but at ALTA\'s volume that\'s 500+ bad addresses sending spam signals.',
    ],
  },
  '/hygiene': {
    title: 'Address Hygiene',
    purpose: 'Clean your mailing list. Stale, bounced, and invalid addresses hurt deliverability for everyone. This page shows address health, projected delivery improvement, and specific cleanup actions.',
    steps: [
      { label: 'Review address health', detail: 'The health breakdown shows healthy, stale, bounced, unsubscribed, invalid, and risky addresses with percentages.' },
      { label: 'Check projected improvement', detail: 'Cleaning stale and bounced addresses projects delivery rate improvement — see the before/after comparison.' },
      { label: 'Run cleanup actions', detail: 'Follow the recommended actions list in priority order for maximum deliverability impact.' },
    ],
    tips: [
      'Stale addresses (no opens in 6 months) should be moved to a re-engagement campaign before removal.',
      'Hard bounces should be removed immediately — don\'t wait.',
      'After cleanup, delivery rate typically improves 2-4 percentage points.',
    ],
  },
  '/scanner': {
    title: 'Physical Mail Return Scanner',
    purpose: 'When physical mail returns to the office, photograph the envelope or enter the org name. MEMTrak fuzzy-matches against the member database and auto-flags the address as bad. This bridges physical and digital address quality.',
    steps: [
      { label: 'Enter or photograph', detail: 'Type the organization name from the returned envelope, or use your phone camera to photograph it.' },
      { label: 'Review the match', detail: 'MEMTrak shows the confidence score of the database match. 90%+ is auto-flagged; lower scores need manual review.' },
      { label: 'Log the return', detail: 'Click Log Return to flag the address. This propagates to re:Members and ALTA DASH automatically.' },
    ],
    tips: [
      'This is the only tool that connects physical mail returns to digital hygiene.',
      'Keep returned envelopes for a week — batch-scan at the end of the week for efficiency.',
      'Each flagged bad address improves deliverability for the next 18,000 email sends.',
    ],
  },
  '/log': {
    title: 'Communication Log',
    purpose: 'The centralized record of every outreach — email, phone, meeting. Replaces manually checking membership@ and licensing@ inboxes. Every touch is recorded so the entire team sees the full picture.',
    steps: [
      { label: 'Search for a contact', detail: 'Search by name, organization, subject, or staff member to find any past communication.' },
      { label: 'Review outcomes', detail: 'Each entry shows the outcome: Reply Received, Action Taken, Bounced, Meeting Scheduled, Not Interested, or Sent — No Reply.' },
      { label: 'Export for reporting', detail: 'Download the CSV for compliance documentation or board reporting.' },
    ],
    tips: [
      'Before reaching out to a member, search the log to see who else on the team has contacted them recently.',
      'Bounced entries should trigger an Address Hygiene review.',
      'This log feeds the staff relationship mapping in the Intelligence dashboard.',
    ],
  },
  '/campaign-builder': {
    title: 'Campaign Builder',
    purpose: 'Build and send email campaigns with MEMTrak tracking built in. Every campaign automatically gets: logo-based open tracking, click tracking on all links, CAN-SPAM unsubscribe footer, and analytics.',
    steps: [
      { label: 'Configure the campaign', detail: 'Name your campaign, choose a template, select the from address, and set a send date.' },
      { label: 'Select your audience', detail: 'Choose from pre-built segments or the full member list. The count shows exactly how many recipients.' },
      { label: 'Write your content', detail: 'Enter the subject line and HTML email body. MEMTrak auto-injects tracking — you don\'t add it manually.' },
      { label: 'Review and send', detail: 'The review step shows everything at a glance including the auto-generated campaign tracking ID.' },
    ],
    tips: [
      'Use the AI Subject Writer page to generate high-performing subject lines before building.',
      'A/B test subject lines on every major campaign — even small lifts compound over thousands of sends.',
      'The "From" address matters: CEO-signed emails show 25% higher open rates for retention campaigns.',
    ],
  },
  '/ab-testing': {
    title: 'A/B Testing',
    purpose: 'Test subject lines, send times, and from addresses with statistical rigor. MEMTrak calculates confidence levels and recommends winners — no guesswork.',
    steps: [
      { label: 'Review active tests', detail: 'Each test shows the two variants with real-time performance data.' },
      { label: 'Check statistical significance', detail: 'The detail modal shows confidence level, p-value, and confidence intervals.' },
      { label: 'Apply learnings', detail: 'Use winning variants in future campaigns. The insights build over time.' },
    ],
    tips: [
      'Always test subject lines on compliance emails — urgency framing ("Action Required") outperforms generic by 30%.',
      'Tuesday morning sends consistently outperform Thursday afternoon for renewals.',
      'CEO-signed from addresses show 25% lift vs generic membership@ — use this for high-value segments.',
    ],
  },
  '/decay-radar': {
    title: 'DecayRadar\u2122',
    purpose: 'Monitors each member\'s personal engagement baseline and flags when they deviate. A member who historically opens 80% of emails dropping to 20% triggers an alert with revenue at risk. Predicts churn 3-6 months before it happens.',
    steps: [
      { label: 'Review active alerts', detail: 'Members with significant engagement decline are listed by severity. Focus on high-revenue members first.' },
      { label: 'Check revenue at risk', detail: 'Each alert shows the member\'s annual dues — this is the revenue you\'ll lose if they churn.' },
      { label: 'Act on recommendations', detail: 'Each member has a recommended next action based on their decay pattern and relationship history.' },
    ],
    tips: ['DecayRadar catches churn signals that engagement scoring misses — a member can have a "moderate" score but be rapidly declining.', 'ACU underwriters ($61K/yr) should always get personal CEO outreach when flagged.'],
  },
  '/disaffection-index': {
    title: 'DisaffectionIndex\u2122',
    purpose: 'The next-generation replacement for open rate. Combines unsubscribe rate, complaint rate, and bounce rate into a single 0-100 health score. Based on MarTech 2026 research showing mailbox providers weight negative signals more than positive ones.',
    steps: [
      { label: 'Check your overall index', detail: 'Lower is healthier. Under 10 is excellent, 10-25 is good, above 50 needs attention.' },
      { label: 'Identify high-risk campaigns', detail: 'Sort the table by index score to find which campaigns generated the most disaffection signals.' },
      { label: 'Track the trend', detail: 'The monthly trend chart shows whether your list health is improving or degrading over time.' },
    ],
    tips: ['This is the metric ISPs actually use to decide your inbox placement — not open rate.', 'A campaign with great open rates can still damage deliverability if it generates complaints.'],
  },
  '/narrative-brief': {
    title: 'NarrativeBrief\u2122',
    purpose: 'An auto-generated daily intelligence briefing written as narrative prose — not charts, but analysis. Tells the story of what happened, what needs attention, and what to do next. Like having a marketing analyst write you a memo every morning.',
    steps: [
      { label: 'Read the briefing', detail: 'Each section is written as analysis, not data. The opening paragraph tells you the single most important thing.' },
      { label: 'Act on recommendations', detail: 'The Recommended Actions section gives specific next steps with expected dollar impact.' },
      { label: 'Share with the team', detail: 'Copy, print, or email the briefing to your team so everyone starts the day aligned.' },
    ],
    tips: ['The Staff Briefing Notes section tells each person what they should focus on today.', 'Print this for leadership meetings — it reads like a professional intelligence report.'],
  },
  '/revenue-trace': {
    title: 'RevenueTrace\u2122',
    purpose: 'Per-email, per-subject-line revenue attribution. Traces every dollar to the specific email that earned it — not just the campaign, but the exact email in a sequence. Uses a 14-day attribution window with multi-touch weighting.',
    steps: [
      { label: 'Check total attributed revenue', detail: 'The hero metric shows total revenue tied directly to email campaigns.' },
      { label: 'Review the waterfall', detail: 'The revenue waterfall shows which campaigns generate the most value, ranked.' },
      { label: 'Understand multi-touch attribution', detail: 'When a member opens 3 emails before renewing, RevenueTrace distributes credit: 30% first touch, 40% last touch, 30% assists.' },
    ],
    tips: ['Revenue per email ($) is your best ROI metric — it tells you the value of each send.', 'Renewal campaigns generate the most revenue but events campaigns have the highest per-email value.'],
  },
  '/trust-score': {
    title: 'TrustScore\u2122',
    purpose: 'A per-member relationship health index that measures trust, not just engagement. Combines reply rate, complaint absence, preference engagement, feedback signals, event attendance, and renewal behavior. Based on the MarTech 2026 trust framework.',
    steps: [
      { label: 'Review the trust distribution', detail: 'The doughnut shows how your membership splits across 5 trust tiers from Champions to Broken.' },
      { label: 'Understand the 4 factors', detail: 'Trust = Credibility + Reliability + Intimacy - Self-Orientation. Each factor is measured differently.' },
      { label: 'Compare trust vs engagement', detail: 'The scatter chart shows that trust and engagement are NOT the same. Some high-engagement members have broken trust.' },
    ],
    tips: ['A member who opens every email but reports spam has high engagement but broken trust.', 'The "Neutral" tier (50-69) is the highest-leverage intervention target.'],
  },
  '/staff-pulse': {
    title: 'StaffPulse\u2122',
    purpose: 'Maps which staff members have the strongest relationships with which member segments. Tracks reply rates, response times, and relationship strength. Routes outreach recommendations to the person with the best connection.',
    steps: [
      { label: 'Review the scoreboard', detail: 'Each staff card shows their outreach volume, reply rate, response time, and which segments they connect with best.' },
      { label: 'Use the routing matrix', detail: 'The color-coded grid shows the best person to contact each member type.' },
      { label: 'Follow routing recommendations', detail: 'Specific routing advice at the bottom tells you who should handle which outreach.' },
    ],
    tips: ['Chris Morton (CEO) has an 88% reply rate with ACU underwriters — always route high-value retention through him.', 'Volume doesn\'t equal effectiveness — Taylor has the most outreach but Paul has a higher reply rate.'],
  },
  '/send-brain': {
    title: 'SendBrain\u2122',
    purpose: 'AI send-time optimization at the individual level — not just "Tuesday 9 AM for marketers" but the exact time each specific person is most likely to open. Learns from historical open patterns across all campaigns.',
    steps: [
      { label: 'Check the heatmap', detail: 'The 7x24 grid shows aggregate open probability by day and hour. Bright cells = high engagement windows.' },
      { label: 'Compare segment vs individual', detail: 'The comparison section shows how much individual optimization outperforms segment defaults.' },
      { label: 'Review the impact calculator', detail: 'See the predicted improvement from using SendBrain vs a fixed time slot.' },
    ],
    tips: ['Individual optimization predicts a 37% lift over fixed-time sends.', 'Board members open email at 6 AM; attorneys read during lunch. SendBrain captures these patterns automatically.'],
  },
  '/unified-pulse': {
    title: 'UnifiedPulse\u2122',
    purpose: 'Cross-platform intelligence aggregation. One view for all email sources — MEMTrak, Higher Logic, Outlook, and any connected ESP. The "single pane of glass" every organization wishes they had.',
    steps: [
      { label: 'Check platform health', detail: 'The 3 platform cards show each source\'s status, volume, and tracking capability.' },
      { label: 'Review the unified timeline', detail: 'All campaigns from all sources in one chronological view.' },
      { label: 'Compare platform performance', detail: 'The side-by-side charts show which platform delivers better results.' },
    ],
    tips: ['MEMTrak campaigns have full tracking; Higher Logic has aggregate data; Outlook is manual logging.', 'The coverage matrix shows exactly what each platform can and cannot track.'],
  },
  '/inbox-guard': {
    title: 'InboxGuard\u2122',
    purpose: 'Proactive domain reputation monitoring. Tracks SPF/DKIM/DMARC authentication, complaint rates vs Google\'s 0.3% threshold, BIMI readiness, and predicted inbox placement. Alerts before reputation damage occurs.',
    steps: [
      { label: 'Check authentication status', detail: 'All 4 protocols (SPF, DKIM, DMARC, BIMI) should be green. Any amber or red needs immediate attention.' },
      { label: 'Monitor complaint rate', detail: 'Stay below 0.1% recommended, never exceed 0.3% (Google blocks at this threshold).' },
      { label: 'Work toward BIMI', detail: 'BIMI shows your logo in the inbox — increases opens 38% and brand recall 120%. Follow the readiness checklist.' },
    ],
    tips: ['DMARC is currently at p=none — upgrade to p=quarantine to unlock BIMI eligibility.', 'InboxGuard can block a campaign send if it would push complaint rate over threshold.'],
  },
};

const themes = [
  { id: 'deep-blue', label: 'Midnight', color: '#0f1d2f', ring: '#8CC63F' },
  { id: 'vibranium', label: 'Vibranium', color: '#14082a', ring: '#a855f7' },
  { id: 'ember', label: 'Ember', color: '#261a0e', ring: '#F59E0B' },
  { id: 'axg', label: 'AXG Gold', color: '#f8f7f4', ring: '#C6A75E' },
  { id: 'light', label: 'ALTA Brand', color: '#f0f2f5', ring: '#D94A4A' },
  { id: 'ocean', label: 'Ocean', color: '#0891b2', ring: '#0891b2' },
  { id: 'sunset', label: 'Sunset', color: '#e85d3a', ring: '#e85d3a' },
  { id: 'electric', label: 'Electric', color: '#3b82f6', ring: '#3b82f6' },
  { id: 'forest', label: 'Forest', color: '#1a4a20', ring: '#22c55e' },
];

export default function TopBar() {
  const pathname = usePathname();
  const title = pageNames[pathname] || 'MEMTrak';
  const guide = guides[pathname];

  const [currentTheme, setCurrentTheme] = useState('deep-blue');

  const switchTheme = (id: string) => {
    document.documentElement.setAttribute('data-theme', id);
    localStorage.setItem('memtrak-theme', id);
    setCurrentTheme(id);
  };

  useEffect(() => {
    const saved = localStorage.getItem('memtrak-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
      setCurrentTheme(saved);
    }
  }, []);

  return (
    <div className="sticky top-0 z-40 px-6 py-2.5 flex items-center justify-between border-b no-print" style={{ background: 'var(--background)', borderColor: 'var(--card-border)' }}>
      <div className="flex items-center gap-3">
        <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
        <kbd
          className="text-[9px] font-bold px-1.5 py-0.5 rounded border cursor-pointer transition-all hover:opacity-80"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--card-border)', background: 'var(--input-bg)' }}
          title="Quick navigation"
        >
          &#8984;K
        </kbd>
        {guide && (
          <>
            <div className="w-px h-4" style={{ background: 'var(--card-border)' }} />
            <PageGuide pageId={pathname} guide={guide} />
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => switchTheme(t.id)}
              title={t.label}
              className="transition-all duration-200"
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: t.color,
                border: `2px solid ${currentTheme === t.id ? t.ring : 'rgba(128,128,128,0.2)'}`,
                boxShadow: currentTheme === t.id ? `0 0 8px ${t.ring}50` : 'none',
                transform: currentTheme === t.id ? 'scale(1.15)' : 'scale(1)',
                opacity: currentTheme === t.id ? 1 : 0.5,
              }}
            />
          ))}
        </div>
        <div className="w-px h-4" style={{ background: 'var(--card-border)' }} />
        <button
          onClick={() => memtrakPrint(title)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
          style={{ color: 'var(--accent)', border: '1px solid var(--card-border)' }}
        >
          <Printer className="w-3.5 h-3.5" /> Print {title}
        </button>
      </div>
    </div>
  );
}
