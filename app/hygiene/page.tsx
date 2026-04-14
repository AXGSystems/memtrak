'use client';

import ClientChart from '@/components/ClientChart';
import Card from '@/components/Card';
import ProgressRing from '@/components/ProgressRing';
import { demoHygiene } from '@/lib/demo-data';

const C = { green: '#8CC63F', orange: '#E8923F', red: '#D94A4A', navy: '#1B3A5C', blue: '#4A90D9' };
const h = demoHygiene;

export default function Hygiene() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold text-white mb-6">Address Hygiene</h1>

      {/* Health Rings — bigger, better spacing */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <Card className="p-5 flex flex-col items-center text-center">
          <ProgressRing value={h.healthy.pct} max={100} size={80} color={C.green} />
          <div className="mt-3">
            <div className="text-sm font-bold text-white">{h.healthy.count.toLocaleString()}</div>
            <div className="text-[10px] text-white/40">Healthy addresses</div>
          </div>
        </Card>
        <Card className="p-5 flex flex-col items-center text-center">
          <ProgressRing value={h.stale.pct} max={100} size={80} color={C.orange} />
          <div className="mt-3">
            <div className="text-sm font-bold text-amber-400">{h.stale.count.toLocaleString()}</div>
            <div className="text-[10px] text-white/40">Stale (6 months+)</div>
          </div>
        </Card>
        <Card className="p-5 flex flex-col items-center text-center">
          <ProgressRing value={h.bounced.pct} max={100} size={80} color={C.red} />
          <div className="mt-3">
            <div className="text-sm font-bold text-red-400">{h.bounced.count}</div>
            <div className="text-[10px] text-white/40">Hard bounced</div>
          </div>
        </Card>
        <Card className="p-5 flex flex-col items-center text-center">
          <div className="relative w-[80px] h-[80px] flex items-center justify-center">
            <div className="text-2xl font-extrabold text-green-400">{h.projectedDelivery}%</div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-white">After Cleanup</div>
            <div className="text-[10px] text-white/40">from {h.currentDelivery}% current</div>
          </div>
        </Card>
      </div>

      {/* Doughnut — with better sizing */}
      <Card className="p-5 mb-6">
        <h3 className="text-xs font-bold text-white mb-1">Address Health Distribution</h3>
        <p className="text-[10px] text-white/40 mb-3">{h.total.toLocaleString()} total addresses in the system</p>
        <div className="max-w-md mx-auto">
          <ClientChart type="doughnut" height={320} data={{ labels: [`Healthy (${h.healthy.count.toLocaleString()})`, `Stale (${h.stale.count.toLocaleString()})`, `Bounced (${h.bounced.count})`, `Unsubscribed (${h.unsubscribed.count})`, `Invalid (${h.invalid.count})`, `Risky (${h.risky.count})`], datasets: [{ data: [h.healthy.count, h.stale.count, h.bounced.count, h.unsubscribed.count, h.invalid.count, h.risky.count], backgroundColor: [C.green, C.orange, C.red, '#555', C.navy, C.blue], borderWidth: 2, borderColor: 'rgba(10,22,40,0.8)', hoverOffset: 12, hoverBorderColor: 'rgba(255,255,255,0.3)' }] }} options={{ plugins: { legend: { display: true, position: 'bottom' as const, labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 10 } } } } }} />
        </div>
      </Card>

      {/* Improvement projection */}
      <Card className="p-5 mb-6">
        <h3 className="text-xs font-bold text-white mb-3">Delivery Rate Projection</h3>
        <ClientChart type="bar" height={200} data={{
          labels: ['Current', 'After Invalid Removal', 'After Bounce Cleanup', 'After Re-engagement', 'Target'],
          datasets: [{
            label: 'Delivery Rate',
            data: [96.2, 97.4, 98.1, 98.6, 98.8],
            backgroundColor: ['#4A90D9', '#4A90D9', '#8CC63F', '#8CC63F', '#8CC63F'],
            borderRadius: 6,
          }],
        }} options={{
          plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: '#e2e8f0', font: { weight: 'bold' as const, size: 11 }, formatter: (v: number) => v + '%' } },
          scales: { y: { min: 95, max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => v + '%' } }, x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 } } } },
        }} />
      </Card>

      {/* Cleanup Actions */}
      <Card className="p-5 border-l-4 border-l-[#8CC63F]">
        <h3 className="text-xs font-bold text-white mb-3">Recommended Cleanup Actions</h3>
        <div className="space-y-2">
          {[
            { action: 'Remove 220 invalid addresses immediately', impact: 'Bounce rate drops by 1.2%', when: 'Do now', color: 'bg-red-500/20 text-red-400' },
            { action: 'Remove 680 hard-bounced addresses', impact: 'Bounce rate drops by 3.7%', when: 'Do now', color: 'bg-red-500/20 text-red-400' },
            { action: 'Send re-engagement to 2,800 stale addresses', impact: 'Recover ~15% ($63K revenue)', when: 'This month', color: 'bg-amber-500/20 text-amber-400' },
            { action: 'Verify 80 risky addresses', impact: 'Protect domain reputation', when: 'This month', color: 'bg-amber-500/20 text-amber-400' },
            { action: 'Purge non-responders after 30 days', impact: 'Clean list benefits everyone', when: 'Next month', color: 'bg-blue-500/20 text-blue-400' },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 rounded-lg bg-white/5 hover:bg-white/[0.07] transition-colors">
              <div className="flex-1">
                <div className="text-xs font-bold text-white">{r.action}</div>
                <div className="text-[10px] text-green-400 mt-0.5">{r.impact}</div>
              </div>
              <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold flex-shrink-0 ml-3 ${r.color}`}>{r.when}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
