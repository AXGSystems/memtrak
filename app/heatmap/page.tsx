'use client';

import { useState } from 'react';
import { MousePointerClick } from 'lucide-react';

// Email click heatmap — shows WHERE in the email people click
const emailSections = [
  { section: 'Header Logo', clicks: 245, pct: 8.2, position: 'top' },
  { section: 'Hero Image/Banner', clicks: 180, pct: 6.0, position: 'top' },
  { section: 'Primary CTA Button', clicks: 1240, pct: 41.3, position: 'middle' },
  { section: 'Secondary Link #1', clicks: 520, pct: 17.3, position: 'middle' },
  { section: 'Secondary Link #2', clicks: 380, pct: 12.7, position: 'middle' },
  { section: 'Footer Links', clicks: 290, pct: 9.7, position: 'bottom' },
  { section: 'Unsubscribe', clicks: 45, pct: 1.5, position: 'bottom' },
  { section: 'Social Icons', clicks: 100, pct: 3.3, position: 'bottom' },
];

const campaigns = [
  { name: 'ALTA ONE Early Bird', totalClicks: 780 },
  { name: 'PFL Compliance Wave 3', totalClicks: 267 },
  { name: 'Membership Renewal', totalClicks: 156 },
  { name: 'Title News Weekly', totalClicks: 465 },
];

export default function Heatmap() {
  const [selected] = useState(0);

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Email Click Heatmap</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>See exactly WHERE recipients click in your emails — what Insider One and Mailchimp Premium charge for. Optimize CTA placement based on real click data.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Heatmap */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-xs font-bold mb-4" style={{ color: 'var(--heading)' }}>Click Distribution — {campaigns[selected].name}</h3>
          <div className="space-y-1">
            {emailSections.map(s => {
              const intensity = s.pct / 50; // normalize to 0-1
              return (
                <div key={s.section} className="flex items-center gap-3 p-3 rounded-lg transition-all" style={{ background: `rgba(140,198,63,${Math.max(0.03, intensity * 0.3)})`, border: `1px solid rgba(140,198,63,${Math.max(0.05, intensity * 0.5)})` }}>
                  <div className="w-14 text-right flex-shrink-0">
                    <div className="text-sm font-extrabold" style={{ color: s.pct >= 30 ? '#8CC63F' : s.pct >= 10 ? '#4A90D9' : 'var(--text-muted)' }}>{s.pct}%</div>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                      <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${s.pct * 2.4}%`, background: `linear-gradient(90deg, #4A90D9, #8CC63F)` }} />
                    </div>
                  </div>
                  <div className="w-32 flex-shrink-0">
                    <div className="text-[10px] font-semibold" style={{ color: 'var(--heading)' }}>{s.section}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{s.clicks} clicks</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-4">
          <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
            <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Key Findings</h3>
            <div className="space-y-3">
              {[
                { icon: '🎯', title: 'Primary CTA gets 41% of all clicks', desc: 'The main button dominates. Make sure it\'s above the fold and the CTA text is specific ("Renew Now" not "Learn More").' },
                { icon: '📍', title: 'Middle section = 71% of clicks', desc: 'Links in the middle of the email body get 3x more clicks than header or footer.' },
                { icon: '⬇️', title: 'Footer links still get 15% of clicks', desc: 'Don\'t neglect the footer. Social icons, help links, and the unsubscribe link all get meaningful traffic.' },
                { icon: '⚠️', title: 'Unsubscribe at 1.5% — within normal range', desc: 'Industry average is 0.5-2%. If this rises above 2%, investigate content relevance.' },
              ].map(insight => (
                <div key={insight.title} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                  <span className="text-lg flex-shrink-0">{insight.icon}</span>
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{insight.title}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{insight.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-5" style={{ background: 'color-mix(in srgb, var(--accent) 6%, transparent)', borderColor: 'var(--accent)' }}>
            <h3 className="text-xs font-bold mb-2" style={{ color: 'var(--heading)' }}>Optimization Recommendation</h3>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Move the most important link to the primary CTA position. For renewal emails, &quot;Renew Your Membership&quot; should always be the biggest, most visible button. For compliance emails, &quot;Check Your Status&quot; should be the hero button — not buried in body text.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
