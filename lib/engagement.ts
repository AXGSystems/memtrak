import type { EventAttendance, EventType, Organization } from './member-data';

export interface EngagementFactor {
  /** Short label shown to the user */
  label: string;
  /** Plain-language explanation of how this contributed to the score */
  detail: string;
  /** Points awarded by this factor (can be negative for penalties) */
  points: number;
  /** Maximum points this factor can contribute */
  max: number;
}

export interface EngagementBreakdown {
  /** Final 0-100 score after clamping */
  score: number;
  /** Health tier derived from the score */
  tier: 'Champion' | 'Engaged' | 'At Risk' | 'Disengaged' | 'Gone Dark';
  /** Individual factor contributions, ordered by impact */
  factors: EngagementFactor[];
}

const EVENT_WEIGHT: Record<EventType, number> = {
  'Board Meeting':     5,
  'Committee Meeting': 4,
  Conference:          4,
  Workshop:            3,
  Training:            3,
  Webinar:             2,
  Social:              2,
};

const dayMs = 1000 * 60 * 60 * 24;

const tierFromScore = (score: number): EngagementBreakdown['tier'] => {
  if (score >= 80) return 'Champion';
  if (score >= 60) return 'Engaged';
  if (score >= 40) return 'At Risk';
  if (score >= 20) return 'Disengaged';
  return 'Gone Dark';
};

const daysAgo = (iso: string): number => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Infinity;
  return Math.max(0, Math.floor((Date.now() - t) / dayMs));
};

/**
 * Computes an engagement score from org-level signals plus attendance history.
 *
 * Buckets (totals to 100):
 *  - Email engagement baseline      (max 40)
 *  - Attendance frequency, 12 months (max 25)
 *  - Attendance recency             (max 15)
 *  - Event-type quality mix         (max 10)
 *  - Trust score baseline           (max 10)
 *
 * Penalties:
 *  - No-shows in last 12 months — up to -10
 *  - Lapsed/Suspended/Cancelled status — up to -20
 */
export function computeEngagementScore(
  org: Organization,
  attendance: EventAttendance[],
): EngagementBreakdown {
  const factors: EngagementFactor[] = [];

  // 1. Email engagement baseline (preserves prior signal in engagement_score)
  const emailMax = 40;
  const emailScore = Math.round(((org.engagement_score ?? 0) / 100) * emailMax);
  factors.push({
    label: 'Email engagement',
    detail: `Baseline open/click rate: ${org.engagement_score ?? 0}/100`,
    points: emailScore,
    max: emailMax,
  });

  // 2. Attendance frequency in last 12 months
  const recent = attendance.filter((a) => daysAgo(a.event_date) <= 365 && a.registration_status !== 'Cancelled');
  const attended = recent.filter((a) => a.registration_status === 'Attended');
  const noShow = recent.filter((a) => a.registration_status === 'No Show');
  const freqMax = 25;
  // 5 attendances saturates the bucket
  const freqScore = Math.min(freqMax, attended.length * 5);
  factors.push({
    label: 'Attendance frequency',
    detail: `${attended.length} attended in last 12 months`,
    points: freqScore,
    max: freqMax,
  });

  // 3. Recency of most recent attendance
  const recencyMax = 15;
  let recencyScore = 0;
  let recencyDetail = 'No attendance on file';
  if (attended.length > 0) {
    const mostRecent = Math.min(...attended.map((a) => daysAgo(a.event_date)));
    if (mostRecent <= 30) { recencyScore = 15; recencyDetail = `Last attended ${mostRecent} days ago`; }
    else if (mostRecent <= 90) { recencyScore = 11; recencyDetail = `Last attended ${mostRecent} days ago`; }
    else if (mostRecent <= 180) { recencyScore = 7; recencyDetail = `Last attended ${mostRecent} days ago`; }
    else if (mostRecent <= 365) { recencyScore = 3; recencyDetail = `Last attended ${mostRecent} days ago`; }
    else { recencyDetail = `Last attended ${mostRecent} days ago — outside 12-month window`; }
  }
  factors.push({ label: 'Attendance recency', detail: recencyDetail, points: recencyScore, max: recencyMax });

  // 4. Event-type quality mix — weighted average of attended event types
  const qualityMax = 10;
  let qualityScore = 0;
  if (attended.length > 0) {
    const totalWeight = attended.reduce((s, a) => s + (EVENT_WEIGHT[a.event_type] ?? 1), 0);
    const avg = totalWeight / attended.length; // 1-5 range
    qualityScore = Math.round((avg / 5) * qualityMax);
  }
  factors.push({
    label: 'Event-type mix',
    detail: attended.length
      ? `Avg type weight ${(qualityScore / qualityMax * 5).toFixed(1)}/5 — board > conference > webinar`
      : 'No attended events to weight',
    points: qualityScore,
    max: qualityMax,
  });

  // 5. Trust score baseline
  const trustMax = 10;
  const trustScore = Math.round(((org.trust_score ?? 0) / 100) * trustMax);
  factors.push({
    label: 'Trust score',
    detail: `Relationship trust index: ${org.trust_score ?? 0}/100`,
    points: trustScore,
    max: trustMax,
  });

  // 6. No-show penalty
  if (noShow.length > 0) {
    const penalty = -Math.min(10, noShow.length * 4);
    factors.push({
      label: 'No-show penalty',
      detail: `${noShow.length} no-show${noShow.length === 1 ? '' : 's'} in last 12 months`,
      points: penalty,
      max: 0,
    });
  }

  // 7. Inactive-status penalty
  if (org.status === 'Lapsed' || org.status === 'Cancelled' || org.status === 'Suspended') {
    factors.push({
      label: 'Inactive status',
      detail: `Membership is ${org.status}`,
      points: -20,
      max: 0,
    });
  }

  const raw = factors.reduce((s, f) => s + f.points, 0);
  const score = Math.max(0, Math.min(100, raw));

  factors.sort((a, b) => Math.abs(b.points) - Math.abs(a.points));

  return { score, tier: tierFromScore(score), factors };
}
