'use client';

import { useState } from 'react';
import {
  Inbox, ShieldCheck, AlertTriangle, BarChart3, Mail, Eye,
  TrendingUp, X, CheckCircle2, XCircle, HelpCircle, Clock,
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

/* ── Provider test results ── */
const providers = [
  { name: 'Gmail', icon: '📧', inbox: 92, spam: 5, missing: 3, trend: [88, 89, 90, 91, 92], color: C.green },
  { name: 'Outlook', icon: '📨', inbox: 88, spam: 8, missing: 4, trend: [82, 84, 85, 87, 88], color: C.blue },
  { name: 'Yahoo', icon: '📬', inbox: 85, spam: 10, missing: 5, trend: [80, 81, 83, 84, 85], color: C.purple },
  { name: 'Apple Mail', icon: '🍎', inbox: 96, spam: 2, missing: 2, trend: [93, 94, 95, 95, 96], color: C.green },
  { name: 'Proton', icon: '🔒', inbox: 78, spam: 14, missing: 8, trend: [72, 74, 75, 76, 78], color: C.amber },
  { name: 'AOL', icon: '📪', inbox: 82, spam: 12, missing: 6, trend: [78, 79, 80, 81, 82], color: C.amber },
];

/* ── Overall placement ── */
const overallPlacement = Math.round(providers.reduce((s, p) => s + p.inbox, 0) / providers.length);
const overallSpam = Math.round(providers.reduce((s, p) => s + p.spam, 0) / providers.length);

/* ── Historical test results ── */
const historicalTests = [
  { date: '2026-04-12', campaign: 'PFL Compliance — April Wave 3', score: 89, inbox: 91, spam: 6, missing: 3, status: 'passed' },
  { date: '2026-04-07', campaign: 'ALTA ONE Early Bird Registration', score: 92, inbox: 93, spam: 4, missing: 3, status: 'passed' },
  { date: '2026-04-01', campaign: 'Membership Renewal — April Batch', score: 87, inbox: 88, spam: 8, missing: 4, status: 'passed' },
  { date: '2026-03-28', campaign: 'State Legislation Alert — TX & FL', score: 78, inbox: 80, spam: 14, missing: 6, status: 'warning' },
  { date: '2026-03-25', campaign: 'TIPAC Q2 Pledge Drive', score: 91, inbox: 92, spam: 5, missing: 3, status: 'passed' },
  { date: '2026-03-20', campaign: 'New Member Welcome Series #1', score: 95, inbox: 96, spam: 2, missing: 2, status: 'passed' },
  { date: '2026-03-15', campaign: 'EDge Spring Cohort Invite', score: 83, inbox: 85, spam: 10, missing: 5, status: 'warning' },
  { date: '2026-03-10', campaign: 'Title News Weekly — Issue #12', score: 86, inbox: 87, spam: 9, missing: 4, status: 'passed' },
];

/* ── Placement trend chart data ── */
const placementTrendData = {
  labels: historicalTests.map(t => t.date.slice(5)).reverse(),
  datasets: [
    {
      label: 'Inbox %',
      data: historicalTests.map(t => t.inbox).reverse(),
      borderColor: C.green,
      backgroundColor: `${C.green}20`,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: C.green,
      borderWidth: 2,
    },
    {
      label: 'Spam %',
      data: historicalTests.map(t => t.spam).reverse(),
      borderColor: C.red,
      backgroundColor: `${C.red}20`,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: C.red,
      borderWidth: 2,
    },
  ],
};

/* ── Per-provider heatmap data (recent tests) ── */
const heatmapTests = ['Apr 12', 'Apr 07', 'Apr 01', 'Mar 28', 'Mar 25'];
const heatmapData = [
  { provider: 'Gmail',      results: [94, 92, 90, 82, 93] },
  { provider: 'Outlook',    results: [90, 88, 86, 78, 89] },
  { provider: 'Yahoo',      results: [87, 85, 83, 75, 86] },
  { provider: 'Apple Mail', results: [97, 96, 95, 90, 96] },
  { provider: 'Proton',     results: [80, 78, 76, 68, 79] },
  { provider: 'AOL',        results: [84, 82, 80, 72, 83] },
];

function getHeatColor(val: number): string {
  if (val >= 90) return C.green;
  if (val >= 80) return C.blue;
  if (val >= 70) return C.amber;
  return C.red;
}

/* ── Provider detail modal ── */
function ProviderModal({ provider, onClose }: { provider: typeof providers[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{provider.name} Placement Details</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Seed test results for {provider.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${C.green} 8%, transparent)` }}>
              <CheckCircle2 className="w-4 h-4 mx-auto mb-1" style={{ color: C.green }} />
              <div className="text-lg font-extrabold" style={{ color: C.green }}>{provider.inbox}%</div>
              <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Inbox</div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${C.red} 8%, transparent)` }}>
              <AlertTriangle className="w-4 h-4 mx-auto mb-1" style={{ color: C.red }} />
              <div className="text-lg font-extrabold" style={{ color: C.red }}>{provider.spam}%</div>
              <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Spam</div>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${C.gray} 8%, transparent)` }}>
              <HelpCircle className="w-4 h-4 mx-auto mb-1" style={{ color: C.gray }} />
              <div className="text-lg font-extrabold" style={{ color: C.gray }}>{provider.missing}%</div>
              <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Missing</div>
            </div>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>5-Test Trend</p>
            <div className="flex items-end gap-2 h-16">
              {provider.trend.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${(v / 100) * 48}px`,
                      background: getHeatColor(v),
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-[8px] font-bold" style={{ color: 'var(--text-muted)' }}>{v}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${provider.inbox >= 90 ? C.green : C.amber} 8%, transparent)` }}>
            <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {provider.inbox >= 90
                ? `${provider.name} inbox placement is excellent. Your authentication and content signals are well-aligned with ${provider.name}'s filtering algorithms.`
                : `${provider.name} shows room for improvement. Consider reviewing content triggers and authentication alignment specific to ${provider.name}'s spam filters.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function SeedTest() {
  const [selectedProvider, setSelectedProvider] = useState<typeof providers[0] | null>(null);
  const [selectedTest, setSelectedTest] = useState<typeof historicalTests[0] | null>(null);

  return (
    <div className="p-6 space-y-6">

      {/* ── 1. Branded Header ── */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #4A90D9, #1B6B3A)',
            boxShadow: '0 4px 20px rgba(74,144,217,0.3)',
          }}
        >
          <Inbox className="w-6 h-6" style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            SeedTest<span className="text-[10px] align-super font-bold" style={{ color: 'var(--text-muted)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Know where you land before you send.
          </p>
        </div>
      </div>

      {/* ── 2. SparkKpi Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <SparkKpi
          label="Last Test Score"
          value="89/100"
          sub="PFL Compliance — April Wave 3"
          icon={ShieldCheck}
          color={C.green}
          sparkData={[83, 86, 87, 91, 92, 87, 89]}
          sparkColor={C.green}
          trend={{ value: 2.3, label: 'vs previous test' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                The seed test score is a weighted composite of inbox placement across all tested providers,
                factoring in provider market share and spam folder rates.
              </p>
              <div className="space-y-2">
                {providers.map(p => (
                  <div key={p.name} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{p.icon} {p.name}</span>
                    <span className="text-[11px] font-bold" style={{ color: p.inbox >= 90 ? C.green : p.inbox >= 80 ? C.amber : C.red }}>{p.inbox}% inbox</span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Inbox Placement %"
          value={`${overallPlacement}%`}
          sub="Weighted average across all providers"
          icon={Inbox}
          color={C.blue}
          sparkData={[84, 85, 86, 87, 87, 88, overallPlacement]}
          sparkColor={C.blue}
          trend={{ value: 3.1, label: 'vs last month' }}
          accent
        />
        <SparkKpi
          label="Spam Folder %"
          value={`${overallSpam}%`}
          sub="Average spam rate across providers"
          icon={AlertTriangle}
          color={overallSpam <= 8 ? C.amber : C.red}
          sparkData={[12, 10, 9, 8, 9, 8, overallSpam]}
          sparkColor={C.amber}
          trend={{ value: -5.2, label: 'vs last month' }}
          accent
        />
        <SparkKpi
          label="Tests Run This Month"
          value="8"
          sub="Pre-send seed tests completed"
          icon={BarChart3}
          color={C.navy}
          sparkData={[5, 6, 7, 6, 8]}
          sparkColor={C.navy}
          trend={{ value: 14.3, label: 'vs last month' }}
          accent
        />
      </div>

      {/* ── 3. Provider Inbox/Spam/Missing Breakdown ── */}
      <Card
        title="Inbox Placement by Provider"
        subtitle="Latest seed test results — click a provider for details"
        detailTitle="Provider Placement Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Seed tests send specially tracked emails to monitored inboxes across major email providers.
              Each test verifies whether your email reaches the inbox, lands in spam, or goes missing entirely.
            </p>
            {providers.map(p => (
              <div key={p.name} className="p-3 rounded-lg border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{p.icon} {p.name}</span>
                  <span className="text-[10px] font-bold" style={{ color: p.inbox >= 90 ? C.green : C.amber }}>{p.inbox}% inbox</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden flex" style={{ background: 'var(--card-border)' }}>
                  <div className="h-full" style={{ width: `${p.inbox}%`, background: C.green }} />
                  <div className="h-full" style={{ width: `${p.spam}%`, background: C.red }} />
                  <div className="h-full" style={{ width: `${p.missing}%`, background: C.gray }} />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map(p => (
            <div
              key={p.name}
              className="p-4 rounded-xl border cursor-pointer transition-all hover:translate-y-[-2px]"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}
              onClick={() => setSelectedProvider(p)}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{p.icon} {p.name}</span>
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: `color-mix(in srgb, ${p.inbox >= 90 ? C.green : p.inbox >= 80 ? C.amber : C.red} 15%, transparent)`,
                    color: p.inbox >= 90 ? C.green : p.inbox >= 80 ? C.amber : C.red,
                  }}
                >
                  {p.inbox >= 90 ? 'Excellent' : p.inbox >= 80 ? 'Good' : 'Needs Work'}
                </span>
              </div>

              {/* Stacked bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex mb-2" style={{ background: 'var(--card-border)' }}>
                <div className="h-full transition-all duration-500" style={{ width: `${p.inbox}%`, background: C.green }} />
                <div className="h-full transition-all duration-500" style={{ width: `${p.spam}%`, background: C.red }} />
                <div className="h-full transition-all duration-500" style={{ width: `${p.missing}%`, background: C.gray }} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" style={{ color: C.green }} />
                  <span className="text-[9px] font-bold" style={{ color: C.green }}>{p.inbox}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="w-2.5 h-2.5" style={{ color: C.red }} />
                  <span className="text-[9px] font-bold" style={{ color: C.red }}>{p.spam}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <HelpCircle className="w-2.5 h-2.5" style={{ color: C.gray }} />
                  <span className="text-[9px] font-bold" style={{ color: C.gray }}>{p.missing}%</span>
                </div>
              </div>
              <div className="text-[8px] mt-2 font-semibold" style={{ color: 'var(--accent)' }}>Click for details</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
          {[
            { label: 'Inbox', color: C.green },
            { label: 'Spam', color: C.red },
            { label: 'Missing', color: C.gray },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
              <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 4. Placement Trend + Heatmap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Placement Trend" subtitle="Inbox vs spam rates over recent tests">
          <ClientChart
            type="line"
            data={placementTrendData}
            height={280}
            options={{
              plugins: {
                legend: { display: true, position: 'bottom', labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 12, font: { size: 10 } } },
              },
              scales: {
                y: { min: 0, max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => `${v}%` } },
                x: { grid: { display: false }, ticks: { color: '#8899aa' } },
              },
            }}
          />
        </Card>

        <Card title="Provider Heatmap" subtitle="Inbox placement % per provider across recent tests">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-[9px] uppercase tracking-wider font-bold pb-2 text-left pr-3" style={{ color: 'var(--text-muted)' }}>Provider</th>
                  {heatmapTests.map(t => (
                    <th key={t} className="text-[9px] uppercase tracking-wider font-bold pb-2 text-center px-1" style={{ color: 'var(--text-muted)' }}>{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map(row => (
                  <tr key={row.provider}>
                    <td className="py-1.5 pr-3 text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{row.provider}</td>
                    {row.results.map((val, i) => (
                      <td key={i} className="py-1.5 px-1">
                        <div
                          className="w-full py-1.5 rounded text-center text-[10px] font-extrabold"
                          style={{
                            background: `color-mix(in srgb, ${getHeatColor(val)} 15%, transparent)`,
                            color: getHeatColor(val),
                          }}
                        >
                          {val}%
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3 mt-3 pt-2" style={{ borderTop: '1px solid var(--card-border)' }}>
            {[
              { label: '90%+', color: C.green },
              { label: '80-89%', color: C.blue },
              { label: '70-79%', color: C.amber },
              { label: '<70%', color: C.red },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className="w-3 h-2 rounded-sm" style={{ background: `color-mix(in srgb, ${l.color} 25%, transparent)` }} />
                <span className="text-[8px] font-bold" style={{ color: l.color }}>{l.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 5. Historical Test Results ── */}
      <Card
        title="Test History"
        subtitle="All seed tests run this quarter with results"
        detailTitle="Seed Test History"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Every campaign is seed-tested before full deployment. Tests that score below 80 trigger
              a content and authentication review before the campaign proceeds.
            </p>
            {historicalTests.map((t, i) => (
              <div key={i} className="p-3 rounded-lg border" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{t.campaign}</span>
                  <span className="text-sm font-extrabold" style={{ color: t.score >= 85 ? C.green : t.score >= 75 ? C.amber : C.red }}>{t.score}</span>
                </div>
                <div className="flex items-center gap-3 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  <span>{t.date}</span>
                  <span>Inbox: {t.inbox}%</span>
                  <span>Spam: {t.spam}%</span>
                  <span>Missing: {t.missing}%</span>
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
                {['Date', 'Campaign', 'Score', 'Inbox', 'Spam', 'Missing', 'Status'].map(h => (
                  <th key={h} className="text-[9px] uppercase tracking-wider font-bold pb-3 pr-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historicalTests.map((t, i) => (
                <tr
                  key={i}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--card-border)' }}
                  onClick={() => setSelectedTest(t)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--input-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="py-2.5 pr-4 text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.date}</td>
                  <td className="py-2.5 pr-4 text-xs font-medium max-w-[200px] truncate" style={{ color: 'var(--heading)' }}>{t.campaign}</td>
                  <td className="py-2.5 pr-4">
                    <span className="text-xs font-extrabold" style={{ color: t.score >= 85 ? C.green : t.score >= 75 ? C.amber : C.red }}>{t.score}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-xs font-bold" style={{ color: C.green }}>{t.inbox}%</td>
                  <td className="py-2.5 pr-4 text-xs font-bold" style={{ color: C.red }}>{t.spam}%</td>
                  <td className="py-2.5 pr-4 text-xs" style={{ color: C.gray }}>{t.missing}%</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `color-mix(in srgb, ${t.status === 'passed' ? C.green : C.amber} 15%, transparent)`,
                        color: t.status === 'passed' ? C.green : C.amber,
                      }}
                    >
                      {t.status === 'passed' ? 'Passed' : 'Warning'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Modals ── */}
      {selectedProvider && <ProviderModal provider={selectedProvider} onClose={() => setSelectedProvider(null)} />}

      {selectedTest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedTest(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Test Results</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedTest.campaign}</p>
              </div>
              <button onClick={() => setSelectedTest(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="text-3xl font-extrabold" style={{ color: selectedTest.score >= 85 ? C.green : selectedTest.score >= 75 ? C.amber : C.red }}>
                  {selectedTest.score}
                </div>
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Composite Score</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedTest.date}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${C.green} 8%, transparent)` }}>
                  <div className="text-lg font-extrabold" style={{ color: C.green }}>{selectedTest.inbox}%</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Inbox</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${C.red} 8%, transparent)` }}>
                  <div className="text-lg font-extrabold" style={{ color: C.red }}>{selectedTest.spam}%</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Spam</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${C.gray} 8%, transparent)` }}>
                  <div className="text-lg font-extrabold" style={{ color: C.gray }}>{selectedTest.missing}%</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Missing</div>
                </div>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Per-Provider Breakdown</p>
                <div className="space-y-2">
                  {providers.map(p => (
                    <div key={p.name} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                      <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{p.icon} {p.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold" style={{ color: C.green }}>{p.inbox}%</span>
                        <span className="text-[10px]" style={{ color: C.red }}>{p.spam}%</span>
                        <span className="text-[10px]" style={{ color: C.gray }}>{p.missing}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${selectedTest.status === 'passed' ? C.green : C.amber} 8%, transparent)` }}>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {selectedTest.status === 'passed'
                    ? 'This test passed all thresholds. Campaign was cleared for deployment.'
                    : 'This test triggered a warning due to elevated spam rates. Content review was recommended before full send.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
