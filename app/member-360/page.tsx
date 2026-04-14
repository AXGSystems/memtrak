'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import PulsingMeter from '@/components/PulsingMeter';
import AnimatedCounter from '@/components/AnimatedCounter';
import {
  User, Building2, Mail, Phone, CalendarCheck, Clock, Star, Shield,
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, Send,
  PhoneCall, Video, Printer, X, ChevronRight, MessageCircle,
  Activity, Heart, Zap, Eye, MousePointerClick, Users, BarChart3,
} from 'lucide-react';

/* ── palette ───────────────────────────────────────────────── */
const C = {
  navy: '#002D5C',
  blue: '#4A90D9',
  green: '#8CC63F',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F5C542',
  purple: '#a855f7',
  teal: '#14b8a6',
};

/* ── member data ──────────────────────────────────────────── */
const members = [
  {
    id: 'ACU-10042',
    org: 'First American Title',
    type: 'ACU',
    typeFull: 'Associate — Corporate Underwriter',
    email: 'jsmith@firstam.com',
    joinYear: 2008,
    annualDues: 61554,
    renewalStatus: 'Current',
    renewalDate: '2026-12-31',
    engagementScore: 72,
    trustScore: 84,
    openRate: 38.2,
    clickRate: 11.4,
    eventsAttended: 6,
    responseTime: '1.4 days',
    decayScore: 75,
    churnProb: 68,
    revenueAtRisk: 61554,
    lifetimeValue: 1108000,
    paymentStatus: 'Paid — Auto-Renew',
    sparkOpen: [42, 40, 38, 35, 32, 38],
    sparkClick: [14, 12, 11, 10, 9, 11],
    sparkEvents: [2, 1, 2, 1, 0, 0],
    sparkResponse: [0.8, 1.0, 1.2, 1.4, 1.6, 1.4],
    emailTrend: [44, 42, 40, 36, 32, 38],
    touchpoints: [
      { date: '2026-04-10', type: 'Email', subject: 'ACU Underwriter Retention Check-in', staff: 'Paul Martin', status: 'Opened' },
      { date: '2026-04-07', type: 'Email', subject: 'ALTA ONE 2026 — Early Bird Registration', staff: 'System', status: 'Opened' },
      { date: '2026-03-28', type: 'Email', subject: 'State Legislation Alert — TX & FL', staff: 'System', status: 'Clicked' },
      { date: '2026-03-15', type: 'Phone', subject: 'Q1 Check-in Call', staff: 'Chris Morton (CEO)', status: 'Completed' },
      { date: '2026-02-20', type: 'Event', subject: 'ALTA ONE Planning Webinar', staff: 'Taylor Spolidoro', status: 'Attended' },
    ],
    staffRelationships: [
      { staff: 'Chris Morton (CEO)', contacts: 4, replyRate: 100, lastContact: '2026-03-15' },
      { staff: 'Paul Martin', contacts: 12, replyRate: 58, lastContact: '2026-04-10' },
      { staff: 'Taylor Spolidoro', contacts: 8, replyRate: 38, lastContact: '2026-02-20' },
    ],
    actions: [
      { label: 'Schedule CEO follow-up call — $61K account declining', priority: 'high' },
      { label: 'Send personalized ALTA ONE VIP invitation with discount code', priority: 'medium' },
      { label: 'Add to "Underwriter Re-Engagement" drip campaign', priority: 'medium' },
    ],
  },
  {
    id: 'ACB-20188',
    org: 'Heritage Abstract LLC',
    type: 'ACB',
    typeFull: 'Associate — Corporate Business',
    email: 'info@heritageabstract.com',
    joinYear: 2019,
    annualDues: 517,
    renewalStatus: 'At Risk',
    renewalDate: '2026-06-30',
    engagementScore: 8,
    trustScore: 22,
    openRate: 0,
    clickRate: 0,
    eventsAttended: 0,
    responseTime: 'N/A',
    decayScore: 100,
    churnProb: 92,
    revenueAtRisk: 517,
    lifetimeValue: 3619,
    paymentStatus: 'Late — 30 days overdue',
    sparkOpen: [15, 10, 5, 2, 0, 0],
    sparkClick: [3, 2, 1, 0, 0, 0],
    sparkEvents: [0, 0, 0, 0, 0, 0],
    sparkResponse: [4, 5, 0, 0, 0, 0],
    emailTrend: [18, 12, 8, 3, 0, 0],
    touchpoints: [
      { date: '2026-01-15', type: 'Email', subject: 'Membership Renewal Reminder', staff: 'System', status: 'Not Opened' },
      { date: '2025-12-01', type: 'Email', subject: 'Year-End Survey', staff: 'System', status: 'Not Opened' },
      { date: '2025-11-10', type: 'Email', subject: 'PFL Compliance Update', staff: 'System', status: 'Not Opened' },
      { date: '2025-10-05', type: 'Phone', subject: 'Outreach Attempt', staff: 'Caroline Ehrenfeld', status: 'No Answer' },
      { date: '2025-09-15', type: 'Email', subject: 'ALTA ONE Registration', staff: 'System', status: 'Opened' },
    ],
    staffRelationships: [
      { staff: 'Caroline Ehrenfeld', contacts: 3, replyRate: 0, lastContact: '2025-10-05' },
      { staff: 'Emily Mincey', contacts: 2, replyRate: 0, lastContact: '2025-08-12' },
    ],
    actions: [
      { label: 'URGENT: Immediate phone outreach — member gone dark 90+ days', priority: 'high' },
      { label: 'Escalate to membership committee for personal intervention', priority: 'high' },
      { label: 'Send physical mail — certified letter with renewal form', priority: 'medium' },
    ],
  },
  {
    id: 'ACA-30255',
    org: 'Liberty Title Group',
    type: 'ACA',
    typeFull: 'Associate — Corporate Agent',
    email: 'swilliams@libertytitle.com',
    joinYear: 2015,
    annualDues: 1216,
    renewalStatus: 'Current',
    renewalDate: '2026-12-31',
    engagementScore: 64,
    trustScore: 71,
    openRate: 45.1,
    clickRate: 14.8,
    eventsAttended: 3,
    responseTime: '2.2 days',
    decayScore: 41,
    churnProb: 35,
    revenueAtRisk: 1216,
    lifetimeValue: 13376,
    paymentStatus: 'Paid — Invoice',
    sparkOpen: [40, 42, 44, 46, 45, 45],
    sparkClick: [12, 13, 14, 15, 15, 15],
    sparkEvents: [1, 0, 1, 1, 0, 0],
    sparkResponse: [2.5, 2.4, 2.3, 2.2, 2.2, 2.2],
    emailTrend: [38, 40, 42, 44, 46, 45],
    touchpoints: [
      { date: '2026-04-09', type: 'Email', subject: 'PFL Compliance Notice — April Wave 3', staff: 'System', status: 'Clicked' },
      { date: '2026-04-07', type: 'Email', subject: 'ALTA ONE 2026 Early Bird', staff: 'System', status: 'Opened' },
      { date: '2026-03-25', type: 'Email', subject: 'TIPAC Q2 Pledge Drive', staff: 'System', status: 'Opened' },
      { date: '2026-03-15', type: 'Event', subject: 'EDge Program — Spring Cohort', staff: 'Taylor Spolidoro', status: 'Registered' },
      { date: '2026-02-28', type: 'Phone', subject: 'Upgrade Discussion', staff: 'Paul Martin', status: 'Interested' },
    ],
    staffRelationships: [
      { staff: 'Paul Martin', contacts: 6, replyRate: 67, lastContact: '2026-02-28' },
      { staff: 'Taylor Spolidoro', contacts: 4, replyRate: 50, lastContact: '2026-03-15' },
      { staff: 'Emily Mincey', contacts: 3, replyRate: 33, lastContact: '2026-01-10' },
    ],
    actions: [
      { label: 'Follow up on upgrade interest from Feb call — warm lead', priority: 'medium' },
      { label: 'Invite to ALTA ONE with EDge track recommendation', priority: 'low' },
      { label: 'Add to advocacy outreach for state legislation alerts', priority: 'low' },
    ],
  },
];

/* ── touchpoint icon helper ───────────────────────────────── */
function touchpointIcon(type: string) {
  switch (type) {
    case 'Email': return Mail;
    case 'Phone': return PhoneCall;
    case 'Event': return CalendarCheck;
    default: return MessageCircle;
  }
}

function statusColor(status: string) {
  if (['Opened', 'Clicked', 'Completed', 'Attended', 'Registered', 'Interested'].includes(status)) return C.green;
  if (['Not Opened', 'No Answer'].includes(status)) return C.red;
  return C.amber;
}

export default function Member360() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [actionModal, setActionModal] = useState<string | null>(null);
  const m = members[selectedIdx];

  const renewalColor = m.renewalStatus === 'Current' ? C.green : m.renewalStatus === 'At Risk' ? C.red : C.amber;
  const paymentColor = m.paymentStatus.startsWith('Paid') ? C.green : C.red;
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
            <User className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>Member360&#8482;</h1>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Every member, one complete picture.</p>
      </div>

      {/* ── Member Selector ──────────────────────────────────── */}
      <div className="rounded-xl border p-4" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <label className="text-[9px] uppercase tracking-wider font-bold block mb-2" style={{ color: 'var(--text-muted)' }}>Select Member</label>
        <select
          value={selectedIdx}
          onChange={e => setSelectedIdx(Number(e.target.value))}
          className="w-full rounded-lg border px-3 py-2 text-sm font-semibold"
          style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', color: 'var(--heading)' }}
        >
          {members.map((mem, i) => (
            <option key={mem.id} value={i}>
              {mem.org} — {mem.type} — ${mem.annualDues.toLocaleString()}/yr
            </option>
          ))}
        </select>
      </div>

      {/* ── Header Card ──────────────────────────────────────── */}
      <div className="rounded-xl border p-5" style={{
        background: 'var(--card)', borderColor: 'var(--card-border)',
        borderLeftWidth: '4px', borderLeftColor: 'var(--accent)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <h2 className="text-base font-extrabold truncate" style={{ color: 'var(--heading)' }}>{m.org}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                {m.type}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.typeFull}</span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>|</span>
              <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>ID: {m.id}</span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>|</span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Member since {m.joinYear}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${renewalColor} 15%, transparent)`, color: renewalColor }}>
                <Shield className="w-3 h-3" /> {m.renewalStatus}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Renews {m.renewalDate}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Annual Dues</div>
            <AnimatedCounter value={m.annualDues} prefix="$" className="text-3xl" color="var(--heading)" />
          </div>
        </div>
      </div>

      {/* ── Engagement + Trust Meters ────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Engagement Score" subtitle="Overall member engagement 0-100">
          <div className="flex justify-center py-2">
            <PulsingMeter
              value={m.engagementScore}
              label="Engagement"
              color={m.engagementScore >= 70 ? C.green : m.engagementScore >= 40 ? C.amber : C.red}
              size="lg"
            />
          </div>
        </Card>
        <Card title="Trust Score" subtitle="Relationship trust index">
          <div className="flex justify-center py-2">
            <ProgressRing value={m.trustScore} max={100} color={m.trustScore >= 70 ? C.green : m.trustScore >= 40 ? C.amber : C.red} size={140} />
          </div>
          <div className="text-center mt-2">
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
              {m.trustScore >= 80 ? 'Champion' : m.trustScore >= 60 ? 'Trusted' : m.trustScore >= 40 ? 'Neutral' : 'Eroding'}
            </span>
          </div>
        </Card>
      </div>

      {/* ── 4 SparkKpi Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SparkKpi
          label="Open Rate"
          value={`${m.openRate}%`}
          icon={Eye}
          color={m.openRate >= 40 ? C.green : m.openRate >= 20 ? C.amber : C.red}
          sparkData={m.sparkOpen}
          sparkColor={m.openRate >= 40 ? C.green : m.openRate >= 20 ? C.amber : C.red}
          trend={{ value: +(m.sparkOpen[5] - m.sparkOpen[4]).toFixed(1), label: 'vs last month' }}
          sub="6-month average"
          accent
        />
        <SparkKpi
          label="Click Rate"
          value={`${m.clickRate}%`}
          icon={MousePointerClick}
          color={C.blue}
          sparkData={m.sparkClick}
          sparkColor={C.blue}
          trend={{ value: +(m.sparkClick[5] - m.sparkClick[4]).toFixed(1), label: 'vs last month' }}
          sub="Unique clicks / delivered"
          accent
        />
        <SparkKpi
          label="Events Attended"
          value={m.eventsAttended}
          icon={CalendarCheck}
          color={C.purple}
          sparkData={m.sparkEvents}
          sparkColor={C.purple}
          trend={{ value: m.sparkEvents[5] - m.sparkEvents[4], label: 'vs last month' }}
          sub="2026 YTD"
          accent
        />
        <SparkKpi
          label="Response Time"
          value={m.responseTime}
          icon={Clock}
          color={C.teal}
          sparkData={m.sparkResponse}
          sparkColor={C.teal}
          trend={{ value: m.responseTime === 'N/A' ? 0 : -((m.sparkResponse[5] - m.sparkResponse[4]) * 10), label: 'vs last month' }}
          sub="Avg reply time"
          accent
        />
      </div>

      {/* ── Communication Timeline ───────────────────────────── */}
      <Card title="Communication Timeline" subtitle="Last 5 touchpoints">
        <div className="space-y-3">
          {m.touchpoints.map((tp, i) => {
            const Icon = touchpointIcon(tp.type);
            const sColor = statusColor(tp.status);
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                <div className="p-1.5 rounded-lg flex-shrink-0 mt-0.5" style={{ background: `color-mix(in srgb, ${C.blue} 15%, transparent)` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: C.blue }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold truncate" style={{ color: 'var(--heading)' }}>{tp.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{tp.date}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>|</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{tp.staff}</span>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: `color-mix(in srgb, ${sColor} 15%, transparent)`, color: sColor }}>
                  {tp.status}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Email Engagement Chart ───────────────────────────── */}
      <Card title="Email Engagement Trend" subtitle="6-month open rate trajectory">
        <ClientChart
          type="line"
          height={220}
          data={{
            labels: months,
            datasets: [{
              label: 'Open Rate %',
              data: m.emailTrend,
              borderColor: C.blue,
              backgroundColor: 'rgba(74,144,217,0.1)',
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: C.blue,
              pointBorderColor: 'var(--card)',
              pointBorderWidth: 2,
            }],
          }}
          options={{
            plugins: { legend: { display: false } },
            scales: {
              y: { min: 0, max: 60, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => v + '%' } },
              x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } },
            },
          }}
        />
      </Card>

      {/* ── Risk Assessment ──────────────────────────────────── */}
      <Card title="Risk Assessment" subtitle="Churn probability and revenue impact" accent={m.churnProb >= 60 ? C.red : m.churnProb >= 30 ? C.amber : C.green}>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl" style={{ background: 'var(--background)' }}>
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Decay Score</div>
            <div className="text-2xl font-extrabold" style={{ color: m.decayScore >= 70 ? C.red : m.decayScore >= 40 ? C.amber : C.green }}>
              {m.decayScore}
            </div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>of 100</div>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: 'var(--background)' }}>
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Churn Probability</div>
            <div className="text-2xl font-extrabold" style={{ color: m.churnProb >= 60 ? C.red : m.churnProb >= 30 ? C.amber : C.green }}>
              {m.churnProb}%
            </div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>likelihood</div>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: 'var(--background)' }}>
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Revenue at Risk</div>
            <div className="text-2xl font-extrabold" style={{ color: C.red }}>
              ${m.revenueAtRisk.toLocaleString()}
            </div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>annual dues</div>
          </div>
        </div>
      </Card>

      {/* ── Staff Relationships ──────────────────────────────── */}
      <Card title="Staff Relationships" subtitle="Who has contacted this member and reply rates">
        <div className="space-y-2">
          {m.staffRelationships.map((sr, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <div className="p-1.5 rounded-full flex-shrink-0" style={{ background: `color-mix(in srgb, ${C.purple} 15%, transparent)` }}>
                <Users className="w-3 h-3" style={{ color: C.purple }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{sr.staff}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Last: {sr.lastContact}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-extrabold" style={{ color: sr.replyRate >= 50 ? C.green : sr.replyRate >= 20 ? C.amber : C.red }}>
                  {sr.replyRate}% reply
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{sr.contacts} contacts</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Recommended Actions ──────────────────────────────── */}
      <Card title="Recommended Actions" subtitle="AI-generated next steps" accent="var(--accent)">
        <div className="space-y-2">
          {m.actions.map((act, i) => {
            const priorityColor = act.priority === 'high' ? C.red : act.priority === 'medium' ? C.amber : C.green;
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--background)', borderLeft: `3px solid ${priorityColor}` }}>
                <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: priorityColor }} />
                <span className="text-xs flex-1" style={{ color: 'var(--heading)' }}>{act.label}</span>
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: `color-mix(in srgb, ${priorityColor} 15%, transparent)`, color: priorityColor }}>
                  {act.priority}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Financial Summary ────────────────────────────────── */}
      <Card title="Financial Summary" subtitle="Dues, lifetime value, and payment status">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl" style={{ background: 'var(--background)' }}>
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Annual Dues</div>
            <AnimatedCounter value={m.annualDues} prefix="$" className="text-xl" color="var(--heading)" />
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: 'var(--background)' }}>
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Lifetime Value</div>
            <AnimatedCounter value={m.lifetimeValue} prefix="$" className="text-xl" color={C.green} />
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: 'var(--background)' }}>
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Payment Status</div>
            <div className="text-xs font-bold mt-1" style={{ color: paymentColor }}>{m.paymentStatus}</div>
          </div>
        </div>
      </Card>

      {/* ── Quick Actions ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Send Email', icon: Send, color: C.blue },
          { label: 'Log Call', icon: PhoneCall, color: C.green },
          { label: 'Schedule Meeting', icon: Video, color: C.purple },
          { label: 'Print Profile', icon: Printer, color: C.navy },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => setActionModal(btn.label)}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all duration-200 hover:translate-y-[-2px]"
            style={{
              background: `color-mix(in srgb, ${btn.color} 10%, var(--card))`,
              borderColor: `color-mix(in srgb, ${btn.color} 30%, var(--card-border))`,
              color: btn.color,
            }}
          >
            <btn.icon className="w-4 h-4" />
            {btn.label}
          </button>
        ))}
      </div>

      {/* ── Action Modal ─────────────────────────────────────── */}
      {actionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setActionModal(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border p-6"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{actionModal}</h3>
              <button onClick={() => setActionModal(null)} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Member</div>
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{m.org}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.email}</div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'color-mix(in srgb, var(--accent) 8%, transparent)' }}>
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    This action would be executed in the production MEMTrak system. Demo mode — no action taken.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActionModal(null)}
                className="w-full py-2.5 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                style={{ background: 'var(--accent)', color: 'var(--card)' }}
              >
                Close Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
