'use client';

import { usePathname } from 'next/navigation';
import { Printer } from 'lucide-react';
import { memtrakPrint } from '@/lib/print';

const pageNames: Record<string, string> = {
  '/': 'Daily Briefing',
  '/briefing': 'Email Briefing',
  '/roi-calc': 'ROI Calculator',
  '/campaigns': 'Campaigns',
  '/campaign-builder': 'Campaign Builder',
  '/ai-writer': 'AI Subject Writer',
  '/ab-testing': 'A/B Testing',
  '/calendar': 'Send Calendar',
  '/renewals': 'Renewal Campaign',
  '/new-members': 'New Member Onboarding',
  '/live-feed': 'Live Activity Feed',
  '/member-health': 'Member Health',
  '/compare': 'Campaign Compare',
  '/intelligence': 'Intelligence',
  '/scoring': 'Engagement Scoring & LTV',
  '/journey': 'Member Journey',
  '/segments': 'Smart Segments',
  '/heatmap': 'Click Heatmap',
  '/content-analysis': 'Content Performance',
  '/nps': 'Member NPS',
  '/benchmarks': 'Industry Benchmarks',
  '/forecast': 'Revenue Forecast',
  '/privacy-metrics': 'Privacy-First Metrics',
  '/workflows': 'Automated Workflows',
  '/deliverability': 'Deliverability',
  '/spam-check': 'Spam Pre-Check',
  '/hygiene': 'Address Hygiene',
  '/scanner': 'Mail Scanner',
  '/log': 'Communication Log',
  '/event-tracker': 'Event Tracker',
  '/templates': 'Email Templates',
  '/ads': 'Ad Dashboard',
  '/ads/inventory': 'Ad Inventory',
  '/ads/request': 'Request Slot',
  '/generator': 'Code Generator',
  '/api-docs': 'API Documentation',
  '/integrations': 'Integrations Hub',
  '/data-export': 'Data Export',
  '/whats-new': "What's New",
  '/audit': 'Email Audit',
  '/roadmap': 'Tracking Roadmap',
  '/security': 'Security Dashboard',
  '/status': 'System Status',
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
