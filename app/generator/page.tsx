'use client';

import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

export default function Generator() {
  const [cid, setCid] = useState('');
  const [copied, setCopied] = useState('');
  const base = typeof window !== 'undefined' ? window.location.origin : '';

  const copy = (text: string, label: string) => { navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(''), 2000); };

  const codes = cid ? [
    { label: 'ALTA Logo Tracker (RECOMMENDED)', code: `<img src="${base}/api/memtrak/logo?cid=${encodeURIComponent(cid)}&rid=RECIPIENT_EMAIL" alt="ALTA" width="120" height="40" />`, key: 'logo', hi: true },
    { label: 'Click Tracker', code: `${base}/api/memtrak/click?cid=${encodeURIComponent(cid)}&rid=RECIPIENT_EMAIL&url=DESTINATION_URL`, key: 'click' },
    { label: 'Confirm Receipt', code: `${base}/api/memtrak/confirm?cid=${encodeURIComponent(cid)}&rid=RECIPIENT_EMAIL&action=confirm`, key: 'confirm' },
    { label: 'Deny Receipt (also proves engagement)', code: `${base}/api/memtrak/confirm?cid=${encodeURIComponent(cid)}&rid=RECIPIENT_EMAIL&action=deny`, key: 'deny' },
    { label: 'Read Receipt', code: `${base}/api/memtrak/receipt?cid=${encodeURIComponent(cid)}&rid=RECIPIENT_EMAIL`, key: 'receipt' },
    { label: 'Unsubscribe (CAN-SPAM)', code: `${base}/api/memtrak/unsubscribe?email=RECIPIENT_EMAIL&cid=${encodeURIComponent(cid)}`, key: 'unsub' },
    { label: 'Tracking Pixel (fallback)', code: `<img src="${base}/api/memtrak/pixel?cid=${encodeURIComponent(cid)}&rid=RECIPIENT_EMAIL" width="1" height="1" alt="" style="display:none" />`, key: 'pixel' },
  ] : [];

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold text-white mb-6">Code Generator</h1>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 mb-6">
        <label className="text-[10px] font-bold uppercase text-white/40 mb-2 block">Campaign ID</label>
        <input type="text" value={cid} onChange={e => setCid(e.target.value.replace(/\s+/g, '-').toLowerCase())} placeholder="e.g., pfl-compliance-apr-2026" className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#8CC63F]/50" />
      </div>

      {codes.length > 0 && (
        <div className="space-y-3">
          {/* Batch copy all */}
          <button onClick={() => { const all = codes.map(c => `--- ${c.label} ---\n${c.code}`).join('\n\n'); navigator.clipboard.writeText(all); copy('_batch_', 'all'); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all" style={{ background: 'var(--accent)', color: 'white' }}>
            {copied === 'all' ? <><CheckCircle className="w-4 h-4" /> All Codes Copied!</> : <><Copy className="w-4 h-4" /> Copy All Tracking Codes at Once</>}
          </button>
          {codes.map(item => (
            <div key={item.key} className={`p-4 rounded-xl ${'hi' in item ? 'bg-[#8CC63F]/10 border-2 border-[#8CC63F]/30' : 'bg-[var(--card)] border border-[var(--card-border)]'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${'hi' in item ? 'text-[#8CC63F]' : 'text-white/50'}`}>{item.label}</span>
                <button onClick={() => copy(item.code, item.key)} className="flex items-center gap-1 text-[10px] text-[#4A90D9] hover:underline">
                  {copied === item.key ? <><CheckCircle className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <pre className="text-[10px] text-white/60 font-mono overflow-x-auto whitespace-pre-wrap break-all p-3 rounded-lg bg-black/20">{item.code}</pre>
            </div>
          ))}

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400">
            <strong>Remember:</strong> Replace <code className="bg-black/20 px-1 rounded">RECIPIENT_EMAIL</code> with each recipient&apos;s actual email and <code className="bg-black/20 px-1 rounded">DESTINATION_URL</code> with the actual link target.
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white/40">
            <strong className="text-white/60">Reliability:</strong> Click tracking = 100% reliable. Logo tracker = ~85% (most clients load branded images). Receipt confirmation = 100%. Pixel = 60-75%.
          </div>
        </div>
      )}
    </div>
  );
}
