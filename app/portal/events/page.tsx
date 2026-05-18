'use client';

import { useCallback, useEffect, useState } from 'react';
import Card from '@/components/Card';
import { SkeletonCard } from '@/components/Skeleton';
import { Calendar, CheckCircle2, Clock, Ban, XCircle, UserPlus, Loader2 } from 'lucide-react';
import type { EventAttendance, EventSummary, RegistrationStatus } from '@/lib/member-data';

type UpcomingEvent = Omit<EventSummary, 'registered'> & { registered: boolean }

const STATUS_COLOR: Record<RegistrationStatus, string> = {
  Registered: '#4A90D9',
  Attended:   '#8CC63F',
  'No Show':  '#D94A4A',
  Cancelled:  '#888888',
};
const STATUS_ICON: Record<RegistrationStatus, typeof CheckCircle2> = {
  Registered: Clock,
  Attended:   CheckCircle2,
  'No Show':  XCircle,
  Cancelled:  Ban,
};

export default function PortalEvents() {
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/portal/events');
    const data = await res.json();
    setUpcoming(data.upcoming ?? []);
    setRegistrations(data.my_registrations ?? []);
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  async function register(eventId: string) {
    setPending(eventId);
    try {
      await fetch('/api/portal/register-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alta_connect_event_id: eventId }),
      });
      await refresh();
    } finally {
      setPending(null);
    }
  }

  if (loading) return <SkeletonCard height={400} />;

  return (
    <div className="space-y-6 mt-2">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>Events</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Browse upcoming events and register yourself. Past attendance is shown below.
        </p>
      </div>

      <Card glass title="Upcoming" subtitle={`${upcoming.length} events`}>
        {upcoming.length === 0 ? (
          <p className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>No upcoming events.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((e) => {
              const busy = pending === e.alta_connect_event_id;
              return (
                <div
                  key={e.alta_connect_event_id}
                  className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--heading)' }}>{e.event_name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {e.event_date} · {e.event_type}
                    </div>
                  </div>
                  {e.registered ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ color: '#8CC63F', background: 'color-mix(in srgb, #8CC63F 14%, transparent)' }}>
                      <CheckCircle2 className="w-3 h-3" /> Registered
                    </span>
                  ) : (
                    <button
                      onClick={() => register(e.alta_connect_event_id)}
                      disabled={busy}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
                      style={{ color: '#fff', background: 'var(--accent)' }}
                    >
                      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                      Register
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card glass title="Your registrations" subtitle={`${registrations.length} total`}>
        {registrations.length === 0 ? (
          <p className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>You haven&apos;t registered for anything yet.</p>
        ) : (
          <div className="space-y-1.5">
            {registrations.map((r) => {
              const Icon = STATUS_ICON[r.registration_status];
              const color = STATUS_COLOR[r.registration_status];
              return (
                <div key={r.id} className="flex items-center gap-3 p-2 rounded-md" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold truncate" style={{ color: 'var(--heading)' }}>{r.event_name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.event_date} · {r.event_type}</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
                    <Icon className="w-3 h-3" /> {r.registration_status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
