'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import { demoRelationships } from '@/lib/demo-data';
import { Users, Mail, Zap, Trophy, ArrowRight, Lightbulb, Network, BarChart3 } from 'lucide-react';

/* ── colors ────────────────────────────────────────────────────────── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  navy: '#002D5C',
  purple: '#7C5CFC',
  teal: '#14B8A6',
};

/* ── synthetic segment affinity data ───────────────────────────────── */
const staffProfiles = [
  {
    name: 'Chris Morton',
    role: 'CEO',
    outreach: 48,
    replyRate: 88,
    responseTime: '0.5 days',
    strength: 'Exceptional' as const,
    bestSegment: 'ACU (Underwriters)',
    segmentNote: 'CEO-level outreach, highest reply rate on the team',
    sparkData: [30, 34, 38, 42, 40, 46, 48],
    affinities: { ACU: 88, ACA: 62, REA: 45, ACB: 40, AS: 55, ATXA: 50, REB: 38 },
  },
  {
    name: 'Paul Martin',
    role: 'Director of Membership',
    outreach: 218,
    replyRate: 42,
    responseTime: '1.4 days',
    strength: 'Strong' as const,
    bestSegment: 'ACA (Title Agents)',
    segmentNote: 'High volume, strong agent relationships',
    sparkData: [180, 190, 195, 202, 210, 215, 218],
    affinities: { ACU: 30, ACA: 42, REA: 35, ACB: 38, AS: 28, ATXA: 32, REB: 25 },
  },
  {
    name: 'Taylor Spolidoro',
    role: 'Compliance Manager',
    outreach: 342,
    replyRate: 34,
    responseTime: '2.1 days',
    strength: 'Strong' as const,
    bestSegment: 'Compliance / PFL',
    segmentNote: 'Most outreach volume, established compliance patterns',
    sparkData: [280, 295, 305, 318, 325, 335, 342],
    affinities: { ACU: 28, ACA: 34, REA: 30, ACB: 22, AS: 18, ATXA: 26, REB: 20 },
  },
  {
    name: 'Caroline Ehrenfeld',
    role: 'Events Manager',
    outreach: 189,
    replyRate: 31,
    responseTime: '2.8 days',
    strength: 'Moderate' as const,
    bestSegment: 'Events Attendees',
    segmentNote: 'Event-focused outreach, strong follow-up cadence',
    sparkData: [150, 158, 165, 172, 178, 184, 189],
    affinities: { ACU: 25, ACA: 31, REA: 28, ACB: 20, AS: 22, ATXA: 30, REB: 18 },
  },
  {
    name: 'Emily Mincey',
    role: 'Member Services',
    outreach: 156,
    replyRate: 28,
    responseTime: '3.2 days',
    strength: 'Moderate' as const,
    bestSegment: 'New Members',
    segmentNote: 'Dedicated new member contact, onboarding specialist',
    sparkData: [120, 128, 135, 140, 145, 150, 156],
    affinities: { ACU: 20, ACA: 28, REA: 24, ACB: 18, AS: 15, ATXA: 22, REB: 16 },
  },
];

const memberTypes = ['ACU', 'ACA', 'REA', 'ACB', 'AS', 'ATXA', 'REB'] as const;

const strengthColors: Record<string, string> = {
  Exceptional: C.green,
  Strong: C.blue,
  Moderate: C.orange,
  Building: C.red,
};

const strengthBg: Record<string, string> = {
  Exceptional: 'rgba(140,198,63,0.15)',
  Strong: 'rgba(74,144,217,0.15)',
  Moderate: 'rgba(232,146,63,0.15)',
  Building: 'rgba(217,74,74,0.15)',
};

/* ── computed metrics ──────────────────────────────────────────────── */
const totalOutreach = demoRelationships.reduce((s, r) => s + r.outreach, 0);
const weightedReplySum = demoRelationships.reduce((s, r) => s + r.replyRate * r.outreach, 0);
const avgReplyRate = Math.round(weightedReplySum / totalOutreach);
const bestPerformer = demoRelationships.reduce((best, r) => (r.replyRate > best.replyRate ? r : best), demoRelationships[0]);

/* ── routing recommendations ───────────────────────────────────────── */
const recommendations = [
  { icon: Trophy, color: C.green, text: 'Route ACU retention outreach to Chris Morton', detail: `88% reply rate vs ${avgReplyRate}% team average \u2014 3x more effective for underwriter relationships` },
  { icon: Users, color: C.teal, text: 'Route new member onboarding to Emily Mincey', detail: 'Dedicated contact for new members \u2014 consistent follow-up builds early engagement habits' },
  { icon: Mail, color: C.blue, text: 'PFL compliance emails from Taylor Spolidoro', detail: 'Highest volume (342 outreach), established patterns \u2014 members recognize the sender' },
  { icon: Zap, color: C.orange, text: 'ACA title agent campaigns through Paul Martin', detail: '42% reply rate with agents \u2014 strongest agent relationship on the team' },
  { icon: Network, color: C.purple, text: 'Event follow-ups from Caroline Ehrenfeld', detail: 'Events manager recognition drives 31% reply rate on event-related outreach' },
];

/* ── cell color helper ─────────────────────────────────────────────── */
function cellColor(rate: number): { bg: string; text: string } {
  if (rate >= 70) return { bg: 'rgba(140,198,63,0.20)', text: C.green };
  if (rate >= 40) return { bg: 'rgba(74,144,217,0.15)', text: C.blue };
  if (rate >= 25) return { bg: 'rgba(232,146,63,0.12)', text: C.orange };
  return { bg: 'rgba(217,74,74,0.10)', text: C.red };
}

/* ── page ──────────────────────────────────────────────────────────── */
export default function StaffPulse() {
  const [selectedStaff, setSelectedStaff] = useState<typeof staffProfiles[0] | null>(null);

  return (
    <div className="p-6">

      {/* ── 1. Branded Header ──────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4A90D9, #7C5CFC)', boxShadow: '0 4px 16px rgba(74,144,217,0.3)' }}
          >
            <Users className="w-5 h-5" style={{ color: 'var(--heading)' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              StaffPulse<span style={{ color: C.blue }}>&trade;</span>
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.blue }}>
              Staff Relationship Intelligence
            </p>
          </div>
        </div>
        <p className="text-xs max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Route every message through the relationship that works. StaffPulse maps which staff members have the
          strongest relationships with which member segments &mdash; tracking reply rates, response times, meeting
          history, and outcome success to auto-route outreach recommendations.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger-children">
        <SparkKpi
          label="Total Staff Tracked"
          value={5}
          icon={Users}
          color={C.blue}
          sub="Active outreach staff"
          sparkData={[3, 3, 4, 4, 5, 5, 5]}
          sparkColor={C.blue}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                5 staff members are actively tracked for outreach effectiveness.
                StaffPulse monitors every email reply, meeting outcome, and response time
                to build relationship intelligence.
              </p>
              {staffProfiles.map(s => (
                <div key={s.name} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{s.name}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.role}</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Total Outreach"
          value={totalOutreach.toLocaleString()}
          icon={Mail}
          color={C.purple}
          sub="Emails, calls, meetings"
          sparkData={[720, 780, 830, 870, 910, 940, totalOutreach]}
          sparkColor={C.purple}
          trend={{ value: 8.2, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {totalOutreach.toLocaleString()} total outreach touchpoints tracked across all staff.
                This includes emails sent, phone calls logged, and meeting follow-ups.
              </p>
              {staffProfiles.map(s => (
                <div key={s.name} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{s.name}</span>
                  <span className="text-[10px] font-bold" style={{ color: C.purple }}>{s.outreach} outreach</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Avg Reply Rate"
          value={`${avgReplyRate}%`}
          icon={Zap}
          color={C.orange}
          sub="Weighted by volume"
          sparkData={[30, 32, 31, 33, 35, 34, avgReplyRate]}
          sparkColor={C.orange}
          trend={{ value: 4.1, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                The weighted average reply rate across all staff is {avgReplyRate}%.
                Weighted by outreach volume so high-volume staff have proportional impact.
                Top performer Chris Morton achieves 88% &mdash; 2.5x above average.
              </p>
              {staffProfiles.map(s => (
                <div key={s.name} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{s.name}</span>
                  <span className="text-[10px] font-bold" style={{ color: s.replyRate >= 50 ? C.green : s.replyRate >= 30 ? C.orange : C.red }}>{s.replyRate}%</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Best Performer"
          value={bestPerformer.staff.split(' (')[0]}
          icon={Trophy}
          color={C.green}
          sub={`${bestPerformer.replyRate}% reply rate`}
          sparkData={[78, 80, 82, 85, 86, 87, 88]}
          sparkColor={C.green}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Chris Morton leads with an 88% reply rate across 48 outreach contacts.
                As CEO, his communications carry weight &mdash; but the reply rate also reflects
                genuine relationship quality with ACU underwriter executives.
              </p>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(140,198,63,0.08)', border: '1px solid rgba(140,198,63,0.2)' }}>
                <div className="text-[10px] font-bold" style={{ color: C.green }}>Why this matters</div>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  ACU members represent $61,554 in annual dues each. A personal touch from the CEO
                  on retention outreach can preserve six-figure relationships.
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* ── 3. Staff Scoreboard ────────────────────────────────────── */}
      <Card
        title="Staff Scoreboard"
        subtitle="Individual performance across all outreach channels"
        className="mb-6"
        detailTitle="Staff Scoreboard \u2014 Methodology"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Each staff member is scored on four dimensions: reply rate (how often members respond),
              response time (how quickly they respond), outreach volume (total touchpoints), and
              relationship strength (composite score factoring all three).
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Strength badges are assigned algorithmically: Exceptional (80%+ reply, sub-1 day response),
              Strong (35%+ reply, sub-2 day), Moderate (25%+ reply), Building (below 25%).
            </p>
          </div>
        }
      >
        <div className="space-y-3">
          {staffProfiles.map((s) => (
            <div
              key={s.name}
              onClick={() => setSelectedStaff(selectedStaff?.name === s.name ? null : s)}
              className="rounded-xl border p-4 transition-all duration-200 hover:translate-y-[-1px] cursor-pointer"
              style={{
                background: selectedStaff?.name === s.name
                  ? 'color-mix(in srgb, var(--accent) 8%, var(--card))'
                  : 'var(--input-bg)',
                borderColor: selectedStaff?.name === s.name
                  ? 'var(--accent)'
                  : 'transparent',
              }}
            >
              <div className="flex items-center gap-4 flex-wrap">
                {/* Reply rate ring */}
                <ProgressRing value={s.replyRate} max={100} size={56} color={strengthColors[s.strength]} />

                {/* Name & role */}
                <div className="min-w-[140px] flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{s.name}</span>
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: strengthBg[s.strength], color: strengthColors[s.strength] }}
                    >
                      {s.strength}
                    </span>
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.role}</div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="text-center">
                    <div className="text-xs font-extrabold" style={{ color: 'var(--heading)' }}>{s.outreach}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Outreach</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-extrabold" style={{ color: strengthColors[s.strength] }}>{s.replyRate}%</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Reply Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-extrabold" style={{ color: 'var(--heading)' }}>{s.responseTime}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Avg Response</div>
                  </div>
                  <div className="text-center min-w-[100px]">
                    <div className="text-[10px] font-bold" style={{ color: C.blue }}>{s.bestSegment}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Best Segment</div>
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {selectedStaff?.name === s.name && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--card-border)' }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] font-bold mb-2" style={{ color: 'var(--heading)' }}>Segment Affinities</div>
                      <div className="space-y-1.5">
                        {memberTypes.map(mt => {
                          const rate = s.affinities[mt];
                          const cc = cellColor(rate);
                          return (
                            <div key={mt} className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold w-10" style={{ color: 'var(--text-muted)' }}>{mt}</span>
                              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${rate}%`, background: cc.text }} />
                              </div>
                              <span className="text-[10px] font-bold w-8 text-right" style={{ color: cc.text }}>{rate}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold mb-2" style={{ color: 'var(--heading)' }}>Performance Notes</div>
                      <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.segmentNote}</p>
                      <div className="mt-3 p-2 rounded-lg" style={{ background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.15)' }}>
                        <div className="text-[9px] font-bold" style={{ color: C.blue }}>Routing Recommendation</div>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          Best suited for {s.bestSegment} outreach based on {s.replyRate}% reply rate in this segment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ── 4. Relationship Matrix ─────────────────────────────────── */}
      <Card
        title="Relationship Routing Matrix"
        subtitle="Staff vs member type reply rates \u2014 the routing visualization"
        className="mb-6"
        detailTitle="Routing Matrix \u2014 How to Read"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Each cell shows the reply rate when a specific staff member contacts a specific member type.
              Green cells indicate strong relationships (70%+), blue indicates solid (40%+),
              orange indicates moderate (25%+), and red indicates weak relationships.
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Use this matrix to route outreach: find the column for the member type you need to reach,
              then route through the staff member with the highest (greenest) reply rate in that column.
            </p>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]" style={{ borderCollapse: 'separate', borderSpacing: '3px' }}>
            <thead>
              <tr>
                <th className="text-left py-2 px-3 font-bold" style={{ color: 'var(--heading)' }}>Staff</th>
                {memberTypes.map(mt => (
                  <th key={mt} className="text-center py-2 px-2 font-bold" style={{ color: 'var(--text-muted)' }}>{mt}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffProfiles.map(s => (
                <tr key={s.name}>
                  <td className="py-2 px-3 font-semibold whitespace-nowrap" style={{ color: 'var(--heading)' }}>
                    {s.name}
                  </td>
                  {memberTypes.map(mt => {
                    const rate = s.affinities[mt];
                    const cc = cellColor(rate);
                    return (
                      <td key={mt} className="text-center py-2 px-2 rounded-lg font-bold" style={{ background: cc.bg, color: cc.text }}>
                        {rate}%
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Best router row */}
              <tr>
                <td className="py-2 px-3 font-bold text-[9px] uppercase tracking-wider" style={{ color: C.blue }}>
                  Best Router &rarr;
                </td>
                {memberTypes.map(mt => {
                  const best = staffProfiles.reduce((b, s) => (s.affinities[mt] > b.affinities[mt] ? s : b), staffProfiles[0]);
                  return (
                    <td key={mt} className="text-center py-2 px-2 rounded-lg font-bold text-[9px]" style={{ background: 'rgba(74,144,217,0.12)', color: C.blue }}>
                      {best.name.split(' ')[0]}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
          <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>Legend:</span>
          {[
            { label: '70%+', color: C.green, bg: 'rgba(140,198,63,0.20)' },
            { label: '40-69%', color: C.blue, bg: 'rgba(74,144,217,0.15)' },
            { label: '25-39%', color: C.orange, bg: 'rgba(232,146,63,0.12)' },
            { label: '<25%', color: C.red, bg: 'rgba(217,74,74,0.10)' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: l.bg, border: `1px solid ${l.color}` }} />
              <span className="text-[9px]" style={{ color: l.color }}>{l.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 5 & 6. Chart + Recommendations side-by-side ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Outreach Distribution Chart */}
        <Card
          title="Outreach Distribution"
          subtitle="Volume by staff member"
          detailTitle="Outreach Volume Analysis"
          detailContent={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Taylor Spolidoro leads in raw outreach volume with 342 contacts, representing
                {' '}{Math.round((342 / totalOutreach) * 100)}% of all tracked outreach. This is expected
                given compliance communications require broad distribution.
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Chris Morton has the lowest volume (48) but the highest reply rate (88%),
                demonstrating that targeted, high-authority outreach can be more effective per-contact
                than high-volume approaches.
              </p>
            </div>
          }
        >
          <ClientChart
            type="doughnut"
            height={280}
            data={{
              labels: staffProfiles.map(s => s.name),
              datasets: [{
                data: staffProfiles.map(s => s.outreach),
                backgroundColor: [C.green, C.blue, C.purple, C.orange, C.teal],
                borderWidth: 2,
                borderColor: 'rgba(10,22,40,0.8)',
                hoverOffset: 12,
                hoverBorderColor: 'rgba(255,255,255,0.3)',
              }],
            }}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom' as const,
                  labels: {
                    color: '#8899aa',
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 14,
                    font: { size: 10 },
                  },
                },
              },
            }}
          />
        </Card>

        {/* Routing Recommendations */}
        <Card
          title="Routing Recommendations"
          subtitle="Auto-generated from relationship intelligence"
          accent={C.blue}
          detailTitle="Routing Engine"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                StaffPulse analyzes reply rates, response times, and relationship history to generate
                routing recommendations. Each recommendation is backed by statistically significant
                outreach data.
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Implementing these routing recommendations is projected to improve overall reply rates
                by 15-20% across all outreach types, translating to faster member responses,
                higher compliance rates, and improved retention.
              </p>
            </div>
          }
        >
          <div className="space-y-3">
            {recommendations.map((rec, i) => {
              const Icon = rec.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:translate-x-1" style={{ background: 'var(--input-bg)' }}>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `color-mix(in srgb, ${rec.color} 15%, transparent)` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: rec.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--heading)' }}>
                      {rec.text}
                      <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: rec.color }} />
                    </div>
                    <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {rec.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── 7. How StaffPulse Works ────────────────────────────────── */}
      <Card
        title="How StaffPulse Works"
        subtitle="The algorithm behind relationship intelligence"
        accent={C.purple}
        detailTitle="StaffPulse Algorithm \u2014 Deep Dive"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              StaffPulse uses a weighted composite scoring model to evaluate staff-member relationships.
              The algorithm processes every tracked touchpoint to build a relationship graph.
            </p>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Data Ingestion', desc: 'Ingest email metadata (sends, opens, replies), calendar events (meetings, calls), and CRM touchpoints. No email content is read \u2014 only metadata.', color: C.blue },
                { step: '2', title: 'Reply Attribution', desc: 'Match reply events to the originating staff member. Calculate per-staff, per-segment reply rates with statistical confidence intervals.', color: C.purple },
                { step: '3', title: 'Response Time Scoring', desc: 'Measure average response latency per staff-segment pair. Faster responses indicate stronger relationships and higher member engagement.', color: C.teal },
                { step: '4', title: 'Strength Classification', desc: 'Combine reply rate (50% weight), response time (30%), and volume consistency (20%) into a composite strength score. Classify as Exceptional, Strong, Moderate, or Building.', color: C.green },
                { step: '5', title: 'Routing Optimization', desc: 'For each member type, identify the staff member with the highest composite score. Generate routing recommendations with projected improvement percentages.', color: C.orange },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold" style={{ background: `color-mix(in srgb, ${item.color} 20%, transparent)`, color: item.color }}>
                    {item.step}
                  </div>
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{item.title}</div>
                    <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: BarChart3,
              title: 'Track',
              desc: 'Every email, call, and meeting is tracked per staff member. Reply rates and response times are calculated per member segment.',
              color: C.blue,
            },
            {
              icon: Network,
              title: 'Map',
              desc: 'Relationship strength is mapped across staff-segment pairs. The routing matrix reveals hidden affinity patterns.',
              color: C.purple,
            },
            {
              icon: Lightbulb,
              title: 'Route',
              desc: 'Outreach recommendations are generated automatically. Route each message through the relationship most likely to get a response.',
              color: C.green,
            },
          ].map(step => (
            <div key={step.title} className="text-center p-4 rounded-xl" style={{ background: 'var(--input-bg)' }}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `color-mix(in srgb, ${step.color} 15%, transparent)` }}
              >
                <step.icon className="w-5 h-5" style={{ color: step.color }} />
              </div>
              <div className="text-xs font-bold mb-1" style={{ color: 'var(--heading)' }}>{step.title}</div>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
