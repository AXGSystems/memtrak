'use client';

import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import { exportCSV } from '@/lib/export-utils';
import { Download, TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';

const C = { navy: '#002D5C', blue: '#4A90D9', green: '#8CC63F', red: '#D94A4A', orange: '#E8923F', purple: '#a855f7' };

// Engagement scoring model — what ActiveCampaign charges $186/mo for
const scoringModel = [
  { factor: 'Email Opens (last 90d)', weight: 25, description: 'How often they open emails from ALTA' },
  { factor: 'Email Clicks (last 90d)', weight: 20, description: 'Did they click through to content or registration?' },
  { factor: 'Event Attendance (YTD)', weight: 20, description: 'Webinars, conferences, regional events' },
  { factor: 'Committee Participation', weight: 15, description: 'Engagement group or board involvement' },
  { factor: 'Dues Payment Timeliness', weight: 10, description: 'Early, on-time, late, or overdue' },
  { factor: 'Website Activity (GA4)', weight: 10, description: 'Page views, resource downloads, login frequency' },
];

// Member scores — what Klaviyo charges $150/mo+ for
const memberScores = [
  { org: 'First American Title', type: 'ACU', score: 94, ltv: 308000, trend: 'stable', emails: 92, clicks: 45, events: 8, dues: 'Early', risk: 'Low' },
  { org: 'Commonwealth Land Title', type: 'ACA', score: 87, ltv: 12160, trend: 'rising', emails: 88, clicks: 38, events: 5, dues: 'On-time', risk: 'Low' },
  { org: 'Old Republic Title', type: 'ACU', score: 82, ltv: 246000, trend: 'stable', emails: 78, clicks: 32, events: 4, dues: 'On-time', risk: 'Low' },
  { org: 'Liberty Title Group', type: 'ACA', score: 65, ltv: 8512, trend: 'declining', emails: 50, clicks: 18, events: 2, dues: 'On-time', risk: 'Medium' },
  { org: 'Stewart Title', type: 'ACU', score: 58, ltv: 184662, trend: 'declining', emails: 42, clicks: 12, events: 1, dues: 'Late', risk: 'High' },
  { org: 'National Title Services', type: 'REA', score: 38, ltv: 2646, trend: 'declining', emails: 30, clicks: 5, events: 0, dues: 'Late', risk: 'High' },
  { org: 'Heritage Abstract LLC', type: 'ACB', score: 8, ltv: 1551, trend: 'gone-dark', emails: 0, clicks: 0, events: 0, dues: 'Overdue', risk: 'Critical' },
];

const scoreDistribution = [
  { range: '90-100 (Champions)', count: 420, pct: 8.4, color: C.green },
  { range: '70-89 (Engaged)', count: 1850, pct: 37.1, color: C.blue },
  { range: '50-69 (At Risk)', count: 1520, pct: 30.4, color: C.orange },
  { range: '25-49 (Disengaged)', count: 860, pct: 17.2, color: C.red },
  { range: '0-24 (Gone Dark)', count: 344, pct: 6.9, color: '#666' },
];

const riskColors: Record<string, string> = { Low: 'text-green-400', Medium: 'text-amber-400', High: 'text-red-400', Critical: 'text-red-500 font-extrabold' };

export default function Scoring() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Engagement Scoring & Member Lifetime Value</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Per-member composite scoring + predicted lifetime revenue — what ActiveCampaign and Klaviyo charge $300+/mo for. MEMTrak does it for free.</p>

      {/* Score Distribution */}
      <div className="grid grid-cols-5 gap-3 mb-6 stagger-children">
        {scoreDistribution.map(d => (
          <div key={d.range} className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
            <div className="text-2xl font-extrabold" style={{ color: d.color }}>{d.count.toLocaleString()}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{d.range}</div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{d.pct}% of members</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Scoring Model */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Scoring Model (6 Factors)</h3>
          <p className="text-[10px] mb-3" style={{ color: 'var(--text-muted)' }}>Each member gets a 0-100 engagement score based on weighted factors. Updated in real-time as new data arrives.</p>
          <div className="space-y-2">
            {scoringModel.map(f => (
              <div key={f.factor} className="flex items-center gap-3">
                <div className="w-full">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span style={{ color: 'var(--heading)' }}>{f.factor}</span>
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>{f.weight}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--card-border)' }}>
                    <div className="h-2 rounded-full" style={{ width: `${f.weight}%`, background: 'var(--accent)' }} />
                  </div>
                  <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{f.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Distribution Chart */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Member Score Distribution</h3>
          <ClientChart type="doughnut" height={280} data={{
            labels: scoreDistribution.map(d => d.range),
            datasets: [{ data: scoreDistribution.map(d => d.count), backgroundColor: scoreDistribution.map(d => d.color), borderWidth: 2, borderColor: 'var(--card)', hoverOffset: 10 }],
          }} />
        </div>
      </div>

      {/* Member Scoreboard with LTV */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Member Scoreboard — Engagement + Lifetime Value</h3>
          <button onClick={() => exportCSV(['Organization', 'Type', 'Score', 'LTV (5yr)', 'Email Open %', 'Click %', 'Events', 'Dues', 'Risk'], memberScores.map(m => [m.org, m.type, m.score, m.ltv, m.emails + '%', m.clicks + '%', m.events, m.dues, m.risk]), 'MEMTrak_Engagement_Scores')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ color: 'var(--accent)', border: '1px solid var(--card-border)' }}>
            <Download className="w-3 h-3" /> CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th className="text-left pb-2" style={{ color: 'var(--text-muted)' }}>Organization</th>
              <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Score</th>
              <th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>5yr LTV</th>
              <th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>Opens</th>
              <th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>Clicks</th>
              <th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>Events</th>
              <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Dues</th>
              <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Trend</th>
              <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Risk</th>
            </tr></thead>
            <tbody>
              {memberScores.map(m => (
                <tr key={m.org} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td className="py-2.5 font-semibold" style={{ color: 'var(--heading)' }}>{m.org} <span className="font-normal" style={{ color: 'var(--text-muted)' }}>({m.type})</span></td>
                  <td className="py-2.5 text-center">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full font-extrabold text-sm" style={{ background: m.score >= 80 ? 'rgba(140,198,63,0.15)' : m.score >= 50 ? 'rgba(74,144,217,0.15)' : m.score >= 25 ? 'rgba(232,146,63,0.15)' : 'rgba(217,74,74,0.15)', color: m.score >= 80 ? C.green : m.score >= 50 ? C.blue : m.score >= 25 ? C.orange : C.red }}>{m.score}</span>
                  </td>
                  <td className="py-2.5 text-right font-bold" style={{ color: 'var(--accent)' }}>${m.ltv.toLocaleString()}</td>
                  <td className="py-2.5 text-right" style={{ color: m.emails >= 70 ? C.green : m.emails >= 40 ? C.orange : C.red }}>{m.emails}%</td>
                  <td className="py-2.5 text-right" style={{ color: 'var(--heading)' }}>{m.clicks}%</td>
                  <td className="py-2.5 text-right" style={{ color: 'var(--heading)' }}>{m.events}</td>
                  <td className="py-2.5 text-center"><span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${m.dues === 'Early' ? 'bg-green-500/20 text-green-400' : m.dues === 'On-time' ? 'bg-blue-500/20 text-blue-400' : m.dues === 'Late' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{m.dues}</span></td>
                  <td className="py-2.5 text-center"><span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${m.trend === 'rising' ? 'bg-green-500/20 text-green-400' : m.trend === 'stable' ? 'bg-blue-500/20 text-blue-400' : m.trend === 'declining' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{m.trend}</span></td>
                  <td className={`py-2.5 text-center font-bold ${riskColors[m.risk]}`}>{m.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LTV Chart */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>5-Year Lifetime Value by Member</h3>
        <ClientChart type="bar" height={260} data={{
          labels: memberScores.map(m => m.org.length > 16 ? m.org.slice(0, 16) + '...' : m.org),
          datasets: [{ label: '5yr LTV', data: memberScores.map(m => m.ltv), backgroundColor: memberScores.map(m => m.score >= 80 ? C.green : m.score >= 50 ? C.blue : m.score >= 25 ? C.orange : C.red), borderRadius: 6 }],
        }} options={{
          plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: 'var(--heading)', font: { weight: 'bold' as const, size: 9 }, formatter: (v: number) => v >= 1e6 ? '$' + (v/1e6).toFixed(1) + 'M' : v >= 1e3 ? '$' + (v/1e3).toFixed(0) + 'K' : '$' + v } },
          scales: { y: { beginAtZero: true, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => '$' + (v/1e3).toFixed(0) + 'K' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)', font: { size: 9 } } } },
        }} />
      </div>
    </div>
  );
}
