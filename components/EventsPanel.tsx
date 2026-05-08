'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle2, XCircle, Clock, Ban, Loader2, ExternalLink } from 'lucide-react';
import Card from './Card';
import type { EventAttendance, RegistrationStatus } from '@/lib/member-data';

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

interface EventsPanelProps {
  orgId: string;
  orgName: string;
}

export default function EventsPanel({ orgId, orgName }: EventsPanelProps) {
  const [rows, setRows] = useState<EventAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/memtrak/orgs/${encodeURIComponent(orgId)}/events`)
      .then((r) => r.json())
      .then((d: { rows: EventAttendance[] }) => setRows(d.rows ?? []))
      .finally(() => setLoading(false));
  }, [orgId]);

  const attended = rows.filter((r) => r.registration_status === 'Attended').length;
  const noShow = rows.filter((r) => r.registration_status === 'No Show').length;
  const eligible = attended + noShow;
  const rate = eligible > 0 ? Math.round((attended / eligible) * 100) : 0;
  const totalPaid = rows.reduce((s, r) => s + (r.paid ? r.registration_fee : 0), 0);

  return (
    <Card title="Event Attendance" subtitle={`${orgName} — synced from ALTA Connect`}>
      {loading ? (
        <div className="flex items-center gap-2 text-xs py-3" style={{ color: 'var(--text-muted)' }}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading attendance…
        </div>
      ) : rows.length === 0 ? (
        <div className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>
          No event attendance on file for this organization.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="px-3 py-2 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
              <div className="text-lg font-extrabold tabular-nums" style={{ color: 'var(--heading)' }}>{rows.length}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total</div>
            </div>
            <div className="px-3 py-2 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
              <div className="text-lg font-extrabold tabular-nums" style={{ color: '#8CC63F' }}>{rate}%</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Attendance</div>
            </div>
            <div className="px-3 py-2 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
              <div className="text-lg font-extrabold tabular-nums" style={{ color: 'var(--heading)' }}>${totalPaid.toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Fees paid</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {rows.slice(0, 8).map((r) => {
              const Icon = STATUS_ICON[r.registration_status];
              const color = STATUS_COLOR[r.registration_status];
              return (
                <Link
                  key={r.id}
                  href={`/events/${encodeURIComponent(r.alta_connect_event_id)}`}
                  className="flex items-center gap-3 p-2 rounded-md transition-all hover:translate-x-0.5"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <Calendar className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--heading)' }}>{r.event_name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.event_date} · {r.event_type}</div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
                    <Icon className="w-3 h-3" /> {r.registration_status}
                  </span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                </Link>
              );
            })}
            {rows.length > 8 && (
              <div className="text-[10px] text-center pt-1" style={{ color: 'var(--text-muted)' }}>
                + {rows.length - 8} more
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
