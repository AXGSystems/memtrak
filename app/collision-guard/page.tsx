'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import { demoCampaigns } from '@/lib/demo-data';
import {
  ShieldAlert, Calendar, AlertTriangle, Users, Zap,
  Clock, Mail, X, ChevronRight, ArrowRight,
} from 'lucide-react';

/* ── palette ─────────────────────────────────────────────── */
const C = {
  navy: '#002D5C',
  blue: '#4A90D9',
  green: '#8CC63F',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F5C542',
  purple: '#a855f7',
  teal: '#14b8a6',
};

/* ── weekly calendar data (April 14-18, 2026) ────────────── */
const weekDays = ['Mon 4/14', 'Tue 4/15', 'Wed 4/16', 'Thu 4/17', 'Fri 4/18'];

interface ScheduledSend {
  id: string;
  name: string;
  day: number; // 0=Mon, 4=Fri
  time: string;
  source: string;
  audience: string;
  audienceSize: number;
  color: string;
}

const scheduledSends: ScheduledSend[] = [
  { id: 's1', name: 'Title News Weekly #16', day: 0, time: '9:00 AM', source: 'Higher Logic', audience: 'All Members', audienceSize: 4840, color: C.blue },
  { id: 's2', name: 'PFL Compliance — April Wave 4', day: 0, time: '10:30 AM', source: 'MEMTrak', audience: 'ACB + ACA Members', audienceSize: 2800, color: C.navy },
  { id: 's3', name: 'ALTA ONE Registration Reminder', day: 1, time: '8:00 AM', source: 'MEMTrak', audience: 'All Members', audienceSize: 4994, color: C.green },
  { id: 's4', name: 'EDge Spring Cohort Follow-up', day: 1, time: '11:00 AM', source: 'Higher Logic', audience: 'New Members', audienceSize: 1200, color: C.teal },
  { id: 's5', name: 'TIPAC Q2 Pledge Reminder', day: 2, time: '9:30 AM', source: 'MEMTrak', audience: 'ACU + ACA Members', audienceSize: 2100, color: C.purple },
  { id: 's6', name: 'State Legislation Alert — CA', day: 2, time: '2:00 PM', source: 'MEMTrak', audience: 'CA Members', audienceSize: 680, color: C.orange },
  { id: 's7', name: 'Webinar: Digital Closings 2026', day: 3, time: '10:00 AM', source: 'Higher Logic', audience: 'All Members', audienceSize: 4200, color: C.amber },
  { id: 's8', name: 'Membership Renewal — May Early', day: 4, time: '8:30 AM', source: 'MEMTrak', audience: 'Renewing Members', audienceSize: 320, color: C.green },
];

/* ── collision definitions ───────────────────────────────── */
interface Collision {
  day: number;
  dayLabel: string;
  sends: string[];
  overlapAudience: string;
  overlapCount: number;
  severity: 'critical' | 'warning';
  recommendation: string;
}

const collisions: Collision[] = [
  {
    day: 0,
    dayLabel: 'Monday 4/14',
    sends: ['Title News Weekly #16', 'PFL Compliance — April Wave 4'],
    overlapAudience: 'ACB + ACA members who also receive Title News',
    overlapCount: 2240,
    severity: 'critical',
    recommendation: 'Move PFL Compliance to Tuesday afternoon. Members in ACB/ACA overlap with the Title News Weekly audience — sending both on Monday morning will cause email fatigue.',
  },
  {
    day: 1,
    dayLabel: 'Tuesday 4/15',
    sends: ['ALTA ONE Registration Reminder', 'EDge Spring Cohort Follow-up'],
    overlapAudience: 'New members who are also in the ALTA ONE audience',
    overlapCount: 890,
    severity: 'warning',
    recommendation: 'Consider moving EDge follow-up to Wednesday. New members receiving both an event registration push and program follow-up on the same day may deprioritize both.',
  },
  {
    day: 2,
    dayLabel: 'Wednesday 4/16',
    sends: ['TIPAC Q2 Pledge Reminder', 'State Legislation Alert — CA'],
    overlapAudience: 'CA-based ACU/ACA members who are TIPAC eligible',
    overlapCount: 340,
    severity: 'warning',
    recommendation: 'Low risk — CA audience is small and the legislative alert is time-sensitive. Proceed but monitor engagement on both sends.',
  },
];

/* ── prevented fatigue log ───────────────────────────────── */
const preventedEvents = [
  { date: 'Apr 11', original: 'Renewal batch + Newsletter same-day', members: 380, action: 'Deferred renewal to Monday' },
  { date: 'Apr 7', original: 'ALTA ONE + PFL Wave 3 overlap', members: 1620, action: 'PFL moved to Apr 9' },
  { date: 'Apr 2', original: 'Welcome series + Advocacy on same day', members: 65, action: 'Welcome email delayed 24h' },
  { date: 'Mar 28', original: 'State alert + Newsletter collision', members: 1840, action: 'Newsletter held to Mar 29' },
  { date: 'Mar 20', original: 'Triple send: Onboarding + EDge + News', members: 83, action: 'EDge deferred to Mar 22' },
];

/* ══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function CollisionGuardPage() {
  const [selectedCollision, setSelectedCollision] = useState<Collision | null>(null);
  const [selectedSend, setSelectedSend] = useState<ScheduledSend | null>(null);

  const totalScheduled = scheduledSends.length;
  const totalCollisions = collisions.length;
  const totalOverlap = collisions.reduce((s, c) => s + c.overlapCount, 0);
  const totalPrevented = preventedEvents.length;

  return (
    <div className="p-6 space-y-6">

      {/* ── 1. Branded Header ── */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #E8923F, #D94A4A)',
            boxShadow: '0 4px 20px rgba(232,146,63,0.3)',
          }}
        >
          <ShieldAlert className="w-6 h-6" style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            CollisionGuard<span className="text-[10px] align-super font-bold" style={{ color: 'var(--accent)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Protect your members from email pile-ups.
          </p>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
        Cross-platform send calendar with <strong style={{ color: 'var(--heading)' }}>collision detection</strong>. When multiple sends target overlapping audiences on the same day, CollisionGuard flags the conflict and recommends rescheduling.
      </p>

      {/* ── 2. SparkKpi Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <SparkKpi
          label="Scheduled Sends This Week"
          value={totalScheduled}
          sub="Across MEMTrak + Higher Logic"
          icon={Calendar}
          color={C.blue}
          sparkData={[6, 5, 7, 9, 8, totalScheduled]}
          sparkColor={C.blue}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {totalScheduled} email sends are scheduled for the week of April 14-18, 2026. This includes campaigns from MEMTrak, Higher Logic, and manual Outlook sends.
              </p>
              {scheduledSends.map(s => (
                <div key={s.id} className="flex items-center gap-2 text-[10px]">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span style={{ color: 'var(--heading)' }}>{s.name}</span>
                  <span className="ml-auto" style={{ color: 'var(--text-muted)' }}>{weekDays[s.day]}</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Collisions Detected"
          value={totalCollisions}
          sub={`${collisions.filter(c => c.severity === 'critical').length} critical, ${collisions.filter(c => c.severity === 'warning').length} warnings`}
          icon={AlertTriangle}
          color={C.red}
          sparkData={[1, 2, 3, 2, 4, totalCollisions]}
          sparkColor={C.red}
          trend={{ value: -25, label: 'vs last week' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                CollisionGuard detected {totalCollisions} audience overlaps this week. Collisions are flagged when 2+ sends target more than 15% overlapping members on the same day.
              </p>
              {collisions.map((c, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: c.severity === 'critical' ? 'rgba(217,74,74,0.08)' : 'rgba(232,146,63,0.08)' }}>
                  <div className="text-[10px] font-bold" style={{ color: c.severity === 'critical' ? C.red : C.orange }}>{c.dayLabel}: {c.sends.join(' + ')}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.overlapCount.toLocaleString()} overlapping members</div>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Members Double-Targeted"
          value={totalOverlap.toLocaleString()}
          sub="Would receive 2+ emails same day"
          icon={Users}
          color={C.orange}
          sparkData={[1800, 2200, 3100, 2600, 3800, totalOverlap]}
          sparkColor={C.orange}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {totalOverlap.toLocaleString()} unique members are in overlapping audiences across the detected collisions. Without intervention, these members would receive multiple emails on the same day from ALTA.
              </p>
            </div>
          }
        />
        <SparkKpi
          label="Prevented Fatigue Events"
          value={totalPrevented}
          sub="Collisions resolved in the last 30 days"
          icon={Zap}
          color={C.green}
          sparkData={[2, 3, 4, 3, 5, totalPrevented]}
          sparkColor={C.green}
          trend={{ value: 15, label: 'vs last month' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {totalPrevented} send collisions were detected and resolved in the past 30 days, protecting members from email overload.
              </p>
              {preventedEvents.map((e, i) => (
                <div key={i} className="text-[10px]" style={{ borderBottom: i < preventedEvents.length - 1 ? '1px solid var(--card-border)' : undefined, paddingBottom: 6, marginBottom: 6 }}>
                  <span className="font-bold" style={{ color: 'var(--heading)' }}>{e.date}:</span>{' '}
                  <span style={{ color: 'var(--text-muted)' }}>{e.original}</span>
                  <div className="mt-0.5" style={{ color: C.green }}>Resolved: {e.action} ({e.members} members protected)</div>
                </div>
              ))}
            </div>
          }
        />
      </div>

      {/* ── 3. Weekly Calendar View (full width) ── */}
      <Card
        title="Weekly Send Calendar"
        subtitle="April 14-18, 2026 — All platforms combined"
        detailTitle="Full Calendar Detail"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              All scheduled sends across MEMTrak, Higher Logic, and Outlook for the current week. Collision indicators appear when overlapping audiences are detected on the same day.
            </p>
            {weekDays.map((day, di) => {
              const daySends = scheduledSends.filter(s => s.day === di);
              const dayCollision = collisions.find(c => c.day === di);
              return (
                <div key={di}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{day}</span>
                    {dayCollision && (
                      <span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{
                        background: dayCollision.severity === 'critical' ? 'rgba(217,74,74,0.15)' : 'rgba(232,146,63,0.15)',
                        color: dayCollision.severity === 'critical' ? C.red : C.orange,
                      }}>
                        {dayCollision.severity === 'critical' ? 'COLLISION' : 'OVERLAP'}
                      </span>
                    )}
                  </div>
                  {daySends.length === 0 ? (
                    <p className="text-[10px] pl-3" style={{ color: 'var(--text-muted)' }}>No sends scheduled</p>
                  ) : (
                    daySends.map(s => (
                      <div key={s.id} className="rounded-lg p-3 mb-2 flex items-center gap-3" style={{ background: 'var(--background)', borderLeft: `3px solid ${s.color}` }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{s.name}</div>
                          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{s.time} via {s.source} | {s.audience} ({s.audienceSize.toLocaleString()})</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        }
      >
        <div className="overflow-x-auto mt-1">
          <div className="grid grid-cols-5 gap-2 min-w-[600px]">
            {weekDays.map((day, di) => {
              const daySends = scheduledSends.filter(s => s.day === di);
              const dayCollision = collisions.find(c => c.day === di);
              return (
                <div key={di} className="space-y-1.5">
                  {/* Day header */}
                  <div
                    className="rounded-lg px-2 py-1.5 text-center"
                    style={{
                      background: dayCollision
                        ? dayCollision.severity === 'critical'
                          ? 'rgba(217,74,74,0.12)'
                          : 'rgba(232,146,63,0.12)'
                        : 'var(--background)',
                      border: dayCollision
                        ? `1px solid ${dayCollision.severity === 'critical' ? 'rgba(217,74,74,0.3)' : 'rgba(232,146,63,0.3)'}`
                        : '1px solid var(--card-border)',
                    }}
                  >
                    <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{day}</div>
                    {dayCollision && (
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" style={{ color: dayCollision.severity === 'critical' ? C.red : C.orange }} />
                        <span className="text-[8px] font-bold" style={{ color: dayCollision.severity === 'critical' ? C.red : C.orange }}>
                          {dayCollision.severity === 'critical' ? 'COLLISION' : 'OVERLAP'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sends for this day */}
                  {daySends.map(s => (
                    <div
                      key={s.id}
                      className="rounded-lg p-2 cursor-pointer transition-transform hover:scale-[1.02]"
                      style={{
                        background: `color-mix(in srgb, ${s.color} 10%, transparent)`,
                        borderLeft: `3px solid ${s.color}`,
                      }}
                      onClick={() => setSelectedSend(s)}
                    >
                      <div className="text-[9px] font-bold leading-tight" style={{ color: 'var(--heading)' }}>{s.name}</div>
                      <div className="text-[8px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.time}</div>
                      <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{s.source}</div>
                      <div className="text-[8px] font-bold mt-0.5" style={{ color: s.color }}>{s.audienceSize.toLocaleString()}</div>
                    </div>
                  ))}

                  {daySends.length === 0 && (
                    <div className="rounded-lg p-3 text-center" style={{ background: 'var(--background)', border: '1px dashed var(--card-border)' }}>
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>No sends</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── 4. Two-column: Collisions + Prevention Log ── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Collision Alerts */}
        <Card
          title="Collision Alerts"
          subtitle="Overlapping audiences detected this week"
        >
          <div className="space-y-3 mt-1">
            {collisions.map((c, i) => (
              <div
                key={i}
                className="rounded-lg p-3 cursor-pointer transition-transform hover:scale-[1.01]"
                style={{
                  background: c.severity === 'critical' ? 'rgba(217,74,74,0.06)' : 'rgba(232,146,63,0.06)',
                  border: `1px solid ${c.severity === 'critical' ? 'rgba(217,74,74,0.2)' : 'rgba(232,146,63,0.2)'}`,
                }}
                onClick={() => setSelectedCollision(c)}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.severity === 'critical' ? C.red : C.orange }} />
                  <span className="text-[10px] font-bold" style={{ color: c.severity === 'critical' ? C.red : C.orange }}>
                    {c.severity === 'critical' ? 'CRITICAL' : 'WARNING'} &mdash; {c.dayLabel}
                  </span>
                </div>
                <div className="text-[10px] font-semibold mb-1" style={{ color: 'var(--heading)' }}>
                  {c.sends.join(' + ')}
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {c.overlapCount.toLocaleString()} overlapping members: {c.overlapAudience}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ChevronRight className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                  <span className="text-[9px] font-bold" style={{ color: 'var(--accent)' }}>View recommendation</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Prevention Log */}
        <Card
          title="Fatigue Prevention Log"
          subtitle="Recently resolved collisions (last 30 days)"
          detailTitle="Full Prevention History"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Every time CollisionGuard detects and resolves an overlap, it logs the event here. This creates an audit trail of member-fatigue prevention actions.
              </p>
              {preventedEvents.map((e, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: 'var(--background)', borderLeft: `3px solid ${C.green}` }}>
                  <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{e.date}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{e.original}</div>
                  <div className="text-[10px] mt-1 font-semibold" style={{ color: C.green }}>
                    {e.action} &mdash; {e.members} members protected
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-0 mt-1">
            {preventedEvents.map((e, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-2.5"
                style={{ borderBottom: i < preventedEvents.length - 1 ? '1px solid var(--card-border)' : undefined }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(140,198,63,0.15)' }}>
                  <Zap className="w-3 h-3" style={{ color: C.green }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{e.original}</div>
                  <div className="text-[9px]" style={{ color: C.green }}>{e.action}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{e.members}</div>
                  <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{e.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Collision Detail Modal ── */}
      {selectedCollision && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedCollision(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: selectedCollision.severity === 'critical' ? C.red : C.orange }}>
                  {selectedCollision.severity === 'critical' ? 'Critical Collision' : 'Overlap Warning'}
                </h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedCollision.dayLabel}</p>
              </div>
              <button onClick={() => setSelectedCollision(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Conflicting sends */}
              <div>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Conflicting Sends</div>
                {selectedCollision.sends.map((name, i) => {
                  const send = scheduledSends.find(s => s.name === name);
                  return (
                    <div key={i} className="rounded-lg p-3 mb-2" style={{ background: 'var(--background)', borderLeft: `3px solid ${send?.color || C.blue}` }}>
                      <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{name}</div>
                      {send && (
                        <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {send.time} via {send.source} | {send.audience} ({send.audienceSize.toLocaleString()})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Overlap details */}
              <div className="rounded-lg p-4" style={{ background: 'rgba(217,74,74,0.06)', border: '1px solid rgba(217,74,74,0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" style={{ color: C.red }} />
                  <span className="text-xs font-bold" style={{ color: C.red }}>{selectedCollision.overlapCount.toLocaleString()} Overlapping Members</span>
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedCollision.overlapAudience}</p>
              </div>

              {/* Recommendation */}
              <div className="rounded-lg p-4" style={{ background: 'rgba(140,198,63,0.06)', border: '1px solid rgba(140,198,63,0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="w-4 h-4" style={{ color: C.green }} />
                  <span className="text-xs font-bold" style={{ color: C.green }}>Recommended Action</span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{selectedCollision.recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Send Detail Modal ── */}
      {selectedSend && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedSend(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedSend.name}</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Scheduled Send Detail</p>
              </div>
              <button onClick={() => setSelectedSend(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Day', val: weekDays[selectedSend.day] },
                  { label: 'Time', val: selectedSend.time },
                  { label: 'Source', val: selectedSend.source },
                  { label: 'Audience Size', val: selectedSend.audienceSize.toLocaleString() },
                ].map(d => (
                  <div key={d.label} className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                    <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>{d.label}</div>
                    <div className="text-sm font-extrabold mt-0.5" style={{ color: 'var(--heading)' }}>{d.val}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Target Audience</div>
                <div className="text-xs font-bold" style={{ color: selectedSend.color }}>{selectedSend.audience}</div>
              </div>
              {collisions.find(c => c.sends.includes(selectedSend.name)) && (
                <div className="rounded-lg p-3" style={{ background: 'rgba(217,74,74,0.06)', border: '1px solid rgba(217,74,74,0.15)' }}>
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" style={{ color: C.red }} />
                    <span className="text-[10px] font-bold" style={{ color: C.red }}>This send is involved in a collision</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
