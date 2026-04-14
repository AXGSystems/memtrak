'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  Settings2, TrendingDown, MailCheck, Clock, Hash,
  CheckSquare, Sliders, FileText, X, Users, Bell,
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

/* ── preference distribution data ────────────────────────── */
const frequencyPrefs = [
  { label: 'Weekly', count: 3420, pct: 36 },
  { label: 'Bi-Weekly', count: 2660, pct: 28 },
  { label: 'Monthly', count: 2470, pct: 26 },
  { label: 'Quarterly', count: 950, pct: 10 },
];

const topicPrefs = [
  { topic: 'Regulatory Updates', interested: 7840, pct: 82, color: C.blue },
  { topic: 'Industry News', interested: 7080, pct: 74, color: C.navy },
  { topic: 'Events & Conferences', interested: 5950, pct: 62, color: C.green },
  { topic: 'Education & Training', interested: 5570, pct: 58, color: C.teal },
  { topic: 'Advocacy Alerts', interested: 4760, pct: 50, color: C.purple },
  { topic: 'Member Spotlights', interested: 3810, pct: 40, color: C.amber },
  { topic: 'Product Announcements', interested: 2860, pct: 30, color: C.orange },
  { topic: 'Surveys & Feedback', interested: 1910, pct: 20, color: C.red },
];

const formatPrefs = [
  { format: 'Full HTML Email', count: 5200, pct: 55 },
  { format: 'Plain Text Digest', count: 2370, pct: 25 },
  { format: 'Mobile-Optimized', count: 1420, pct: 15 },
  { format: 'SMS Summary', count: 470, pct: 5 },
];

/* ── impact metrics (monthly trend) ──────────────────────── */
const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
const unsubBefore = [4.2, 4.5, 4.1, 3.8, 3.6, 3.4];
const unsubAfter = [4.2, 4.5, 3.2, 2.4, 2.1, 1.8];

/* ── preference center preview items ─────────────────────── */
const contentTypes = [
  { label: 'Regulatory & Compliance', checked: true },
  { label: 'Industry News Weekly', checked: true },
  { label: 'Events & Conferences', checked: true },
  { label: 'Education & Training', checked: false },
  { label: 'Advocacy & TIPAC', checked: true },
  { label: 'Member Spotlights', checked: false },
  { label: 'Product Updates', checked: false },
];

/* ── recent activity feed ────────────────────────────────── */
const recentUpdates = [
  { member: 'J. Richardson', action: 'Changed frequency to Bi-Weekly', time: '2 hours ago' },
  { member: 'S. Williams', action: 'Opted out of Product Updates', time: '5 hours ago' },
  { member: 'M. Chen', action: 'Re-subscribed via preference center', time: '1 day ago' },
  { member: 'K. Thompson', action: 'Switched to Plain Text Digest', time: '1 day ago' },
  { member: 'R. Patel', action: 'Added Events & Conferences topic', time: '2 days ago' },
];

/* ══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function MemberPreferPage() {
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<typeof topicPrefs[0] | null>(null);

  return (
    <div className="p-6 space-y-6">

      {/* ── 1. Branded Header ── */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
            boxShadow: '0 4px 20px rgba(20,184,166,0.3)',
          }}
        >
          <Settings2 className="w-6 h-6" style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            MemberPrefer<span className="text-[10px] align-super font-bold" style={{ color: 'var(--accent)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Let members choose. They&apos;ll stay.
          </p>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
        Self-service preference center analytics. When members control <strong style={{ color: 'var(--heading)' }}>what</strong>, <strong style={{ color: 'var(--heading)' }}>when</strong>, and <strong style={{ color: 'var(--heading)' }}>how</strong> they hear from you, unsubscribe rates drop and engagement climbs.
      </p>

      {/* ── 2. SparkKpi Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <SparkKpi
          label="Members with Preferences"
          value="9,460"
          sub="51.4% of total membership"
          icon={Users}
          color={C.teal}
          sparkData={[6200, 7100, 7800, 8400, 9000, 9460]}
          sparkColor={C.teal}
          trend={{ value: 14.2, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                9,460 of 18,400 members have actively set at least one preference in the MemberPrefer center. Adoption has been accelerating since the preference center launch in November 2025.
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Goal</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Target 65% adoption by Q3 2026. Current trajectory projects 62% by July.
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Unsubscribe Reduction"
          value="&minus;57%"
          sub="Among members with preferences set"
          icon={TrendingDown}
          color={C.green}
          sparkData={[4.2, 4.5, 3.2, 2.4, 2.1, 1.8]}
          sparkColor={C.green}
          trend={{ value: 12.5, label: 'vs last month' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Members who set preferences unsubscribe at 1.8% vs. 4.2% for those who haven&apos;t. This represents a 57% reduction in opt-outs.
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Benchmark</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Industry research shows preference centers typically reduce unsubscribes by 20-40%. ALTA&apos;s 57% exceeds this range significantly.
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Top Preferred Topic"
          value="Regulatory"
          sub="82% of members selected this topic"
          icon={CheckSquare}
          color={C.blue}
          sparkData={[78, 79, 80, 80, 81, 82]}
          sparkColor={C.blue}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Regulatory Updates is the most popular content category, selected by 7,840 members. This aligns with ALTA&apos;s core compliance mission and PFL requirements.
              </p>
              {topicPrefs.slice(0, 4).map(t => (
                <div key={t.topic} className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--heading)' }}>{t.topic}</span>
                  <span className="font-bold" style={{ color: t.color }}>{t.pct}%</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Avg Preferred Frequency"
          value="Bi-Weekly"
          sub="64% prefer weekly or bi-weekly"
          icon={Clock}
          color={C.purple}
          sparkData={[2.8, 2.6, 2.4, 2.2, 2.1, 2.0]}
          sparkColor={C.purple}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                The average preferred frequency falls between weekly and bi-weekly. Only 10% prefer quarterly-or-less cadence.
              </p>
              {frequencyPrefs.map(f => (
                <div key={f.label} className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--heading)' }}>{f.label}</span>
                  <span className="font-bold" style={{ color: 'var(--accent)' }}>{f.count.toLocaleString()} ({f.pct}%)</span>
                </div>
              ))}
            </div>
          }
        />
      </div>

      {/* ── 3. Main Grid ── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Preference Center Preview */}
        <Card
          title="Preference Center Preview"
          subtitle="Live view of the member-facing preference UI"
          detailTitle="Full Preference Center Preview"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                This is the preference center members see when they click &ldquo;Manage Preferences&rdquo; in any MEMTrak email footer. Members can customize content, frequency, and format.
              </p>
              <div className="rounded-lg p-4 space-y-4" style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Content Topics</div>
                  {contentTypes.map(ct => (
                    <label key={ct.label} className="flex items-center gap-2 py-1.5 cursor-pointer">
                      <div
                        className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
                        style={{
                          borderColor: ct.checked ? C.teal : 'var(--card-border)',
                          background: ct.checked ? C.teal : 'transparent',
                        }}
                      >
                        {ct.checked && <CheckSquare className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--heading)' }}>{ct.label}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Frequency</div>
                  <div className="flex gap-2">
                    {['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly'].map(f => (
                      <span
                        key={f}
                        className="text-[10px] px-3 py-1.5 rounded-full font-bold cursor-pointer"
                        style={{
                          background: f === 'Bi-Weekly' ? C.teal : 'var(--input-bg)',
                          color: f === 'Bi-Weekly' ? '#fff' : 'var(--text-muted)',
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Format</div>
                  <div className="flex gap-2">
                    {['HTML', 'Plain Text', 'Mobile'].map(f => (
                      <span
                        key={f}
                        className="text-[10px] px-3 py-1.5 rounded-full font-bold cursor-pointer"
                        style={{
                          background: f === 'HTML' ? C.blue : 'var(--input-bg)',
                          color: f === 'HTML' ? '#fff' : 'var(--text-muted)',
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <div className="space-y-3 mt-1">
            {/* Mini preference center mockup */}
            <div className="rounded-lg p-3" style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>Content Topics</div>
              <div className="space-y-1.5">
                {contentTypes.map(ct => (
                  <div key={ct.label} className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: ct.checked ? C.teal : 'var(--card-border)',
                        background: ct.checked ? C.teal : 'transparent',
                      }}
                    >
                      {ct.checked && <span className="text-[8px]" style={{ color: '#fff' }}>&#10003;</span>}
                    </div>
                    <span className="text-[10px]" style={{ color: ct.checked ? 'var(--heading)' : 'var(--text-muted)' }}>{ct.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-2.5" style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Frequency</div>
                <div className="flex flex-wrap gap-1">
                  {['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly'].map(f => (
                    <span
                      key={f}
                      className="text-[8px] px-2 py-1 rounded-full font-bold"
                      style={{
                        background: f === 'Bi-Weekly' ? C.teal : 'var(--input-bg)',
                        color: f === 'Bi-Weekly' ? '#fff' : 'var(--text-muted)',
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Format</div>
                <div className="flex flex-wrap gap-1">
                  {['HTML', 'Plain Text', 'Mobile'].map(f => (
                    <span
                      key={f}
                      className="text-[8px] px-2 py-1 rounded-full font-bold"
                      style={{
                        background: f === 'HTML' ? C.blue : 'var(--input-bg)',
                        color: f === 'HTML' ? '#fff' : 'var(--text-muted)',
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Topic Popularity Distribution */}
        <Card
          title="Topic Popularity"
          subtitle="Which content types members want most"
          detailTitle="Full Topic Preference Breakdown"
          detailContent={
            <div className="space-y-3">
              {topicPrefs.map(t => (
                <div key={t.topic}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{t.topic}</span>
                    <span className="text-xs font-bold" style={{ color: t.color }}>{t.interested.toLocaleString()} members ({t.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${t.pct}%`, background: t.color }} />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-2.5 mt-1">
            {topicPrefs.map(t => (
              <div key={t.topic}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--heading)' }}>{t.topic}</span>
                  <span className="text-[10px] font-bold" style={{ color: t.color }}>{t.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${t.pct}%`, background: t.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Frequency Distribution Chart */}
        <Card
          title="Frequency Preferences"
          subtitle="How often members want to hear from ALTA"
        >
          <div className="mt-1">
            <ClientChart
              type="doughnut"
              height={220}
              data={{
                labels: frequencyPrefs.map(f => f.label),
                datasets: [{
                  data: frequencyPrefs.map(f => f.count),
                  backgroundColor: [C.teal, C.blue, C.purple, C.amber],
                  borderWidth: 0,
                }],
              }}
              options={{
                cutout: '60%',
                plugins: {
                  legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, pointStyleWidth: 8, font: { size: 10 } } },
                },
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {frequencyPrefs.map((f, i) => (
              <div key={f.label} className="rounded-lg p-2 text-center" style={{ background: 'var(--background)' }}>
                <div className="text-sm font-extrabold" style={{ color: [C.teal, C.blue, C.purple, C.amber][i] }}>{f.pct}%</div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{f.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Unsubscribe Impact Chart */}
        <Card
          title="Unsubscribe Rate Impact"
          subtitle="Before vs. after MemberPrefer launch"
          detailTitle="Unsubscribe Impact Analysis"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                The preference center launched in November 2025. Members who configured preferences show a sustained reduction in unsubscribe behavior. The &ldquo;Before&rdquo; line shows the rate for members without preferences. The &ldquo;After&rdquo; line shows the rate for preference-active members.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                  <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>No Preferences</div>
                  <div className="text-lg font-extrabold" style={{ color: C.red }}>3.4%</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Current unsub rate</div>
                </div>
                <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                  <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>With Preferences</div>
                  <div className="text-lg font-extrabold" style={{ color: C.green }}>1.8%</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Current unsub rate</div>
                </div>
              </div>
            </div>
          }
        >
          <div className="mt-1">
            <ClientChart
              type="line"
              height={200}
              data={{
                labels: months,
                datasets: [
                  {
                    label: 'Without Preferences',
                    data: unsubBefore,
                    borderColor: C.red,
                    backgroundColor: 'rgba(217,74,74,0.1)',
                    borderWidth: 2,
                    borderDash: [5, 3],
                    fill: false,
                    tension: 0.3,
                    pointRadius: 3,
                  },
                  {
                    label: 'With Preferences',
                    data: unsubAfter,
                    borderColor: C.green,
                    backgroundColor: 'rgba(140,198,63,0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                  },
                ],
              }}
              options={{
                scales: {
                  y: {
                    title: { display: true, text: 'Unsub Rate (%)', font: { size: 10 } },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                    min: 0,
                    max: 6,
                  },
                  x: { grid: { display: false } },
                },
                plugins: {
                  legend: { labels: { usePointStyle: true, pointStyleWidth: 8, font: { size: 10 } } },
                },
              }}
            />
          </div>
        </Card>

        {/* Format Preferences */}
        <Card
          title="Format Preferences"
          subtitle="Preferred email format by member count"
        >
          <div className="space-y-2.5 mt-1">
            {formatPrefs.map((f, i) => {
              const colors = [C.blue, C.teal, C.purple, C.amber];
              return (
                <div key={f.format}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--heading)' }}>{f.format}</span>
                    <span className="text-[10px] font-bold" style={{ color: colors[i] }}>{f.count.toLocaleString()} ({f.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${f.pct}%`, background: colors[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-lg p-3 mt-4" style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Bell className="w-3.5 h-3.5" style={{ color: C.amber }} />
              <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>Insight</span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              25% of members prefer plain text digests. Consider offering a weekly plain-text summary for this segment to maximize engagement.
            </p>
          </div>
        </Card>

        {/* Recent Activity Feed */}
        <Card
          title="Recent Preference Updates"
          subtitle="Latest member preference changes"
        >
          <div className="space-y-0 mt-1">
            {recentUpdates.map((u, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-2.5"
                style={{ borderBottom: i < recentUpdates.length - 1 ? '1px solid var(--card-border)' : undefined }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
                  <Settings2 className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{u.member}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{u.action}</div>
                </div>
                <span className="text-[9px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{u.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
