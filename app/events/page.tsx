'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card, { KpiCard } from '@/components/Card';
import AnimatedCounter from '@/components/AnimatedCounter';
import { SkeletonCard, SkeletonKPI } from '@/components/Skeleton';
import {
  Calendar, Users, DollarSign, Award, ChevronRight, Clock, CheckCircle2, XCircle, Ban,
} from 'lucide-react';
import type { EventSummary, EventType } from '@/lib/member-data';

const TYPE_COLOR: Record<EventType, string> = {
  Conference:        '#a855f7',
  Webinar:           '#4A90D9',
  Workshop:          '#14b8a6',
  'Committee Meeting': '#F5C542',
  'Board Meeting':   '#E8923F',
  Social:            '#8CC63F',
  Training:          '#475569',
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function EventsPage() {
  const [events, setEvents] = useState<EventSummary[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/memtrak/connect-events')
      .then((r) => r.json())
      .then((d: { events: EventSummary[] }) => setEvents(d.events ?? []))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    if (!events) return null;
    const today = todayIso();
    const upcoming = events.filter((e) => e.event_date >= today);
    const past = events.filter((e) => e.event_date < today);
    const totalRegistrations = events.reduce((s, e) => s + e.registered + e.attended + e.no_show, 0);
    const revenuePaid = events.reduce((s, e) => s + e.revenue_paid, 0);
    const revenueOutstanding = events.reduce((s, e) => s + e.revenue_outstanding, 0);
    const eligible = past.reduce((s, e) => s + e.attended + e.no_show, 0);
    const attended = past.reduce((s, e) => s + e.attended, 0);
    const overallRate = eligible > 0 ? Math.round((attended / eligible) * 100) : 0;
    return { upcoming: upcoming.length, past: past.length, totalRegistrations, revenuePaid, revenueOutstanding, overallRate };
  }, [events]);

  const upcoming = useMemo(() => events?.filter((e) => e.event_date >= todayIso()) ?? [], [events]);
  const past = useMemo(() => events?.filter((e) => e.event_date < todayIso()) ?? [], [events]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            Events
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Synced from ALTA Connect · attendance feeds engagement scoring
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {loading || !totals ? (
          <><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /></>
        ) : (
          <>
            <KpiCard label="Upcoming events" value={totals.upcoming} sub={`${totals.past} in the past`} icon={Calendar} color="#4A90D9" />
            <KpiCard label="Total registrations" value={totals.totalRegistrations} sub="across all events" icon={Users} color="#a855f7" />
            <KpiCard label="Attendance rate" value={`${totals.overallRate}%`} sub="past events only" icon={Award} color="#8CC63F" />
            <KpiCard label="Revenue collected" value={`$${(totals.revenuePaid / 1000).toFixed(1)}K`} sub={`$${totals.revenueOutstanding.toLocaleString()} outstanding`} icon={DollarSign} color="#F5C542" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Upcoming" subtitle="Future event dates" loading={loading} events={upcoming} emptyText="No upcoming events." />
        <Section title="Past" subtitle="Completed events with attendance" loading={loading} events={past} emptyText="No past events." />
      </div>
    </div>
  );
}

function Section({
  title, subtitle, loading, events, emptyText,
}: { title: string; subtitle: string; loading: boolean; events: EventSummary[]; emptyText: string }) {
  if (loading) return <SkeletonCard height={300} />;
  return (
    <Card glass title={title} subtitle={subtitle}>
      {events.length === 0 ? (
        <p className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>{emptyText}</p>
      ) : (
        <div className="space-y-1.5">
          {events.map((e) => (
            <Link
              key={e.alta_connect_event_id}
              href={`/events/${encodeURIComponent(e.alta_connect_event_id)}`}
              className="flex items-center gap-3 p-2.5 rounded-lg transition-all hover:translate-x-0.5"
              style={{ background: 'var(--input-bg)' }}
            >
              <div
                className="w-1 h-10 rounded-full flex-shrink-0"
                style={{ background: TYPE_COLOR[e.event_type] }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate" style={{ color: 'var(--heading)' }}>{e.event_name}</div>
                <div className="text-[10px] mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <span>{e.event_date}</span>
                  <span>·</span>
                  <span style={{ color: TYPE_COLOR[e.event_type] }}>{e.event_type}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-bold tabular-nums" style={{ color: 'var(--heading)' }}>
                  {e.registered + e.attended + e.no_show}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {e.attended ? `${e.attendance_rate}% attend` : `${e.registered} reg.`}
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
