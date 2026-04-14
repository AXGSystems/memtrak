'use client';

import { Sparkles, CheckCircle } from 'lucide-react';

const releases = [
  { version: 'v1.5', date: 'Apr 14, 2026', features: ['AI Subject Line Writer with predicted open rates', 'Smart Segment Builder with custom filters', 'Send Calendar for campaign coordination', 'Member NPS tracking with 5-quarter trends', 'Revenue Forecasting with scenario modeling', 'ROI Calculator vs competitor pricing', 'Email Click Heatmap analysis', 'Industry Benchmarks comparison', 'Interactive API Documentation', 'Event Tracker with email-to-registration conversion'] },
  { version: 'v1.4', date: 'Apr 14, 2026', features: ['Engagement Scoring & Lifetime Value prediction', 'Spam Score Pre-Check before sending', 'Automated Re-engagement Workflows', 'Content Performance Analysis', 'Privacy-First Metrics (post-Apple MPP)'] },
  { version: 'v1.3', date: 'Apr 13, 2026', features: ['5-theme system (Midnight, Vibranium, Ember, AXG Gold, ALTA Brand)', 'Glassmorphic Card component with detail modals', 'Global print button with branded reports', '15 custom print reports', 'Security dashboard + audit logging'] },
  { version: 'v1.2', date: 'Apr 13, 2026', features: ['Email Campaign Intelligence Center', 'Deliverability Monitor (SPF/DKIM/DMARC)', 'Communication Log (staff CRM)', 'Address Hygiene + Mail Scanner', 'MEMTrak logo stealth tracker'] },
  { version: 'v1.1', date: 'Apr 13, 2026', features: ['Revive Ad Server integration', 'Ad Inventory Calendar', 'Advertiser Slot Request portal'] },
  { version: 'v1.0', date: 'Apr 12, 2026', features: ['Initial release: tracking pixel, click tracker, receipt confirmation', 'Confirm/Deny receipt (both prove engagement)', 'CAN-SPAM unsubscribe system', 'Recipient list management', 'Campaign analytics dashboard'] },
];

export default function WhatsNew() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>What&apos;s New</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>MEMTrak release history — every feature shipped.</p>

      <div className="space-y-6">
        {releases.map(r => (
          <div key={r.version} className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-extrabold px-3 py-1 rounded-lg" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>{r.version}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.date}</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
              {r.features.map(f => (
                <div key={f} className="flex items-start gap-2 text-[11px] p-1.5">
                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span style={{ color: 'var(--heading)' }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
