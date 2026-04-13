'use client';

import { useState } from 'react';
import { Send, Copy, CheckCircle, Eye, Users, Calendar, AlertTriangle } from 'lucide-react';

const segments = [
  { id: 'all', label: 'All Members', count: 4994 },
  { id: 'aca', label: 'ACA — Title Agents', count: 3208 },
  { id: 'rea', label: 'REA — Attorneys', count: 926 },
  { id: 'acu', label: 'ACU — Underwriters', count: 40 },
  { id: 'atxa', label: 'ATXA — Texas Agents', count: 257 },
  { id: 'non-compliant', label: 'Non-Compliant Orgs', count: 7108 },
  { id: 'stale', label: 'Stale (no opens 6mo+)', count: 2800 },
  { id: 'new-2026', label: 'New Members 2026', count: 566 },
  { id: 'renewal-due', label: 'Renewal Due Q4', count: 1200 },
];

const templates = [
  { id: 'compliance', name: 'PFL Compliance Notice', subject: 'Important: Your PFL Compliance Status' },
  { id: 'renewal', name: 'Membership Renewal', subject: 'Your ALTA Membership Renewal is Due' },
  { id: 'welcome', name: 'New Member Welcome', subject: 'Welcome to ALTA — Here\'s What\'s Next' },
  { id: 'event', name: 'Event Invitation', subject: 'You\'re Invited: [EVENT_NAME]' },
  { id: 'newsletter', name: 'Title News Weekly', subject: 'Title News — Week of [DATE]' },
  { id: 'retention', name: 'Retention Check-in', subject: 'How Can ALTA Better Serve You?' },
  { id: 'advocacy', name: 'Advocacy Alert', subject: 'Action Needed: [STATE] Legislation Update' },
  { id: 'tipac', name: 'TIPAC Pledge Drive', subject: 'Support the Title Industry — TIPAC 2026' },
  { id: 'custom', name: 'Custom Email', subject: '' },
];

export default function CampaignBuilder() {
  const [step, setStep] = useState(1);
  const [campaign, setCampaign] = useState({ name: '', template: '', segment: '', subject: '', from: 'membership@alta.org', sendDate: '', body: '' });
  const [copied, setCopied] = useState(false);

  const selectedSegment = segments.find(s => s.id === campaign.segment);
  const selectedTemplate = templates.find(t => t.id === campaign.template);
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  const cid = campaign.name.replace(/\s+/g, '-').toLowerCase() || 'new-campaign';

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold text-white mb-6">Campaign Builder</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2">
            <button onClick={() => setStep(s)} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-[#8CC63F] text-white' : 'bg-white/10 text-white/40'}`}>{s}</button>
            {s < 4 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#8CC63F]' : 'bg-white/10'}`} />}
          </div>
        ))}
        <span className="text-xs text-white/40 ml-3">{['Configure', 'Audience', 'Content', 'Review'][step - 1]}</span>
      </div>

      {/* Step 1: Configure */}
      {step === 1 && (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">1. Campaign Configuration</h2>
          <div>
            <label className="text-[10px] font-bold uppercase text-white/40 mb-1 block">Campaign Name</label>
            <input type="text" value={campaign.name} onChange={e => setCampaign(p => ({ ...p, name: e.target.value }))} placeholder="PFL Compliance — May Wave 1" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#8CC63F]/50" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-white/40 mb-1 block">Template</label>
            <div className="grid grid-cols-3 gap-2">
              {templates.map(t => (
                <button key={t.id} onClick={() => setCampaign(p => ({ ...p, template: t.id, subject: t.subject || p.subject }))} className={`p-3 rounded-lg text-left text-xs transition-all ${campaign.template === t.id ? 'bg-[#8CC63F]/20 border-2 border-[#8CC63F]/50 text-white' : 'bg-white/5 border border-white/10 text-white/60 hover:border-white/30'}`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase text-white/40 mb-1 block">From Address</label>
              <select value={campaign.from} onChange={e => setCampaign(p => ({ ...p, from: e.target.value }))} className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-xs">
                <option value="membership@alta.org">membership@alta.org</option>
                <option value="licensing@alta.org">licensing@alta.org</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-white/40 mb-1 block">Send Date</label>
              <input type="date" value={campaign.sendDate} onChange={e => setCampaign(p => ({ ...p, sendDate: e.target.value }))} className="w-full px-3 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-xs" />
            </div>
          </div>
          <button onClick={() => setStep(2)} disabled={!campaign.name || !campaign.template} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#8CC63F] hover:bg-[#6fa030] disabled:opacity-40 transition-colors">Next: Select Audience</button>
        </div>
      )}

      {/* Step 2: Audience */}
      {step === 2 && (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">2. Select Audience</h2>
          <div className="grid grid-cols-3 gap-3">
            {segments.map(s => (
              <button key={s.id} onClick={() => setCampaign(p => ({ ...p, segment: s.id }))} className={`p-4 rounded-xl text-left transition-all ${campaign.segment === s.id ? 'bg-[#8CC63F]/20 border-2 border-[#8CC63F]/50' : 'bg-white/5 border border-white/10 hover:border-white/30'}`}>
                <div className="text-xs font-bold text-white">{s.label}</div>
                <div className="text-lg font-extrabold text-white mt-1">{s.count.toLocaleString()}</div>
                <div className="text-[10px] text-white/40">recipients</div>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl text-sm font-bold text-white/50 border border-white/10">Back</button>
            <button onClick={() => setStep(3)} disabled={!campaign.segment} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#8CC63F] hover:bg-[#6fa030] disabled:opacity-40">Next: Content</button>
          </div>
        </div>
      )}

      {/* Step 3: Content */}
      {step === 3 && (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">3. Email Content</h2>
          <div>
            <label className="text-[10px] font-bold uppercase text-white/40 mb-1 block">Subject Line</label>
            <input type="text" value={campaign.subject} onChange={e => setCampaign(p => ({ ...p, subject: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder-white/30" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-white/40 mb-1 block">Email Body (HTML)</label>
            <textarea value={campaign.body} onChange={e => setCampaign(p => ({ ...p, body: e.target.value }))} rows={10} placeholder="<h1>Hello {{NAME}},</h1><p>Your PFL compliance status requires attention...</p>" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-mono placeholder-white/30 resize-none" />
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
            <strong>Auto-injected by MEMTrak:</strong> ALTA logo tracker (open tracking), CAN-SPAM unsubscribe footer, tracking on all links. You don&apos;t need to add these manually.
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl text-sm font-bold text-white/50 border border-white/10">Back</button>
            <button onClick={() => setStep(4)} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#8CC63F] hover:bg-[#6fa030]">Next: Review</button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">4. Review & Send</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/5">
              <div className="text-[10px] text-white/40 uppercase mb-1">Campaign</div>
              <div className="text-sm font-bold text-white">{campaign.name}</div>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <div className="text-[10px] text-white/40 uppercase mb-1">Template</div>
              <div className="text-sm font-bold text-white">{selectedTemplate?.name}</div>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <div className="text-[10px] text-white/40 uppercase mb-1">Audience</div>
              <div className="text-sm font-bold text-white">{selectedSegment?.label} ({selectedSegment?.count.toLocaleString()})</div>
            </div>
            <div className="p-4 rounded-lg bg-white/5">
              <div className="text-[10px] text-white/40 uppercase mb-1">From / Date</div>
              <div className="text-sm font-bold text-white">{campaign.from} · {campaign.sendDate || 'Immediate'}</div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-white/5">
            <div className="text-[10px] text-white/40 uppercase mb-1">Subject</div>
            <div className="text-sm text-white">{campaign.subject}</div>
          </div>
          <div className="p-3 rounded-xl bg-[#8CC63F]/10 border border-[#8CC63F]/30">
            <div className="text-xs text-[#8CC63F] font-bold mb-1">MEMTrak Tracking Enabled</div>
            <div className="text-[10px] text-white/50">Campaign ID: <code className="text-white/70">{cid}</code> · Logo tracker auto-injected · All links tracked · Unsubscribe footer added</div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="px-6 py-3 rounded-xl text-sm font-bold text-white/50 border border-white/10">Back</button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600">
              <Calendar className="w-4 h-4" /> Schedule
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#8CC63F] hover:bg-[#6fa030]">
              <Send className="w-4 h-4" /> Send Now ({selectedSegment?.count.toLocaleString()} recipients)
            </button>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" /> <strong>Preview mode:</strong> Connect Microsoft Graph API to enable actual sending. Currently generates tracking codes only.
          </div>
        </div>
      )}
    </div>
  );
}
