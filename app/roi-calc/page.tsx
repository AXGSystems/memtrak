'use client';

import { useState } from 'react';
import ClientChart from '@/components/ClientChart';

const C = { green: '#8CC63F', red: '#D94A4A', navy: '#002D5C' };

const competitors = [
  { name: 'Higher Logic', monthly: 2250, annual: 27000, features: 'Email + community', missing: 'No engagement scoring, no churn prediction, no revenue attribution' },
  { name: 'ActiveCampaign', monthly: 186, annual: 2232, features: 'Automation + scoring', missing: 'No AMS integration, no physical mail scanning, no ad server' },
  { name: 'HubSpot Pro', monthly: 890, annual: 10680, features: 'CRM + email + AI', missing: 'No association features, $3K onboarding, forced annual billing' },
  { name: 'Klaviyo', monthly: 150, annual: 1800, features: 'Predictive LTV + scoring', missing: 'E-commerce focused, no association model, no membership tracking' },
  { name: 'GlockApps', monthly: 59, annual: 708, features: 'Spam testing + blacklist', missing: 'Testing only — no sending, no tracking, no analytics' },
  { name: 'MEMTrak', monthly: 75, annual: 900, features: 'Everything above + association-specific', missing: '' },
];

export default function ROICalc() {
  const [currentSpend, setCurrentSpend] = useState(2500);

  const savings = (currentSpend * 12) - 900;
  const savingsPct = ((savings / (currentSpend * 12)) * 100).toFixed(0);

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>ROI Calculator</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>See exactly how much MEMTrak saves compared to your current tools.</p>

      {/* Interactive Calculator */}
      <div className="rounded-xl border p-6 mb-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--heading)' }}>What do you currently spend on email/marketing tools?</h3>
        <input type="range" min={0} max={5000} step={50} value={currentSpend} onChange={e => setCurrentSpend(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ background: 'var(--card-border)', accentColor: 'var(--accent)' }} />
        <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}><span>$0/mo</span><span className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>${currentSpend.toLocaleString()}/mo</span><span>$5,000/mo</span></div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl text-center" style={{ background: 'var(--background)' }}>
            <div className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Current Annual</div>
            <div className="text-xl font-extrabold" style={{ color: C.red }}>${(currentSpend * 12).toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ background: 'var(--background)' }}>
            <div className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>MEMTrak Annual</div>
            <div className="text-xl font-extrabold" style={{ color: C.green }}>$900</div>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
            <div className="text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>You Save</div>
            <div className="text-xl font-extrabold" style={{ color: 'var(--accent)' }}>${savings.toLocaleString()}/yr</div>
            <div className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{savingsPct}% savings</div>
          </div>
        </div>
      </div>

      {/* Competitor Comparison */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Competitor Comparison</h3>
        <ClientChart type="bar" height={260} data={{
          labels: competitors.map(c => c.name),
          datasets: [{ label: 'Annual Cost', data: competitors.map(c => c.annual), backgroundColor: competitors.map(c => c.name === 'MEMTrak' ? C.green : C.navy), borderRadius: 6 }],
        }} options={{
          plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: 'var(--heading)', font: { weight: 'bold' as const, size: 10 }, formatter: (v: number) => '$' + (v / 1000).toFixed(1) + 'K' } },
          scales: { y: { beginAtZero: true, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => '$' + (v / 1000).toFixed(0) + 'K' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)', font: { size: 9 } } } },
        }} />
      </div>
    </div>
  );
}
