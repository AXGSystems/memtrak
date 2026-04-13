'use client';

import ClientChart from '@/components/ClientChart';
import { demoMonthly, demoDecayAlerts, getCampaignTotals } from '@/lib/demo-data';
import { exportCSV } from '@/lib/export-utils';
import { memtrakPrint } from '@/lib/print';
import { Send, Eye, MousePointerClick, TrendingDown, CheckCircle, Target, AlertTriangle, Download, Printer } from 'lucide-react';

const C = { navy: '#1B3A5C', blue: '#4A90D9', green: '#8CC63F', red: '#D94A4A', orange: '#E8923F' };
const totals = getCampaignTotals();

function Badge() { return <span className="inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400"><AlertTriangle className="w-2.5 h-2.5" />Demo Data</span>; }
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <div className={`bg-[var(--card)] border border-[var(--card-border)] rounded-xl ${className}`}>{children}</div>; }

export default function DailyBriefing() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-extrabold text-white">Good morning, membership team.</h1>
          <p className="text-xs text-white/40">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} — Daily Briefing</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge />
          <button onClick={() => memtrakPrint('Daily Briefing')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border no-print" style={{ color: 'var(--text-muted)', borderColor: 'var(--card-border)' }}><Printer className="w-3.5 h-3.5" /> Print</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6 stagger-children">
        {[
          { label: 'Emails Sent', value: totals.totalSent.toLocaleString(), icon: Send, color: C.blue },
          { label: 'Delivery Rate', value: ((totals.totalDelivered / totals.totalSent) * 100).toFixed(1) + '%', icon: CheckCircle, color: C.green },
          { label: 'Open Rate', value: ((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1) + '%', icon: Eye, color: C.green },
          { label: 'Click Rate', value: ((totals.totalClicked / totals.totalDelivered) * 100).toFixed(1) + '%', icon: MousePointerClick, color: C.orange },
          { label: 'Revenue', value: '$' + (totals.totalRevenue / 1000).toFixed(0) + 'K', icon: Target, color: C.green },
          { label: 'Decay Alerts', value: String(demoDecayAlerts.filter(d => d.decay >= 50).length), icon: TrendingDown, color: C.red },
        ].map(kpi => (
          <Card key={kpi.label} className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] uppercase tracking-wider font-semibold text-white/40">{kpi.label}</span>
              <kpi.icon className="w-3 h-3" style={{ color: kpi.color }} />
            </div>
            <div className="text-lg font-extrabold text-white">{kpi.value}</div>
          </Card>
        ))}
      </div>

      {/* Action Items */}
      <Card className="p-5 mb-6 border-l-4 border-l-[#8CC63F]">
        <h3 className="text-xs font-bold text-white mb-3">Action Items for Today</h3>
        <div className="space-y-2">
          {[
            { text: `${demoDecayAlerts.filter(d => d.decay >= 70).length} engagement decay alerts — $${demoDecayAlerts.filter(d => d.decay >= 70).reduce((s, d) => s + d.revenue, 0).toLocaleString()} at risk`, urgency: 'High' },
            { text: `${totals.totalBounced} bounced addresses need cleanup`, urgency: 'High' },
            { text: `${totals.scheduled} campaign scheduled, ${totals.drafts} draft needs review`, urgency: 'Medium' },
            { text: 'Renewal season: 4,994 members need renewal comms by Q4', urgency: 'Planning' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/5">
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold mt-0.5 ${item.urgency === 'High' ? 'bg-red-500/20 text-red-400' : item.urgency === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{item.urgency}</span>
              <span className="text-xs text-white/70">{item.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Trend */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-white">Monthly Email Performance</h3>
            <p className="text-[10px] text-white/40">Volume, opens, clicks by month</p>
          </div>
          <button onClick={() => exportCSV(['Month', 'Sent', 'Opened', 'Clicked', 'Bounced'], demoMonthly.map(m => [m.month, m.sent, m.opened, m.clicked, m.bounced]), 'MEMTrak_Monthly')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#8CC63F] hover:bg-[#6fa030] transition-colors"><Download className="w-3 h-3" /> CSV</button>
        </div>
        <ClientChart type="bar" height={300} data={{ labels: demoMonthly.map(m => m.month), datasets: [
          { label: 'Sent', data: demoMonthly.map(m => m.sent), backgroundColor: C.navy, borderRadius: 4 },
          { label: 'Opened', data: demoMonthly.map(m => m.opened), backgroundColor: C.green, borderRadius: 4 },
          { label: 'Clicked', data: demoMonthly.map(m => m.clicked), backgroundColor: C.blue, borderRadius: 4 },
        ] }} options={{ plugins: { legend: { display: true, position: 'top' as const, labels: { color: '#8899aa', usePointStyle: true, padding: 16, font: { size: 10 } } }, datalabels: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } }, x: { grid: { display: false }, ticks: { color: '#8899aa' } } } }} />
      </Card>
    </div>
  );
}
