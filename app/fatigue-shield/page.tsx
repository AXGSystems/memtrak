'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { MiniBar } from '@/components/SparkKpi';
import {
  ShieldAlert,
  Users,
  Mail,
  TrendingDown,
  Heart,
  AlertTriangle,
  X,
  Bell,
  BellOff,
  Activity,
  Zap,
  Eye,
  Clock,
} from 'lucide-react';

/* ── Palette ── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  teal: '#14b8a6',
};

/* ── Synthetic member fatigue data ── */
const fatigueMembers = [
  { name: 'Sandra Wilkins', org: 'Pacific Title Co.', type: 'ACA', email: 'swilkins@pacifictitle.com', emailsThisWeek: 6, threshold: 4, fatiguePct: 92, risk: 'Critical', channels: { memtrak: 2, higherLogic: 3, outlook: 1 }, lastUnsubAction: null },
  { name: 'Robert Chen', org: 'First American Title', type: 'ACU', email: 'rchen@firstam.com', emailsThisWeek: 5, threshold: 4, fatiguePct: 78, risk: 'High', channels: { memtrak: 2, higherLogic: 2, outlook: 1 }, lastUnsubAction: null },
  { name: 'Maria Gonzalez', org: 'Fidelity National', type: 'ACU', email: 'mgonzalez@fnf.com', emailsThisWeek: 5, threshold: 4, fatiguePct: 71, risk: 'High', channels: { memtrak: 1, higherLogic: 3, outlook: 1 }, lastUnsubAction: 'Hovered unsub link 3 days ago' },
  { name: 'James Patterson', org: 'Heritage Abstract LLC', type: 'ACB', email: 'jpatterson@heritageabstract.com', emailsThisWeek: 4, threshold: 4, fatiguePct: 55, risk: 'Medium', channels: { memtrak: 2, higherLogic: 1, outlook: 1 }, lastUnsubAction: null },
  { name: 'Lisa Thompson', org: 'National Title Services', type: 'REA', email: 'lthompson@nationaltitle.com', emailsThisWeek: 4, threshold: 4, fatiguePct: 48, risk: 'Medium', channels: { memtrak: 1, higherLogic: 2, outlook: 1 }, lastUnsubAction: null },
  { name: 'David Kim', org: 'Liberty Title Group', type: 'ACA', email: 'dkim@libertytitle.com', emailsThisWeek: 3, threshold: 4, fatiguePct: 22, risk: 'Low', channels: { memtrak: 1, higherLogic: 1, outlook: 1 }, lastUnsubAction: null },
  { name: 'Emily Rodriguez', org: 'Commonwealth Land Title', type: 'ACA', email: 'erodriguez@commonwealth.com', emailsThisWeek: 2, threshold: 4, fatiguePct: 10, risk: 'Low', channels: { memtrak: 1, higherLogic: 1, outlook: 0 }, lastUnsubAction: null },
];

/* ── Suppression recommendations ── */
const suppressionRecs = [
  { member: 'Sandra Wilkins', org: 'Pacific Title Co.', suppress: 'Title News Weekly #16', reason: 'Already received 6 emails this week. Newsletter lowest-priority send.', savings: 'Prevents 92% fatigue risk from escalating to unsubscribe.' },
  { member: 'Robert Chen', org: 'First American Title', suppress: 'ALTA ONE Reminder #2', reason: 'Already registered. Duplicate send across Higher Logic + MEMTrak.', savings: '$61K ACU account — unsubscribe would sever primary contact.' },
  { member: 'Maria Gonzalez', org: 'Fidelity National', suppress: 'EDge Program Followup', reason: 'Hovered over unsubscribe link 3 days ago. One more email could trigger action.', savings: 'High-value ACU contact showing explicit fatigue signal.' },
];

/* ── Heatmap data: sends per week distribution ── */
const heatmapWeeks = ['W1 Mar', 'W2 Mar', 'W3 Mar', 'W4 Mar', 'W1 Apr', 'W2 Apr'];
const heatmapBuckets = [
  { label: '0 emails', data: [820, 780, 690, 710, 750, 800] },
  { label: '1 email', data: [1400, 1350, 1280, 1320, 1300, 1380] },
  { label: '2 emails', data: [1600, 1700, 1650, 1580, 1620, 1550] },
  { label: '3 emails', data: [680, 720, 810, 790, 760, 700] },
  { label: '4+ emails', data: [120, 150, 280, 310, 340, 290] },
];

/* ── Risk config ── */
const riskConfig: Record<string, { color: string; bg: string }> = {
  Critical: { color: C.red, bg: 'rgba(217,74,74,0.12)' },
  High: { color: C.orange, bg: 'rgba(232,146,63,0.12)' },
  Medium: { color: C.amber, bg: 'rgba(245,158,11,0.12)' },
  Low: { color: C.green, bg: 'rgba(140,198,63,0.12)' },
};

export default function FatigueShield() {
  const [selectedMember, setSelectedMember] = useState<typeof fatigueMembers[0] | null>(null);
  const [showSuppressionModal, setShowSuppressionModal] = useState(false);

  /* ── KPI calculations ── */
  const monitored = 4994;
  const avgEmailsWeek = (fatigueMembers.reduce((s, m) => s + m.emailsThisWeek, 0) / fatigueMembers.length).toFixed(1);
  const highRisk = fatigueMembers.filter(m => m.risk === 'Critical' || m.risk === 'High').length;
  const preventedUnsubs = 47;

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(74,144,217,0.2) 100%)',
              border: '1px solid rgba(20,184,166,0.3)',
            }}
          >
            <ShieldAlert className="w-5 h-5" style={{ color: C.teal }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              FatigueShield<span style={{ color: C.teal, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.teal }}>
              Never burn a member with one email too many.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Cross-channel frequency capping engine that monitors every member&apos;s email volume across MEMTrak,
          Higher Logic, and Outlook. When a member approaches their fatigue threshold, FatigueShield automatically
          recommends suppressions — preventing unsubscribes before they happen and protecting your most valuable contacts.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Members Monitored"
          value={monitored.toLocaleString()}
          sub="All active contacts"
          icon={Users}
          color={C.blue}
          sparkData={[4200, 4350, 4500, 4620, 4750, 4880, 4994]}
          sparkColor={C.blue}
          trend={{ value: 3.2, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Avg Emails/Week"
          value={avgEmailsWeek}
          sub="Per member across all channels"
          icon={Mail}
          color={C.teal}
          sparkData={[2.8, 3.1, 3.4, 3.2, 3.6, 3.8, Number(avgEmailsWeek)]}
          sparkColor={C.teal}
          trend={{ value: -8.3, label: 'rising trend' }}
          accent
        />
        <SparkKpi
          label="Fatigue Risk High"
          value={highRisk}
          sub={`${fatigueMembers.length} members approaching threshold`}
          icon={AlertTriangle}
          color={C.red}
          sparkData={[1, 1, 2, 2, 3, 3, highRisk]}
          sparkColor={C.red}
          trend={{ value: -33, label: 'new this week' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--heading)' }}>{highRisk} members</strong> are receiving emails
                above their fatigue threshold and are at elevated risk of unsubscribing.
              </p>
              {fatigueMembers.filter(m => m.risk === 'Critical' || m.risk === 'High').map(m => (
                <div key={m.email} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)' }}>
                  <span style={{ color: 'var(--heading)' }}>{m.name} ({m.org})</span>
                  <span className="font-bold" style={{ color: riskConfig[m.risk].color }}>{m.emailsThisWeek} emails/wk</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Prevented Unsubscribes"
          value={preventedUnsubs}
          sub="This quarter via suppression"
          icon={Heart}
          color={C.green}
          sparkData={[8, 12, 18, 24, 31, 39, preventedUnsubs]}
          sparkColor={C.green}
          trend={{ value: 22.5, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                FatigueShield has prevented an estimated <strong style={{ color: 'var(--heading)' }}>47 unsubscribes</strong> this
                quarter by suppressing low-priority sends to fatigued members. This is calculated by comparing
                unsubscribe rates of suppressed vs. non-suppressed members in similar fatigue states.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="p-2 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-lg font-extrabold" style={{ color: C.green }}>0.08%</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Unsub rate (shielded)</div>
                </div>
                <div className="p-2 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-lg font-extrabold" style={{ color: C.red }}>1.2%</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Unsub rate (unshielded)</div>
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* ── 3. Fatigue Risk Table ─────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4" style={{ color: C.teal }} />
          <h2 className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>
            Member Fatigue Monitor
          </h2>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(20,184,166,0.15)', color: C.teal }}
          >
            {fatigueMembers.length} tracked
          </span>
        </div>

        <Card noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  {['Member', 'Org', 'Type', 'Emails/Wk', 'Threshold', 'Fatigue', 'Risk', 'Channels'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fatigueMembers.map(m => {
                  const rc = riskConfig[m.risk];
                  return (
                    <tr
                      key={m.email}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid var(--card-border)' }}
                      onClick={() => setSelectedMember(m)}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--input-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--heading)' }}>{m.name}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{m.org}</td>
                      <td className="px-4 py-3">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>{m.type}</span>
                      </td>
                      <td className="px-4 py-3 font-extrabold" style={{ color: m.emailsThisWeek > m.threshold ? C.red : 'var(--heading)' }}>{m.emailsThisWeek}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{m.threshold}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MiniBar value={m.fatiguePct} max={100} color={rc.color} height={5} />
                          <span className="font-bold text-[10px]" style={{ color: rc.color }}>{m.fatiguePct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: rc.bg, color: rc.color }}>{m.risk}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] px-1 py-0.5 rounded" style={{ background: 'rgba(74,144,217,0.15)', color: C.blue }}>{m.channels.memtrak}</span>
                          <span className="text-[8px] px-1 py-0.5 rounded" style={{ background: 'rgba(140,198,63,0.15)', color: C.green }}>{m.channels.higherLogic}</span>
                          <span className="text-[8px] px-1 py-0.5 rounded" style={{ background: 'rgba(168,85,247,0.15)', color: C.purple }}>{m.channels.outlook}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-4 px-4 py-3" style={{ borderTop: '1px solid var(--card-border)' }}>
            <span className="flex items-center gap-1 text-[8px]" style={{ color: C.blue }}><span className="w-2 h-2 rounded" style={{ background: 'rgba(74,144,217,0.3)' }} /> MEMTrak</span>
            <span className="flex items-center gap-1 text-[8px]" style={{ color: C.green }}><span className="w-2 h-2 rounded" style={{ background: 'rgba(140,198,63,0.3)' }} /> Higher Logic</span>
            <span className="flex items-center gap-1 text-[8px]" style={{ color: C.purple }}><span className="w-2 h-2 rounded" style={{ background: 'rgba(168,85,247,0.3)' }} /> Outlook</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ── 4. Sends-per-Week Heatmap ──────────────────────── */}
        <Card
          title="Send Frequency Distribution"
          subtitle="Members by emails received per week"
          detailTitle="Frequency Distribution Analysis"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                This chart shows how email volume distributes across your membership over the past 6 weeks.
                The &quot;4+ emails&quot; bucket has been growing steadily — from 120 members in early March to
                290+ in April. This is the cohort FatigueShield actively protects.
              </p>
              {heatmapBuckets.map((b, i) => (
                <div key={b.label} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)' }}>
                  <span style={{ color: 'var(--heading)' }}>{b.label}</span>
                  <span style={{ color: i >= 3 ? C.orange : i >= 4 ? C.red : 'var(--text-muted)' }}>
                    avg {Math.round(b.data.reduce((s, v) => s + v, 0) / b.data.length).toLocaleString()} members
                  </span>
                </div>
              ))}
            </div>
          }
        >
          <ClientChart
            type="bar"
            height={260}
            data={{
              labels: heatmapWeeks,
              datasets: heatmapBuckets.map((b, i) => ({
                label: b.label,
                data: b.data,
                backgroundColor: [
                  'rgba(140,198,63,0.7)',
                  'rgba(74,144,217,0.7)',
                  'rgba(20,184,166,0.7)',
                  'rgba(232,146,63,0.7)',
                  'rgba(217,74,74,0.7)',
                ][i],
                borderColor: [C.green, C.blue, C.teal, C.orange, C.red][i],
                borderWidth: 1,
                borderRadius: 2,
              })),
            }}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom' as const,
                  labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 12, font: { size: 9 } },
                },
              },
              scales: {
                x: { stacked: true, grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 } } },
                y: { stacked: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
              },
            }}
          />
        </Card>

        {/* ── 5. Recommended Suppressions ─────────────────────── */}
        <Card
          title="Recommended Suppressions"
          subtitle="AI-driven send prevention for fatigued members"
          detailTitle="Suppression Algorithm"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                FatigueShield ranks upcoming sends for each at-risk member and recommends suppressing the lowest-value
                send. The algorithm considers: campaign priority, member engagement history, channel overlap,
                and proximity to the fatigue threshold.
              </p>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(140,198,63,0.06)', border: '1px solid rgba(140,198,63,0.15)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: C.green }}>Suppression Impact</div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Members who were suppressed by FatigueShield have a 15x lower unsubscribe rate than
                  members who were not suppressed despite being in a similar fatigue state.
                </p>
              </div>
            </div>
          }
        >
          <div className="space-y-3">
            {suppressionRecs.map((rec, i) => (
              <div
                key={i}
                className="rounded-lg border p-3 transition-all duration-200 hover:translate-y-[-1px]"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{rec.member}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{rec.org}</div>
                  </div>
                  <BellOff className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.orange }} />
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(217,74,74,0.12)', color: C.red }}>SUPPRESS</span>
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--heading)' }}>{rec.suppress}</span>
                </div>
                <p className="text-[10px] mb-1.5" style={{ color: 'var(--text-muted)' }}>{rec.reason}</p>
                <p className="text-[10px]" style={{ color: C.green }}>{rec.savings}</p>
              </div>
            ))}
            <button
              onClick={() => setShowSuppressionModal(true)}
              className="w-full py-2 rounded-lg text-[10px] font-bold transition-all hover:scale-[1.01]"
              style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' }}
            >
              Apply All Suppressions
            </button>
          </div>
        </Card>
      </div>

      {/* ── 6. Fatigue Trend Chart ────────────────────────────── */}
      <Card
        title="Fatigue Risk Trend"
        subtitle="Members at risk by week (4+ emails threshold)"
        className="mb-8"
        detailTitle="Weekly Fatigue Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              The fatigue risk trend shows the number of members exceeding the 4-email weekly threshold.
              The upward trend from March to April correlates with increased campaign activity around
              ALTA ONE Early Bird and PFL Compliance campaigns running simultaneously.
            </p>
            <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
              <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Key Insight</div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                The W3 Mar spike to 280 members coincides with 3 campaigns launching in the same week.
                FatigueShield would have suppressed 68% of those overlapping sends.
              </p>
            </div>
          </div>
        }
      >
        <ClientChart
          type="line"
          height={260}
          data={{
            labels: heatmapWeeks,
            datasets: [
              {
                label: 'Members at 4+ emails/wk',
                data: heatmapBuckets[4].data,
                borderColor: C.red,
                backgroundColor: C.red + '15',
                fill: true,
                tension: 0.4,
                borderWidth: 2.5,
                pointRadius: 5,
                pointBackgroundColor: C.red,
                pointBorderColor: 'var(--card)',
                pointBorderWidth: 2,
              },
              {
                label: 'Members at 3 emails/wk',
                data: heatmapBuckets[3].data,
                borderColor: C.orange,
                backgroundColor: C.orange + '10',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: C.orange,
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
              y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
              x: { grid: { display: false }, ticks: { color: '#8899aa' } },
            },
          }}
        />
      </Card>

      {/* ── 7. How FatigueShield Works ────────────────────────── */}
      <Card
        title="How FatigueShield Works"
        subtitle="Cross-channel frequency intelligence"
        className="mb-8"
        detailTitle="FatigueShield Algorithm"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              FatigueShield aggregates send data from all email platforms (MEMTrak, Higher Logic, Outlook)
              to build a unified per-member frequency profile. Unlike platform-specific caps, it sees the
              total picture across every channel.
            </p>
            {[
              { step: '1. Cross-Channel Aggregation', desc: 'Every send across MEMTrak, Higher Logic, and Outlook is tracked per-member. No email slips through the gaps between platforms.' },
              { step: '2. Dynamic Threshold Calculation', desc: 'Each member gets a personalized threshold based on their engagement history. Active openers tolerate more; inactive members get lower caps.' },
              { step: '3. Fatigue Risk Scoring', desc: 'As a member approaches their threshold, a fatigue risk score is calculated factoring in recency, channel overlap, and content similarity.' },
              { step: '4. Smart Suppression', desc: 'When risk exceeds 70%, FatigueShield recommends suppressing the lowest-priority upcoming send. Campaign importance is preserved; fatigue is prevented.' },
              { step: '5. Outcome Tracking', desc: 'Every suppression is tracked. Prevented unsubscribes are measured by comparing suppressed cohorts against similar non-suppressed members.' },
            ].map(s => (
              <div key={s.step} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--heading)' }}>{s.step}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          {[
            { icon: Eye, title: 'Monitors all channels in real-time', desc: 'MEMTrak + Higher Logic + Outlook unified view' },
            { icon: Clock, title: 'Rolling 7-day frequency tracking', desc: 'Dynamic window accounts for send clustering' },
            { icon: Bell, title: 'Personalized thresholds per member', desc: 'Active members tolerate more; at-risk get lower caps' },
            { icon: Zap, title: 'Auto-suppresses lowest-priority sends', desc: 'Newsletters deferred before compliance or renewal' },
            { icon: Heart, title: 'Measures prevented unsubscribes', desc: 'Cohort comparison validates every suppression' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-3">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.15)' }}
              >
                <item.icon className="w-3.5 h-3.5" style={{ color: C.teal }} />
              </div>
              <div>
                <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{item.title}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Member Detail Modal ── */}
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
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedMember.name}</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedMember.org} &middot; {selectedMember.type}</p>
              </div>
              <button onClick={() => setSelectedMember(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-xl font-extrabold" style={{ color: selectedMember.emailsThisWeek > selectedMember.threshold ? C.red : 'var(--heading)' }}>{selectedMember.emailsThisWeek}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Emails This Week</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-xl font-extrabold" style={{ color: 'var(--heading)' }}>{selectedMember.threshold}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Threshold</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-xl font-extrabold" style={{ color: riskConfig[selectedMember.risk].color }}>{selectedMember.fatiguePct}%</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Fatigue Score</div>
                </div>
              </div>

              <div>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Channel Breakdown</div>
                <div className="space-y-2">
                  {[
                    { label: 'MEMTrak', count: selectedMember.channels.memtrak, color: C.blue },
                    { label: 'Higher Logic', count: selectedMember.channels.higherLogic, color: C.green },
                    { label: 'Outlook', count: selectedMember.channels.outlook, color: C.purple },
                  ].map(ch => (
                    <div key={ch.label} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                      <span className="text-[10px] font-semibold" style={{ color: 'var(--heading)' }}>{ch.label}</span>
                      <div className="flex items-center gap-2">
                        <MiniBar value={ch.count} max={selectedMember.emailsThisWeek} color={ch.color} height={4} />
                        <span className="text-[10px] font-bold w-4 text-right" style={{ color: ch.color }}>{ch.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMember.lastUnsubAction && (
                <div className="p-3 rounded-lg" style={{ background: 'rgba(217,74,74,0.06)', border: '1px solid rgba(217,74,74,0.15)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" style={{ color: C.red }} />
                    <span className="text-[10px] font-bold" style={{ color: C.red }}>Fatigue Signal Detected</span>
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedMember.lastUnsubAction}</p>
                </div>
              )}

              <div className="p-3 rounded-lg" style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: C.teal }}>Recommendation</div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {selectedMember.risk === 'Critical' || selectedMember.risk === 'High'
                    ? 'Suppress all non-essential sends for the remainder of this week. Prioritize compliance and renewal emails only.'
                    : selectedMember.risk === 'Medium'
                      ? 'Monitor closely. Consider deferring newsletter sends to next week if additional campaigns are scheduled.'
                      : 'No action needed. Member is well within their fatigue threshold.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Suppression Confirmation Modal ── */}
      {showSuppressionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowSuppressionModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border p-6"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(140,198,63,0.15)' }}>
                <ShieldAlert className="w-5 h-5" style={{ color: C.green }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Apply Suppressions</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{suppressionRecs.length} sends will be suppressed</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {suppressionRecs.map((rec, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg text-[10px]" style={{ background: 'var(--input-bg)' }}>
                  <span style={{ color: 'var(--heading)' }}>{rec.suppress}</span>
                  <span style={{ color: C.red }}>{rec.member}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSuppressionModal(false)}
                className="flex-1 py-2 rounded-lg text-[10px] font-bold"
                style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSuppressionModal(false)}
                className="flex-1 py-2 rounded-lg text-[10px] font-bold transition-all hover:scale-[1.02]"
                style={{ background: C.green, color: '#fff' }}
              >
                Confirm Suppressions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(20,184,166,0.08)', color: C.teal, border: '1px solid rgba(20,184,166,0.15)' }}
        >
          <ShieldAlert className="w-3 h-3" />
          FatigueShield&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
