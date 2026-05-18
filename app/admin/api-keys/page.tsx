'use client';

import { useCallback, useEffect, useState, FormEvent } from 'react';
import Card from '@/components/Card';
import { SkeletonCard } from '@/components/Skeleton';
import {
  KeyRound, Copy, Trash2, Ban, RotateCcw, CheckCircle2, AlertCircle, Loader2,
  Plus, Eye, EyeOff, Terminal,
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  created_by: string | null;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  note: string | null;
}

export default function ApiKeysPage() {
  const [rows, setRows] = useState<ApiKey[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Create form
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [newSecret, setNewSecret] = useState<{ name: string; secret: string } | null>(null);
  const [secretVisible, setSecretVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/memtrak/keys');
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      setError(e.error ?? `Request failed (${res.status})`);
      setRows([]);
      return;
    }
    const data = await res.json();
    setRows(data.rows ?? []);
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  async function create(e: FormEvent) {
    e.preventDefault();
    setError(null); setSubmitting(true);
    try {
      const body: Record<string, unknown> = { name: name.trim() };
      const parsed = scopes.split(',').map((s) => s.trim()).filter(Boolean);
      if (parsed.length) body.scopes = parsed;
      if (note) body.note = note;

      const res = await fetch('/api/memtrak/keys', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Create failed'); return; }
      setNewSecret({ name: data.key.name, secret: data.secret });
      setSecretVisible(true);
      setName(''); setScopes(''); setNote('');
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function rowAction(key: ApiKey, kind: 'revoke' | 'restore' | 'delete') {
    setPendingId(key.id);
    try {
      if (kind === 'delete') {
        if (!confirm(`Delete API key "${key.name}"? This cannot be undone.`)) return;
        await fetch(`/api/memtrak/keys/${key.id}`, { method: 'DELETE' });
      } else {
        await fetch(`/api/memtrak/keys/${key.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: kind }),
        });
      }
      await refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function copySecret() {
    if (!newSecret) return;
    await navigator.clipboard.writeText(newSecret.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>API keys</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Bearer tokens for external integrations. Send as <code>Authorization: Bearer mtk_live_…</code> on
          any <code>/api/memtrak/*</code> request.
        </p>
      </div>

      {newSecret && (
        <Card glass>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#8CC63F' }} />
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>
                  Key &quot;{newSecret.name}&quot; created
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Copy it now — for security we hash and never show it again.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
              <KeyRound className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
              <code className="flex-1 font-mono text-[11px] truncate" style={{ color: 'var(--heading)' }}>
                {secretVisible ? newSecret.secret : '•'.repeat(newSecret.secret.length)}
              </code>
              <button onClick={() => setSecretVisible((v) => !v)} title={secretVisible ? 'Hide' : 'Show'} className="p-1.5 rounded hover:opacity-80">
                {secretVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button onClick={copySecret} title="Copy" className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold" style={{ color: '#fff', background: 'var(--accent)' }}>
                {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md text-[10px] font-mono overflow-x-auto" style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-muted)' }}>
              <Terminal className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
              <span>curl -H &quot;Authorization: Bearer {secretVisible ? newSecret.secret : '<hidden>'}&quot; https://memtrak.alta.org/api/memtrak/members</span>
            </div>
            <button onClick={() => setNewSecret(null)} className="text-[11px] underline" style={{ color: 'var(--text-muted)' }}>Dismiss</button>
          </div>
        </Card>
      )}

      <Card glass title="Create key" subtitle="Scopes are optional. Empty = full /api/memtrak/* access.">
        <form onSubmit={create} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder='Name (e.g. "Higher Logic sync")'
            required
            className="px-3 py-2 rounded-md text-xs"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--heading)' }}
          />
          <input
            value={scopes} onChange={(e) => setScopes(e.target.value)}
            placeholder="Scopes — e.g. GET:/api/memtrak/members,POST:/api/memtrak/invoices"
            className="px-3 py-2 rounded-md text-xs font-mono"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--heading)' }}
          />
          <button
            type="submit"
            disabled={submitting || !name}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ color: '#fff', background: 'var(--accent)' }}
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Create
          </button>
          <input
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note"
            className="sm:col-span-3 px-3 py-2 rounded-md text-xs"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--heading)' }}
          />
        </form>
        {error && (
          <div className="flex items-start gap-2 px-3 py-2 mt-3 rounded-md text-xs" style={{ background: 'color-mix(in srgb, #D94A4A 12%, transparent)', color: '#D94A4A' }}>
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}
      </Card>

      {loading ? <SkeletonCard height={300} /> : (
        <Card glass title="Existing keys" subtitle={`${rows?.length ?? 0} total · revoked keys stop working immediately`} noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--table-header)', color: 'var(--text-muted)' }}>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Name</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Prefix</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Scopes</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Created</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Last used</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wider no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(rows?.length ?? 0) === 0 && (
                  <tr><td colSpan={7} className="px-3 py-6 text-center" style={{ color: 'var(--text-muted)' }}>No API keys yet — create one above.</td></tr>
                )}
                {rows?.map((k) => {
                  const busy = pendingId === k.id;
                  const revoked = !!k.revoked_at;
                  return (
                    <tr key={k.id} style={{ borderTop: '1px solid var(--card-border)', opacity: busy ? 0.5 : 1 }}>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-[11px]" style={{ color: 'var(--heading)' }}>{k.name}</div>
                        {k.note && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{k.note}</div>}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>{k.prefix}…</td>
                      <td className="px-3 py-2.5">
                        {k.scopes.length === 0 ? (
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>full /api/memtrak/*</span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            {k.scopes.map((s) => <code key={s} className="text-[10px]" style={{ color: 'var(--accent)' }}>{s}</code>)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>{new Date(k.created_at).toLocaleDateString()}</td>
                      <td className="px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                        {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        {revoked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: '#D94A4A' }}>
                            <Ban className="w-3 h-3" /> Revoked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: '#8CC63F' }}>
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right no-print">
                        <div className="inline-flex items-center gap-1">
                          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--text-muted)' }} />}
                          {revoked ? (
                            <Btn label="Restore" color="#8CC63F" icon={RotateCcw} disabled={busy} onClick={() => rowAction(k, 'restore')} />
                          ) : (
                            <Btn label="Revoke" color="#D94A4A" icon={Ban} disabled={busy} onClick={() => rowAction(k, 'revoke')} />
                          )}
                          <Btn label="Delete" color="#888" icon={Trash2} disabled={busy} onClick={() => rowAction(k, 'delete')} />
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
    </div>
  );
}

interface BtnProps { label: string; color: string; icon: typeof KeyRound; disabled?: boolean; onClick: () => void }
function Btn({ label, color, icon: Icon, disabled, onClick }: BtnProps) {
  return (
    <button
      onClick={onClick} disabled={disabled} title={label}
      className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
