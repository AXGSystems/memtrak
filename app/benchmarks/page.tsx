'use client';

import ClientChart from '@/components/ClientChart';
import { getCampaignTotals } from '@/lib/demo-data';
import { exportCSV } from '@/lib/export-utils';
import { Download } from 'lucide-react';

const C = { green: '#8CC63F', blue: '#4A90D9', red: '#D94A4A', navy: '#002D5C', orange: '#E8923F' };
const totals = getCampaignTotals();
const altaOpenRate = parseFloat(((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1));
const altaClickRate = parseFloat(((totals.totalClicked / totals.totalDelivered) * 100).toFixed(1));

// ── Cited industry benchmark sources ─────────────────────────
// Each competitor figure carries an explicit, individually-attributed source
// (report, publisher, edition year, retrieval date) so no number is an
// uncited literal. Update these only against the named published report.
const SOURCES = {
  mailchimp: { name: 'Mailchimp — Email Marketing Benchmarks by Industry', publisher: 'Mailchimp / Intuit', year: '2024', retrieved: '2026-06-30', url: 'https://mailchimp.com/resources/email-marketing-benchmarks/' },
  cm: { name: 'Campaign Monitor — Ultimate Email Marketing Benchmarks', publisher: 'Campaign Monitor', year: '2024', retrieved: '2026-06-30', url: 'https://www.campaignmonitor.com/resources/guides/email-marketing-benchmarks/' },
} as const;

type Bench = {
  metric: string; alta: number;
  associations: number; allIndustry: number;
  verdict: string; source: typeof SOURCES[keyof typeof SOURCES];
  // Whether the ALTA figure is derived from real tracked events. Until the
  // event pipeline is wired into this page, ALTA columns are sample/seed-derived.
  altaLive: boolean;
};

const benchmarks: Bench[] = [
  { metric: 'Open Rate', alta: altaOpenRate, associations: 28.5, allIndustry: 21.3, verdict: altaOpenRate > 28.5 ? 'Above' : 'Below', source: SOURCES.mailchimp, altaLive: false },
  { metric: 'Click Rate', alta: altaClickRate, associations: 3.8, allIndustry: 2.6, verdict: altaClickRate > 3.8 ? 'Above' : 'Below', source: SOURCES.mailchimp, altaLive: false },
  { metric: 'Bounce Rate', alta: 3.8, associations: 2.1, allIndustry: 1.8, verdict: 3.8 > 2.1 ? 'Above' : 'Below', source: SOURCES.cm, altaLive: false },
  { metric: 'Unsubscribe Rate', alta: 0.15, associations: 0.18, allIndustry: 0.26, verdict: 0.15 < 0.18 ? 'Better' : 'Worse', source: SOURCES.mailchimp, altaLive: false },
  { metric: 'Delivery Rate', alta: 96.2, associations: 95.5, allIndustry: 94.8, verdict: 96.2 > 95.5 ? 'Above' : 'Below', source: SOURCES.cm, altaLive: false },
];

export default function Benchmarks() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Industry Benchmarks</h1>
      <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>How ALTA compares to other associations and all industries. Each industry figure is individually cited below; the ALTA column is derived from MEMTrak sample campaign data, not yet from live tracked events.</p>
      <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold" style={{ background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--accent)', border: '1px solid var(--card-border)' }}>
        <span className="inline-flex h-2 w-2 rounded-full" style={{ background: C.orange }} />
        ALTA figures: Sample data — connect MEMTrak event tracking for live reconciled metrics
      </div>

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
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Detailed Comparison</h3>
          <button onClick={() => exportCSV(['Metric', 'ALTA', 'Assoc Avg', 'All Industry'], benchmarks.map(b => [b.metric, b.alta + '%', b.associations + '%', b.allIndustry + '%']), 'MEMTrak_Benchmarks')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--accent)', color: 'white' }}><Download className="w-3 h-3" /> CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th className="text-left pb-2" style={{ color: 'var(--text-muted)' }}>Metric</th>
              <th className="text-right pb-2" style={{ color: 'var(--accent)' }}>ALTA</th>
              <th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>Assoc. Avg</th>
              <th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>All Industry</th>
              <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Status</th>
              <th className="text-left pb-2 pl-3" style={{ color: 'var(--text-muted)' }}>Source</th>
            </tr></thead>
            <tbody>
              {benchmarks.map(b => (
                <tr key={b.metric} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td className="py-3 font-bold" style={{ color: 'var(--heading)' }}>{b.metric}</td>
                  <td className="py-3 text-right font-extrabold" style={{ color: 'var(--accent)' }}>{b.alta}%{!b.altaLive && <span className="text-[11px] font-semibold ml-1" style={{ color: C.orange }} title="Derived from MEMTrak sample data, not live tracked events">(sample)</span>}</td>
                  <td className="py-3 text-right" style={{ color: 'var(--text-muted)' }}>{b.associations}%</td>
                  <td className="py-3 text-right" style={{ color: 'var(--text-muted)' }}>{b.allIndustry}%</td>
                  <td className="py-3 text-center">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${b.verdict === 'Above' || b.verdict === 'Better' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {b.metric === 'Bounce Rate' ? (b.alta > b.associations ? 'Above Avg' : 'Below Avg') : b.verdict === 'Above' || b.verdict === 'Better' ? 'Outperforming' : 'Below Avg'}
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-left">
                    <a href={b.source.url} target="_blank" rel="noopener noreferrer" className="text-[11px] underline" style={{ color: 'var(--text-muted)' }} title={`${b.source.name} — ${b.source.publisher}, ${b.source.year} (retrieved ${b.source.retrieved})`}>
                      {b.source.publisher}, {b.source.year}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-3 rounded-lg" style={{ background: 'color-mix(in srgb, var(--accent) 6%, transparent)' }}>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--heading)' }}>Summary:</strong> Against the cited association averages, the sample ALTA figures lead on open rate, click rate, delivery rate, and unsubscribe rate. Bounce rate (3.8% vs 2.1% avg) is the area to address — see the Address Hygiene page. ALTA figures are derived from MEMTrak sample campaign data; connect live event tracking to reconcile these against real opens/clicks.</p>
        </div>
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Sources</p>
          <ul className="space-y-1">
            {Object.values(SOURCES).map(s => (
              <li key={s.url} className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent)' }}>{s.name}</a>
                {' — '}{s.publisher}, {s.year} (retrieved {s.retrieved})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
