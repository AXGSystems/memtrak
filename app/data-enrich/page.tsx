'use client';

import { useState } from 'react';
import {
  Database, UserCheck, BarChart3, Layers, TrendingUp, CheckCircle2,
  XCircle, AlertTriangle, X, ArrowRight, Search, Zap, Globe,
} from 'lucide-react';
import SparkKpi from '@/components/SparkKpi';
import Card from '@/components/Card';
import ClientChart from '@/components/ClientChart';

/* ── Palette ── */
const C = {
  green: '#8CC63F',
  red: '#D94A4A',
  amber: '#E8923F',
  blue: '#4A90D9',
  purple: '#9B6DD7',
  gray: '#6B7A8D',
  navy: '#1B3A5C',
};

/* ── Data completeness fields ── */
const completenessFields = [
  { field: 'Email', coverage: 98.2, total: 18400, filled: 18068, color: C.green },
  { field: 'Phone', coverage: 72.4, total: 18400, filled: 13322, color: C.amber },
  { field: 'Address', coverage: 85.6, total: 18400, filled: 15750, color: C.blue },
  { field: 'Title', coverage: 64.1, total: 18400, filled: 11794, color: C.amber },
  { field: 'Company Size', coverage: 48.3, total: 18400, filled: 8887, color: C.red },
  { field: 'Industry', coverage: 71.8, total: 18400, filled: 13211, color: C.amber },
  { field: 'Social Profiles', coverage: 35.2, total: 18400, filled: 6477, color: C.red },
];

const overallCompleteness = Math.round(
  completenessFields.reduce((s, f) => s + f.coverage, 0) / completenessFields.length
);

/* ── Enrichment sources ── */
const enrichmentSources = [
  {
    name: 'ZoomInfo',
    icon: Search,
    color: C.blue,
    status: 'active',
    fieldsProvided: ['Title', 'Company Size', 'Industry', 'Phone', 'Revenue'],
    matchRate: 82,
    lastSync: '2 hours ago',
    records: 8420,
    description: 'Enterprise B2B contact and company intelligence platform. Primary source for firmographic data including company size, revenue, and industry classification.',
  },
  {
    name: 'Clearbit',
    icon: Globe,
    color: C.green,
    status: 'active',
    fieldsProvided: ['Social Profiles', 'Company Size', 'Industry', 'Tech Stack'],
    matchRate: 74,
    lastSync: '6 hours ago',
    records: 6850,
    description: 'Real-time enrichment API providing company and person data. Strong for social profiles, technology stack, and digital footprint data.',
  },
  {
    name: 'FullContact',
    icon: UserCheck,
    color: C.purple,
    status: 'active',
    fieldsProvided: ['Social Profiles', 'Phone', 'Address', 'Demographics'],
    matchRate: 68,
    lastSync: '12 hours ago',
    records: 5280,
    description: 'Identity resolution and person enrichment platform. Best for matching fragmented identity data and filling social profile gaps.',
  },
];

/* ── Recent enrichment activity log ── */
const activityLog = [
  { timestamp: '2026-04-14 08:42', action: 'Batch enrichment completed', source: 'ZoomInfo', records: 342, fields: 1890, status: 'success' },
  { timestamp: '2026-04-14 06:15', action: 'Social profile sync', source: 'Clearbit', records: 215, fields: 645, status: 'success' },
  { timestamp: '2026-04-13 22:00', action: 'Nightly address verification', source: 'FullContact', records: 180, fields: 540, status: 'success' },
  { timestamp: '2026-04-13 14:30', action: 'New member enrichment', source: 'ZoomInfo', records: 12, fields: 84, status: 'success' },
  { timestamp: '2026-04-13 09:00', action: 'Company size update batch', source: 'ZoomInfo', records: 520, fields: 520, status: 'partial' },
  { timestamp: '2026-04-12 20:00', action: 'Phone number verification', source: 'FullContact', records: 890, fields: 890, status: 'success' },
  { timestamp: '2026-04-12 14:15', action: 'Industry classification refresh', source: 'Clearbit', records: 1200, fields: 1200, status: 'success' },
  { timestamp: '2026-04-12 08:00', action: 'Batch enrichment completed', source: 'ZoomInfo', records: 410, fields: 2050, status: 'success' },
];

/* ── Before/After sample member ── */
const sampleMember = {
  name: 'Jennifer Martinez',
  org: 'Pacific Coast Title Group',
  type: 'ACA',
  before: {
    email: 'jmartinez@pctitle.com',
    phone: '—',
    address: '1200 Pacific Ave, San Diego, CA',
    title: '—',
    companySize: '—',
    industry: '—',
    social: '—',
  },
  after: {
    email: 'jmartinez@pctitle.com',
    phone: '(619) 555-0142',
    address: '1200 Pacific Ave, Suite 300, San Diego, CA 92101',
    title: 'VP of Operations',
    companySize: '50-200 employees',
    industry: 'Title Insurance & Escrow',
    social: 'linkedin.com/in/jmartinez-pct',
  },
  enrichedBy: 'ZoomInfo + Clearbit',
  enrichedDate: '2026-04-10',
};

/* ── Coverage trend chart ── */
const coverageTrendData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [
    {
      label: 'Overall Completeness %',
      data: [58, 62, 66, overallCompleteness],
      borderColor: C.green,
      backgroundColor: `${C.green}20`,
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: C.green,
      borderWidth: 2,
    },
  ],
};

/* ── Enrichment by field chart ── */
const fieldChartData = {
  labels: completenessFields.map(f => f.field),
  datasets: [{
    label: 'Coverage %',
    data: completenessFields.map(f => f.coverage),
    backgroundColor: completenessFields.map(f => `${f.color}cc`),
    borderWidth: 0,
    borderRadius: 6,
  }],
};

/* ── Source detail modal ── */
function SourceModal({ source, onClose }: { source: typeof enrichmentSources[0]; onClose: () => void }) {
  const Icon = source.icon;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in srgb, ${source.color} 15%, transparent)` }}>
              <Icon className="w-4 h-4" style={{ color: source.color }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{source.name}</h3>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Enrichment Source</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] px-2.5 py-1 rounded-full font-bold"
              style={{ background: `color-mix(in srgb, ${C.green} 15%, transparent)`, color: C.green }}
            >
              {source.status}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Last sync: {source.lastSync}</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{source.description}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Match Rate</p>
              <p className="text-lg font-extrabold" style={{ color: source.color }}>{source.matchRate}%</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Records Enriched</p>
              <p className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{source.records.toLocaleString()}</p>
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Fields Provided</p>
            <div className="flex flex-wrap gap-1.5">
              {source.fieldsProvided.map(f => (
                <span key={f} className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: `color-mix(in srgb, ${source.color} 10%, transparent)`, color: source.color }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function DataEnrich() {
  const [selectedSource, setSelectedSource] = useState<typeof enrichmentSources[0] | null>(null);

  return (
    <div className="p-6 space-y-6">

      {/* ── 1. Branded Header ── */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #8CC63F, #1B6B3A)',
            boxShadow: '0 4px 20px rgba(140,198,63,0.3)',
          }}
        >
          <Database className="w-6 h-6" style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            DataEnrich<span className="text-[10px] align-super font-bold" style={{ color: 'var(--text-muted)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Complete the picture for every member.
          </p>
        </div>
      </div>

      {/* ── 2. SparkKpi Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <SparkKpi
          label="Members Enriched"
          value="14,280"
          sub="Of 18,400 total members"
          icon={UserCheck}
          color={C.green}
          sparkData={[11200, 12100, 13000, 13800, 14280]}
          sparkColor={C.green}
          trend={{ value: 12.4, label: 'vs last month' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Members with at least one enriched field beyond basic contact information.
                Enrichment sources include ZoomInfo, Clearbit, and FullContact.
              </p>
              <div className="space-y-2">
                {enrichmentSources.map(s => (
                  <div key={s.name} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{s.name}</span>
                    <span className="text-[11px] font-bold" style={{ color: s.color }}>{s.records.toLocaleString()} records</span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Data Completeness %"
          value={`${overallCompleteness}%`}
          sub="Average across all tracked fields"
          icon={BarChart3}
          color={C.blue}
          sparkData={[58, 62, 64, 66, 68, overallCompleteness]}
          sparkColor={C.blue}
          trend={{ value: 8.2, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Fields Added This Month"
          value="8,764"
          sub="Individual data points enriched in April"
          icon={Layers}
          color={C.purple}
          sparkData={[5200, 6100, 7400, 8764]}
          sparkColor={C.purple}
          trend={{ value: 18.4, label: 'vs last month' }}
          accent
        />
        <SparkKpi
          label="Enrichment Sources"
          value="3"
          sub="Active integrations syncing data"
          icon={Zap}
          color={C.amber}
          sparkData={[2, 2, 3, 3, 3]}
          sparkColor={C.amber}
          accent
        />
      </div>

      {/* ── 3. Data Completeness Heatmap ── */}
      <Card
        title="Data Completeness by Field"
        subtitle="Coverage percentage for each tracked data field across all 18,400 members"
        detailTitle="Field Coverage Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Detailed breakdown of data completeness across all tracked fields. Email is nearly universal,
              while social profiles and company size have the most gaps. Enrichment efforts are prioritized
              by field impact on campaign personalization.
            </p>
            {completenessFields.map(f => (
              <div key={f.field} className="p-3 rounded-lg border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{f.field}</span>
                  <span className="text-xs font-extrabold" style={{ color: f.color }}>{f.coverage}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden mb-1" style={{ background: 'var(--card-border)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${f.coverage}%`, background: f.color }} />
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {f.filled.toLocaleString()} of {f.total.toLocaleString()} members &middot; {(f.total - f.filled).toLocaleString()} gaps remaining
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          {completenessFields.map(f => (
            <div key={f.field} className="flex items-center gap-4">
              <span className="text-[10px] font-bold w-24 flex-shrink-0 text-right" style={{ color: 'var(--text-muted)' }}>{f.field}</span>
              <div className="flex-1 h-6 rounded-lg overflow-hidden relative" style={{ background: 'var(--card-border)' }}>
                <div
                  className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                  style={{ width: `${f.coverage}%`, background: `color-mix(in srgb, ${f.color} 25%, transparent)` }}
                >
                  <span className="text-[9px] font-extrabold" style={{ color: f.color }}>{f.coverage}%</span>
                </div>
              </div>
              <div className="flex items-center gap-1 w-10 flex-shrink-0">
                {f.coverage >= 80 ? (
                  <CheckCircle2 className="w-3.5 h-3.5" style={{ color: C.green }} />
                ) : f.coverage >= 60 ? (
                  <AlertTriangle className="w-3.5 h-3.5" style={{ color: C.amber }} />
                ) : (
                  <XCircle className="w-3.5 h-3.5" style={{ color: C.red }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 4. Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Coverage Trend" subtitle="Overall data completeness improvement over time">
          <ClientChart
            type="line"
            data={coverageTrendData}
            height={260}
            options={{
              plugins: { legend: { display: false } },
              scales: {
                y: { min: 40, max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => `${v}%` } },
                x: { grid: { display: false }, ticks: { color: '#8899aa' } },
              },
            }}
          />
          <div className="mt-3 p-2.5 rounded-lg" style={{ background: `color-mix(in srgb, ${C.green} 8%, transparent)` }}>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="font-bold" style={{ color: C.green }}>+{overallCompleteness - 58}% improvement</span> since January. Enrichment cadence increased to daily batch processing in March.
            </p>
          </div>
        </Card>

        <Card title="Coverage by Field" subtitle="Side-by-side comparison of field completeness">
          <ClientChart
            type="bar"
            data={fieldChartData}
            height={260}
            options={{
              plugins: { legend: { display: false } },
              scales: {
                y: { min: 0, max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => `${v}%` } },
                x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 10 } } },
              },
            }}
          />
        </Card>
      </div>

      {/* ── 5. Enrichment Sources ── */}
      <Card title="Enrichment Sources" subtitle="Active integrations powering data enrichment">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {enrichmentSources.map(source => {
            const Icon = source.icon;
            return (
              <div
                key={source.name}
                className="p-4 rounded-xl border cursor-pointer transition-all hover:translate-y-[-2px]"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', borderTopWidth: '3px', borderTopColor: source.color }}
                onClick={() => setSelectedSource(source)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in srgb, ${source.color} 12%, transparent)` }}>
                    <Icon className="w-4 h-4" style={{ color: source.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{source.name}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${C.green} 15%, transparent)`, color: C.green }}>{source.status}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Match Rate</div>
                    <div className="text-sm font-extrabold" style={{ color: source.color }}>{source.matchRate}%</div>
                  </div>
                  <div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Records</div>
                    <div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>{source.records.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {source.fieldsProvided.slice(0, 3).map(f => (
                    <span key={f} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${source.color} 8%, transparent)`, color: source.color }}>
                      {f}
                    </span>
                  ))}
                  {source.fieldsProvided.length > 3 && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
                      +{source.fieldsProvided.length - 3}
                    </span>
                  )}
                </div>
                <div className="text-[8px] mt-3 font-semibold" style={{ color: 'var(--accent)' }}>Click for details</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── 6. Before/After Comparison ── */}
      <Card title="Enrichment Before & After" subtitle={`Sample member: ${sampleMember.name} — ${sampleMember.org}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Before */}
          <div className="p-4 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4" style={{ color: C.red }} />
              <span className="text-xs font-bold" style={{ color: C.red }}>Before Enrichment</span>
            </div>
            <div className="space-y-2">
              {Object.entries(sampleMember.before).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <span className="text-[10px] font-bold capitalize" style={{ color: 'var(--text-muted)' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className={`text-[10px] ${val === '—' ? 'font-bold' : ''}`} style={{ color: val === '—' ? C.red : 'var(--heading)' }}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div className="p-4 rounded-xl border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4" style={{ color: C.green }} />
              <span className="text-xs font-bold" style={{ color: C.green }}>After Enrichment</span>
            </div>
            <div className="space-y-2">
              {Object.entries(sampleMember.after).map(([key, val]) => {
                const beforeVal = sampleMember.before[key as keyof typeof sampleMember.before];
                const isNew = beforeVal === '—';
                const isUpdated = beforeVal !== val && !isNew;
                return (
                  <div key={key} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <span className="text-[10px] font-bold capitalize" style={{ color: 'var(--text-muted)' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]" style={{ color: isNew ? C.green : isUpdated ? C.blue : 'var(--heading)' }}>{val}</span>
                      {isNew && <span className="text-[8px] font-bold px-1 py-0.5 rounded" style={{ background: `color-mix(in srgb, ${C.green} 15%, transparent)`, color: C.green }}>NEW</span>}
                      {isUpdated && <span className="text-[8px] font-bold px-1 py-0.5 rounded" style={{ background: `color-mix(in srgb, ${C.blue} 15%, transparent)`, color: C.blue }}>UPDATED</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-2 flex items-center gap-2" style={{ borderTop: '1px solid var(--card-border)' }}>
              <Zap className="w-3 h-3" style={{ color: C.amber }} />
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Enriched by {sampleMember.enrichedBy} on {sampleMember.enrichedDate}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 7. Activity Log ── */}
      <Card
        title="Recent Enrichment Activity"
        subtitle="Latest enrichment jobs and sync events"
        detailTitle="Full Activity Log"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Complete log of all enrichment activity including batch processes, real-time syncs,
              and verification jobs. Enrichment runs on a daily cadence with real-time processing for new members.
            </p>
            {activityLog.map((entry, i) => (
              <div key={i} className="p-3 rounded-lg border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{entry.action}</span>
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${entry.status === 'success' ? C.green : C.amber} 15%, transparent)`,
                      color: entry.status === 'success' ? C.green : C.amber,
                    }}
                  >
                    {entry.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  <span>{entry.timestamp}</span>
                  <span>{entry.source}</span>
                  <span>{entry.records} records</span>
                  <span>{entry.fields} fields</span>
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {['Timestamp', 'Action', 'Source', 'Records', 'Fields', 'Status'].map(h => (
                  <th key={h} className="text-[9px] uppercase tracking-wider font-bold pb-3 pr-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activityLog.slice(0, 6).map((entry, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td className="py-2.5 pr-4 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{entry.timestamp}</td>
                  <td className="py-2.5 pr-4 text-xs font-medium" style={{ color: 'var(--heading)' }}>{entry.action}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `color-mix(in srgb, ${entry.source === 'ZoomInfo' ? C.blue : entry.source === 'Clearbit' ? C.green : C.purple} 12%, transparent)`,
                        color: entry.source === 'ZoomInfo' ? C.blue : entry.source === 'Clearbit' ? C.green : C.purple,
                      }}
                    >
                      {entry.source}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-xs font-bold" style={{ color: 'var(--heading)' }}>{entry.records}</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ color: 'var(--text-muted)' }}>{entry.fields}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `color-mix(in srgb, ${entry.status === 'success' ? C.green : C.amber} 15%, transparent)`,
                        color: entry.status === 'success' ? C.green : C.amber,
                      }}
                    >
                      {entry.status === 'success' ? 'Success' : 'Partial'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Source Modal ── */}
      {selectedSource && <SourceModal source={selectedSource} onClose={() => setSelectedSource(null)} />}
    </div>
  );
}
