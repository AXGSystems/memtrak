'use client';

import { useState, useRef } from 'react';
import { Camera, MapPin, CheckCircle, Mail, Clock } from 'lucide-react';

const returns = [
  { id: 'r1', date: 'Apr 10', org: 'Heritage Abstract LLC', address: '1234 Oak St, Pittsburgh, PA', reason: 'No such address', match: 'M-4421', confidence: 92, status: 'Auto-Flagged' },
  { id: 'r2', date: 'Apr 8', org: 'Summit Title Services', address: '567 Main Ave, Nashville, TN', reason: 'Moved, no forwarding', match: 'M-2819', confidence: 88, status: 'Auto-Flagged' },
  { id: 'r3', date: 'Apr 5', org: 'Keystone Settlement', address: '890 Market St, Philadelphia, PA', reason: 'Refused', match: 'M-1205', confidence: 95, status: 'Updated' },
  { id: 'r4', date: 'Apr 2', org: 'Federal Escrow Corp', address: '234 Canal St, New Orleans, LA', reason: 'Insufficient Address', match: null, confidence: 78, status: 'Needs Review' },
];

export default function Scanner() {
  const [form, setForm] = useState({ org: '', address: '', reason: 'Return to Sender — No such address' });
  const [result, setResult] = useState<string | null>(null);
  const [hasFile, setHasFile] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    const fd = new FormData();
    fd.append('orgName', form.org);
    fd.append('address', form.address);
    fd.append('reason', form.reason);
    if (fileRef.current?.files?.[0]) fd.append('image', fileRef.current.files[0]);
    const res = await fetch('/api/memtrak/mail-return', { method: 'POST', body: fd });
    const data = await res.json();
    setResult(data.message);
    setForm({ org: '', address: '', reason: 'Return to Sender — No such address' });
  };

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold text-white mb-6">Physical Mail Return Scanner</h1>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 mb-6 border-l-4 border-l-[#4A90D9]">
        <h3 className="text-sm font-bold text-white mb-2">How it works</h3>
        <p className="text-xs text-white/50">Photograph a returned envelope → enter or OCR the org name → MEMTrak fuzzy-matches against the member database → flags the record as &quot;bad address&quot; → re:Members and ALTA DASH see it automatically.</p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 mb-6">
        <h3 className="text-xs font-bold text-white mb-4">Scan a Return</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div><label className="text-[10px] font-bold uppercase text-white/40 mb-1 block">Organization Name</label><input type="text" value={form.org} onChange={e => setForm(p => ({ ...p, org: e.target.value }))} placeholder="Heritage Abstract LLC" className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30" /></div>
            <div><label className="text-[10px] font-bold uppercase text-white/40 mb-1 block">Address</label><input type="text" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="1234 Oak St, Pittsburgh, PA" className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30" /></div>
            <div><label className="text-[10px] font-bold uppercase text-white/40 mb-1 block">Reason</label><select value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white">{['Return to Sender — No such address', 'Moved, no forwarding', 'Refused', 'Insufficient Address', 'Vacant'].map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          </div>
          <div className="space-y-3">
            <div><label className="text-[10px] font-bold uppercase text-white/40 mb-1 block">Envelope Photo (optional)</label><input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={() => setHasFile(!!fileRef.current?.files?.length)} className="w-full text-xs text-white/50 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1B3A5C] file:text-white" /></div>
            <div className="flex gap-2">
              <button onClick={submit} disabled={!form.org} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#1B3A5C] hover:bg-[#2a5580] disabled:opacity-40"><MapPin className="w-3.5 h-3.5" /> Log Return</button>
              <button onClick={submit} disabled={!hasFile} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#8CC63F] hover:bg-[#6fa030] disabled:opacity-40"><Camera className="w-3.5 h-3.5" /> Scan &amp; Match</button>
            </div>
            {result && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-xs text-green-400"><CheckCircle className="w-4 h-4 inline mr-1" />{result}</div>}
          </div>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5">
        <h3 className="text-xs font-bold text-white mb-3">Recent Returns</h3>
        <div className="space-y-2">
          {returns.map(r => (
            <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Mail className="w-4 h-4 text-white/30" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">{r.org}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${r.status === 'Updated' ? 'bg-green-500/20 text-green-400' : r.status === 'Auto-Flagged' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>{r.status}</span>
                  {r.confidence > 0 && <span className="text-[9px] text-white/30">{r.confidence}% match</span>}
                </div>
                <div className="text-[10px] text-white/50 mt-0.5">{r.address}</div>
                <div className="text-[10px] text-white/30">{r.reason} · {r.date}{r.match ? ` · ${r.match}` : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
