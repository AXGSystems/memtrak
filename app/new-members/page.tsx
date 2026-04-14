'use client';

import ClientChart from '@/components/ClientChart';
import Card, { KpiCard } from '@/components/Card';
import { Mail, Hash, BarChart3, Target } from 'lucide-react';

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

const avgOpen = Math.round(onboardingSequence.reduce((s, e) => s + e.openRate, 0) / onboardingSequence.length);

export default function NewMembers() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-2" style={{ color: 'var(--heading)' }}>New Member Onboarding</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Automated 7-email drip sequence for the 566 new members in 2026. Goal: first-year retention from 76% &rarr; 85%.</p>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6 stagger-children">
        <KpiCard
          label="New Members 2026"
          value="566"
          icon={Mail}
          color={C.navy}
          detail={
            <div className="space-y-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>566 new members joined ALTA in 2026, representing organic growth and recruitment efforts.</p>
              <div className="space-y-1.5">
                <div className="flex justify-between"><span>Q1 (Jan–Mar)</span><span className="font-bold" style={{ color: 'var(--heading)' }}>162</span></div>
                <div className="flex justify-between"><span>Q2 (Apr–Jun)</span><span className="font-bold" style={{ color: 'var(--heading)' }}>148</span></div>
                <div className="flex justify-between"><span>Q3 (Jul–Sep)</span><span className="font-bold" style={{ color: 'var(--heading)' }}>137</span></div>
                <div className="flex justify-between"><span>Q4 (Oct–Dec)</span><span className="font-bold" style={{ color: 'var(--heading)' }}>119</span></div>
              </div>
              <p>First-year retention historically sits at 76%. This onboarding sequence targets 85% through sustained engagement.</p>
            </div>
          }
        />
        <KpiCard
          label="Sequence Emails"
          value="7"
          icon={Hash}
          color={C.blue}
          detail={
            <div className="space-y-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>7 automated emails over 90 days, designed to progressively deepen member engagement.</p>
              <div className="space-y-1.5">
                {onboardingSequence.map((e, i) => (
                  <div key={i} className="flex justify-between">
                    <span>Day {e.day}: {e.email}</span>
                    <span className="font-bold text-green-400">{e.openRate}%</span>
                  </div>
                ))}
              </div>
              <p>Sequence pacing follows best-practice intervals — tighter early (D0–D7) for momentum, wider later (D30–D90) to avoid fatigue.</p>
            </div>
          }
        />
        <KpiCard
          label="Avg Open Rate"
          value={`${avgOpen}%`}
          icon={BarChart3}
          color={C.green}
          detail={
            <div className="space-y-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>Average open rate across all 7 emails in the sequence is {avgOpen}%, well above industry average of 21%.</p>
              <div className="space-y-1.5">
                <div className="flex justify-between"><span>Highest (D0 Welcome)</span><span className="font-bold text-green-400">82%</span></div>
                <div className="flex justify-between"><span>Lowest (D60 Advocacy)</span><span className="font-bold text-amber-400">38%</span></div>
                <div className="flex justify-between"><span>D90 Recovery Bounce</span><span className="font-bold text-blue-400">45%</span></div>
              </div>
              <p>The natural drop-off from D0 to D60 is expected. The D90 review email shows a recovery pattern worth leveraging.</p>
            </div>
          }
        />
        <KpiCard
          label="Target: 1st Yr Retention"
          value="85%"
          icon={Target}
          color={C.green}
          detail={
            <div className="space-y-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>Target: improve first-year retention from 76% to 85% — a 9-point lift through automated onboarding.</p>
              <div className="space-y-1.5">
                <div className="flex justify-between"><span>Current 1st-Year Retention</span><span className="font-bold text-amber-400">76%</span></div>
                <div className="flex justify-between"><span>Target 1st-Year Retention</span><span className="font-bold text-green-400">85%</span></div>
                <div className="flex justify-between"><span>Members Saved (est.)</span><span className="font-bold" style={{ color: 'var(--heading)' }}>~51</span></div>
                <div className="flex justify-between"><span>Revenue Impact (est.)</span><span className="font-bold text-green-400">~$62K</span></div>
              </div>
              <p>Retaining 51 additional first-year members translates to roughly $62K in preserved annual dues revenue.</p>
            </div>
          }
        />
      </div>

      {/* Sequence */}
      <Card
        title="Onboarding Email Sequence"
        className="mb-6"
        detailTitle="Email Sequence — Full Analysis"
        detailContent={
          <div className="space-y-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <p>Detailed performance metrics and optimization notes for each email in the onboarding sequence.</p>
            {onboardingSequence.map((email, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-bold" style={{ color: '#8CC63F' }}>Day {email.day}</span>
                  <span className="font-bold" style={{ color: 'var(--heading)' }}>{email.email}</span>
                </div>
                <div className="mb-1" style={{ color: 'var(--text-muted)' }}>Subject: {email.subject}</div>
                <div className="mb-2" style={{ color: 'var(--text-muted)' }}>Purpose: {email.purpose}</div>
                <div className="grid grid-cols-3 gap-3">
                  <div><span style={{ color: 'var(--text-muted)' }}>Open Rate</span><div className="font-bold text-green-400">{email.openRate}%</div></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Click Rate</span><div className="font-bold text-blue-400">{email.clickRate}%</div></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Click-to-Open</span><div className="font-bold" style={{ color: 'var(--heading)' }}>{Math.round(email.clickRate / email.openRate * 100)}%</div></div>
                </div>
              </div>
            ))}
            <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="font-bold mb-1" style={{ color: 'var(--heading)' }}>Optimization Opportunities</div>
              <ul className="space-y-1 list-disc list-inside" style={{ color: 'var(--text-muted)' }}>
                <li>D14 Community Invite has lowest click-to-open — consider A/B testing CTA copy</li>
                <li>D60 Advocacy email has lowest open rate — test urgency-based subject lines</li>
                <li>D90 Review shows engagement recovery — consider adding a D120 follow-up</li>
              </ul>
            </div>
          </div>
        }
      >
        <div className="space-y-3">
          {onboardingSequence.map((email, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="w-12 text-center flex-shrink-0">
                <div className="text-lg font-extrabold text-[#8CC63F]">D{email.day}</div>
                <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>day</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{email.email}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{email.subject}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{email.purpose}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-bold text-green-400">{email.openRate}% open</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{email.clickRate}% click</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Drop-off chart */}
      <Card
        title="Engagement Drop-off Through Sequence"
        detailTitle="Engagement Drop-off Analysis"
        detailContent={
          <div className="space-y-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <p>Analysis of how member engagement decays across the 90-day onboarding sequence.</p>
            <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="font-bold mb-2" style={{ color: 'var(--heading)' }}>Drop-off Summary</div>
              <div className="space-y-1.5">
                <div className="flex justify-between"><span>Open Rate Drop (D0 to D60)</span><span className="font-bold text-red-400">-44 pts (82% to 38%)</span></div>
                <div className="flex justify-between"><span>Click Rate Drop (D0 to D60)</span><span className="font-bold text-red-400">-33 pts (45% to 12%)</span></div>
                <div className="flex justify-between"><span>D90 Recovery (vs D60)</span><span className="font-bold text-green-400">+7 pts open, +6 pts click</span></div>
              </div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="font-bold mb-2" style={{ color: 'var(--heading)' }}>Key Insights</div>
              <ul className="space-y-1 list-disc list-inside" style={{ color: 'var(--text-muted)' }}>
                <li>Steepest drop occurs between D7 and D14 — members who haven't engaged by week 2 are at risk</li>
                <li>Click-to-open ratio stays relatively stable (~55%) through D7, then declines</li>
                <li>D90 review email creates a measurable re-engagement lift — supports adding more periodic check-ins</li>
                <li>Members who click the D0 welcome email are 3.2x more likely to complete the full sequence</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="font-bold mb-2" style={{ color: 'var(--heading)' }}>Recommendations</div>
              <ul className="space-y-1 list-disc list-inside" style={{ color: 'var(--text-muted)' }}>
                <li>Add a branch path: if D7 email not opened, trigger a phone call from membership team</li>
                <li>Test SMS as a channel for D14 and D30 touchpoints to combat email fatigue</li>
                <li>Introduce a D120 email to capitalize on the D90 re-engagement pattern</li>
              </ul>
            </div>
          </div>
        }
      >
        <ClientChart type="line" height={240} data={{ labels: onboardingSequence.map(e => 'Day ' + e.day), datasets: [
          { label: 'Open Rate', data: onboardingSequence.map(e => e.openRate), borderColor: C.green, borderWidth: 2.5, fill: true, backgroundColor: C.green + '10', tension: 0.3, pointRadius: 5, pointBackgroundColor: C.green },
          { label: 'Click Rate', data: onboardingSequence.map(e => e.clickRate), borderColor: C.blue, borderWidth: 2, fill: false, tension: 0.3, pointRadius: 4, borderDash: [5, 5] },
        ] }} options={{ plugins: { legend: { display: true, position: 'top' as const, labels: { color: '#8899aa', usePointStyle: true, padding: 16, font: { size: 10 } } }, datalabels: { display: false } }, scales: { y: { beginAtZero: true, max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => v + '%' } }, x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 } } } } }} />
      </Card>
    </div>
  );
}
