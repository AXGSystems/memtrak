'use client';

import { useState, useRef } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import SideDrawer from '@/components/SideDrawer';
import AnimatedCounter from '@/components/AnimatedCounter';
import {
  ClipboardCheck, Mail, Phone, Users, Calendar, MoreHorizontal,
  Trophy, Clock, Zap, UserCheck, CheckCircle, ChevronRight,
} from 'lucide-react';

/* ── colors ────────────────────────────────────────────────────────── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  purple: '#7C5CFC',
  teal: '#14B8A6',
  navy: '#002D5C',
};

/* ── types ─────────────────────────────────────────────────────────── */
type Channel = 'Email' | 'Phone' | 'Meeting' | 'Event' | 'Other';
type Outcome = 'Reply Received' | 'Action Taken' | 'Bounced' | 'Meeting Scheduled' | 'Not Interested' | 'Sent \u2014 No Reply' | 'Follow-up Needed';

interface LogEntry {
  id: string;
  date: string;
  staff: string;
  channel: Channel;
  org: string;
  contact: string;
  subject: string;
  outcome: Outcome;
  notes: string;
}

/* ── staff data ────────────────────────────────────────────────────── */
const STAFF = ['Chris Morton', 'Paul Martin', 'Taylor Spolidoro', 'Caroline Ehrenfeld', 'Emily Mincey'];
const CHANNELS: { label: Channel; icon: typeof Mail }[] = [
  { label: 'Email', icon: Mail },
  { label: 'Phone', icon: Phone },
  { label: 'Meeting', icon: Users },
  { label: 'Event', icon: Calendar },
  { label: 'Other', icon: MoreHorizontal },
];
const OUTCOMES: Outcome[] = ['Reply Received', 'Action Taken', 'Bounced', 'Meeting Scheduled', 'Not Interested', 'Sent \u2014 No Reply', 'Follow-up Needed'];

const ORG_SUGGESTIONS = [
  'First American Title', 'Chicago Title Insurance', 'Heritage Abstract LLC',
  'Liberty Title Group', 'National Title Services', 'Commonwealth Land Title',
  'Old Republic Title', 'Stewart Title Guaranty', 'Fidelity National Title',
  'WFG National Title', 'North American Title', 'Westcor Land Title',
];

/* ── outcome colors ────────────────────────────────────────────────── */
const outcomeStyle: Record<string, { bg: string; text: string }> = {
  'Reply Received':   { bg: 'rgba(140,198,63,0.15)', text: C.green },
  'Action Taken':     { bg: 'rgba(140,198,63,0.15)', text: C.green },
  'Bounced':          { bg: 'rgba(217,74,74,0.15)', text: C.red },
  'Meeting Scheduled':{ bg: 'rgba(74,144,217,0.15)', text: C.blue },
  'Not Interested':   { bg: 'rgba(232,146,63,0.15)', text: C.orange },
  'Sent \u2014 No Reply':  { bg: 'var(--input-bg)', text: 'var(--text-muted)' },
  'Follow-up Needed': { bg: 'rgba(124,92,252,0.15)', text: C.purple },
};

/* ── channel colors ────────────────────────────────────────────────── */
const channelColor: Record<Channel, string> = {
  Email: C.blue,
  Phone: C.green,
  Meeting: C.purple,
  Event: C.orange,
  Other: C.teal,
};

/* ── channel icons map ─────────────────────────────────────────────── */
const channelIconMap: Record<Channel, typeof Mail> = {
  Email: Mail, Phone: Phone, Meeting: Users, Event: Calendar, Other: MoreHorizontal,
};

/* ── seed entries ──────────────────────────────────────────────────── */
const SEED_ENTRIES: LogEntry[] = [
  { id: 's1', date: '2026-04-14', staff: 'Taylor Spolidoro', channel: 'Email', org: 'First American Title', contact: 'Jane Smith', subject: 'PFL Renewal Reminder', outcome: 'Reply Received', notes: 'Confirmed renewal. Payment by Apr 30.' },
  { id: 's2', date: '2026-04-13', staff: 'Paul Martin', channel: 'Phone', org: 'Chicago Title Insurance', contact: 'Robert Chen', subject: 'ACU Retention Check-in', outcome: 'Action Taken', notes: 'Underwriter happy with DASH 2.0. No churn risk.' },
  { id: 's3', date: '2026-04-12', staff: 'Taylor Spolidoro', channel: 'Email', org: 'Heritage Abstract LLC', contact: 'Unknown', subject: 'PFL Compliance Notice', outcome: 'Bounced', notes: 'Invalid address. Need updated contact.' },
  { id: 's4', date: '2026-04-11', staff: 'Chris Morton', channel: 'Meeting', org: 'Liberty Title Group', contact: 'Sarah Williams', subject: 'Membership Value Review', outcome: 'Meeting Scheduled', notes: 'Considering multi-office upgrade. Follow-up May 2.' },
  { id: 's5', date: '2026-04-10', staff: 'Taylor Spolidoro', channel: 'Email', org: 'National Title Services', contact: 'Michael Brown', subject: 'PFL Non-Compliant Follow-up', outcome: 'Not Interested', notes: 'Budget constraints. Revisit Q3.' },
  { id: 's6', date: '2026-04-10', staff: 'Emily Mincey', channel: 'Email', org: 'Commonwealth Land Title', contact: 'Lisa Anderson', subject: 'ALTA ONE Early Registration', outcome: 'Action Taken', notes: 'Registered 3 attendees.' },
  { id: 's7', date: '2026-04-09', staff: 'Caroline Ehrenfeld', channel: 'Event', org: 'Old Republic Title', contact: 'David Park', subject: 'Spring Regional Networking', outcome: 'Reply Received', notes: 'Confirmed attendance for 5 staff members.' },
  { id: 's8', date: '2026-04-09', staff: 'Paul Martin', channel: 'Phone', org: 'Stewart Title Guaranty', contact: 'Karen Lee', subject: 'Membership Tier Upgrade', outcome: 'Follow-up Needed', notes: 'Interested but needs board approval. Call back Apr 25.' },
  { id: 's9', date: '2026-04-08', staff: 'Chris Morton', channel: 'Meeting', org: 'WFG National Title', contact: 'Tom Richards', subject: 'CEO Roundtable Invite', outcome: 'Meeting Scheduled', notes: 'Lunch meeting set for Apr 22 in DC.' },
  { id: 's10', date: '2026-04-08', staff: 'Emily Mincey', channel: 'Email', org: 'Fidelity National Title', contact: 'Angela Torres', subject: 'New Member Onboarding', outcome: 'Sent \u2014 No Reply', notes: 'Welcome packet sent. Will follow up if no response by Apr 15.' },
];

/* ── staff initials + color ────────────────────────────────────────── */
function staffAvatar(name: string): { initials: string; color: string } {
  const parts = name.split(' ');
  const initials = parts.map(p => p[0]).join('').slice(0, 2);
  const colors = [C.blue, C.green, C.purple, C.orange, C.teal];
  const idx = STAFF.indexOf(name);
  return { initials, color: colors[idx >= 0 ? idx : 0] };
}

/* ── relative date ─────────────────────────────────────────────────── */
function relativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date('2026-04-14');
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return dateStr;
}

/* ── page ──────────────────────────────────────────────────────────── */
export default function EngagementLog() {
  const [entries, setEntries] = useState<LogEntry[]>(SEED_ENTRIES);
  const [drawerEntry, setDrawerEntry] = useState<LogEntry | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  /* form state */
  const [formStaff, setFormStaff] = useState(STAFF[0]);
  const [formChannel, setFormChannel] = useState<Channel>('Email');
  const [formOrg, setFormOrg] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formOutcome, setFormOutcome] = useState<Outcome>(OUTCOMES[0]);
  const [formNotes, setFormNotes] = useState('');
  const [showOrgSuggestions, setShowOrgSuggestions] = useState(false);

  const filteredOrgs = formOrg.length > 0
    ? ORG_SUGGESTIONS.filter(o => o.toLowerCase().includes(formOrg.toLowerCase()))
    : [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formOrg.trim() || !formContact.trim() || !formSubject.trim()) return;

    const newEntry: LogEntry = {
      id: `u${Date.now()}`,
      date: '2026-04-14',
      staff: formStaff,
      channel: formChannel,
      org: formOrg.trim(),
      contact: formContact.trim(),
      subject: formSubject.trim(),
      outcome: formOutcome,
      notes: formNotes.trim(),
    };
    setEntries(prev => [newEntry, ...prev]);
    setFormOrg('');
    setFormContact('');
    setFormSubject('');
    setFormNotes('');
    setFormChannel('Email');
    setFormOutcome(OUTCOMES[0]);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2500);
  }

  /* ── chart data ────────────────────────────────────────────────── */
  // Staff activity bar chart
  const staffCounts = STAFF.map(s => entries.filter(e => e.staff === s).length);
  const staffChartData = {
    labels: STAFF.map(s => s.split(' ')[0]),
    datasets: [{
      label: 'Entries',
      data: staffCounts,
      backgroundColor: [
        'rgba(74,144,217,0.7)', 'rgba(140,198,63,0.7)', 'rgba(124,92,252,0.7)',
        'rgba(232,146,63,0.7)', 'rgba(20,184,166,0.7)',
      ],
      borderRadius: 8,
      borderSkipped: false as const,
    }],
  };

  // Channel doughnut
  const channelLabels: Channel[] = ['Email', 'Phone', 'Meeting', 'Event', 'Other'];
  const channelCounts = channelLabels.map(ch => entries.filter(e => e.channel === ch).length);
  const channelChartData = {
    labels: channelLabels,
    datasets: [{
      data: channelCounts,
      backgroundColor: channelLabels.map(ch => channelColor[ch]),
      borderWidth: 2,
      borderColor: 'rgba(10,22,40,0.8)',
      hoverOffset: 12,
    }],
  };

  // Outcome horizontal bar
  const outcomeCounts = OUTCOMES.map(o => entries.filter(e => e.outcome === o).length);
  const outcomeChartData = {
    labels: OUTCOMES.map(o => o.length > 18 ? o.slice(0, 18) + '\u2026' : o),
    datasets: [{
      label: 'Count',
      data: outcomeCounts,
      backgroundColor: OUTCOMES.map(o => {
        const s = outcomeStyle[o];
        return s ? s.text : 'var(--text-muted)';
      }),
      borderRadius: 6,
      borderSkipped: false as const,
    }],
  };

  // Weekly trend (last 7 days)
  const weekDays = ['Apr 8', 'Apr 9', 'Apr 10', 'Apr 11', 'Apr 12', 'Apr 13', 'Apr 14'];
  const weekDates = ['2026-04-08', '2026-04-09', '2026-04-10', '2026-04-11', '2026-04-12', '2026-04-13', '2026-04-14'];
  const weekCounts = weekDates.map(d => entries.filter(e => e.date === d).length);
  const weekChartData = {
    labels: weekDays,
    datasets: [{
      label: 'Entries',
      data: weekCounts,
      borderColor: C.blue,
      backgroundColor: 'rgba(74,144,217,0.15)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: C.blue,
      pointBorderColor: C.blue,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  /* ── input style helper ────────────────────────────────────────── */
  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--heading)',
  };

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ──────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8CC63F, #4A90D9)', boxShadow: '0 4px 16px rgba(140,198,63,0.3)' }}
          >
            <ClipboardCheck className="w-5 h-5" style={{ color: 'var(--heading)' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              Engagement Logger
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.green }}>
              Log every touchpoint. Build the complete picture.
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. SparkKpi Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger-children">
        <SparkKpi
          label="Entries This Week"
          value={24}
          icon={ClipboardCheck}
          color={C.green}
          sub="Across all staff"
          sparkData={[14, 18, 20, 16, 22, 19, 24]}
          sparkColor={C.green}
          trend={{ value: 12.5, label: 'vs last week' }}
          accent
        />
        <SparkKpi
          label="Staff Active"
          value={5}
          icon={UserCheck}
          color={C.blue}
          sub="All hands logging"
          sparkData={[3, 4, 4, 5, 5, 5, 5]}
          sparkColor={C.blue}
          accent
        />
        <SparkKpi
          label="Avg Response Time"
          value="1.8 days"
          icon={Clock}
          color={C.orange}
          sub="Member reply latency"
          sparkData={[2.4, 2.2, 2.0, 1.9, 1.8, 1.9, 1.8]}
          sparkColor={C.orange}
          trend={{ value: -8.3, label: 'improving' }}
          accent
        />
        <SparkKpi
          label="Top Performer"
          value="Chris Morton"
          icon={Trophy}
          color={C.purple}
          sub="88% reply rate"
          sparkData={[78, 80, 82, 85, 86, 87, 88]}
          sparkColor={C.purple}
          accent
        />
      </div>

      {/* ── 3. Quick Log Form ──────────────────────────────────────── */}
      <Card
        title="Quick Log"
        subtitle="Record a new outreach activity"
        accent={C.green}
        className="mb-6"
      >
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Staff Member */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Staff Member
              </label>
              <select
                value={formStaff}
                onChange={e => setFormStaff(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none appearance-none"
                style={inputStyle}
              >
                {STAFF.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Channel (icon pills) */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Channel
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {CHANNELS.map(ch => {
                  const Icon = ch.icon;
                  const active = formChannel === ch.label;
                  return (
                    <button
                      key={ch.label}
                      type="button"
                      onClick={() => setFormChannel(ch.label)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all duration-200"
                      style={{
                        background: active
                          ? `color-mix(in srgb, ${channelColor[ch.label]} 20%, transparent)`
                          : 'var(--input-bg)',
                        border: `1.5px solid ${active ? channelColor[ch.label] : 'var(--card-border)'}`,
                        color: active ? channelColor[ch.label] : 'var(--text-muted)',
                        transform: active ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {ch.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Member Organization */}
            <div className="relative">
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Member Organization
              </label>
              <input
                type="text"
                value={formOrg}
                onChange={e => { setFormOrg(e.target.value); setShowOrgSuggestions(true); }}
                onFocus={() => setShowOrgSuggestions(true)}
                onBlur={() => setTimeout(() => setShowOrgSuggestions(false), 150)}
                placeholder="Type organization name..."
                className="w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none"
                style={inputStyle}
                required
              />
              {showOrgSuggestions && filteredOrgs.length > 0 && (
                <div
                  className="absolute z-20 left-0 right-0 mt-1 rounded-xl border overflow-hidden max-h-40 overflow-y-auto"
                  style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
                >
                  {filteredOrgs.map(org => (
                    <button
                      key={org}
                      type="button"
                      className="w-full text-left px-3 py-2 text-xs transition-colors"
                      style={{ color: 'var(--heading)' }}
                      onMouseDown={() => { setFormOrg(org); setShowOrgSuggestions(false); }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      {org}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Name */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Contact Name
              </label>
              <input
                type="text"
                value={formContact}
                onChange={e => setFormContact(e.target.value)}
                placeholder="Who did you reach out to?"
                className="w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none"
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subject / Topic */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Subject / Topic
              </label>
              <input
                type="text"
                value={formSubject}
                onChange={e => setFormSubject(e.target.value)}
                placeholder="What was this about?"
                className="w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none"
                style={inputStyle}
                required
              />
            </div>

            {/* Outcome */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Outcome
              </label>
              <select
                value={formOutcome}
                onChange={e => setFormOutcome(e.target.value as Outcome)}
                className="w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none appearance-none"
                style={inputStyle}
              >
                {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
              Notes
            </label>
            <textarea
              value={formNotes}
              onChange={e => setFormNotes(e.target.value)}
              placeholder="Any additional context or follow-up reminders..."
              rows={3}
              className="w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none resize-none"
              style={inputStyle}
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #8CC63F, #6fa030)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(140,198,63,0.35)',
              }}
            >
              <CheckCircle className="w-4 h-4" />
              Log Entry
            </button>
            {successMsg && (
              <span
                className="text-xs font-bold px-3 py-1.5 rounded-lg animate-pulse"
                style={{ background: 'rgba(140,198,63,0.15)', color: C.green }}
              >
                Entry logged successfully!
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* ── 4. Recent Entries Timeline ─────────────────────────────── */}
      <Card
        title="Recent Entries"
        subtitle={`${entries.length} logged activities`}
        className="mb-6"
      >
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-[19px] top-0 bottom-0 w-px"
            style={{ background: 'var(--card-border)' }}
          />

          <div className="space-y-1">
            {entries.map((entry, idx) => {
              const avatar = staffAvatar(entry.staff);
              const ChannelIcon = channelIconMap[entry.channel];
              const os = outcomeStyle[entry.outcome] || { bg: 'var(--input-bg)', text: 'var(--text-muted)' };

              return (
                <div
                  key={entry.id}
                  onClick={() => setDrawerEntry(entry)}
                  className="relative flex items-start gap-3 pl-2 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:translate-x-1 group"
                  style={{
                    animation: idx === 0 && entry.id.startsWith('u') ? 'fadeSlideIn 0.4s ease-out' : undefined,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {/* Avatar / timeline node */}
                  <div
                    className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold"
                    style={{ background: `color-mix(in srgb, ${avatar.color} 20%, transparent)`, color: avatar.color, border: `2px solid ${avatar.color}` }}
                  >
                    {avatar.initials}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{entry.staff}</span>
                      <div
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                        style={{ background: `color-mix(in srgb, ${channelColor[entry.channel]} 15%, transparent)`, color: channelColor[entry.channel] }}
                      >
                        <ChannelIcon className="w-2.5 h-2.5" />
                        {entry.channel}
                      </div>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: os.bg, color: os.text }}
                      >
                        {entry.outcome}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-semibold" style={{ color: 'var(--heading)' }}>{entry.org}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>&middot; {entry.contact}</span>
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{entry.subject}</div>
                    {entry.notes && (
                      <div className="text-[10px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>
                        {entry.notes}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>{relativeDate(entry.date)}</span>
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── 5 & 6. Charts Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Staff Activity Chart */}
        <Card title="Staff Activity" subtitle="Entries per staff member this month">
          <ClientChart
            type="bar"
            height={260}
            data={staffChartData}
            options={{
              scales: {
                y: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa' }, beginAtZero: true },
                x: { grid: { display: false }, ticks: { color: '#8899aa' } },
              },
              plugins: { legend: { display: false } },
            }}
          />
        </Card>

        {/* Channel Distribution */}
        <Card title="Channel Distribution" subtitle="Breakdown by communication channel">
          <ClientChart
            type="doughnut"
            height={260}
            data={channelChartData}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom' as const,
                  labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 10 } },
                },
              },
            }}
          />
        </Card>
      </div>

      {/* ── 7 & 8. Charts Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Outcome Analysis */}
        <Card title="Outcome Analysis" subtitle="Distribution of engagement outcomes">
          <ClientChart
            type="bar"
            height={260}
            data={outcomeChartData}
            options={{
              indexAxis: 'y' as const,
              scales: {
                x: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa' }, beginAtZero: true },
                y: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 } } },
              },
              plugins: { legend: { display: false } },
            }}
          />
        </Card>

        {/* Weekly Trend */}
        <Card title="Weekly Trend" subtitle="Logged entries per day, last 7 days">
          <ClientChart
            type="line"
            height={260}
            data={weekChartData}
            options={{
              scales: {
                y: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa' }, beginAtZero: true },
                x: { grid: { display: false }, ticks: { color: '#8899aa' } },
              },
              plugins: { legend: { display: false } },
            }}
          />
        </Card>
      </div>

      {/* ── SideDrawer for entry detail ────────────────────────────── */}
      <SideDrawer
        isOpen={!!drawerEntry}
        onClose={() => setDrawerEntry(null)}
        title={drawerEntry?.subject || ''}
        subtitle={drawerEntry ? `${drawerEntry.org} \u2014 ${relativeDate(drawerEntry.date)}` : ''}
        width="md"
      >
        {drawerEntry && (() => {
          const avatar = staffAvatar(drawerEntry.staff);
          const ChannelIcon = channelIconMap[drawerEntry.channel];
          const os = outcomeStyle[drawerEntry.outcome] || { bg: 'var(--input-bg)', text: 'var(--text-muted)' };

          return (
            <div className="space-y-5">
              {/* Staff info */}
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-extrabold"
                  style={{ background: `color-mix(in srgb, ${avatar.color} 20%, transparent)`, color: avatar.color, border: `2px solid ${avatar.color}` }}
                >
                  {avatar.initials}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{drawerEntry.staff}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Logged on {drawerEntry.date}</div>
                </div>
              </div>

              {/* Detail fields */}
              <div className="space-y-3">
                {[
                  { label: 'Channel', content: (
                    <div className="flex items-center gap-1.5">
                      <ChannelIcon className="w-3.5 h-3.5" style={{ color: channelColor[drawerEntry.channel] }} />
                      <span className="text-xs font-semibold" style={{ color: channelColor[drawerEntry.channel] }}>{drawerEntry.channel}</span>
                    </div>
                  )},
                  { label: 'Organization', content: <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{drawerEntry.org}</span> },
                  { label: 'Contact', content: <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{drawerEntry.contact}</span> },
                  { label: 'Subject', content: <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{drawerEntry.subject}</span> },
                  { label: 'Outcome', content: (
                    <span className="text-[10px] px-2 py-1 rounded-full font-bold" style={{ background: os.bg, color: os.text }}>
                      {drawerEntry.outcome}
                    </span>
                  )},
                ].map(field => (
                  <div key={field.label} className="flex items-start gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider w-20 flex-shrink-0 pt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {field.label}
                    </span>
                    <div>{field.content}</div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {drawerEntry.notes && (
                <div
                  className="p-4 rounded-xl"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Notes</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--heading)' }}>{drawerEntry.notes}</p>
                </div>
              )}
            </div>
          );
        })()}
      </SideDrawer>

      {/* ── Animations ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
