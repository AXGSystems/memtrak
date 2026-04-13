'use client';

import { useState } from 'react';
import { exportCSV } from '@/lib/export-utils';
import { Plus, Search, Download, X, Mail, Phone, Users, Send, CheckCircle, Clock, MessageSquare } from 'lucide-react';

const seedEntries = [
  { id: '1', date: '2026-04-11', staff: 'Taylor Spolidoro', from: 'membership@alta.org', channel: 'Email', recipient: 'Jane Smith', org: 'First American Title', subject: 'PFL Renewal Reminder', campaign: 'PFL Compliance', outcome: 'Reply Received', notes: 'Confirmed renewal. Payment by Apr 30.' },
  { id: '2', date: '2026-04-10', staff: 'Paul Martin', from: 'membership@alta.org', channel: 'Phone', recipient: 'Robert Chen', org: 'Chicago Title Insurance', subject: 'ACU Retention Check-in', campaign: 'Retention', outcome: 'Action Taken', notes: 'Underwriter happy with DASH 2.0. No churn risk.' },
  { id: '3', date: '2026-04-09', staff: 'Taylor Spolidoro', from: 'membership@alta.org', channel: 'Email', recipient: 'Unknown', org: 'Heritage Abstract LLC', subject: 'PFL Compliance Notice', campaign: 'PFL Compliance', outcome: 'Bounced', notes: 'Invalid address. Need updated contact.' },
  { id: '4', date: '2026-04-08', staff: 'Chris Morton', from: 'cmorton@alta.org', channel: 'Meeting', recipient: 'Sarah Williams', org: 'Liberty Title Group', subject: 'Membership Value Review', campaign: 'Retention', outcome: 'Meeting Scheduled', notes: 'Considering multi-office upgrade.' },
  { id: '5', date: '2026-04-07', staff: 'Taylor Spolidoro', from: 'licensing@alta.org', channel: 'Email', recipient: 'Michael Brown', org: 'National Title Services', subject: 'PFL Non-Compliant Follow-up', campaign: 'PFL Compliance', outcome: 'Not Interested', notes: 'Budget constraints. Revisit Q3.' },
  { id: '6', date: '2026-04-05', staff: 'Emily Mincey', from: 'membership@alta.org', channel: 'Email', recipient: 'Lisa Anderson', org: 'Commonwealth Land Title', subject: 'ALTA ONE Early Registration', campaign: 'Events', outcome: 'Action Taken', notes: 'Registered 3 attendees.' },
];

const outcomeColors: Record<string, string> = { 'Reply Received': 'bg-green-500/20 text-green-400', 'Action Taken': 'bg-green-500/20 text-green-400', 'Bounced': 'bg-red-500/20 text-red-400', 'Meeting Scheduled': 'bg-blue-500/20 text-blue-400', 'Not Interested': 'bg-amber-500/20 text-amber-400', 'Sent — No Reply': 'bg-white/10 text-white/50' };
const channelIcons: Record<string, typeof Mail> = { Email: Mail, Phone: Phone, Meeting: Users };

export default function CommunicationLog() {
  const [search, setSearch] = useState('');
  const filtered = search ? seedEntries.filter(e => (e.org + e.recipient + e.subject + e.staff).toLowerCase().includes(search.toLowerCase())) : seedEntries;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-extrabold text-white">Communication Log</h1>
        <button onClick={() => exportCSV(['Date', 'Staff', 'From', 'Channel', 'Recipient', 'Org', 'Subject', 'Campaign', 'Outcome', 'Notes'], filtered.map(e => [e.date, e.staff, e.from, e.channel, e.recipient, e.org, e.subject, e.campaign, e.outcome, e.notes]), 'MEMTrak_CommLog')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#8CC63F] hover:bg-[#6fa030]"><Download className="w-3 h-3" /> CSV</button>
      </div>

      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 mb-6 border-l-4 border-l-[#4A90D9]">
        <p className="text-xs text-white/60"><strong className="text-white">Why this log exists:</strong> ALTA has no centralized way to track outreach. This replaces checking membership@ and licensing@ inboxes manually. Every touch gets recorded so the team sees the full picture.</p>
      </div>

      <div className="relative mb-4">
        <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, org, subject..." className="w-full pl-9 pr-3 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#8CC63F]/50" />
      </div>

      <div className="space-y-2">
        {filtered.map(e => {
          const Icon = channelIcons[e.channel] || Mail;
          return (
            <div key={e.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-white/40" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">{e.recipient}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">{e.org}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${outcomeColors[e.outcome] || 'bg-white/10 text-white/50'}`}>{e.outcome}</span>
                </div>
                <div className="text-xs text-white/60 mt-0.5">{e.subject}</div>
                <div className="text-[10px] text-white/30 mt-1">{e.notes}</div>
                <div className="flex items-center gap-4 mt-1.5 text-[10px] text-white/30">
                  <span><Clock className="w-3 h-3 inline mr-0.5" />{e.date}</span>
                  <span>{e.staff}</span>
                  <span>{e.from}</span>
                  <span className="px-1.5 py-0.5 rounded bg-white/5">{e.campaign}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
