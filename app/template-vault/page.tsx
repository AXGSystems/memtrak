'use client';

import { useState, useMemo } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { MiniBar } from '@/components/SparkKpi';
import {
  LayoutTemplate,
  Star,
  Copy,
  Plus,
  Filter,
  ArrowUpDown,
  X,
  TrendingUp,
  Award,
  BarChart3,
  Calendar,
  Mail,
  Shield,
  RefreshCcw,
  PartyPopper,
  Newspaper,
  UserPlus,
  Heart,
  CheckCircle2,
  Sparkles,
  Eye,
  MousePointerClick,
} from 'lucide-react';

/* -- Palette -- */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  indigo: '#6366f1',
  teal: '#14b8a6',
  rose: '#f43f5e',
};

type Category = 'Compliance' | 'Renewal' | 'Events' | 'Newsletter' | 'Onboarding' | 'Retention';

const categoryColors: Record<Category, string> = {
  Compliance: C.red,
  Renewal: C.green,
  Events: C.purple,
  Newsletter: C.blue,
  Onboarding: C.teal,
  Retention: C.orange,
};

const categoryIcons: Record<Category, typeof Shield> = {
  Compliance: Shield,
  Renewal: RefreshCcw,
  Events: PartyPopper,
  Newsletter: Newspaper,
  Onboarding: UserPlus,
  Retention: Heart,
};

const categoryGradients: Record<Category, string> = {
  Compliance: `linear-gradient(135deg, ${C.red}40, ${C.orange}30)`,
  Renewal: `linear-gradient(135deg, ${C.green}40, ${C.teal}30)`,
  Events: `linear-gradient(135deg, ${C.purple}40, ${C.indigo}30)`,
  Newsletter: `linear-gradient(135deg, ${C.blue}40, ${C.navy}60)`,
  Onboarding: `linear-gradient(135deg, ${C.teal}40, ${C.green}30)`,
  Retention: `linear-gradient(135deg, ${C.orange}40, ${C.amber}30)`,
};

interface Template {
  id: number;
  name: string;
  category: Category;
  score: number;
  timesUsed: number;
  lastUsed: string;
  openRate: number;
  clickRate: number;
  subjectLine: string;
  previewText: string;
  recommended: boolean;
  abHistory: { variant: string; openRate: number; clickRate: number }[];
  suggestions: string[];
}

const templates: Template[] = [
  { id: 1, name: 'PFL Compliance Alert', category: 'Compliance', score: 92, timesUsed: 47, lastUsed: '2026-04-09', openRate: 44.2, clickRate: 13.8, subjectLine: 'Action Required: PFL Compliance Update for {{state}}', previewText: 'Your organization must comply by {{deadline}}...', recommended: true, abHistory: [{ variant: 'A — Urgency', openRate: 44.2, clickRate: 13.8 }, { variant: 'B — Friendly', openRate: 38.1, clickRate: 11.2 }], suggestions: ['Add personalized deadline countdown', 'Test emoji in subject line'] },
  { id: 2, name: 'Renewal — 60 Day Notice', category: 'Renewal', score: 89, timesUsed: 24, lastUsed: '2026-04-01', openRate: 69.9, clickRate: 39.2, subjectLine: 'Your ALTA Membership Renews in 60 Days', previewText: 'Lock in your {{memberType}} benefits before {{date}}...', recommended: true, abHistory: [{ variant: 'A — Countdown', openRate: 69.9, clickRate: 39.2 }, { variant: 'B — Benefits focus', openRate: 64.3, clickRate: 35.1 }], suggestions: ['Add member tenure badge', 'Include savings calculator link'] },
  { id: 3, name: 'ALTA ONE Early Bird', category: 'Events', score: 87, timesUsed: 12, lastUsed: '2026-04-07', openRate: 45.0, clickRate: 16.3, subjectLine: 'ALTA ONE 2026 — Early Bird Pricing Ends {{date}}', previewText: 'Save up to $300 when you register early...', recommended: true, abHistory: [{ variant: 'A — Save $$', openRate: 45.0, clickRate: 16.3 }, { variant: 'B — Speaker lineup', openRate: 41.8, clickRate: 14.7 }], suggestions: ['Add speaker headshot grid', 'Test video thumbnail embed'] },
  { id: 4, name: 'Title News Weekly', category: 'Newsletter', score: 78, timesUsed: 62, lastUsed: '2026-04-11', openRate: 40.0, clickRate: 10.0, subjectLine: 'Title News Weekly — {{issue_number}}', previewText: 'This week: industry trends, regulatory updates, and more...', recommended: false, abHistory: [{ variant: 'A — Standard', openRate: 40.0, clickRate: 10.0 }, { variant: 'B — Teaser headline', openRate: 42.1, clickRate: 10.8 }], suggestions: ['Personalize top story by segment', 'Add "Read time" to preview text'] },
  { id: 5, name: 'Welcome Series — Day 1', category: 'Onboarding', score: 95, timesUsed: 83, lastUsed: '2026-04-12', openRate: 80.2, clickRate: 39.5, subjectLine: 'Welcome to ALTA, {{firstName}}!', previewText: 'Here is everything you need to get started...', recommended: false, abHistory: [{ variant: 'A — Name personalization', openRate: 80.2, clickRate: 39.5 }, { variant: 'B — Generic welcome', openRate: 68.4, clickRate: 28.1 }], suggestions: ['Add animated welcome GIF', 'Include quick survey link'] },
  { id: 6, name: 'Retention Check-in', category: 'Retention', score: 82, timesUsed: 18, lastUsed: '2026-04-10', openRate: 90.0, clickRate: 30.0, subjectLine: 'Checking In — How Can ALTA Help You More?', previewText: 'We value your membership and want to hear from you...', recommended: false, abHistory: [{ variant: 'A — Question format', openRate: 90.0, clickRate: 30.0 }, { variant: 'B — Statement', openRate: 78.5, clickRate: 24.2 }], suggestions: ['Add NPS question inline', 'Personalize by membership tier'] },
  { id: 7, name: 'Compliance Deadline Reminder', category: 'Compliance', score: 74, timesUsed: 31, lastUsed: '2026-03-28', openRate: 35.5, clickRate: 10.1, subjectLine: 'Reminder: {{regulation}} Deadline Approaching', previewText: 'Only {{days}} days remaining to submit your filing...', recommended: false, abHistory: [{ variant: 'A — Days countdown', openRate: 35.5, clickRate: 10.1 }, { variant: 'B — Consequence focus', openRate: 32.8, clickRate: 9.4 }], suggestions: ['Use bold red deadline date', 'Add one-click filing link'] },
  { id: 8, name: 'Renewal — Final Notice', category: 'Renewal', score: 85, timesUsed: 24, lastUsed: '2026-03-30', openRate: 72.4, clickRate: 41.8, subjectLine: 'FINAL: Your Membership Expires {{date}}', previewText: 'This is your last chance to renew and keep your benefits...', recommended: false, abHistory: [{ variant: 'A — FINAL urgency', openRate: 72.4, clickRate: 41.8 }, { variant: 'B — Soft reminder', openRate: 58.2, clickRate: 29.6 }], suggestions: ['Add "What you will lose" section', 'Test SMS follow-up'] },
  { id: 9, name: 'EDge Program Invite', category: 'Events', score: 71, timesUsed: 8, lastUsed: '2026-03-15', openRate: 40.0, clickRate: 12.0, subjectLine: 'Join the EDge Program — Spring 2026 Cohort', previewText: 'A leadership development opportunity for emerging professionals...', recommended: false, abHistory: [{ variant: 'A — Standard', openRate: 40.0, clickRate: 12.0 }, { variant: 'B — Alumni quote', openRate: 43.2, clickRate: 14.1 }], suggestions: ['Feature alumni testimonial', 'Add application deadline badge'] },
  { id: 10, name: 'Committee Recruitment', category: 'Retention', score: 68, timesUsed: 6, lastUsed: '2026-03-10', openRate: 38.2, clickRate: 8.4, subjectLine: 'Your Voice Matters — Join an ALTA Committee', previewText: 'Shape the future of the title industry...', recommended: false, abHistory: [{ variant: 'A — Voice matters', openRate: 38.2, clickRate: 8.4 }, { variant: 'B — Direct ask', openRate: 35.6, clickRate: 7.9 }], suggestions: ['Personalize by interest area', 'Add committee chair video'] },
  { id: 11, name: 'TIPAC Pledge Drive', category: 'Newsletter', score: 76, timesUsed: 14, lastUsed: '2026-03-25', openRate: 50.0, clickRate: 14.9, subjectLine: 'Support TIPAC — Protect Our Industry', previewText: 'Your contribution makes a real difference in Washington...', recommended: false, abHistory: [{ variant: 'A — Protect theme', openRate: 50.0, clickRate: 14.9 }, { variant: 'B — Impact stats', openRate: 52.3, clickRate: 16.1 }], suggestions: ['Add legislative win counter', 'Include matching gift badge'] },
  { id: 12, name: 'Win-Back — 90 Day', category: 'Retention', score: 65, timesUsed: 10, lastUsed: '2026-03-05', openRate: 28.4, clickRate: 6.2, subjectLine: 'We Miss You, {{firstName}} — See What\'s New', previewText: 'It has been a while! Here is what you have been missing at ALTA...', recommended: false, abHistory: [{ variant: 'A — Miss you', openRate: 28.4, clickRate: 6.2 }, { variant: 'B — Discount offer', openRate: 31.1, clickRate: 8.8 }], suggestions: ['Add reactivation discount', 'Include "top 3 things you missed"'] },
];

type SortKey = 'score' | 'timesUsed' | 'lastUsed';

export default function TemplateVault() {
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [sortBy, setSortBy] = useState<SortKey>('score');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filtered = useMemo(() => {
    let list = categoryFilter === 'All' ? [...templates] : templates.filter(t => t.category === categoryFilter);
    list.sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'timesUsed') return b.timesUsed - a.timesUsed;
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    });
    return list;
  }, [categoryFilter, sortBy]);

  const categories: (Category | 'All')[] = ['All', 'Compliance', 'Renewal', 'Events', 'Newsletter', 'Onboarding', 'Retention'];
  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'score', label: 'Score' },
    { key: 'timesUsed', label: 'Most Used' },
    { key: 'lastUsed', label: 'Recent' },
  ];

  /* KPI calculations */
  const avgScore = Math.round(templates.reduce((s, t) => s + t.score, 0) / templates.length);
  const bestPerformer = templates.reduce((best, t) => t.score > best.score ? t : best, templates[0]);
  const usedLast30 = templates.filter(t => {
    const d = new Date(t.lastUsed);
    const cutoff = new Date('2026-03-15');
    return d >= cutoff;
  }).length;

  /* Chart data: avg open rate by template (top 8) */
  const chartTemplates = [...templates].sort((a, b) => b.openRate - a.openRate).slice(0, 8);

  return (
    <div className="p-6">
      {/* -- 1. Branded Header -- */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(20,184,166,0.2) 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            <LayoutTemplate className="w-5 h-5" style={{ color: C.indigo }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              TemplateVault<span style={{ color: C.indigo, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.indigo }}>
              Your best emails, organized and scored.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Every email template in your library, ranked by historical performance. Find top performers,
          clone winning designs, and use AI-powered suggestions to improve every send.
        </p>
      </div>

      {/* -- 2. SparkKpi Row -- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SparkKpi
          label="Templates Available"
          value={templates.length}
          sub="Across 6 categories"
          icon={LayoutTemplate}
          color={C.indigo}
          sparkData={[6, 7, 8, 9, 10, 11, 12]}
          sparkColor={C.indigo}
          trend={{ value: 20, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Avg Score"
          value={avgScore}
          sub="Out of 100"
          icon={Star}
          color={C.amber}
          sparkData={[68, 70, 72, 74, 76, 78, avgScore]}
          sparkColor={C.amber}
          trend={{ value: 5.2, label: 'improving' }}
          accent
        />
        <SparkKpi
          label="Best Performer"
          value={bestPerformer.name.length > 18 ? bestPerformer.name.substring(0, 18) + '...' : bestPerformer.name}
          sub={`Score: ${bestPerformer.score} | ${bestPerformer.openRate}% open rate`}
          icon={Award}
          color={C.green}
          sparkData={[85, 87, 89, 90, 92, 94, bestPerformer.score]}
          sparkColor={C.green}
          accent
        />
        <SparkKpi
          label="Templates Used (30d)"
          value={usedLast30}
          sub={`of ${templates.length} total`}
          icon={Mail}
          color={C.blue}
          sparkData={[5, 6, 7, 8, 8, 9, usedLast30]}
          sparkColor={C.blue}
          trend={{ value: 12.5, label: 'vs prior 30d' }}
          accent
        />
      </div>

      {/* -- 3. Filters & Sort -- */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Category:</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all hover:scale-[1.02]"
              style={{
                background: categoryFilter === cat
                  ? `color-mix(in srgb, ${cat === 'All' ? C.indigo : categoryColors[cat]} 15%, transparent)`
                  : 'var(--input-bg)',
                color: categoryFilter === cat
                  ? (cat === 'All' ? C.indigo : categoryColors[cat])
                  : 'var(--text-muted)',
                border: categoryFilter === cat
                  ? `1px solid ${cat === 'All' ? C.indigo : categoryColors[cat]}40`
                  : '1px solid var(--card-border)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Sort:</span>
          {sortOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
              style={{
                background: sortBy === opt.key ? `color-mix(in srgb, ${C.blue} 15%, transparent)` : 'var(--input-bg)',
                color: sortBy === opt.key ? C.blue : 'var(--text-muted)',
                border: sortBy === opt.key ? `1px solid ${C.blue}40` : '1px solid var(--card-border)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* -- 4. Template Gallery -- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {filtered.map(t => {
          const CatIcon = categoryIcons[t.category];
          const scoreColor = t.score >= 85 ? C.green : t.score >= 70 ? C.blue : t.score >= 50 ? C.orange : C.red;
          return (
            <div
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className="rounded-xl border cursor-pointer transition-all duration-200 hover:translate-y-[-3px] hover:shadow-lg overflow-hidden"
              style={{
                background: 'var(--card)',
                borderColor: 'var(--card-border)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              }}
            >
              {/* Gradient thumbnail */}
              <div className="relative h-24" style={{ background: categoryGradients[t.category] }}>
                {t.recommended && (
                  <div
                    className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold"
                    style={{ background: 'rgba(140,198,63,0.9)', color: '#fff' }}
                  >
                    <Sparkles className="w-2.5 h-2.5" /> Recommended
                  </div>
                )}
                <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                  <CatIcon className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.8)' }} />
                  <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>{t.category}</span>
                </div>
                {/* Score badge */}
                <div
                  className="absolute bottom-2 right-3 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--card)', border: `2px solid ${scoreColor}` }}
                >
                  <span className="text-sm font-extrabold" style={{ color: scoreColor }}>{t.score}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-3.5">
                <h3 className="text-[11px] font-bold mb-1 truncate" style={{ color: 'var(--heading)' }}>{t.name}</h3>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" style={{ color: C.blue }} />
                    <span className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>{t.openRate}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MousePointerClick className="w-3 h-3" style={{ color: C.green }} />
                    <span className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>{t.clickRate}%</span>
                  </div>
                </div>
                <MiniBar value={t.score} color={scoreColor} />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Used {t.timesUsed}x</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Last: {t.lastUsed}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* -- Action Buttons -- */}
      <div className="flex gap-3 mb-8">
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
          style={{
            background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`,
            color: '#fff',
            boxShadow: `0 4px 16px ${C.indigo}40`,
          }}
        >
          <Plus className="w-4 h-4" /> Create New Template
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
          style={{
            background: 'var(--input-bg)',
            color: 'var(--heading)',
            border: '1px solid var(--card-border)',
          }}
        >
          <Copy className="w-4 h-4" /> Clone Top Performer
        </button>
      </div>

      {/* -- 5. Performance Comparison Chart -- */}
      <Card
        title="Template Performance Comparison"
        subtitle="Average open rate by template (top 8)"
        className="mb-8"
      >
        <ClientChart
          type="bar"
          height={300}
          data={{
            labels: chartTemplates.map(t => t.name.length > 22 ? t.name.substring(0, 22) + '...' : t.name),
            datasets: [{
              label: 'Avg Open Rate %',
              data: chartTemplates.map(t => t.openRate),
              backgroundColor: chartTemplates.map(t => categoryColors[t.category] + '60'),
              borderColor: chartTemplates.map(t => categoryColors[t.category]),
              borderWidth: 2,
              borderRadius: 8,
            }],
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
                formatter: (v: number) => v.toFixed(1) + '%',
              },
            },
            scales: {
              y: { max: 100, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => v + '%' } },
              x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 }, maxRotation: 45 } },
            },
          }}
        />
      </Card>

      {/* -- 6. Template Detail Modal -- */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedTemplate(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold" style={{ color: 'var(--heading)' }}>{selectedTemplate.name}</h2>
                  {selectedTemplate.recommended && (
                    <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(140,198,63,0.15)', color: C.green }}>Recommended</span>
                  )}
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedTemplate.category} template</p>
              </div>
              <button onClick={() => setSelectedTemplate(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Score + Quick metrics */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-extrabold" style={{ color: selectedTemplate.score >= 85 ? C.green : selectedTemplate.score >= 70 ? C.blue : C.orange }}>{selectedTemplate.score}</div>
                  <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>Performance Score</div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                    <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Open Rate</div>
                    <div className="text-lg font-extrabold" style={{ color: C.blue }}>{selectedTemplate.openRate}%</div>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                    <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Click Rate</div>
                    <div className="text-lg font-extrabold" style={{ color: C.green }}>{selectedTemplate.clickRate}%</div>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                    <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Times Used</div>
                    <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{selectedTemplate.timesUsed}</div>
                  </div>
                  <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                    <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Last Used</div>
                    <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{selectedTemplate.lastUsed}</div>
                  </div>
                </div>
              </div>

              {/* Subject Line & Preview */}
              <div className="rounded-lg p-4" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Subject Line</div>
                <div className="text-sm font-bold mb-3" style={{ color: 'var(--heading)' }}>{selectedTemplate.subjectLine}</div>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Preview Text</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedTemplate.previewText}</div>
              </div>

              {/* A/B Test History */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4" style={{ color: C.indigo }} />
                  <span className="text-[11px] font-extrabold" style={{ color: 'var(--heading)' }}>A/B Test History</span>
                </div>
                <div className="space-y-2">
                  {selectedTemplate.abHistory.map((ab, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--input-bg)', border: i === 0 ? `1px solid ${C.green}30` : '1px solid var(--card-border)' }}>
                      <div className="flex items-center gap-2">
                        {i === 0 && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: C.green }} />}
                        <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{ab.variant}</span>
                        {i === 0 && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(140,198,63,0.15)', color: C.green }}>Winner</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Open: <span className="font-bold" style={{ color: C.blue }}>{ab.openRate}%</span></span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Click: <span className="font-bold" style={{ color: C.green }}>{ab.clickRate}%</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Improvements */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4" style={{ color: C.amber }} />
                  <span className="text-[11px] font-extrabold" style={{ color: 'var(--heading)' }}>Suggested Improvements</span>
                </div>
                <div className="space-y-2">
                  {selectedTemplate.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)' }}>
                      <TrendingUp className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: C.amber }} />
                      <span className="text-[10px]" style={{ color: 'var(--heading)' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.purple})`, color: '#fff' }}
                >
                  <Copy className="w-3.5 h-3.5" /> Clone Template
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
                  style={{ background: 'var(--input-bg)', color: 'var(--heading)', border: '1px solid var(--card-border)' }}
                >
                  <Mail className="w-3.5 h-3.5" /> Use in Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(99,102,241,0.08)', color: C.indigo, border: '1px solid rgba(99,102,241,0.15)' }}
        >
          <LayoutTemplate className="w-3 h-3" />
          TemplateVault&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
