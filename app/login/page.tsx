'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Loader2, AlertCircle, Shield } from 'lucide-react';

const ROLES = [
  { value: 'admin',     label: 'Admin',     desc: 'Full access — create/edit/delete' },
  { value: 'staff',     label: 'Staff',     desc: 'Standard read + write workflows' },
  { value: 'read-only', label: 'Read-only', desc: 'View only — no record changes' },
] as const;

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/';

  const [passphrase, setPassphrase] = useState('');
  const [role, setRole] = useState<'admin' | 'staff' | 'read-only'>('staff');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Login failed (${res.status}).`);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4A90D9, #a855f7)', boxShadow: '0 8px 32px rgba(74,144,217,0.3)' }}>
            <Shield className="w-6 h-6" style={{ color: 'white' }} />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-center" style={{ color: 'var(--heading)' }}>MEMTrak</h1>
        <p className="text-xs text-center mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>Sign in to continue</p>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Passphrase</span>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                autoFocus
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }}
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Role</span>
            <div className="mt-1 space-y-1.5">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className="w-full text-left flex items-center gap-3 p-2.5 rounded-lg transition-all"
                  style={{
                    background: role === r.value ? 'color-mix(in srgb, var(--accent) 14%, transparent)' : 'var(--input-bg)',
                    border: `1px solid ${role === r.value ? 'var(--accent)' : 'var(--card-border)'}`,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: role === r.value ? 'var(--accent)' : 'transparent', border: `2px solid ${role === r.value ? 'var(--accent)' : 'var(--card-border)'}` }}
                  />
                  <div className="flex-1">
                    <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{r.label}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </label>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'color-mix(in srgb, #D94A4A 12%, transparent)', color: '#D94A4A', border: '1px solid color-mix(in srgb, #D94A4A 30%, transparent)' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !passphrase}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: 'white', background: 'linear-gradient(135deg, #4A90D9, #a855f7)' }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-[10px] text-center mt-6" style={{ color: 'var(--text-muted)' }}>
          The role you select is enforced for this session. Sign out from the top bar to switch.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
