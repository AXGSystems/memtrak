'use client';

import ClientChart from '@/components/ClientChart';

const C = { green: '#8CC63F', blue: '#4A90D9', red: '#D94A4A', orange: '#E8923F' };

const npsData = {
  score: 42,
  promoters: 58, passives: 26, detractors: 16,
  responses: 1240, responseRate: 24.8,
  trend: [
    { quarter: 'Q1 2025', score: 35 }, { quarter: 'Q2 2025', score: 38 },
    { quarter: 'Q3 2025', score: 40 }, { quarter: 'Q4 2025', score: 39 },
    { quarter: 'Q1 2026', score: 42 },
  ],
  byType: [
    { type: 'ACU', score: 72, responses: 35 },
    { type: 'ACA', score: 44, responses: 820 },
    { type: 'REA', score: 38, responses: 240 },
    { type: 'ATXA', score: 32, responses: 95 },
    { type: 'Other', score: 28, responses: 50 },
  ],
  topReasons: [
    { reason: 'Advocacy & legislative support', sentiment: 'positive', count: 312 },
    { reason: 'Networking at ALTA ONE', sentiment: 'positive', count: 285 },
    { reason: 'PFL/licensing process complexity', sentiment: 'negative', count: 89 },
    { reason: 'Education program quality', sentiment: 'positive', count: 198 },
    { reason: 'Dues cost vs perceived value', sentiment: 'negative', count: 67 },
  ],
};

export default function NPS() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Member NPS (Net Promoter Score)</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Tracks member satisfaction and loyalty. NPS ranges from -100 to +100. Above 30 is good, above 50 is excellent for associations.</p>

      {/* NPS Score Hero */}
      <div className="rounded-xl border p-6 mb-6 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <div className="text-6xl font-extrabold" style={{ color: npsData.score >= 50 ? C.green : npsData.score >= 30 ? C.blue : C.orange }}>+{npsData.score}</div>
        <div className="text-sm font-bold mt-1" style={{ color: 'var(--heading)' }}>Net Promoter Score</div>
        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{npsData.responses.toLocaleString()} responses ({npsData.responseRate}% response rate)</div>
        <div className="flex justify-center gap-6 mt-4">
          <div><div className="text-lg font-extrabold" style={{ color: C.green }}>{npsData.promoters}%</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Promoters (9-10)</div></div>
          <div><div className="text-lg font-extrabold" style={{ color: 'var(--text-muted)' }}>{npsData.passives}%</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Passives (7-8)</div></div>
          <div><div className="text-lg font-extrabold" style={{ color: C.red }}>{npsData.detractors}%</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Detractors (0-6)</div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* NPS Trend */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>NPS Trend (5 Quarters)</h3>
          <ClientChart type="line" height={220} data={{
            labels: npsData.trend.map(t => t.quarter),
            datasets: [{ label: 'NPS', data: npsData.trend.map(t => t.score), borderColor: C.green, borderWidth: 2.5, fill: true, backgroundColor: 'rgba(140,198,63,0.08)', tension: 0.3, pointRadius: 5, pointBackgroundColor: C.green }],
          }} options={{ plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: 'var(--heading)', font: { weight: 'bold' as const, size: 11 }, formatter: (v: number) => '+' + v } }, scales: { y: { min: 20, max: 60, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } } } }} />
        </div>

        {/* NPS by Type */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>NPS by Member Type</h3>
          <ClientChart type="bar" height={220} data={{
            labels: npsData.byType.map(t => t.type),
            datasets: [{ label: 'NPS', data: npsData.byType.map(t => t.score), backgroundColor: npsData.byType.map(t => t.score >= 50 ? C.green : t.score >= 30 ? C.blue : C.orange), borderRadius: 6 }],
          }} options={{ plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: 'var(--heading)', font: { weight: 'bold' as const, size: 11 }, formatter: (v: number) => '+' + v } }, scales: { y: { beginAtZero: true, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } } } }} />
        </div>
      </div>

      {/* Top Reasons */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Top Feedback Themes</h3>
        <div className="space-y-2">
          {npsData.topReasons.map(r => (
            <div key={r.reason} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${r.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{r.sentiment === 'positive' ? '👍' : '👎'}</span>
              <div className="flex-1"><span className="text-xs" style={{ color: 'var(--heading)' }}>{r.reason}</span></div>
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{r.count} mentions</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
