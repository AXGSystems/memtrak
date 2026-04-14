'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { MiniBar } from '@/components/SparkKpi';
import {
  Trophy,
  Star,
  Flame,
  Users,
  Award,
  Zap,
  Crown,
  Target,
  ChevronRight,
  Gift,
  MousePointerClick,
  Mail,
  Calendar,
  MessageSquare,
  Share2,
} from 'lucide-react';

const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  gold: '#D4A017',
  silver: '#94a3b8',
  bronze: '#CD7F32',
  platinum: '#E5E4E2',
};

/* ── Point System Configuration ───────────────────── */
const pointRules = [
  { action: 'Email Open', icon: Mail, points: 1, color: C.blue, description: 'Any tracked email open' },
  { action: 'Link Click', icon: MousePointerClick, points: 5, color: C.green, description: 'Click any tracked link' },
  { action: 'Event Attendance', icon: Calendar, points: 20, color: C.purple, description: 'Attend webinar, summit, or EDge session' },
  { action: 'Email Reply', icon: MessageSquare, points: 10, color: C.orange, description: 'Reply to staff outreach or survey' },
  { action: 'Member Referral', icon: Share2, points: 50, color: C.gold, description: 'Refer a new member who joins' },
];

/* ── Member Leaderboard ───────────────────────────── */
const leaderboard = [
  { rank: 1, name: 'Sarah Chen', org: 'Lone Star Title Co.', type: 'ACA', points: 2840, tier: 'Platinum' as const, streak: 18, badges: 8 },
  { rank: 2, name: 'Marcus Rivera', org: 'Gulf Coast Abstract', type: 'ACB', points: 2415, tier: 'Platinum' as const, streak: 14, badges: 7 },
  { rank: 3, name: 'Jennifer Walsh', org: 'First American Title', type: 'ACU', points: 2180, tier: 'Gold' as const, streak: 12, badges: 6 },
  { rank: 4, name: 'David Kim', org: 'Chicago Title Insurance', type: 'ACU', points: 1920, tier: 'Gold' as const, streak: 11, badges: 6 },
  { rank: 5, name: 'Amanda Foster', org: 'Heritage Abstract LLC', type: 'ACB', points: 1745, tier: 'Gold' as const, streak: 9, badges: 5 },
  { rank: 6, name: 'Robert Turner', org: 'National Title Services', type: 'REA', points: 1580, tier: 'Silver' as const, streak: 8, badges: 5 },
  { rank: 7, name: 'Lisa Park', org: 'Liberty Title Group', type: 'ACA', points: 1390, tier: 'Silver' as const, streak: 6, badges: 4 },
  { rank: 8, name: 'Michael Adams', org: 'Commonwealth Land Title', type: 'ACA', points: 1210, tier: 'Silver' as const, streak: 5, badges: 4 },
  { rank: 9, name: 'Karen Phillips', org: 'Stewart Title Guaranty', type: 'ACU', points: 980, tier: 'Bronze' as const, streak: 3, badges: 3 },
  { rank: 10, name: 'James Wilson', org: 'Old Republic Title', type: 'ACU', points: 820, tier: 'Bronze' as const, streak: 2, badges: 2 },
];

const tierColors: Record<string, string> = {
  Platinum: C.platinum,
  Gold: C.gold,
  Silver: C.silver,
  Bronze: C.bronze,
};

/* ── Badge Gallery ────────────────────────────────── */
const badges = [
  { name: 'First Open', icon: Mail, description: 'Opened your first MEMTrak email', color: C.blue, earned: 3842 },
  { name: 'Power Clicker', icon: MousePointerClick, description: 'Clicked 50+ links in a quarter', color: C.green, earned: 612 },
  { name: 'Event Champion', icon: Calendar, description: 'Attended 5+ events in a year', color: C.purple, earned: 284 },
  { name: 'Renewal Hero', icon: Star, description: 'Renewed membership within 7 days of notice', color: C.gold, earned: 1560 },
  { name: 'Community Builder', icon: Share2, description: 'Referred 3+ new members', color: C.orange, earned: 89 },
  { name: 'Streak Master', icon: Flame, description: 'Maintained 10+ week engagement streak', color: C.red, earned: 156 },
];

/* ── Tier System ──────────────────────────────────── */
const tiers = [
  { name: 'Bronze', range: '0-499 pts', color: C.bronze, icon: Award, members: 2180, benefits: ['Member directory listing', 'Standard newsletter', 'Basic event access'] },
  { name: 'Silver', range: '500-1,499 pts', color: C.silver, icon: Award, members: 1420, benefits: ['Priority event registration', 'Quarterly insights report', 'Networking mixer invites'] },
  { name: 'Gold', range: '1,500-2,499 pts', color: C.gold, icon: Crown, members: 380, benefits: ['VIP event seating', 'Monthly strategy briefing', 'Committee nomination eligibility', 'Speaker opportunity'] },
  { name: 'Platinum', range: '2,500+ pts', color: C.platinum, icon: Trophy, members: 62, benefits: ['Board meeting observer access', 'CEO direct line', 'ALTA ONE VIP package', 'Annual recognition award', 'Complimentary webinar series'] },
];

/* ── Streak data for chart ────────────────────────── */
const streakDistribution = [
  { weeks: '1-2', count: 1200 },
  { weeks: '3-4', count: 890 },
  { weeks: '5-8', count: 620 },
  { weeks: '9-12', count: 340 },
  { weeks: '13-16', count: 180 },
  { weeks: '17-20', count: 92 },
  { weeks: '21+', count: 48 },
];

export default function EngagePoints() {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const maxPoints = leaderboard[0].points;

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(212,160,23,0.2) 0%, rgba(168,85,247,0.2) 100%)',
              border: '1px solid rgba(212,160,23,0.3)',
            }}
          >
            <Trophy className="w-5 h-5" style={{ color: C.gold }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              EngagePoints<span style={{ color: C.gold, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.gold }}>
              Turn engagement into a game worth playing.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Gamified engagement platform that rewards members for every meaningful interaction. Points, badges,
          streaks, and tier levels transform passive members into active participants. Every open, click,
          event attendance, and referral earns progress toward exclusive benefits.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Members Enrolled"
          value="4,042"
          sub="81% of active membership"
          icon={Users}
          color={C.blue}
          sparkData={[3200, 3400, 3550, 3680, 3790, 3920, 4042]}
          sparkColor={C.blue}
          trend={{ value: 8.4, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Total Points Earned"
          value="1.2M"
          sub="This quarter"
          icon={Star}
          color={C.gold}
          sparkData={[180000, 220000, 280000, 310000, 350000, 390000, 420000]}
          sparkColor={C.gold}
          trend={{ value: 22.6, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                1.2 million points earned across all members this quarter. Breakdown by action type:
              </p>
              {pointRules.map((r) => (
                <div key={r.action} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center gap-2">
                    <r.icon className="w-3.5 h-3.5" style={{ color: r.color }} />
                    <span style={{ color: 'var(--heading)' }}>{r.action}</span>
                  </div>
                  <span className="font-bold" style={{ color: r.color }}>{r.points} pts each</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Active Streaks"
          value="3,370"
          sub="Members with 1+ week streak"
          icon={Flame}
          color={C.orange}
          sparkData={[2800, 2900, 3050, 3120, 3200, 3280, 3370]}
          sparkColor={C.orange}
          trend={{ value: 5.8, label: 'vs last month' }}
          accent
        />
        <SparkKpi
          label="Badges Awarded"
          value="6,543"
          sub="Across 6 badge types"
          icon={Award}
          color={C.purple}
          sparkData={[4200, 4600, 5000, 5400, 5800, 6200, 6543]}
          sparkColor={C.purple}
          trend={{ value: 18.2, label: 'vs last quarter' }}
          accent
        />
      </div>

      {/* ── 3. Point System + Leaderboard ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Point Rules */}
        <Card
          title="Point System"
          subtitle="How members earn points"
          detailTitle="Point Rules Configuration"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Points are awarded automatically when tracked actions occur. Higher-value actions like
                referrals and event attendance earn more points to incentivize deeper engagement.
              </p>
              {pointRules.map((r) => (
                <div key={r.action} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <r.icon className="w-4 h-4" style={{ color: r.color }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{r.action}</span>
                    </div>
                    <span className="text-sm font-extrabold" style={{ color: r.color }}>+{r.points} pts</span>
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.description}</p>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-2.5">
            {pointRules.map((r) => (
              <div key={r.action} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                  style={{ background: r.color + '15', border: `1px solid ${r.color}30` }}
                >
                  <r.icon className="w-3.5 h-3.5" style={{ color: r.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{r.action}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{r.description}</div>
                </div>
                <div className="text-sm font-extrabold flex-shrink-0" style={{ color: r.color }}>
                  +{r.points}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <Card
            title="Member Leaderboard"
            subtitle="Top 10 by total engagement points"
            detailTitle="Full Leaderboard"
            detailContent={
              <div className="space-y-2">
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  Top 10 members ranked by total accumulated engagement points. Platinum members
                  receive exclusive benefits including CEO direct line and ALTA ONE VIP packages.
                </p>
                {leaderboard.map((m) => (
                  <div key={m.rank} className="flex items-center gap-3 p-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)' }}>
                    <span className="w-5 text-center font-extrabold" style={{ color: m.rank <= 3 ? C.gold : 'var(--text-muted)' }}>
                      {m.rank}
                    </span>
                    <div className="flex-1">
                      <span className="font-bold" style={{ color: 'var(--heading)' }}>{m.name}</span>
                      <span className="ml-1" style={{ color: 'var(--text-muted)' }}>({m.org})</span>
                    </div>
                    <span className="font-bold" style={{ color: tierColors[m.tier] }}>{m.points.toLocaleString()} pts</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: tierColors[m.tier] + '20', color: tierColors[m.tier] }}>
                      {m.tier}
                    </span>
                  </div>
                ))}
              </div>
            }
          >
            <div className="space-y-2">
              {leaderboard.map((m) => (
                <div
                  key={m.rank}
                  className="flex items-center gap-3 p-2 rounded-lg transition-all duration-200"
                  style={{ background: m.rank <= 3 ? 'rgba(212,160,23,0.04)' : 'transparent' }}
                >
                  {/* Rank */}
                  <div className="w-6 text-center">
                    {m.rank <= 3 ? (
                      <Trophy className="w-4 h-4 mx-auto" style={{ color: m.rank === 1 ? C.gold : m.rank === 2 ? C.silver : C.bronze }} />
                    ) : (
                      <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>{m.rank}</span>
                    )}
                  </div>

                  {/* Member */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold truncate" style={{ color: 'var(--heading)' }}>
                      {m.name}
                    </div>
                    <div className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {m.org}
                      <span className="ml-1 font-bold" style={{ color: tierColors[m.tier] }}>{m.type}</span>
                    </div>
                  </div>

                  {/* Points bar */}
                  <div className="w-24 hidden md:block">
                    <MiniBar value={m.points} max={maxPoints} color={tierColors[m.tier]} height={4} />
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-extrabold" style={{ color: tierColors[m.tier] }}>
                      {m.points.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" style={{ color: C.orange }} />
                        <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{m.streak}w</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Award className="w-2.5 h-2.5" style={{ color: C.purple }} />
                        <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{m.badges}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── 4. Badge Gallery ──────────────────────────────────── */}
      <Card
        title="Badge Gallery"
        subtitle="Achievements members can earn"
        className="mb-8"
        detailTitle="Badge Details"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Badges are permanent achievements that recognize specific engagement milestones.
              Each badge is awarded automatically when the criteria are met.
            </p>
            {badges.map((b) => (
              <div key={b.name} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <b.icon className="w-4 h-4" style={{ color: b.color }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{b.name}</span>
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{b.earned.toLocaleString()} earned</span>
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{b.description}</p>
              </div>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {badges.map((b) => (
            <div
              key={b.name}
              className="rounded-xl p-4 text-center transition-all duration-200 hover:translate-y-[-2px] cursor-pointer"
              style={{
                background: selectedBadge === b.name ? b.color + '15' : 'var(--input-bg)',
                border: `1px solid ${selectedBadge === b.name ? b.color + '40' : 'transparent'}`,
              }}
              onClick={() => setSelectedBadge(selectedBadge === b.name ? null : b.name)}
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-2"
                style={{ background: b.color + '20', border: `2px solid ${b.color}40` }}
              >
                <b.icon className="w-5 h-5" style={{ color: b.color }} />
              </div>
              <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{b.name}</div>
              <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{b.description}</div>
              <div className="text-[9px] font-bold mt-1.5" style={{ color: b.color }}>
                {b.earned.toLocaleString()} earned
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 5. Streak Tracking + Tier System ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Streak Distribution */}
        <Card
          title="Streak Distribution"
          subtitle="Consecutive weeks of engagement activity"
          detailTitle="Streak Analytics"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Streaks track consecutive weeks where a member has at least one qualifying engagement action.
                Longer streaks correlate strongly with renewal rates: members with 10+ week streaks renew at 97%.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-lg font-extrabold" style={{ color: C.green }}>97%</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Renewal rate (10+ weeks)</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-lg font-extrabold" style={{ color: C.orange }}>72%</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Renewal rate (0 streak)</div>
                </div>
              </div>
            </div>
          }
        >
          <ClientChart
            type="bar"
            height={240}
            data={{
              labels: streakDistribution.map((s) => s.weeks + ' wk'),
              datasets: [
                {
                  label: 'Members',
                  data: streakDistribution.map((s) => s.count),
                  backgroundColor: streakDistribution.map((_, i) => {
                    const colors = [C.blue + '60', C.blue + '70', C.green + '70', C.green + '80', C.gold + '80', C.orange + '80', C.red + '80'];
                    return colors[i];
                  }),
                  borderColor: streakDistribution.map((_, i) => {
                    const colors = [C.blue, C.blue, C.green, C.green, C.gold, C.orange, C.red];
                    return colors[i];
                  }),
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

        {/* Tier System */}
        <Card
          title="Tier System"
          subtitle="Benefits unlock at each engagement level"
          detailTitle="Tier Benefits Detail"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                The tier system rewards sustained engagement with increasingly valuable benefits.
                Members are notified when they approach a new tier and when they achieve it.
              </p>
              {tiers.map((t) => (
                <div key={t.name} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <t.icon className="w-4 h-4" style={{ color: t.color }} />
                      <span className="text-xs font-bold" style={{ color: t.color }}>{t.name}</span>
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{t.range}</span>
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{t.members.toLocaleString()} members</span>
                  </div>
                  <ul className="space-y-0.5">
                    {t.benefits.map((b) => (
                      <li key={b} className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: t.color }}>&#8226;</span> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className="rounded-xl p-4 transition-all duration-200"
                style={{
                  background: t.color + '08',
                  border: `1px solid ${t.color}20`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <t.icon className="w-5 h-5" style={{ color: t.color }} />
                    <div>
                      <span className="text-sm font-extrabold" style={{ color: t.color }}>{t.name}</span>
                      <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>{t.range}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold" style={{ color: 'var(--heading)' }}>
                      {t.members.toLocaleString()}
                    </div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>members</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {t.benefits.map((b) => (
                    <span
                      key={b}
                      className="text-[8px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: t.color + '15', color: t.color }}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 6. Points Earned by Action (Chart) ────────────────── */}
      <Card
        title="Points Distribution by Action"
        subtitle="Where members are earning their engagement points"
        className="mb-8"
        detailTitle="Points Breakdown"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Email opens generate the most total points due to volume, but referrals and events
              generate the highest per-member point value. Consider increasing event point values
              to further incentivize attendance.
            </p>
          </div>
        }
      >
        <ClientChart
          type="doughnut"
          height={280}
          data={{
            labels: ['Email Opens', 'Link Clicks', 'Event Attendance', 'Email Replies', 'Referrals'],
            datasets: [
              {
                data: [420000, 310000, 240000, 150000, 80000],
                backgroundColor: [C.blue + '80', C.green + '80', C.purple + '80', C.orange + '80', C.gold + '80'],
                borderColor: [C.blue, C.green, C.purple, C.orange, C.gold],
                borderWidth: 2,
              },
            ],
          }}
        />
      </Card>

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(212,160,23,0.08)',
            color: C.gold,
            border: '1px solid rgba(212,160,23,0.15)',
          }}
        >
          <Trophy className="w-3 h-3" />
          EngagePoints&trade; is a MEMTrak engagement feature
        </span>
      </div>
    </div>
  );
}
