'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import { Target, CheckCircle, Clock, XCircle } from 'lucide-react';

const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const zones = [
  { name: 'Title News Leaderboard', size: '728x90', cpm: 12.50 },
  { name: 'Website Sidebar', size: '300x250', cpm: 8.00 },
  { name: 'Event Registration Banner', size: '728x90', cpm: 15.00 },
  { name: 'Mobile Interstitial', size: '320x480', cpm: 6.00 },
];

// Availability matrix: true = available, false = booked, 'partial' = partially booked
type Avail = boolean | 'partial';
const availability: Record<string, Avail[]> = {
  'Title News Leaderboard':  [false, false, true, true, true, true, true, true],
  'Website Sidebar':         [false, false, false, false, 'partial', 'partial', true, true],
  'Event Registration Banner': [true, true, false, false, false, false, true, true],
  'Mobile Interstitial':     [true, true, true, true, true, true, true, true],
};

function AvailCell({ v }: { v: Avail }) {
  if (v === true) return <div className="w-full h-8 rounded bg-green-500/20 flex items-center justify-center"><CheckCircle className="w-3 h-3 text-green-400" /></div>;
  if (v === 'partial') return <div className="w-full h-8 rounded bg-amber-500/20 flex items-center justify-center"><Clock className="w-3 h-3 text-amber-400" /></div>;
  return <div className="w-full h-8 rounded bg-red-500/20 flex items-center justify-center"><XCircle className="w-3 h-3 text-red-400" /></div>;
}

export default function Inventory() {
  // Compute fill rate analysis for detail modal
  const zoneAnalysis = zones.map(z => {
    const avails = availability[z.name] || [];
    const availCount = avails.filter(v => v === true).length;
    const partialCount = avails.filter(v => v === 'partial').length;
    const bookedCount = avails.filter(v => v === false).length;
    const fillRate = Math.round(((bookedCount + partialCount * 0.5) / avails.length) * 100);
    const estRevPerMonth = Math.round(z.cpm * 50000 / 1000);
    const potentialRevenue = availCount * estRevPerMonth;
    return { ...z, availCount, partialCount, bookedCount, fillRate, estRevPerMonth, potentialRevenue };
  });

  const avgFillRate = Math.round(zoneAnalysis.reduce((s, z) => s + z.fillRate, 0) / zoneAnalysis.length);
  const totalPotentialRevenue = zoneAnalysis.reduce((s, z) => s + z.potentialRevenue, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>Ad Inventory</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Available slots May–Dec 2026</p>
        </div>
        <Link href="/ads/request" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#8CC63F] hover:bg-[#6fa030]">
          <Target className="w-3.5 h-3.5" /> Request a Slot
        </Link>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-[10px]" style={{ color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" /> Available</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" /> Partial</span>
        <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" /> Booked</span>
      </div>

      {/* Grid */}
      <Card title="Availability Grid" className="mb-6" noPad>
        <div className="px-5 pb-5 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th className="text-left pb-3 text-[10px] uppercase min-w-[180px]" style={{ color: 'var(--text-muted)' }}>Zone</th>
                {months.map(m => <th key={m} className="text-center pb-3 text-[10px] uppercase w-16" style={{ color: 'var(--text-muted)' }}>{m}</th>)}
                <th className="text-right pb-3 text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>CPM</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(z => (
                <tr key={z.name} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td className="py-3">
                    <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{z.name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{z.size}</div>
                  </td>
                  {availability[z.name]?.map((v, i) => (
                    <td key={i} className="py-3 px-1"><AvailCell v={v} /></td>
                  ))}
                  <td className="py-3 text-right text-xs font-bold" style={{ color: 'var(--heading)' }}>${z.cpm.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Zone details */}
      <Card
        title="Zone Summary"
        subtitle={`${avgFillRate}% average fill rate across ${zones.length} zones`}
        className="mb-6"
        detailTitle="Fill Rate Analysis"
        detailContent={
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                <div className="text-2xl font-extrabold" style={{ color: 'var(--heading)' }}>{avgFillRate}%</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Avg Fill Rate</div>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                <div className="text-2xl font-extrabold text-green-400">${totalPotentialRevenue.toLocaleString()}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Unsold Revenue Potential</div>
              </div>
            </div>
            <div className="space-y-3">
              {zoneAnalysis.map(z => (
                <div key={z.name} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{z.name}</span>
                    <span className={`text-xs font-bold ${z.fillRate >= 70 ? 'text-green-400' : z.fillRate >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{z.fillRate}% filled</span>
                  </div>
                  <div className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>{z.size} -- ${z.cpm} CPM</div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div><span className="text-green-400 font-semibold">{z.availCount}</span> <span style={{ color: 'var(--text-muted)' }}>available</span></div>
                    <div><span className="text-amber-400 font-semibold">{z.partialCount}</span> <span style={{ color: 'var(--text-muted)' }}>partial</span></div>
                    <div><span className="text-red-400 font-semibold">{z.bookedCount}</span> <span style={{ color: 'var(--text-muted)' }}>booked</span></div>
                  </div>
                  <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    Unsold potential: <span className="text-green-400 font-semibold">${z.potentialRevenue.toLocaleString()}</span> ({z.availCount} months x ${z.estRevPerMonth.toLocaleString()}/mo)
                  </div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {zoneAnalysis.map(z => (
            <div key={z.name} className="rounded-xl p-4" style={{ background: 'var(--input-bg)' }}>
              <div className="text-xs font-bold mb-1" style={{ color: 'var(--heading)' }}>{z.name}</div>
              <div className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>{z.size} -- ${z.cpm} CPM</div>
              <div className="text-lg font-extrabold text-green-400">{z.availCount} <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>months available</span></div>
              {z.partialCount > 0 && <div className="text-[10px] text-amber-400">{z.partialCount} partial</div>}
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Est. revenue per month: ${z.estRevPerMonth.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
