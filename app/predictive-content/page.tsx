'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  Layers, Users, Target, TrendingUp, Zap, Sparkles,
  FileText, Settings, ArrowRight, CheckCircle, X,
  BookOpen, Calendar, UserPlus, Shield, BarChart3,
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

/* ── member personas ──────────────────────────────────────── */
interface Persona {
  name: string;
  type: string;
  icon: typeof Shield;
  color: string;
  desc: string;
  contentBlocks: ContentBlock[];
  openRate: number;
  clickRate: number;
}

interface ContentBlock {
  section: string;
  content: string;
  cta: string;
}

const personas: Persona[] = [
  {
    name: 'ACU Underwriter',
    type: 'ACU',
    icon: Shield,
    color: C.blue,
    desc: 'Compliance-focused, regulation-driven, high-revenue enterprise accounts',
    contentBlocks: [
      { section: 'Hero', content: 'New PFL Compliance Requirements for Q2 2026', cta: 'Review Compliance Guide' },
      { section: 'Feature', content: 'Updated state-by-state regulatory tracker with real-time alerts', cta: 'Access Tracker' },
      { section: 'Secondary', content: 'Upcoming Webinar: Underwriter Risk Management Best Practices', cta: 'Register Now' },
    ],
    openRate: 52,
    clickRate: 18,
  },
  {
    name: 'ACA Title Agent',
    type: 'ACA',
    icon: Calendar,
    color: C.green,
    desc: 'Event-driven, networking-focused, community-oriented mid-market members',
    contentBlocks: [
      { section: 'Hero', content: 'ALTA ONE 2026: Early Bird Ends in 14 Days', cta: 'Save Your Spot' },
      { section: 'Feature', content: 'Local networking events near you this month — 3 new meetups added', cta: 'View Events' },
      { section: 'Secondary', content: 'New Agent Success Toolkit: Closing Process Checklists', cta: 'Download Free' },
    ],
    openRate: 38,
    clickRate: 12,
  },
  {
    name: 'New Member (< 1yr)',
    type: 'NEW',
    icon: UserPlus,
    color: C.purple,
    desc: 'Onboarding phase, needs orientation, value discovery, and quick wins',
    contentBlocks: [
      { section: 'Hero', content: 'Welcome! Your ALTA Member Starter Guide Is Ready', cta: 'Start Your Journey' },
      { section: 'Feature', content: 'Top 5 member benefits you haven\'t activated yet', cta: 'Explore Benefits' },
      { section: 'Secondary', content: 'Meet your ALTA staff liaison — schedule a 15-min intro call', cta: 'Book Time' },
    ],
    openRate: 65,
    clickRate: 32,
  },
];

/* ── personalization rules ────────────────────────────────── */
const rules = [
  { condition: 'Member type = ACU', action: 'Show compliance content blocks', priority: 1, color: C.blue },
  { condition: 'Member type = ACA', action: 'Show events and networking content', priority: 1, color: C.green },
  { condition: 'Tenure < 12 months', action: 'Show onboarding welcome sequence', priority: 2, color: C.purple },
  { condition: 'Last event > 6 months', action: 'Promote upcoming local events', priority: 3, color: C.amber },
  { condition: 'Renewal within 60 days', action: 'Insert renewal reminder block', priority: 2, color: C.red },
  { condition: 'Committee member = true', action: 'Add committee meeting agenda', priority: 3, color: C.teal },
  { condition: 'Download count > 5', action: 'Recommend advanced resources', priority: 4, color: C.cyan },
  { condition: 'WhisperScore > 60, Email < 20', action: 'Reduce frequency, add phone CTA', priority: 2, color: C.orange },
];

/* ── lift comparison data ─────────────────────────────────── */
const liftData = [
  { metric: 'Open Rate', static_val: 33.5, dynamic: 44.2, lift: 31.9 },
  { metric: 'Click Rate', static_val: 2.7, dynamic: 8.4, lift: 211.1 },
  { metric: 'Conversion', static_val: 1.2, dynamic: 1.8, lift: 52.0 },
  { metric: 'Unsubscribe', static_val: 0.8, dynamic: 0.3, lift: -62.5 },
  { metric: 'Revenue/Send', static_val: 0.42, dynamic: 1.18, lift: 181.0 },
];

/* ══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function PredictiveContentPage() {
  const [activePersona, setActivePersona] = useState(0);
  const [selectedRule, setSelectedRule] = useState<typeof rules[0] | null>(null);

  return (
    <div className="p-6 space-y-6">
      {/* ── 1. Branded Header ──────────────────────────────── */}
      <div className="flex items-center gap-3 mb-1">
        <div className="relative">
          <Layers className="w-9 h-9" style={{ color: C.purple }} />
          <Sparkles className="absolute -bottom-0.5 -right-1 w-4 h-4" style={{ color: C.amber }} />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            PredictiveContent<span className="align-super text-[9px] font-black" style={{ color: 'var(--accent)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            One email, <strong style={{ color: 'var(--heading)' }}>personalized for everyone.</strong>
          </p>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
        PredictiveContent uses member data to dynamically assemble email content at send time.
        <strong style={{ color: 'var(--heading)' }}> One template renders differently for every member type</strong> &mdash;
        ACU underwriters see compliance, ACA agents see events, new members see onboarding.
        Result: <strong style={{ color: C.green }}>52% conversion increase</strong> vs static sends.
      </p>

      {/* ── 2. SparkKpi Row ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SparkKpi
          label="Content Variants Active"
          value={12}
          icon={Layers}
          color={C.purple}
          sparkData={[4, 5, 6, 8, 9, 10, 12]}
          sparkColor={C.purple}
          trend={{ value: 20, label: 'vs last month' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                12 active content variant blocks across 3 primary personas and 4 behavioral triggers.
              </p>
              <div className="space-y-2">
                {[
                  { name: 'Compliance Blocks', count: 4, color: C.blue },
                  { name: 'Events Blocks', count: 3, color: C.green },
                  { name: 'Onboarding Blocks', count: 3, color: C.purple },
                  { name: 'Renewal Blocks', count: 2, color: C.red },
                ].map(v => (
                  <div key={v.name} className="flex items-center justify-between text-[11px] py-1 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: v.color }} />
                      <span style={{ color: 'var(--heading)' }}>{v.name}</span>
                    </span>
                    <span className="font-bold" style={{ color: v.color }}>{v.count}</span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Members Personalized"
          value="4,994"
          icon={Users}
          color={C.blue}
          sparkData={[3200, 3500, 3800, 4100, 4400, 4700, 4994]}
          sparkColor={C.blue}
          trend={{ value: 15.2, label: 'reach expansion' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Every member in the ALTA database receives personalized content based on their type, tenure, engagement pattern, and behavioral signals.
              </p>
              <div className="space-y-2">
                {personas.map(p => (
                  <div key={p.type} className="flex items-center justify-between text-[11px] py-1 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <span className="flex items-center gap-1.5">
                      <p.icon className="w-3 h-3" style={{ color: p.color }} />
                      <span style={{ color: 'var(--heading)' }}>{p.name}</span>
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{p.type}</span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Avg Relevance Score"
          value="87%"
          icon={Target}
          color={C.green}
          sparkData={[68, 72, 75, 79, 82, 85, 87]}
          sparkColor={C.green}
          trend={{ value: 8.7, label: 'vs static baseline' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Relevance Score measures how well the content matches the member&apos;s profile, interests, and current lifecycle stage.
                87% means the average member sees content specifically chosen for their needs.
              </p>
            </div>
          }
        />
        <SparkKpi
          label="Lift vs Static"
          value="+52%"
          icon={TrendingUp}
          color={C.amber}
          sparkData={[18, 25, 30, 36, 42, 48, 52]}
          sparkColor={C.amber}
          trend={{ value: 52, label: 'conversion increase' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Across all campaigns using PredictiveContent, conversion rates are 52% higher than identical campaigns sent with static (one-size-fits-all) content.
              </p>
              <div className="space-y-2">
                {liftData.map(d => (
                  <div key={d.metric} className="flex items-center justify-between text-[11px] py-1 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <span style={{ color: 'var(--heading)' }}>{d.metric}</span>
                    <span className="font-bold" style={{ color: d.lift > 0 ? C.green : C.green }}>{d.lift > 0 ? '+' : ''}{d.lift}%</span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      </div>

      {/* ── 3. Template Rendering Visualization ───────────── */}
      <Card
        title="One Template, Three Experiences"
        subtitle="Same email renders differently based on member profile"
        detailTitle="Content Assembly Engine"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              PredictiveContent dynamically assembles each email at send time. The template defines layout and structure;
              the content blocks are swapped based on member attributes, behavioral signals, and lifecycle stage.
            </p>
            {personas.map(p => (
              <div key={p.type} className="rounded-lg border p-4" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <p.icon className="w-4 h-4" style={{ color: p.color }} />
                  <div className="text-[12px] font-bold" style={{ color: 'var(--heading)' }}>{p.name}</div>
                </div>
                <p className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="rounded p-2" style={{ background: 'var(--input-bg)' }}>
                    <div className="font-bold" style={{ color: C.green }}>Open: {p.openRate}%</div>
                  </div>
                  <div className="rounded p-2" style={{ background: 'var(--input-bg)' }}>
                    <div className="font-bold" style={{ color: C.blue }}>Click: {p.clickRate}%</div>
                  </div>
                  <div className="rounded p-2" style={{ background: 'var(--input-bg)' }}>
                    <div className="font-bold" style={{ color: C.purple }}>Blocks: {p.contentBlocks.length}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      >
        {/* Persona tabs */}
        <div className="flex gap-2 mb-4">
          {personas.map((p, i) => (
            <button
              key={p.type}
              onClick={() => setActivePersona(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
              style={{
                background: activePersona === i ? `${p.color}20` : 'var(--input-bg)',
                color: activePersona === i ? p.color : 'var(--text-muted)',
                borderWidth: 1,
                borderColor: activePersona === i ? `${p.color}40` : 'transparent',
              }}
            >
              <p.icon className="w-3 h-3" />
              {p.name}
            </button>
          ))}
        </div>

        {/* Three email previews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {personas.map((persona, idx) => (
            <div
              key={persona.type}
              className="rounded-xl overflow-hidden border transition-all duration-300"
              style={{
                borderColor: activePersona === idx ? persona.color : 'var(--card-border)',
                borderWidth: activePersona === idx ? 2 : 1,
                opacity: activePersona === idx ? 1 : 0.6,
                transform: activePersona === idx ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {/* Email header */}
              <div className="px-3 py-2 flex items-center justify-between" style={{ background: `${persona.color}15` }}>
                <div className="flex items-center gap-1.5">
                  <persona.icon className="w-3 h-3" style={{ color: persona.color }} />
                  <span className="text-[9px] font-bold" style={{ color: persona.color }}>{persona.name}</span>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${persona.color}20`, color: persona.color }}>
                  {persona.type}
                </span>
              </div>

              {/* ALTA branded header */}
              <div className="px-3 py-2 text-center" style={{ background: '#002D5C' }}>
                <div className="text-[11px] font-extrabold tracking-wide" style={{ color: '#FFFFFF' }}>ALTA</div>
              </div>

              {/* Content blocks */}
              {persona.contentBlocks.map((block, bi) => (
                <div
                  key={bi}
                  className="px-3 py-3 border-b"
                  style={{
                    background: bi === 0 ? `${persona.color}08` : 'var(--card)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <div className="text-[8px] uppercase font-bold mb-1" style={{ color: persona.color }}>{block.section}</div>
                  <div className="text-[10px] font-semibold mb-1.5" style={{ color: 'var(--heading)' }}>{block.content}</div>
                  <div
                    className="inline-block px-3 py-1 rounded text-[8px] font-bold"
                    style={{ background: persona.color, color: '#FFFFFF' }}
                  >
                    {block.cta}
                  </div>
                </div>
              ))}

              {/* Stats footer */}
              <div className="px-3 py-2 flex justify-between text-[9px]" style={{ background: 'var(--input-bg)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Open: <strong style={{ color: C.green }}>{persona.openRate}%</strong></span>
                <span style={{ color: 'var(--text-muted)' }}>Click: <strong style={{ color: C.blue }}>{persona.clickRate}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 4. Personalization Rules + Lift Chart ─────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          title="Content Block Configurator"
          subtitle="8 active personalization rules"
          detailTitle="Rule Configuration"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Rules are evaluated in priority order. When multiple rules match a member, higher-priority rules take precedence.
                Each rule maps a condition to a content block swap.
              </p>
              {rules.map((rule, i) => (
                <div key={i} className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>Priority {rule.priority}</span>
                    <span className="w-2 h-2 rounded-full" style={{ background: rule.color }} />
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <strong style={{ color: rule.color }}>IF</strong> {rule.condition} <strong style={{ color: rule.color }}>THEN</strong> {rule.action}
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-2 mt-1">
            {rules.map((rule, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all hover:translate-x-1"
                style={{ background: 'var(--input-bg)' }}
                onClick={() => setSelectedRule(rule)}
              >
                <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: rule.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold truncate" style={{ color: 'var(--heading)' }}>
                    {rule.condition}
                  </div>
                  <div className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>
                    <ArrowRight className="w-2 h-2 inline" style={{ color: rule.color }} /> {rule.action}
                  </div>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: `${rule.color}20`, color: rule.color }}>
                  P{rule.priority}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Dynamic vs Static Performance" subtitle="Measured lift across key metrics">
          <ClientChart
            type="bar"
            height={260}
            data={{
              labels: liftData.map(d => d.metric),
              datasets: [
                {
                  label: 'Static Send',
                  data: liftData.map(d => d.static_val),
                  backgroundColor: `${C.blue}80`,
                  borderColor: C.blue,
                  borderWidth: 1,
                  borderRadius: 4,
                },
                {
                  label: 'PredictiveContent',
                  data: liftData.map(d => d.dynamic),
                  backgroundColor: `${C.green}80`,
                  borderColor: C.green,
                  borderWidth: 1,
                  borderRadius: 4,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom' as const,
                  labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 10 } },
                },
              },
              scales: {
                y: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => `${v}%` } },
                x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 } } },
              },
            }}
          />
          <div className="mt-3 rounded-lg p-3 text-center" style={{ background: 'rgba(140,198,63,0.08)' }}>
            <span className="text-[11px] font-bold" style={{ color: C.green }}>+52% conversion lift with dynamic content</span>
          </div>
        </Card>
      </div>

      {/* ── 5. Bottom Insights Row ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Content Performance by Persona" subtitle="Which content resonates most">
          <div className="space-y-3 mt-2">
            {personas.map(p => (
              <div key={p.type} className="rounded-lg p-3" style={{ background: `${p.color}08` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: 'var(--heading)' }}>
                    <p.icon className="w-3 h-3" style={{ color: p.color }} />
                    {p.name}
                  </span>
                  <span className="text-[9px] font-bold" style={{ color: p.color }}>{p.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Open Rate: </span>
                    <span className="font-bold" style={{ color: C.green }}>{p.openRate}%</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Click Rate: </span>
                    <span className="font-bold" style={{ color: C.blue }}>{p.clickRate}%</span>
                  </div>
                </div>
                <div className="mt-1.5">
                  <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: 'var(--card-border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${p.openRate}%`, background: p.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Assembly Pipeline" subtitle="How PredictiveContent builds each email">
          <div className="space-y-2 mt-2">
            {[
              { step: 1, label: 'Profile Lookup', desc: 'Member type, tenure, segment, revenue tier', icon: Users, color: C.blue },
              { step: 2, label: 'Signal Analysis', desc: 'Engagement history, WhisperScore, event attendance', icon: BarChart3, color: C.purple },
              { step: 3, label: 'Rule Matching', desc: 'Evaluate 8 personalization rules by priority', icon: Settings, color: C.orange },
              { step: 4, label: 'Block Assembly', desc: 'Swap content blocks to match profile', icon: Layers, color: C.green },
              { step: 5, label: 'Quality Check', desc: 'DarkModeProof scan + accessibility validation', icon: CheckCircle, color: C.teal },
              { step: 6, label: 'Send', desc: 'Personalized email delivered to inbox', icon: Zap, color: C.amber },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3 px-3 py-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0" style={{ background: `${item.color}20`, color: item.color }}>
                  {item.step}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{item.label}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Expected Impact" subtitle="Projected outcomes from full deployment">
          <div className="space-y-3 mt-2">
            {[
              { metric: 'Email-Attributed Revenue', before: '$672K', after: '$1.02M', lift: '+52%', color: C.green },
              { metric: 'Avg Open Rate', before: '33.5%', after: '44.2%', lift: '+32%', color: C.blue },
              { metric: 'Unsubscribe Rate', before: '0.8%', after: '0.3%', lift: '-63%', color: C.green },
              { metric: 'Content Relevance', before: '52%', after: '87%', lift: '+67%', color: C.purple },
            ].map(item => (
              <div key={item.metric} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>{item.metric}</div>
                <div className="flex items-center gap-3">
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <span style={{ color: C.red }}>{item.before}</span>
                    <ArrowRight className="w-3 h-3 inline mx-1" style={{ color: 'var(--text-muted)' }} />
                    <span className="font-bold" style={{ color: C.green }}>{item.after}</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: `${item.color}20`, color: item.color }}>
                    {item.lift}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Rule Detail Modal ─────────────────────────────── */}
      {selectedRule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedRule(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Personalization Rule</h3>
              <button onClick={() => setSelectedRule(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-lg p-3" style={{ background: `${selectedRule.color}10` }}>
                <div className="text-[10px] uppercase font-bold mb-1" style={{ color: selectedRule.color }}>Condition</div>
                <div className="text-[12px] font-semibold" style={{ color: 'var(--heading)' }}>{selectedRule.condition}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Action</div>
                <div className="text-[12px] font-semibold" style={{ color: 'var(--heading)' }}>{selectedRule.action}</div>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span style={{ color: 'var(--text-muted)' }}>Priority Level</span>
                <span className="font-bold text-lg" style={{ color: selectedRule.color }}>P{selectedRule.priority}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
