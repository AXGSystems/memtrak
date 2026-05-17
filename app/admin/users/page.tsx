'use client';

import { useCallback, useEffect, useState, FormEvent } from 'react';
import Card from '@/components/Card';
import { SkeletonCard } from '@/components/Skeleton';
import {
  UserPlus, ShieldCheck, User as UserIcon, Eye, Ban, RotateCcw, Trash2,
  CheckCircle2, Clock, AlertCircle, Loader2,
} from 'lucide-react';

type AuthRole = 'admin' | 'staff' | 'read-only';

interface Invite {
  id: string;
  email: string;
  role: AuthRole;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  note: string | null;
}

const ROLE_ICON: Record<AuthRole, typeof ShieldCheck> = {
  admin: ShieldCheck,
  staff: UserIcon,
  'read-only': Eye,
};
const ROLE_COLOR: Record<AuthRole, string> = {
  admin: '#a855f7',
  staff: '#4A90D9',
  'read-only': '#8899aa',
};

export default function UsersPage() {
  const [rows, setRows] = useState<Invite[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AuthRole>('staff');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/memtrak/invites');
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

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(null); setSubmitting(true);
    try {
      const res = await fetch('/api/memtrak/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role, note: note || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Invite failed'); return; }
      setSuccess(`Invited ${data.invite.email}`);
      setEmail(''); setNote('');
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function rowAction(invite: Invite, kind: 'revoke' | 'restore' | 'delete' | 'role', value?: AuthRole) {
    setPendingId(invite.id);
    try {
      if (kind === 'delete') {
        if (!confirm(`Delete invite for ${invite.email}?`)) return;
        await fetch(`/api/memtrak/invites/${invite.id}`, { method: 'DELETE' });
      } else if (kind === 'role' && value) {
        await fetch(`/api/memtrak/invites/${invite.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: value }),
        });
      } else {
        await fetch(`/api/memtrak/invites/${invite.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: kind }),
        });
      }
      await refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>Users &amp; invites</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          MEMTrak is invite-only. Add an email to the allow-list; that person can then sign in with a magic link.
        </p>
      </div>

      <Card glass title="Invite someone" subtitle="They&apos;ll need an email to sign in — no password.">
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@alta.org"
            className="px-3 py-2 rounded-md text-xs"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--heading)' }}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AuthRole)}
            className="px-3 py-2 rounded-md text-xs"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--heading)' }}
          >
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="read-only">Read-only</option>
          </select>
          <button
            type="submit"
            disabled={submitting || !email}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ color: '#fff', background: 'var(--accent)' }}
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
            Send invite
          </button>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note (visible only to admins)"
            className="sm:col-span-3 px-3 py-2 rounded-md text-xs"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--heading)' }}
          />
          {error && (
            <div className="sm:col-span-3 flex items-start gap-2 px-3 py-2 rounded-md text-xs" style={{ background: 'color-mix(in srgb, #D94A4A 12%, transparent)', color: '#D94A4A' }}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}
          {success && (
            <div className="sm:col-span-3 flex items-start gap-2 px-3 py-2 rounded-md text-xs" style={{ background: 'color-mix(in srgb, #8CC63F 14%, transparent)', color: '#8CC63F' }}>
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {success}
            </div>
          )}
        </form>
      </Card>

      {loading ? <SkeletonCard height={300} /> : (
        <Card glass title="Allow-list" subtitle={`${rows?.length ?? 0} invites · revoking blocks sign-in immediately`} noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--table-header)', color: 'var(--text-muted)' }}>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Email</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Role</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Invited</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Accepted</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wider no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!rows?.length && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center" style={{ color: 'var(--text-muted)' }}>No invites yet — invite someone above.</td></tr>
                )}
                {rows?.map((r) => {
                  const Icon = ROLE_ICON[r.role];
                  const color = ROLE_COLOR[r.role];
                  const busy = pendingId === r.id;
                  const revoked = !!r.revoked_at;
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid var(--card-border)', opacity: busy ? 0.5 : 1 }}>
                      <td className="px-3 py-2.5">
                        <div className="font-mono text-[11px]" style={{ color: 'var(--heading)' }}>{r.email}</div>
                        {r.note && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{r.note}</div>}
                      </td>
                      <td className="px-3 py-2.5">
                        <select
                          value={r.role}
                          onChange={(e) => rowAction(r, 'role', e.target.value as AuthRole)}
                          disabled={busy || revoked}
                          className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                          style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)`, border: 'none' }}
                        >
                          <option value="admin">admin</option>
                          <option value="staff">staff</option>
                          <option value="read-only">read-only</option>
                        </select>
                        <span className="sr-only"><Icon className="w-3 h-3" /></span>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                        {new Date(r.invited_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums" style={{ color: r.accepted_at ? '#8CC63F' : 'var(--text-muted)' }}>
                        {r.accepted_at ? new Date(r.accepted_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        {revoked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: '#D94A4A' }}>
                            <Ban className="w-3 h-3" /> Revoked
                          </span>
                        ) : r.accepted_at ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: '#8CC63F' }}>
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: '#F5C542' }}>
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right no-print">
                        <div className="inline-flex items-center gap-1">
                          {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--text-muted)' }} />}
                          {revoked ? (
                            <ActionBtn label="Restore" color="#8CC63F" disabled={busy} icon={RotateCcw} onClick={() => rowAction(r, 'restore')} />
                          ) : (
                            <ActionBtn label="Revoke" color="#D94A4A" disabled={busy} icon={Ban} onClick={() => rowAction(r, 'revoke')} />
                          )}
                          <ActionBtn label="Delete" color="#888" disabled={busy} icon={Trash2} onClick={() => rowAction(r, 'delete')} />
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

interface ActionBtnProps { label: string; color: string; disabled?: boolean; onClick: () => void; icon: typeof ShieldCheck }
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
