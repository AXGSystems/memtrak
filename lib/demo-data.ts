/**
 * MEMTrak Demo Data — Clearly Labeled Sample Campaigns
 *
 * ALL data here is DEMO/SAMPLE for proof-of-concept purposes.
 * In production, this comes from the MEMTrak event database.
 */

export interface DemoCampaign {
  id: string;
  name: string;
  type: 'Compliance' | 'Renewal' | 'Events' | 'Newsletter' | 'Onboarding' | 'Advocacy' | 'Retention';
  status: 'Sent' | 'Scheduled' | 'Draft';
  source: 'MEMTrak' | 'Higher Logic' | 'Outlook';
  sentDate: string;
  listSize: number;
  delivered: number;
  opened: number;
  uniqueOpened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  revenue: number;
}

export const demoCampaigns: DemoCampaign[] = [
  { id: 'pfl-compliance-apr-w3', name: 'PFL Compliance Notice — April Wave 3', type: 'Compliance', status: 'Sent', source: 'MEMTrak', sentDate: '2026-04-09', listSize: 3200, delivered: 2980, opened: 1042, uniqueOpened: 892, clicked: 267, bounced: 220, unsubscribed: 12, revenue: 2532 },
  { id: 'renewal-apr-batch', name: 'Membership Renewal — April Batch', type: 'Renewal', status: 'Sent', source: 'MEMTrak', sentDate: '2026-04-01', listSize: 420, delivered: 398, opened: 312, uniqueOpened: 278, clicked: 156, bounced: 22, unsubscribed: 0, revenue: 406992 },
  { id: 'alta-one-earlybird', name: 'ALTA ONE 2026 — Early Bird Registration', type: 'Events', status: 'Sent', source: 'MEMTrak', sentDate: '2026-04-07', listSize: 4994, delivered: 4780, opened: 2580, uniqueOpened: 2150, clicked: 780, bounced: 214, unsubscribed: 5, revenue: 162000 },
  { id: 'title-news-w15', name: 'Title News Weekly — Issue #15', type: 'Newsletter', status: 'Sent', source: 'Higher Logic', sentDate: '2026-04-11', listSize: 4840, delivered: 4650, opened: 2090, uniqueOpened: 1860, clicked: 465, bounced: 190, unsubscribed: 8, revenue: 0 },
  { id: 'new-member-welcome-1', name: 'New Member Welcome Series — Email #1', type: 'Onboarding', status: 'Sent', source: 'MEMTrak', sentDate: '2026-03-20', listSize: 83, delivered: 81, opened: 72, uniqueOpened: 65, clicked: 32, bounced: 2, unsubscribed: 0, revenue: 0 },
  { id: 'tipac-q2-pledge', name: 'TIPAC Q2 Pledge Drive', type: 'Advocacy', status: 'Sent', source: 'MEMTrak', sentDate: '2026-03-25', listSize: 800, delivered: 770, opened: 424, uniqueOpened: 385, clicked: 115, bounced: 30, unsubscribed: 1, revenue: 67500 },
  { id: 'acu-retention-q2', name: 'ACU Underwriter Retention Check-in', type: 'Retention', status: 'Sent', source: 'Outlook', sentDate: '2026-04-10', listSize: 40, delivered: 40, opened: 36, uniqueOpened: 36, clicked: 12, bounced: 0, unsubscribed: 0, revenue: 0 },
  { id: 'edge-spring-invite', name: 'EDge Program — Spring Cohort Invite', type: 'Events', status: 'Sent', source: 'Higher Logic', sentDate: '2026-03-15', listSize: 1500, delivered: 1440, opened: 648, uniqueOpened: 576, clicked: 173, bounced: 60, unsubscribed: 4, revenue: 34000 },
  { id: 'advocacy-alert-state', name: 'State Legislation Alert — TX & FL', type: 'Advocacy', status: 'Sent', source: 'MEMTrak', sentDate: '2026-03-28', listSize: 2100, delivered: 2020, opened: 1111, uniqueOpened: 1010, clicked: 404, bounced: 80, unsubscribed: 3, revenue: 0 },
  { id: 'pfl-compliance-may-w1', name: 'PFL Compliance — May Wave 1 (IL Focus)', type: 'Compliance', status: 'Scheduled', source: 'MEMTrak', sentDate: '2026-05-05', listSize: 1029, delivered: 0, opened: 0, uniqueOpened: 0, clicked: 0, bounced: 0, unsubscribed: 0, revenue: 0 },
  { id: 'alta-one-sponsor', name: 'ALTA ONE Sponsor Thank You', type: 'Events', status: 'Draft', source: 'MEMTrak', sentDate: '', listSize: 24, delivered: 0, opened: 0, uniqueOpened: 0, clicked: 0, bounced: 0, unsubscribed: 0, revenue: 0 },
];

export const demoMonthly = [
  { month: 'Jan', sent: 18200, delivered: 17480, opened: 6290, clicked: 1890, bounced: 720 },
  { month: 'Feb', sent: 16800, delivered: 16130, opened: 5810, clicked: 1740, bounced: 670 },
  { month: 'Mar', sent: 21400, delivered: 20540, opened: 8220, clicked: 2470, bounced: 860 },
  { month: 'Apr', sent: 13454, delivered: 12808, opened: 5180, clicked: 1700, bounced: 646 },
];

export const demoDecayAlerts = [
  { org: 'Heritage Abstract LLC', type: 'ACB', email: 'info@heritageabstract.com', decay: 100, trend: 'Gone Dark' as const, recent: 0, historical: 60, lastOpen: '90+ days ago', revenue: 517 },
  { org: 'First American Title', type: 'ACU', email: 'jsmith@firstam.com', decay: 75, trend: 'Declining' as const, recent: 20, historical: 80, lastOpen: '28 days ago', revenue: 61554 },
  { org: 'National Title Services', type: 'REA', email: 'mbrown@nationaltitle.com', decay: 55, trend: 'Declining' as const, recent: 30, historical: 70, lastOpen: '21 days ago', revenue: 441 },
  { org: 'Liberty Title Group', type: 'ACA', email: 'swilliams@libertytitle.com', decay: 41, trend: 'Slipping' as const, recent: 50, historical: 85, lastOpen: '7 days ago', revenue: 1216 },
  { org: 'Commonwealth Land Title', type: 'ACA', email: 'landerson@commonwealth.com', decay: 5, trend: 'Stable' as const, recent: 90, historical: 95, lastOpen: '2 days ago', revenue: 1216 },
];

export const demoChurnScores = [
  { org: 'Heritage Abstract', type: 'ACB', score: 92, revenue: 517, factors: ['Zero engagement 90 days', 'No events 2026', 'Late dues'], action: 'Immediate phone outreach' },
  { org: 'First American Title', type: 'ACU', score: 68, revenue: 61554, factors: ['Email declining 75%', 'Skipped Summit', 'Still on webinars'], action: 'CEO check-in — $61K account' },
  { org: 'National Title', type: 'REA', score: 55, revenue: 441, factors: ['Said not interested to PFL', 'Email stable', '1 event'], action: 'Soft touch — value email' },
  { org: 'Liberty Title Group', type: 'ACA', score: 35, revenue: 1216, factors: ['Slight decline', 'Considering upgrade (positive)'], action: 'Nurture upgrade — low risk' },
];

export const demoSendTimes = [
  { segment: 'Board Members', day: 'Monday', time: '8:00-9:00 AM', openRate: 90, sample: 42 },
  { segment: 'New Members (< 1yr)', day: 'Monday', time: '10:00-11:00 AM', openRate: 65, sample: 450 },
  { segment: 'ACU Underwriters', day: 'Tuesday', time: '9:00-10:00 AM', openRate: 52, sample: 280 },
  { segment: 'REA Attorneys', day: 'Wednesday', time: '12:00-1:00 PM', openRate: 41, sample: 1200 },
  { segment: 'ACA Title Agents', day: 'Thursday', time: '7:30-8:30 AM', openRate: 38, sample: 4200 },
];

export const demoRelationships = [
  { staff: 'Chris Morton (CEO)', outreach: 48, replyRate: 88, responseTime: '0.5 days', strength: 'Exceptional' as const },
  { staff: 'Paul Martin', outreach: 218, replyRate: 42, responseTime: '1.4 days', strength: 'Strong' as const },
  { staff: 'Taylor Spolidoro', outreach: 342, replyRate: 34, responseTime: '2.1 days', strength: 'Strong' as const },
  { staff: 'Caroline Ehrenfeld', outreach: 189, replyRate: 31, responseTime: '2.8 days', strength: 'Moderate' as const },
  { staff: 'Emily Mincey', outreach: 156, replyRate: 28, responseTime: '3.2 days', strength: 'Moderate' as const },
];

export const demoHygiene = {
  total: 18400,
  healthy: { count: 14200, pct: 77.2 },
  stale: { count: 2800, pct: 15.2 },
  bounced: { count: 680, pct: 3.7 },
  unsubscribed: { count: 420, pct: 2.3 },
  invalid: { count: 220, pct: 1.2 },
  risky: { count: 80, pct: 0.4 },
  projectedDelivery: 98.8,
  currentDelivery: 96.2,
};

// Aggregate helpers
export function getCampaignTotals() {
  const sent = demoCampaigns.filter(c => c.status === 'Sent');
  return {
    totalSent: sent.reduce((s, c) => s + c.listSize, 0),
    totalDelivered: sent.reduce((s, c) => s + c.delivered, 0),
    totalOpened: sent.reduce((s, c) => s + c.uniqueOpened, 0),
    totalClicked: sent.reduce((s, c) => s + c.clicked, 0),
    totalBounced: sent.reduce((s, c) => s + c.bounced, 0),
    totalRevenue: sent.reduce((s, c) => s + c.revenue, 0),
    campaignCount: sent.length,
    scheduled: demoCampaigns.filter(c => c.status === 'Scheduled').length,
    drafts: demoCampaigns.filter(c => c.status === 'Draft').length,
  };
}
