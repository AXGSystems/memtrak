'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/Card';
import { SkeletonCard } from '@/components/Skeleton';
import {
  CheckCircle2, XCircle, Copy, Terminal, ExternalLink, Database,
  ShieldCheck, KeyRound, AlertCircle, Mail, Layers,
} from 'lucide-react';

interface EnvFlag { key: string; set: boolean; hint?: string }
interface EnvGroup { name: string; flags: EnvFlag[] }
interface Status { auth_enabled: boolean; groups: EnvGroup[] }

const MIGRATIONS = [
  { file: '2026-05-16-nextauth.sql',  what: 'next_auth schema + memtrak_invites (bootstraps vscott@alta.org as admin)' },
  { file: '2026-05-18-documents.sql', what: 'public.memtrak_documents — bylaws / policies / minutes library' },
  { file: '2026-05-18-api-keys.sql',  what: 'public.memtrak_api_keys — bearer tokens for external integrations' },
];

const SMOKE_TESTS = [
  { label: 'List members',  cmd: 'curl https://memtrak.alta.org/api/memtrak/members?pageSize=2' },
  { label: 'Auth status',   cmd: 'curl https://memtrak.alta.org/api/auth/me' },
  { label: 'Portal context', cmd: 'curl https://memtrak.alta.org/api/portal/me' },
  { label: 'Documents',     cmd: 'curl https://memtrak.alta.org/api/memtrak/documents' },
];

export default function LaunchRunbookPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/runbook-status')
      .then(async (r) => {
        if (!r.ok) { const e = await r.json().catch(() => ({})); setError(e.error ?? `Request failed (${r.status})`); return; }
        setStatus(await r.json());
      })
      .finally(() => setLoading(false));
  }, []);

  async function copy(s: string) {
    try { await navigator.clipboard.writeText(s); } catch { /* ignore */ }
  }

  if (loading) return <SkeletonCard height={400} />;
  if (error) return <Card glass><p className="text-xs" style={{ color: '#D94A4A' }}>{error}</p></Card>;
  if (!status) return null;

  const allGroups = status.groups;
  const totalSet = allGroups.reduce((s, g) => s + g.flags.filter((f) => f.set).length, 0);
  const totalFlags = allGroups.reduce((s, g) => s + g.flags.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>Launch runbook</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Single source of truth for flipping MEMTrak from preview to production. Click any command to copy.
        </p>
      </div>

      <Card glass title="Current deploy" subtitle={`${totalSet} of ${totalFlags} env vars set · auth gate ${status.auth_enabled ? 'ON' : 'OFF'}`}>
        <div className="flex items-center gap-2 text-xs">
          {status.auth_enabled ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-bold" style={{ color: '#8CC63F', background: 'color-mix(in srgb, #8CC63F 14%, transparent)' }}>
              <ShieldCheck className="w-3.5 h-3.5" /> Auth gate active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-bold" style={{ color: '#F5C542', background: 'color-mix(in srgb, #F5C542 14%, transparent)' }}>
              <AlertCircle className="w-3.5 h-3.5" /> Auth gate OFF — preview mode
            </span>
          )}
        </div>
      </Card>

      <Card glass title="Step 1 — Apply schema migrations" subtitle="In Supabase SQL Editor, run in this order">
        <ol className="space-y-2 text-xs">
          {MIGRATIONS.map((m, i) => (
            <li key={m.file} className="flex items-start gap-3 p-2.5 rounded-md" style={{ background: 'var(--input-bg)' }}>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold flex-shrink-0" style={{ color: '#fff', background: 'var(--accent)' }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <code className="text-[11px] font-mono font-bold" style={{ color: 'var(--heading)' }}>db/migrations/{m.file}</code>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.what}</div>
              </div>
              <Database className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
            </li>
          ))}
        </ol>
      </Card>

      {allGroups.map((group) => {
        const setCount = group.flags.filter((f) => f.set).length;
        const allSet = setCount === group.flags.length;
        const Icon = group.name.startsWith('Core') ? Database :
                     group.name.startsWith('NextAuth') ? ShieldCheck :
                     group.name.startsWith('Microsoft') ? Mail : Layers;
        return (
          <Card key={group.name} glass title={`Step 2 — ${group.name}`} subtitle={`${setCount}/${group.flags.length} set · ${allSet ? 'complete' : 'missing values'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Add via <code>vercel env add &lt;KEY&gt; production</code>
              </span>
            </div>
            <div className="space-y-1.5">
              {group.flags.map((f) => (
                <div key={f.key} className="flex items-center gap-3 p-2 rounded-md" style={{ background: 'var(--input-bg)' }}>
                  {f.set ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#8CC63F' }} />
                  ) : (
                    <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#D94A4A' }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <code className="text-[11px] font-mono font-bold" style={{ color: f.set ? 'var(--heading)' : 'var(--text-muted)' }}>{f.key}</code>
                    {f.hint && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{f.hint}</div>}
                  </div>
                  {!f.set && (
                    <button
                      onClick={() => copy(`vercel env add ${f.key} production`)}
                      title="Copy add command"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-all hover:scale-110"
                      style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      <Card glass title="Step 3 — Bootstrap admin invite" subtitle="Already seeded in the migration, but re-runnable">
        <pre className="text-[10px] font-mono p-3 rounded-md overflow-x-auto" style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-muted)' }}>{`insert into public.memtrak_invites (email, role, invited_by, note)
values ('vscott@alta.org', 'admin', 'system', 'Bootstrap admin')
on conflict (email) do update set role = 'admin', revoked_at = null;`}</pre>
      </Card>

      <Card glass title="Step 4 — Smoke tests" subtitle="Run after every production deploy">
        <div className="space-y-1.5">
          {SMOKE_TESTS.map((t) => (
            <div key={t.label} className="flex items-center gap-3 p-2 rounded-md" style={{ background: 'var(--input-bg)' }}>
              <Terminal className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{t.label}</div>
                <code className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{t.cmd}</code>
              </div>
              <button
                onClick={() => copy(t.cmd)}
                title="Copy"
                className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-all hover:scale-110"
                style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card glass title="Step 5 — Flip the gate" subtitle="Final step — only after everything above is green">
        <div className="space-y-2 text-xs">
          <p style={{ color: 'var(--text-muted)' }}>
            When all NextAuth env vars are set and migrations are applied, set:
          </p>
          <div className="flex items-center gap-2 p-2 rounded-md" style={{ background: 'var(--input-bg)' }}>
            <KeyRound className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
            <code className="flex-1 text-[11px] font-mono" style={{ color: 'var(--heading)' }}>vercel env add MEMTRAK_AUTH_ENABLED production  # → &quot;true&quot;</code>
            <button onClick={() => copy('vercel env add MEMTRAK_AUTH_ENABLED production')} aria-label="Copy command" className="icon-btn rounded-md" style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}>
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
            Redeploy to take effect. Sign in via <a href="/login" className="underline" style={{ color: 'var(--accent)' }}>/login <ExternalLink className="inline w-2.5 h-2.5" /></a> with vscott@alta.org — Resend magic link should arrive within 30s.
          </p>
        </div>
      </Card>
    </div>
  );
}
