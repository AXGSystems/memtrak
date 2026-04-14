'use client';

import { useState } from 'react';
import { Users, Plus, Filter, Download, CheckCircle } from 'lucide-react';
import { exportCSV } from '@/lib/export-utils';

const prebuiltSegments = [
  { id: 'all', name: 'All Members', count: 4994, desc: 'Every active ALTA member', filters: ['Status = Active'] },
  { id: 'aca', name: 'ACA Title Agents', count: 3208, desc: 'Largest segment — 64% of membership', filters: ['Type = ACA'] },
  { id: 'acu', name: 'ACU Underwriters', count: 40, desc: 'Highest-value: $61K avg dues', filters: ['Type = ACU'] },
  { id: 'rea', name: 'REA Attorneys', count: 926, desc: 'Real estate attorneys acting as agents', filters: ['Type = REA'] },
  { id: 'new-2026', name: 'New Members 2026', count: 566, desc: 'Joined this year — in onboarding', filters: ['Join Year = 2026'] },
  { id: 'high-engage', name: 'Champions (Score 90+)', count: 420, desc: 'Most engaged — ask for referrals + TIPAC', filters: ['Engagement Score >= 90'] },
  { id: 'at-risk', name: 'At Risk (Score 25-49)', count: 860, desc: 'Declining engagement — win-back needed', filters: ['Engagement Score >= 25', 'Engagement Score < 50'] },
  { id: 'gone-dark', name: 'Gone Dark (Score 0-24)', count: 344, desc: 'No engagement 90+ days', filters: ['Engagement Score < 25'] },
  { id: 'non-compliant', name: 'Non-Compliant Orgs', count: 7108, desc: 'No PFL or membership', filters: ['PFL Status = Non-Compliant'] },
  { id: 'renewal-q4', name: 'Renewal Due Q4', count: 1200, desc: 'Renewing Oct-Dec 2026', filters: ['Renewal Date >= 2026-10-01', 'Renewal Date <= 2026-12-31'] },
  { id: 'bounced', name: 'Bounced Addresses', count: 680, desc: 'Remove before next send', filters: ['Bounce Count >= 2'] },
  { id: 'stale', name: 'Stale (6mo+ no opens)', count: 2800, desc: 'Re-engage or purge', filters: ['Last Open > 180 days ago'] },
];

// Custom segment builder filters
const filterOptions = [
  { field: 'Member Type', operators: ['is', 'is not'], values: ['ACA', 'ACU', 'REA', 'ATXA', 'ACB', 'AS', 'REB', 'EM', 'HO', 'AST'] },
  { field: 'Engagement Score', operators: ['>=', '<=', '=', '>'], values: ['0', '25', '50', '70', '90', '100'] },
  { field: 'State', operators: ['is', 'is not'], values: ['FL', 'TX', 'CA', 'NY', 'PA', 'IL', 'OH', 'GA', 'VA', 'TN'] },
  { field: 'PFL Status', operators: ['is'], values: ['Compliant', 'Non-Compliant', 'N/A'] },
  { field: 'Dues Payment', operators: ['is'], values: ['Early', 'On-time', 'Late', 'Overdue'] },
  { field: 'Last Email Open', operators: ['within', 'more than'], values: ['7 days', '30 days', '90 days', '180 days', '365 days'] },
  { field: 'Events Attended (YTD)', operators: ['>=', '<=', '='], values: ['0', '1', '2', '3', '5', '10'] },
  { field: 'Join Year', operators: ['=', '>=', '<='], values: ['2020', '2021', '2022', '2023', '2024', '2025', '2026'] },
];

export default function Segments() {
  const [selected, setSelected] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderFilters, setBuilderFilters] = useState([{ field: '', operator: '', value: '' }]);

  const addFilter = () => setBuilderFilters(prev => [...prev, { field: '', operator: '', value: '' }]);

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Smart Segments</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Pre-built audience segments + custom segment builder with AND/OR logic — what ActiveCampaign charges $186/mo for. Target the right members with the right message.</p>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-6 stagger-children">
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--heading)' }}>{prebuiltSegments.length}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Pre-built Segments</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--heading)' }}>{filterOptions.length}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Filter Fields</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>∞</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Custom Combinations</div>
        </div>
      </div>

      {/* Pre-built Segments */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Pre-built Segments ({prebuiltSegments.length})</h3>
          <button onClick={() => setShowBuilder(!showBuilder)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--accent)', color: 'white' }}>
            <Plus className="w-3 h-3" /> Build Custom
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {prebuiltSegments.map(s => (
            <button key={s.id} onClick={() => setSelected(selected === s.id ? null : s.id)} className="text-left p-3.5 rounded-xl transition-all hover:translate-x-1" style={{ background: selected === s.id ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--background)', border: selected === s.id ? '1px solid var(--accent)' : '1px solid var(--card-border)' }}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{s.name}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">{s.filters.map(f => <span key={f} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}>{f}</span>)}</div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{s.count.toLocaleString()}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>members</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Segment Builder */}
      {showBuilder && (
        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-xs font-bold mb-4" style={{ color: 'var(--heading)' }}>Custom Segment Builder</h3>
          <div className="space-y-2 mb-4">
            {builderFilters.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: 'var(--accent)', color: 'white' }}>AND</span>}
                <select value={f.field} onChange={e => { const n = [...builderFilters]; n[i].field = e.target.value; setBuilderFilters(n); }} className="flex-1 px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--heading)' }}>
                  <option value="">Select field...</option>
                  {filterOptions.map(fo => <option key={fo.field} value={fo.field}>{fo.field}</option>)}
                </select>
                <select value={f.operator} onChange={e => { const n = [...builderFilters]; n[i].operator = e.target.value; setBuilderFilters(n); }} className="w-20 px-2 py-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--heading)' }}>
                  <option value="">op</option>
                  {f.field && filterOptions.find(fo => fo.field === f.field)?.operators.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <select value={f.value} onChange={e => { const n = [...builderFilters]; n[i].value = e.target.value; setBuilderFilters(n); }} className="flex-1 px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--heading)' }}>
                  <option value="">Select value...</option>
                  {f.field && filterOptions.find(fo => fo.field === f.field)?.values.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={addFilter} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border" style={{ borderColor: 'var(--card-border)', color: 'var(--heading)' }}><Plus className="w-3 h-3" /> Add Filter</button>
            <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold" style={{ background: 'var(--accent)', color: 'white' }}><Filter className="w-3 h-3" /> Preview Segment</button>
          </div>
        </div>
      )}
    </div>
  );
}
