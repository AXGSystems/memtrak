'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ShieldCheck, Eye, User as UserIcon } from 'lucide-react';

type AuthRole = 'admin' | 'staff' | 'read-only';
type Me = { enabled: boolean; role?: AuthRole | null };

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
  const router = useRouter();
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

  const logout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <div className="hidden md:block w-px h-4" style={{ background: 'var(--card-border)' }} />
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}>
        <Icon className="w-3 h-3" />
        {me.role}
      </div>
      <button
        onClick={logout}
        disabled={loggingOut}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80 disabled:opacity-50"
        style={{ color: 'var(--text-muted)', border: '1px solid var(--card-border)' }}
        title="Sign out"
      >
        <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign out</span>
      </button>
    </>
  );
}
