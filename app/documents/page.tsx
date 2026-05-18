'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Card, { KpiCard } from '@/components/Card';
import { SkeletonCard, SkeletonKPI } from '@/components/Skeleton';
import DocumentFormDrawer from '@/components/DocumentFormDrawer';
import {
  FileText, ExternalLink, Trash2, Pencil, Plus, Search, Loader2, Tag as TagIcon,
  ShieldCheck, BookOpen, CalendarClock, FileSignature, DollarSign, Layers,
} from 'lucide-react';
import { DOCUMENT_TYPES, type DocumentType, type MemtrakDocument } from '@/lib/member-data';

const TYPE_COLOR: Record<DocumentType, string> = {
  Bylaws:             '#a855f7',
  Policy:             '#4A90D9',
  'Meeting Minutes':  '#14b8a6',
  Agenda:             '#F5C542',
  'Financial Report': '#E8923F',
  Contract:           '#475569',
  Presentation:       '#8CC63F',
  'Annual Report':    '#D94A4A',
  Other:              '#888888',
};

const TYPE_ICON: Record<DocumentType, typeof FileText> = {
  Bylaws:             ShieldCheck,
  Policy:             BookOpen,
  'Meeting Minutes':  FileText,
  Agenda:             CalendarClock,
  'Financial Report': DollarSign,
  Contract:           FileSignature,
  Presentation:       Layers,
  'Annual Report':    FileText,
  Other:              FileText,
};

export default function DocumentsPage() {
  const [rows, setRows] = useState<MemtrakDocument[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState<DocumentType | ''>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MemtrakDocument | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (type) params.set('doc_type', type);
    const res = await fetch(`/api/memtrak/documents${params.toString() ? `?${params}` : ''}`);
    const data = await res.json();
    setRows(data.rows ?? []);
  }, [q, type]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const stats = useMemo(() => {
    if (!rows) return null;
    const byType = new Map<DocumentType, number>();
    for (const r of rows) byType.set(r.doc_type, (byType.get(r.doc_type) ?? 0) + 1);
    const totalTagged = rows.filter((r) => (r.tags?.length ?? 0) > 0).length;
    const attachedToGroups = rows.filter((r) => r.group_id).length;
    return { total: rows.length, byType, totalTagged, attachedToGroups };
  }, [rows]);

  async function remove(doc: MemtrakDocument) {
    if (!confirm(`Delete "${doc.name}"? The external file is not affected.`)) return;
    setPendingId(doc.id);
    try {
      const res = await fetch(`/api/memtrak/documents/${doc.id}`, { method: 'DELETE' });
      if (res.ok) await refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            Documents
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Bylaws, policies, minutes, and contracts — linked from wherever they actually live.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setDrawerOpen(true); }}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all hover:scale-[1.02] no-print"
          style={{ color: '#fff', background: 'var(--accent)' }}
        >
          <Plus className="w-3.5 h-3.5" /> Add document
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {loading || !stats ? (
          <><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /></>
        ) : (
          <>
            <KpiCard label="Total documents" value={stats.total} sub="all types" icon={FileText} color="#4A90D9" />
            <KpiCard label="Attached to groups" value={stats.attachedToGroups} sub="of total" icon={Layers} color="#14b8a6" />
            <KpiCard label="Tagged" value={stats.totalTagged} sub="have at least one tag" icon={TagIcon} color="#a855f7" />
            <KpiCard label="Bylaws & Policies" value={(stats.byType.get('Bylaws') ?? 0) + (stats.byType.get('Policy') ?? 0)} sub="governance docs" icon={ShieldCheck} color="#F5C542" />
          </>
        )}
      </div>

      <Card glass>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, description, or tag"
              className="w-full pl-8 pr-3 py-2 rounded-md text-xs"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--heading)' }}
            />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as DocumentType | '')}
            className="px-3 py-2 rounded-md text-xs"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--heading)' }}
          >
            <option value="">All types</option>
            {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </Card>

      {loading ? <SkeletonCard height={400} /> : (
        <Card glass title="Library" subtitle={`${rows?.length ?? 0} documents`} noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--table-header)', color: 'var(--text-muted)' }}>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Title</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Type</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Effective</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Tags</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wider no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(rows?.length ?? 0) === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center" style={{ color: 'var(--text-muted)' }}>No documents match.</td></tr>
                )}
                {rows?.map((d) => {
                  const Icon = TYPE_ICON[d.doc_type];
                  const color = TYPE_COLOR[d.doc_type];
                  const busy = pendingId === d.id;
                  return (
                    <tr key={d.id} style={{ borderTop: '1px solid var(--card-border)', opacity: busy ? 0.5 : 1 }}>
                      <td className="px-3 py-2.5">
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                          <span className="font-bold text-[11px]" style={{ color: 'var(--heading)' }}>{d.name}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                        </a>
                        {d.description && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{d.description}</div>}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
                          {d.doc_type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                        {d.effective_date ?? '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {(d.tags ?? []).slice(0, 4).map((t) => (
                            <span key={t} className="text-[10px] px-1 rounded" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right no-print">
                        <div className="inline-flex items-center gap-1">
                          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--text-muted)' }} />}
                          <RowBtn label="Edit" color="#4A90D9" icon={Pencil} disabled={busy} onClick={() => { setEditing(d); setDrawerOpen(true); }} />
                          <RowBtn label="Delete" color="#D94A4A" icon={Trash2} disabled={busy} onClick={() => remove(d)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <DocumentFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => { setDrawerOpen(false); refresh(); }}
        document={editing}
      />
    </div>
  );
}

interface RowBtnProps { label: string; color: string; icon: typeof FileText; disabled?: boolean; onClick: () => void }
function RowBtn({ label, color, icon: Icon, disabled, onClick }: RowBtnProps) {
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
