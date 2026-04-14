'use client';

import ClientChart from '@/components/ClientChart';

const C = { navy: '#1B3A5C', blue: '#4A90D9', green: '#8CC63F', orange: '#E8923F' };

const onboardingSequence = [
  { day: 0, email: 'Welcome to ALTA', subject: 'Welcome to ALTA — Your First Steps', openRate: 82, clickRate: 45, purpose: 'Introduce ALTA, set expectations, provide login credentials' },
  { day: 3, email: 'Meet Your Benefits', subject: 'Your ALTA Membership Benefits Guide', openRate: 68, clickRate: 32, purpose: 'Highlight top 5 member benefits, link to resource library' },
  { day: 7, email: 'Upcoming Events', subject: 'Events You Won\'t Want to Miss', openRate: 55, clickRate: 28, purpose: 'Promote next 3 events, encourage early registration' },
  { day: 14, email: 'Community Invite', subject: 'Join the Conversation — ALTA Community', openRate: 48, clickRate: 20, purpose: 'Invite to Higher Logic community, engagement groups' },
  { day: 30, email: 'Check-in', subject: 'How\'s Your ALTA Experience So Far?', openRate: 42, clickRate: 15, purpose: 'Satisfaction survey, identify early friction points' },
  { day: 60, email: 'Advocacy Intro', subject: 'Your Voice Matters — TIPAC & Advocacy', openRate: 38, clickRate: 12, purpose: 'Introduce TIPAC, advocacy opportunities, committee roles' },
  { day: 90, email: 'First Quarter Review', subject: 'Your First 90 Days at ALTA', openRate: 45, clickRate: 18, purpose: 'Recap engagement, highlight unused benefits, personal outreach if low engagement' },
];

export default function NewMembers() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold text-white mb-2">New Member Onboarding</h1>
      <p className="text-xs text-white/40 mb-6">Automated 7-email drip sequence for the 566 new members in 2026. Goal: first-year retention from 76% → 85%.</p>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6 stagger-children">
        {[
          { label: 'New Members 2026', value: '566', color: C.navy },
          { label: 'Sequence Emails', value: '7', color: C.blue },
          { label: 'Avg Open Rate', value: '54%', color: C.green },
          { label: 'Target: 1st Yr Retention', value: '85%', color: C.green },
        ].map(k => (
          <div key={k.label} className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4 text-center">
            <div className="text-xl font-extrabold text-white">{k.value}</div>
            <div className="text-[10px] text-white/40">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Sequence */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 mb-6">
        <h3 className="text-xs font-bold text-white mb-4">Onboarding Email Sequence</h3>
        <div className="space-y-3">
          {onboardingSequence.map((email, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
              <div className="w-12 text-center flex-shrink-0">
                <div className="text-lg font-extrabold text-[#8CC63F]">D{email.day}</div>
                <div className="text-[8px] text-white/30">day</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white">{email.email}</div>
                <div className="text-[10px] text-white/50">{email.subject}</div>
                <div className="text-[10px] text-white/30 mt-0.5">{email.purpose}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-bold text-green-400">{email.openRate}% open</div>
                <div className="text-[10px] text-white/40">{email.clickRate}% click</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drop-off chart */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
        <h3 className="text-xs font-bold text-white mb-3">Engagement Drop-off Through Sequence</h3>
        <ClientChart type="line" height={240} data={{ labels: onboardingSequence.map(e => 'Day ' + e.day), datasets: [
          { label: 'Open Rate', data: onboardingSequence.map(e => e.openRate), borderColor: C.green, borderWidth: 2.5, fill: true, backgroundColor: C.green + '10', tension: 0.3, pointRadius: 5, pointBackgroundColor: C.green },
          { label: 'Click Rate', data: onboardingSequence.map(e => e.clickRate), borderColor: C.blue, borderWidth: 2, fill: false, tension: 0.3, pointRadius: 4, borderDash: [5, 5] },
        ] }} options={{ plugins: { legend: { display: true, position: 'top' as const, labels: { color: '#8899aa', usePointStyle: true, padding: 16, font: { size: 10 } } }, datalabels: { display: false } }, scales: { y: { beginAtZero: true, max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => v + '%' } }, x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 } } } } }} />
      </div>
    </div>
  );
}
