'use client';

import Link from 'next/link';
import Card from '@/components/Card';
import { ChevronRight, BarChart3, Users, DollarSign, Activity, Map as MapIcon, Calendar } from 'lucide-react';
import { REPORT_PRESETS } from '@/lib/reports';

const CATEGORY_ICON: Record<string, typeof BarChart3> = {
  Membership: Users,
  Finance: DollarSign,
  Engagement: Activity,
  Governance: BarChart3,
};

const CATEGORY_COLOR: Record<string, string> = {
  Membership: '#4A90D9',
  Finance: '#8CC63F',
  Engagement: '#a855f7',
  Governance: '#F5C542',
};

const CATEGORY_ORDER: Array<'Membership' | 'Finance' | 'Engagement' | 'Governance'> = ['Membership', 'Finance', 'Engagement', 'Governance'];

export default function ReportsLibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
          Reports
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Pre-built reports across membership, finance, engagement, and governance. Each is printable, exportable, and runs against live data.
        </p>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const presets = REPORT_PRESETS.filter((p) => p.category === cat);
        if (!presets.length) return null;
        const Icon = CATEGORY_ICON[cat];
        const color = CATEGORY_COLOR[cat];
        return (
          <div key={cat}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color }}>
              <Icon className="w-3.5 h-3.5" />
              {cat}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {presets.map((p) => (
                <Link key={p.slug} href={`/reports/${p.slug}`} className="block transition-all hover:translate-y-[-2px]">
                  <Card glass>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{p.title}</h3>
                        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{p.subtitle}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
