'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { demoSendTimes } from '@/lib/demo-data';
import {
  Brain,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
  Zap,
  Target,
  Eye,
  Globe,
  RefreshCw,
  Layers,
  Award,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';

/* ── palette ───────────────────────────────────────────────── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F5C542',
  navy: '#002D5C',
  purple: '#a855f7',
  cyan: '#06b6d4',
};

/* ── synthetic heatmap data: 7 days x 24 hours ──────────── */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function generateHeatmapData(): number[][] {
  return DAYS.map((day, di) => {
    const isWeekend = di >= 5;
    return HOURS.map((hour) => {
      if (isWeekend) {
        // Weekend: low overall, small bump 9-11 AM
        if (hour >= 9 && hour <= 11) return 15 + Math.random() * 10;
        if (hour >= 6 && hour <= 14) return 5 + Math.random() * 8;
        return 1 + Math.random() * 4;
      }
      // Weekday peaks
      if (hour >= 7 && hour <= 9) return 55 + Math.random() * 35; // morning peak
      if (hour >= 10 && hour <= 11) return 30 + Math.random() * 20;
      if (hour >= 12 && hour <= 13) return 40 + Math.random() * 25; // lunch peak
      if (hour >= 14 && hour <= 16) return 20 + Math.random() * 15;
      if (hour >= 17 && hour <= 19) return 10 + Math.random() * 10;
      if (hour >= 5 && hour <= 6) return 8 + Math.random() * 10;
      return 1 + Math.random() * 5;
    });
  });
}

const heatmapData = generateHeatmapData();

/* ── individual vs segment comparison data ───────────────── */
const individualExamples = [
  {
    org: 'First American Title',
    type: 'ACU',
    segmentName: 'ACU Underwriters',
    segDay: 'Tuesday',
    segTime: '9:00 AM',
    segRate: 52,
    indDay: 'Monday',
    indTime: '8:15 AM',
    indRate: 92,
  },
  {
    org: 'Heritage Abstract LLC',
    type: 'ACB',
    segmentName: 'ACA Title Agents',
    segDay: 'Thursday',
    segTime: '7:30 AM',
    segRate: 38,
    indDay: 'Wednesday',
    indTime: '11:45 AM',
    indRate: 74,
  },
  {
    org: 'Liberty Title Group',
    type: 'ACA',
    segmentName: 'ACA Title Agents',
    segDay: 'Thursday',
    segTime: '7:30 AM',
    segRate: 38,
    indDay: 'Friday',
    indTime: '7:00 AM',
    indRate: 81,
  },
  {
    org: 'Commonwealth Land Title',
    type: 'ACA',
    segmentName: 'REA Attorneys',
    segDay: 'Wednesday',
    segTime: '12:00 PM',
    segRate: 41,
    indDay: 'Tuesday',
    indTime: '10:30 AM',
    indRate: 88,
  },
];

/* ── confidence level helper ─────────────────────────────── */
function getConfidence(sample: number): { label: string; color: string } {
  if (sample >= 1000) return { label: 'Very High', color: C.green };
  if (sample >= 200) return { label: 'High', color: C.blue };
  if (sample >= 50) return { label: 'Medium', color: C.amber };
  return { label: 'Low', color: C.orange };
}

/* ── heatmap color interpolation ─────────────────────────── */
function heatColor(value: number): string {
  const max = 90;
  const ratio = Math.min(value / max, 1);
  if (ratio < 0.15) return 'rgba(74,144,217,0.06)';
  if (ratio < 0.3) return 'rgba(74,144,217,0.15)';
  if (ratio < 0.45) return 'rgba(74,144,217,0.3)';
  if (ratio < 0.6) return 'rgba(140,198,63,0.35)';
  if (ratio < 0.75) return 'rgba(140,198,63,0.55)';
  if (ratio < 0.85) return 'rgba(140,198,63,0.75)';
  return 'rgba(140,198,63,0.92)';
}

function formatHour(h: number): string {
  if (h === 0) return '12a';
  if (h < 12) return `${h}a`;
  if (h === 12) return '12p';
  return `${h - 12}p`;
}

export default function SendBrain() {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number; value: number } | null>(null);

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(6,182,212,0.2) 100%)',
              border: '1px solid rgba(168,85,247,0.3)',
            }}
          >
            <Brain className="w-5 h-5" style={{ color: C.purple }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              SendBrain<span style={{ color: C.purple, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.cyan }}>
              Every email arrives when they&apos;re ready to read it.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          AI send-time optimization at the <strong style={{ color: 'var(--heading)' }}>individual</strong> level,
          not segment level. SendBrain learns from each recipient&apos;s historical open patterns and delivers
          email at the exact time that specific person is most likely to engage.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Members Profiled"
          value="4,994"
          sub="Individual time profiles built"
          icon={Users}
          color={C.purple}
          sparkData={[3200, 3600, 3900, 4200, 4500, 4750, 4994]}
          sparkColor={C.purple}
          trend={{ value: 8.2, label: 'vs last month' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                SendBrain has built individual send-time preference profiles for <strong style={{ color: 'var(--heading)' }}>4,994 members</strong> by
                analyzing historical open timestamps across all campaigns.
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex justify-between">
                    <span>Full profiles (10+ data points)</span>
                    <span style={{ color: C.green }}>4,345</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partial profiles (3-9 data points)</span>
                    <span style={{ color: C.amber }}>512</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Segment fallback (&lt;3 data points)</span>
                    <span style={{ color: C.orange }}>137</span>
                  </div>
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Avg Predicted Lift"
          value="+18.4%"
          sub="vs random send time"
          icon={TrendingUp}
          color={C.green}
          sparkData={[10, 12, 13, 14.5, 15.8, 17.1, 18.4]}
          sparkColor={C.green}
          trend={{ value: 3.1, label: 'improving' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Members receiving emails at their predicted optimal time show an average <strong style={{ color: C.green }}>18.4% higher open rate</strong> compared
                to a random send time within business hours.
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex justify-between">
                    <span>Top quartile lift</span>
                    <span style={{ color: C.green }}>+32.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Median lift</span>
                    <span style={{ color: C.blue }}>+18.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bottom quartile lift</span>
                    <span style={{ color: C.orange }}>+6.2%</span>
                  </div>
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Best Window Today"
          value="Tue 9 AM"
          sub="Largest segment peak"
          icon={Clock}
          color={C.cyan}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                For the largest single segment (ACA Title Agents, 4,200 members), the highest aggregate open
                probability today falls at <strong style={{ color: 'var(--heading)' }}>Tuesday 9:00 AM ET</strong>.
                However, individual optimization would spread delivery across 18 different time windows.
              </p>
            </div>
          }
        />
        <SparkKpi
          label="Optimization Coverage"
          value="87%"
          sub="Members with individual prediction"
          icon={Target}
          color={C.blue}
          sparkData={[68, 72, 75, 78, 81, 84, 87]}
          sparkColor={C.blue}
          trend={{ value: 5.4, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--heading)' }}>87%</strong> of members (4,345 of 4,994) have enough
                engagement data for SendBrain to make individual-level predictions. The remaining 13% fall back to
                segment-level optimization.
              </p>
              <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                <div className="h-full rounded-full" style={{ width: '87%', background: `linear-gradient(90deg, ${C.purple}, ${C.cyan})` }} />
              </div>
              <div className="flex justify-between text-[9px]" style={{ color: 'var(--text-muted)' }}>
                <span>4,345 individual</span>
                <span>649 segment fallback</span>
              </div>
            </div>
          }
        />
      </div>

      {/* ── 3. Send Time Heatmap ──────────────────────────────── */}
      <Card
        title="Aggregate Open Probability Heatmap"
        subtitle="Days of week x hours of day -- color intensity = open likelihood"
        className="mb-8"
        detailTitle="Open Probability Heatmap"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              This heatmap aggregates open timestamps across all 4,994 profiled members to show when ALTA members
              are most likely to engage with email. The brightest cells represent the highest open probability windows.
            </p>
            <div className="space-y-2">
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Peak Windows</div>
                <div className="text-[10px] space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <div>Mon-Fri 7:00-10:00 AM -- Morning email check (highest engagement)</div>
                  <div>Mon-Fri 12:00-1:00 PM -- Lunch break engagement</div>
                  <div>Tue &amp; Wed -- Strongest individual days</div>
                </div>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Low Windows</div>
                <div className="text-[10px] space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <div>Weekends -- 80% lower engagement than weekdays</div>
                  <div>Evenings after 7 PM -- Near-zero open rates</div>
                  <div>Early morning before 6 AM -- Minimal activity</div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        {/* Heatmap tooltip */}
        {hoveredCell && (
          <div
            className="fixed z-50 px-3 py-2 rounded-lg text-[10px] font-semibold pointer-events-none"
            style={{
              background: 'rgba(10, 22, 40, 0.95)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--heading)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {DAYS[hoveredCell.day]} {formatHour(hoveredCell.hour)} -- {Math.round(hoveredCell.value)}% open probability
          </div>
        )}

        <div className="overflow-x-auto">
          <div style={{ minWidth: '600px' }}>
            {/* Hour labels */}
            <div className="flex">
              <div style={{ width: '40px', flexShrink: 0 }} />
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="flex-1 text-center text-[8px] font-bold pb-1"
                  style={{ color: 'var(--text-muted)', minWidth: '20px' }}
                >
                  {h % 3 === 0 ? formatHour(h) : ''}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {DAYS.map((day, di) => (
              <div key={day} className="flex items-center gap-0">
                <div
                  className="text-[9px] font-bold text-right pr-2"
                  style={{ width: '40px', flexShrink: 0, color: 'var(--text-muted)' }}
                >
                  {day}
                </div>
                {HOURS.map((h) => {
                  const val = heatmapData[di][h];
                  return (
                    <div
                      key={h}
                      className="flex-1 transition-all duration-150"
                      style={{
                        minWidth: '20px',
                        height: '28px',
                        background: heatColor(val),
                        borderRadius: '3px',
                        margin: '1px',
                        cursor: 'crosshair',
                        border: hoveredCell?.day === di && hoveredCell?.hour === h
                          ? `1px solid ${C.purple}`
                          : '1px solid transparent',
                      }}
                      onMouseEnter={() => setHoveredCell({ day: di, hour: h, value: val })}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Low</span>
              {[0.06, 0.15, 0.3, 0.35, 0.55, 0.75, 0.92].map((opacity, i) => (
                <div
                  key={i}
                  style={{
                    width: '24px',
                    height: '12px',
                    borderRadius: '2px',
                    background: i < 3 ? `rgba(74,144,217,${opacity})` : `rgba(140,198,63,${opacity})`,
                  }}
                />
              ))}
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>High</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 4. Per-Segment Optimal Windows ────────────────────── */}
      <Card
        title="Per-Segment Optimal Send Windows"
        subtitle="Best time to reach each member segment based on historical opens"
        className="mb-8"
        detailTitle="Segment Send Window Analysis"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              These windows represent the <strong style={{ color: 'var(--heading)' }}>segment-level</strong> best
              times. SendBrain uses these as the baseline, then overrides with individual predictions for members
              who have enough data. Board Members show the highest open rates but smallest sample, while ACA Title
              Agents have the largest sample with more moderate rates.
            </p>
            {demoSendTimes.map((s) => {
              const conf = getConfidence(s.sample);
              return (
                <div key={s.segment} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{s.segment}</span>
                    <span className="text-[9px] font-bold" style={{ color: conf.color }}>{conf.label} confidence</span>
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {s.day} {s.time} -- {s.openRate}% open rate -- {s.sample.toLocaleString()} members sampled
                  </div>
                </div>
              );
            })}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
            <thead>
              <tr>
                {['Segment', 'Best Day', 'Best Time', 'Expected Open Rate', 'Sample Size', 'Confidence'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[9px] uppercase tracking-wider font-bold pb-2 px-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {demoSendTimes.map((s) => {
                const conf = getConfidence(s.sample);
                return (
                  <tr
                    key={s.segment}
                    className="rounded-lg transition-all hover:translate-x-[2px]"
                    style={{ background: 'var(--input-bg)' }}
                  >
                    <td className="px-3 py-2.5 font-bold rounded-l-lg" style={{ color: 'var(--heading)' }}>
                      {s.segment}
                    </td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--text-muted)' }}>{s.day}</td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--text-muted)' }}>{s.time}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="relative w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${s.openRate}%`, background: s.openRate >= 60 ? C.green : s.openRate >= 40 ? C.blue : C.amber }}
                          />
                        </div>
                        <span className="font-bold" style={{ color: s.openRate >= 60 ? C.green : s.openRate >= 40 ? C.blue : C.amber }}>
                          {s.openRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--text-muted)' }}>{s.sample.toLocaleString()}</td>
                    <td className="px-3 py-2.5 rounded-r-lg">
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: conf.color + '18',
                          color: conf.color,
                        }}
                      >
                        {conf.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 5. Individual vs Segment Comparison ───────────────── */}
      <Card
        title="Individual vs Segment Optimization"
        subtitle="How per-member prediction outperforms segment defaults"
        className="mb-8"
        detailTitle="Individual Optimization Deep Dive"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Segment-level send times are averages -- they optimize for the group but miss individual preferences.
              SendBrain&apos;s per-member prediction consistently outperforms because it accounts for each
              recipient&apos;s unique behavior patterns, timezone, and engagement habits.
            </p>
            <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
              <div className="text-[10px] font-bold mb-2" style={{ color: 'var(--heading)' }}>Why Individual Wins</div>
              <div className="text-[10px] space-y-1.5" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: C.purple }} />
                  <span>A segment says &quot;Thursday 7:30 AM&quot; but one member consistently opens at lunch</span>
                </div>
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: C.purple }} />
                  <span>Timezone differences within segments cause 2-3 hour shifts</span>
                </div>
                <div className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: C.purple }} />
                  <span>Role-based habits: C-suite checks email earlier, staff checks mid-morning</span>
                </div>
              </div>
            </div>
            {individualExamples.map((ex) => (
              <div key={ex.org} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{ex.org}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}>
                    {ex.type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div>
                    <div className="font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>Segment Default</div>
                    <div style={{ color: 'var(--text-muted)' }}>{ex.segDay} {ex.segTime}</div>
                    <div className="font-bold" style={{ color: C.amber }}>{ex.segRate}% expected</div>
                  </div>
                  <div>
                    <div className="font-bold mb-0.5" style={{ color: C.purple }}>SendBrain Individual</div>
                    <div style={{ color: 'var(--heading)' }}>{ex.indDay} {ex.indTime}</div>
                    <div className="font-bold" style={{ color: C.green }}>{ex.indRate}% expected</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      >
        {/* Headline comparison */}
        <div className="mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="rounded-xl p-4" style={{ background: 'var(--input-bg)', borderLeft: `3px solid ${C.amber}` }}>
              <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.amber }}>Segment-Level</div>
              <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>ACA Title Agents</div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Thursday 7:30 AM &rarr; <span className="font-bold" style={{ color: C.amber }}>38% expected open rate</span>
              </div>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(6,182,212,0.06) 100%)',
                borderLeft: `3px solid ${C.purple}`,
              }}
            >
              <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.purple }}>
                <Brain className="w-3 h-3 inline mr-1" style={{ verticalAlign: 'middle' }} />
                Individual-Level
              </div>
              <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>First American Title (ACU)</div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Monday 8:15 AM &rarr; <span className="font-bold" style={{ color: C.green }}>92% expected open rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Individual examples as compact rows */}
        <div className="space-y-2 mb-5">
          {individualExamples.map((ex) => (
            <div
              key={ex.org}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: 'var(--input-bg)' }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{ex.org}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}>
                    {ex.type}
                  </span>
                </div>
                <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Segment: {ex.segDay} {ex.segTime} &rarr; Individual: {ex.indDay} {ex.indTime}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Segment</div>
                  <div className="text-sm font-bold" style={{ color: C.amber }}>{ex.segRate}%</div>
                </div>
                <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                <div className="text-right">
                  <div className="text-[9px]" style={{ color: C.purple }}>Individual</div>
                  <div className="text-sm font-bold" style={{ color: C.green }}>{ex.indRate}%</div>
                </div>
                <div
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-1"
                  style={{ background: 'rgba(140,198,63,0.12)', color: C.green }}
                >
                  +{ex.indRate - ex.segRate}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bar chart: segment vs individual */}
        <ClientChart
          type="bar"
          height={220}
          data={{
            labels: individualExamples.map((ex) => ex.org.split(' ').slice(0, 2).join(' ')),
            datasets: [
              {
                label: 'Segment Prediction',
                data: individualExamples.map((ex) => ex.segRate),
                backgroundColor: C.amber + '70',
                borderColor: C.amber,
                borderWidth: 2,
                borderRadius: 6,
              },
              {
                label: 'Individual Prediction',
                data: individualExamples.map((ex) => ex.indRate),
                backgroundColor: C.purple + '70',
                borderColor: C.purple,
                borderWidth: 2,
                borderRadius: 6,
              },
            ],
          }}
          options={{
            plugins: {
              legend: {
                display: true,
                position: 'top' as const,
                labels: {
                  color: '#8899aa',
                  usePointStyle: true,
                  pointStyle: 'circle',
                  padding: 16,
                  font: { size: 10 },
                },
              },
              datalabels: {
                display: true,
                anchor: 'end' as const,
                align: 'end' as const,
                color: '#e2e8f0',
                font: { weight: 'bold' as const, size: 9 },
                formatter: (v: number) => v + '%',
              },
              tooltip: {
                callbacks: {
                  label: (ctx: { dataset: { label: string }; raw: number }) =>
                    `${ctx.dataset.label}: ${ctx.raw}% predicted open rate`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                grid: { color: '#1e3350' },
                ticks: {
                  color: '#8899aa',
                  callback: (v: number | string) => v + '%',
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ── 6. How SendBrain Learns ───────────────────────────── */}
        <Card
          title="How SendBrain Learns"
          subtitle="The algorithm behind individual optimization"
          detailTitle="SendBrain Algorithm"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                SendBrain is a per-recipient send-time optimization engine. Unlike tools that pick a single
                &quot;best time&quot; for a whole list, SendBrain builds individual preference profiles and
                delivers each email at the moment that specific person is most likely to engage.
              </p>
              <div className="space-y-3">
                {[
                  {
                    step: '1. Open Timestamp Collection',
                    desc: 'Every email open event is captured with a precise timestamp. SendBrain collects these across all campaigns -- compliance, renewals, newsletters, events -- to build a comprehensive picture of when each member reads email.',
                  },
                  {
                    step: '2. Per-Member Preference Matrix',
                    desc: 'For each member, a 7x24 probability matrix (day of week x hour of day) is constructed. Each cell represents the likelihood of that member opening an email at that specific time. The matrix is weighted toward recent behavior.',
                  },
                  {
                    step: '3. Segment Fallback for Sparse Data',
                    desc: 'Members with fewer than 10 open events don\'t have enough data for individual prediction. These members fall back to their segment\'s aggregate matrix. As they accumulate more opens, they graduate to individual prediction.',
                  },
                  {
                    step: '4. Real-Time Updates',
                    desc: 'The preference matrix is updated in real-time as new opens are recorded. Recent opens are weighted more heavily than older ones, so the model adapts as members change their habits (new job, new timezone, new routine).',
                  },
                  {
                    step: '5. Timezone Detection',
                    desc: 'IP geolocation from open events is used to detect timezone shifts. If a member moves from EST to PST, SendBrain adjusts their preference matrix automatically -- no manual timezone management needed.',
                  },
                ].map((s) => (
                  <div key={s.step} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                    <div className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--heading)' }}>
                      {s.step}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {s.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <div className="space-y-3">
            {[
              {
                icon: Eye,
                title: 'Collects open timestamps per recipient',
                desc: 'Across all campaigns -- compliance, renewals, events, newsletters',
                color: C.purple,
              },
              {
                icon: Layers,
                title: 'Builds a per-member time preference profile',
                desc: 'Day x hour probability matrix, weighted toward recent behavior',
                color: C.cyan,
              },
              {
                icon: Users,
                title: 'Falls back to segment for sparse data',
                desc: 'Members with <10 data points use segment-level prediction',
                color: C.blue,
              },
              {
                icon: RefreshCw,
                title: 'Updates in real-time as new opens arrive',
                desc: 'Model adapts to changing habits, job changes, new routines',
                color: C.green,
              },
              {
                icon: Globe,
                title: 'Detects timezone via IP geolocation',
                desc: 'Automatic adjustment when members relocate -- no manual work',
                color: C.amber,
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 mt-0.5"
                  style={{
                    background: item.color + '14',
                    border: `1px solid ${item.color}25`,
                  }}
                >
                  <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                </div>
                <div>
                  <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>
                    {item.title}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 7. Predicted Impact Calculator ──────────────────── */}
        <Card
          title="Predicted Impact Calculator"
          subtitle="Next campaign of 4,994 recipients -- SendBrain vs fixed time"
          detailTitle="Impact Prediction Methodology"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                These projections are based on backtesting SendBrain predictions against the last 90 days
                of actual campaign results. The individual-optimized projection uses each member&apos;s personal
                preference matrix to calculate expected open rate if emails were delivered at their optimal time.
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Methodology</div>
                <div className="text-[10px] space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <div>1. Take each member&apos;s 7x24 probability matrix</div>
                  <div>2. For fixed time: look up Tue 9 AM cell for all members</div>
                  <div>3. For segment: look up segment-best cell for each member</div>
                  <div>4. For individual: look up personal-best cell for each member</div>
                  <div>5. Average expected open rate across all 4,994 members</div>
                </div>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'rgba(140,198,63,0.06)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: C.green }}>Bottom Line</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Individual optimization is projected to yield <strong style={{ color: C.green }}>649 additional opens</strong> per
                  campaign compared to a fixed send time, and <strong style={{ color: C.green }}>350 additional opens</strong> compared
                  to segment-level optimization alone.
                </div>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Three tiers */}
            {[
              {
                label: 'Fixed Time (Tue 9 AM)',
                rate: 35,
                lift: null,
                color: 'var(--text-muted)',
                bg: 'var(--input-bg)',
                opens: 1748,
                desc: 'Same time for everyone',
              },
              {
                label: 'Segment-Optimized',
                rate: 41,
                lift: '+17%',
                color: C.blue,
                bg: C.blue + '0a',
                opens: 2048,
                desc: 'Best time per segment',
              },
              {
                label: 'Individual-Optimized',
                rate: 48,
                lift: '+37%',
                color: C.green,
                bg: C.green + '0a',
                opens: 2397,
                desc: 'Best time per person',
                featured: true,
              },
            ].map((tier) => (
              <div
                key={tier.label}
                className="rounded-xl p-4 transition-all"
                style={{
                  background: tier.bg,
                  border: (tier as { featured?: boolean }).featured
                    ? `1px solid ${C.green}30`
                    : '1px solid var(--card-border)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>
                      {(tier as { featured?: boolean }).featured && (
                        <Brain className="w-3.5 h-3.5 inline mr-1" style={{ color: C.purple, verticalAlign: 'middle' }} />
                      )}
                      {tier.label}
                    </div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{tier.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold" style={{ color: tier.color }}>
                      {tier.rate}%
                    </div>
                    {tier.lift && (
                      <div className="text-[9px] font-bold" style={{ color: tier.color }}>
                        {tier.lift} vs fixed
                      </div>
                    )}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${tier.rate}%`,
                      background: tier.color === 'var(--text-muted)' ? '#8899aa' : tier.color,
                      boxShadow: tier.color !== 'var(--text-muted)' ? `0 0 8px ${tier.color}40` : undefined,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    {tier.opens.toLocaleString()} predicted opens
                  </span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    of 4,994 recipients
                  </span>
                </div>
              </div>
            ))}

            {/* Net gain callout */}
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(6,182,212,0.08) 100%)',
                border: `1px solid ${C.purple}20`,
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="w-4 h-4" style={{ color: C.purple }} />
                <span className="text-xs font-extrabold" style={{ color: 'var(--heading)' }}>
                  SendBrain Net Gain
                </span>
              </div>
              <div className="text-2xl font-extrabold" style={{ color: C.green }}>+649 opens</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                per campaign vs fixed time &bull; +350 opens vs segment-only
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(6,182,212,0.08) 100%)',
            color: C.purple,
            border: `1px solid ${C.purple}20`,
          }}
        >
          <Brain className="w-3 h-3" />
          SendBrain&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
