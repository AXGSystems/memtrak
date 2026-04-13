'use client';

import Link from 'next/link';
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
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-extrabold text-white">Ad Inventory</h1>
          <p className="text-xs text-white/40">Available slots May–Dec 2026</p>
        </div>
        <Link href="/ads/request" className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#8CC63F] hover:bg-[#6fa030]">
          <Target className="w-3.5 h-3.5" /> Request a Slot
        </Link>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-[10px] text-white/50">
        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" /> Available</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" /> Partial</span>
        <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" /> Booked</span>
      </div>

      {/* Grid */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left pb-3 text-white/40 text-[10px] uppercase min-w-[180px]">Zone</th>
              {months.map(m => <th key={m} className="text-center pb-3 text-white/40 text-[10px] uppercase w-16">{m}</th>)}
              <th className="text-right pb-3 text-white/40 text-[10px] uppercase">CPM</th>
            </tr>
          </thead>
          <tbody>
            {zones.map(z => (
              <tr key={z.name} className="border-b border-white/5">
                <td className="py-3">
                  <div className="text-xs font-bold text-white">{z.name}</div>
                  <div className="text-[10px] text-white/30">{z.size}</div>
                </td>
                {availability[z.name]?.map((v, i) => (
                  <td key={i} className="py-3 px-1"><AvailCell v={v} /></td>
                ))}
                <td className="py-3 text-right text-xs font-bold text-white">${z.cpm.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Zone details */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {zones.map(z => {
          const avail = availability[z.name]?.filter(v => v === true).length || 0;
          const partial = availability[z.name]?.filter(v => v === 'partial').length || 0;
          return (
            <div key={z.name} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4">
              <div className="text-xs font-bold text-white mb-1">{z.name}</div>
              <div className="text-[10px] text-white/40 mb-2">{z.size} · ${z.cpm} CPM</div>
              <div className="text-lg font-extrabold text-green-400">{avail} <span className="text-xs font-normal text-white/30">months available</span></div>
              {partial > 0 && <div className="text-[10px] text-amber-400">{partial} partial</div>}
              <div className="text-[10px] text-white/30 mt-1">Est. revenue per month: ${Math.round(z.cpm * 50000 / 1000).toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
