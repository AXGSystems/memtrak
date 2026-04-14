'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { MiniBar } from '@/components/SparkKpi';
import {
  Ghost,
  Users,
  DollarSign,
  Clock,
  RefreshCw,
  AlertTriangle,
  Mail,
  Calendar,
  MousePointerClick,
  ChevronRight,
  Eye,
  Target,
  Shield,
  TrendingDown,
  UserX,
  Inbox,
} from 'lucide-react';

const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  ghost: '#6366f1',
  slate: '#64748b',
};

/* ── Ghost Members ────────────────────────────────── */
const ghostMembers = [
  { name: 'Cornerstone Title LLC', type: 'ACA', email: 'admin@cornerstonetitle.com', lastActivity: 'Jan 12, 2026', daysSince: 92, revenue: 1216, memberSince: '2019', emailsSent: 34, status: 'Ghost' as const },
  { name: 'Pacific Title Group', type: 'ACB', email: 'contact@pacifictitle.net', lastActivity: 'Jan 28, 2026', daysSince: 76, revenue: 517, memberSince: '2021', emailsSent: 28, status: 'Ghost' as const },
  { name: 'Summit Escrow Services', type: 'ACA', email: 'info@summitescrow.com', lastActivity: 'Feb 2, 2026', daysSince: 71, revenue: 1216, memberSince: '2020', emailsSent: 26, status: 'Ghost' as const },
  { name: 'Meridian Abstract Co.', type: 'REA', email: 'jharris@meridianabstract.com', lastActivity: 'Dec 18, 2025', daysSince: 117, revenue: 441, memberSince: '2018', emailsSent: 42, status: 'Deep Ghost' as const },
  { name: 'Prairie Land Title', type: 'ACB', email: 'office@prairieland.com', lastActivity: 'Feb 8, 2026', daysSince: 65, revenue: 517, memberSince: '2022', emailsSent: 22, status: 'Ghost' as const },
  { name: 'Eastgate Title Insurance', type: 'ACU', email: 'ops@eastgatetitle.com', lastActivity: 'Nov 5, 2025', daysSince: 160, revenue: 61554, memberSince: '2016', emailsSent: 56, status: 'Deep Ghost' as const },
  { name: 'Redwood Settlement LLC', type: 'ACA', email: 'team@redwoodsettlement.com', lastActivity: 'Jan 20, 2026', daysSince: 84, revenue: 1216, memberSince: '2020', emailsSent: 30, status: 'Ghost' as const },
  { name: 'Bayview Closing Services', type: 'REA', email: 'admin@bayviewclosing.com', lastActivity: 'Feb 12, 2026', daysSince: 61, revenue: 441, memberSince: '2023', emailsSent: 18, status: 'Ghost' as const },
];

const statusConfig: Record<string, { color: string; bg: string }> = {
  'Ghost': { color: C.ghost, bg: 'rgba(99,102,241,0.12)' },
  'Deep Ghost': { color: C.red, bg: 'rgba(217,74,74,0.12)' },
};

/* ── Ghost trend per month ────────────────────────── */
const ghostTrendMonths = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
const ghostTrendData = [12, 15, 19, 24, 28, 32, 38];
const recoveredData = [3, 4, 2, 5, 3, 4, 6];

/* ── Recovery recommendations ─────────────────────── */
const recoveryStrategies = [
  {
    name: 'Personal Outreach',
    desc: 'Direct phone call or personalized email from membership team. Most effective for high-value members (ACU/ACA).',
    successRate: '34%',
    color: C.green,
    icon: Mail,
    best: 'High-revenue members',
  },
  {
    name: 'Re-engagement Campaign',
    desc: 'Automated 3-email series highlighting recent value: new resources, upcoming events, member success stories.',
    successRate: '18%',
    color: C.blue,
    icon: RefreshCw,
    best: 'Medium-tier members',
  },
  {
    name: 'Event Invitation',
    desc: 'Complimentary pass to upcoming webinar or regional event. Social reconnection often reactivates engagement.',
    successRate: '22%',
    color: C.purple,
    icon: Calendar,
    best: 'Previously active members',
  },
  {
    name: 'Value Survey',
    desc: 'Short survey asking what they want from membership. Shows you care, and responses guide retention strategy.',
    successRate: '12%',
    color: C.orange,
    icon: Target,
    best: 'Newer members (<2yr)',
  },
];

/* ── Revenue at risk by member type ───────────────── */
const revenueByType = [
  { type: 'ACU (Underwriters)', revenue: 61554, count: 1, color: C.red },
  { type: 'ACA (Title Agents)', revenue: 4864, count: 4, color: C.orange },
  { type: 'ACB (Abstractors)', revenue: 1034, count: 2, color: C.amber },
  { type: 'REA (Attorneys)', revenue: 882, count: 2, color: C.blue },
];

export default function GhostWatch() {
  const [expandedGhost, setExpandedGhost] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'days' | 'revenue'>('revenue');

  const totalGhosts = ghostMembers.length;
  const totalRevenue = ghostMembers.reduce((s, m) => s + m.revenue, 0);
  const avgDays = Math.round(ghostMembers.reduce((s, m) => s + m.daysSince, 0) / totalGhosts);
  const recoveryRate = 21.4;

  const sorted = [...ghostMembers].sort((a, b) =>
    sortBy === 'revenue' ? b.revenue - a.revenue : b.daysSince - a.daysSince
  );

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(100,116,139,0.2) 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            <Ghost className="w-5 h-5" style={{ color: C.ghost }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              GhostWatch<span style={{ color: C.ghost, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.ghost }}>
              Find the members who left without saying goodbye.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Identifies members who have silently disengaged &mdash; they remain subscribed but have zero engagement
          for 60+ days. Unlike DecayRadar (which tracks declining engagement), GhostWatch finds members who have
          completely vanished. They never unsubscribed, they never bounced &mdash; they just stopped opening everything.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Ghost Members"
          value={totalGhosts}
          sub="Zero engagement 60+ days"
          icon={Ghost}
          color={C.ghost}
          sparkData={[12, 15, 19, 24, 28, 32, 38]}
          sparkColor={C.ghost}
          trend={{ value: 18.8, label: 'growing this quarter' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--heading)' }}>{totalGhosts} members</strong> have had zero email
                engagement (no opens, no clicks) for 60 or more consecutive days while remaining subscribed.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-lg font-extrabold" style={{ color: C.ghost }}>6</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Ghost (60-120d)</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-lg font-extrabold" style={{ color: C.red }}>2</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Deep Ghost (120d+)</div>
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Revenue at Risk"
          value={`$${totalRevenue.toLocaleString()}`}
          sub="Annual dues from ghost members"
          icon={DollarSign}
          color={C.red}
          sparkData={[28000, 35000, 42000, 48000, 55000, 62000, totalRevenue]}
          sparkColor={C.red}
          trend={{ value: -22.5, label: 'growing exposure' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Revenue at risk from ghost members, weighted by annual dues. One ACU underwriter
                account represents 90% of total ghost revenue risk.
              </p>
              {revenueByType.map((r) => (
                <div key={r.type} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)' }}>
                  <div>
                    <span style={{ color: 'var(--heading)' }}>{r.type}</span>
                    <span className="ml-1" style={{ color: 'var(--text-muted)' }}>({r.count} members)</span>
                  </div>
                  <span className="font-bold" style={{ color: r.color }}>${r.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Avg Days Since Activity"
          value={`${avgDays}d`}
          sub="Across all ghost members"
          icon={Clock}
          color={C.orange}
          sparkData={[62, 68, 72, 76, 80, 84, avgDays]}
          sparkColor={C.orange}
          trend={{ value: -8.4, label: 'worsening' }}
          accent
        />
        <SparkKpi
          label="Recovery Rate"
          value={`${recoveryRate}%`}
          sub="Re-engaged after outreach"
          icon={RefreshCw}
          color={C.green}
          sparkData={[15, 16, 18, 19, 20, 20.5, recoveryRate]}
          sparkColor={C.green}
          trend={{ value: 6.5, label: 'improving' }}
          accent
        />
      </div>

      {/* ── 3. Ghost Member List ──────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4" style={{ color: C.ghost }} />
            <h2 className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>
              Ghost Members
            </h2>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.15)', color: C.ghost }}
            >
              {totalGhosts} members
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Sort:</span>
            {(['revenue', 'days'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className="text-[9px] font-bold px-2 py-1 rounded-lg transition-all"
                style={{
                  background: sortBy === s ? C.ghost + '20' : 'transparent',
                  color: sortBy === s ? C.ghost : 'var(--text-muted)',
                }}
              >
                {s === 'revenue' ? 'Revenue' : 'Days Silent'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {sorted.map((m) => {
            const sc = statusConfig[m.status];
            const isExpanded = expandedGhost === m.email;

            return (
              <div
                key={m.email}
                className="rounded-xl border overflow-hidden transition-all duration-200 hover:translate-y-[-1px]"
                style={{
                  background: 'var(--card)',
                  borderColor: isExpanded ? sc.color : 'var(--card-border)',
                  borderLeftWidth: '4px',
                  borderLeftColor: sc.color,
                  boxShadow: isExpanded
                    ? `0 4px 24px rgba(0,0,0,0.15), 0 0 0 1px ${sc.color}20`
                    : '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedGhost(isExpanded ? null : m.email)}
                >
                  <div className="flex items-start gap-4">
                    {/* Ghost icon */}
                    <div
                      className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                      style={{ background: sc.bg, border: `1px solid ${sc.color}30` }}
                    >
                      <Ghost className="w-5 h-5" style={{ color: sc.color }} />
                    </div>

                    {/* Member info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: 'var(--heading)' }}>
                          {m.name}
                        </span>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}
                        >
                          {m.type}
                        </span>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          {m.status}
                        </span>
                      </div>
                      <div className="text-[10px] mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        {m.email}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          Last activity: <span className="font-bold" style={{ color: 'var(--heading)' }}>{m.lastActivity}</span>
                        </div>
                        <div className="text-[10px] font-bold" style={{ color: sc.color }}>
                          {m.daysSince} days silent
                        </div>
                      </div>
                    </div>

                    {/* Revenue + expand */}
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <div className="text-lg font-extrabold" style={{ color: C.red }}>
                        ${m.revenue.toLocaleString()}
                      </div>
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        annual dues at risk
                      </div>
                      <ChevronRight
                        className="w-4 h-4 mt-1 transition-transform duration-200"
                        style={{
                          color: 'var(--text-muted)',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                        <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                          Member Profile
                        </div>
                        <div className="space-y-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <div className="flex justify-between">
                            <span>Member since</span>
                            <span style={{ color: 'var(--heading)' }}>{m.memberSince}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Emails sent (last 90d)</span>
                            <span style={{ color: 'var(--heading)' }}>{m.emailsSent}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Opens (last 90d)</span>
                            <span className="font-bold" style={{ color: C.red }}>0</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Clicks (last 90d)</span>
                            <span className="font-bold" style={{ color: C.red }}>0</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                        <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                          Ghost Analysis
                        </div>
                        <div className="space-y-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <div className="flex justify-between">
                            <span>Days silent</span>
                            <span className="font-bold" style={{ color: sc.color }}>{m.daysSince}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Unsubscribed?</span>
                            <span style={{ color: C.green }}>No</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bouncing?</span>
                            <span style={{ color: C.green }}>No</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Classification</span>
                            <span className="font-bold" style={{ color: sc.color }}>{m.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg p-3" style={{ background: 'rgba(140,198,63,0.06)' }}>
                        <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.green }}>
                          Recovery Action
                        </div>
                        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--heading)' }}>
                          {m.revenue > 10000
                            ? 'PRIORITY: High-value account. Immediate personal phone call from membership director. Schedule in-person visit if local.'
                            : m.daysSince > 100
                              ? 'Send personal re-engagement email from staff. Include membership value summary and upcoming event invite with complimentary pass.'
                              : 'Trigger automated 3-email re-engagement series. Include recent resources, upcoming events, and member success story.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Ghost Trend Chart ──────────────────────────────── */}
      <Card
        title="Ghost Trend"
        subtitle="New ghost members vs recovered per month"
        className="mb-8"
        detailTitle="Ghost Trend Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              The ghost population is growing faster than recovery efforts can reclaim them.
              October through April shows a 217% increase in ghost members while recovery has
              only doubled. The gap is widening — indicating a systemic engagement issue.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Net Ghost Growth', value: '+26', color: C.red },
                { label: 'Total Recovered', value: '27', color: C.green },
                { label: 'Recovery Rate', value: '21.4%', color: C.blue },
              ].map((s) => (
                <div key={s.label} className="text-center p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <ClientChart
          type="line"
          height={280}
          data={{
            labels: ghostTrendMonths,
            datasets: [
              {
                label: 'Ghost Members',
                data: ghostTrendData,
                borderColor: C.ghost,
                backgroundColor: C.ghost + '15',
                fill: true,
                tension: 0.4,
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: C.ghost,
                pointBorderColor: 'var(--card)',
                pointBorderWidth: 2,
              },
              {
                label: 'Recovered',
                data: recoveredData,
                borderColor: C.green,
                backgroundColor: C.green + '15',
                fill: true,
                tension: 0.4,
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: C.green,
                pointBorderColor: 'var(--card)',
                pointBorderWidth: 2,
              },
            ],
          }}
          options={{
            plugins: {
              legend: {
                display: true,
                position: 'top' as const,
                labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 10 } },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#1e3350' },
                ticks: { color: '#8899aa' },
                title: { display: true, text: 'Members', color: '#8899aa', font: { size: 10 } },
              },
              x: {
                grid: { display: false },
                ticks: { color: '#8899aa' },
              },
            },
          }}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ── 5. Recovery Recommendations ─────────────────────── */}
        <Card
          title="Recovery Playbook"
          subtitle="Strategies to re-engage ghost members"
          detailTitle="Recovery Strategy Detail"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Recovery strategies ranked by historical success rate. Personal outreach remains the most
                effective approach, especially for high-value accounts. Automated campaigns work well
                at scale for mid-tier members.
              </p>
              {recoveryStrategies.map((s) => (
                <div key={s.name} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <s.icon className="w-4 h-4" style={{ color: s.color }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{s.name}</span>
                    </div>
                    <span className="text-sm font-extrabold" style={{ color: s.color }}>{s.successRate}</span>
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                  <div className="text-[9px] mt-1 font-bold" style={{ color: s.color }}>Best for: {s.best}</div>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-3">
            {recoveryStrategies.map((s) => (
              <div key={s.name} className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 mt-0.5"
                  style={{ background: s.color + '15', border: `1px solid ${s.color}25` }}
                >
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{s.name}</div>
                    <span className="text-[10px] font-extrabold" style={{ color: s.color }}>{s.successRate} success</span>
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
                  <MiniBar value={parseFloat(s.successRate)} max={40} color={s.color} height={3} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 6. GhostWatch vs DecayRadar ─────────────────────── */}
        <Card
          title="GhostWatch vs DecayRadar"
          subtitle="Different tools for different problems"
          detailTitle="Feature Comparison"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                GhostWatch and DecayRadar are complementary tools. DecayRadar catches members whose
                engagement is declining. GhostWatch catches members who have already stopped entirely.
                Together they form a complete early warning system.
              </p>
              <div className="space-y-2">
                {[
                  { feature: 'Detection Target', ghost: 'Zero engagement', decay: 'Declining engagement' },
                  { feature: 'Threshold', ghost: '60+ days, 0 opens', decay: '50%+ drop from baseline' },
                  { feature: 'Urgency', ghost: 'Immediate recovery', decay: 'Early intervention' },
                  { feature: 'Signal Type', ghost: 'Binary (engaged/not)', decay: 'Gradient (% decay)' },
                  { feature: 'Best For', ghost: 'Silent departures', decay: 'Gradual disengagement' },
                ].map((row) => (
                  <div key={row.feature} className="rounded-lg p-2" style={{ background: 'var(--input-bg)' }}>
                    <div className="text-[9px] font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>{row.feature}</div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="font-bold" style={{ color: C.ghost }}>GhostWatch:</span>{' '}
                        <span style={{ color: 'var(--heading)' }}>{row.ghost}</span>
                      </div>
                      <div>
                        <span className="font-bold" style={{ color: C.red }}>DecayRadar:</span>{' '}
                        <span style={{ color: 'var(--heading)' }}>{row.decay}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: C.ghost + '08', border: `1px solid ${C.ghost}20` }}>
              <div className="flex items-center gap-2 mb-2">
                <Ghost className="w-4 h-4" style={{ color: C.ghost }} />
                <span className="text-xs font-bold" style={{ color: C.ghost }}>GhostWatch</span>
              </div>
              <div className="space-y-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: C.ghost }}>&#8226;</span> Finds members with ZERO engagement for 60+ days
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: C.ghost }}>&#8226;</span> Still subscribed, not bouncing &mdash; just silent
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: C.ghost }}>&#8226;</span> Binary detection: engaged or ghost
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: C.ghost }}>&#8226;</span> Focuses on recovery and re-engagement
                </div>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: C.red + '08', border: `1px solid ${C.red}20` }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4" style={{ color: C.red }} />
                <span className="text-xs font-bold" style={{ color: C.red }}>DecayRadar</span>
              </div>
              <div className="space-y-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: C.red }}>&#8226;</span> Tracks members whose engagement is declining
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: C.red }}>&#8226;</span> Compares current rate vs personal historical baseline
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: C.red }}>&#8226;</span> Gradient detection: measures % of decay
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: C.red }}>&#8226;</span> Focuses on early intervention before ghosting
                </div>
              </div>
            </div>

            <div className="rounded-lg p-3 text-center" style={{ background: 'var(--input-bg)' }}>
              <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>
                Together they form a complete retention pipeline
              </div>
              <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                DecayRadar catches them slipping &rarr; GhostWatch catches them gone
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 7. Revenue at Risk by Type (Chart) ────────────────── */}
      <Card
        title="Revenue at Risk by Member Type"
        subtitle="Annual dues exposure from ghost members"
        className="mb-8"
      >
        <ClientChart
          type="bar"
          height={240}
          data={{
            labels: revenueByType.map((r) => r.type),
            datasets: [
              {
                label: 'Revenue at Risk',
                data: revenueByType.map((r) => r.revenue),
                backgroundColor: revenueByType.map((r) => r.color + '80'),
                borderColor: revenueByType.map((r) => r.color),
                borderWidth: 2,
                borderRadius: 8,
              },
            ],
          }}
          options={{
            plugins: {
              legend: { display: false },
              datalabels: {
                display: true,
                anchor: 'end' as const,
                align: 'end' as const,
                color: '#e2e8f0',
                font: { weight: 'bold' as const, size: 10 },
                formatter: (v: number) => '$' + v.toLocaleString(),
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#1e3350' },
                ticks: {
                  color: '#8899aa',
                  callback: (v: number | string) => '$' + Number(v).toLocaleString(),
                },
              },
              x: {
                grid: { display: false },
                ticks: { color: '#8899aa', font: { size: 9 } },
              },
            },
          }}
        />
      </Card>

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(99,102,241,0.08)',
            color: C.ghost,
            border: '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <Ghost className="w-3 h-3" />
          GhostWatch&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
