'use client';

import { useState, useMemo } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import PulsingMeter from '@/components/PulsingMeter';
import AnimatedCounter from '@/components/AnimatedCounter';
import {
  Target, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2,
  Clock, BarChart3, Zap, Flag, ChevronUp, ChevronDown, X,
  Mail, MousePointerClick, AlertOctagon, DollarSign, Users,
  ListPlus, Star, UserCheck,
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

/* ── goal data ────────────────────────────────────────────── */
interface Goal {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  target: number;
  current: number;
  unit: string;
  prefix?: string;
  suffix?: string;
  inverse?: boolean; // lower is better (e.g. bounce rate)
  daysRemaining: number;
  sparkData: number[];
  monthlyProgress: number[]; // 4 months of progress toward goal
}

const goals: Goal[] = [
  {
    id: 'open-rate', label: 'Open Rate', icon: Mail,
    target: 45, current: 40.4, unit: '%', suffix: '%',
    daysRemaining: 77, sparkData: [36, 37, 38, 39, 40, 40.4],
    monthlyProgress: [82, 85, 88, 89.8],
  },
  {
    id: 'click-rate', label: 'Click Rate', icon: MousePointerClick,
    target: 15, current: 12.6, unit: '%', suffix: '%',
    daysRemaining: 77, sparkData: [10, 10.5, 11, 11.8, 12.2, 12.6],
    monthlyProgress: [66, 72, 78, 84],
  },
  {
    id: 'bounce-rate', label: 'Bounce Rate', icon: AlertOctagon,
    target: 2, current: 3.7, unit: '%', suffix: '%', inverse: true,
    daysRemaining: 77, sparkData: [5.2, 4.8, 4.4, 4.1, 3.9, 3.7],
    monthlyProgress: [38, 48, 55, 54],
  },
  {
    id: 'revenue', label: 'Revenue', icon: DollarSign,
    target: 800000, current: 673024, unit: '$', prefix: '$',
    daysRemaining: 261, sparkData: [180, 320, 480, 560, 620, 673],
    monthlyProgress: [22, 40, 60, 84.1],
  },
  {
    id: 'retention', label: 'New Members Retained', icon: UserCheck,
    target: 85, current: 76, unit: '%', suffix: '%',
    daysRemaining: 261, sparkData: [68, 70, 72, 74, 75, 76],
    monthlyProgress: [80, 82, 86, 89.4],
  },
  {
    id: 'list-growth', label: 'List Growth', icon: ListPlus,
    target: 5, current: 2.4, unit: '%', suffix: '%',
    daysRemaining: 261, sparkData: [0.5, 1.0, 1.4, 1.8, 2.1, 2.4],
    monthlyProgress: [10, 20, 36, 48],
  },
  {
    id: 'nps', label: 'NPS Score', icon: Star,
    target: 75, current: 68, unit: 'pts',
    daysRemaining: 261, sparkData: [58, 60, 63, 65, 67, 68],
    monthlyProgress: [77, 80, 88, 90.7],
  },
  {
    id: 'staff-outreach', label: 'Staff Outreach', icon: Users,
    target: 100, current: 82, unit: '/week',
    daysRemaining: 7, sparkData: [65, 70, 74, 78, 80, 82],
    monthlyProgress: [65, 70, 78, 82],
  },
];

function getGoalPct(g: Goal): number {
  if (g.inverse) {
    // For inverse goals: if current <= target, 100%. Otherwise scale.
    if (g.current <= g.target) return 100;
    // e.g. target 2%, current 3.7% — how far are we from start (say 6%) to target?
    const worstCase = g.sparkData[0] || g.current * 1.5;
    return Math.max(0, Math.min(100, ((worstCase - g.current) / (worstCase - g.target)) * 100));
  }
  return Math.min(100, (g.current / g.target) * 100);
}

function getGoalStatus(pct: number): { label: string; color: string } {
  if (pct >= 90) return { label: 'On Track', color: C.green };
  if (pct >= 70) return { label: 'At Risk', color: C.amber };
  return { label: 'Behind', color: C.red };
}

export default function GoalTracker() {
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);

  const overallScore = useMemo(() => {
    const pcts = goals.map(g => getGoalPct(g));
    return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
  }, []);

  const onTrack = goals.filter(g => getGoalPct(g) >= 90).length;
  const atRisk = goals.filter(g => { const p = getGoalPct(g); return p >= 70 && p < 90; }).length;
  const behind = goals.filter(g => getGoalPct(g) < 70).length;

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
            <Target className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>GoalTracker&#8482;</h1>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Set it. Track it. Hit it.</p>
      </div>

      {/* ── Overall Achievement ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Overall Goal Achievement" subtitle="Weighted average across all 8 goals">
          <div className="flex flex-col items-center py-4">
            <AnimatedCounter value={overallScore} suffix="%" className="text-5xl" color={overallScore >= 80 ? C.green : overallScore >= 60 ? C.amber : C.red} />
            <div className="text-[10px] font-bold mt-2" style={{ color: 'var(--text-muted)' }}>of targets achieved</div>
          </div>
        </Card>
        <Card title="Goal Status Summary" subtitle="Breakdown by status">
          <div className="grid grid-cols-3 gap-3 py-2">
            <div className="text-center p-3 rounded-xl" style={{ background: `color-mix(in srgb, ${C.green} 10%, transparent)` }}>
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1" style={{ color: C.green }} />
              <div className="text-xl font-extrabold" style={{ color: C.green }}>{onTrack}</div>
              <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>On Track</div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: `color-mix(in srgb, ${C.amber} 10%, transparent)` }}>
              <AlertTriangle className="w-5 h-5 mx-auto mb-1" style={{ color: C.amber }} />
              <div className="text-xl font-extrabold" style={{ color: C.amber }}>{atRisk}</div>
              <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>At Risk</div>
            </div>
            <div className="text-center p-3 rounded-xl" style={{ background: `color-mix(in srgb, ${C.red} 10%, transparent)` }}>
              <TrendingDown className="w-5 h-5 mx-auto mb-1" style={{ color: C.red }} />
              <div className="text-xl font-extrabold" style={{ color: C.red }}>{behind}</div>
              <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>Behind</div>
            </div>
          </div>
        </Card>
        <Card title="Critical Goals" subtitle="Goals behind schedule needing attention">
          <div className="flex flex-col items-center py-2">
            {goals.filter(g => getGoalPct(g) < 70).length > 0 ? (
              <PulsingMeter
                value={Math.round(goals.filter(g => getGoalPct(g) < 70).reduce((a, g) => a + getGoalPct(g), 0) / Math.max(1, goals.filter(g => getGoalPct(g) < 70).length))}
                label="Avg Progress"
                color={C.red}
                size="md"
              />
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2" style={{ color: C.green }} />
                <div className="text-xs font-bold" style={{ color: C.green }}>All goals on track!</div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Goal Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {goals.map((g) => {
          const pct = getGoalPct(g);
          const status = getGoalStatus(pct);
          const trendVal = g.sparkData.length >= 2 ? +(g.sparkData[g.sparkData.length - 1] - g.sparkData[g.sparkData.length - 2]).toFixed(1) : 0;
          const TrendIcon = g.inverse
            ? (trendVal < 0 ? TrendingUp : trendVal > 0 ? TrendingDown : Minus)
            : (trendVal > 0 ? TrendingUp : trendVal < 0 ? TrendingDown : Minus);
          const trendColor = g.inverse
            ? (trendVal < 0 ? C.green : trendVal > 0 ? C.red : 'var(--text-muted)')
            : (trendVal > 0 ? C.green : trendVal < 0 ? C.red : 'var(--text-muted)');

          return (
            <div
              key={g.id}
              onClick={() => setDetailGoal(g)}
              className="rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:translate-y-[-2px]"
              style={{
                background: 'var(--card)', borderColor: 'var(--card-border)',
                borderLeftWidth: '4px', borderLeftColor: status.color,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              {/* Top: label + status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <g.icon className="w-4 h-4" style={{ color: status.color }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{g.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] uppercase font-bold px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${status.color} 15%, transparent)`, color: status.color }}>
                    {status.label}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <Clock className="w-3 h-3 inline mr-0.5" />{g.daysRemaining}d left
                  </span>
                </div>
              </div>

              {/* Middle: current vs target */}
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-2xl font-extrabold" style={{ color: 'var(--heading)' }}>
                    {g.prefix || ''}{typeof g.current === 'number' && g.current >= 1000 ? g.current.toLocaleString() : g.current}{g.suffix || ''}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    Target: {g.prefix || ''}{typeof g.target === 'number' && g.target >= 1000 ? g.target.toLocaleString() : g.target}{g.suffix || ''}{g.inverse ? ' or less' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold" style={{ color: status.color }}>{pct.toFixed(1)}%</div>
                  <div className="flex items-center gap-1 justify-end">
                    <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
                    <span className="text-[10px] font-bold" style={{ color: trendColor }}>
                      {trendVal > 0 ? '+' : ''}{trendVal}{g.suffix || ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full rounded-full overflow-hidden mb-1" style={{ height: 8, background: 'var(--card-border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    background: `linear-gradient(90deg, ${status.color}, color-mix(in srgb, ${status.color} 70%, transparent))`,
                    boxShadow: `0 0 8px color-mix(in srgb, ${status.color} 40%, transparent)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px]" style={{ color: 'var(--text-muted)' }}>
                <span>0%</span>
                <span>{pct.toFixed(1)}% of goal</span>
                <span>100%</span>
              </div>

              {/* Pulsing meter for behind-schedule goals */}
              {pct < 70 && (
                <div className="flex items-center gap-2 mt-3 p-2 rounded-lg" style={{ background: `color-mix(in srgb, ${C.red} 8%, transparent)` }}>
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.red }} />
                  <span className="text-[10px] font-semibold" style={{ color: C.red }}>
                    Needs {g.inverse ? 'a' : 'an'} additional {g.inverse ? (g.current - g.target).toFixed(1) : (g.target - g.current).toLocaleString()}{g.suffix || ''} {g.inverse ? 'reduction' : 'increase'} to hit target
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Progress Over Time Chart ─────────────────────────── */}
      <Card title="Goal Progress Over Time" subtitle="4-month achievement trajectory across all goals">
        <ClientChart
          type="line"
          height={280}
          data={{
            labels: ['January', 'February', 'March', 'April'],
            datasets: [
              { label: 'Open Rate', data: goals[0].monthlyProgress, borderColor: C.blue, backgroundColor: 'transparent', tension: 0.4, pointRadius: 4, borderWidth: 2, pointBackgroundColor: C.blue },
              { label: 'Revenue', data: goals[3].monthlyProgress, borderColor: C.green, backgroundColor: 'transparent', tension: 0.4, pointRadius: 4, borderWidth: 2, pointBackgroundColor: C.green },
              { label: 'Retention', data: goals[4].monthlyProgress, borderColor: C.purple, backgroundColor: 'transparent', tension: 0.4, pointRadius: 4, borderWidth: 2, pointBackgroundColor: C.purple },
              { label: 'NPS Score', data: goals[6].monthlyProgress, borderColor: C.teal, backgroundColor: 'transparent', tension: 0.4, pointRadius: 4, borderWidth: 2, pointBackgroundColor: C.teal },
              {
                label: '100% Target',
                data: [100, 100, 100, 100],
                borderColor: 'rgba(255,255,255,0.15)',
                borderDash: [6, 4],
                backgroundColor: 'transparent',
                tension: 0,
                pointRadius: 0,
                borderWidth: 1,
              },
            ],
          }}
          options={{
            plugins: { legend: { display: true, position: 'bottom' as const, labels: { color: 'var(--text-muted)', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 10 } } } },
            scales: {
              y: { min: 0, max: 110, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => v + '%' } },
              x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } },
            },
          }}
        />
      </Card>

      {/* ── Detail Modal ─────────────────────────────────────── */}
      {detailGoal && (() => {
        const g = detailGoal;
        const pct = getGoalPct(g);
        const status = getGoalStatus(pct);
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setDetailGoal(null)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border"
              style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-center gap-2">
                  <g.icon className="w-4 h-4" style={{ color: status.color }} />
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{g.label}</h3>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Goal detail breakdown</span>
                  </div>
                </div>
                <button onClick={() => setDetailGoal(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-extrabold" style={{ color: 'var(--heading)' }}>
                      {g.prefix || ''}{typeof g.current === 'number' && g.current >= 1000 ? g.current.toLocaleString() : g.current}{g.suffix || ''}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Target: {g.prefix || ''}{typeof g.target === 'number' && g.target >= 1000 ? g.target.toLocaleString() : g.target}{g.suffix || ''}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-extrabold" style={{ color: status.color }}>{pct.toFixed(1)}%</div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${status.color} 15%, transparent)`, color: status.color }}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full rounded-full overflow-hidden" style={{ height: 10, background: 'var(--card-border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: status.color, boxShadow: `0 0 12px color-mix(in srgb, ${status.color} 40%, transparent)` }} />
                </div>

                {/* Monthly trend */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Monthly Progress</div>
                  <div className="grid grid-cols-4 gap-2">
                    {['Jan', 'Feb', 'Mar', 'Apr'].map((mo, i) => (
                      <div key={mo} className="text-center p-2 rounded-lg" style={{ background: 'var(--background)' }}>
                        <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{mo}</div>
                        <div className="text-sm font-extrabold" style={{ color: g.monthlyProgress[i] >= 90 ? C.green : g.monthlyProgress[i] >= 70 ? C.amber : C.red }}>
                          {g.monthlyProgress[i]}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  {g.daysRemaining} days remaining in period
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
