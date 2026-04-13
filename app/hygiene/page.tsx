'use client';

import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import { demoHygiene } from '@/lib/demo-data';

const C = { green: '#8CC63F', orange: '#E8923F', red: '#D94A4A', navy: '#1B3A5C', blue: '#4A90D9' };
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <div className={`bg-[var(--card)] border border-[var(--card-border)] rounded-xl ${className}`}>{children}</div>; }
const h = demoHygiene;

export default function Hygiene() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold text-white mb-6">Address Hygiene</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <Card className="p-4 flex items-center gap-3"><ProgressRing value={h.healthy.pct} max={100} size={56} label="" color={C.green} /><div><div className="text-xs font-bold text-white">{h.healthy.pct}%</div><div className="text-[10px] text-white/40">Healthy ({h.healthy.count.toLocaleString()})</div></div></Card>
        <Card className="p-4 flex items-center gap-3"><ProgressRing value={h.stale.pct} max={100} size={56} label="" color={C.orange} /><div><div className="text-xs font-bold text-amber-400">{h.stale.count.toLocaleString()}</div><div className="text-[10px] text-white/40">Stale (6mo+)</div></div></Card>
        <Card className="p-4 flex items-center gap-3"><ProgressRing value={h.bounced.pct} max={100} size={56} label="" color={C.red} /><div><div className="text-xs font-bold text-red-400">{h.bounced.count}</div><div className="text-[10px] text-white/40">Bounced</div></div></Card>
        <Card className="p-4"><div className="text-[10px] uppercase tracking-wider font-semibold text-white/40">After Cleanup</div><div className="text-xl font-extrabold text-green-400">{h.projectedDelivery}%</div><div className="text-[10px] text-white/40">from {h.currentDelivery}%</div></Card>
      </div>

      <Card className="p-5 mb-6">
        <h3 className="text-xs font-bold text-white mb-3">Address Health ({h.total.toLocaleString()} total)</h3>
        <ClientChart type="doughnut" height={300} data={{ labels: [`Healthy (${h.healthy.count.toLocaleString()})`, `Stale (${h.stale.count.toLocaleString()})`, `Bounced (${h.bounced.count})`, `Unsubscribed (${h.unsubscribed.count})`, `Invalid (${h.invalid.count})`, `Risky (${h.risky.count})`], datasets: [{ data: [h.healthy.count, h.stale.count, h.bounced.count, h.unsubscribed.count, h.invalid.count, h.risky.count], backgroundColor: [C.green, C.orange, C.red, '#666', C.navy, C.blue], borderWidth: 0, hoverOffset: 8 }] }} />
      </Card>

      <Card className="p-5 border-l-4 border-l-[#8CC63F]">
        <h3 className="text-xs font-bold text-white mb-3">Cleanup Actions</h3>
        <div className="space-y-2">
          {[
            { action: 'Remove 220 invalid addresses', impact: '-1.2% bounce', when: 'Now' },
            { action: 'Remove 680 hard-bounced addresses', impact: '-3.7% bounce', when: 'Now' },
            { action: 'Re-engagement campaign to 2,800 stale', impact: 'Recover ~15% ($63K)', when: 'This month' },
            { action: 'Purge non-responders after 30 days', impact: 'Clean list for all', when: 'Next month' },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div><div className="text-xs font-bold text-white">{r.action}</div><div className="text-[10px] text-green-400">{r.impact}</div></div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 font-semibold">{r.when}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
