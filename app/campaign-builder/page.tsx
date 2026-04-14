'use client';

import { useState } from 'react';
import { Send, Copy, CheckCircle, Eye, Users, Calendar, AlertTriangle } from 'lucide-react';
import Card from '@/components/Card';

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
      <h1 className="text-lg font-extrabold mb-6" style={{ color: 'var(--heading)' }}>Campaign Builder</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'bg-[#8CC63F] text-white' : ''}`}
              style={step >= s ? undefined : { background: 'var(--input-bg)', color: 'var(--text-muted)' }}
            >
              {s}
            </button>
            {s < 4 && (
              <div
                className={`w-12 h-0.5 ${step > s ? 'bg-[#8CC63F]' : ''}`}
                style={step > s ? undefined : { background: 'var(--input-bg)' }}
              />
            )}
          </div>
        ))}
        <span className="text-xs ml-3" style={{ color: 'var(--text-muted)' }}>{['Configure', 'Audience', 'Content', 'Review'][step - 1]}</span>
      </div>

      {/* Step 1: Configure */}
      {step === 1 && (
        <Card title="1. Campaign Configuration">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Campaign Name</label>
              <input
                type="text"
                value={campaign.name}
                onChange={e => setCampaign(p => ({ ...p, name: e.target.value }))}
                placeholder="PFL Compliance — May Wave 1"
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-[#8CC63F]/50"
                style={{ background: 'var(--input-bg)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)', color: 'var(--heading)' }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Template</label>
              <div className="grid grid-cols-3 gap-2">
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setCampaign(p => ({ ...p, template: t.id, subject: t.subject || p.subject }))}
                    className={`p-3 rounded-lg text-left text-xs transition-all ${campaign.template === t.id ? 'bg-[#8CC63F]/20 border-2 border-[#8CC63F]/50 text-white' : ''}`}
                    style={campaign.template === t.id ? undefined : { background: 'var(--input-bg)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>From Address</label>
                <select
                  value={campaign.from}
                  onChange={e => setCampaign(p => ({ ...p, from: e.target.value }))}
                  className="w-full px-3 py-3 rounded-xl text-xs"
                  style={{ background: 'var(--input-bg)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)', color: 'var(--heading)' }}
                >
                  <option value="membership@alta.org">membership@alta.org</option>
                  <option value="licensing@alta.org">licensing@alta.org</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Send Date</label>
                <input
                  type="date"
                  value={campaign.sendDate}
                  onChange={e => setCampaign(p => ({ ...p, sendDate: e.target.value }))}
                  className="w-full px-3 py-3 rounded-xl text-xs"
                  style={{ background: 'var(--input-bg)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)', color: 'var(--heading)' }}
                />
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!campaign.name || !campaign.template} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#8CC63F] hover:bg-[#6fa030] disabled:opacity-40 transition-colors">Next: Select Audience</button>
          </div>
        </Card>
      )}

      {/* Step 2: Audience */}
      {step === 2 && (
        <Card title="2. Select Audience">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {segments.map(s => (
                <button
                  key={s.id}
                  onClick={() => setCampaign(p => ({ ...p, segment: s.id }))}
                  className={`p-4 rounded-xl text-left transition-all ${campaign.segment === s.id ? 'bg-[#8CC63F]/20 border-2 border-[#8CC63F]/50' : ''}`}
                  style={campaign.segment === s.id ? undefined : { background: 'var(--input-bg)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)' }}
                >
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{s.label}</div>
                  <div className="text-lg font-extrabold mt-1" style={{ color: 'var(--heading)' }}>{s.count.toLocaleString()}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>recipients</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl text-sm font-bold"
                style={{ color: 'var(--text-muted)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)' }}
              >
                Back
              </button>
              <button onClick={() => setStep(3)} disabled={!campaign.segment} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#8CC63F] hover:bg-[#6fa030] disabled:opacity-40">Next: Content</button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Content */}
      {step === 3 && (
        <Card title="3. Email Content">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Subject Line</label>
              <input
                type="text"
                value={campaign.subject}
                onChange={e => setCampaign(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: 'var(--input-bg)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)', color: 'var(--heading)' }}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Email Body (HTML)</label>
              <textarea
                value={campaign.body}
                onChange={e => setCampaign(p => ({ ...p, body: e.target.value }))}
                rows={10}
                placeholder="<h1>Hello {{NAME}},</h1><p>Your PFL compliance status requires attention...</p>"
                className="w-full px-4 py-3 rounded-xl text-xs font-mono resize-none"
                style={{ background: 'var(--input-bg)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)', color: 'var(--heading)' }}
              />
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
              <strong>Auto-injected by MEMTrak:</strong> ALTA logo tracker (open tracking), CAN-SPAM unsubscribe footer, tracking on all links. You don&apos;t need to add these manually.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl text-sm font-bold"
                style={{ color: 'var(--text-muted)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)' }}
              >
                Back
              </button>
              <button onClick={() => setStep(4)} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#8CC63F] hover:bg-[#6fa030]">Next: Review</button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <Card title="4. Review & Send">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Campaign</div>
                <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{campaign.name}</div>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Template</div>
                <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedTemplate?.name}</div>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Audience</div>
                <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedSegment?.label} ({selectedSegment?.count.toLocaleString()})</div>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>From / Date</div>
                <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{campaign.from} · {campaign.sendDate || 'Immediate'}</div>
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="text-[10px] uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Subject</div>
              <div className="text-sm" style={{ color: 'var(--heading)' }}>{campaign.subject}</div>
            </div>
            <div className="p-3 rounded-xl bg-[#8CC63F]/10 border border-[#8CC63F]/30">
              <div className="text-xs text-[#8CC63F] font-bold mb-1">MEMTrak Tracking Enabled</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Campaign ID: <code style={{ color: 'var(--text-muted)' }}>{cid}</code> · Logo tracker auto-injected · All links tracked · Unsubscribe footer added</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl text-sm font-bold"
                style={{ color: 'var(--text-muted)', borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--card-border)' }}
              >
                Back
              </button>
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
        </Card>
      )}
    </div>
  );
}
