'use client';

import { useState, useMemo } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  Archive,
  Search,
  FlaskConical,
  TrendingUp,
  DollarSign,
  Lightbulb,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  Star,
  X,
} from 'lucide-react';

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

/* ── Historical A/B Test Results ─────────────────────────── */
const tests = [
  {
    id: 1,
    name: 'PFL Compliance Subject Line Test',
    category: 'Subject Line',
    date: 'Mar 2026',
    variantA: 'Important: Your PFL Compliance Status',
    variantB: 'Action Required: PFL License Renewal Deadline',
    winner: 'B',
    lift: 29.6,
    confidence: 99.2,
    sampleSize: 3200,
    insight: 'Urgency-based subject ("Action Required") outperformed generic "Important" by 29.6%.',
    revenueImpact: 18400,
  },
  {
    id: 2,
    name: 'Renewal Email Send Time Test',
    category: 'Send Time',
    date: 'Feb 2026',
    variantA: 'Tuesday 9:00 AM ET',
    variantB: 'Thursday 2:00 PM ET',
    winner: 'A',
    lift: 21.2,
    confidence: 94.8,
    sampleSize: 420,
    insight: 'Tuesday morning sends had 21.2% higher open rate for renewal emails.',
    revenueImpact: 42000,
  },
  {
    id: 3,
    name: 'ALTA ONE From Address Test',
    category: 'From Address',
    date: 'Apr 2026',
    variantA: 'From: membership@alta.org',
    variantB: 'From: cmorton@alta.org (CEO)',
    winner: 'B',
    lift: 25.6,
    confidence: 97.3,
    sampleSize: 4994,
    insight: 'CEO-signed emails showing 25.6% higher opens — personal authority drives trust.',
    revenueImpact: 32000,
  },
  {
    id: 4,
    name: 'CTA Button Text Test',
    category: 'CTA',
    date: 'Jan 2026',
    variantA: 'Click Here to Renew Your Membership Today',
    variantB: 'Renew Now',
    winner: 'B',
    lift: 42.0,
    confidence: 99.8,
    sampleSize: 840,
    insight: 'Short, direct CTAs outperform verbose ones. Two words beat nine words by 42%.',
    revenueImpact: 56000,
  },
  {
    id: 5,
    name: 'Content Length Test — Newsletter',
    category: 'Content Length',
    date: 'Dec 2025',
    variantA: 'Full newsletter (2,400 words)',
    variantB: 'Summary + link (400 words)',
    winner: 'B',
    lift: 18.4,
    confidence: 96.1,
    sampleSize: 4840,
    insight: 'Shorter emails with links to full content drove 18.4% more clicks. Members prefer scannable format.',
    revenueImpact: 0,
  },
  {
    id: 6,
    name: 'HTML vs Plain Text — Compliance',
    category: 'Format',
    date: 'Nov 2025',
    variantA: 'Plain text email',
    variantB: 'Branded HTML template',
    winner: 'B',
    lift: 18.0,
    confidence: 95.4,
    sampleSize: 3200,
    insight: 'HTML emails outperform plain text by 18% for compliance. Branded design signals authority.',
    revenueImpact: 12000,
  },
  {
    id: 7,
    name: 'Preheader Text Test — Events',
    category: 'Subject Line',
    date: 'Oct 2025',
    variantA: 'No preheader (default preview)',
    variantB: 'Custom preheader with early-bird deadline',
    winner: 'B',
    lift: 14.8,
    confidence: 93.2,
    sampleSize: 4994,
    insight: 'Custom preheader text with deadline urgency increased opens 14.8%. Always write preheaders.',
    revenueImpact: 8600,
  },
  {
    id: 8,
    name: 'Personalization Test — Renewal',
    category: 'Content Length',
    date: 'Sep 2025',
    variantA: 'Generic renewal reminder',
    variantB: 'Personalized: name, company, membership type, dues amount',
    winner: 'B',
    lift: 33.2,
    confidence: 99.5,
    sampleSize: 420,
    insight: 'Deep personalization (name + company + dues) boosted conversion 33.2%. Worth the data merge effort.',
    revenueImpact: 68000,
  },
];

/* ── Key learnings ───────────────────────────────────────── */
const learnings = [
  { text: 'Urgency framing outperforms generic by 29.6%', source: 'PFL Subject Line Test', color: C.orange, icon: Star },
  { text: 'Tuesday 9AM > Thursday 2PM for renewals (+21.2%)', source: 'Renewal Send Time Test', color: C.blue, icon: Clock },
  { text: 'CEO-signed emails get 25.6% higher opens', source: 'ALTA ONE From Address Test', color: C.green, icon: CheckCircle2 },
  { text: 'Short CTAs ("Renew Now") outperform long ones by 42%', source: 'CTA Button Text Test', color: C.purple, icon: TrendingUp },
  { text: 'HTML emails outperform plain text by 18% for compliance', source: 'HTML vs Plain Text Test', color: C.teal, icon: FlaskConical },
  { text: 'Custom preheaders with deadlines lift opens 14.8%', source: 'Preheader Text Test', color: C.amber, icon: Lightbulb },
  { text: 'Deep personalization boosts conversion 33.2%', source: 'Personalization Test', color: C.red, icon: Star },
  { text: 'Summary + link format gets 18.4% more clicks than full content', source: 'Content Length Test', color: C.blue, icon: TrendingUp },
];

/* ── Cumulative lift chart data ──────────────────────────── */
const cumulativeLiftData = {
  labels: ['Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26'],
  datasets: [
    {
      label: 'Cumulative Avg Lift %',
      data: [33.2, 24.0, 21.8, 20.8, 24.4, 23.8, 25.2, 25.4],
      borderColor: C.green,
      backgroundColor: 'rgba(140,198,63,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: C.green,
      borderWidth: 2,
    },
    {
      label: 'Cumulative Revenue Impact ($K)',
      data: [68, 76.6, 88.6, 88.6, 144.6, 186.6, 205, 237],
      borderColor: C.blue,
      backgroundColor: 'rgba(74,144,217,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: C.blue,
      borderWidth: 2,
      yAxisID: 'y1',
    },
  ],
};

const cumulativeLiftOptions = {
  scales: {
    y: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => `${v}%` }, title: { display: true, text: 'Avg Lift %', color: '#8899aa' } },
    y1: { position: 'right' as const, grid: { display: false }, ticks: { color: '#8899aa', callback: (v: number) => `$${v}K` }, title: { display: true, text: 'Revenue ($K)', color: '#8899aa' } },
    x: { grid: { display: false }, ticks: { color: '#8899aa' } },
  },
  plugins: {
    legend: { display: true, position: 'bottom' as const, labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 11 } } },
  },
};

/* ── Category filter options ─────────────────────────────── */
const categories = ['All', 'Subject Line', 'Send Time', 'From Address', 'CTA', 'Content Length', 'Format'];

export default function ABVault() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedTest, setExpandedTest] = useState<number | null>(null);

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchesSearch = searchQuery === '' || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.insight.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  const totalRevenueImpact = tests.reduce((s, t) => s + t.revenueImpact, 0);
  const avgLift = (tests.reduce((s, t) => s + t.lift, 0) / tests.length).toFixed(1);

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(74,144,217,0.2) 100%)',
              border: '1px solid rgba(168,85,247,0.3)',
            }}
          >
            <Archive className="w-5 h-5" style={{ color: C.purple }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              ABVault<span style={{ color: C.purple, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.teal }}>
              Every test result, forever searchable.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Searchable archive of all A/B test results and learnings. Never re-run a test you already have the answer to.
          Every insight is cataloged with statistical confidence, revenue impact, and actionable takeaways that compound
          over time.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SparkKpi
          label="Tests Completed"
          value={tests.length}
          sub="Since Sep 2025"
          icon={FlaskConical}
          color={C.purple}
          sparkData={[1, 2, 3, 4, 5, 6, 7, 8]}
          sparkColor={C.purple}
          trend={{ value: 33, label: 'vs prior period' }}
          accent
        />
        <SparkKpi
          label="Avg Lift"
          value={`${avgLift}%`}
          sub="Across all tests"
          icon={TrendingUp}
          color={C.green}
          sparkData={[33.2, 24.0, 21.8, 20.8, 24.4, 23.8, 25.2, 25.4]}
          sparkColor={C.green}
          trend={{ value: 2.1, label: 'trending up' }}
          accent
        />
        <SparkKpi
          label="Best Insight"
          value="42% lift"
          sub='Short CTAs ("Renew Now")'
          icon={Lightbulb}
          color={C.orange}
          sparkData={[14, 18, 18, 21, 25, 29, 33, 42]}
          sparkColor={C.orange}
          accent
        />
        <SparkKpi
          label="Cumulative Revenue Impact"
          value={`$${(totalRevenueImpact / 1000).toFixed(0)}K`}
          sub="Attributed to test learnings"
          icon={DollarSign}
          color={C.blue}
          sparkData={[68, 76, 88, 88, 144, 186, 205, 237]}
          sparkColor={C.blue}
          trend={{ value: 15.6, label: 'this quarter' }}
          accent
        />
      </div>

      {/* ── 3. Search / Filter Bar ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search tests by name or insight..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium outline-none transition-colors"
            style={{
              background: 'var(--input-bg)',
              borderColor: 'var(--card-border)',
              color: 'var(--heading)',
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                style={{
                  background: categoryFilter === cat ? `color-mix(in srgb, var(--accent) 20%, transparent)` : 'var(--input-bg)',
                  color: categoryFilter === cat ? 'var(--accent)' : 'var(--text-muted)',
                  border: `1px solid ${categoryFilter === cat ? 'var(--accent)' : 'var(--card-border)'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Test Result Cards ──────────────────────────────── */}
      <div className="space-y-3 mb-8">
        {filteredTests.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No tests match your search criteria.</p>
          </div>
        )}
        {filteredTests.map((test) => {
          const isExpanded = expandedTest === test.id;
          return (
            <div
              key={test.id}
              className="rounded-xl border overflow-hidden transition-all duration-200"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--card-border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <button
                className="w-full text-left p-4"
                onClick={() => setExpandedTest(isExpanded ? null : test.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `color-mix(in srgb, ${test.lift >= 25 ? C.green : C.blue} 15%, transparent)` }}
                    >
                      <FlaskConical className="w-4 h-4" style={{ color: test.lift >= 25 ? C.green : C.blue }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold truncate" style={{ color: 'var(--heading)' }}>{test.name}</span>
                        <span
                          className="text-[8px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                          style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}
                        >
                          {test.category}
                        </span>
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{test.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 ml-3">
                    <div className="text-right">
                      <div className="text-sm font-extrabold" style={{ color: C.green }}>+{test.lift}%</div>
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>lift</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-bold" style={{ color: test.confidence >= 95 ? C.green : C.amber }}>
                        {test.confidence}%
                      </div>
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>confidence</div>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `color-mix(in srgb, ${test.winner === 'B' ? C.green : C.blue} 15%, transparent)` }}
                    >
                      <span className="text-[10px] font-extrabold" style={{ color: test.winner === 'B' ? C.green : C.blue }}>
                        {test.winner}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                      <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                        Variant A {test.winner === 'A' && '(Winner)'}
                      </div>
                      <div className="text-xs font-bold" style={{ color: test.winner === 'A' ? C.green : 'var(--heading)' }}>
                        {test.variantA}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                      <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                        Variant B {test.winner === 'B' && '(Winner)'}
                      </div>
                      <div className="text-xs font-bold" style={{ color: test.winner === 'B' ? C.green : 'var(--heading)' }}>
                        {test.variantB}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-2 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                      <div className="text-[8px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Lift</div>
                      <div className="text-sm font-extrabold" style={{ color: C.green }}>+{test.lift}%</div>
                    </div>
                    <div className="p-2 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                      <div className="text-[8px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Confidence</div>
                      <div className="text-sm font-extrabold" style={{ color: test.confidence >= 95 ? C.green : C.amber }}>{test.confidence}%</div>
                    </div>
                    <div className="p-2 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                      <div className="text-[8px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Sample</div>
                      <div className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>{test.sampleSize.toLocaleString()}</div>
                    </div>
                    <div className="p-2 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                      <div className="text-[8px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Revenue</div>
                      <div className="text-sm font-extrabold" style={{ color: C.blue }}>
                        {test.revenueImpact > 0 ? `$${(test.revenueImpact / 1000).toFixed(0)}K` : '--'}
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-3 rounded-lg border"
                    style={{ background: 'color-mix(in srgb, #8CC63F 5%, transparent)', borderColor: 'color-mix(in srgb, #8CC63F 20%, transparent)' }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Lightbulb className="w-3.5 h-3.5" style={{ color: C.green }} />
                      <span className="text-[10px] font-bold" style={{ color: C.green }}>Insight</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{test.insight}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 5. Learnings Database ─────────────────────────────── */}
      <Card title="Learnings Database" subtitle="Key takeaways that apply to future campaigns">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {learnings.map((l, i) => {
            const Icon = l.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 hover:translate-y-[-1px]"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--card-border)',
                  borderLeftWidth: '3px',
                  borderLeftColor: l.color,
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `color-mix(in srgb, ${l.color} 15%, transparent)` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: l.color }} />
                </div>
                <div>
                  <p className="text-xs font-bold leading-snug" style={{ color: 'var(--heading)' }}>{l.text}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Source: {l.source}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── 6. Cumulative Lift Chart ─────────────────────────── */}
      <div className="mt-6">
        <Card title="Cumulative Impact Over Time" subtitle="How A/B testing has improved performance and revenue">
          <ClientChart type="line" data={cumulativeLiftData} options={cumulativeLiftOptions} height={280} />
          <p className="text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>
            Since September 2025, systematic A/B testing has maintained an average lift of {avgLift}% across all
            experiments, generating an estimated ${(totalRevenueImpact / 1000).toFixed(0)}K in cumulative revenue impact.
            Each test compounds learnings — newer tests build on proven patterns from earlier winners.
          </p>
        </Card>
      </div>

      {/* ── 7. Footer ─────────────────────────────────────────── */}
      <div className="mt-8 text-center">
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          ABVault&trade; &mdash; Sample data for demonstration &bull; MEMTrak by ALTA
        </p>
      </div>
    </div>
  );
}
