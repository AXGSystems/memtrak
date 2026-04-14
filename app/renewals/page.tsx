'use client';

import ClientChart from '@/components/ClientChart';
import { exportCSV } from '@/lib/export-utils';
import { memtrakPrint } from '@/lib/print';
import { Download, Calendar, Users, DollarSign, Printer } from 'lucide-react';

const C = { navy: '#1B3A5C', blue: '#4A90D9', green: '#8CC63F', red: '#D94A4A', orange: '#E8923F' };

const segments = [
  { type: 'ACA', name: 'Title Insurance Agents', count: 3208, avgDues: 1216, estRate: 85 },
  { type: 'REA', name: 'Real Estate Attorneys', count: 926, avgDues: 441, estRate: 82 },
  { type: 'ATXA', name: 'Texas Agents', count: 257, avgDues: 840, estRate: 78 },
  { type: 'ACB', name: 'Title Abstracters', count: 244, avgDues: 517, estRate: 80 },
  { type: 'AS', name: 'Associates', count: 229, avgDues: 777, estRate: 75 },
  { type: 'ACU', name: 'Underwriters', count: 40, avgDues: 61554, estRate: 98 },
  { type: 'REB', name: 'RE Attorneys (non-Agent)', count: 41, avgDues: 461, estRate: 72 },
];

const timeline = [
  { month: 'Aug', action: 'Pre-renewal awareness — early bird messaging', target: 'All', status: 'Planned' },
  { month: 'Sep', action: 'Renewal notice #1 — standard renewal email', target: 'All', status: 'Planned' },
  { month: 'Oct', action: 'ACU white-glove outreach — CEO personal calls', target: 'ACU (40)', status: 'Planned' },
  { month: 'Oct', action: 'Renewal reminder #2 — non-responders', target: 'Non-responders', status: 'Planned' },
  { month: 'Nov', action: 'Final notice — urgency messaging', target: 'Non-renewed', status: 'Planned' },
  { month: 'Dec', action: 'Lapsed member re-engagement', target: 'Non-renewed', status: 'Planned' },
];

export default function Renewals() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-extrabold text-white">Renewal Season Campaign</h1>
        <button onClick={() => exportCSV(['Type', 'Name', 'Members', 'Avg Dues', 'Est Rate', 'Expected Renewals', 'Expected Revenue'], segments.map(s => [s.type, s.name, s.count, s.avgDues, s.estRate + '%', Math.round(s.count * s.estRate / 100), Math.round(s.count * s.estRate / 100) * s.avgDues]), 'MEMTrak_Renewal_Plan')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#8CC63F] hover:bg-[#6fa030]"><Download className="w-3 h-3" /> Export Plan</button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6 stagger-children">
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 text-center">
          <Users className="w-5 h-5 text-white/30 mx-auto mb-2" />
          <div className="text-2xl font-extrabold text-white">4,994</div>
          <div className="text-[10px] text-white/40">Members to Renew</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 text-center">
          <DollarSign className="w-5 h-5 text-[#8CC63F] mx-auto mb-2" />
          <div className="text-2xl font-extrabold text-[#8CC63F]">${(segments.reduce((s, r) => s + Math.round(r.count * r.estRate / 100) * r.avgDues, 0) / 1e6).toFixed(1)}M</div>
          <div className="text-[10px] text-white/40">Expected Revenue</div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 text-center">
          <Calendar className="w-5 h-5 text-[#4A90D9] mx-auto mb-2" />
          <div className="text-2xl font-extrabold text-white">Aug–Dec</div>
          <div className="text-[10px] text-white/40">Campaign Window</div>
        </div>
      </div>

      {/* Segment Table */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 mb-6 overflow-x-auto">
        <h3 className="text-xs font-bold text-white mb-3">Renewal Projections by Segment</h3>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-white/10 text-white/40 text-[10px] uppercase">
            <th className="text-left pb-2">Type</th><th className="text-left pb-2">Name</th><th className="text-right pb-2">Members</th><th className="text-right pb-2">Avg Dues</th><th className="text-right pb-2">Est. Rate</th><th className="text-right pb-2">Expected</th><th className="text-right pb-2">Revenue</th>
          </tr></thead>
          <tbody>
            {segments.map(s => {
              const exp = Math.round(s.count * s.estRate / 100);
              return (
                <tr key={s.type} className="border-b border-white/5 text-white/60">
                  <td className="py-2 font-bold text-white">{s.type}</td>
                  <td className="py-2">{s.name}</td>
                  <td className="py-2 text-right">{s.count.toLocaleString()}</td>
                  <td className="py-2 text-right">${s.avgDues.toLocaleString()}</td>
                  <td className="py-2 text-right"><span className={`font-bold ${s.estRate >= 90 ? 'text-green-400' : s.estRate >= 80 ? 'text-blue-400' : 'text-amber-400'}`}>{s.estRate}%</span></td>
                  <td className="py-2 text-right">{exp.toLocaleString()}</td>
                  <td className="py-2 text-right text-green-400 font-bold">${(exp * s.avgDues).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Revenue chart */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 mb-6">
        <h3 className="text-xs font-bold text-white mb-3">Expected Revenue by Segment</h3>
        <ClientChart type="bar" height={260} data={{ labels: segments.map(s => s.type), datasets: [{ label: 'Expected Revenue', data: segments.map(s => Math.round(s.count * s.estRate / 100) * s.avgDues), backgroundColor: segments.map((_, i) => [C.navy, C.blue, C.green, C.orange, C.red, '#8CC63F', '#6ba8e8'][i]), borderRadius: 6 }] }} options={{ plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: '#e2e8f0', font: { weight: 'bold' as const, size: 9 }, formatter: (v: number) => v >= 1e6 ? '$' + (v / 1e6).toFixed(1) + 'M' : '$' + (v / 1e3).toFixed(0) + 'K' } }, scales: { y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => '$' + (v / 1e6).toFixed(1) + 'M' } }, x: { grid: { display: false }, ticks: { color: '#8899aa' } } } }} />
      </div>

      {/* Campaign Timeline */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
        <h3 className="text-xs font-bold text-white mb-3">Outreach Timeline</h3>
        <div className="space-y-2">
          {timeline.map((t, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
              <span className="text-xs font-bold text-[#8CC63F] w-10">{t.month}</span>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white">{t.action}</div>
                <div className="text-[10px] text-white/40">Target: {t.target}</div>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold">{t.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
