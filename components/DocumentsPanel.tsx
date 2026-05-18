'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  FileText, ExternalLink, Trash2, Pencil, Plus, Loader2,
  Tag as TagIcon,
} from 'lucide-react';
import Card from './Card';
import DocumentFormDrawer from './DocumentFormDrawer';
import { type DocumentType, type MemtrakDocument } from '@/lib/member-data';

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

interface Props {
  /** When provided, filter the panel to a single group's documents. */
  groupId?: string | null;
  /** Title override (defaults to "Documents"). */
  title?: string;
  /** Subtitle override. */
  subtitle?: string;
  /** Cap the list (full directory page passes a higher number / undefined). */
  limit?: number;
}

export default function DocumentsPanel({ groupId = null, title = 'Documents', subtitle, limit }: Props) {
  const [rows, setRows] = useState<MemtrakDocument[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<MemtrakDocument | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const params = new URLSearchParams();
    if (groupId) params.set('group_id', groupId);
    const res = await fetch(`/api/memtrak/documents${params.toString() ? `?${params}` : ''}`);
    const data = await res.json();
    setRows(data.rows ?? []);
  }, [groupId]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

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

  const sub = subtitle ?? (groupId ? `${rows?.length ?? 0} attached` : `${rows?.length ?? 0} total · linked externally`);
  const shown = limit ? rows?.slice(0, limit) : rows;

  return (
    <>
      <Card glass title={title} subtitle={sub}>
        <div className="flex items-center justify-end mb-2 no-print">
          <button
            onClick={() => { setEditing(null); setDrawerOpen(true); }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all hover:scale-[1.02]"
            style={{ color: '#fff', background: 'var(--accent)' }}
          >
            <Plus className="w-3 h-3" /> Add document
          </button>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-xs py-3" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
          </div>
        ) : (rows?.length ?? 0) === 0 ? (
          <div className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>
            No documents yet. Click <strong>Add</strong> to attach a link.
          </div>
        ) : (
          <div className="space-y-1.5">
            {shown!.map((d) => {
              const color = TYPE_COLOR[d.doc_type];
              const busy = pendingId === d.id;
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg"
                  style={{ background: 'var(--input-bg)', opacity: busy ? 0.5 : 1 }}
                >
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: color }} />
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                  <div className="flex-1 min-w-0">
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold truncate inline-flex items-center gap-1 hover:underline"
                      style={{ color: 'var(--heading)' }}
                    >
                      {d.name} <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                    </a>
                    <div className="text-[10px] mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                      <span style={{ color }}>{d.doc_type}</span>
                      {d.effective_date && <><span>·</span><span>{d.effective_date}</span></>}
                      {(d.tags ?? []).slice(0, 3).map((t) => (
                        <span key={t} className="inline-flex items-center gap-0.5 px-1 rounded" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>
                          <TagIcon className="w-2 h-2" />{t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 no-print">
                    {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--text-muted)' }} />}
                    <ActionBtn label="Edit" color="#4A90D9" icon={Pencil} disabled={busy} onClick={() => { setEditing(d); setDrawerOpen(true); }} />
                    <ActionBtn label="Delete" color="#D94A4A" icon={Trash2} disabled={busy} onClick={() => remove(d)} />
                  </div>
                </div>
              );
            })}
            {limit && rows && rows.length > limit && (
              <div className="text-[10px] text-center pt-1" style={{ color: 'var(--text-muted)' }}>
                + {rows.length - limit} more
              </div>
            )}
          </div>
        )}
      </Card>

      <DocumentFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => { setDrawerOpen(false); refresh(); }}
        document={editing}
        defaultGroupId={groupId}
      />
    </>
  );
}

interface ActionBtnProps { label: string; color: string; icon: typeof FileText; disabled?: boolean; onClick: () => void }
function ActionBtn({ label, color, icon: Icon, disabled, onClick }: ActionBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="inline-flex items-center justify-center w-6 h-6 rounded-md transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
    >
      <Icon className="w-3 h-3" />
    </button>
  );
}
