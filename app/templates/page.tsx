'use client';

import { useState } from 'react';
import { Copy, CheckCircle, Eye, Mail } from 'lucide-react';

const templates = [
  { id: 'welcome', name: 'New Member Welcome', category: 'Onboarding', subject: 'Welcome to ALTA, [Name]!', previewText: 'Your membership journey starts here...', sections: ['Logo header', 'Welcome message', 'Top 5 benefits', 'Quick start links', 'Staff contact', 'Unsubscribe footer'], openRate: 82 },
  { id: 'renewal', name: 'Membership Renewal', category: 'Renewal', subject: 'Your ALTA Membership — Time to Renew', previewText: 'Don\'t lose your member benefits...', sections: ['Logo header', 'Renewal CTA', 'Benefits recap', 'Dues amount', 'Payment link', 'Unsubscribe footer'], openRate: 70 },
  { id: 'compliance', name: 'PFL Compliance Notice', category: 'Compliance', subject: 'Action Required: Your PFL Status', previewText: 'Important compliance update...', sections: ['Logo header', 'Compliance status', 'Required action', 'Deadline', 'Help link', 'Unsubscribe footer'], openRate: 35 },
  { id: 'event', name: 'Event Invitation', category: 'Events', subject: 'You\'re Invited: [Event Name]', previewText: 'Save your spot...', sections: ['Hero banner', 'Event details', 'Speaker lineup', 'Register CTA', 'Venue info', 'Unsubscribe footer'], openRate: 45 },
  { id: 'newsletter', name: 'Title News Weekly', category: 'Newsletter', subject: 'Title News — Week of [Date]', previewText: 'This week in title insurance...', sections: ['Logo header', 'Top story', '3 news items', 'Event sidebar', 'Quick links', 'Unsubscribe footer'], openRate: 40 },
  { id: 'advocacy', name: 'Advocacy Alert', category: 'Advocacy', subject: 'Action Needed: [State] Legislation', previewText: 'Your industry needs your voice...', sections: ['Urgency header', 'Bill summary', 'Impact analysis', 'Action CTA', 'TIPAC link', 'Unsubscribe footer'], openRate: 50 },
  { id: 'survey', name: 'Member Survey (NPS)', category: 'Feedback', subject: 'Quick Question: How\'s ALTA Doing?', previewText: 'Takes 30 seconds...', sections: ['Logo header', 'NPS question (0-10)', 'Open feedback box', 'Submit CTA', 'Thank you note', 'Unsubscribe footer'], openRate: 42 },
  { id: 'reengagement', name: 'Win-Back / Re-engagement', category: 'Retention', subject: 'We Miss You, [Name]', previewText: 'It\'s been a while...', sections: ['Personal greeting', 'What you\'ve missed', 'Upcoming events', 'Benefits reminder', 'Comeback CTA', 'Unsubscribe footer'], openRate: 28 },
];

const categories = [...new Set(templates.map(t => t.category))];

export default function Templates() {
  const [filter, setFilter] = useState('all');
  const [preview, setPreview] = useState<typeof templates[0] | null>(null);
  const [copied, setCopied] = useState('');

  const filtered = filter === 'all' ? templates : templates.filter(t => t.category === filter);

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Email Template Library</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>8 pre-built responsive templates for every ALTA use case. Each includes MEMTrak tracking auto-injected. What Mailchimp charges for their premium template library.</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: filter === 'all' ? 'var(--accent)' : 'var(--card)', color: filter === 'all' ? 'white' : 'var(--text-muted)', border: '1px solid var(--card-border)' }}>All ({templates.length})</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: filter === cat ? 'var(--accent)' : 'var(--card)', color: filter === cat ? 'white' : 'var(--text-muted)', border: '1px solid var(--card-border)' }}>{cat}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(t => (
          <div key={t.id} className="rounded-xl border p-4 transition-all hover:translate-y-[-2px]" style={{ background: 'var(--card)', borderColor: preview?.id === t.id ? 'var(--accent)' : 'var(--card-border)' }}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{t.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.category} · {t.openRate}% avg open rate</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setPreview(preview?.id === t.id ? null : t)} className="p-1.5 rounded-lg" style={{ color: 'var(--accent)' }}><Eye className="w-3.5 h-3.5" /></button>
                <button onClick={() => { navigator.clipboard.writeText(t.subject); setCopied(t.id); setTimeout(() => setCopied(''), 2000); }} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>{copied === t.id ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}</button>
              </div>
            </div>
            <div className="text-[10px] font-mono p-2 rounded-lg mb-2" style={{ background: 'var(--background)', color: 'var(--heading)' }}>Subject: {t.subject}</div>
            {preview?.id === t.id && (
              <div className="mt-3 p-3 rounded-lg border" style={{ borderColor: 'var(--card-border)', background: 'var(--background)' }}>
                <div className="text-[9px] uppercase font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Template Sections</div>
                <div className="space-y-1">
                  {t.sections.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] p-1.5 rounded" style={{ background: 'var(--card)' }}>
                      <span className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>{i + 1}</span>
                      <span style={{ color: 'var(--heading)' }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-2 rounded text-[9px]" style={{ background: 'color-mix(in srgb, var(--accent) 6%, transparent)', color: 'var(--accent)' }}>
                  <Mail className="w-3 h-3 inline mr-1" />MEMTrak auto-injects: logo tracker (open tracking), click wrapping on all links, CAN-SPAM unsubscribe footer
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
