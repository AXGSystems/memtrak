'use client';

import { useEffect, useState } from 'react';
import { Database, Mail, BarChart3, Globe, Shield, Zap, CheckCircle, Clock, MinusCircle } from 'lucide-react';

/**
 * Integrations Hub
 *
 * Status is resolved at runtime from /api/memtrak/integrations/status, which
 * probes for the actual environment variables. Nothing is shown as connected
 * unless its credentials are truly present in this environment. Integrations
 * with no client code yet are honestly labeled "Not Implemented".
 */

type RuntimeStatus = 'Configured' | 'Not Configured' | 'Not Implemented';

interface Integration {
  key: string;
  name: string;
  desc: string;
  icon: typeof Database;
  envVars: string[];
  category: string;
}

const integrations: Integration[] = [
  { key: 'graph', name: 'Microsoft Graph API', desc: 'Send tracked email from membership@ and licensing@; parse bounces', icon: Mail, envVars: ['GRAPH_CLIENT_ID', 'GRAPH_CLIENT_SECRET', 'GRAPH_TENANT_ID'], category: 'Email' },
  { key: 'anthropic', name: 'Claude AI (Anthropic)', desc: 'AI assistant, subject-line generation, content optimization', icon: Zap, envVars: ['ANTHROPIC_API_KEY'], category: 'AI' },
  { key: 'supabase', name: 'Supabase', desc: 'Durable storage for MEMTrak events, suppression, and audit log', icon: Database, envVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'], category: 'Data' },
  { key: 'azure_sql', name: 'Azure SQL (re:Members)', desc: 'Shared AMS database — member records, dues, contact info', icon: Database, envVars: ['AZURE_SQL_SERVER', 'AZURE_SQL_USER', 'AZURE_SQL_PASSWORD'], category: 'Data' },
  { key: 'ga4', name: 'Google Analytics 4', desc: 'Website traffic attribution — which emails drive site visits', icon: Globe, envVars: ['GA4_PROPERTY_ID', 'GA4_SERVICE_ACCOUNT_KEY'], category: 'Analytics' },
  { key: 'revive', name: 'Revive Ad Server', desc: 'Campaign performance, ad zone inventory, revenue tracking', icon: BarChart3, envVars: ['REVIVE_API_URL', 'REVIVE_API_KEY'], category: 'Advertising' },
  { key: 'zerobounce', name: 'ZeroBounce', desc: 'Production-grade email verification ($0.005/email)', icon: Shield, envVars: ['ZEROBOUNCE_API_KEY'], category: 'Hygiene' },
  { key: 'twilio', name: 'Twilio (SMS)', desc: 'SMS channel for renewal reminders and urgent alerts', icon: Mail, envVars: ['TWILIO_SID', 'TWILIO_TOKEN', 'TWILIO_FROM'], category: 'Channels' },
];

const statusConfig: Record<RuntimeStatus, { label: string; bg: string; icon: typeof CheckCircle }> = {
  'Configured': { label: 'Configured', bg: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  'Not Configured': { label: 'Not Configured', bg: 'bg-amber-500/20 text-amber-400', icon: Clock },
  'Not Implemented': { label: 'Not Implemented', bg: 'bg-slate-500/20 text-slate-400', icon: MinusCircle },
};

export default function Integrations() {
  const [statuses, setStatuses] = useState<Record<string, RuntimeStatus> | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/memtrak/integrations/status')
      .then(r => r.json())
      .then((data: { integrations?: { key: string; status: RuntimeStatus }[] }) => {
        if (!active) return;
        const map: Record<string, RuntimeStatus> = {};
        for (const i of data.integrations || []) map[i.key] = i.status;
        setStatuses(map);
      })
      .catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, []);

  const statusFor = (key: string): RuntimeStatus => statuses?.[key] ?? 'Not Configured';
  const configuredCount = statuses ? Object.values(statuses).filter(s => s === 'Configured').length : null;

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Integrations Hub</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
        {integrations.length} integrations — status probed from the live environment.{' '}
        {loadError
          ? 'Could not load runtime status.'
          : configuredCount === null
            ? 'Checking configuration…'
            : `${configuredCount} configured. Configure the rest via environment variables.`}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {integrations.map(int => {
          const Icon = int.icon;
          const status = statusFor(int.key);
          const s = statusConfig[status];
          const StatusIcon = s.icon;
          return (
            <div key={int.name} className="rounded-xl border p-5 transition-all hover:translate-y-[-1px]" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                  <Icon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{int.name}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${s.bg}`}><StatusIcon className="w-2.5 h-2.5 inline mr-0.5" />{s.label}</span>
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{int.desc}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {int.envVars.map(v => <code key={v} className="text-[11px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--background)', color: 'var(--text-muted)' }}>{v}</code>)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
