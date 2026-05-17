'use client';

import { useEffect, useState } from 'react';
import { LogOut, ShieldCheck, Eye, User as UserIcon } from 'lucide-react';

type AuthRole = 'admin' | 'staff' | 'read-only';
type Me = { enabled: boolean; email?: string | null; role?: AuthRole | null };

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

export default function AuthIndicator() {
  const [me, setMe] = useState<Me | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d: Me) => setMe(d))
      .catch(() => setMe({ enabled: false }));
  }, []);

  if (!me?.enabled || !me.role) return null;
  const Icon = ROLE_ICON[me.role];
  const color = ROLE_COLOR[me.role];

  // NextAuth signOut: POST to /api/auth/signout with CSRF token, then go to /login.
  // Using a plain form works for App Router without dragging next-auth/react into the client.
  const logout = async () => {
    setLoggingOut(true);
    try {
      const csrfRes = await fetch('/api/auth/csrf').then((r) => r.json());
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ csrfToken: csrfRes.csrfToken, callbackUrl: '/login' }).toString(),
      });
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <>
      <div className="hidden md:block w-px h-4" style={{ background: 'var(--card-border)' }} />
      <div
        className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
        style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
        title={me.email ?? undefined}
      >
        <Icon className="w-3 h-3" />
        {me.role}
      </div>
      <button
        onClick={logout}
        disabled={loggingOut}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
        style={{ color: 'var(--text-muted)', border: '1px solid var(--card-border)' }}
        title={`Sign out ${me.email ?? ''}`}
      >
        <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign out</span>
      </button>
    </>
  );
}
