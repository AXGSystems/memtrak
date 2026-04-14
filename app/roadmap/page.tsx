'use client';

import { CheckCircle, Circle, ArrowRight, Zap } from 'lucide-react';
import Card from '@/components/Card';

const phases = [
  {
    n: 1, title: 'Manual Logging', time: 'Complete', cost: '$0', status: 'Complete' as const,
    desc: 'Staff log every outreach in MEMTrak Communication Log.',
    gain: 'Baseline visibility: who sent what to whom',
    checklist: ['Build Communication Log UI', 'Add seed data for demo', 'CSV export functionality', 'Search and filter', 'Outcome tracking badges'],
  },
  {
    n: 2, title: 'MEMTrak Tracking', time: 'Complete', cost: '$0', status: 'Complete' as const,
    desc: 'Logo tracker, click tracker, confirm/deny receipts, unsubscribe management.',
    gain: 'Open/click tracking on all emails without any ESP',
    checklist: ['ALTA logo tracker endpoint', 'Click tracker with redirect', 'Confirm/deny receipt buttons', 'Read receipt pixel', 'Unsubscribe endpoint (CAN-SPAM)', 'Code generator page', 'Tracking dashboard'],
  },
  {
    n: 3, title: 'Graph API Inbox Monitoring', time: '2-4 weeks', cost: '$0 (M365)', status: 'Not Started' as const,
    desc: 'Connect to membership@ and licensing@ via Microsoft Graph. Auto-count sends, parse bounces.',
    gain: 'Automated send volume + bounce detection',
    checklist: ['Register Azure AD app', 'Configure Graph API permissions', 'Build inbox polling service', 'Parse bounce notifications', 'Auto-count sent emails per campaign', 'Map sender to staff member'],
  },
  {
    n: 4, title: 'Supabase Persistence', time: '1-2 weeks', cost: '$25/mo', status: 'Not Started' as const,
    desc: 'Move from in-memory to Supabase PostgreSQL. All events persist across deployments.',
    gain: 'Permanent tracking history + cross-session analytics',
    checklist: ['Create Supabase project', 'Design tracking events schema', 'Migrate in-memory store to PostgreSQL', 'Add row-level security', 'Update all API routes to use Supabase', 'Test persistence across deployments'],
  },
  {
    n: 5, title: 'Unified Analytics', time: '2-4 weeks', cost: '$0', status: 'Not Started' as const,
    desc: 'All data flowing. Intelligence dashboard shows real data. Revenue attribution live.',
    gain: 'Complete picture: every email, every open, every click, every $',
    checklist: ['Connect all data sources to analytics', 'Build revenue attribution model', 'Real-time dashboard updates', 'Campaign ROI calculations', 'Member engagement scoring', 'Executive summary reports'],
  },
];

const statusColorMap: Record<string, string> = {
  Complete: 'bg-green-500/20 text-green-400',
  'Not Started': '__muted__',
};

function StatusBadge({ status }: { status: string }) {
  const cls = statusColorMap[status];
  if (cls === '__muted__') {
    return (
      <span
        className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
        style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}
      >
        {status}
      </span>
    );
  }
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${cls}`}>{status}</span>
  );
}

function PhasePillBadge({ status, n }: { status: string; n: number }) {
  const cls = statusColorMap[status];
  if (cls === '__muted__') {
    return (
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
        style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}
      >
        <Circle className="w-3 h-3" />
        Phase {n}
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold ${cls}`}>
      {status === 'Complete' ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
      Phase {n}
    </div>
  );
}

export default function Roadmap() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-2" style={{ color: 'var(--heading)' }}>Tracking Roadmap</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>5-phase plan from current state to full email intelligence</p>

      <Card
        title="Current State: Critical Gap"
        accent="#ef4444"
        detailTitle="Current State Analysis"
        detailContent={
          <div className="space-y-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <p>ALTA has no centralized email tracking. Communications are scattered across inboxes with no unified metrics.</p>
            <p><strong style={{ color: 'var(--heading)' }}>Impact:</strong></p>
            <ul className="list-disc ml-4 space-y-1">
              <li>No way to measure campaign effectiveness</li>
              <li>Duplicate outreach to the same members</li>
              <li>No compliance audit trail for PFL communications</li>
              <li>Revenue attribution is impossible</li>
            </ul>
            <p><strong style={{ color: 'var(--heading)' }}>MEMTrak Solution:</strong> A phased approach that starts with manual logging (immediate value) and builds toward full automated intelligence.</p>
          </div>
        }
      >
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ALTA has no centralized email tracking. Communications are scattered across inboxes with no unified metrics. MEMTrak is solving this phase by phase.</p>
      </Card>

      <div className="flex items-center gap-2 my-6 overflow-x-auto pb-2">
        {phases.map((p, i) => (
          <div key={p.n} className="flex items-center gap-2 flex-shrink-0">
            <PhasePillBadge status={p.status} n={p.n} />
            {i < phases.length - 1 && <ArrowRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />}
          </div>
        ))}
      </div>

      {phases.map(p => (
        <Card
          key={p.n}
          title={`Phase ${p.n}: ${p.title}`}
          accent={p.status === 'Complete' ? '#22c55e' : 'var(--card-border)'}
          className="mb-4"
          detailTitle={`Phase ${p.n}: ${p.title} — Implementation Checklist`}
          detailContent={
            <div className="space-y-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>{p.desc}</p>
              <div>
                <strong style={{ color: 'var(--heading)' }}>Timeline:</strong> {p.time} &middot; <strong style={{ color: 'var(--heading)' }}>Cost:</strong> {p.cost}
              </div>
              <div>
                <strong style={{ color: 'var(--heading)' }}>Implementation Checklist:</strong>
                <ul className="mt-2 space-y-1.5">
                  {p.checklist.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {p.status === 'Complete'
                        ? <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                        : <Circle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      }
                      <span style={{ color: p.status === 'Complete' ? 'var(--heading)' : 'var(--text-muted)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-green-400 flex-shrink-0" />
                  <span className="text-green-400 font-semibold">Tracking gain: {p.gain}</span>
                </div>
              </div>
            </div>
          }
        >
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={p.status} />
            <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>{p.time} &middot; {p.cost}</span>
          </div>
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
          <div className="flex items-center gap-1.5 p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
            <Zap className="w-3 h-3 text-green-400 flex-shrink-0" />
            <span className="text-[10px] text-green-400 font-semibold">Tracking gain: {p.gain}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
