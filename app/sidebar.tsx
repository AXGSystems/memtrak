'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap, Send, TrendingUp, Shield, ClipboardCheck, MessageSquare,
  Activity, Mail, Map, Camera, PlusCircle, GitBranch, Users,
  Calendar, UserPlus, FileText, BarChart3, Target, Layers, Lock,
} from 'lucide-react';

const sections = [
  {
    label: 'Overview', items: [
      { label: 'Daily Briefing', href: '/', icon: Zap },
      { label: 'Email Briefing', href: '/briefing', icon: FileText },
    ]
  },
  {
    label: 'Campaigns', items: [
      { label: 'All Campaigns', href: '/campaigns', icon: Send },
      { label: 'Campaign Builder', href: '/campaign-builder', icon: PlusCircle },
      { label: 'A/B Testing', href: '/ab-testing', icon: GitBranch },
      { label: 'Renewal Season', href: '/renewals', icon: Calendar },
      { label: 'New Member Onboarding', href: '/new-members', icon: UserPlus },
    ]
  },
  {
    label: 'Intelligence', items: [
      { label: 'Analytics', href: '/intelligence', icon: TrendingUp },
      { label: 'Member Journey', href: '/journey', icon: Users },
      { label: 'Deliverability', href: '/deliverability', icon: Activity },
    ]
  },
  {
    label: 'Operations', items: [
      { label: 'Communication Log', href: '/log', icon: MessageSquare },
      { label: 'Address Hygiene', href: '/hygiene', icon: Shield },
      { label: 'Mail Scanner', href: '/scanner', icon: Camera },
    ]
  },
  {
    label: 'Advertising (Revive)', items: [
      { label: 'Ad Dashboard', href: '/ads', icon: BarChart3 },
      { label: 'Inventory Calendar', href: '/ads/inventory', icon: Layers },
      { label: 'Request a Slot', href: '/ads/request', icon: Target },
    ]
  },
  {
    label: 'Setup', items: [
      { label: 'Code Generator', href: '/generator', icon: Mail },
      { label: 'Email Audit', href: '/audit', icon: ClipboardCheck },
      { label: 'Tracking Roadmap', href: '/roadmap', icon: Map },
      { label: 'Security', href: '/security', icon: Lock },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const themes = [
    { id: 'deep-blue', label: 'Midnight', color: '#0f1d2f', ring: '#8CC63F' },
    { id: 'vibranium', label: 'Vibranium', color: '#14082a', ring: '#a855f7' },
    { id: 'ember', label: 'Ember', color: '#261a0e', ring: '#F59E0B' },
    { id: 'axg', label: 'AXG Gold', color: '#f8f7f4', ring: '#C6A75E' },
    { id: 'light', label: 'ALTA Brand', color: '#f0f2f5', ring: '#D94A4A' },
  ];

  const [currentTheme, setCurrentTheme] = useState('deep-blue');

  const switchTheme = (id: string) => {
    document.documentElement.setAttribute('data-theme', id);
    localStorage.setItem('memtrak-theme', id);
    setCurrentTheme(id);
  };

  // Apply saved theme on mount — client only
  useEffect(() => {
    const saved = localStorage.getItem('memtrak-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
      setCurrentTheme(saved);
    }
  }, []);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 border-r flex flex-col z-50 overflow-hidden transition-colors duration-300" style={{ background: 'var(--sidebar-bg)', borderColor: 'var(--card-border)' }}>
      <div className="px-4 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-sm" style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)' }}>M</div>
          <div>
            <div className="font-bold text-sm" style={{ color: 'var(--heading)' }}>MEMTrak</div>
            <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>Email Intelligence Platform</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-2 px-2 space-y-3 overflow-y-auto">
        {sections.map(section => (
          <div key={section.label}>
            <div className="text-[9px] uppercase tracking-widest font-semibold px-3 py-1" style={{ color: 'var(--sidebar-text)' }}>{section.label}</div>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${active ? 'border-r-2' : 'hover:bg-white/5'}`} style={active ? { background: 'var(--sidebar-active)', color: 'var(--accent)', borderColor: 'var(--accent)' } : { color: 'var(--sidebar-text)' }}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Theme switcher */}
      <div className="px-3 py-2 border-t flex-shrink-0" style={{ borderColor: 'var(--card-border)' }}>
        <div className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--sidebar-text)' }}>Theme</div>
        <div className="flex gap-1.5">
          {themes.map(t => (
            <button key={t.id} onClick={() => switchTheme(t.id)} title={t.label}
              className={`w-7 h-7 rounded-full border-2 transition-all ${currentTheme === t.id ? 'scale-110' : 'opacity-50 hover:opacity-90'}`}
              style={{ background: t.color, borderColor: currentTheme === t.id ? t.ring : 'rgba(128,128,128,0.3)', boxShadow: currentTheme === t.id ? `0 0 8px ${t.ring}40` : 'none' }}
            />
          ))}
        </div>
      </div>

      <div className="px-4 py-2 border-t flex-shrink-0" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
          <span style={{ color: 'var(--text-muted)' }}>20 pages · 13 APIs</span>
        </div>
      </div>
    </aside>
  );
}
