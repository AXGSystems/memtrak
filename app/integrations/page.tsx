'use client';

import { Database, Mail, BarChart3, Globe, Shield, Zap, CheckCircle, Clock, XCircle } from 'lucide-react';

const integrations = [
  { name: 'Microsoft Graph API', desc: 'Monitor membership@ and licensing@ mailboxes — auto-count sends, parse bounces', status: 'Ready' as const, icon: Mail, envVars: ['GRAPH_CLIENT_ID', 'GRAPH_CLIENT_SECRET', 'GRAPH_TENANT_ID'], category: 'Email' },
  { name: 'Azure SQL (re:Members)', desc: 'Shared database with the AMS — member records, dues, contact info', status: 'Ready' as const, icon: Database, envVars: ['AZURE_SQL_SERVER', 'AZURE_SQL_USER', 'AZURE_SQL_PASSWORD'], category: 'Data' },
  { name: 'Google Analytics 4', desc: 'Website traffic attribution — which emails drive site visits', status: 'Ready' as const, icon: Globe, envVars: ['GA4_PROPERTY_ID', 'GA4_SERVICE_ACCOUNT_KEY'], category: 'Analytics' },
  { name: 'Revive Ad Server', desc: 'Campaign performance, ad zone inventory, revenue tracking', status: 'Connected' as const, icon: BarChart3, envVars: ['REVIVE_API_URL', 'REVIVE_API_KEY'], category: 'Advertising' },
  { name: 'Claude AI (Anthropic)', desc: 'AI subject lines, sentiment analysis, content optimization', status: 'Ready' as const, icon: Zap, envVars: ['ANTHROPIC_API_KEY'], category: 'AI' },
  { name: 'Supabase', desc: 'Persistent storage for MEMTrak events (replaces in-memory)', status: 'Planned' as const, icon: Database, envVars: ['SUPABASE_URL', 'SUPABASE_ANON_KEY'], category: 'Data' },
  { name: 'ZeroBounce', desc: 'Production-grade email verification ($0.005/email)', status: 'Planned' as const, icon: Shield, envVars: ['ZEROBOUNCE_API_KEY'], category: 'Hygiene' },
  { name: 'Twilio (SMS)', desc: 'SMS channel for renewal reminders and urgent alerts', status: 'Planned' as const, icon: Mail, envVars: ['TWILIO_SID', 'TWILIO_TOKEN', 'TWILIO_FROM'], category: 'Channels' },
];

const statusConfig = { Connected: { color: '#8CC63F', bg: 'bg-green-500/20 text-green-400', icon: CheckCircle }, Ready: { color: '#4A90D9', bg: 'bg-blue-500/20 text-blue-400', icon: Clock }, Planned: { color: '#E8923F', bg: 'bg-amber-500/20 text-amber-400', icon: Clock } };

export default function Integrations() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Integrations Hub</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>{integrations.length} integrations — {integrations.filter(i => i.status === 'Connected').length} connected, {integrations.filter(i => i.status === 'Ready').length} ready to connect, {integrations.filter(i => i.status === 'Planned').length} planned. Configure via environment variables.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {integrations.map(int => {
          const Icon = int.icon;
          const s = statusConfig[int.status];
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
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${s.bg}`}><StatusIcon className="w-2.5 h-2.5 inline mr-0.5" />{int.status}</span>
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{int.desc}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {int.envVars.map(v => <code key={v} className="text-[8px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'var(--background)', color: 'var(--text-muted)' }}>{v}</code>)}
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
