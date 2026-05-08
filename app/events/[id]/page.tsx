'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Card, { KpiCard } from '@/components/Card';
import { SkeletonCard, SkeletonKPI } from '@/components/Skeleton';
import {
  Calendar, Users, DollarSign, Award, ChevronLeft, CheckCircle2, XCircle, Clock, Ban, ExternalLink, Building2,
} from 'lucide-react';
import type { EventAttendance, EventSummary, RegistrationStatus } from '@/lib/member-data';

const STATUS_COLOR: Record<RegistrationStatus, string> = {
  Registered: '#4A90D9',
  Attended: '#8CC63F',
  'No Show': '#D94A4A',
  Cancelled: '#888888',
};

const STATUS_ICON: Record<RegistrationStatus, typeof CheckCircle2> = {
  Registered: Clock,
  Attended: CheckCircle2,
  'No Show': XCircle,
  Cancelled: Ban,
};

interface PageProps {
  params: Promise<{ id: string }>;
}

interface EventDetailPayload {
  event: EventSummary;
  roster: EventAttendance[];
}

export default function EventDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [data, setData] = useState<EventDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/memtrak/connect-events/${encodeURIComponent(id)}`)
      .then(async (r) => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({}));
          setError(e.error ?? `Request failed (${r.status})`);
          return;
        }
        setData(await r.json());
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Network error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard height={80} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /></div>
        <SkeletonCard height={300} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link href="/events" className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
          <ChevronLeft className="w-3 h-3" /> Back to events
        </Link>
        <Card glass>
          <p className="text-xs" style={{ color: '#D94A4A' }}>{error ?? 'Not found.'}</p>
        </Card>
      </div>
    );
  }

  const { event, roster } = data;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/events" className="inline-flex items-center gap-1 text-xs no-print" style={{ color: 'var(--accent)' }}>
          <ChevronLeft className="w-3 h-3" /> Back to events
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2" style={{ color: 'var(--heading)' }}>
          {event.event_name}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {event.event_date} · {event.event_type} · ALTA Connect ID <code style={{ color: 'var(--heading)' }}>{event.alta_connect_event_id}</code>
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <KpiCard label="Registrations" value={event.registered + event.attended + event.no_show} sub={`${event.cancelled} cancelled`} icon={Users} color="#4A90D9" />
        <KpiCard label="Attended" value={event.attended} sub={`${event.no_show} no-shows`} icon={CheckCircle2} color="#8CC63F" />
        <KpiCard label="Attendance rate" value={`${event.attendance_rate}%`} sub="of eligible" icon={Award} color="#a855f7" />
        <KpiCard label="Revenue collected" value={`$${event.revenue_paid.toLocaleString()}`} sub={event.revenue_outstanding ? `$${event.revenue_outstanding.toLocaleString()} outstanding` : 'all paid'} icon={DollarSign} color="#F5C542" />
      </div>

      <Card glass title="Roster" subtitle={`${roster.length} registrations`} noPad>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--table-header)', color: 'var(--text-muted)' }}>
                <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Organization</th>
                <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Status</th>
                <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Check-in</th>
                <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wider">Fee</th>
                <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wider">Paid</th>
                <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wider no-print">Open</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r) => {
                const Icon = STATUS_ICON[r.registration_status];
                const color = STATUS_COLOR[r.registration_status];
                return (
                  <tr key={r.id} style={{ borderTop: '1px solid var(--card-border)' }}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                        <span className="font-mono text-[11px]" style={{ color: 'var(--heading)' }}>{r.org_id}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                        style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
                      >
                        <Icon className="w-3 h-3" /> {r.registration_status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: 'var(--heading)' }}>
                      {r.registration_fee > 0 ? `$${r.registration_fee.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {r.registration_fee > 0 ? (
                        r.paid
                          ? <span className="text-[10px] font-bold" style={{ color: '#8CC63F' }}>Paid</span>
                          : <span className="text-[10px] font-bold" style={{ color: '#F5C542' }}>Unpaid</span>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right no-print">
                      <Link
                        href={`/member-360?id=${encodeURIComponent(r.org_id)}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all hover:scale-[1.05]"
                        style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
                      >
                        Member <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
