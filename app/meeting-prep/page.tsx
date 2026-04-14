'use client';

import { useState, useRef } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import { MiniBar } from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  Briefcase, Search, Users, DollarSign, AlertTriangle, MessageSquare,
  TrendingUp, Star, Phone, Mail, Calendar, Shield, CheckCircle2,
  Printer, Play, Clock, ChevronRight, Heart, Zap,
} from 'lucide-react';

/* ── colors ────────────────────────────────────────────────────────── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  purple: '#7C5CFC',
  teal: '#14B8A6',
};

/* ── types ─────────────────────────────────────────────────────────── */
interface MemberBriefing {
  name: string;
  type: string;
  dues: number;
  joinDate: string;
  status: string;
  lifetimeValue: number;
  engagement: {
    recentOpens: number;
    recentClicks: number;
    eventsAttended: number;
    openRate: number;
    clickRate: number;
    sparkData: number[];
  };
  commsHistory: { date: string; channel: string; subject: string; outcome: string; staff: string }[];
  churnRisk: { score: number; factors: string[] };
  renewalStatus: string;
  renewalDate: string;
  talkingPoints: string[];
  staffRelationship: { name: string; strength: string; lastContact: string };
  revenueContext: { annual: number; lifetime: number };
}

/* ── demo briefings ────────────────────────────────────────────────── */
const BRIEFINGS: Record<string, MemberBriefing> = {
  'First American Title': {
    name: 'First American Title',
    type: 'ACU — Underwriter',
    dues: 61554,
    joinDate: '1998-03-15',
    status: 'Active',
    lifetimeValue: 1723512,
    engagement: {
      recentOpens: 4, recentClicks: 1, eventsAttended: 2,
      openRate: 25, clickRate: 5,
      sparkData: [80, 72, 60, 45, 30, 25, 20],
    },
    commsHistory: [
      { date: '2026-04-13', channel: 'Phone', subject: 'Renewal Status Check', outcome: 'Left voicemail', staff: 'Chris Morton' },
      { date: '2026-04-09', channel: 'Email', subject: 'PFL Compliance Notice Wave 3', outcome: 'Opened, no click', staff: 'System' },
      { date: '2026-04-07', channel: 'Email', subject: 'ALTA ONE Early Bird', outcome: 'Opened, clicked register', staff: 'System' },
      { date: '2026-03-25', channel: 'Email', subject: 'TIPAC Q2 Pledge Drive', outcome: 'Not opened', staff: 'System' },
      { date: '2026-03-10', channel: 'Meeting', subject: 'Annual Strategy Review', outcome: 'Positive — exploring new programs', staff: 'Chris Morton' },
    ],
    churnRisk: { score: 68, factors: ['Email engagement declining 75%', 'Skipped 2026 Summit', 'Still attending webinars (positive)', '$61K account at risk'] },
    renewalStatus: 'Due Apr 30',
    renewalDate: '2026-04-30',
    talkingPoints: [
      'Acknowledge their 28-year membership legacy — founding-era partner',
      'Ask about declining email opens directly — is it inbox fatigue or content mismatch?',
      'Highlight ALTA ONE 2026 early bird they clicked — close the registration',
      'CEO-level conversation warranted given $61K annual dues',
    ],
    staffRelationship: { name: 'Chris Morton (CEO)', strength: 'Strong', lastContact: 'Mar 10, 2026' },
    revenueContext: { annual: 61554, lifetime: 1723512 },
  },
  'Heritage Abstract LLC': {
    name: 'Heritage Abstract LLC',
    type: 'ACB — Abstract',
    dues: 517,
    joinDate: '2019-07-22',
    status: 'At Risk',
    lifetimeValue: 3619,
    engagement: {
      recentOpens: 0, recentClicks: 0, eventsAttended: 0,
      openRate: 0, clickRate: 0,
      sparkData: [60, 50, 35, 20, 10, 5, 0],
    },
    commsHistory: [
      { date: '2026-04-12', channel: 'Email', subject: 'PFL Compliance Notice', outcome: 'Bounced — invalid address', staff: 'System' },
      { date: '2026-03-15', channel: 'Email', subject: 'EDge Spring Cohort Invite', outcome: 'Not opened', staff: 'System' },
      { date: '2026-02-10', channel: 'Email', subject: 'Renewal Reminder', outcome: 'Not opened', staff: 'System' },
      { date: '2025-12-01', channel: 'Email', subject: 'Year-End Wrap-Up', outcome: 'Opened, no click', staff: 'System' },
      { date: '2025-10-15', channel: 'Phone', subject: 'Check-in Call', outcome: 'No answer', staff: 'Taylor Spolidoro' },
    ],
    churnRisk: { score: 92, factors: ['Zero engagement for 90+ days', 'No events attended in 2026', 'Late on dues payment', 'Email address bouncing — may have left org'] },
    renewalStatus: 'Overdue',
    renewalDate: '2026-03-01',
    talkingPoints: [
      'Priority #1: Verify contact info — email is bouncing, may need new POC',
      'Consider direct phone outreach — all digital channels have gone dark',
      'Low-dollar account ($517) but principle matters for retention metrics',
      'Last positive engagement was Dec 2025 — 4+ month gap is critical',
    ],
    staffRelationship: { name: 'Taylor Spolidoro', strength: 'Weak', lastContact: 'Oct 15, 2025' },
    revenueContext: { annual: 517, lifetime: 3619 },
  },
  'Liberty Title Group': {
    name: 'Liberty Title Group',
    type: 'ACA — Title Agent',
    dues: 1216,
    joinDate: '2015-01-10',
    status: 'Active',
    lifetimeValue: 14592,
    engagement: {
      recentOpens: 8, recentClicks: 4, eventsAttended: 3,
      openRate: 58, clickRate: 22,
      sparkData: [85, 82, 78, 72, 65, 55, 50],
    },
    commsHistory: [
      { date: '2026-04-11', channel: 'Meeting', subject: 'Membership Value Review', outcome: 'Meeting scheduled — considering multi-office upgrade', staff: 'Chris Morton' },
      { date: '2026-04-09', channel: 'Email', subject: 'PFL Compliance Notice Wave 3', outcome: 'Opened, clicked compliance link', staff: 'System' },
      { date: '2026-04-07', channel: 'Email', subject: 'ALTA ONE Early Bird', outcome: 'Opened, clicked Register Now', staff: 'System' },
      { date: '2026-03-28', channel: 'Email', subject: 'State Legislation Alert — TX & FL', outcome: 'Opened, forwarded internally', staff: 'System' },
      { date: '2026-03-20', channel: 'Phone', subject: 'Welcome back check-in', outcome: 'Great call — excited about EDge program', staff: 'Caroline Ehrenfeld' },
    ],
    churnRisk: { score: 35, factors: ['Slight engagement decline (normal seasonality)', 'Considering multi-office upgrade (positive signal)', 'Active in events and legislation tracking', 'Low churn risk overall'] },
    renewalStatus: 'Paid through Dec 2026',
    renewalDate: '2026-12-31',
    talkingPoints: [
      'Follow up on multi-office upgrade discussion from Apr 11 meeting',
      'They forwarded the legislation alert internally — clearly finding value in advocacy content',
      'Great candidate for ALTA ONE 2026 — already clicked Early Bird registration link',
      'Explore EDge program enrollment — Sarah expressed interest on Mar 20 call',
    ],
    staffRelationship: { name: 'Chris Morton (CEO)', strength: 'Strong', lastContact: 'Apr 11, 2026' },
    revenueContext: { annual: 1216, lifetime: 14592 },
  },
};

const MEMBER_OPTIONS = Object.keys(BRIEFINGS);

/* ── helpers ────────────────────────────────────────────────────────── */
function churnColor(score: number): string {
  if (score >= 70) return C.red;
  if (score >= 40) return C.orange;
  return C.green;
}

function channelIcon(ch: string) {
  if (ch === 'Phone') return Phone;
  if (ch === 'Meeting') return Users;
  if (ch === 'Email') return Mail;
  return Calendar;
}

/* ── page ──────────────────────────────────────────────────────────── */
export default function MeetingPrepPage() {
  const [selectedMember, setSelectedMember] = useState('');
  const [briefing, setBriefing] = useState<MemberBriefing | null>(null);
  const [prepsToday, setPrepsToday] = useState(3);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  function selectMember(name: string) {
    setSelectedMember(name);
    setSearchQuery(name);
    const b = BRIEFINGS[name];
    if (b) {
      setBriefing(b);
      setPrepsToday(prev => prev + 1);
      setMeetingStarted(false);
    }
  }

  function handleStartMeeting() {
    setMeetingStarted(true);
  }

  function handlePrint() {
    if (!printRef.current || !briefing) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Meeting Prep: ${briefing.name}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        h2 { font-size: 14px; color: #666; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .kv { margin: 4px 0; font-size: 12px; }
        .kv strong { color: #333; }
        .risk { padding: 8px; border: 1px solid #ddd; border-radius: 6px; margin: 6px 0; }
        .tp { padding: 4px 0; font-size: 12px; border-bottom: 1px solid #f0f0f0; }
        .history { font-size: 11px; margin: 3px 0; }
        @media print { body { padding: 20px; } }
      </style></head><body>
        <h1>${briefing.name} — Meeting Prep</h1>
        <p style="font-size:11px;color:#888;">Generated ${new Date().toLocaleDateString()} | MEMTrak</p>
        <div class="grid">
          <div><h2>Overview</h2>
            <div class="kv"><strong>Type:</strong> ${briefing.type}</div>
            <div class="kv"><strong>Annual Dues:</strong> $${briefing.dues.toLocaleString()}</div>
            <div class="kv"><strong>Member Since:</strong> ${briefing.joinDate}</div>
            <div class="kv"><strong>Status:</strong> ${briefing.status}</div>
            <div class="kv"><strong>Renewal:</strong> ${briefing.renewalStatus}</div>
          </div>
          <div><h2>Revenue</h2>
            <div class="kv"><strong>Annual Value:</strong> $${briefing.revenueContext.annual.toLocaleString()}</div>
            <div class="kv"><strong>Lifetime Value:</strong> $${briefing.revenueContext.lifetime.toLocaleString()}</div>
            <div class="kv"><strong>Churn Risk:</strong> ${briefing.churnRisk.score}/100</div>
            <div class="kv"><strong>Best Contact:</strong> ${briefing.staffRelationship.name}</div>
          </div>
        </div>
        <h2>Talking Points</h2>
        ${briefing.talkingPoints.map(tp => `<div class="tp">${tp}</div>`).join('')}
        <h2>Churn Factors</h2>
        ${briefing.churnRisk.factors.map(f => `<div class="tp">${f}</div>`).join('')}
        <h2>Recent Communication</h2>
        ${briefing.commsHistory.map(c => `<div class="history">${c.date} | ${c.channel} | ${c.subject} | ${c.outcome}</div>`).join('')}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  const filteredOptions = searchQuery.length > 0
    ? MEMBER_OPTIONS.filter(o => o.toLowerCase().includes(searchQuery.toLowerCase()))
    : MEMBER_OPTIONS;

  const [showSuggestions, setShowSuggestions] = useState(false);

  /* engagement chart data */
  const engagementChartData = briefing ? {
    labels: ['6mo ago', '5mo', '4mo', '3mo', '2mo', '1mo', 'Now'],
    datasets: [{
      label: 'Engagement Score',
      data: briefing.engagement.sparkData,
      borderColor: churnColor(briefing.churnRisk.score),
      backgroundColor: `${churnColor(briefing.churnRisk.score)}20`,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: churnColor(briefing.churnRisk.score),
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  } : null;

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7C5CFC, #4A90D9)', boxShadow: '0 4px 16px rgba(124,92,252,0.3)' }}
          >
            <Briefcase className="w-5 h-5" style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              Meeting Prep
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.purple }}>
              AI-powered briefing before calling or meeting a member
            </p>
          </div>
        </div>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger-children">
        <SparkKpi
          label="Preps Generated Today"
          value={prepsToday}
          icon={Briefcase}
          color={C.purple}
          sub="Briefings created"
          sparkData={[1, 2, 3, 2, 4, 3, prepsToday]}
          sparkColor={C.purple}
          accent
        />
        <SparkKpi
          label="Members Briefed"
          value={Object.keys(BRIEFINGS).length}
          icon={Users}
          color={C.blue}
          sub="In demo database"
          sparkData={[1, 1, 2, 2, 3, 3, 3]}
          sparkColor={C.blue}
          accent
        />
        <SparkKpi
          label="Avg Prep Time"
          value="1.2s"
          icon={Clock}
          color={C.green}
          sub="Instant AI generation"
          sparkData={[3.2, 2.8, 2.1, 1.8, 1.5, 1.3, 1.2]}
          sparkColor={C.green}
          trend={{ value: -25, label: 'faster this week' }}
          accent
        />
        <SparkKpi
          label="Success Rate"
          value="87%"
          icon={Star}
          color={C.orange}
          sub="Preps leading to meetings"
          sparkData={[72, 78, 80, 82, 85, 86, 87]}
          sparkColor={C.orange}
          trend={{ value: 5.4, label: 'vs last month' }}
          accent
        />
      </div>

      {/* ── Member Selector ─────────────────────────────────────────── */}
      <Card title="Select Member" subtitle="Search or choose a member organization to generate a briefing" accent={C.purple} className="mb-6">
        <div className="relative max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Type member organization name..."
              className="w-full pl-9 pr-4 py-3 text-xs rounded-xl focus:outline-none"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--heading)',
              }}
            />
          </div>
          {showSuggestions && filteredOptions.length > 0 && (
            <div
              className="absolute z-20 left-0 right-0 mt-1 rounded-xl border overflow-hidden"
              style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
            >
              {filteredOptions.map(org => (
                <button
                  key={org}
                  type="button"
                  className="w-full text-left px-4 py-3 text-xs transition-colors flex items-center gap-3"
                  style={{ color: 'var(--heading)' }}
                  onMouseDown={() => selectMember(org)}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-extrabold flex-shrink-0"
                    style={{
                      background: `color-mix(in srgb, ${C.purple} 15%, transparent)`,
                      color: C.purple,
                    }}
                  >
                    {org.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-xs" style={{ color: 'var(--heading)' }}>{org}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{BRIEFINGS[org].type}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* ── Briefing Content ────────────────────────────────────────── */}
      {briefing && (
        <div ref={printRef}>
          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--card-border)',
                color: 'var(--heading)',
              }}
            >
              <Printer className="w-4 h-4" />
              Print Prep Sheet
            </button>
            <button
              onClick={handleStartMeeting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: meetingStarted ? 'rgba(140,198,63,0.15)' : 'linear-gradient(135deg, #7C5CFC, #4A90D9)',
                color: meetingStarted ? C.green : '#fff',
                boxShadow: meetingStarted ? 'none' : '0 4px 16px rgba(124,92,252,0.35)',
                border: meetingStarted ? `1px solid ${C.green}` : 'none',
              }}
            >
              {meetingStarted ? <CheckCircle2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {meetingStarted ? 'Meeting Logged' : 'Start Meeting'}
            </button>
            {meetingStarted && (
              <span className="text-xs font-bold animate-pulse" style={{ color: C.green }}>
                Outreach logged to engagement tracker
              </span>
            )}
          </div>

          {/* Overview + Revenue Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Member Overview */}
            <Card title="Member Overview" subtitle={briefing.name} accent={C.blue}>
              <div className="space-y-3">
                {[
                  { label: 'Type', value: briefing.type },
                  { label: 'Annual Dues', value: `$${briefing.dues.toLocaleString()}` },
                  { label: 'Member Since', value: new Date(briefing.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
                  { label: 'Status', value: briefing.status },
                  { label: 'Renewal', value: briefing.renewalStatus },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-lg"
                      style={{
                        color: row.label === 'Status' && briefing.status === 'At Risk' ? C.red : 'var(--heading)',
                        background: row.label === 'Status' && briefing.status === 'At Risk' ? 'rgba(217,74,74,0.1)' : 'transparent',
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Revenue Context */}
            <Card title="Revenue Context" subtitle="Financial relationship overview" accent={C.green}>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Annual Dues</span>
                    <span className="text-lg font-extrabold" style={{ color: C.green }}>${briefing.revenueContext.annual.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Lifetime Value</span>
                    <span className="text-lg font-extrabold" style={{ color: C.blue }}>${briefing.revenueContext.lifetime.toLocaleString()}</span>
                  </div>
                </div>
                <div
                  className="p-3 rounded-xl"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-3.5 h-3.5" style={{ color: C.purple }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Staff Relationship</span>
                  </div>
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{briefing.staffRelationship.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{
                        background: briefing.staffRelationship.strength === 'Strong' ? 'rgba(140,198,63,0.15)' : briefing.staffRelationship.strength === 'Weak' ? 'rgba(217,74,74,0.15)' : 'rgba(232,146,63,0.15)',
                        color: briefing.staffRelationship.strength === 'Strong' ? C.green : briefing.staffRelationship.strength === 'Weak' ? C.red : C.orange,
                      }}
                    >
                      {briefing.staffRelationship.strength}
                    </span>
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Last: {briefing.staffRelationship.lastContact}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Engagement + Churn Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Engagement Summary */}
            <Card title="Engagement Summary" subtitle="Recent activity and trends" accent={C.teal}>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Recent Opens', value: briefing.engagement.recentOpens, color: C.blue },
                  { label: 'Recent Clicks', value: briefing.engagement.recentClicks, color: C.teal },
                  { label: 'Events', value: briefing.engagement.eventsAttended, color: C.purple },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="text-center p-3 rounded-xl"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
                  >
                    <div className="text-xl font-extrabold" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Open Rate</span>
                    <span className="text-[10px] font-bold" style={{ color: briefing.engagement.openRate < 30 ? C.red : C.green }}>{briefing.engagement.openRate}%</span>
                  </div>
                  <MiniBar value={briefing.engagement.openRate} color={briefing.engagement.openRate < 30 ? C.red : C.green} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Click Rate</span>
                    <span className="text-[10px] font-bold" style={{ color: briefing.engagement.clickRate < 10 ? C.orange : C.green }}>{briefing.engagement.clickRate}%</span>
                  </div>
                  <MiniBar value={briefing.engagement.clickRate} color={briefing.engagement.clickRate < 10 ? C.orange : C.green} />
                </div>
              </div>
            </Card>

            {/* Churn Risk */}
            <Card title="Churn Risk Assessment" subtitle="AI-generated risk evaluation" accent={churnColor(briefing.churnRisk.score)}>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(${churnColor(briefing.churnRisk.score)} ${briefing.churnRisk.score * 3.6}deg, var(--input-bg) 0deg)`,
                    boxShadow: `0 0 20px ${churnColor(briefing.churnRisk.score)}30`,
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--card)' }}
                  >
                    <span className="text-xl font-extrabold" style={{ color: churnColor(briefing.churnRisk.score) }}>
                      {briefing.churnRisk.score}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold mb-1" style={{ color: 'var(--heading)' }}>
                    {briefing.churnRisk.score >= 70 ? 'HIGH RISK' : briefing.churnRisk.score >= 40 ? 'MODERATE RISK' : 'LOW RISK'}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {briefing.churnRisk.score >= 70 ? 'Immediate intervention recommended' : briefing.churnRisk.score >= 40 ? 'Monitor closely, proactive outreach advised' : 'Healthy engagement, continue nurturing'}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                {briefing.churnRisk.factors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-2 py-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: churnColor(briefing.churnRisk.score) }} />
                    <span className="text-[10px] leading-relaxed" style={{ color: 'var(--heading)' }}>{factor}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Engagement Trend Chart */}
          {engagementChartData && (
            <Card title="Engagement Trend" subtitle="6-month engagement score trajectory" className="mb-6">
              <ClientChart
                type="line"
                height={220}
                data={engagementChartData}
                options={{
                  scales: {
                    y: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa' }, min: 0, max: 100, title: { display: true, text: 'Score', color: '#8899aa', font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { color: '#8899aa' } },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </Card>
          )}

          {/* Communication History + Talking Points Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Communication History */}
            <Card title="Communication History" subtitle="Last 5 touchpoints" accent={C.blue}>
              <div className="relative">
                <div
                  className="absolute left-[15px] top-0 bottom-0 w-px"
                  style={{ background: 'var(--card-border)' }}
                />
                <div className="space-y-1">
                  {briefing.commsHistory.map((comm, idx) => {
                    const Icon = channelIcon(comm.channel);
                    const outcomeColor = comm.outcome.includes('Bounced') ? C.red
                      : comm.outcome.includes('Not opened') ? C.orange
                      : comm.outcome.includes('Positive') || comm.outcome.includes('Opened') || comm.outcome.includes('Great') ? C.green
                      : 'var(--text-muted)';
                    return (
                      <div key={idx} className="relative flex items-start gap-3 pl-0 py-2">
                        <div
                          className="relative z-10 w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `color-mix(in srgb, ${C.blue} 15%, transparent)`,
                            border: `1.5px solid ${C.blue}`,
                          }}
                        >
                          <Icon className="w-3 h-3" style={{ color: C.blue }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{comm.subject}</span>
                          </div>
                          <div className="text-[9px] mt-0.5" style={{ color: outcomeColor }}>{comm.outcome}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{comm.date}</span>
                            <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{comm.channel}</span>
                            {comm.staff !== 'System' && <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{comm.staff}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Recommended Talking Points */}
            <Card title="Recommended Talking Points" subtitle="AI-generated conversation starters" accent={C.purple}>
              <div className="space-y-3">
                {briefing.talkingPoints.map((tp, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:translate-x-1"
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold"
                      style={{ background: `color-mix(in srgb, ${C.purple} 15%, transparent)`, color: C.purple }}
                    >
                      {idx + 1}
                    </div>
                    <p className="text-[11px] leading-relaxed pt-1" style={{ color: 'var(--heading)' }}>{tp}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── Empty State ─────────────────────────────────────────────── */}
      {!briefing && (
        <Card className="mb-6">
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--heading)' }}>Select a Member to Begin</h3>
            <p className="text-[11px] max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
              Search for a member organization above to generate an AI-powered meeting briefing with engagement history, churn risk, and recommended talking points.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              {MEMBER_OPTIONS.map(org => (
                <button
                  key={org}
                  onClick={() => selectMember(org)}
                  className="px-4 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 hover:scale-[1.03]"
                  style={{
                    background: `color-mix(in srgb, ${C.purple} 10%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${C.purple} 25%, transparent)`,
                    color: C.purple,
                  }}
                >
                  {org}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
