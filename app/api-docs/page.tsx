'use client';

import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

const endpoints = [
  { method: 'GET', path: '/api/memtrak/pixel', desc: 'Tracking pixel — returns 1x1 transparent GIF', params: 'cid (campaign ID), rid (recipient email)', response: 'image/gif', category: 'Tracking' },
  { method: 'GET', path: '/api/memtrak/logo', desc: 'ALTA logo tracker — serves real logo while logging open', params: 'cid, rid', response: 'image/png', category: 'Tracking' },
  { method: 'GET', path: '/api/memtrak/click', desc: 'Click redirect — logs click then redirects to destination', params: 'cid, rid, url (destination)', response: '302 redirect', category: 'Tracking' },
  { method: 'GET', path: '/api/memtrak/receipt', desc: 'Read receipt — branded confirmation page', params: 'cid, rid', response: 'text/html', category: 'Tracking' },
  { method: 'GET', path: '/api/memtrak/confirm', desc: 'Confirm/Deny receipt — both log engagement', params: 'cid, rid, action (confirm|deny)', response: 'text/html', category: 'Tracking' },
  { method: 'GET', path: '/api/memtrak/unsubscribe', desc: 'CAN-SPAM unsubscribe page', params: 'email, cid', response: 'text/html', category: 'Management' },
  { method: 'GET', path: '/api/memtrak/events', desc: 'Retrieve tracked events and campaign stats', params: 'action (stats|events), cid, type, limit', response: 'application/json', category: 'Analytics' },
  { method: 'POST', path: '/api/memtrak/events', desc: 'Manually log an event (send, bounce, reply)', params: 'Body: { type, campaignId, recipientEmail, metadata }', response: 'application/json', category: 'Analytics' },
  { method: 'POST', path: '/api/memtrak/send', desc: 'Send tracked email via Microsoft Graph API', params: 'Body: { from, to[], subject, body, campaignId, autoTrack }', response: 'application/json', category: 'Sending' },
  { method: 'POST', path: '/api/memtrak/verify', desc: 'Verify email address (syntax, domain, disposable)', params: 'Body: { email } or { emails[] }', response: 'application/json', category: 'Hygiene' },
  { method: 'GET', path: '/api/memtrak/hygiene', desc: 'List hygiene report (health, stale, bounced)', params: 'action (report|stale|bounced|recommendations|mail-returns)', response: 'application/json', category: 'Hygiene' },
  { method: 'POST', path: '/api/memtrak/mail-return', desc: 'Physical mail return scanner (upload envelope photo)', params: 'FormData: orgName, address, reason, image (optional)', response: 'application/json', category: 'Hygiene' },
  { method: 'GET', path: '/api/memtrak/analytics', desc: 'Advanced analytics (decay, churn, timing, revenue)', params: 'action (decay|churn|timing|relationships|revenue|journey)', response: 'application/json', category: 'Analytics' },
  { method: 'GET', path: '/api/memtrak/audit', desc: 'Security audit log', params: '(none)', response: 'application/json', category: 'Security' },
];

const categories = [...new Set(endpoints.map(e => e.category))];
const methodColors: Record<string, string> = { GET: 'bg-blue-500/20 text-blue-400', POST: 'bg-green-500/20 text-green-400' };

export default function APIDocs() {
  const [copied, setCopied] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://memtrak.alta.org';

  const filtered = filter === 'all' ? endpoints : endpoints.filter(e => e.category === filter);

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>API Documentation</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>MEMTrak REST API — {endpoints.length} endpoints for tracking, analytics, management, and hygiene. Base URL: <code className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--card-border)', color: 'var(--heading)' }}>{base}</code></p>

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === 'all' ? '' : 'opacity-50'}`} style={{ background: filter === 'all' ? 'var(--accent)' : 'var(--card)', color: filter === 'all' ? 'white' : 'var(--text-muted)', border: '1px solid var(--card-border)' }}>All ({endpoints.length})</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === cat ? '' : 'opacity-50'}`} style={{ background: filter === cat ? 'var(--accent)' : 'var(--card)', color: filter === cat ? 'white' : 'var(--text-muted)', border: '1px solid var(--card-border)' }}>{cat} ({endpoints.filter(e => e.category === cat).length})</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(ep => (
          <div key={ep.path + ep.method} className="rounded-xl border overflow-hidden transition-all" style={{ background: 'var(--card)', borderColor: expanded === ep.path + ep.method ? 'var(--accent)' : 'var(--card-border)' }}>
            <button onClick={() => setExpanded(expanded === ep.path + ep.method ? null : ep.path + ep.method)} className="w-full flex items-center gap-3 p-4 text-left">
              <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${methodColors[ep.method]}`}>{ep.method}</span>
              <code className="text-xs font-mono flex-1" style={{ color: 'var(--heading)' }}>{ep.path}</code>
              <span className="text-[10px] hidden lg:block" style={{ color: 'var(--text-muted)' }}>{ep.desc}</span>
            </button>
            {expanded === ep.path + ep.method && (
              <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-3">
                  <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                    <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Description</div>
                    <div className="text-xs" style={{ color: 'var(--heading)' }}>{ep.desc}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                    <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Parameters</div>
                    <div className="text-xs font-mono" style={{ color: 'var(--heading)' }}>{ep.params}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                    <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Response</div>
                    <div className="text-xs font-mono" style={{ color: 'var(--heading)' }}>{ep.response}</div>
                  </div>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(base + ep.path); setCopied(ep.path); setTimeout(() => setCopied(''), 2000); }} className="flex items-center gap-1 mt-3 text-[10px] font-semibold" style={{ color: 'var(--accent)' }}>
                  {copied === ep.path ? <><CheckCircle className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy URL</>}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
