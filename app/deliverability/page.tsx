'use client';

import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';

const C = { navy: '#1B3A5C', blue: '#4A90D9', green: '#8CC63F', red: '#D94A4A', orange: '#E8923F' };
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <div className={`bg-[var(--card)] border border-[var(--card-border)] rounded-xl ${className}`}>{children}</div>; }

const trend = [
  { month: 'Oct', delivery: 97.1, open: 34 }, { month: 'Nov', delivery: 96.8, open: 35 }, { month: 'Dec', delivery: 95.4, open: 32 },
  { month: 'Jan', delivery: 96.0, open: 36 }, { month: 'Feb', delivery: 96.4, open: 36 }, { month: 'Mar', delivery: 96.1, open: 40 }, { month: 'Apr', delivery: 96.2, open: 40 },
];

const bounces = [
  { reason: 'Invalid mailbox (hard)', count: 198, pct: 44 }, { reason: 'Full mailbox (soft)', count: 89, pct: 20 },
  { reason: 'Domain not found (hard)', count: 67, pct: 15 }, { reason: 'Temporary failure (soft)', count: 52, pct: 12 },
  { reason: 'Content blocked', count: 24, pct: 5 }, { reason: 'Rate limited', count: 18, pct: 4 },
];

const auth = [
  { name: 'SPF', status: 'Pass', desc: 'Sender Policy Framework — verifies alta.org is authorized to send' },
  { name: 'DKIM', status: 'Pass', desc: 'DomainKeys — cryptographically signs emails' },
  { name: 'DMARC', status: 'Partial', desc: 'Set to monitoring only — upgrade to "quarantine" recommended' },
];

export default function Deliverability() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold text-white mb-6">Deliverability Monitor</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6 stagger-children">
        {[
          { label: 'Delivery Rate', value: 96.2, ringValue: 96.2, color: C.green },
          { label: 'Hard Bounce', value: 1.8, ringValue: 1.8, color: C.red },
          { label: 'Soft Bounce', value: 2.0, ringValue: 2.0, color: C.orange },
          { label: 'Spam Complaints', value: 0.02, ringValue: 0.02, color: C.green },
          { label: 'Invalid Addresses', value: 332, ringValue: 0, color: C.blue },
        ].map(m => (
          <Card key={m.label} className="p-4 flex flex-col items-center text-center">
            {m.ringValue > 0 ? (
              <ProgressRing value={m.label.includes('Rate') ? m.ringValue : m.ringValue} max={m.label.includes('Rate') ? 100 : 10} size={64} color={m.color} />
            ) : (
              <div className="w-[64px] h-[64px] flex items-center justify-center">
                <span className="text-xl font-extrabold text-white">{m.value.toLocaleString()}</span>
              </div>
            )}
            <div className="mt-2">
              {m.ringValue > 0 && <div className="text-xs font-bold text-white">{m.value}%</div>}
              <div className="text-[10px] text-white/40">{m.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-5">
          <h3 className="text-xs font-bold text-white mb-3">7-Month Trend</h3>
          <ClientChart type="line" height={240} data={{ labels: trend.map(t => t.month), datasets: [
            { label: 'Delivery %', data: trend.map(t => t.delivery), borderColor: C.green, borderWidth: 2.5, fill: false, tension: 0.3, pointRadius: 4 },
            { label: 'Open %', data: trend.map(t => t.open), borderColor: C.blue, borderWidth: 2, fill: false, tension: 0.3, pointRadius: 4, borderDash: [5, 5] },
          ] }} options={{ plugins: { legend: { display: true, position: 'top' as const, labels: { color: '#8899aa', usePointStyle: true, padding: 16, font: { size: 10 } } }, datalabels: { display: false } }, scales: { y: { min: 30, max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => v + '%' } }, x: { grid: { display: false }, ticks: { color: '#8899aa' } } } }} />
        </Card>
        <Card className="p-5">
          <h3 className="text-xs font-bold text-white mb-3">Bounce Breakdown</h3>
          <div className="space-y-3">
            {bounces.map(b => (
              <div key={b.reason}>
                <div className="flex justify-between text-[10px] mb-1"><span className="text-white/70">{b.reason}</span><span className="text-white font-bold">{b.count} ({b.pct}%)</span></div>
                <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full" style={{ width: `${b.pct}%`, background: b.pct > 20 ? C.red : b.pct > 10 ? C.orange : C.blue }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <h3 className="text-xs font-bold text-white mb-3">Email Authentication (SPF / DKIM / DMARC)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {auth.map(a => (
            <div key={a.name} className="p-4 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${a.status === 'Pass' ? 'bg-green-400' : 'bg-amber-400'}`} />
                <span className="text-xs font-bold text-white">{a.name}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${a.status === 'Pass' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{a.status}</span>
              </div>
              <p className="text-[10px] text-white/40">{a.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 border-l-4 border-l-[#8CC63F]">
        <h3 className="text-xs font-bold text-white mb-3">Recommended Actions</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {[
            { action: 'Remove 265 hard-bounce addresses', impact: 'Reduces bounce by 1.4%', when: 'Now' },
            { action: 'Upgrade DMARC to quarantine', impact: 'Prevents spoofing', when: 'This week' },
            { action: 'Verify full 18,400 address list', impact: 'Find 500+ more invalid', when: 'This month' },
            { action: 'A/B test Title News subject lines', impact: '+5-10% open rate', when: 'Next send' },
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
