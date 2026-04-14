'use client';

import ClientChart from '@/components/ClientChart';
import Card from '@/components/Card';

const C = { green: '#8CC63F', red: '#D94A4A', blue: '#4A90D9', navy: '#1B3A5C', orange: '#E8923F' };

const tests = [
  {
    id: 1, name: 'PFL Compliance Subject Line Test', status: 'Completed', winner: 'B',
    a: { subject: 'Important: Your PFL Compliance Status', sent: 1600, opened: 432, clicked: 108, openRate: 27.0 },
    b: { subject: 'Action Required: PFL License Renewal Deadline', sent: 1600, opened: 560, clicked: 162, openRate: 35.0 },
    lift: '+29.6%', insight: 'Urgency-based subject ("Action Required") outperformed generic "Important" by 29.6%. Recommend urgency framing for all compliance emails.',
    confidence: 99.2, pValue: 0.0003, ciLow: 21.4, ciHigh: 38.1,
    recommendation: 'Adopt "Action Required" framing as the default for all PFL compliance communications. Apply urgency patterns to related emails (CE deadlines, license expirations).',
  },
  {
    id: 2, name: 'Renewal Email Send Time Test', status: 'Completed', winner: 'A',
    a: { subject: 'Tuesday 9:00 AM ET', sent: 210, opened: 143, clicked: 84, openRate: 68.1 },
    b: { subject: 'Thursday 2:00 PM ET', sent: 210, opened: 118, clicked: 62, openRate: 56.2 },
    lift: '+21.2%', insight: 'Tuesday morning sends had 21% higher open rate for renewal emails. Aligns with MEMTrak send-time optimization data for this segment.',
    confidence: 94.8, pValue: 0.018, ciLow: 4.1, ciHigh: 39.7,
    recommendation: 'Schedule all renewal-related emails for Tuesday mornings (9:00 AM ET). Consider testing Wednesday 9 AM as an alternative for follow-up sends.',
  },
  {
    id: 3, name: 'ALTA ONE From Address Test', status: 'Running',
    a: { subject: 'From: membership@alta.org', sent: 2497, opened: 1024, clicked: 380, openRate: 41.0 },
    b: { subject: 'From: cmorton@alta.org (CEO)', sent: 2497, opened: 1286, clicked: 498, openRate: 51.5 },
    lift: '+25.6% (preliminary)', insight: 'CEO-signed emails showing 25.6% lift. Running for 7 more days before declaring winner.',
    confidence: 97.3, pValue: 0.0008, ciLow: 19.2, ciHigh: 32.4,
    recommendation: 'Preliminary results strongly favor CEO-signed emails. If trend holds after full run, adopt personal from-address for high-importance sends (renewals, ALTA ONE, advocacy).',
  },
];

export default function ABTesting() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-6" style={{ color: 'var(--heading)' }}>A/B Testing</h1>

      <div className="space-y-6">
        {tests.map(test => (
          <Card
            key={test.id}
            detailTitle={`${test.name} — Statistical Analysis`}
            detailContent={
              <div className="space-y-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${test.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{test.status}</span>
                  <span className="font-bold" style={{ color: 'var(--heading)' }}>{test.lift} lift</span>
                </div>

                <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="font-bold mb-2" style={{ color: 'var(--heading)' }}>Statistical Significance</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>Confidence Level</div>
                      <div className={`text-lg font-extrabold ${test.confidence >= 95 ? 'text-green-400' : 'text-amber-400'}`}>{test.confidence}%</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)' }}>p-value</div>
                      <div className={`text-lg font-extrabold ${test.pValue < 0.05 ? 'text-green-400' : 'text-amber-400'}`}>{test.pValue}</div>
                    </div>
                  </div>
                  <div className="mt-2" style={{ color: 'var(--text-muted)' }}>
                    {test.confidence >= 95
                      ? 'Result is statistically significant at the 95% confidence threshold.'
                      : 'Result does not yet meet the 95% confidence threshold. Consider extending the test.'}
                  </div>
                </div>

                <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="font-bold mb-2" style={{ color: 'var(--heading)' }}>Confidence Interval (Lift)</div>
                  <div className="flex items-center gap-4">
                    <span className="text-amber-400 font-bold">+{test.ciLow}%</span>
                    <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--card-border)' }}>
                      <div className="h-full rounded-full bg-green-400" style={{ marginLeft: `${test.ciLow}%`, width: `${test.ciHigh - test.ciLow}%` }} />
                    </div>
                    <span className="text-green-400 font-bold">+{test.ciHigh}%</span>
                  </div>
                  <div className="mt-1" style={{ color: 'var(--text-muted)' }}>95% CI: the true lift is between +{test.ciLow}% and +{test.ciHigh}%</div>
                </div>

                <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="font-bold mb-2" style={{ color: 'var(--heading)' }}>Detailed Metrics</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-bold mb-1" style={{ color: 'var(--heading)' }}>Variant A</div>
                      <div className="space-y-1">
                        <div className="flex justify-between"><span>Sent</span><span className="font-bold" style={{ color: 'var(--heading)' }}>{test.a.sent.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Opened</span><span className="font-bold" style={{ color: 'var(--heading)' }}>{test.a.opened.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Clicked</span><span className="font-bold" style={{ color: 'var(--heading)' }}>{test.a.clicked.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Open Rate</span><span className="font-bold text-blue-400">{test.a.openRate}%</span></div>
                        <div className="flex justify-between"><span>CTR</span><span className="font-bold text-blue-400">{(test.a.clicked / test.a.sent * 100).toFixed(1)}%</span></div>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold mb-1" style={{ color: 'var(--heading)' }}>Variant B</div>
                      <div className="space-y-1">
                        <div className="flex justify-between"><span>Sent</span><span className="font-bold" style={{ color: 'var(--heading)' }}>{test.b.sent.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Opened</span><span className="font-bold" style={{ color: 'var(--heading)' }}>{test.b.opened.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Clicked</span><span className="font-bold" style={{ color: 'var(--heading)' }}>{test.b.clicked.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Open Rate</span><span className="font-bold text-green-400">{test.b.openRate}%</span></div>
                        <div className="flex justify-between"><span>CTR</span><span className="font-bold text-green-400">{(test.b.clicked / test.b.sent * 100).toFixed(1)}%</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border" style={{ background: 'color-mix(in srgb, #8CC63F 5%, transparent)', borderColor: 'color-mix(in srgb, #8CC63F 20%, transparent)' }}>
                  <div className="font-bold mb-1" style={{ color: '#8CC63F' }}>Recommendation</div>
                  <div style={{ color: 'var(--text-muted)' }}>{test.recommendation}</div>
                </div>
              </div>
            }
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{test.name}</h3>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${test.status === 'Completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{test.status}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-[#8CC63F]">{test.lift}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>lift for {test.winner === 'A' ? 'Variant A' : 'Variant B'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`p-4 rounded-lg ${test.winner === 'A' ? 'bg-green-500/10 border-2 border-green-500/30' : ''}`} style={test.winner !== 'A' ? { background: 'var(--input-bg)', border: '1px solid var(--card-border)' } : undefined}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Variant A</span>
                  {test.winner === 'A' && <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold">WINNER</span>}
                </div>
                <div className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>{test.a.subject}</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>{test.a.openRate}%</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Open Rate</div></div>
                  <div><div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>{test.a.opened}</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Opened</div></div>
                  <div><div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>{test.a.clicked}</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Clicked</div></div>
                </div>
              </div>
              <div className={`p-4 rounded-lg ${test.winner === 'B' ? 'bg-green-500/10 border-2 border-green-500/30' : ''}`} style={test.winner !== 'B' ? { background: 'var(--input-bg)', border: '1px solid var(--card-border)' } : undefined}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Variant B</span>
                  {test.winner === 'B' && <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold">WINNER</span>}
                </div>
                <div className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>{test.b.subject}</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>{test.b.openRate}%</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Open Rate</div></div>
                  <div><div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>{test.b.opened}</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Opened</div></div>
                  <div><div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>{test.b.clicked}</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Clicked</div></div>
                </div>
              </div>
            </div>

            {/* Comparison chart */}
            <ClientChart type="bar" height={160} data={{ labels: ['Open Rate', 'Clicks'], datasets: [
              { label: 'Variant A', data: [test.a.openRate, (test.a.clicked / test.a.sent * 100)], backgroundColor: C.blue, borderRadius: 4 },
              { label: 'Variant B', data: [test.b.openRate, (test.b.clicked / test.b.sent * 100)], backgroundColor: C.green, borderRadius: 4 },
            ] }} options={{ plugins: { legend: { display: true, position: 'top' as const, labels: { color: '#8899aa', usePointStyle: true, padding: 16, font: { size: 10 } } }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: '#e2e8f0', font: { weight: 'bold' as const, size: 10 }, formatter: (v: number) => v.toFixed(1) + '%' } }, scales: { y: { beginAtZero: true, max: 60, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => v + '%' } }, x: { grid: { display: false }, ticks: { color: '#8899aa' } } } }} />

            <div className="mt-3 p-3 rounded-lg bg-[#8CC63F]/10 border border-[#8CC63F]/20 text-xs text-[#8CC63F]">
              <strong>Insight:</strong> {test.insight}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
