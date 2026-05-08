'use client';

import { useEffect, useMemo, useState } from 'react';
import Card, { KpiCard } from '@/components/Card';
import { SkeletonCard, SkeletonKPI } from '@/components/Skeleton';
import {
  Activity, Search, Plus, Pencil, Trash2, CheckCircle2, RefreshCw, Upload,
} from 'lucide-react';

type AuditAction = 'create' | 'update' | 'delete' | 'mark_paid' | 'recompute_engagement' | 'import';
type AuditEntity = 'organization' | 'contact' | 'invoice' | 'event_attendance' | 'group' | 'group_member';

interface AuditEvent {
  id: string;
  created_at: string;
  entity: AuditEntity;
  entity_id: string;
  entity_label?: string;
  action: AuditAction;
  actor: string;
  summary: string;
  diff?: Record<string, { from: unknown; to: unknown }>;
}

interface AuditPayload {
  events: AuditEvent[];
  total: number;
  byAction: Record<string, number>;
  byEntity: Record<string, number>;
}

const ACTION_ICON: Record<AuditAction, typeof Activity> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  mark_paid: CheckCircle2,
  recompute_engagement: RefreshCw,
  import: Upload,
};

const ACTION_COLOR: Record<AuditAction, string> = {
  create: '#8CC63F',
  update: '#4A90D9',
  delete: '#D94A4A',
  mark_paid: '#14b8a6',
  recompute_engagement: '#a855f7',
  import: '#F5C542',
};

const ENTITY_LABEL: Record<AuditEntity, string> = {
  organization: 'Organization',
  contact: 'Contact',
  invoice: 'Invoice',
  event_attendance: 'Attendance',
  group: 'Group',
  group_member: 'Group member',
};

const ENTITIES: AuditEntity[] = ['organization', 'contact', 'invoice', 'event_attendance', 'group', 'group_member'];
const ACTIONS: AuditAction[] = ['create', 'update', 'delete', 'mark_paid', 'recompute_engagement', 'import'];

const fmtTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function AuditTrailPage() {
  const [data, setData] = useState<AuditPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [entity, setEntity] = useState<AuditEntity | ''>('');
  const [action, setAction] = useState<AuditAction | ''>('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (entity) params.set('entity', entity);
    if (action) params.set('action', action);
    fetch(`/api/memtrak/audit-trail?${params}`)
      .then((r) => r.json())
      .then((d: AuditPayload) => setData(d))
      .finally(() => setLoading(false));
  }, [debouncedQ, entity, action]);

  const top = useMemo(() => {
    if (!data) return null;
    const topAction = Object.entries(data.byAction).sort((a, b) => b[1] - a[1])[0];
    const topEntity = Object.entries(data.byEntity).sort((a, b) => b[1] - a[1])[0];
    return {
      total: data.total,
      topAction: topAction ? `${topAction[0]} (${topAction[1]})` : '—',
      topEntity: topEntity ? `${ENTITY_LABEL[topEntity[0] as AuditEntity]} (${topEntity[1]})` : '—',
    };
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
          Audit trail
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Every entity change across organizations, contacts, invoices, attendance, and groups
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
        {loading || !top ? (
          <><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /></>
        ) : (
          <>
            <KpiCard label="Events" value={top.total} sub="matching filters" icon={Activity} color="#4A90D9" />
            <KpiCard label="Top action" value={top.topAction} icon={Pencil} color="#a855f7" />
            <KpiCard label="Top entity" value={top.topEntity} icon={CheckCircle2} color="#8CC63F" />
          </>
        )}
      </div>

      <Card glass>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search summary, actor, label…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }}
            />
          </div>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value as AuditEntity | '')}
            className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }}
          >
            <option value="">All entities</option>
            {ENTITIES.map((e) => <option key={e} value={e}>{ENTITY_LABEL[e]}</option>)}
          </select>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as AuditAction | '')}
            className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }}
          >
            <option value="">All actions</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </Card>

      {loading || !data ? (
        <SkeletonCard height={400} />
      ) : data.events.length === 0 ? (
        <Card glass>
          <p className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>No audit events match those filters.</p>
        </Card>
      ) : (
        <Card glass title="Timeline" subtitle={`${data.events.length} events`}>
          <ol className="relative ml-3" style={{ borderLeft: '1px dashed var(--card-border)' }}>
            {data.events.map((e) => {
              const Icon = ACTION_ICON[e.action];
              const color = ACTION_COLOR[e.action];
              return (
                <li key={e.id} className="pl-5 pb-4 relative">
                  <span
                    className="absolute -left-[7px] top-0 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--card)', border: `2px solid ${color}` }}
                  >
                    <Icon className="w-2 h-2" style={{ color }} />
                  </span>
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color }}>{e.action}</span>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>· {ENTITY_LABEL[e.entity]}</span>
                    {e.entity_label && (
                      <span className="text-[10px] font-mono" style={{ color: 'var(--heading)' }}>· {e.entity_label}</span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--heading)' }}>{e.summary}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {fmtTime(e.created_at)} · by <strong>{e.actor}</strong>
                  </div>
                  {e.diff && Object.keys(e.diff).length > 0 && (
                    <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {Object.entries(e.diff).map(([field, change]) => (
                        <div key={field} className="text-[10px] px-2 py-1 rounded font-mono" style={{ background: 'var(--input-bg)' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{field}: </span>
                          <span style={{ color: '#D94A4A' }}>{formatValue(change.from)}</span>
                          <span style={{ color: 'var(--text-muted)' }}> → </span>
                          <span style={{ color: '#8CC63F' }}>{formatValue(change.to)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </Card>
      )}
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '∅';
  if (typeof v === 'string') return v.length > 28 ? v.slice(0, 28) + '…' : v;
  if (Array.isArray(v)) return `[${v.length}]`;
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 28);
  return String(v);
}
