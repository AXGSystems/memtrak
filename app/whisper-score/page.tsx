'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  Ear, Users, DollarSign, Activity, BarChart3,
  Phone, Calendar, Download, Clock, Award,
  TrendingUp, TrendingDown, Minus, X, Eye,
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
  cyan: '#06b6d4',
};

/* ── signal types ─────────────────────────────────────────── */
const signalTypes = [
  { name: 'Event Attendance', icon: Calendar, weight: 25, color: C.blue, desc: 'In-person and virtual event check-ins from ALTA ONE, webinars, state conventions' },
  { name: 'Committee Participation', icon: Users, weight: 20, color: C.purple, desc: 'Active role on ALTA committees, task forces, and working groups' },
  { name: 'Phone Calls Logged', icon: Phone, weight: 20, color: C.green, desc: 'Inbound/outbound calls with ALTA staff tracked in CRM' },
  { name: 'Resource Downloads', icon: Download, weight: 15, color: C.teal, desc: 'Best practices guides, compliance toolkits, research reports' },
  { name: 'Payment Timeliness', icon: Clock, weight: 10, color: C.amber, desc: 'Dues and event payments received before deadline' },
  { name: 'Referral Activity', icon: Award, weight: 10, color: C.cyan, desc: 'New member referrals, speaker recommendations, sponsor intros' },
];

/* ── member comparison data ───────────────────────────────── */
interface WhisperMember {
  org: string;
  type: string;
  contact: string;
  engagementScore: number;
  whisperScore: number;
  revenue: number;
  signals: {
    events: number;
    committees: number;
    calls: number;
    downloads: number;
    paymentOnTime: boolean;
    referrals: number;
  };
  insight: string;
}

const members: WhisperMember[] = [
  {
    org: 'Heritage Abstract LLC', type: 'ACB', contact: 'Bob Walker',
    engagementScore: 5, whisperScore: 72,
    revenue: 517,
    signals: { events: 4, committees: 1, calls: 12, downloads: 2, paymentOnTime: true, referrals: 1 },
    insight: 'Zero email engagement but attends every state convention, serves on Forms Committee, and calls staff monthly. A hidden champion.',
  },
  {
    org: 'Patriot Title Services', type: 'ACA', contact: 'Linda Chen',
    engagementScore: 12, whisperScore: 81,
    revenue: 2400,
    signals: { events: 6, committees: 2, calls: 8, downloads: 14, paymentOnTime: true, referrals: 3 },
    insight: 'Rarely opens emails but downloads every compliance toolkit, serves on two committees, and referred three new members this year.',
  },
  {
    org: 'Summit Title Group', type: 'ACA', contact: 'Mark Rivera',
    engagementScore: 8, whisperScore: 65,
    revenue: 1216,
    signals: { events: 3, committees: 0, calls: 18, downloads: 6, paymentOnTime: true, referrals: 0 },
    insight: 'Prefers phone over email. Calls ALTA staff frequently for compliance questions. High offline engagement pattern.',
  },
  {
    org: 'First American Title', type: 'ACU', contact: 'Jane Smith',
    engagementScore: 94, whisperScore: 88,
    revenue: 61554,
    signals: { events: 8, committees: 3, calls: 4, downloads: 22, paymentOnTime: true, referrals: 5 },
    insight: 'Strong across both digital and offline. High-value member fully engaged on all channels.',
  },
  {
    org: 'Clearview Title Co', type: 'REA', contact: 'Dan Foster',
    engagementScore: 78, whisperScore: 22,
    revenue: 441,
    signals: { events: 0, committees: 0, calls: 0, downloads: 1, paymentOnTime: false, referrals: 0 },
    insight: 'Opens and clicks emails but never attends events, does not participate offline, late on payments. Email vanity metric risk.',
  },
  {
    org: 'National Title Services', type: 'REA', contact: 'Maria Brown',
    engagementScore: 72, whisperScore: 30,
    revenue: 441,
    signals: { events: 1, committees: 0, calls: 1, downloads: 3, paymentOnTime: true, referrals: 0 },
    insight: 'Decent email metrics but minimal offline involvement. Passive consumer — risk of silent churn.',
  },
  {
    org: 'Liberty Title Group', type: 'ACA', contact: 'Steve Williams',
    engagementScore: 65, whisperScore: 58,
    revenue: 1216,
    signals: { events: 2, committees: 1, calls: 3, downloads: 8, paymentOnTime: true, referrals: 1 },
    insight: 'Balanced engagement across channels. Recently joined Education Committee — trending positive.',
  },
  {
    org: 'Prairie Land Abstract', type: 'ACB', contact: 'Carol Jensen',
    engagementScore: 3, whisperScore: 44,
    revenue: 517,
    signals: { events: 2, committees: 0, calls: 6, downloads: 0, paymentOnTime: true, referrals: 0 },
    insight: 'Ignores all emails but attends local events and calls for compliance help. Traditional communicator.',
  },
];

/* ── helpers ──────────────────────────────────────────────── */
function scoreColor(score: number) {
  if (score >= 75) return C.green;
  if (score >= 50) return C.blue;
  if (score >= 25) return C.orange;
  return C.red;
}

function divergence(eng: number, whi: number) {
  return Math.abs(eng - whi);
}

function DivergenceBadge({ eng, whi }: { eng: number; whi: number }) {
  const diff = whi - eng;
  const absDiff = Math.abs(diff);
  if (absDiff < 15) return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,144,217,0.15)', color: C.blue }}>Aligned</span>;
  if (diff > 0) return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(140,198,63,0.15)', color: C.green }}>Hidden Champion</span>;
  return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(232,146,63,0.15)', color: C.orange }}>Email Vanity</span>;
}

/* ══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function WhisperScorePage() {
  const [selectedMember, setSelectedMember] = useState<WhisperMember | null>(null);

  const hiddenChampions = members.filter(m => m.whisperScore - m.engagementScore > 15).length;
  const silentRevenue = members.filter(m => m.engagementScore < 20 && m.whisperScore > 40).reduce((s, m) => s + m.revenue, 0);
  const avgDivergence = Math.round(members.reduce((s, m) => s + divergence(m.engagementScore, m.whisperScore), 0) / members.length);

  return (
    <div className="p-6 space-y-6">
      {/* ── 1. Branded Header ──────────────────────────────── */}
      <div className="flex items-center gap-3 mb-1">
        <div className="relative">
          <Ear className="w-9 h-9" style={{ color: C.teal }} />
          <Activity className="absolute -bottom-0.5 -right-1 w-4 h-4" style={{ color: C.purple }} />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            WhisperScore<span className="align-super text-[9px] font-black" style={{ color: 'var(--accent)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Hear the members <strong style={{ color: 'var(--heading)' }}>your metrics miss.</strong>
          </p>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
        Traditional email metrics only capture digital engagement. <strong style={{ color: 'var(--heading)' }}>WhisperScore</strong> combines
        6 offline and indirect signals to reveal members who are deeply engaged but invisible to your email dashboard.
        Some of your most valuable champions never open an email.
      </p>

      {/* ── 2. SparkKpi Row ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SparkKpi
          label="Hidden Champions Found"
          value={hiddenChampions}
          icon={Eye}
          color={C.green}
          sparkData={[1, 2, 2, 3, 3, 4, hiddenChampions]}
          sparkColor={C.green}
          trend={{ value: 33, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Hidden Champions are members with email engagement below 20% but WhisperScore above 50%.
                These members are deeply engaged through offline channels that traditional metrics miss entirely.
              </p>
              <div className="space-y-2">
                {members.filter(m => m.whisperScore - m.engagementScore > 15).map(m => (
                  <div key={m.org} className="flex items-center justify-between text-[11px] py-1.5 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <span style={{ color: 'var(--heading)' }}>{m.org}</span>
                    <span className="font-bold" style={{ color: C.green }}>WS: {m.whisperScore}</span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Revenue from Silent Members"
          value={`$${silentRevenue.toLocaleString()}`}
          icon={DollarSign}
          color={C.amber}
          sparkData={[2100, 2400, 2800, 3100, 3400, silentRevenue]}
          sparkColor={C.amber}
          trend={{ value: 12.5, label: 'at risk without WhisperScore' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Revenue from members with under 20% email engagement but active offline signals.
                Without WhisperScore, these members would be flagged for churn intervention despite being engaged.
              </p>
            </div>
          }
        />
        <SparkKpi
          label="Signals Tracked"
          value={6}
          icon={Activity}
          color={C.purple}
          sparkData={[3, 3, 4, 4, 5, 6, 6]}
          sparkColor={C.purple}
          trend={{ value: 50, label: 'vs initial launch' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>WhisperScore tracks 6 distinct offline and indirect engagement signals:</p>
              {signalTypes.map(s => (
                <div key={s.name} className="flex items-start gap-2 text-[11px]">
                  <s.icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: s.color }} />
                  <div>
                    <strong style={{ color: 'var(--heading)' }}>{s.name}</strong> ({s.weight}% weight)
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Score Divergence Rate"
          value={`${avgDivergence} pts`}
          sub="Avg gap between engagement and whisper"
          icon={BarChart3}
          color={C.orange}
          sparkData={[22, 24, 26, 28, 30, 32, avgDivergence]}
          sparkColor={C.orange}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Score Divergence measures the average absolute difference between a member&apos;s traditional email engagement score
                and their WhisperScore. Higher divergence means your email metrics are a poor proxy for true engagement.
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] font-bold mb-2" style={{ color: 'var(--heading)' }}>Divergence Distribution</div>
                <div className="space-y-1.5">
                  {[
                    { label: '0-15 pts (Aligned)', count: members.filter(m => divergence(m.engagementScore, m.whisperScore) < 15).length, color: C.blue },
                    { label: '15-40 pts (Moderate)', count: members.filter(m => { const d = divergence(m.engagementScore, m.whisperScore); return d >= 15 && d < 40; }).length, color: C.orange },
                    { label: '40+ pts (Major Gap)', count: members.filter(m => divergence(m.engagementScore, m.whisperScore) >= 40).length, color: C.red },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between text-[10px]">
                      <span style={{ color: 'var(--text-muted)' }}>{d.label}</span>
                      <span className="font-bold" style={{ color: d.color }}>{d.count} members</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* ── 3. Comparison Table ────────────────────────────── */}
      <Card
        title="Engagement vs WhisperScore Comparison"
        subtitle="Traditional email metrics vs offline signal intelligence"
        detailTitle="Full Member Analysis"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Each row compares a member&apos;s traditional engagement score (based on opens, clicks, and email activity)
              with their WhisperScore (based on offline signals). Large divergence reveals blind spots in email-only metrics.
            </p>
            {members.map(m => (
              <div key={m.org} className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[12px] font-bold" style={{ color: 'var(--heading)' }}>{m.org}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{m.contact} | {m.type} | ${m.revenue.toLocaleString()}</div>
                  </div>
                  <DivergenceBadge eng={m.engagementScore} whi={m.whisperScore} />
                </div>
                <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>{m.insight}</p>
              </div>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-[11px]" style={{ minWidth: 700 }}>
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--card-border)' }}>
                <th className="text-left px-5 py-2 font-bold" style={{ color: 'var(--heading)' }}>Member</th>
                <th className="text-center px-3 py-2 font-bold" style={{ color: 'var(--heading)' }}>Type</th>
                <th className="text-center px-3 py-2 font-bold" style={{ color: C.blue }}>
                  <span className="flex items-center justify-center gap-1"><BarChart3 className="w-3 h-3" /> Engagement</span>
                </th>
                <th className="text-center px-3 py-2 font-bold" style={{ color: C.teal }}>
                  <span className="flex items-center justify-center gap-1"><Ear className="w-3 h-3" /> WhisperScore</span>
                </th>
                <th className="text-center px-3 py-2 font-bold" style={{ color: 'var(--heading)' }}>Gap</th>
                <th className="text-center px-3 py-2 font-bold" style={{ color: 'var(--heading)' }}>Status</th>
                <th className="text-right px-5 py-2 font-bold" style={{ color: 'var(--heading)' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[...members].sort((a, b) => (b.whisperScore - b.engagementScore) - (a.whisperScore - a.engagementScore)).map(member => (
                <tr
                  key={member.org}
                  className="border-b cursor-pointer transition-colors"
                  style={{ borderColor: 'var(--card-border)' }}
                  onClick={() => setSelectedMember(member)}
                >
                  <td className="px-5 py-2.5">
                    <div className="font-semibold" style={{ color: 'var(--heading)' }}>{member.org}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{member.contact}</div>
                  </td>
                  <td className="text-center px-3 py-2.5">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--input-bg)', color: 'var(--heading)' }}>
                      {member.type}
                    </span>
                  </td>
                  <td className="text-center px-3 py-2.5">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-12 h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${member.engagementScore}%`, background: scoreColor(member.engagementScore) }} />
                      </div>
                      <span className="font-bold text-[10px]" style={{ color: scoreColor(member.engagementScore) }}>{member.engagementScore}</span>
                    </div>
                  </td>
                  <td className="text-center px-3 py-2.5">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-12 h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${member.whisperScore}%`, background: scoreColor(member.whisperScore) }} />
                      </div>
                      <span className="font-bold text-[10px]" style={{ color: scoreColor(member.whisperScore) }}>{member.whisperScore}</span>
                    </div>
                  </td>
                  <td className="text-center px-3 py-2.5">
                    <span className="font-bold text-[10px]" style={{ color: divergence(member.engagementScore, member.whisperScore) > 30 ? C.red : 'var(--text-muted)' }}>
                      {member.whisperScore > member.engagementScore ? '+' : ''}{member.whisperScore - member.engagementScore}
                    </span>
                  </td>
                  <td className="text-center px-3 py-2.5">
                    <DivergenceBadge eng={member.engagementScore} whi={member.whisperScore} />
                  </td>
                  <td className="text-right px-5 py-2.5 font-semibold" style={{ color: 'var(--text-muted)' }}>
                    ${member.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 4. Signal Weights + Scatter Chart ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Signal Weights" subtitle="How WhisperScore is calculated">
          <div className="space-y-3 mt-2">
            {signalTypes.map(signal => (
              <div key={signal.name}>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="flex items-center gap-1.5">
                    <signal.icon className="w-3 h-3" style={{ color: signal.color }} />
                    <span style={{ color: 'var(--heading)' }}>{signal.name}</span>
                  </span>
                  <span className="font-bold" style={{ color: signal.color }}>{signal.weight}%</span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: 'var(--card-border)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${signal.weight * 4}%`, background: signal.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Engagement vs WhisperScore" subtitle="Scatter plot reveals hidden patterns">
          <ClientChart
            type="scatter"
            height={260}
            data={{
              datasets: [{
                label: 'Members',
                data: members.map(m => ({ x: m.engagementScore, y: m.whisperScore })),
                backgroundColor: members.map(m => {
                  const diff = m.whisperScore - m.engagementScore;
                  if (diff > 15) return `${C.green}cc`;
                  if (diff < -15) return `${C.orange}cc`;
                  return `${C.blue}cc`;
                }),
                pointRadius: members.map(m => Math.max(5, Math.sqrt(m.revenue / 100))),
              }],
            }}
            options={{
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx: { dataIndex: number; parsed: { x: number; y: number } }) => {
                      const m = members[ctx.dataIndex];
                      return [`${m.org}`, `Engagement: ${ctx.parsed.x}`, `WhisperScore: ${ctx.parsed.y}`, `Revenue: $${m.revenue.toLocaleString()}`];
                    },
                  },
                },
              },
              scales: {
                x: { title: { display: true, text: 'Email Engagement', color: '#8899aa' }, min: 0, max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
                y: { title: { display: true, text: 'WhisperScore', color: '#8899aa' }, min: 0, max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
              },
            }}
          />
          <div className="flex items-center justify-center gap-4 text-[9px] mt-2" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: C.green }} /> Hidden Champion</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: C.blue }} /> Aligned</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: C.orange }} /> Email Vanity</span>
          </div>
        </Card>
      </div>

      {/* ── 5. Key Insights ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Hidden Champion Profile" subtitle="What silent engagement looks like" accent={C.green}>
          <div className="space-y-2 mt-2">
            <div className="rounded-lg p-3" style={{ background: 'rgba(140,198,63,0.08)' }}>
              <div className="text-[11px] font-bold mb-1" style={{ color: C.green }}>Heritage Abstract LLC</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Email engagement: <strong style={{ color: C.red }}>5%</strong> | WhisperScore: <strong style={{ color: C.green }}>72</strong>
              </div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Bob Walker never opens emails but attends every state convention, serves on the Forms Committee, calls staff monthly, and pays dues early. Without WhisperScore, this member would be flagged for churn.
              </div>
            </div>
            <div className="space-y-1">
              {[
                { label: 'Events attended', value: '4 this year' },
                { label: 'Committees', value: 'Forms Committee' },
                { label: 'Staff calls', value: '12 logged' },
                { label: 'Payment', value: 'Always early' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-[10px] py-1 border-b" style={{ borderColor: 'var(--card-border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span className="font-bold" style={{ color: 'var(--heading)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Email Vanity Alert" subtitle="High metrics, low true engagement" accent={C.orange}>
          <div className="space-y-2 mt-2">
            <div className="rounded-lg p-3" style={{ background: 'rgba(232,146,63,0.08)' }}>
              <div className="text-[11px] font-bold mb-1" style={{ color: C.orange }}>Clearview Title Co</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Email engagement: <strong style={{ color: C.green }}>78%</strong> | WhisperScore: <strong style={{ color: C.red }}>22</strong>
              </div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Dan Foster opens every email and clicks links, but has never attended an event, does not participate in committees, never calls staff, and was late on dues. A passive consumer at risk of silent churn.
              </div>
            </div>
            <div className="space-y-1">
              {[
                { label: 'Events attended', value: '0' },
                { label: 'Committees', value: 'None' },
                { label: 'Staff calls', value: '0' },
                { label: 'Payment', value: 'Late' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-[10px] py-1 border-b" style={{ borderColor: 'var(--card-border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <span className="font-bold" style={{ color: item.value === '0' || item.value === 'None' || item.value === 'Late' ? C.red : 'var(--heading)' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="What This Means" subtitle="Recommendations for ALTA staff">
          <div className="space-y-3 mt-2">
            <div className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--heading)' }}>Never auto-suppress low-email members.</strong> WhisperScore reveals that{' '}
              <strong style={{ color: C.green }}>{hiddenChampions} members</strong> with near-zero email engagement are
              among your most active offline participants.
            </div>
            <div className="space-y-2">
              {[
                { action: 'Add WhisperScore to churn model inputs', status: 'Recommended', color: C.green },
                { action: 'Create "Phone Preferred" segment for Heritage-type members', status: 'High Priority', color: C.amber },
                { action: 'Flag Email Vanity members for proactive outreach', status: 'In Progress', color: C.blue },
                { action: 'Include event attendance in renewal risk scoring', status: 'Planned', color: C.purple },
              ].map(item => (
                <div key={item.action} className="flex items-start gap-2 text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.color }} />
                  <div>
                    <span style={{ color: 'var(--heading)' }}>{item.action}</span>
                    <span className="ml-2 text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${item.color}20`, color: item.color }}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Member Detail Modal ───────────────────────────── */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedMember(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedMember.org}</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedMember.contact} | {selectedMember.type} | ${selectedMember.revenue.toLocaleString()}</p>
              </div>
              <button onClick={() => setSelectedMember(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Score comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3 text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Email Engagement</div>
                  <div className="text-2xl font-extrabold" style={{ color: scoreColor(selectedMember.engagementScore) }}>{selectedMember.engagementScore}</div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>WhisperScore</div>
                  <div className="text-2xl font-extrabold" style={{ color: scoreColor(selectedMember.whisperScore) }}>{selectedMember.whisperScore}</div>
                </div>
              </div>

              {/* Insight */}
              <div className="rounded-lg p-3" style={{ background: 'rgba(74,144,217,0.08)' }}>
                <div className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>{selectedMember.insight}</div>
              </div>

              {/* Signals */}
              <div>
                <div className="text-[11px] font-bold mb-2" style={{ color: 'var(--heading)' }}>Signal Breakdown</div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Events Attended', value: selectedMember.signals.events, icon: Calendar, color: C.blue },
                    { label: 'Committee Roles', value: selectedMember.signals.committees, icon: Users, color: C.purple },
                    { label: 'Phone Calls', value: selectedMember.signals.calls, icon: Phone, color: C.green },
                    { label: 'Downloads', value: selectedMember.signals.downloads, icon: Download, color: C.teal },
                    { label: 'Payment On Time', value: selectedMember.signals.paymentOnTime ? 'Yes' : 'No', icon: Clock, color: selectedMember.signals.paymentOnTime ? C.green : C.red },
                    { label: 'Referrals', value: selectedMember.signals.referrals, icon: Award, color: C.cyan },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between text-[10px] py-1.5 px-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                      <span className="flex items-center gap-1.5">
                        <s.icon className="w-3 h-3" style={{ color: s.color }} />
                        <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                      </span>
                      <span className="font-bold" style={{ color: typeof s.value === 'number' && s.value === 0 ? C.red : 'var(--heading)' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
