'use client';

import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import Card from '@/components/Card';

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
      <h1 className="text-lg font-extrabold mb-6" style={{ color: 'var(--heading)' }}>Code Generator</h1>

      <Card
        title="Campaign ID"
        className="mb-6"
        detailTitle="Code Generator — Complete Integration Guide"
        detailContent={
          <div className="space-y-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <p><strong style={{ color: 'var(--heading)' }}>What is the Code Generator?</strong></p>
            <p>This tool generates tracking codes for ALTA email campaigns. Each code is a URL or HTML snippet you embed in your outreach emails to track engagement.</p>

            <p><strong style={{ color: 'var(--heading)' }}>Step-by-step Integration:</strong></p>
            <ol className="list-decimal ml-4 space-y-1.5">
              <li>Enter a Campaign ID (e.g., <code className="px-1 rounded" style={{ background: 'var(--input-bg)' }}>pfl-compliance-apr-2026</code>)</li>
              <li>Copy the ALTA Logo Tracker code (recommended for highest reliability)</li>
              <li>Paste the logo image tag into your email HTML signature or body</li>
              <li>Replace <code className="px-1 rounded" style={{ background: 'var(--input-bg)' }}>RECIPIENT_EMAIL</code> with the actual recipient email</li>
              <li>Replace <code className="px-1 rounded" style={{ background: 'var(--input-bg)' }}>DESTINATION_URL</code> in click trackers with the actual link target</li>
              <li>Send the email — tracking begins automatically</li>
            </ol>

            <p><strong style={{ color: 'var(--heading)' }}>Available Tracking Methods:</strong></p>
            <ul className="list-disc ml-4 space-y-1">
              <li><strong style={{ color: 'var(--heading)' }}>Logo Tracker (~85%):</strong> Replaces ALTA logo with a tracked version. Most clients load branded images.</li>
              <li><strong style={{ color: 'var(--heading)' }}>Click Tracker (100%):</strong> Wraps any link. Records click then redirects to the real URL.</li>
              <li><strong style={{ color: 'var(--heading)' }}>Confirm/Deny Receipt (100%):</strong> Adds buttons for recipient to acknowledge receipt.</li>
              <li><strong style={{ color: 'var(--heading)' }}>Read Receipt:</strong> Invisible pixel that fires on email open.</li>
              <li><strong style={{ color: 'var(--heading)' }}>Tracking Pixel (60-75%):</strong> Fallback 1x1 pixel. Blocked by some email clients.</li>
              <li><strong style={{ color: 'var(--heading)' }}>Unsubscribe:</strong> CAN-SPAM compliant unsubscribe link. Required for bulk email.</li>
            </ul>

            <p><strong style={{ color: 'var(--heading)' }}>Tips:</strong></p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Use &quot;Copy All&quot; to get every code at once, then pick what you need</li>
              <li>Always include the unsubscribe link for CAN-SPAM compliance</li>
              <li>The logo tracker is the best single tracker — it doubles as your email branding</li>
              <li>Combine logo tracker + click tracker for maximum coverage</li>
            </ul>
          </div>
        }
      >
        <label className="text-[10px] font-bold uppercase mb-2 block" style={{ color: 'var(--text-muted)' }}>Campaign ID</label>
        <input
          type="text"
          value={cid}
          onChange={e => setCid(e.target.value.replace(/\s+/g, '-').toLowerCase())}
          placeholder="e.g., pfl-compliance-apr-2026"
          className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--heading)' }}
        />
      </Card>

      {codes.length > 0 && (
        <div className="space-y-3">
          {/* Batch copy all */}
          <button onClick={() => { const all = codes.map(c => `--- ${c.label} ---\n${c.code}`).join('\n\n'); navigator.clipboard.writeText(all); copy('_batch_', 'all'); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all" style={{ background: 'var(--accent)', color: 'white' }}>
            {copied === 'all' ? <><CheckCircle className="w-4 h-4" /> All Codes Copied!</> : <><Copy className="w-4 h-4" /> Copy All Tracking Codes at Once</>}
          </button>
          {codes.map(item => {
            const isHi = 'hi' in item;
            if (isHi) {
              return (
                <div key={item.key} className="p-4 rounded-xl border-2" style={{ background: 'rgba(140, 198, 63, 0.1)', borderColor: 'rgba(140, 198, 63, 0.3)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8CC63F]">{item.label}</span>
                    <button onClick={() => copy(item.code, item.key)} className="flex items-center gap-1 text-[10px] text-[#4A90D9] hover:underline">
                      {copied === item.key ? <><CheckCircle className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono overflow-x-auto whitespace-pre-wrap break-all p-3 rounded-lg bg-black/20" style={{ color: 'var(--text-muted)' }}>{item.code}</pre>
                </div>
              );
            }
            return (
              <Card key={item.key} noPad>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                    <button onClick={() => copy(item.code, item.key)} className="flex items-center gap-1 text-[10px] text-[#4A90D9] hover:underline">
                      {copied === item.key ? <><CheckCircle className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono overflow-x-auto whitespace-pre-wrap break-all p-3 rounded-lg bg-black/20" style={{ color: 'var(--text-muted)' }}>{item.code}</pre>
                </div>
              </Card>
            );
          })}

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400">
            <strong>Remember:</strong> Replace <code className="bg-black/20 px-1 rounded">RECIPIENT_EMAIL</code> with each recipient&apos;s actual email and <code className="bg-black/20 px-1 rounded">DESTINATION_URL</code> with the actual link target.
          </div>

          <Card>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--heading)' }}>Reliability:</strong> Click tracking = 100% reliable. Logo tracker = ~85% (most clients load branded images). Receipt confirmation = 100%. Pixel = 60-75%.
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
