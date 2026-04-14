'use client';

import ClientChart from '@/components/ClientChart';

const C = { green: '#8CC63F', blue: '#4A90D9', red: '#D94A4A', navy: '#002D5C' };

const quarterlyForecast = [
  { q: 'Q1 2026', actual: 10248000, forecast: null, dues: 7310000, ndr: 2938000 },
  { q: 'Q2 2026', actual: null, forecast: 3850000, dues: 2100000, ndr: 1750000 },
  { q: 'Q3 2026', actual: null, forecast: 4200000, dues: 1800000, ndr: 2400000 },
  { q: 'Q4 2026', actual: null, forecast: 3500000, dues: 2000000, ndr: 1500000 },
];

const emailImpact = [
  { scenario: 'Current Trajectory', revenue: 21798000, retention: 85, newMembers: 566 },
  { scenario: 'If Retention → 89%', revenue: 22318000, retention: 89, newMembers: 566 },
  { scenario: 'If New Members → 750', revenue: 21937000, retention: 85, newMembers: 750 },
  { scenario: 'Best Case (Both)', revenue: 22457000, retention: 89, newMembers: 750 },
];

export default function Forecast() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Revenue Forecasting</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Predict next-quarter revenue based on email engagement trends, renewal pacing, and member behavior. What HubSpot&apos;s Breeze Intelligence does for $890/mo.</p>

      {/* Quarterly Forecast */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>2026 Revenue Forecast</h3>
        <ClientChart type="bar" height={300} data={{
          labels: quarterlyForecast.map(q => q.q),
          datasets: [
            { label: 'Actual', data: quarterlyForecast.map(q => q.actual || 0), backgroundColor: C.navy, borderRadius: 6, barPercentage: 0.4 },
            { label: 'Forecast', data: quarterlyForecast.map(q => q.forecast || 0), backgroundColor: C.blue + '80', borderRadius: 6, barPercentage: 0.4, borderWidth: 2, borderColor: C.blue, borderDash: [4, 4] },
          ],
        }} options={{
          plugins: { legend: { display: true, position: 'top' as const, labels: { color: 'var(--text-muted)', usePointStyle: true, padding: 16, font: { size: 10 } } }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: 'var(--heading)', font: { weight: 'bold' as const, size: 10 }, formatter: (v: number) => v > 0 ? '$' + (v / 1e6).toFixed(1) + 'M' : '' } },
          scales: { y: { beginAtZero: true, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => '$' + (v / 1e6).toFixed(0) + 'M' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } } },
        }} />
      </div>

      {/* Scenario Modeling */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Email Impact on Revenue — Scenario Modeling</h3>
        <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>How does improving email engagement (which drives retention and new member acquisition) affect full-year revenue?</p>
        <div className="space-y-2">
          {emailImpact.map((s, i) => (
            <div key={s.scenario} className="flex items-center justify-between p-4 rounded-xl transition-all" style={{ background: i === emailImpact.length - 1 ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--background)', border: i === emailImpact.length - 1 ? '1px solid var(--accent)' : '1px solid var(--card-border)' }}>
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{s.scenario}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Retention: {s.retention}% · New: {s.newMembers}</div>
              </div>
              <div className="text-lg font-extrabold" style={{ color: i === emailImpact.length - 1 ? 'var(--accent)' : 'var(--heading)' }}>${(s.revenue / 1e6).toFixed(1)}M</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg" style={{ background: 'color-mix(in srgb, var(--accent) 6%, transparent)' }}>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--heading)' }}>The email connection:</strong> Every 1% improvement in retention is driven by better engagement, which is driven by better emails. MEMTrak&apos;s engagement scoring shows that members with 70+ email engagement scores renew at 94%. Getting more members above 70 directly increases the retention rate and revenue.</p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Revenue Mix Forecast</h3>
        <ClientChart type="bar" height={250} data={{
          labels: quarterlyForecast.map(q => q.q),
          datasets: [
            { label: 'Dues Revenue', data: quarterlyForecast.map(q => q.dues), backgroundColor: C.navy, borderRadius: 4 },
            { label: 'Non-Dues Revenue', data: quarterlyForecast.map(q => q.ndr), backgroundColor: C.green, borderRadius: 4 },
          ],
        }} options={{
          plugins: { legend: { display: true, position: 'top' as const, labels: { color: 'var(--text-muted)', usePointStyle: true, padding: 16, font: { size: 10 } } }, datalabels: { display: false } },
          scales: { x: { stacked: true, grid: { display: false }, ticks: { color: 'var(--text-muted)' } }, y: { stacked: true, beginAtZero: true, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => '$' + (v / 1e6).toFixed(0) + 'M' } } },
        }} />
      </div>
    </div>
  );
}
