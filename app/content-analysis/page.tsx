'use client';

import ClientChart from '@/components/ClientChart';
import { exportCSV } from '@/lib/export-utils';
import { Download } from 'lucide-react';

const C = { navy: '#002D5C', blue: '#4A90D9', green: '#8CC63F', red: '#D94A4A', orange: '#E8923F' };

// Subject line analysis — what HubSpot's AI does for $890/mo
const subjectTests = [
  { subject: 'Action Required: Your PFL Status', openRate: 35.0, type: 'Urgency' },
  { subject: 'Important: PFL Compliance Update', openRate: 27.0, type: 'Generic' },
  { subject: 'Your ALTA Membership Renewal is Due', openRate: 69.8, type: 'Personal' },
  { subject: 'Don\'t Miss ALTA ONE 2026', openRate: 45.0, type: 'FOMO' },
  { subject: 'Welcome to ALTA!', openRate: 82.0, type: 'Welcome' },
  { subject: 'Title News — Week of April 11', openRate: 40.0, type: 'Newsletter' },
  { subject: 'TIPAC: Your Support Makes a Difference', openRate: 50.0, type: 'Impact' },
  { subject: '3 Upcoming Events You Should Attend', openRate: 55.0, type: 'List' },
];

const wordPerformance = [
  { word: 'Action Required', avgOpen: 35, count: 4, verdict: 'Strong' },
  { word: 'Your', avgOpen: 58, count: 12, verdict: 'Excellent' },
  { word: 'Important', avgOpen: 27, count: 6, verdict: 'Weak' },
  { word: 'Welcome', avgOpen: 82, count: 3, verdict: 'Excellent' },
  { word: 'Don\'t Miss', avgOpen: 45, count: 5, verdict: 'Good' },
  { word: 'Free', avgOpen: 22, count: 2, verdict: 'Spam risk' },
  { word: 'Reminder', avgOpen: 38, count: 8, verdict: 'Average' },
  { word: 'Update', avgOpen: 32, count: 7, verdict: 'Average' },
];

const ctaPerformance = [
  { cta: 'Register Now', clickRate: 16.3, uses: 8 },
  { cta: 'Renew Your Membership', clickRate: 39.2, uses: 4 },
  { cta: 'View Your Status', clickRate: 8.3, uses: 6 },
  { cta: 'Learn More', clickRate: 5.1, uses: 12 },
  { cta: 'Download Report', clickRate: 12.8, uses: 3 },
  { cta: 'RSVP Today', clickRate: 18.7, uses: 5 },
];

const sendTimePerf = [
  { time: '6-8 AM', openRate: 32, volume: 4200 },
  { time: '8-10 AM', openRate: 42, volume: 8600 },
  { time: '10-12 PM', openRate: 38, volume: 6100 },
  { time: '12-2 PM', openRate: 35, volume: 3800 },
  { time: '2-4 PM', openRate: 28, volume: 2900 },
  { time: '4-6 PM', openRate: 24, volume: 1800 },
];

export default function ContentAnalysis() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Content Performance Analysis</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>What works and what doesn&apos;t — subject line words, CTA placement, send timing. What HubSpot&apos;s AI analyzes for $890/mo. MEMTrak does it automatically.</p>

      {/* Subject Line Analysis */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Subject Line Performance</h3>
        <ClientChart type="bar" height={280} data={{
          labels: subjectTests.map(s => s.subject.length > 30 ? s.subject.slice(0, 30) + '...' : s.subject),
          datasets: [{ label: 'Open Rate', data: subjectTests.map(s => s.openRate), backgroundColor: subjectTests.map(s => s.openRate >= 50 ? C.green : s.openRate >= 35 ? C.blue : C.orange), borderRadius: 6 }],
        }} options={{
          indexAxis: 'y' as const,
          plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'end' as const, color: 'var(--heading)', font: { weight: 'bold' as const, size: 10 }, formatter: (v: number) => v + '%' } },
          scales: { x: { beginAtZero: true, max: 100, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => v + '%' } }, y: { grid: { display: false }, ticks: { color: 'var(--text-muted)', font: { size: 9 } } } },
        }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Word Performance */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Subject Line Word Performance</h3>
            <button onClick={() => exportCSV(['Word', 'Avg Open Rate', 'Times Used', 'Verdict'], wordPerformance.map(w => [w.word, w.avgOpen + '%', w.count, w.verdict]), 'MEMTrak_Word_Performance')} className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: 'var(--accent)' }}><Download className="w-3 h-3" /> CSV</button>
          </div>
          <div className="space-y-2">
            {wordPerformance.sort((a, b) => b.avgOpen - a.avgOpen).map(w => (
              <div key={w.word} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'var(--background)' }}>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>"{w.word}"</span>
                    <span className="text-xs font-bold" style={{ color: w.avgOpen >= 50 ? C.green : w.avgOpen >= 35 ? C.blue : w.avgOpen >= 25 ? C.orange : C.red }}>{w.avgOpen}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex-1 h-1.5 rounded-full mr-3" style={{ background: 'var(--card-border)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${w.avgOpen}%`, background: w.avgOpen >= 50 ? C.green : w.avgOpen >= 35 ? C.blue : C.orange }} />
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${w.verdict === 'Excellent' ? 'bg-green-500/20 text-green-400' : w.verdict === 'Strong' || w.verdict === 'Good' ? 'bg-blue-500/20 text-blue-400' : w.verdict === 'Spam risk' ? 'bg-red-500/20 text-red-400' : 'bg-white/10'}`} style={w.verdict === 'Average' ? { color: 'var(--text-muted)' } : {}}>{w.verdict}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Performance */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Call-to-Action Click Rates</h3>
          <ClientChart type="bar" height={240} data={{
            labels: ctaPerformance.sort((a, b) => b.clickRate - a.clickRate).map(c => c.cta),
            datasets: [{ label: 'Click Rate', data: ctaPerformance.sort((a, b) => b.clickRate - a.clickRate).map(c => c.clickRate), backgroundColor: ctaPerformance.sort((a, b) => b.clickRate - a.clickRate).map(c => c.clickRate >= 15 ? C.green : c.clickRate >= 10 ? C.blue : C.orange), borderRadius: 6 }],
          }} options={{
            plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: 'var(--heading)', font: { weight: 'bold' as const, size: 10 }, formatter: (v: number) => v + '%' } },
            scales: { y: { beginAtZero: true, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => v + '%' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)', font: { size: 9 } } } },
          }} />
          <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(140,198,63,0.08)', border: '1px solid rgba(140,198,63,0.2)' }}>
            <p className="text-[10px]" style={{ color: 'var(--heading)' }}><strong>Recommendation:</strong> "Renew Your Membership" has a 39.2% CTR — 8x better than "Learn More." Use specific, action-oriented CTAs that tell the reader exactly what they&apos;ll do.</p>
          </div>
        </div>
      </div>

      {/* Send Time Heatmap */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Send Time vs Open Rate</h3>
        <ClientChart type="bar" height={220} data={{
          labels: sendTimePerf.map(s => s.time),
          datasets: [
            { label: 'Open Rate', data: sendTimePerf.map(s => s.openRate), backgroundColor: sendTimePerf.map(s => s.openRate >= 40 ? C.green : s.openRate >= 30 ? C.blue : C.orange), borderRadius: 6, yAxisID: 'y' },
            { label: 'Volume Sent', data: sendTimePerf.map(s => s.volume), borderColor: 'var(--text-muted)', borderWidth: 2, type: 'line' as const, fill: false, tension: 0.3, pointRadius: 4, yAxisID: 'y1' },
          ],
        }} options={{
          plugins: { legend: { display: true, position: 'top' as const, labels: { color: 'var(--text-muted)', usePointStyle: true, padding: 16, font: { size: 10 } } }, datalabels: { display: false } },
          scales: {
            y: { beginAtZero: true, max: 50, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => v + '%' }, title: { display: true, text: 'Open Rate', color: 'var(--text-muted)', font: { size: 10 } } },
            y1: { beginAtZero: true, position: 'right' as const, grid: { display: false }, ticks: { color: 'var(--text-muted)' }, title: { display: true, text: 'Volume', color: 'var(--text-muted)', font: { size: 10 } } },
            x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } },
          },
        }} />
      </div>
    </div>
  );
}
