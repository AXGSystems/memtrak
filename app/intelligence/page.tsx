'use client';

import ClientChart from '@/components/ClientChart';
import Card from '@/components/Card';
import { demoDecayAlerts, demoChurnScores, demoSendTimes, demoRelationships } from '@/lib/demo-data';

const C = { navy: '#1B3A5C', blue: '#4A90D9', green: '#8CC63F', red: '#D94A4A', orange: '#E8923F' };

export default function Intelligence() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold text-white mb-6">Intelligence</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Engagement Decay Alerts" subtitle="Members going dark" accent="#D94A4A" detailTitle="Decay Analysis" detailContent={<div><p className="text-xs" style={{ color: "var(--text-muted)" }}>Members whose email open rate has dropped significantly. A decay score of 70+ typically predicts non-renewal within 3-6 months. Total revenue at risk from decaying members: ${demoDecayAlerts.filter(d => d.decay >= 50).reduce((s: number, d: {revenue: number}) => s + d.revenue, 0).toLocaleString()}.</p></div>}>
          <h3 className="text-xs font-bold text-white mb-3">Engagement Decay Alerts</h3>
          <p className="text-[10px] text-white/40 mb-3">Members going dark — early churn warning. ${demoDecayAlerts.filter(d => d.decay >= 50).reduce((s, d) => s + d.revenue, 0).toLocaleString()} revenue at risk.</p>
          <div className="space-y-2">
            {demoDecayAlerts.map(d => (
              <div key={d.email} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <div className={`text-lg font-extrabold w-10 text-center ${d.decay >= 70 ? 'text-red-400' : d.decay >= 40 ? 'text-amber-400' : 'text-green-400'}`}>{d.decay}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white">{d.org} <span className="text-white/30">{d.type}</span></div>
                  <div className="text-[10px] text-white/40">Open: {d.historical}% → {d.recent}% · Last: {d.lastOpen} · <span className="text-red-400">${d.revenue.toLocaleString()}</span></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Predictive Churn Scores" subtitle="AI-scored non-renewal risk" accent="#E8923F" detailTitle="Churn Prediction" detailContent={<div><p className="text-xs" style={{ color: "var(--text-muted)" }}>MEMTrak combines email engagement, event attendance, payment behavior, and member type to predict churn. ACU members are weighted 50x due to revenue impact. Scores above 70 predict non-renewal.</p></div>}>
          <h3 className="text-xs font-bold text-white mb-3">Predictive Churn Scores</h3>
          <p className="text-[10px] text-white/40 mb-3">AI-scored non-renewal probability with recommended actions.</p>
          <div className="space-y-2">
            {demoChurnScores.map(c => (
              <div key={c.org} className="p-3 rounded-lg bg-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{c.org} <span className="text-white/30">{c.type}</span></span>
                  <span className={`text-sm font-extrabold ${c.score >= 70 ? 'text-red-400' : c.score >= 50 ? 'text-amber-400' : 'text-green-400'}`}>{c.score}%</span>
                </div>
                <div className="text-[10px] text-white/40 mt-1">{c.factors.join(' · ')}</div>
                <div className="text-[10px] text-green-400 font-semibold mt-1">{c.action}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="text-xs font-bold text-white mb-3">Optimal Send Times by Segment</h3>
          <ClientChart type="bar" height={220} data={{ labels: demoSendTimes.map(s => s.segment), datasets: [{ label: 'Open Rate', data: demoSendTimes.map(s => s.openRate), backgroundColor: demoSendTimes.map(s => s.openRate >= 60 ? C.green : s.openRate >= 40 ? C.blue : C.orange), borderRadius: 6 }] }} options={{ indexAxis: 'y' as const, plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'end' as const, color: '#e2e8f0', font: { weight: 'bold' as const, size: 10 }, formatter: (v: number) => v + '%' } }, scales: { x: { beginAtZero: true, max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } }, y: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 } } } } }} />
          <div className="mt-3 space-y-1">{demoSendTimes.map(s => (<div key={s.segment} className="flex items-center justify-between text-[10px] text-white/40"><span>{s.segment}</span><span className="text-white/60">{s.day} {s.time}</span></div>))}</div>
        </Card>

        <Card className="p-5">
          <h3 className="text-xs font-bold text-white mb-3">Staff Relationship Mapping</h3>
          <div className="space-y-2">
            {demoRelationships.map(r => (
              <div key={r.staff} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <div className={`text-lg font-extrabold w-12 text-center ${r.strength === 'Exceptional' ? 'text-green-400' : r.strength === 'Strong' ? 'text-blue-400' : 'text-amber-400'}`}>{r.replyRate}%</div>
                <div className="flex-1"><div className="text-xs font-bold text-white">{r.staff}</div><div className="text-[10px] text-white/40">{r.outreach} touches · {r.responseTime} avg</div></div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${r.strength === 'Exceptional' ? 'bg-green-500/20 text-green-400' : r.strength === 'Strong' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>{r.strength}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
