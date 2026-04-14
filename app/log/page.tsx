'use client';

import { useState } from 'react';
import { exportCSV } from '@/lib/export-utils';
import Card from '@/components/Card';
import { Plus, Search, Download, Mail, Phone, Users, Send, CheckCircle, Clock, MessageSquare } from 'lucide-react';

const seedEntries = [
  { id: '1', date: '2026-04-11', staff: 'Taylor Spolidoro', from: 'membership@alta.org', channel: 'Email', recipient: 'Jane Smith', org: 'First American Title', subject: 'PFL Renewal Reminder', campaign: 'PFL Compliance', outcome: 'Reply Received', notes: 'Confirmed renewal. Payment by Apr 30.' },
  { id: '2', date: '2026-04-10', staff: 'Paul Martin', from: 'membership@alta.org', channel: 'Phone', recipient: 'Robert Chen', org: 'Chicago Title Insurance', subject: 'ACU Retention Check-in', campaign: 'Retention', outcome: 'Action Taken', notes: 'Underwriter happy with DASH 2.0. No churn risk.' },
  { id: '3', date: '2026-04-09', staff: 'Taylor Spolidoro', from: 'membership@alta.org', channel: 'Email', recipient: 'Unknown', org: 'Heritage Abstract LLC', subject: 'PFL Compliance Notice', campaign: 'PFL Compliance', outcome: 'Bounced', notes: 'Invalid address. Need updated contact.' },
  { id: '4', date: '2026-04-08', staff: 'Chris Morton', from: 'cmorton@alta.org', channel: 'Meeting', recipient: 'Sarah Williams', org: 'Liberty Title Group', subject: 'Membership Value Review', campaign: 'Retention', outcome: 'Meeting Scheduled', notes: 'Considering multi-office upgrade.' },
  { id: '5', date: '2026-04-07', staff: 'Taylor Spolidoro', from: 'licensing@alta.org', channel: 'Email', recipient: 'Michael Brown', org: 'National Title Services', subject: 'PFL Non-Compliant Follow-up', campaign: 'PFL Compliance', outcome: 'Not Interested', notes: 'Budget constraints. Revisit Q3.' },
  { id: '6', date: '2026-04-05', staff: 'Emily Mincey', from: 'membership@alta.org', channel: 'Email', recipient: 'Lisa Anderson', org: 'Commonwealth Land Title', subject: 'ALTA ONE Early Registration', campaign: 'Events', outcome: 'Action Taken', notes: 'Registered 3 attendees.' },
];

const outcomeColors: Record<string, string> = {
  'Reply Received': 'bg-green-500/20 text-green-400',
  'Action Taken': 'bg-green-500/20 text-green-400',
  'Bounced': 'bg-red-500/20 text-red-400',
  'Meeting Scheduled': 'bg-blue-500/20 text-blue-400',
  'Not Interested': 'bg-amber-500/20 text-amber-400',
  'Sent — No Reply': '__muted__',
};
const channelIcons: Record<string, typeof Mail> = { Email: Mail, Phone: Phone, Meeting: Users };

function OutcomeBadge({ outcome }: { outcome: string }) {
  const cls = outcomeColors[outcome];
  if (cls === '__muted__' || !cls) {
    return (
      <span
        className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
        style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}
      >
        {outcome}
      </span>
    );
  }
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${cls}`}>{outcome}</span>
  );
}

export default function CommunicationLog() {
  const [search, setSearch] = useState('');
  const filtered = search ? seedEntries.filter(e => (e.org + e.recipient + e.subject + e.staff).toLowerCase().includes(search.toLowerCase())) : seedEntries;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>Communication Log</h1>
        <button onClick={() => exportCSV(['Date', 'Staff', 'From', 'Channel', 'Recipient', 'Org', 'Subject', 'Campaign', 'Outcome', 'Notes'], filtered.map(e => [e.date, e.staff, e.from, e.channel, e.recipient, e.org, e.subject, e.campaign, e.outcome, e.notes]), 'MEMTrak_CommLog')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#8CC63F] hover:bg-[#6fa030]"><Download className="w-3 h-3" /> CSV</button>
      </div>

      <Card
        title="Why this log exists"
        accent="#4A90D9"
        detailTitle="Communication Log — Full Context"
        detailContent={
          <div className="space-y-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <p>ALTA has no centralized way to track outreach. Staff currently rely on checking individual inboxes (membership@alta.org, licensing@alta.org) to see what was sent and to whom.</p>
            <p><strong style={{ color: 'var(--heading)' }}>Problem:</strong> No single view of all communications. No way to know if a member was contacted by multiple staff. No audit trail for compliance outreach.</p>
            <p><strong style={{ color: 'var(--heading)' }}>Solution:</strong> This log replaces inbox-checking with a unified record. Every outreach touch is recorded with staff, channel, campaign, and outcome.</p>
            <p><strong style={{ color: 'var(--heading)' }}>How to use:</strong></p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Log every outreach after it happens (email, phone, meeting)</li>
              <li>Use the search bar to find past communications by org, name, or subject</li>
              <li>Export to CSV for reporting or sharing with leadership</li>
              <li>Track outcomes to measure campaign effectiveness</li>
            </ul>
          </div>
        }
      >
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ALTA has no centralized way to track outreach. This replaces checking membership@ and licensing@ inboxes manually. Every touch gets recorded so the team sees the full picture.</p>
      </Card>

      <div className="relative my-4">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, org, subject..."
          className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl focus:outline-none"
          style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--heading)' }}
        />
      </div>

      <div className="space-y-2">
        {filtered.map(e => {
          const Icon = channelIcons[e.channel] || Mail;
          return (
            <Card key={e.id} className="!p-0" noPad>
              <div className="flex items-start gap-3 p-3.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--input-bg)' }}>
                  <Icon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{e.recipient}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>{e.org}</span>
                    <OutcomeBadge outcome={e.outcome} />
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{e.subject}</div>
                  <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{e.notes}</div>
                  <div className="flex items-center gap-4 mt-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span><Clock className="w-3 h-3 inline mr-0.5" />{e.date}</span>
                    <span>{e.staff}</span>
                    <span>{e.from}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)' }}>{e.campaign}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
