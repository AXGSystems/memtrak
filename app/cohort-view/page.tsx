'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  Users, TrendingUp, TrendingDown, AlertTriangle,
  Layers, Target, Activity, X, Calendar,
} from 'lucide-react';

/* ── palette ─────────────────────────────────────────────── */
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

/* ── retention cohort data (join year x months active) ──── */
const joinYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
const cohortMonths = ['0-6 mo', '6-12 mo', '12-18 mo', '18-24 mo', '24-36 mo', '36+ mo'];
const cohortData: Record<number, number[]> = {
  2020: [100, 92, 87, 83, 78, 74],
  2021: [100, 89, 82, 76, 70, 65],
  2022: [100, 91, 85, 80, 73, 0], // 0 = not yet reached
  2023: [100, 88, 81, 74, 0, 0],
  2024: [100, 86, 79, 0, 0, 0],
  2025: [100, 84, 0, 0, 0, 0],
  2026: [100, 0, 0, 0, 0, 0],
};

/* ── RFM segments ────────────────────────────────────────── */
const rfmSegments = [
  { segment: 'Champions', r: '5', f: '5', m: '5', count: 420, pct: 8.4, color: C.green, desc: 'Highly engaged, frequent, high-value members' },
  { segment: 'Loyal', r: '4-5', f: '4-5', m: '3-4', count: 1280, pct: 25.6, color: C.blue, desc: 'Regular engagement, consistent participation' },
  { segment: 'Potential', r: '3-4', f: '2-3', m: '2-3', count: 980, pct: 19.6, color: C.teal, desc: 'Room to grow, showing positive signals' },
  { segment: 'At-Risk', r: '2-3', f: '1-2', m: '2-4', count: 860, pct: 17.2, color: C.orange, desc: 'Declining engagement, need intervention' },
  { segment: 'Hibernating', r: '1-2', f: '1', m: '1-2', count: 720, pct: 14.4, color: C.red, desc: 'Minimal recent activity, possible churn' },
  { segment: 'New', r: '5', f: '1', m: '1-2', count: 740, pct: 14.8, color: C.purple, desc: 'Recently joined, still in onboarding window' },
];

/* ── lifecycle stage data ────────────────────────────────── */
const lifecycleStages = [
  { stage: 'New (< 6 months)', count: 740, pct: 14.8, color: C.purple },
  { stage: 'Growing (6-18 months)', count: 1260, pct: 25.2, color: C.teal },
  { stage: 'Mature (18+ months, active)', count: 1700, pct: 34.0, color: C.green },
  { stage: 'At-Risk (declining)', count: 860, pct: 17.2, color: C.orange },
  { stage: 'Lapsed (no activity 90+ days)', count: 440, pct: 8.8, color: C.red },
];

/* ── monthly retention trend ─────────────────────────────── */
const retentionMonths = ['Jan', 'Feb', 'Mar', 'Apr'];
const retentionRates = [83.2, 84.1, 84.8, 85.6];

/* ── helper: color for retention % ───────────────────────── */
function retColor(pct: number) {
  if (pct >= 85) return C.green;
  if (pct >= 75) return C.blue;
  if (pct >= 65) return C.amber;
  if (pct >= 50) return C.orange;
  if (pct === 0) return 'var(--card-border)';
  return C.red;
}

function retBg(pct: number) {
  if (pct === 0) return 'var(--background)';
  if (pct >= 85) return 'rgba(140,198,63,0.15)';
  if (pct >= 75) return 'rgba(74,144,217,0.15)';
  if (pct >= 65) return 'rgba(245,197,66,0.15)';
  if (pct >= 50) return 'rgba(232,146,63,0.15)';
  return 'rgba(217,74,74,0.15)';
}

/* ══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function CohortViewPage() {
  const [selectedCohort, setSelectedCohort] = useState<number | null>(null);
  const [selectedRfm, setSelectedRfm] = useState<typeof rfmSegments[0] | null>(null);

  return (
    <div className="p-6 space-y-6">

      {/* ── 1. Branded Header ── */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
            boxShadow: '0 4px 20px rgba(168,85,247,0.3)',
          }}
        >
          <Layers className="w-6 h-6" style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            CohortView<span className="text-[10px] align-super font-bold" style={{ color: 'var(--accent)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Watch how members evolve over time.
          </p>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
        RFM cohort analysis across <strong style={{ color: 'var(--heading)' }}>join year</strong>, <strong style={{ color: 'var(--heading)' }}>lifecycle stage</strong>, and <strong style={{ color: 'var(--heading)' }}>behavioral segments</strong>. Identify which cohorts retain best and where churn hotspots emerge.
      </p>

      {/* ── 2. SparkKpi Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <SparkKpi
          label="Active Cohorts"
          value="7"
          sub="2020 through 2026 join years"
          icon={Layers}
          color={C.purple}
          sparkData={[5, 5, 6, 6, 7, 7]}
          sparkColor={C.purple}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                7 active join-year cohorts are currently being tracked. The oldest (2020) has 74% retention at 36+ months, while the newest (2026) is still in early observation.
              </p>
            </div>
          }
        />
        <SparkKpi
          label="Best Performing Cohort"
          value="2020"
          sub="74% retained at 36+ months"
          icon={TrendingUp}
          color={C.green}
          sparkData={[100, 92, 87, 83, 78, 74]}
          sparkColor={C.green}
          trend={{ value: 4.2, label: 'vs 2021 at same age' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                The 2020 cohort has the highest long-term retention. Members who joined during the pandemic-era shift to digital services showed stronger engagement and loyalty.
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Key Factor</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  The 2020 cohort received enhanced onboarding content during the transition to remote operations. This stronger initial experience correlates with better long-term retention.
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Avg Retention Rate"
          value="85.6%"
          sub="All active cohorts at current age"
          icon={Activity}
          color={C.blue}
          sparkData={retentionRates}
          sparkColor={C.blue}
          trend={{ value: 1.8, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                The weighted average retention across all active cohorts. This has been steadily improving since Q1 2026, driven by better onboarding and engagement programs.
              </p>
            </div>
          }
        />
        <SparkKpi
          label="Churn Hotspot"
          value="6-12 mo"
          sub="Biggest drop-off window across cohorts"
          icon={AlertTriangle}
          color={C.red}
          sparkData={[12, 11, 14, 15, 12, 16]}
          sparkColor={C.red}
          trend={{ value: -2.1, label: 'worsening' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                The 6-12 month mark is where the largest retention drop occurs across all cohorts. On average, 11-16% of members disengage during this window.
              </p>
              <div className="rounded-lg p-3" style={{ background: 'rgba(217,74,74,0.08)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: C.red }}>Action Required</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Consider a &ldquo;6-Month Milestone&rdquo; engagement campaign targeting members approaching this window with personalized value reinforcement.
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* ── 3. Retention Cohort Grid (full width) ── */}
      <Card
        title="Retention Cohort Grid"
        subtitle="Join year vs. months of membership — color-coded by retention %"
        detailTitle="Cohort Grid Deep Dive"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Each cell shows the percentage of members from that join-year cohort who remain active after the given number of months. Green cells indicate strong retention; red cells indicate significant churn.
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Gray cells indicate time periods that cohort has not yet reached. All cohorts start at 100% and decline over time. The goal is to keep the curve as green as possible for as long as possible.
            </p>
          </div>
        }
      >
        <div className="overflow-x-auto mt-1">
          <table className="w-full text-[10px]" style={{ borderCollapse: 'separate', borderSpacing: '3px' }}>
            <thead>
              <tr>
                <th className="text-left px-2 py-1.5 font-bold" style={{ color: 'var(--text-muted)' }}>Join Year</th>
                {cohortMonths.map(m => (
                  <th key={m} className="px-2 py-1.5 text-center font-bold" style={{ color: 'var(--text-muted)' }}>{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {joinYears.map(year => (
                <tr key={year}>
                  <td className="px-2 py-1.5 font-extrabold" style={{ color: 'var(--heading)' }}>{year}</td>
                  {cohortData[year].map((pct, i) => (
                    <td
                      key={i}
                      className="px-2 py-2 text-center rounded-md font-bold cursor-pointer transition-transform hover:scale-105"
                      style={{
                        background: retBg(pct),
                        color: pct === 0 ? 'var(--text-muted)' : retColor(pct),
                      }}
                      onClick={() => pct > 0 ? setSelectedCohort(year) : null}
                    >
                      {pct === 0 ? '—' : `${pct}%`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>Legend:</span>
          {[
            { label: '85%+', bg: 'rgba(140,198,63,0.15)', fg: C.green },
            { label: '75-84%', bg: 'rgba(74,144,217,0.15)', fg: C.blue },
            { label: '65-74%', bg: 'rgba(245,197,66,0.15)', fg: C.amber },
            { label: '50-64%', bg: 'rgba(232,146,63,0.15)', fg: C.orange },
            { label: '<50%', bg: 'rgba(217,74,74,0.15)', fg: C.red },
          ].map(l => (
            <span key={l.label} className="text-[8px] font-bold px-2 py-0.5 rounded" style={{ background: l.bg, color: l.fg }}>{l.label}</span>
          ))}
        </div>
      </Card>

      {/* ── 4. Two-column: RFM + Lifecycle ── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* RFM Segmentation */}
        <Card
          title="RFM Segmentation"
          subtitle="Recency / Frequency / Monetary value segments"
          detailTitle="RFM Segment Details"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Members scored 1-5 on Recency (last interaction), Frequency (interactions per quarter), and Monetary value (dues + events + purchases). Segments are derived from combined RFM scores.
              </p>
              {rfmSegments.map(s => (
                <div key={s.segment} className="rounded-lg p-3" style={{ background: 'var(--background)', borderLeft: `3px solid ${s.color}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.segment}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{s.count.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
                  <div className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>R: {s.r} | F: {s.f} | M: {s.m}</div>
                </div>
              ))}
            </div>
          }
        >
          <div className="mt-1">
            <ClientChart
              type="bar"
              height={220}
              data={{
                labels: rfmSegments.map(s => s.segment),
                datasets: [{
                  data: rfmSegments.map(s => s.count),
                  backgroundColor: rfmSegments.map(s => s.color),
                  borderRadius: 6,
                  barThickness: 28,
                }],
              }}
              options={{
                indexAxis: 'y',
                scales: {
                  x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } },
                  y: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' } } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {rfmSegments.slice(0, 3).map(s => (
              <div
                key={s.segment}
                className="rounded-lg p-2 text-center cursor-pointer transition-transform hover:scale-105"
                style={{ background: `color-mix(in srgb, ${s.color} 10%, transparent)` }}
                onClick={() => setSelectedRfm(s)}
              >
                <div className="text-xs font-extrabold" style={{ color: s.color }}>{s.count}</div>
                <div className="text-[8px] font-bold" style={{ color: 'var(--text-muted)' }}>{s.segment}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Lifecycle Stage Distribution */}
        <Card
          title="Lifecycle Stage Distribution"
          subtitle="Where members are in their membership journey"
          detailTitle="Lifecycle Stages Explained"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Every member is classified into a lifecycle stage based on their join date and recent engagement behavior. This helps target communications and intervention timing.
              </p>
              {lifecycleStages.map(s => (
                <div key={s.stage} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{s.stage}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.count.toLocaleString()} ({s.pct}%)</span>
                </div>
              ))}
            </div>
          }
        >
          <div className="mt-1">
            <ClientChart
              type="doughnut"
              height={220}
              data={{
                labels: lifecycleStages.map(s => s.stage),
                datasets: [{
                  data: lifecycleStages.map(s => s.count),
                  backgroundColor: lifecycleStages.map(s => s.color),
                  borderWidth: 0,
                }],
              }}
              options={{
                cutout: '55%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { padding: 10, usePointStyle: true, pointStyleWidth: 8, font: { size: 9 } },
                  },
                },
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {lifecycleStages.slice(0, 4).map(s => (
              <div key={s.stage} className="rounded-lg p-2" style={{ background: 'var(--background)' }}>
                <div className="text-sm font-extrabold" style={{ color: s.color }}>{s.pct}%</div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{s.stage}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Retention Trend Line */}
        <Card
          title="Retention Rate Trend"
          subtitle="Weighted average retention across all active cohorts"
        >
          <div className="mt-1">
            <ClientChart
              type="line"
              height={200}
              data={{
                labels: retentionMonths,
                datasets: [{
                  label: 'Avg Retention',
                  data: retentionRates,
                  borderColor: C.blue,
                  backgroundColor: 'rgba(74,144,217,0.1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.4,
                  pointRadius: 4,
                  pointBackgroundColor: C.blue,
                }],
              }}
              options={{
                scales: {
                  y: {
                    min: 80,
                    max: 90,
                    title: { display: true, text: 'Retention %', font: { size: 10 } },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                  },
                  x: { grid: { display: false } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <div className="rounded-lg p-3 mt-3" style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: C.green }} />
              <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>Positive Trend</span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Retention has improved 2.4 points since January, driven by improved onboarding sequences and the 6-month engagement campaign launched in Q1.
            </p>
          </div>
        </Card>

        {/* Cohort Size by Year */}
        <Card
          title="Cohort Size by Join Year"
          subtitle="Number of members who joined each year"
        >
          <div className="mt-1">
            <ClientChart
              type="bar"
              height={200}
              data={{
                labels: joinYears.map(String),
                datasets: [{
                  label: 'Members Joined',
                  data: [620, 780, 890, 720, 840, 910, 240],
                  backgroundColor: joinYears.map((_, i) => {
                    const colors = [C.navy, C.blue, C.teal, C.green, C.purple, C.amber, C.orange];
                    return colors[i];
                  }),
                  borderRadius: 6,
                }],
              }}
              options={{
                scales: {
                  y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
            2026 shows partial-year data through April. On current trajectory, 2026 will exceed 2025 cohort size by Q3.
          </p>
        </Card>
      </div>

      {/* ── Detail Modals ── */}
      {selectedCohort !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedCohort(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedCohort} Cohort Detail</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Retention breakdown by period</p>
              </div>
              <button onClick={() => setSelectedCohort(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {cohortData[selectedCohort].map((pct, i) => {
                if (pct === 0) return null;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{cohortMonths[i]}</span>
                      <span className="text-xs font-bold" style={{ color: retColor(pct) }}>{pct}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: retColor(pct) }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedRfm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedRfm(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: selectedRfm.color }}>{selectedRfm.segment}</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>RFM Segment Detail</p>
              </div>
              <button onClick={() => setSelectedRfm(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-3xl font-extrabold" style={{ color: selectedRfm.color }}>{selectedRfm.count.toLocaleString()}</div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedRfm.desc}</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Recency', val: selectedRfm.r },
                  { label: 'Frequency', val: selectedRfm.f },
                  { label: 'Monetary', val: selectedRfm.m },
                ].map(d => (
                  <div key={d.label} className="rounded-lg p-3 text-center" style={{ background: 'var(--background)' }}>
                    <div className="text-lg font-extrabold" style={{ color: selectedRfm.color }}>{d.val}</div>
                    <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{d.label}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg p-3" style={{ background: `color-mix(in srgb, ${selectedRfm.color} 8%, transparent)` }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: selectedRfm.color }}>{selectedRfm.pct}% of membership</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  This segment represents {selectedRfm.count.toLocaleString()} of 5,000 scored members.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
