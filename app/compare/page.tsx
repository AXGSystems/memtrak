'use client';

import { useState } from 'react';
import ClientChart from '@/components/ClientChart';
import { demoCampaigns } from '@/lib/demo-data';

const C = { green: '#8CC63F', blue: '#4A90D9', red: '#D94A4A', navy: '#002D5C' };
const sent = demoCampaigns.filter(c => c.status === 'Sent');

export default function Compare() {
  const [campA, setCampA] = useState(sent[0]?.id || '');
  const [campB, setCampB] = useState(sent[2]?.id || '');

  const a = sent.find(c => c.id === campA);
  const b = sent.find(c => c.id === campB);

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Campaign Comparison</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Compare any two campaigns side-by-side — see what worked and what didn&apos;t.</p>

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Campaign A</label>
          <select value={campA} onChange={e => setCampA(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-xs" style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--heading)' }}>
            {sent.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Campaign B</label>
          <select value={campB} onChange={e => setCampB(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-xs" style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)', color: 'var(--heading)' }}>
            {sent.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {a && b && (
        <>
          {/* Side-by-side metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[a, b].map((camp, i) => (
              <div key={camp.id} className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: i === 0 ? C.blue : C.green }}>
                <div className="text-xs font-bold mb-3" style={{ color: i === 0 ? C.blue : C.green }}>{i === 0 ? 'Campaign A' : 'Campaign B'}</div>
                <div className="text-sm font-extrabold mb-1" style={{ color: 'var(--heading)' }}>{camp.name}</div>
                <div className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>{camp.type} · {camp.source} · {camp.sentDate}</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Sent', value: camp.listSize.toLocaleString() },
                    { label: 'Open Rate', value: (camp.uniqueOpened / camp.delivered * 100).toFixed(1) + '%' },
                    { label: 'Click Rate', value: (camp.clicked / camp.delivered * 100).toFixed(1) + '%' },
                    { label: 'Bounce', value: (camp.bounced / camp.listSize * 100).toFixed(1) + '%' },
                    { label: 'Revenue', value: camp.revenue > 0 ? '$' + (camp.revenue / 1000).toFixed(0) + 'K' : '—' },
                    { label: 'Unsubscribed', value: String(camp.unsubscribed) },
                  ].map(m => (
                    <div key={m.label} className="p-2 rounded-lg" style={{ background: 'var(--background)' }}>
                      <div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>{m.label}</div>
                      <div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Chart */}
          <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
            <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Head-to-Head Comparison</h3>
            <ClientChart type="bar" height={260} data={{
              labels: ['Open Rate', 'Click Rate', 'Bounce Rate'],
              datasets: [
                { label: a.name.slice(0, 20), data: [(a.uniqueOpened / a.delivered * 100), (a.clicked / a.delivered * 100), (a.bounced / a.listSize * 100)], backgroundColor: C.blue, borderRadius: 4, barPercentage: 0.35 },
                { label: b.name.slice(0, 20), data: [(b.uniqueOpened / b.delivered * 100), (b.clicked / b.delivered * 100), (b.bounced / b.listSize * 100)], backgroundColor: C.green, borderRadius: 4, barPercentage: 0.35 },
              ],
            }} options={{
              plugins: { legend: { display: true, position: 'top' as const, labels: { color: 'var(--text-muted)', usePointStyle: true, padding: 16, font: { size: 10 } } }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: 'var(--heading)', font: { weight: 'bold' as const, size: 10 }, formatter: (v: number) => v.toFixed(1) + '%' } },
              scales: { y: { beginAtZero: true, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => v + '%' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } } },
            }} />

            {/* Winner */}
            <div className="mt-4 p-3 rounded-lg text-center" style={{ background: 'color-mix(in srgb, var(--accent) 8%, transparent)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
                Winner: <span style={{ color: 'var(--accent)' }}>
                  {(a.uniqueOpened / a.delivered) >= (b.uniqueOpened / b.delivered) ? a.name : b.name}
                </span> — {Math.abs((a.uniqueOpened / a.delivered * 100) - (b.uniqueOpened / b.delivered * 100)).toFixed(1)}% higher open rate
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
