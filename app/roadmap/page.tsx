'use client';

import { CheckCircle, Circle, ArrowRight, Zap } from 'lucide-react';

const phases = [
  { n: 1, title: 'Manual Logging', time: 'Complete', cost: '$0', status: 'Complete' as const, desc: 'Staff log every outreach in MEMTrak Communication Log.', gain: 'Baseline visibility: who sent what to whom' },
  { n: 2, title: 'MEMTrak Tracking', time: 'Complete', cost: '$0', status: 'Complete' as const, desc: 'Logo tracker, click tracker, confirm/deny receipts, unsubscribe management.', gain: 'Open/click tracking on all emails without any ESP' },
  { n: 3, title: 'Graph API Inbox Monitoring', time: '2-4 weeks', cost: '$0 (M365)', status: 'Not Started' as const, desc: 'Connect to membership@ and licensing@ via Microsoft Graph. Auto-count sends, parse bounces.', gain: 'Automated send volume + bounce detection' },
  { n: 4, title: 'Supabase Persistence', time: '1-2 weeks', cost: '$25/mo', status: 'Not Started' as const, desc: 'Move from in-memory to Supabase PostgreSQL. All events persist across deployments.', gain: 'Permanent tracking history + cross-session analytics' },
  { n: 5, title: 'Unified Analytics', time: '2-4 weeks', cost: '$0', status: 'Not Started' as const, desc: 'All data flowing. Intelligence dashboard shows real data. Revenue attribution live.', gain: 'Complete picture: every email, every open, every click, every $' },
];

const statusColors = { Complete: 'bg-green-500/20 text-green-400', 'Not Started': 'bg-white/10 text-white/40' };

export default function Roadmap() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold text-white mb-2">Tracking Roadmap</h1>
      <p className="text-xs text-white/40 mb-6">5-phase plan from current state to full email intelligence</p>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 mb-6 border-l-4 border-l-red-500">
        <h3 className="text-sm font-bold text-white mb-1">Current State: Critical Gap</h3>
        <p className="text-xs text-white/50">ALTA has no centralized email tracking. Communications are scattered across inboxes with no unified metrics. MEMTrak is solving this phase by phase.</p>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {phases.map((p, i) => (
          <div key={p.n} className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold ${statusColors[p.status]}`}>
              {p.status === 'Complete' ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
              Phase {p.n}
            </div>
            {i < phases.length - 1 && <ArrowRight className="w-3 h-3 text-white/20" />}
          </div>
        ))}
      </div>

      {phases.map(p => (
        <div key={p.n} className={`bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 mb-4 border-l-4 ${p.status === 'Complete' ? 'border-l-green-500' : 'border-l-white/20'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-white">Phase {p.n}: {p.title}</span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${statusColors[p.status]}`}>{p.status}</span>
            <span className="text-[10px] text-white/30 ml-auto">{p.time} · {p.cost}</span>
          </div>
          <p className="text-xs text-white/50 mb-2">{p.desc}</p>
          <div className="flex items-center gap-1.5 p-2.5 rounded-lg bg-white/5">
            <Zap className="w-3 h-3 text-green-400 flex-shrink-0" />
            <span className="text-[10px] text-green-400 font-semibold">Tracking gain: {p.gain}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
