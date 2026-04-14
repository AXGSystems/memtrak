'use client';

import { useState } from 'react';
import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import { Search, Users, DollarSign, TrendingUp, TrendingDown, Mail, Calendar, Shield } from 'lucide-react';

const C = { green: '#8CC63F', blue: '#4A90D9', red: '#D94A4A', orange: '#E8923F', navy: '#002D5C' };

const members = [
  { name: 'First American Title', type: 'ACU', state: 'FL', score: 94, dues: 61554, ltv: 308000, emails: 92, clicks: 45, events: 8, pfl: 'Compliant', renewal: 'Jan 2027', trend: 'stable', risk: 'Low', lastContact: 'Apr 10' },
  { name: 'Old Republic Title', type: 'ACU', state: 'OH', score: 82, dues: 61554, ltv: 246000, emails: 78, clicks: 32, events: 4, pfl: 'Compliant', renewal: 'Mar 2027', trend: 'stable', risk: 'Low', lastContact: 'Apr 3' },
  { name: 'Commonwealth Land Title', type: 'ACA', state: 'VA', score: 87, dues: 1216, ltv: 12160, emails: 88, clicks: 38, events: 5, pfl: 'Compliant', renewal: 'Feb 2027', trend: 'rising', risk: 'Low', lastContact: 'Apr 5' },
  { name: 'Stewart Title', type: 'ACU', state: 'TX', score: 58, dues: 61554, ltv: 184662, emails: 42, clicks: 12, events: 1, pfl: 'Compliant', renewal: 'May 2027', trend: 'declining', risk: 'High', lastContact: 'Mar 28' },
  { name: 'Liberty Title Group', type: 'ACA', state: 'TN', score: 65, dues: 1216, ltv: 8512, emails: 50, clicks: 18, events: 2, pfl: 'Compliant', renewal: 'Apr 2027', trend: 'declining', risk: 'Medium', lastContact: 'Apr 8' },
  { name: 'National Title Services', type: 'REA', state: 'GA', score: 38, dues: 441, ltv: 2646, emails: 30, clicks: 5, events: 0, pfl: 'Non-Compliant', renewal: 'Jun 2027', trend: 'declining', risk: 'High', lastContact: 'Apr 7' },
  { name: 'Heritage Abstract LLC', type: 'ACB', state: 'PA', score: 8, dues: 517, ltv: 1551, emails: 0, clicks: 0, events: 0, pfl: 'Non-Compliant', renewal: 'Sep 2026', trend: 'gone-dark', risk: 'Critical', lastContact: 'Apr 9 (bounced)' },
  { name: 'Fidelity National Title', type: 'ACU', state: 'CA', score: 76, dues: 61554, ltv: 246216, emails: 68, clicks: 28, events: 3, pfl: 'Compliant', renewal: 'Jan 2027', trend: 'stable', risk: 'Low', lastContact: 'Apr 7' },
  { name: 'Chicago Title Insurance', type: 'ACU', state: 'IL', score: 90, dues: 61554, ltv: 308000, emails: 90, clicks: 42, events: 6, pfl: 'Compliant', renewal: 'Feb 2027', trend: 'stable', risk: 'Low', lastContact: 'Apr 10' },
  { name: 'WFG National Title', type: 'ACU', state: 'OR', score: 72, dues: 61554, ltv: 184662, emails: 62, clicks: 22, events: 2, pfl: 'Compliant', renewal: 'Apr 2027', trend: 'stable', risk: 'Low', lastContact: 'Mar 15' },
];

const riskColors: Record<string, string> = { Low: 'bg-green-500/20 text-green-400', Medium: 'bg-amber-500/20 text-amber-400', High: 'bg-red-500/20 text-red-400', Critical: 'bg-red-500/30 text-red-400' };
const trendIcons: Record<string, typeof TrendingUp> = { rising: TrendingUp, stable: TrendingUp, declining: TrendingDown, 'gone-dark': TrendingDown };

export default function MemberHealth() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof members[0] | null>(null);

  const filtered = search ? members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.type.includes(search.toUpperCase())) : members;
  const avgScore = Math.round(members.reduce((s, m) => s + m.score, 0) / members.length);

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Member Health Dashboard</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Single-pane view of every member&apos;s health — engagement, revenue, compliance, risk. What HubSpot calls &quot;Customer Health Score&quot; for $890/mo.</p>

      {/* Overview */}
      <div className="grid grid-cols-4 gap-3 mb-6 stagger-children">
        <div className="rounded-xl border p-4 flex items-center gap-3" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <ProgressRing value={avgScore} max={100} size={48} color={avgScore >= 70 ? C.green : C.orange} />
          <div><div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Avg Score</div><div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{avgScore}/100</div></div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-xl font-extrabold" style={{ color: C.green }}>{members.filter(m => m.risk === 'Low').length}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Healthy</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-xl font-extrabold" style={{ color: C.orange }}>{members.filter(m => m.risk === 'Medium' || m.risk === 'High').length}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>At Risk</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-xl font-extrabold" style={{ color: C.red }}>{members.filter(m => m.risk === 'Critical').length}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Critical</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or type (ACA, ACU, REA...)" className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl" style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--heading)' }} />
      </div>

      {/* Member Cards */}
      <div className="space-y-2">
        {filtered.map(m => {
          const TrendIcon = trendIcons[m.trend] || TrendingUp;
          return (
            <div key={m.name} onClick={() => setSelected(selected?.name === m.name ? null : m)} className="rounded-xl border p-4 transition-all hover:translate-y-[-1px] cursor-pointer" style={{ background: selected?.name === m.name ? 'color-mix(in srgb, var(--accent) 8%, var(--card))' : 'var(--card)', borderColor: selected?.name === m.name ? 'var(--accent)' : 'var(--card-border)' }}>
              <div className="flex items-center gap-4">
                {/* Score ring */}
                <ProgressRing value={m.score} max={100} size={48} color={m.score >= 70 ? C.green : m.score >= 40 ? C.orange : C.red} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{m.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--background)', color: 'var(--text-muted)' }}>{m.type} · {m.state}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${riskColors[m.risk]}`}>{m.risk}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span><Mail className="w-3 h-3 inline mr-0.5" />{m.emails}% opens</span>
                    <span><Calendar className="w-3 h-3 inline mr-0.5" />{m.events} events</span>
                    <span><Shield className="w-3 h-3 inline mr-0.5" />{m.pfl}</span>
                    <span>Renewal: {m.renewal}</span>
                  </div>
                </div>

                {/* Revenue */}
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-extrabold" style={{ color: 'var(--accent)' }}>${m.dues.toLocaleString()}</div>
                  <div className="flex items-center gap-1 justify-end">
                    <TrendIcon className="w-3 h-3" style={{ color: m.trend === 'rising' || m.trend === 'stable' ? C.green : C.red }} />
                    <span className="text-[9px]" style={{ color: m.trend === 'rising' || m.trend === 'stable' ? C.green : C.red }}>{m.trend}</span>
                  </div>
                </div>
              </div>

              {/* Expanded detail */}
              {selected?.name === m.name && (
                <div className="mt-4 pt-4 border-t grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                    <div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>5yr LTV</div>
                    <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>${m.ltv.toLocaleString()}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                    <div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Click Rate</div>
                    <div className="text-lg font-extrabold" style={{ color: m.clicks >= 30 ? C.green : C.orange }}>{m.clicks}%</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                    <div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Last Contact</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{m.lastContact}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                    <div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Renewal</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{m.renewal}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
