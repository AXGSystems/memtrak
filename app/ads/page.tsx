'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card, { KpiCard } from '@/components/Card';
import ClientChart from '@/components/ClientChart';
import { exportCSV } from '@/lib/export-utils';
import { BarChart3, Eye, MousePointerClick, DollarSign, Download, Calendar, Target } from 'lucide-react';

const C = { navy: '#1B3A5C', blue: '#4A90D9', green: '#8CC63F', red: '#D94A4A', orange: '#E8923F' };

const campaigns = [
  { id: 1, name: 'Title News Sponsorship — Q2', advertiser: 'First American', start: 'Apr 1', end: 'Jun 30', status: 'Active' as const, impressions: 450000, clicks: 8100, ctr: 1.8, revenue: 45000, budget: 50000, zone: 'Title News Leaderboard' },
  { id: 2, name: 'Website Banner — Annual', advertiser: 'Old Republic', start: 'Jan 1', end: 'Dec 31', status: 'Active' as const, impressions: 680000, clicks: 9520, ctr: 1.4, revenue: 68000, budget: 72000, zone: 'Website Sidebar' },
  { id: 3, name: 'ALTA ONE Exhibitor Promo', advertiser: 'Stewart Title', start: 'Jul 1', end: 'Oct 31', status: 'Scheduled' as const, impressions: 0, clicks: 0, ctr: 0, revenue: 0, budget: 35000, zone: 'Event Registration Banner' },
  { id: 4, name: 'Education Sponsor', advertiser: 'Fidelity National', start: 'Jan 15', end: 'Dec 15', status: 'Active' as const, impressions: 520000, clicks: 7280, ctr: 1.4, revenue: 52000, budget: 60000, zone: 'Website Sidebar' },
  { id: 5, name: 'Advocacy Week Sponsor', advertiser: 'WFG National', start: 'Mar 1', end: 'Mar 31', status: 'Completed' as const, impressions: 180000, clicks: 3600, ctr: 2.0, revenue: 18000, budget: 18000, zone: 'Title News Leaderboard' },
  { id: 6, name: 'New Member Welcome Ads', advertiser: 'ALTA Programs', start: 'Jan 1', end: 'Dec 31', status: 'Active' as const, impressions: 120000, clicks: 4800, ctr: 4.0, revenue: 0, budget: 0, zone: 'Mobile Interstitial' },
];

const monthly = [
  { month: 'Jan', impressions: 380000, clicks: 5700, revenue: 38000 },
  { month: 'Feb', impressions: 420000, clicks: 6300, revenue: 42000 },
  { month: 'Mar', impressions: 510000, clicks: 8670, revenue: 51000 },
  { month: 'Apr', impressions: 340000, clicks: 5440, revenue: 34000 },
];

const zones = [
  { name: 'Title News Leaderboard', size: '728x90', impressions: 980000, fill: 94, cpm: 12.50 },
  { name: 'Website Sidebar', size: '300x250', impressions: 1240000, fill: 88, cpm: 8.00 },
  { name: 'Event Registration Banner', size: '728x90', impressions: 420000, fill: 72, cpm: 15.00 },
  { name: 'Mobile Interstitial', size: '320x480', impressions: 200000, fill: 56, cpm: 6.00 },
];

const statusColors: Record<string, { bg: string; color: string }> = {
  Active: { bg: 'bg-green-500/20', color: 'text-green-400' },
  Scheduled: { bg: 'bg-blue-500/20', color: 'text-blue-400' },
  Completed: { bg: '', color: '' },
  Paused: { bg: 'bg-amber-500/20', color: 'text-amber-400' },
};

export default function AdsOverview() {
  const [detail, setDetail] = useState<typeof campaigns[0] | null>(null);

  const totalImpressions = campaigns.filter(c => c.status !== 'Scheduled').reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.filter(c => c.status !== 'Scheduled').reduce((s, c) => s + c.clicks, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>Advertising &amp; Revive Ad Server</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Campaign performance, ad inventory, and slot management</p>
        </div>
        <div className="flex gap-2">
          <Link href="/ads/inventory" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors" style={{ color: 'var(--heading)', borderColor: 'var(--card-border)', borderWidth: '1px', borderStyle: 'solid' }}>
            <Calendar className="w-3.5 h-3.5" /> Inventory
          </Link>
          <Link href="/ads/request" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[#8CC63F] hover:bg-[#6fa030] transition-colors">
            <Target className="w-3.5 h-3.5" /> Request Slot
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6 stagger-children stagger-children">
        {[
          { label: 'Impressions', value: (totalImpressions / 1e6).toFixed(1) + 'M', icon: Eye, color: C.navy },
          { label: 'Clicks', value: (totalClicks / 1000).toFixed(1) + 'K', icon: MousePointerClick, color: C.blue },
          { label: 'CTR', value: avgCTR + '%', icon: BarChart3, color: C.green },
          { label: 'Revenue', value: '$' + (totalRevenue / 1000).toFixed(0) + 'K', icon: DollarSign, color: C.green },
          { label: 'Active Campaigns', value: String(campaigns.filter(c => c.status === 'Active').length), icon: Target, color: C.orange },
        ].map(kpi => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} color={kpi.color} />
        ))}
      </div>

      {/* Monthly Trend */}
      <Card title="Monthly Ad Revenue &amp; Performance" className="mb-6">
        <ClientChart type="bar" height={260} data={{ labels: monthly.map(m => m.month), datasets: [
          { label: 'Revenue', data: monthly.map(m => m.revenue), backgroundColor: C.green, borderRadius: 4, yAxisID: 'y' },
          { label: 'Impressions', data: monthly.map(m => m.impressions / 1000), borderColor: C.blue, borderWidth: 2, type: 'line' as const, fill: false, tension: 0.3, pointRadius: 4, yAxisID: 'y1' },
        ] }} options={{ plugins: { legend: { display: true, position: 'top' as const, labels: { color: '#8899aa', usePointStyle: true, padding: 16, font: { size: 10 } } }, datalabels: { display: false } }, scales: {
          y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => '$' + (v / 1000).toFixed(0) + 'K' }, title: { display: true, text: 'Revenue', color: '#8899aa', font: { size: 10 } } },
          y1: { beginAtZero: true, position: 'right' as const, grid: { display: false }, ticks: { color: '#8899aa', callback: (v: number) => v + 'K' }, title: { display: true, text: 'Impressions (K)', color: '#8899aa', font: { size: 10 } } },
          x: { grid: { display: false }, ticks: { color: '#8899aa' } },
        } }}
        onPointClick={(label, value, ds) => { /* Could drill down into monthly detail */ }}
        />
      </Card>

      {/* Campaign Table */}
      <Card title="All Campaigns" className="mb-6" noPad detailTitle="Campaign Details" detailContent={
        <div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Full breakdown of all {campaigns.length} campaigns with performance metrics.</p>
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{c.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${statusColors[c.status]?.bg} ${statusColors[c.status]?.color}`} style={c.status === 'Completed' ? { background: 'var(--input-bg)', color: 'var(--text-muted)' } : undefined}>{c.status}</span>
                </div>
                <div className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>{c.advertiser} -- {c.zone} -- {c.start} to {c.end}</div>
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <div><span style={{ color: 'var(--text-muted)' }}>Impressions:</span> <span style={{ color: 'var(--heading)' }}>{c.impressions > 0 ? (c.impressions / 1000).toFixed(0) + 'K' : '--'}</span></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Clicks:</span> <span style={{ color: 'var(--heading)' }}>{c.clicks > 0 ? c.clicks.toLocaleString() : '--'}</span></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>CTR:</span> <span className={c.ctr >= 2 ? 'text-green-400 font-bold' : ''} style={c.ctr < 2 ? { color: 'var(--heading)' } : undefined}>{c.ctr > 0 ? c.ctr + '%' : '--'}</span></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Revenue:</span> <span className="text-green-400 font-bold">{c.revenue > 0 ? '$' + (c.revenue / 1000).toFixed(0) + 'K' : '--'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }>
        <div className="px-5 pb-5">
          <div className="flex items-center justify-end mb-3">
            <button onClick={() => exportCSV(['Campaign', 'Advertiser', 'Status', 'Impressions', 'Clicks', 'CTR', 'Revenue', 'Budget', 'Zone'], campaigns.map(c => [c.name, c.advertiser, c.status, c.impressions, c.clicks, c.ctr + '%', c.revenue, c.budget, c.zone]), 'MEMTrak_Ad_Campaigns')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#8CC63F] hover:bg-[#6fa030]"><Download className="w-3 h-3" /> CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-[10px] uppercase" style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th className="text-left pb-2" style={{ color: 'var(--text-muted)' }}>Campaign</th><th className="text-left pb-2" style={{ color: 'var(--text-muted)' }}>Advertiser</th><th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Status</th><th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>Impressions</th><th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>Clicks</th><th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>CTR</th><th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>Revenue</th><th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>Budget</th>
              </tr></thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id} onClick={() => setDetail(c)} className="cursor-pointer transition-colors" style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--input-bg)')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td className="py-2.5 font-semibold" style={{ color: 'var(--heading)' }}>{c.name}</td>
                    <td className="py-2.5">{c.advertiser}</td>
                    <td className="py-2.5 text-center"><span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${statusColors[c.status]?.bg} ${statusColors[c.status]?.color}`} style={c.status === 'Completed' ? { background: 'var(--input-bg)', color: 'var(--text-muted)' } : undefined}>{c.status}</span></td>
                    <td className="py-2.5 text-right">{c.impressions > 0 ? (c.impressions / 1000).toFixed(0) + 'K' : '—'}</td>
                    <td className="py-2.5 text-right">{c.clicks > 0 ? c.clicks.toLocaleString() : '—'}</td>
                    <td className="py-2.5 text-right">{c.ctr > 0 ? <span className={`font-bold ${c.ctr >= 2 ? 'text-green-400' : ''}`} style={c.ctr < 2 ? { color: 'var(--text-muted)' } : undefined}>{c.ctr}%</span> : '—'}</td>
                    <td className="py-2.5 text-right">{c.revenue > 0 ? <span className="text-green-400 font-bold">${(c.revenue / 1000).toFixed(0)}K</span> : '—'}</td>
                    <td className="py-2.5 text-right">${(c.budget / 1000).toFixed(0)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Ad Zones */}
      <Card title="Ad Zones &amp; Fill Rates" className="mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {zones.map(z => (
            <div key={z.name} className="p-4 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="text-xs font-bold mb-1" style={{ color: 'var(--heading)' }}>{z.name}</div>
              <div className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>{z.size} -- ${z.cpm} CPM</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--input-bg)' }}><div className="h-2 rounded-full" style={{ width: `${z.fill}%`, background: z.fill >= 80 ? C.green : z.fill >= 60 ? C.orange : C.red }} /></div>
                <span className={`text-xs font-bold ${z.fill >= 80 ? 'text-green-400' : z.fill >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{z.fill}%</span>
              </div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{(z.impressions / 1000).toFixed(0)}K impressions</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detail Panel */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDetail(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative rounded-2xl w-full max-w-lg mx-4 p-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)', borderWidth: '1px', borderStyle: 'solid' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-sm font-bold mb-1" style={{ color: 'var(--heading)' }}>{detail.name}</h2>
            <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>{detail.advertiser} -- {detail.zone} -- {detail.start} – {detail.end}</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}><div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{detail.impressions > 0 ? (detail.impressions / 1000).toFixed(0) + 'K' : '—'}</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Impressions</div></div>
              <div className="p-3 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}><div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{detail.clicks.toLocaleString()}</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Clicks</div></div>
              <div className="p-3 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}><div className="text-lg font-extrabold text-green-400">${detail.revenue.toLocaleString()}</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Revenue</div></div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg mb-4" style={{ background: 'var(--input-bg)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Budget utilization</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full" style={{ background: 'var(--input-bg)' }}><div className="h-2 rounded-full bg-green-400" style={{ width: `${detail.budget > 0 ? (detail.revenue / detail.budget * 100) : 0}%` }} /></div>
                <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{detail.budget > 0 ? (detail.revenue / detail.budget * 100).toFixed(0) : 0}%</span>
              </div>
            </div>
            <button onClick={() => setDetail(null)} className="w-full py-2.5 rounded-xl text-xs font-semibold transition-colors" style={{ color: 'var(--text-muted)', borderColor: 'var(--card-border)', borderWidth: '1px', borderStyle: 'solid' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
