'use client';

import Card from '@/components/Card';
import ClientChart from '@/components/ClientChart';
import { demoCampaigns, getCampaignTotals } from '@/lib/demo-data';
import { exportCSV } from '@/lib/export-utils';
import { memtrakPrint } from '@/lib/print';
import { Download, Printer } from 'lucide-react';

const C = { navy: '#1B3A5C', blue: '#4A90D9', green: '#8CC63F', red: '#D94A4A', orange: '#E8923F' };
const sent = demoCampaigns.filter(c => c.status === 'Sent');

export default function Campaigns() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>Campaigns ({demoCampaigns.length})</h1>
        <div className="flex gap-2">
          <button onClick={() => memtrakPrint('Campaigns')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border no-print" style={{ color: 'var(--text-muted)', borderColor: 'var(--card-border)' }}><Printer className="w-3 h-3" /> Print</button>
          <button onClick={() => exportCSV(['Campaign', 'Type', 'Status', 'Source', 'Date', 'Sent', 'Delivered', 'Opened', 'Clicked', 'Bounced', 'Revenue'], demoCampaigns.map(c => [c.name, c.type, c.status, c.source, c.sentDate, c.listSize, c.delivered, c.uniqueOpened, c.clicked, c.bounced, c.revenue]), 'MEMTrak_Campaigns')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#8CC63F] hover:bg-[#6fa030]" style={{ color: 'var(--heading)' }}><Download className="w-3 h-3" /> CSV</button>
        </div>
      </div>

      {/* Campaign Table */}
      <Card
        title="All Campaigns"
        detailTitle="Campaign Performance Breakdown"
        detailContent={
          <div className="space-y-4">
            {demoCampaigns.map(c => (
              <div key={c.id} className="rounded-lg border p-4" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{c.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${c.status === 'Sent' ? 'bg-green-500/20 text-green-400' : c.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-400' : ''}`} style={c.status !== 'Sent' && c.status !== 'Scheduled' ? { color: 'var(--text-muted)', background: 'var(--input-bg)' } : undefined}>{c.status}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Source</div>
                    <div className="font-semibold" style={{ color: 'var(--heading)' }}>{c.source}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Sent</div>
                    <div className="font-semibold" style={{ color: 'var(--heading)' }}>{c.listSize.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Delivered</div>
                    <div className="font-semibold" style={{ color: 'var(--heading)' }}>{c.delivered.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Unique Opens</div>
                    <div className="font-semibold" style={{ color: 'var(--heading)' }}>{c.uniqueOpened.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Open Rate</div>
                    <div className={`font-bold ${c.delivered > 0 ? ((c.uniqueOpened / c.delivered * 100) >= 40 ? 'text-green-400' : 'text-amber-400') : ''}`}>
                      {c.delivered > 0 ? (c.uniqueOpened / c.delivered * 100).toFixed(1) + '%' : '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>CTR</div>
                    <div className="font-semibold" style={{ color: 'var(--heading)' }}>{c.delivered > 0 ? (c.clicked / c.delivered * 100).toFixed(1) + '%' : '—'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Bounced</div>
                    <div className="font-semibold" style={{ color: 'var(--heading)' }}>{c.bounced.toLocaleString()} ({c.listSize > 0 ? (c.bounced / c.listSize * 100).toFixed(1) : 0}%)</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)' }}>Revenue</div>
                    <div className={`font-bold ${c.revenue > 0 ? 'text-green-400' : ''}`} style={c.revenue <= 0 ? { color: 'var(--text-muted)' } : undefined}>
                      {c.revenue > 0 ? '$' + c.revenue.toLocaleString() : '—'}
                    </div>
                  </div>
                </div>
                {c.status === 'Sent' && (
                  <div className="mt-2 pt-2 border-t text-[10px] flex gap-4" style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
                    <span>Sent: {c.sentDate}</span>
                    <span>Clicks: {c.clicked.toLocaleString()}</span>
                    <span>Unsubs: {c.unsubscribed}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        }
        className="mb-6"
        noPad
      >
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-[10px] uppercase" style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
              <th className="text-left pb-2">Campaign</th><th className="text-center pb-2">Source</th><th className="text-center pb-2">Status</th><th className="text-right pb-2">Sent</th><th className="text-right pb-2">Open Rate</th><th className="text-right pb-2">CTR</th><th className="text-right pb-2">Bounce</th><th className="text-right pb-2">Revenue</th>
            </tr></thead>
            <tbody>
              {demoCampaigns.map(c => (
                <tr key={c.id} className="border-b" style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
                  <td className="py-2.5 font-semibold" style={{ color: 'var(--heading)' }}>{c.name}</td>
                  <td className="py-2.5 text-center"><span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${c.source === 'MEMTrak' ? 'bg-green-500/20 text-green-400' : c.source === 'Higher Logic' ? 'bg-blue-500/20 text-blue-400' : ''}`} style={c.source !== 'MEMTrak' && c.source !== 'Higher Logic' ? { background: 'var(--input-bg)', color: 'var(--text-muted)' } : undefined}>{c.source}</span></td>
                  <td className="py-2.5 text-center"><span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${c.status === 'Sent' ? 'bg-green-500/20 text-green-400' : c.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-400' : ''}`} style={c.status !== 'Sent' && c.status !== 'Scheduled' ? { background: 'var(--input-bg)', color: 'var(--text-muted)' } : undefined}>{c.status}</span></td>
                  <td className="py-2.5 text-right">{c.listSize.toLocaleString()}</td>
                  <td className="py-2.5 text-right">{c.delivered > 0 ? <span className={`font-bold ${(c.uniqueOpened / c.delivered * 100) >= 40 ? 'text-green-400' : 'text-amber-400'}`}>{(c.uniqueOpened / c.delivered * 100).toFixed(1)}%</span> : '—'}</td>
                  <td className="py-2.5 text-right">{c.delivered > 0 ? (c.clicked / c.delivered * 100).toFixed(1) + '%' : '—'}</td>
                  <td className="py-2.5 text-right">{c.listSize > 0 ? (c.bounced / c.listSize * 100).toFixed(1) + '%' : '—'}</td>
                  <td className="py-2.5 text-right">{c.revenue > 0 ? <span className="text-green-400 font-bold">${(c.revenue / 1000).toFixed(0)}K</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Open Rate by Type"
          detailTitle="Open Rate by Campaign Type"
          detailContent={
            <div>
              <ClientChart type="bar" height={360} data={{ labels: ['Onboarding', 'Retention', 'Advocacy', 'Events', 'Newsletter', 'Compliance'], datasets: [{ label: 'Open Rate', data: [80.2, 90.0, 50.0, 45.0, 40.0, 29.9], backgroundColor: [C.green, C.green, C.blue, C.navy, C.orange, C.red], borderRadius: 6 }] }} options={{ plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: '#e2e8f0', font: { weight: 'bold' as const, size: 13 }, formatter: (v: number) => v + '%' } }, scales: { y: { beginAtZero: true, max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => v + '%' } }, x: { grid: { display: false }, ticks: { color: '#8899aa' } } } }} />
              <div className="mt-4 space-y-2 text-xs">
                {[
                  { type: 'Onboarding', rate: '80.2%' },
                  { type: 'Retention', rate: '90.0%' },
                  { type: 'Advocacy', rate: '50.0%' },
                  { type: 'Events', rate: '45.0%' },
                  { type: 'Newsletter', rate: '40.0%' },
                  { type: 'Compliance', rate: '29.9%' },
                ].map(r => (
                  <div key={r.type} className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <span style={{ color: 'var(--heading)' }}>{r.type}</span>
                    <span className="font-bold" style={{ color: 'var(--text-muted)' }}>{r.rate}</span>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <ClientChart type="bar" height={240} data={{ labels: ['Onboarding', 'Retention', 'Advocacy', 'Events', 'Newsletter', 'Compliance'], datasets: [{ label: 'Open Rate', data: [80.2, 90.0, 50.0, 45.0, 40.0, 29.9], backgroundColor: [C.green, C.green, C.blue, C.navy, C.orange, C.red], borderRadius: 6 }] }} options={{ plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: '#e2e8f0', font: { weight: 'bold' as const, size: 11 }, formatter: (v: number) => v + '%' } }, scales: { y: { beginAtZero: true, max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => v + '%' } }, x: { grid: { display: false }, ticks: { color: '#8899aa' } } } }} />
        </Card>
        <Card
          title="Revenue Attribution"
          detailTitle="Revenue Attribution by Campaign"
          detailContent={
            <div>
              <ClientChart type="bar" height={360} data={{ labels: sent.filter(c => c.revenue > 0).map(c => c.name.length > 18 ? c.name.slice(0, 18) + '...' : c.name), datasets: [{ label: 'Revenue', data: sent.filter(c => c.revenue > 0).map(c => c.revenue), backgroundColor: [C.navy, C.green, C.blue, C.orange], borderRadius: 6 }] }} options={{ plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: '#8CC63F', font: { weight: 'bold' as const, size: 11 }, formatter: (v: number) => '$' + (v / 1000).toFixed(0) + 'K' } }, scales: { y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => '$' + (v / 1000).toFixed(0) + 'K' } }, x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 10 } } } } }} />
              <div className="mt-4 space-y-2 text-xs">
                {sent.filter(c => c.revenue > 0).map(c => (
                  <div key={c.id} className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <span style={{ color: 'var(--heading)' }}>{c.name}</span>
                    <span className="text-green-400 font-bold">${c.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <ClientChart type="bar" height={240} data={{ labels: sent.filter(c => c.revenue > 0).map(c => c.name.length > 18 ? c.name.slice(0, 18) + '...' : c.name), datasets: [{ label: 'Revenue', data: sent.filter(c => c.revenue > 0).map(c => c.revenue), backgroundColor: [C.navy, C.green, C.blue, C.orange], borderRadius: 6 }] }} options={{ plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: '#8CC63F', font: { weight: 'bold' as const, size: 9 }, formatter: (v: number) => '$' + (v / 1000).toFixed(0) + 'K' } }, scales: { y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => '$' + (v / 1000).toFixed(0) + 'K' } }, x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 8 } } } } }} />
        </Card>
      </div>
    </div>
  );
}
