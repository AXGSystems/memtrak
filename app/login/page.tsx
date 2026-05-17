'use client';

import { useState, Suspense, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, Loader2, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/';
  const errored = sp.get('error');
  const sent = sp.get('sent');

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    errored ? 'That email is not invited. Ask an admin to invite you.' : null,
  );
  const [success, setSuccess] = useState(Boolean(sent));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await signIn('resend', {
        email: email.trim().toLowerCase(),
        redirect: false,
        callbackUrl: next,
      });
      if (res?.error) {
        setError('Could not send the sign-in link. Try again or contact an admin.');
        return;
      }
      setSuccess(true);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Network error.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, #8CC63F 14%, transparent)' }}>
            <CheckCircle2 className="w-6 h-6" style={{ color: '#8CC63F' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--heading)' }}>Check your inbox</h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              We sent a sign-in link to <strong style={{ color: 'var(--heading)' }}>{email || 'your email'}</strong>.<br />
              The link expires in 24 hours.
            </p>
          </div>
          <button
            onClick={() => { setSuccess(false); setEmail(''); }}
            className="text-[11px] underline"
            style={{ color: 'var(--accent)' }}
          >
            Use a different email
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Email</span>
          <div className="mt-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@alta.org"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm border focus:outline-none focus:ring-2"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }}
            />
          </div>
        </label>

        {error && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'color-mix(in srgb, #D94A4A 12%, transparent)', color: '#D94A4A', border: '1px solid color-mix(in srgb, #D94A4A 30%, transparent)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !email}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: 'white', background: 'linear-gradient(135deg, #4A90D9, #a855f7)' }}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {submitting ? 'Sending link…' : 'Email me a sign-in link'}
        </button>
      </form>

      <p className="text-[10px] text-center mt-6" style={{ color: 'var(--text-muted)' }}>
        Access is invite-only. Roles are assigned by an admin when you&apos;re invited.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
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
        {children}
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
