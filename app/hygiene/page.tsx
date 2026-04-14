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
      <h1 className="text-lg font-extrabold mb-6" style={{ color: 'var(--heading)' }}>Address Hygiene</h1>

      {/* Health Rings — bigger, better spacing */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <Card className="p-5 flex flex-col items-center text-center" title="Healthy Addresses" detailTitle="Healthy Addresses" detailContent={<div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>These {h.healthy.count.toLocaleString()} addresses have valid DNS, no bounce history, and recent engagement activity. They represent {h.healthy.pct}% of your total list and are safe to send to.</p></div>}>
          <ProgressRing value={h.healthy.pct} max={100} size={80} color={C.green} />
          <div className="mt-3">
            <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{h.healthy.count.toLocaleString()}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Healthy addresses</div>
          </div>
        </Card>
        <Card className="p-5 flex flex-col items-center text-center" title="Stale Addresses" detailTitle="Stale Addresses" detailContent={<div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>These {h.stale.count.toLocaleString()} addresses have not opened or clicked any email in 6+ months. A re-engagement campaign can recover ~15% of stale addresses. The rest should be suppressed to protect deliverability.</p></div>}>
          <ProgressRing value={h.stale.pct} max={100} size={80} color={C.orange} />
          <div className="mt-3">
            <div className="text-sm font-bold text-amber-400">{h.stale.count.toLocaleString()}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Stale (6 months+)</div>
          </div>
        </Card>
        <Card className="p-5 flex flex-col items-center text-center" title="Hard Bounced" detailTitle="Hard Bounced" detailContent={<div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>These {h.bounced.count} addresses have permanently failed delivery (invalid mailbox or domain not found). They should be removed immediately as continued sending damages your sender reputation.</p></div>}>
          <ProgressRing value={h.bounced.pct} max={100} size={80} color={C.red} />
          <div className="mt-3">
            <div className="text-sm font-bold text-red-400">{h.bounced.count}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Hard bounced</div>
          </div>
        </Card>
        <Card className="p-5 flex flex-col items-center text-center" title="Projected Delivery" detailTitle="Projected Delivery Rate" detailContent={<div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>After removing invalid and bounced addresses and running a re-engagement campaign, the projected delivery rate improves from {h.currentDelivery}% to {h.projectedDelivery}%. This means approximately 480 more emails reaching inboxes per campaign.</p></div>}>
          <div className="relative w-[80px] h-[80px] flex items-center justify-center">
            <div className="text-2xl font-extrabold text-green-400">{h.projectedDelivery}%</div>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>After Cleanup</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>from {h.currentDelivery}% current</div>
          </div>
        </Card>
      </div>

      {/* Doughnut — with better sizing */}
      <Card title="Address Health Distribution" subtitle="All 18,400 addresses categorized" className="mb-6" detailTitle="Health Analysis" detailContent={<div><p className="text-xs" style={{ color: "var(--text-muted)" }}>A clean list improves deliverability for everyone. Removing 900 invalid+bounced addresses and re-engaging 15% of stale addresses could improve delivery rate from 96.2% to 98.8% — meaning 480 more emails reaching inboxes per campaign.</p></div>}>
        <h3 className="text-xs font-bold mb-1" style={{ color: 'var(--heading)' }}>Address Health Distribution</h3>
        <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>{h.total.toLocaleString()} total addresses in the system</p>
        <div className="max-w-md mx-auto">
          <ClientChart type="doughnut" height={320} data={{ labels: [`Healthy (${h.healthy.count.toLocaleString()})`, `Stale (${h.stale.count.toLocaleString()})`, `Bounced (${h.bounced.count})`, `Unsubscribed (${h.unsubscribed.count})`, `Invalid (${h.invalid.count})`, `Risky (${h.risky.count})`], datasets: [{ data: [h.healthy.count, h.stale.count, h.bounced.count, h.unsubscribed.count, h.invalid.count, h.risky.count], backgroundColor: [C.green, C.orange, C.red, '#555', C.navy, C.blue], borderWidth: 2, borderColor: 'rgba(10,22,40,0.8)', hoverOffset: 12, hoverBorderColor: 'rgba(255,255,255,0.3)' }] }} options={{ plugins: { legend: { display: true, position: 'bottom' as const, labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 10 } } } } }} />
        </div>
      </Card>

      {/* Improvement projection */}
      <Card title="Delivery Rate Projection" subtitle="Projected improvement after each cleanup step" className="mb-6" detailTitle="Projection Analysis" detailContent={<div><p className="text-xs" style={{ color: "var(--text-muted)" }}>Each cleanup step incrementally improves your delivery rate. Removing invalid addresses yields the largest single improvement (+1.2%), followed by bounce cleanup (+0.7%). The re-engagement campaign recovers approximately 420 stale addresses, representing ~$63K in annual revenue at risk.</p></div>}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Delivery Rate Projection</h3>
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
      <Card className="p-5 border-l-4 border-l-[#8CC63F]" title="Recommended Cleanup Actions" subtitle="Priority-ordered steps to improve list health" detailTitle="Cleanup Plan" detailContent={<div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>This cleanup plan follows industry best practices: remove known-bad addresses first, then re-engage dormant contacts, and finally purge non-responders. Expected outcome: bounce rate drops by ~5%, delivery rate improves to 98.8%, and ~$63K in at-risk revenue is recovered through re-engagement.</p></div>}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Recommended Cleanup Actions</h3>
        <div className="space-y-2">
          {[
            { action: 'Remove 220 invalid addresses immediately', impact: 'Bounce rate drops by 1.2%', when: 'Do now', color: 'bg-red-500/20 text-red-400' },
            { action: 'Remove 680 hard-bounced addresses', impact: 'Bounce rate drops by 3.7%', when: 'Do now', color: 'bg-red-500/20 text-red-400' },
            { action: 'Send re-engagement to 2,800 stale addresses', impact: 'Recover ~15% ($63K revenue)', when: 'This month', color: 'bg-amber-500/20 text-amber-400' },
            { action: 'Verify 80 risky addresses', impact: 'Protect domain reputation', when: 'This month', color: 'bg-amber-500/20 text-amber-400' },
            { action: 'Purge non-responders after 30 days', impact: 'Clean list benefits everyone', when: 'Next month', color: 'bg-blue-500/20 text-blue-400' },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 rounded-lg transition-colors" style={{ background: 'var(--input-bg)' }}>
              <div className="flex-1">
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{r.action}</div>
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
