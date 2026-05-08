'use client';

import { useCallback, useEffect, useState, use } from 'react';
import Link from 'next/link';
import Card, { KpiCard } from '@/components/Card';
import { SkeletonCard, SkeletonKPI } from '@/components/Skeleton';
import RegistrationDrawer from '@/components/RegistrationDrawer';
import {
  Users, DollarSign, Award, ChevronLeft, CheckCircle2, XCircle, Clock, Ban, ExternalLink, Building2,
  UserPlus, Loader2, Trash2,
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

interface OrgLite {
  id: string;
  org_name: string;
}

export default function EventDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [data, setData] = useState<EventDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [orgNames, setOrgNames] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    const r = await fetch(`/api/memtrak/connect-events/${encodeURIComponent(id)}`);
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      setError(e.error ?? `Request failed (${r.status})`);
      return;
    }
    setData(await r.json());
  }, [id]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  // Lookup org names once we know which org_ids appear in the roster
  useEffect(() => {
    if (!data?.roster.length) return;
    const ids = Array.from(new Set(data.roster.map((r) => r.org_id))).filter((x) => !orgNames[x]);
    if (ids.length === 0) return;
    Promise.all(
      ids.map((orgId) =>
        fetch(`/api/memtrak/members/${encodeURIComponent(orgId)}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
          .then((o: OrgLite | null) => [orgId, o?.org_name ?? orgId] as const),
      ),
    ).then((pairs) => {
      setOrgNames((prev) => {
        const next = { ...prev };
        for (const [k, v] of pairs) next[k] = v;
        return next;
      });
    });
  }, [data, orgNames]);

  async function rowAction(row: EventAttendance, action: 'check_in' | 'mark_paid' | 'cancel') {
    setPendingId(row.id);
    try {
      const res = await fetch(
        `/api/memtrak/connect-events/${encodeURIComponent(id)}/registrations/${encodeURIComponent(row.id)}`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) },
      );
      if (res.ok) await refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function rowDelete(row: EventAttendance) {
    if (!confirm(`Remove ${orgNames[row.org_id] ?? row.org_id}'s registration?`)) return;
    setPendingId(row.id);
    try {
      const res = await fetch(
        `/api/memtrak/connect-events/${encodeURIComponent(id)}/registrations/${encodeURIComponent(row.id)}`,
        { method: 'DELETE' },
      );
      if (res.ok) await refresh();
    } finally {
      setPendingId(null);
    }
  }

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all hover:scale-[1.02] no-print"
          style={{ color: '#fff', background: 'var(--accent)' }}
        >
          <UserPlus className="w-3.5 h-3.5" /> Register member
        </button>
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
                <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wider no-print">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roster.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    No registrations yet — click <strong>Register member</strong> to add the first.
                  </td>
                </tr>
              )}
              {roster.map((r) => {
                const Icon = STATUS_ICON[r.registration_status];
                const color = STATUS_COLOR[r.registration_status];
                const orgName = orgNames[r.org_id] ?? r.org_id;
                const busy = pendingId === r.id;
                const canCheckIn = r.registration_status === 'Registered';
                const canMarkPaid = r.registration_fee > 0 && !r.paid && r.registration_status !== 'Cancelled';
                const canCancel = r.registration_status !== 'Cancelled';
                return (
                  <tr key={r.id} style={{ borderTop: '1px solid var(--card-border)', opacity: busy ? 0.6 : 1 }}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold truncate" style={{ color: 'var(--heading)' }}>{orgName}</div>
                          <div className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.org_id}</div>
                        </div>
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
                      <div className="inline-flex items-center gap-1">
                        {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--text-muted)' }} />}
                        {canCheckIn && (
                          <ActionBtn
                            label="Check in"
                            color="#8CC63F"
                            disabled={busy}
                            onClick={() => rowAction(r, 'check_in')}
                            icon={CheckCircle2}
                          />
                        )}
                        {canMarkPaid && (
                          <ActionBtn
                            label="Mark paid"
                            color="#F5C542"
                            disabled={busy}
                            onClick={() => rowAction(r, 'mark_paid')}
                            icon={DollarSign}
                          />
                        )}
                        {canCancel && (
                          <ActionBtn
                            label="Cancel"
                            color="#888"
                            disabled={busy}
                            onClick={() => rowAction(r, 'cancel')}
                            icon={Ban}
                          />
                        )}
                        <ActionBtn
                          label="Delete"
                          color="#D94A4A"
                          disabled={busy}
                          onClick={() => rowDelete(r)}
                          icon={Trash2}
                        />
                        <Link
                          href={`/member-360?id=${encodeURIComponent(r.org_id)}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all hover:scale-[1.05]"
                          style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
                          title="Open Member360"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <RegistrationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => { setDrawerOpen(false); refresh(); }}
        mode="add-to-event"
        eventId={id}
        eventMeta={{ event_name: event.event_name, event_date: event.event_date, event_type: event.event_type }}
      />
    </div>
  );
}

interface ActionBtnProps {
  label: string;
  color: string;
  disabled?: boolean;
  onClick: () => void;
  icon: typeof CheckCircle2;
}

function ActionBtn({ label, color, disabled, onClick, icon: Icon }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
