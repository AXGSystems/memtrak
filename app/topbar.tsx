'use client';

import { usePathname } from 'next/navigation';
import { Printer } from 'lucide-react';
import { memtrakPrint } from '@/lib/print';

const pageNames: Record<string, string> = {
  '/': 'Daily Briefing',
  '/campaigns': 'Campaigns',
  '/campaign-builder': 'Campaign Builder',
  '/ab-testing': 'A/B Testing',
  '/renewals': 'Renewal Campaign',
  '/new-members': 'New Member Onboarding',
  '/intelligence': 'Intelligence',
  '/journey': 'Member Journey',
  '/deliverability': 'Deliverability',
  '/log': 'Communication Log',
  '/hygiene': 'Address Hygiene',
  '/scanner': 'Mail Scanner',
  '/generator': 'Code Generator',
  '/audit': 'Email Audit',
  '/roadmap': 'Tracking Roadmap',
  '/security': 'Security Dashboard',
  '/scoring': 'Engagement Scoring & LTV',
  '/spam-check': 'Spam Pre-Check',
  '/workflows': 'Automated Workflows',
  '/briefing': 'Email Briefing',
  '/ads': 'Ad Dashboard',
  '/ads/inventory': 'Ad Inventory',
  '/ads/request': 'Request Slot',
};

export default function TopBar() {
  const pathname = usePathname();
  const title = pageNames[pathname] || 'MEMTrak';

  return (
    <div className="sticky top-0 z-40 px-6 py-2.5 flex items-center justify-between border-b no-print" style={{ background: 'var(--background)', borderColor: 'var(--card-border)' }}>
      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
      <button
        onClick={() => memtrakPrint(title)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
        style={{ color: 'var(--accent)', border: '1px solid var(--card-border)' }}
      >
        <Printer className="w-3.5 h-3.5" /> Print {title}
      </button>
    </div>
  );
}
