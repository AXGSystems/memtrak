'use client';

import { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import { Send, CheckCircle, ArrowLeft } from 'lucide-react';

const zones = ['Title News Leaderboard (728x90)', 'Website Sidebar (300x250)', 'Event Registration Banner (728x90)', 'Mobile Interstitial (320x480)'];
const durations = ['1 month', '3 months', '6 months', '12 months (annual)'];

export default function RequestSlot() {
  const [form, setForm] = useState({ company: '', contact: '', email: '', phone: '', zone: '', months: [] as string[], duration: '', budget: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const toggleMonth = (m: string) => {
    setForm(p => ({ ...p, months: p.months.includes(m) ? p.months.filter(x => x !== m) : [...p.months, m] }));
  };

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-green-500/20 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-400" /></div>
          <h1 className="text-xl font-extrabold mb-2" style={{ color: 'var(--heading)' }}>Request Submitted!</h1>
          <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Your ad slot request has been received. The ALTA advertising team will review and respond within 2 business days.</p>
          <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>Reference: REQ-{Date.now().toString().slice(-6)}</p>
          <div className="flex gap-3 justify-center">
            <Link href="/ads" className="px-5 py-2.5 rounded-xl text-xs font-semibold" style={{ color: 'var(--heading)', borderColor: 'var(--card-border)', borderWidth: '1px', borderStyle: 'solid' }}>Back to Ads</Link>
            <Link href="/ads/inventory" className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#8CC63F] hover:bg-[#6fa030]">View Inventory</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link href="/ads" className="flex items-center gap-1 text-xs mb-4 transition-colors" style={{ color: 'var(--text-muted)' }}><ArrowLeft className="w-3 h-3" /> Back to Ads</Link>
      <h1 className="text-lg font-extrabold mb-2" style={{ color: 'var(--heading)' }}>Request an Ad Slot</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Submit your advertising request. The ALTA team will confirm availability and send a proposal.</p>

      <Card className="max-w-2xl" noPad>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Company / Advertiser</label>
              <input type="text" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} placeholder="First American Title" className="w-full px-3 py-2.5 rounded-lg text-xs" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--heading)' }} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Contact Name</label>
              <input type="text" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} placeholder="Jane Smith" className="w-full px-3 py-2.5 rounded-lg text-xs" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--heading)' }} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="jsmith@firstam.com" className="w-full px-3 py-2.5 rounded-lg text-xs" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--heading)' }} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 123-4567" className="w-full px-3 py-2.5 rounded-lg text-xs" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--heading)' }} />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase mb-2 block" style={{ color: 'var(--text-muted)' }}>Preferred Ad Zone</label>
            <div className="grid grid-cols-2 gap-2">
              {zones.map(z => (
                <button key={z} onClick={() => setForm(p => ({ ...p, zone: z }))} className={`p-3 rounded-lg text-xs text-left transition-all ${form.zone === z ? 'bg-[#8CC63F]/20 border-2 border-[#8CC63F]/50' : ''}`} style={form.zone === z ? { color: 'var(--heading)' } : { background: 'var(--input-bg)', borderColor: 'var(--card-border)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--text-muted)' }}>{z}</button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase mb-2 block" style={{ color: 'var(--text-muted)' }}>Preferred Months (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                <button key={m} onClick={() => toggleMonth(m)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.months.includes(m) ? 'bg-[#8CC63F] text-white' : ''}`} style={form.months.includes(m) ? undefined : { background: 'var(--input-bg)', borderColor: 'var(--card-border)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--text-muted)' }}>{m}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Duration</label>
              <select value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-xs" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--heading)' }}>
                <option value="">Select...</option>
                {durations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Budget Range</label>
              <select value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg text-xs" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--heading)' }}>
                <option value="">Select...</option>
                <option value="5000">$5,000 — $10,000</option>
                <option value="10000">$10,000 — $25,000</option>
                <option value="25000">$25,000 — $50,000</option>
                <option value="50000">$50,000+</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: 'var(--text-muted)' }}>Notes / Special Requirements</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="Any specific requirements, creative specs, targeting needs..." className="w-full px-3 py-2.5 rounded-lg text-xs resize-none" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', borderWidth: '1px', borderStyle: 'solid', color: 'var(--heading)' }} />
          </div>

          <button onClick={() => setSubmitted(true)} disabled={!form.company || !form.email || !form.zone} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#8CC63F] hover:bg-[#6fa030] disabled:opacity-40 transition-colors">
            <Send className="w-4 h-4" /> Submit Request
          </button>
        </div>
      </Card>
    </div>
  );
}
