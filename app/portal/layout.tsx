'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User as UserIcon, Calendar, Receipt, LogOut, Shield } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV: NavLink[] = [
  { href: '/portal',          label: 'Overview', icon: LayoutDashboard },
  { href: '/portal/profile',  label: 'My profile', icon: UserIcon },
  { href: '/portal/events',   label: 'Events',  icon: Calendar },
  { href: '/portal/invoices', label: 'Invoices', icon: Receipt },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  async function logout() {
    try {
      const csrf = await fetch('/api/auth/csrf').then((r) => r.json()).catch(() => null);
      if (csrf?.csrfToken) {
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ csrfToken: csrf.csrfToken, callbackUrl: '/login' }).toString(),
        });
      }
    } finally {
      window.location.href = '/login';
    }
  }

  return (
    <div
      className="flex flex-col"
      style={{
        background: 'var(--background)',
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        overflowY: 'auto',
      }}
    >
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--card)', borderBottom: '1px solid var(--card-border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4A90D9, #a855f7)' }}
          >
            <Shield className="w-4 h-4" style={{ color: '#fff' }} />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>ALTA Member Portal</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Powered by MEMTrak</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-semibold transition-all hover:opacity-80"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--card-border)' }}
        >
          <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign out</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full">
        <nav className="lg:w-56 lg:flex-shrink-0 p-3 lg:p-4">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {NAV.map((l) => {
              const Icon = l.icon;
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all"
                  style={{
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    background: active ? 'color-mix(in srgb, var(--accent) 14%, transparent)' : 'transparent',
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" /> {l.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <main className="flex-1 px-4 pb-8">{children}</main>
      </div>
    </div>
  );
}
