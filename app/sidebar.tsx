'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap, Send, TrendingUp, Shield, ClipboardCheck, MessageSquare,
  Activity, Mail, Map, Camera, PlusCircle, GitBranch, Users,
  Calendar, UserPlus, FileText, BarChart3, Target, Layers, Lock, Star, ShieldCheck, Workflow, Filter,
  ChevronDown, Radio, DollarSign, Brain, BookOpen, Heart,
  ShieldAlert, Gauge, Moon, Ear, Sparkles, Trophy, Settings, Link2,
  Type, UserX, Radar, Database, Bell, Gamepad2, Eye, Crown, Briefcase,
  User, Crosshair, SlidersHorizontal, TrendingDown, Lightbulb, HeartPulse,
  Server, LayoutGrid, Palette, CircleDot,
} from 'lucide-react';

const sections = [
  {
    label: 'Overview', items: [
      { label: 'Daily Briefing', href: '/', icon: Zap },
      { label: 'Email Briefing', href: '/briefing', icon: FileText },
      { label: 'ROI Calculator', href: '/roi-calc', icon: Target },
    ]
  },
  {
    label: 'MEMTrak Exclusive', items: [
      { label: 'DecayRadar\u2122', href: '/decay-radar', icon: Radio },
      { label: 'DisaffectionIndex\u2122', href: '/disaffection-index', icon: Shield },
      { label: 'NarrativeBrief\u2122', href: '/narrative-brief', icon: BookOpen },
      { label: 'RevenueTrace\u2122', href: '/revenue-trace', icon: DollarSign },
      { label: 'TrustScore\u2122', href: '/trust-score', icon: Heart },
      { label: 'StaffPulse\u2122', href: '/staff-pulse', icon: Users },
      { label: 'SendBrain\u2122', href: '/send-brain', icon: Brain },
      { label: 'UnifiedPulse\u2122', href: '/unified-pulse', icon: Layers },
      { label: 'FatigueShield\u2122', href: '/fatigue-shield', icon: ShieldAlert },
      { label: 'CampaignAutopsy\u2122', href: '/campaign-autopsy', icon: ClipboardCheck },
      { label: 'ComplianceVault\u2122', href: '/compliance-vault', icon: Lock },
      { label: 'BoardBrief\u2122', href: '/board-brief', icon: FileText },
      { label: 'DarkModeProof\u2122', href: '/dark-mode-proof', icon: Moon },
      { label: 'WhisperScore\u2122', href: '/whisper-score', icon: Ear },
      { label: 'PredictiveContent\u2122', href: '/predictive-content', icon: Sparkles },
      { label: 'BenchmarkLens\u2122', href: '/benchmark-lens', icon: Trophy },
      { label: 'MemberPrefer\u2122', href: '/member-prefer', icon: Settings },
      { label: 'CohortView\u2122', href: '/cohort-view', icon: Users },
      { label: 'CollisionGuard\u2122', href: '/collision-guard', icon: Bell },
      { label: 'LinkSentry\u2122', href: '/link-sentry', icon: Link2 },
      { label: 'ToneAnalyzer\u2122', href: '/tone-analyzer', icon: Type },
      { label: 'WinbackEngine\u2122', href: '/winback-engine', icon: UserX },
      { label: 'SeedTest\u2122', href: '/seed-test', icon: Radar },
      { label: 'DataEnrich\u2122', href: '/data-enrich', icon: Database },
      { label: 'AnomalyAlert\u2122', href: '/anomaly-alert', icon: Bell },
      { label: 'EngagePoints\u2122', href: '/engage-points', icon: Gamepad2 },
      { label: 'GhostWatch\u2122', href: '/ghost-watch', icon: Eye },
      { label: 'WhiteLabel\u2122', href: '/white-label', icon: Crown },
      { label: 'Member360\u2122', href: '/member-360', icon: User },
      { label: 'GoalTracker\u2122', href: '/goal-tracker', icon: Crosshair },
      { label: 'ImpactCalc\u2122', href: '/impact-calc', icon: SlidersHorizontal },
      { label: 'TrendRadar\u2122', href: '/trend-radar', icon: TrendingDown },
      { label: 'AudienceBuilder\u2122', href: '/audience-builder', icon: Filter },
      { label: 'CampaignPlanner\u2122', href: '/campaign-planner', icon: Calendar },
      { label: 'DataQuality\u2122', href: '/data-quality', icon: Database },
      { label: 'RiskMatrix\u2122', href: '/risk-matrix', icon: CircleDot },
      { label: 'TemplateVault\u2122', href: '/template-vault', icon: Palette },
      { label: 'OpportunityFinder\u2122', href: '/opportunity-finder', icon: Lightbulb },
      { label: 'PerformancePulse\u2122', href: '/performance-pulse', icon: HeartPulse },
      { label: 'SystemDashboard\u2122', href: '/system-dashboard', icon: Server },
      { label: 'RetentionMap\u2122', href: '/retention-map', icon: Map },
      { label: 'ChannelMix\u2122', href: '/channel-mix', icon: Layers },
      { label: 'ABVault\u2122', href: '/ab-vault', icon: GitBranch },
      { label: 'ConversionFunnel\u2122', href: '/conversion-funnel', icon: Filter },
      { label: 'SentimentPulse\u2122', href: '/sentiment-pulse', icon: HeartPulse },
      { label: 'CompetitorRadar\u2122', href: '/competitor-radar', icon: Radar },
      { label: 'MemberVoice\u2122', href: '/member-voice', icon: MessageSquare },
      { label: 'ROIDashboard\u2122', href: '/roi-dashboard', icon: DollarSign },
    ]
  },
  {
    label: 'Campaigns', items: [
      { label: 'All Campaigns', href: '/campaigns', icon: Send },
      { label: 'Campaign Builder', href: '/campaign-builder', icon: PlusCircle },
      { label: 'AI Subject Writer', href: '/ai-writer', icon: Zap },
      { label: 'A/B Testing', href: '/ab-testing', icon: GitBranch },
      { label: 'Send Calendar', href: '/calendar', icon: Calendar },
      { label: 'Renewal Season', href: '/renewals', icon: Calendar },
      { label: 'New Members', href: '/new-members', icon: UserPlus },
    ]
  },
  {
    label: 'Intelligence', items: [
      { label: 'MEMTrak AI', href: '/memtrak-ai', icon: Brain },
      { label: 'Live Feed', href: '/live-feed', icon: Activity },
      { label: 'Member Health', href: '/member-health', icon: Users },
      { label: 'Campaign Compare', href: '/compare', icon: GitBranch },
      { label: 'Analytics', href: '/intelligence', icon: TrendingUp },
      { label: 'Engagement Scoring', href: '/scoring', icon: Star },
      { label: 'Member Journey', href: '/journey', icon: Users },
      { label: 'Smart Segments', href: '/segments', icon: Filter },
      { label: 'Click Heatmap', href: '/heatmap', icon: BarChart3 },
      { label: 'Content Analysis', href: '/content-analysis', icon: BarChart3 },
      { label: 'Member NPS', href: '/nps', icon: Star },
      { label: 'Benchmarks', href: '/benchmarks', icon: TrendingUp },
      { label: 'Revenue Forecast', href: '/forecast', icon: TrendingUp },
      { label: 'Privacy Metrics', href: '/privacy-metrics', icon: Shield },
      { label: 'Workflows', href: '/workflows', icon: Workflow },
    ]
  },
  {
    label: 'Deliverability', items: [
      { label: 'InboxGuard\u2122', href: '/inbox-guard', icon: ShieldCheck },
      { label: 'Monitor', href: '/deliverability', icon: Activity },
      { label: 'Spam Pre-Check', href: '/spam-check', icon: ShieldCheck },
      { label: 'Address Hygiene', href: '/hygiene', icon: Shield },
      { label: 'Mail Scanner', href: '/scanner', icon: Camera },
    ]
  },
  {
    label: 'Operations', items: [
      { label: 'Communication Log', href: '/log', icon: MessageSquare },
      { label: 'Engagement Logger', href: '/engagement-log', icon: ClipboardCheck },
      { label: 'Email Reminders', href: '/reminders', icon: Bell },
      { label: 'Activity Timeline', href: '/activity-timeline', icon: Activity },
      { label: 'Meeting Prep', href: '/meeting-prep', icon: Briefcase },
      { label: 'Event Tracker', href: '/event-tracker', icon: Calendar },
      { label: 'Email Templates', href: '/templates', icon: Mail },
      { label: 'Report Builder', href: '/report-builder', icon: FileText },
      { label: 'Notifications', href: '/notifications-center', icon: Bell },
    ]
  },
  {
    label: 'Advertising', items: [
      { label: 'Ad Dashboard', href: '/ads', icon: BarChart3 },
      { label: 'Inventory', href: '/ads/inventory', icon: Layers },
      { label: 'Request Slot', href: '/ads/request', icon: Target },
    ]
  },
  {
    label: 'Setup', items: [
      { label: 'Code Generator', href: '/generator', icon: Mail },
      { label: 'API Docs', href: '/api-docs', icon: Mail },
      { label: 'Integrations', href: '/integrations', icon: Layers },
      { label: 'Data Export', href: '/data-export', icon: Shield },
      { label: "What's New", href: '/whats-new', icon: Star },
      { label: 'Email Audit', href: '/audit', icon: ClipboardCheck },
      { label: 'Roadmap', href: '/roadmap', icon: Map },
      { label: 'Security', href: '/security', icon: Lock },
      { label: 'System Status', href: '/status', icon: Activity },
    ]
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Auto-expand section containing the active page
  const activeSection = sections.find(s => s.items.some(i => i.href === pathname));

  const toggleSection = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isSectionOpen = (label: string) => {
    if (collapsed[label] !== undefined) return !collapsed[label];
    return label === activeSection?.label || label === 'Overview';
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[260px] border-r flex flex-col z-50 overflow-hidden transition-colors duration-300"
      style={{ background: 'var(--sidebar-bg)', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      {/* Brand */}
      <div className="px-5 py-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base tracking-tight"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 70%, white) 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(140,198,63,0.25)',
            }}
          >
            M
          </div>
          <div>
            <div className="font-extrabold text-[15px] tracking-tight" style={{ color: 'var(--heading)' }}>MEMTrak</div>
            <div className="text-[10px] font-medium tracking-wide" style={{ color: 'var(--sidebar-text)' }}>Email Intelligence</div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-1">
        {sections.map(section => {
          const isOpen = isSectionOpen(section.label);
          const hasActive = section.items.some(i => i.href === pathname);

          return (
            <div key={section.label}>
              {/* Section header — clickable to collapse */}
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[10px] uppercase tracking-[0.12em] font-bold transition-colors"
                style={{ color: hasActive ? 'var(--accent)' : 'var(--sidebar-text)' }}
              >
                {section.label}
                <ChevronDown
                  className="w-3 h-3 transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', opacity: 0.5 }}
                />
              </button>

              {/* Section items */}
              {isOpen && (
                <div className="space-y-0.5 mt-0.5 mb-2">
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all duration-150"
                        style={active ? {
                          background: 'var(--sidebar-active)',
                          color: 'var(--accent)',
                          boxShadow: 'inset 3px 0 0 var(--accent)',
                        } : {
                          color: 'var(--sidebar-text)',
                        }}
                        onMouseEnter={e => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                            (e.currentTarget as HTMLElement).style.color = 'var(--heading)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!active) {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text)';
                          }
                        }}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ opacity: active ? 1 : 0.6 }} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Status footer */}
      <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
          <span className="text-[10px] font-medium" style={{ color: 'var(--sidebar-text)' }}>All systems operational</span>
        </div>
      </div>
    </aside>
  );
}
