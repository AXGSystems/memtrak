'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, Key, Server, Clock } from 'lucide-react';

interface AuditStats { total: number; critical: number; warning: number; last24h: number; }
interface AuditEvent { timestamp: string; action: string; ip: string; detail: string; severity: 'info' | 'warning' | 'critical'; }

const securityChecks = [
  { name: 'Rate Limiting', status: 'Active', detail: '100 requests/minute per IP on all API routes', icon: Shield },
  { name: 'Security Headers', status: 'Active', detail: 'X-Frame-Options DENY, X-Content-Type-Options nosniff, XSS Protection, Permissions-Policy', icon: Lock },
  { name: 'Open Redirect Protection', status: 'Active', detail: 'Click tracker only redirects to allowlisted ALTA domains (HTTPS only)', icon: Eye },
  { name: 'Input Sanitization', status: 'Active', detail: 'HTML stripping, length limits, email validation on all API inputs', icon: Shield },
  { name: 'API Key System', status: 'Ready', detail: 'Set MEMTRAK_API_KEYS env var to enable key-based auth for external integrations', icon: Key },
  { name: 'Audit Logging', status: 'Active', detail: 'Security events logged with IP, timestamp, severity. Last 1,000 events retained.', icon: Server },
  { name: 'CORS Policy', status: 'Default', detail: 'Same-origin only. Cross-origin requests blocked by default.', icon: Lock },
  { name: 'Tracking Pixel Security', status: 'Active', detail: 'Pixel/logo endpoints exempt from X-Frame-Options (required for email embedding). No-cache headers enforced.', icon: Eye },
];

export default function Security() {
  const [audit, setAudit] = useState<{ stats: AuditStats; events: AuditEvent[] } | null>(null);

  useEffect(() => {
    fetch('/api/memtrak/audit').then(r => r.json()).then(setAudit).catch(() => {});
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-2" style={{ color: 'var(--heading)' }}>Security Dashboard</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>MEMTrak security controls, audit log, and compliance status</p>

      {/* Security Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger-children">
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>{securityChecks.filter(c => c.status === 'Active').length}/{securityChecks.length}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Controls Active</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--heading)' }}>{audit?.stats.total ?? 0}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Audit Events</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: '#D94A4A' }}>{audit?.stats.critical ?? 0}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Critical Events</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--heading)' }}>{audit?.stats.last24h ?? 0}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Last 24 Hours</div>
        </div>
      </div>

      {/* Security Controls */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-4" style={{ color: 'var(--heading)' }}>Security Controls</h3>
        <div className="space-y-2">
          {securityChecks.map(check => {
            const Icon = check.icon;
            return (
              <div key={check.name} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: check.status === 'Active' ? 'var(--accent)' : 'var(--text-muted)' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{check.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${check.status === 'Active' ? 'bg-green-500/20 text-green-400' : check.status === 'Ready' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>{check.status}</span>
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{check.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit Log */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-4" style={{ color: 'var(--heading)' }}>Audit Log</h3>
        {audit && audit.events.length > 0 ? (
          <div className="space-y-1">
            {audit.events.map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg text-[10px]" style={{ background: e.severity === 'critical' ? 'rgba(217,74,74,0.06)' : 'var(--background)' }}>
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${e.severity === 'critical' ? 'bg-red-500' : e.severity === 'warning' ? 'bg-amber-500' : 'bg-green-500'}`} />
                <span style={{ color: 'var(--text-muted)' }}><Clock className="w-3 h-3 inline mr-0.5" />{new Date(e.timestamp).toLocaleTimeString()}</span>
                <span className="font-semibold" style={{ color: 'var(--heading)' }}>{e.action}</span>
                <span className="flex-1 truncate" style={{ color: 'var(--text-muted)' }}>{e.detail}</span>
                <span style={{ color: 'var(--text-muted)' }}>{e.ip}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)' }}>No audit events yet. Events are logged when API routes are accessed.</div>
        )}
      </div>
    </div>
  );
}
