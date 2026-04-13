import { NextRequest, NextResponse } from 'next/server';
import { getEvents, getStats } from '@/lib/memtrak';

/**
 * MEMTrak Analytics Engine
 *
 * Advanced analytics that Higher Logic doesn't offer:
 * - Engagement decay detection (per-recipient trending)
 * - Churn risk scoring (engagement → renewal prediction)
 * - Send-time optimization (per-recipient best time)
 * - Relationship mapping (which staff gets best response)
 * - Revenue attribution (email → action → $$$)
 *
 * GET ?action=decay       — members with declining engagement
 * GET ?action=churn       — churn risk scores
 * GET ?action=timing      — optimal send times per segment
 * GET ?action=relationships — staff-to-member response rates
 * GET ?action=revenue     — email-to-revenue attribution
 * GET ?action=ab          — A/B test results
 * GET ?action=journey&rid=EMAIL — full member journey timeline
 */

// Simulated analytics (in production, computed from real event history)
const engagementDecay = [
  { email: 'jsmith@firstam.com', org: 'First American Title', type: 'ACU', recentOpenRate: 20, historicalOpenRate: 80, decayScore: 75, lastOpen: '2026-03-15', trend: 'declining' as const, revenueAtRisk: 61554 },
  { email: 'rchen@ctic.com', org: 'Chicago Title', type: 'ACU', recentOpenRate: 40, historicalOpenRate: 90, decayScore: 56, lastOpen: '2026-04-01', trend: 'declining' as const, revenueAtRisk: 61554 },
  { email: 'info@heritageabstract.com', org: 'Heritage Abstract', type: 'ACB', recentOpenRate: 0, historicalOpenRate: 60, decayScore: 100, lastOpen: '2026-01-20', trend: 'gone-dark' as const, revenueAtRisk: 517 },
  { email: 'swilliams@libertytitle.com', org: 'Liberty Title Group', type: 'ACA', recentOpenRate: 50, historicalOpenRate: 85, decayScore: 41, lastOpen: '2026-04-05', trend: 'declining' as const, revenueAtRisk: 1216 },
  { email: 'landerson@commonwealth.com', org: 'Commonwealth Land', type: 'ACA', recentOpenRate: 90, historicalOpenRate: 95, decayScore: 5, lastOpen: '2026-04-10', trend: 'stable' as const, revenueAtRisk: 1216 },
];

const churnScores = [
  { email: 'info@heritageabstract.com', org: 'Heritage Abstract', type: 'ACB', score: 92, factors: ['Zero email engagement in 90 days', 'No event attendance 2026', 'Dues payment 30 days late'], revenueAtRisk: 517, recommendation: 'Immediate phone outreach — account at extreme risk' },
  { email: 'jsmith@firstam.com', org: 'First American Title', type: 'ACU', score: 68, factors: ['Email engagement declining 75%', 'Skipped Advocacy Summit', 'Still attending webinars'], revenueAtRisk: 61554, recommendation: 'Schedule CEO-level check-in — $61K ACU account' },
  { email: 'mbrown@nationaltitle.com', org: 'National Title Services', type: 'REA', score: 55, factors: ['Said "not interested" to PFL outreach', 'Email engagement stable', 'Attended 1 event'], revenueAtRisk: 441, recommendation: 'Soft touch — value proposition email' },
  { email: 'swilliams@libertytitle.com', org: 'Liberty Title Group', type: 'ACA', score: 35, factors: ['Email engagement declining slightly', 'Considering membership upgrade (positive signal)'], revenueAtRisk: 1216, recommendation: 'Nurture the upgrade conversation — low churn risk' },
];

const sendTimeOptimization = [
  { segment: 'ACU Underwriters', bestDay: 'Tuesday', bestTime: '9:00-10:00 AM ET', avgOpenRate: 52, sampleSize: 280 },
  { segment: 'ACA Title Agents', bestDay: 'Thursday', bestTime: '7:30-8:30 AM ET', avgOpenRate: 38, sampleSize: 4200 },
  { segment: 'REA Attorneys', bestDay: 'Wednesday', bestTime: '12:00-1:00 PM ET', avgOpenRate: 41, sampleSize: 1200 },
  { segment: 'New Members (< 1yr)', bestDay: 'Monday', bestTime: '10:00-11:00 AM ET', avgOpenRate: 65, sampleSize: 450 },
  { segment: 'Board Members', bestDay: 'Monday', bestTime: '8:00-9:00 AM ET', avgOpenRate: 90, sampleSize: 42 },
];

const relationships = [
  { staffMember: 'Taylor Spolidoro', totalOutreach: 342, replyRate: 34, avgResponseTime: '2.1 days', topOrgs: ['First American', 'Old Republic', 'Stewart Title'], strength: 'Strong' as const },
  { staffMember: 'Paul Martin', totalOutreach: 218, replyRate: 42, avgResponseTime: '1.4 days', topOrgs: ['Chicago Title', 'Liberty Title', 'WFG National'], strength: 'Strong' as const },
  { staffMember: 'Chris Morton', totalOutreach: 48, replyRate: 88, avgResponseTime: '0.5 days', topOrgs: ['All ACU Underwriters', 'Board Members'], strength: 'Exceptional' as const },
  { staffMember: 'Emily Mincey', totalOutreach: 156, replyRate: 28, avgResponseTime: '3.2 days', topOrgs: ['Regional event attendees', 'ALTA ONE registrants'], strength: 'Moderate' as const },
  { staffMember: 'Caroline Ehrenfeld', totalOutreach: 189, replyRate: 31, avgResponseTime: '2.8 days', topOrgs: ['TIPAC contributors', 'Advocacy Summit attendees'], strength: 'Moderate' as const },
];

const revenueAttribution = [
  { campaign: 'PFL Compliance — Wave 3', emailsSent: 3200, conversions: 12, revenueGenerated: 2532, costToSend: 0, roi: 'Infinite (no send cost)', conversionWindow: '14 days' },
  { campaign: 'Membership Renewal — April', emailsSent: 420, conversions: 278, revenueGenerated: 406992, costToSend: 0, roi: 'Infinite', conversionWindow: '30 days' },
  { campaign: 'ALTA ONE Early Bird', emailsSent: 4994, conversions: 180, revenueGenerated: 162000, costToSend: 0, roi: 'Infinite', conversionWindow: '21 days' },
  { campaign: 'TIPAC Pledge Drive', emailsSent: 800, conversions: 45, revenueGenerated: 67500, costToSend: 0, roi: 'Infinite', conversionWindow: '7 days' },
];

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action') || 'summary';

  switch (action) {
    case 'decay':
      return NextResponse.json({
        alerts: engagementDecay.filter(e => e.decayScore > 30).sort((a, b) => b.decayScore - a.decayScore),
        totalAtRisk: engagementDecay.filter(e => e.decayScore > 50).length,
        totalRevenueAtRisk: engagementDecay.filter(e => e.decayScore > 50).reduce((s, e) => s + e.revenueAtRisk, 0),
      });

    case 'churn':
      return NextResponse.json({
        scores: churnScores.sort((a, b) => b.score - a.score),
        highRisk: churnScores.filter(s => s.score >= 70).length,
        totalRevenueAtRisk: churnScores.filter(s => s.score >= 50).reduce((s, c) => s + c.revenueAtRisk, 0),
      });

    case 'timing':
      return NextResponse.json({ segments: sendTimeOptimization });

    case 'relationships':
      return NextResponse.json({ staffPerformance: relationships });

    case 'revenue':
      return NextResponse.json({
        campaigns: revenueAttribution,
        totalRevenue: revenueAttribution.reduce((s, c) => s + c.revenueGenerated, 0),
        totalConversions: revenueAttribution.reduce((s, c) => s + c.conversions, 0),
      });

    case 'journey': {
      const rid = request.nextUrl.searchParams.get('rid');
      if (!rid) return NextResponse.json({ error: 'rid parameter required' }, { status: 400 });
      const events = getEvents({ limit: 50 });
      const memberEvents = events.filter(e => e.recipientEmail === rid);
      return NextResponse.json({ email: rid, events: memberEvents, totalTouchpoints: memberEvents.length });
    }

    default:
      return NextResponse.json({
        ...getStats(),
        decayAlerts: engagementDecay.filter(e => e.decayScore > 50).length,
        churnHighRisk: churnScores.filter(s => s.score >= 70).length,
        revenueAttributed: revenueAttribution.reduce((s, c) => s + c.revenueGenerated, 0),
      });
  }
}
