'use client';

import ClientChart from '@/components/ClientChart';
import { getCampaignTotals } from '@/lib/demo-data';

const C = { green: '#8CC63F', blue: '#4A90D9', red: '#D94A4A', navy: '#002D5C', orange: '#E8923F' };
const totals = getCampaignTotals();
const altaOpenRate = parseFloat(((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1));
const altaClickRate = parseFloat(((totals.totalClicked / totals.totalDelivered) * 100).toFixed(1));

const benchmarks = [
  { metric: 'Open Rate', alta: altaOpenRate, associations: 28.5, allIndustry: 21.3, verdict: altaOpenRate > 28.5 ? 'Above' : 'Below' },
  { metric: 'Click Rate', alta: altaClickRate, associations: 3.8, allIndustry: 2.6, verdict: altaClickRate > 3.8 ? 'Above' : 'Below' },
  { metric: 'Bounce Rate', alta: 3.8, associations: 2.1, allIndustry: 1.8, verdict: 3.8 > 2.1 ? 'Above' : 'Below' },
  { metric: 'Unsubscribe Rate', alta: 0.15, associations: 0.18, allIndustry: 0.26, verdict: 0.15 < 0.18 ? 'Better' : 'Worse' },
  { metric: 'Delivery Rate', alta: 96.2, associations: 95.5, allIndustry: 94.8, verdict: 96.2 > 95.5 ? 'Above' : 'Below' },
];

export default function Benchmarks() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Industry Benchmarks</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>How ALTA compares to other associations and all industries. Data from Mailchimp, Campaign Monitor, and GetResponse 2026 benchmark reports.</p>

      {/* Benchmark Chart */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>ALTA vs Industry Benchmarks</h3>
        <ClientChart type="bar" height={300} data={{
          labels: benchmarks.map(b => b.metric),
          datasets: [
            { label: 'ALTA (MEMTrak)', data: benchmarks.map(b => b.alta), backgroundColor: C.green, borderRadius: 4, barPercentage: 0.25 },
            { label: 'Associations Avg', data: benchmarks.map(b => b.associations), backgroundColor: C.blue, borderRadius: 4, barPercentage: 0.25 },
            { label: 'All Industries Avg', data: benchmarks.map(b => b.allIndustry), backgroundColor: C.navy, borderRadius: 4, barPercentage: 0.25 },
          ],
        }} options={{
          plugins: { legend: { display: true, position: 'top' as const, labels: { color: 'var(--text-muted)', usePointStyle: true, padding: 16, font: { size: 10 } } }, datalabels: { display: false } },
          scales: { y: { beginAtZero: true, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => v + '%' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)', font: { size: 9 } } } },
        }} />
      </div>

      {/* Detailed Table */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Detailed Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th className="text-left pb-2" style={{ color: 'var(--text-muted)' }}>Metric</th>
              <th className="text-right pb-2" style={{ color: 'var(--accent)' }}>ALTA</th>
              <th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>Assoc. Avg</th>
              <th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>All Industry</th>
              <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Status</th>
            </tr></thead>
            <tbody>
              {benchmarks.map(b => (
                <tr key={b.metric} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td className="py-3 font-bold" style={{ color: 'var(--heading)' }}>{b.metric}</td>
                  <td className="py-3 text-right font-extrabold" style={{ color: 'var(--accent)' }}>{b.alta}%</td>
                  <td className="py-3 text-right" style={{ color: 'var(--text-muted)' }}>{b.associations}%</td>
                  <td className="py-3 text-right" style={{ color: 'var(--text-muted)' }}>{b.allIndustry}%</td>
                  <td className="py-3 text-center">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${b.verdict === 'Above' || b.verdict === 'Better' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {b.metric === 'Bounce Rate' ? (b.alta > b.associations ? '⚠ Above Avg' : '✓ Below Avg') : b.verdict === 'Above' || b.verdict === 'Better' ? '✓ Outperforming' : '⚠ Below Avg'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 rounded-lg" style={{ background: 'color-mix(in srgb, var(--accent) 6%, transparent)' }}>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--heading)' }}>Summary:</strong> ALTA outperforms the association average on open rate, click rate, delivery rate, and unsubscribe rate. The only area needing attention is bounce rate (3.8% vs 2.1% avg) — addressed in the Address Hygiene page.</p>
        </div>
      </div>
    </div>
  );
}
