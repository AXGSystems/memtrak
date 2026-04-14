'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Zap, Send, TrendingUp, Shield, ClipboardCheck, MessageSquare,
  Activity, Mail, Map, Camera, PlusCircle, GitBranch, Users,
  Calendar, UserPlus, FileText, BarChart3, Target, Layers, Lock, Star, ShieldCheck, Workflow, Filter,
  Radio, DollarSign, Brain, BookOpen, Heart,
  ShieldAlert, Gauge, Moon, Ear, Sparkles, Trophy, Settings, Link2,
  Type, UserX, Radar, Database, Bell, Gamepad2, Eye, Crown,
  ArrowRight, CornerDownLeft, ChevronUp, ChevronDown, Printer, Download, PenTool,
} from 'lucide-react';

/* ── All pages ── */
const PAGES = [
  { label: 'Daily Briefing', href: '/', icon: Zap, section: 'Overview' },
  { label: 'Email Briefing', href: '/briefing', icon: FileText, section: 'Overview' },
  { label: 'ROI Calculator', href: '/roi-calc', icon: Target, section: 'Overview' },
  { label: 'DecayRadar', href: '/decay-radar', icon: Radio, section: 'MEMTrak Exclusive' },
  { label: 'DisaffectionIndex', href: '/disaffection-index', icon: Shield, section: 'MEMTrak Exclusive' },
  { label: 'NarrativeBrief', href: '/narrative-brief', icon: BookOpen, section: 'MEMTrak Exclusive' },
  { label: 'RevenueTrace', href: '/revenue-trace', icon: DollarSign, section: 'MEMTrak Exclusive' },
  { label: 'TrustScore', href: '/trust-score', icon: Heart, section: 'MEMTrak Exclusive' },
  { label: 'StaffPulse', href: '/staff-pulse', icon: Users, section: 'MEMTrak Exclusive' },
  { label: 'SendBrain', href: '/send-brain', icon: Brain, section: 'MEMTrak Exclusive' },
  { label: 'UnifiedPulse', href: '/unified-pulse', icon: Layers, section: 'MEMTrak Exclusive' },
  { label: 'FatigueShield', href: '/fatigue-shield', icon: ShieldAlert, section: 'MEMTrak Exclusive' },
  { label: 'CampaignAutopsy', href: '/campaign-autopsy', icon: ClipboardCheck, section: 'MEMTrak Exclusive' },
  { label: 'ComplianceVault', href: '/compliance-vault', icon: Lock, section: 'MEMTrak Exclusive' },
  { label: 'BoardBrief', href: '/board-brief', icon: FileText, section: 'MEMTrak Exclusive' },
  { label: 'DarkModeProof', href: '/dark-mode-proof', icon: Moon, section: 'MEMTrak Exclusive' },
  { label: 'WhisperScore', href: '/whisper-score', icon: Ear, section: 'MEMTrak Exclusive' },
  { label: 'PredictiveContent', href: '/predictive-content', icon: Sparkles, section: 'MEMTrak Exclusive' },
  { label: 'BenchmarkLens', href: '/benchmark-lens', icon: Trophy, section: 'MEMTrak Exclusive' },
  { label: 'MemberPrefer', href: '/member-prefer', icon: Settings, section: 'MEMTrak Exclusive' },
  { label: 'CohortView', href: '/cohort-view', icon: Users, section: 'MEMTrak Exclusive' },
  { label: 'CollisionGuard', href: '/collision-guard', icon: Bell, section: 'MEMTrak Exclusive' },
  { label: 'LinkSentry', href: '/link-sentry', icon: Link2, section: 'MEMTrak Exclusive' },
  { label: 'ToneAnalyzer', href: '/tone-analyzer', icon: Type, section: 'MEMTrak Exclusive' },
  { label: 'WinbackEngine', href: '/winback-engine', icon: UserX, section: 'MEMTrak Exclusive' },
  { label: 'SeedTest', href: '/seed-test', icon: Radar, section: 'MEMTrak Exclusive' },
  { label: 'DataEnrich', href: '/data-enrich', icon: Database, section: 'MEMTrak Exclusive' },
  { label: 'AnomalyAlert', href: '/anomaly-alert', icon: Bell, section: 'MEMTrak Exclusive' },
  { label: 'EngagePoints', href: '/engage-points', icon: Gamepad2, section: 'MEMTrak Exclusive' },
  { label: 'GhostWatch', href: '/ghost-watch', icon: Eye, section: 'MEMTrak Exclusive' },
  { label: 'WhiteLabel', href: '/white-label', icon: Crown, section: 'MEMTrak Exclusive' },
  { label: 'All Campaigns', href: '/campaigns', icon: Send, section: 'Campaigns' },
  { label: 'Campaign Builder', href: '/campaign-builder', icon: PlusCircle, section: 'Campaigns' },
  { label: 'AI Subject Writer', href: '/ai-writer', icon: Zap, section: 'Campaigns' },
  { label: 'A/B Testing', href: '/ab-testing', icon: GitBranch, section: 'Campaigns' },
  { label: 'Send Calendar', href: '/calendar', icon: Calendar, section: 'Campaigns' },
  { label: 'Renewal Season', href: '/renewals', icon: Calendar, section: 'Campaigns' },
  { label: 'New Members', href: '/new-members', icon: UserPlus, section: 'Campaigns' },
  { label: 'MEMTrak AI', href: '/memtrak-ai', icon: Brain, section: 'Intelligence' },
  { label: 'Live Feed', href: '/live-feed', icon: Activity, section: 'Intelligence' },
  { label: 'Member Health', href: '/member-health', icon: Users, section: 'Intelligence' },
  { label: 'Campaign Compare', href: '/compare', icon: GitBranch, section: 'Intelligence' },
  { label: 'Analytics', href: '/intelligence', icon: TrendingUp, section: 'Intelligence' },
  { label: 'Engagement Scoring', href: '/scoring', icon: Star, section: 'Intelligence' },
  { label: 'Member Journey', href: '/journey', icon: Users, section: 'Intelligence' },
  { label: 'Smart Segments', href: '/segments', icon: Filter, section: 'Intelligence' },
  { label: 'Click Heatmap', href: '/heatmap', icon: BarChart3, section: 'Intelligence' },
  { label: 'Content Analysis', href: '/content-analysis', icon: BarChart3, section: 'Intelligence' },
  { label: 'Member NPS', href: '/nps', icon: Star, section: 'Intelligence' },
  { label: 'Benchmarks', href: '/benchmarks', icon: TrendingUp, section: 'Intelligence' },
  { label: 'Revenue Forecast', href: '/forecast', icon: TrendingUp, section: 'Intelligence' },
  { label: 'Privacy Metrics', href: '/privacy-metrics', icon: Shield, section: 'Intelligence' },
  { label: 'Workflows', href: '/workflows', icon: Workflow, section: 'Intelligence' },
  { label: 'InboxGuard', href: '/inbox-guard', icon: ShieldCheck, section: 'Deliverability' },
  { label: 'Deliverability Monitor', href: '/deliverability', icon: Activity, section: 'Deliverability' },
  { label: 'Spam Pre-Check', href: '/spam-check', icon: ShieldCheck, section: 'Deliverability' },
  { label: 'Address Hygiene', href: '/hygiene', icon: Shield, section: 'Deliverability' },
  { label: 'Mail Scanner', href: '/scanner', icon: Camera, section: 'Deliverability' },
  { label: 'Communication Log', href: '/log', icon: MessageSquare, section: 'Operations' },
  { label: 'Engagement Logger', href: '/engagement-log', icon: ClipboardCheck, section: 'Operations' },
  { label: 'Event Tracker', href: '/event-tracker', icon: Calendar, section: 'Operations' },
  { label: 'Email Templates', href: '/templates', icon: Mail, section: 'Operations' },
  { label: 'Ad Dashboard', href: '/ads', icon: BarChart3, section: 'Advertising' },
  { label: 'Ad Inventory', href: '/ads/inventory', icon: Layers, section: 'Advertising' },
  { label: 'Request Slot', href: '/ads/request', icon: Target, section: 'Advertising' },
  { label: 'Code Generator', href: '/generator', icon: Mail, section: 'Setup' },
  { label: 'API Docs', href: '/api-docs', icon: Mail, section: 'Setup' },
  { label: 'Integrations', href: '/integrations', icon: Layers, section: 'Setup' },
  { label: 'Data Export', href: '/data-export', icon: Shield, section: 'Setup' },
  { label: "What's New", href: '/whats-new', icon: Star, section: 'Setup' },
  { label: 'Email Audit', href: '/audit', icon: ClipboardCheck, section: 'Setup' },
  { label: 'Roadmap', href: '/roadmap', icon: Map, section: 'Setup' },
  { label: 'Security', href: '/security', icon: Lock, section: 'Setup' },
  { label: 'System Status', href: '/status', icon: Activity, section: 'Setup' },
  { label: 'Report Builder', href: '/report-builder', icon: FileText, section: 'Operations' },
  { label: 'Notification Center', href: '/notifications-center', icon: Bell, section: 'Operations' },
];

/* ── Quick actions ── */
const ACTIONS = [
  { label: 'Log Outreach', icon: PenTool, href: '/log' },
  { label: 'Send Campaign', icon: Send, href: '/campaign-builder' },
  { label: 'Print Report', icon: Printer, href: '/report-builder' },
  { label: 'Export Data', icon: Download, href: '/data-export' },
];

const RECENT_KEY = 'memtrak-cmd-recent';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load recent from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecent(JSON.parse(saved));
    } catch {}
  }, []);

  // Cmd+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Body overflow
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const navigate = useCallback((href: string, label: string) => {
    // Save to recent
    const updated = [href, ...recent.filter(r => r !== href)].slice(0, 5);
    setRecent(updated);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch {}

    setOpen(false);
    router.push(href);
  }, [recent, router]);

  // Build results list
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const items: { type: 'page' | 'action' | 'recent'; label: string; href: string; icon: typeof Zap; section?: string }[] = [];

    if (!q) {
      // Show recent + actions + some pages
      const recentPages = recent.map(href => PAGES.find(p => p.href === href)).filter(Boolean) as typeof PAGES;
      recentPages.forEach(p => items.push({ type: 'recent', label: p.label, href: p.href, icon: p.icon, section: p.section }));
      ACTIONS.forEach(a => items.push({ type: 'action', label: a.label, href: a.href, icon: a.icon }));
      PAGES.slice(0, 12).forEach(p => {
        if (!items.find(i => i.href === p.href)) {
          items.push({ type: 'page', label: p.label, href: p.href, icon: p.icon, section: p.section });
        }
      });
    } else {
      // Filter pages
      const matched = PAGES.filter(p =>
        p.label.toLowerCase().includes(q) ||
        p.section?.toLowerCase().includes(q) ||
        p.href.toLowerCase().includes(q)
      );
      matched.forEach(p => items.push({ type: 'page', label: p.label, href: p.href, icon: p.icon, section: p.section }));

      // Filter actions
      ACTIONS.filter(a => a.label.toLowerCase().includes(q)).forEach(a =>
        items.push({ type: 'action', label: a.label, href: a.href, icon: a.icon })
      );
    }

    return items;
  }, [query, recent]);

  // Reset active index on results change
  useEffect(() => {
    setActiveIndex(0);
  }, [results.length]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      navigate(results[activeIndex].href, results[activeIndex].label);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const active = listRef.current.querySelector('[data-active="true"]');
      if (active) active.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  if (!open) return null;

  // Group results for display
  const recentItems = results.filter(r => r.type === 'recent');
  const actionItems = results.filter(r => r.type === 'action');
  const pageItems = results.filter(r => r.type === 'page');

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
      style={{
        animation: 'cmdFadeIn 0.15s ease-out',
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-[560px] rounded-2xl border overflow-hidden"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--card-border)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          animation: 'cmdSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions..."
            className="flex-1 bg-transparent outline-none text-sm font-medium"
            style={{ color: 'var(--heading)' }}
          />
          <kbd
            className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
            style={{ color: 'var(--text-muted)', borderColor: 'var(--card-border)', background: 'var(--input-bg)' }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2" style={{ overscrollBehavior: 'contain' }}>
          {results.length === 0 && (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--card-border)' }} />
              <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No results found</div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Try a different search term</div>
            </div>
          )}

          {/* Recent */}
          {recentItems.length > 0 && (
            <div className="mb-1">
              <div className="px-4 py-1.5 text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>Recent</div>
              {recentItems.map((item, i) => {
                const globalIndex = results.indexOf(item);
                return <ResultRow key={`recent-${item.href}`} item={item} active={globalIndex === activeIndex} index={globalIndex} onClick={() => navigate(item.href, item.label)} />;
              })}
            </div>
          )}

          {/* Actions */}
          {actionItems.length > 0 && (
            <div className="mb-1">
              <div className="px-4 py-1.5 text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>Actions</div>
              {actionItems.map(item => {
                const globalIndex = results.indexOf(item);
                return <ResultRow key={`action-${item.label}`} item={item} active={globalIndex === activeIndex} index={globalIndex} onClick={() => navigate(item.href, item.label)} />;
              })}
            </div>
          )}

          {/* Pages */}
          {pageItems.length > 0 && (
            <div className="mb-1">
              <div className="px-4 py-1.5 text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-muted)' }}>Pages</div>
              {pageItems.map(item => {
                const globalIndex = results.indexOf(item);
                return <ResultRow key={`page-${item.href}`} item={item} active={globalIndex === activeIndex} index={globalIndex} onClick={() => navigate(item.href, item.label)} />;
              })}
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t" style={{ borderColor: 'var(--card-border)', background: 'color-mix(in srgb, var(--card) 80%, var(--background))' }}>
          <div className="flex items-center gap-4 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center w-4 h-4 rounded border text-[8px] font-bold" style={{ borderColor: 'var(--card-border)', background: 'var(--input-bg)' }}>
                <ChevronUp className="w-2.5 h-2.5" />
              </kbd>
              <kbd className="inline-flex items-center justify-center w-4 h-4 rounded border text-[8px] font-bold" style={{ borderColor: 'var(--card-border)', background: 'var(--input-bg)' }}>
                <ChevronDown className="w-2.5 h-2.5" />
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center px-1.5 h-4 rounded border text-[8px] font-bold" style={{ borderColor: 'var(--card-border)', background: 'var(--input-bg)' }}>
                <CornerDownLeft className="w-2.5 h-2.5" />
              </kbd>
              Open
            </span>
          </div>
          <div className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            {PAGES.length} pages available
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cmdFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cmdSlideDown {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ── Result Row Component ── */
function ResultRow({ item, active, index, onClick }: {
  item: { type: string; label: string; href: string; icon: typeof Zap; section?: string };
  active: boolean;
  index: number;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      data-active={active}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-100"
      style={{
        background: active ? 'color-mix(in srgb, var(--accent) 10%, var(--card))' : 'transparent',
        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'color-mix(in srgb, var(--accent) 8%, var(--card))';
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: active ? 'color-mix(in srgb, var(--accent) 18%, transparent)' : 'var(--input-bg)',
        }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="text-[12px] font-semibold truncate" style={{ color: active ? 'var(--heading)' : 'var(--heading)' }}>{item.label}</div>
        {item.section && (
          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{item.section}</div>
        )}
      </div>
      {item.type === 'action' && (
        <span className="text-[8px] px-1.5 py-0.5 rounded font-bold flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}>
          ACTION
        </span>
      )}
      {active && (
        <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
      )}
    </button>
  );
}
