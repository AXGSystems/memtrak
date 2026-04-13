'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap, Send, TrendingUp, Shield, ClipboardCheck, MessageSquare,
  Activity, Mail, Map, Camera, PlusCircle, GitBranch, Users,
  Calendar, UserPlus, FileText, BarChart3, Target, Layers,
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
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[#0a1628] border-r border-white/10 flex flex-col z-50 overflow-hidden">
      <div className="px-4 py-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#8CC63F]/20 flex items-center justify-center text-[#8CC63F] font-extrabold text-sm">M</div>
          <div>
            <div className="text-white font-bold text-sm">MEMTrak</div>
            <div className="text-white/30 text-[8px]">Email Intelligence Platform</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 py-2 px-2 space-y-3 overflow-y-auto">
        {sections.map(section => (
          <div key={section.label}>
            <div className="text-[9px] uppercase tracking-widest font-semibold text-white/30 px-3 py-1">{section.label}</div>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ${active ? 'bg-white/10 text-[#8CC63F] border-r-2 border-[#8CC63F]' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-[#8CC63F] animate-pulse" />
          <span className="text-white/40">20 pages · 13 APIs</span>
        </div>
        <div className="text-[9px] text-white/20 mt-1">MEMTrak v1.0 — Standalone</div>
      </div>
    </aside>
  );
}
