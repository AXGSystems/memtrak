'use client';

import { useState, useMemo } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import {
  Bell, AlertTriangle, Info, CheckCircle2, X, Clock, Filter,
  Shield, Mail, TrendingDown, Users, Zap, Settings, Eye,
  ChevronDown, Trash2, Check, AlertCircle, Activity, RefreshCw,
} from 'lucide-react';

/* ── Palette ── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  purple: '#a855f7',
  gold: '#C6A75E',
};

/* ── Severity config ── */
const SEVERITY = {
  critical: { color: C.red, bg: `${C.red}18`, icon: AlertTriangle, label: 'Critical' },
  warning: { color: C.orange, bg: `${C.orange}18`, icon: AlertCircle, label: 'Warning' },
  info: { color: C.blue, bg: `${C.blue}18`, icon: Info, label: 'Info' },
  completed: { color: C.green, bg: `${C.green}18`, icon: CheckCircle2, label: 'Completed' },
} as const;

type Severity = keyof typeof SEVERITY;

interface Notification {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  category: string;
}

/* ── Synthetic notifications ── */
const NOW = new Date('2026-04-14T14:30:00');
function timeAgo(hoursAgo: number): string {
  const d = new Date(NOW.getTime() - hoursAgo * 3600000);
  return d.toISOString();
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  // Today
  { id: 'n1', title: 'Heritage Abstract — Gone Dark', description: 'Engagement decay score hit 100%. Zero opens in 90+ days. $517 annual revenue at risk. Immediate phone outreach recommended.', severity: 'critical', timestamp: timeAgo(0.5), read: false, actionLabel: 'View in DecayRadar', category: 'decay' },
  { id: 'n2', title: 'Bounce Rate Spike — PFL Compliance Wave 3', description: 'Bounce rate reached 7.4% on the PFL Compliance April Wave 3 campaign. 220 hard bounces detected. Domain reputation may be affected.', severity: 'critical', timestamp: timeAgo(1), read: false, actionLabel: 'Run Hygiene Check', category: 'bounce' },
  { id: 'n3', title: 'A/B Test Winner Declared — Renewal Subject', description: '"Action Required: Your 2026 Membership" outperformed "Time to Renew" by 34%. Statistical confidence: 97.2%. Auto-applied to remaining sends.', severity: 'completed', timestamp: timeAgo(2), read: false, actionLabel: 'View Results', category: 'ab-test' },
  { id: 'n4', title: 'ALTA ONE Early Bird — 780 Clicks', description: 'The ALTA ONE 2026 Early Bird Registration campaign hit 780 clicks (16.3% CTR). Top-performing campaign this quarter.', severity: 'info', timestamp: timeAgo(3), read: false, category: 'campaign' },
  { id: 'n5', title: 'First American Title — Engagement Declining', description: 'Decay score increased to 75%. Open rate dropped from 80% to 20%. $61,554 annual revenue at risk. CEO check-in recommended.', severity: 'critical', timestamp: timeAgo(4), read: false, actionLabel: 'Route to CEO', category: 'decay' },
  // Yesterday
  { id: 'n6', title: 'CAN-SPAM Compliance Reminder', description: 'Monthly compliance check: All 9 sent campaigns include valid unsubscribe links and physical address. 100% compliant.', severity: 'completed', timestamp: timeAgo(20), read: true, category: 'compliance' },
  { id: 'n7', title: 'Renewal Workflow Triggered — 12 Members', description: 'The 90-day renewal countdown workflow enrolled 12 new members approaching April expiration. Email #1 sending tomorrow at 8:00 AM.', severity: 'info', timestamp: timeAgo(22), read: true, actionLabel: 'View Workflow', category: 'workflow' },
  { id: 'n8', title: 'System Update — SendBrain Model Refresh', description: 'SendBrain individual send-time model retrained on latest 30 days of data. 2,847 member profiles updated. Predicted lift: +3.2%.', severity: 'info', timestamp: timeAgo(26), read: true, category: 'system' },
  { id: 'n9', title: 'Title News Weekly — High Unsubscribes', description: '8 unsubscribes from Issue #15 — above the 5-per-campaign threshold. Review content and frequency settings.', severity: 'warning', timestamp: timeAgo(28), read: true, actionLabel: 'Review Campaign', category: 'campaign' },
  // This Week
  { id: 'n10', title: 'EDge Spring Cohort — Registration Goal Met', description: 'EDge Program Spring Cohort Invite achieved 173 clicks and 68 registrations, meeting the 60-registration goal.', severity: 'completed', timestamp: timeAgo(72), read: true, category: 'campaign' },
  { id: 'n11', title: 'DMARC Policy Update Available', description: 'Current DMARC is p=none. Recommend upgrade to p=quarantine to enable BIMI logo display. Expected inbox placement improvement: +12%.', severity: 'warning', timestamp: timeAgo(96), read: true, actionLabel: 'View InboxGuard', category: 'compliance' },
  { id: 'n12', title: 'Address Hygiene — 2,800 Stale Addresses', description: '15.2% of the mailing list has not opened in 6+ months. Recommended: move to re-engagement campaign before suppression.', severity: 'warning', timestamp: timeAgo(120), read: true, actionLabel: 'Run Cleanup', category: 'hygiene' },
  // Earlier
  { id: 'n13', title: 'Q1 Revenue Attribution Complete', description: 'Email campaigns attributed $673,024 in Q1 2026 revenue. Renewals ($406,992) led, followed by Events ($196,000) and Advocacy ($67,500).', severity: 'completed', timestamp: timeAgo(240), read: true, category: 'system' },
  { id: 'n14', title: 'Engagement Decay Workflow — 3 Re-engaged', description: 'The automated decay re-engagement sequence recovered 3 of 8 enrolled members. $2,174 in annual revenue retained.', severity: 'completed', timestamp: timeAgo(336), read: true, category: 'workflow' },
  { id: 'n15', title: 'New Member Onboarding — 100% Delivery', description: 'Welcome Series Email #1 delivered to all 81 of 83 new members (97.6% delivery). 65 unique opens (80.2% open rate).', severity: 'info', timestamp: timeAgo(400), read: true, category: 'campaign' },
];

/* ── Notification preferences ── */
const PREF_CATEGORIES = [
  { id: 'decay', label: 'Decay Alerts', icon: TrendingDown, desc: 'Member engagement decline warnings' },
  { id: 'bounce', label: 'Bounce Warnings', icon: Mail, desc: 'Hard bounce and delivery failures' },
  { id: 'campaign', label: 'Campaign Completions', icon: Zap, desc: 'Send completions and performance updates' },
  { id: 'compliance', label: 'Compliance Reminders', icon: Shield, desc: 'CAN-SPAM and regulatory checks' },
  { id: 'system', label: 'System Updates', icon: Activity, desc: 'Model refreshes and platform changes' },
  { id: 'ab-test', label: 'A/B Test Results', icon: RefreshCw, desc: 'Winner declarations and insights' },
  { id: 'workflow', label: 'Workflow Triggers', icon: Settings, desc: 'Automation enrollments and outcomes' },
  { id: 'hygiene', label: 'Hygiene Alerts', icon: Shield, desc: 'Address quality and cleanup reminders' },
];

/* ── Time group helper ── */
function getTimeGroup(timestamp: string): string {
  const d = new Date(timestamp);
  const diffHours = (NOW.getTime() - d.getTime()) / 3600000;
  if (diffHours < 24) return 'Today';
  if (diffHours < 48) return 'Yesterday';
  if (diffHours < 168) return 'This Week';
  return 'Earlier';
}

const TIME_GROUP_ORDER = ['Today', 'Yesterday', 'This Week', 'Earlier'];

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<'all' | Severity>('all');
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(PREF_CATEGORIES.map(c => [c.id, true]))
  );
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const tabs = [
    { id: 'all' as const, label: 'All', count: notifications.length },
    { id: 'critical' as const, label: 'Critical', count: notifications.filter(n => n.severity === 'critical').length },
    { id: 'warning' as const, label: 'Warning', count: notifications.filter(n => n.severity === 'warning').length },
    { id: 'info' as const, label: 'Info', count: notifications.filter(n => n.severity === 'info').length },
    { id: 'completed' as const, label: 'Completed', count: notifications.filter(n => n.severity === 'completed').length },
  ];

  const filtered = useMemo(() => {
    let items = notifications.filter(n => !dismissedIds.has(n.id));
    if (activeTab !== 'all') items = items.filter(n => n.severity === activeTab);
    return items;
  }, [notifications, activeTab, dismissedIds]);

  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    filtered.forEach(n => {
      const group = getTimeGroup(n.timestamp);
      if (!groups[group]) groups[group] = [];
      groups[group].push(n);
    });
    return groups;
  }, [filtered]);

  const unreadCount = notifications.filter(n => !n.read && !dismissedIds.has(n.id)).length;
  const criticalCount = notifications.filter(n => n.severity === 'critical' && !dismissedIds.has(n.id)).length;
  const resolvedToday = notifications.filter(n => n.severity === 'completed' && getTimeGroup(n.timestamp) === 'Today').length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearCompleted = () => {
    setDismissedIds(prev => {
      const next = new Set(prev);
      notifications.filter(n => n.severity === 'completed').forEach(n => next.add(n.id));
      return next;
    });
  };

  const dismiss = (id: string) => {
    setDismissedIds(prev => { const next = new Set(prev); next.add(id); return next; });
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    const diffHours = (NOW.getTime() - d.getTime()) / 3600000;
    if (diffHours < 1) return `${Math.round(diffHours * 60)}m ago`;
    if (diffHours < 24) return `${Math.round(diffHours)}h ago`;
    if (diffHours < 48) return `Yesterday ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="p-6 space-y-6" style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* SparkKPIs */}
      <div className="grid grid-cols-4 gap-4">
        <SparkKpi
          label="Unread"
          value={unreadCount}
          icon={Bell}
          color={C.blue}
          sparkData={[8, 12, 6, 10, 4, 7, 9, 5, 3, 6, 4, unreadCount]}
          trend={{ value: -22.0, label: 'vs yesterday' }}
          sub="Notifications pending review"
        />
        <SparkKpi
          label="Critical"
          value={criticalCount}
          icon={AlertTriangle}
          color={C.red}
          sparkData={[2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 3, criticalCount]}
          trend={{ value: 50.0, label: 'vs yesterday' }}
          sub="Requires immediate attention"
          accent
        />
        <SparkKpi
          label="Resolved Today"
          value={resolvedToday}
          icon={CheckCircle2}
          color={C.green}
          sparkData={[4, 6, 3, 5, 7, 4, 6, 5, 8, 6, 4, resolvedToday]}
          sub="Completed actions today"
        />
        <SparkKpi
          label="Avg Response Time"
          value="2.4h"
          icon={Clock}
          color={C.purple}
          sparkData={[4.2, 3.8, 3.1, 2.9, 3.5, 2.8, 2.6, 3.0, 2.2, 2.5, 2.3, 2.4]}
          trend={{ value: -18.5, label: 'vs last week' }}
          sub="Time to first action"
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main notification feed */}
        <div className="col-span-8 space-y-4">
          {/* Tabs + Actions */}
          <Card noPad>
            <div className="px-5 pt-3 pb-0">
              <div className="flex items-center justify-between mb-3">
                {/* Filter tabs */}
                <div className="flex gap-1">
                  {tabs.map(t => {
                    const active = activeTab === t.id;
                    const sev = t.id !== 'all' ? SEVERITY[t.id as Severity] : null;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200"
                        style={{
                          background: active ? (sev ? sev.bg : 'color-mix(in srgb, var(--accent) 12%, transparent)') : 'transparent',
                          color: active ? (sev ? sev.color : 'var(--accent)') : 'var(--text-muted)',
                          border: active ? `1px solid ${sev ? sev.color + '40' : 'var(--accent)'}` : '1px solid transparent',
                        }}
                      >
                        {t.label}
                        {t.count > 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{
                            background: active ? (sev ? sev.color + '25' : 'var(--accent)') : 'var(--input-bg)',
                            color: active ? (sev ? sev.color : '#fff') : 'var(--text-muted)',
                          }}>{t.count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Bulk actions */}
                <div className="flex gap-2">
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all hover:opacity-80 border"
                    style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)', background: 'var(--input-bg)' }}
                  >
                    <Eye className="w-3 h-3" /> Mark All Read
                  </button>
                  <button
                    onClick={clearCompleted}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all hover:opacity-80 border"
                    style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)', background: 'var(--input-bg)' }}
                  >
                    <Trash2 className="w-3 h-3" /> Clear Completed
                  </button>
                </div>
              </div>
            </div>

            {/* Notification list grouped by time */}
            <div className="px-5 pb-4">
              {TIME_GROUP_ORDER.map(group => {
                const items = grouped[group];
                if (!items || items.length === 0) return null;
                return (
                  <div key={group} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>{group}</div>
                      <div className="flex-1 h-px" style={{ background: 'var(--card-border)' }} />
                      <div className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>{items.length}</div>
                    </div>
                    <div className="space-y-2">
                      {items.map((n, i) => {
                        const sev = SEVERITY[n.severity];
                        const SevIcon = sev.icon;
                        return (
                          <div
                            key={n.id}
                            className="rounded-xl border p-4 transition-all duration-200 hover:translate-y-[-1px]"
                            style={{
                              borderColor: !n.read ? sev.color + '40' : 'var(--card-border)',
                              background: !n.read ? sev.bg : 'var(--card)',
                              boxShadow: !n.read ? `0 2px 12px ${sev.color}10` : '0 1px 4px rgba(0,0,0,0.04)',
                              animation: `slideUp 0.25s ease-out ${i * 0.04}s both`,
                              borderLeftWidth: 3,
                              borderLeftColor: sev.color,
                            }}
                            onClick={() => markRead(n.id)}
                          >
                            <div className="flex items-start gap-3">
                              {/* Severity Icon */}
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: sev.bg }}>
                                <SevIcon className="w-4 h-4" style={{ color: sev.color }} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{n.title}</h3>
                                  {!n.read && (
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: sev.color }} />
                                  )}
                                </div>
                                <p className="text-[11px] leading-relaxed mt-1" style={{ color: 'var(--text-muted)' }}>{n.description}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-[9px] font-medium" style={{ color: 'var(--text-muted)' }}>
                                    <Clock className="w-2.5 h-2.5 inline mr-0.5" style={{ verticalAlign: 'text-bottom' }} />
                                    {formatTime(n.timestamp)}
                                  </span>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: sev.bg, color: sev.color }}>{sev.label}</span>
                                  {n.actionLabel && (
                                    <button className="text-[10px] font-bold transition-all hover:opacity-80" style={{ color: 'var(--accent)' }}>
                                      {n.actionLabel} &rarr;
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Dismiss */}
                              <button
                                onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                                className="p-1 rounded-lg transition-all hover:scale-110 flex-shrink-0"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--card-border)' }} />
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>All clear</div>
                  <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>No notifications in this category</div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right sidebar: Preferences */}
        <div className="col-span-4 space-y-4">
          {/* Quick Stats */}
          <Card title="Activity Summary" subtitle="Last 7 days">
            <div className="space-y-3">
              {[
                { label: 'Total Notifications', value: 42, color: C.blue },
                { label: 'Actions Taken', value: 28, color: C.green },
                { label: 'Avg Daily Alerts', value: 6, color: C.orange },
                { label: 'Auto-resolved', value: 11, color: C.purple },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                  <span className="text-sm font-extrabold" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Notification Preferences */}
          <Card title="Notification Preferences" subtitle="Choose which alerts to receive">
            <div className="space-y-2">
              {PREF_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isOn = prefs[cat.id];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setPrefs(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 border"
                    style={{
                      background: isOn ? 'color-mix(in srgb, var(--accent) 5%, var(--card))' : 'var(--input-bg)',
                      borderColor: isOn ? 'var(--accent)' : 'var(--card-border)',
                      opacity: isOn ? 1 : 0.6,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isOn ? 'var(--accent)' : 'var(--text-muted)' }} />
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-[11px] font-semibold" style={{ color: 'var(--heading)' }}>{cat.label}</div>
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{cat.desc}</div>
                    </div>
                    <div
                      className="w-8 h-4 rounded-full flex-shrink-0 transition-all duration-200 relative"
                      style={{ background: isOn ? 'var(--accent)' : 'var(--card-border)' }}
                    >
                      <div
                        className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200"
                        style={{
                          background: '#fff',
                          left: isOn ? '18px' : '2px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Severity breakdown */}
          <Card title="By Severity" subtitle="Current distribution">
            <div className="space-y-2">
              {(['critical', 'warning', 'info', 'completed'] as Severity[]).map(sev => {
                const config = SEVERITY[sev];
                const count = notifications.filter(n => n.severity === sev && !dismissedIds.has(n.id)).length;
                const total = notifications.filter(n => !dismissedIds.has(n.id)).length;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={sev}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold" style={{ color: config.color }}>{config.label}</span>
                      <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: config.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
