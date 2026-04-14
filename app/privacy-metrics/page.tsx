'use client';

import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import { Shield, Eye, MousePointerClick, AlertTriangle, CheckCircle } from 'lucide-react';

const C = { green: '#8CC63F', blue: '#4A90D9', red: '#D94A4A', orange: '#E8923F', navy: '#002D5C' };

// Privacy-first metrics — post Apple Mail Privacy Protection
// Apple MPP pre-fetches ALL images, inflating open rates by ~30-40%
const metrics = {
  reportedOpenRate: 42.3,
  estimatedRealOpenRate: 29.6, // Adjusted for Apple MPP inflation
  appleMPPImpact: 30, // % of opens that are machine-generated
  clickRate: 14.0, // This is REAL — clicks can't be faked
  confirmedReceipts: 8.2, // MEMTrak confirm/deny — 100% reliable
  logoTrackerRate: 35.8, // Logo opens — less affected by MPP
  conversionRate: 5.8, // Email → action (renewal, registration, purchase)
};

const metricsReliability = [
  { metric: 'Conversion Rate', reliability: 100, desc: 'Someone took a trackable action (renewed, registered, purchased). The gold standard.', recommended: true },
  { metric: 'Click Rate', reliability: 100, desc: 'They clicked a link. No email client blocks this. Always reliable.', recommended: true },
  { metric: 'Confirmed Receipt', reliability: 100, desc: 'MEMTrak exclusive: recipient clicked "I received this." Explicit action.', recommended: true },
  { metric: 'Logo Tracker Open', reliability: 85, desc: 'ALTA logo loaded = real open. Less affected by MPP than invisible pixels.', recommended: true },
  { metric: 'Pixel Open Rate', reliability: 60, desc: 'Traditional tracking pixel. Inflated 30-40% by Apple MPP, blocked by corporate Outlook.', recommended: false },
  { metric: 'Reported Open Rate', reliability: 45, desc: 'What most ESPs show. Includes machine opens. Unreliable as primary metric.', recommended: false },
];

const monthlyComparison = [
  { month: 'Jan', reported: 36, adjusted: 25, clicks: 10.4, conversions: 4.2 },
  { month: 'Feb', reported: 36, adjusted: 25, clicks: 10.4, conversions: 4.5 },
  { month: 'Mar', reported: 40, adjusted: 28, clicks: 12.0, conversions: 5.8 },
  { month: 'Apr', reported: 42, adjusted: 30, clicks: 14.0, conversions: 5.8 },
];

export default function PrivacyMetrics() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Privacy-First Metrics</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Post-Apple MPP, open rates are inflated 30-40% by machine reads. MEMTrak uses click-based and conversion-based metrics as primary KPIs — what Instantly and Insider One recommend as the future of email analytics.</p>

      {/* The Problem */}
      <div className="rounded-xl border p-5 mb-6 border-l-4" style={{ background: 'var(--card)', borderColor: 'var(--card-border)', borderLeftColor: C.orange }}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: C.orange }} />
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Why Open Rates Are No Longer Reliable</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Apple Mail Privacy Protection (MPP), launched in 2021, pre-fetches ALL tracking pixels for Apple Mail users — regardless of whether they actually read the email. This means ~40% of ALTA&apos;s member base generates &quot;opens&quot; automatically. Corporate Outlook blocks pixels entirely for another ~20%. The result: reported open rates are fiction. MEMTrak solves this by prioritizing metrics that CAN&apos;T be faked.
            </p>
          </div>
        </div>
      </div>

      {/* Real vs Reported */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold line-through" style={{ color: C.red }}>{metrics.reportedOpenRate}%</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Reported Open Rate</div>
          <div className="text-[9px]" style={{ color: C.red }}>Inflated — includes machine opens</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: C.blue }}>{metrics.estimatedRealOpenRate}%</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Estimated Real Opens</div>
          <div className="text-[9px]" style={{ color: C.blue }}>Adjusted for MPP inflation</div>
        </div>
        <div className="rounded-xl border p-4 text-center border-2" style={{ background: 'var(--card)', borderColor: C.green }}>
          <div className="text-2xl font-extrabold" style={{ color: C.green }}>{metrics.clickRate}%</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Click Rate (TRUE)</div>
          <div className="text-[9px]" style={{ color: C.green }}>100% reliable — can&apos;t be faked</div>
        </div>
        <div className="rounded-xl border p-4 text-center border-2" style={{ background: 'var(--card)', borderColor: C.green }}>
          <div className="text-2xl font-extrabold" style={{ color: C.green }}>{metrics.conversionRate}%</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Conversion Rate (TRUE)</div>
          <div className="text-[9px]" style={{ color: C.green }}>Email → action. The gold standard.</div>
        </div>
      </div>

      {/* Metric Reliability Ranking */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Metric Reliability Ranking</h3>
        <div className="space-y-2">
          {metricsReliability.map(m => (
            <div key={m.metric} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <ProgressRing value={m.reliability} max={100} size={48} color={m.reliability >= 90 ? C.green : m.reliability >= 70 ? C.blue : m.reliability >= 50 ? C.orange : C.red} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{m.metric}</span>
                  {m.recommended ? (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-green-500/20 text-green-400">Recommended</span>
                  ) : (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold bg-red-500/20 text-red-400">Unreliable</span>
                  )}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Comparison Chart */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Reported vs Real Metrics — Monthly Trend</h3>
        <ClientChart type="line" height={280} data={{
          labels: monthlyComparison.map(m => m.month),
          datasets: [
            { label: 'Reported Opens (inflated)', data: monthlyComparison.map(m => m.reported), borderColor: C.red, borderWidth: 2, borderDash: [6, 4], fill: false, tension: 0.3, pointRadius: 4 },
            { label: 'Adjusted Opens (real)', data: monthlyComparison.map(m => m.adjusted), borderColor: C.blue, borderWidth: 2, fill: false, tension: 0.3, pointRadius: 4 },
            { label: 'Click Rate (reliable)', data: monthlyComparison.map(m => m.clicks), borderColor: C.green, borderWidth: 2.5, fill: true, backgroundColor: 'rgba(140,198,63,0.08)', tension: 0.3, pointRadius: 5 },
            { label: 'Conversion Rate (gold std)', data: monthlyComparison.map(m => m.conversions), borderColor: '#C6A75E', borderWidth: 2.5, fill: false, tension: 0.3, pointRadius: 5 },
          ],
        }} options={{
          plugins: { legend: { display: true, position: 'top' as const, labels: { color: 'var(--text-muted)', usePointStyle: true, padding: 14, font: { size: 10 } } }, datalabels: { display: false } },
          scales: { y: { beginAtZero: true, max: 50, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => v + '%' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } } },
        }} />
      </div>
    </div>
  );
}
