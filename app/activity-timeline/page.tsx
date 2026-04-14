'use client';

import { useState, useEffect, useMemo } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  Activity, Send, Mail, MousePointer, AlertTriangle, Flag,
  Workflow, ClipboardCheck, GitBranch, FileText, Filter,
  Radio, Zap, BarChart3, TrendingUp,
} from 'lucide-react';

/* ── colors ────────────────────────────────────────────────────────── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  purple: '#7C5CFC',
  teal: '#14B8A6',
  pink: '#EC4899',
  amber: '#F59E0B',
};

/* ── event types ───────────────────────────────────────────────────── */
type EventType =
  | 'campaign_sent'
  | 'email_opened'
  | 'link_clicked'
  | 'bounce_detected'
  | 'member_flagged'
  | 'workflow_triggered'
  | 'staff_outreach'
  | 'ab_test_completed'
  | 'report_generated';

const eventMeta: Record<EventType, { label: string; color: string; icon: typeof Send }> = {
  campaign_sent:       { label: 'Campaign Sent',       color: C.green,  icon: Send },
  email_opened:        { label: 'Email Opened',        color: C.blue,   icon: Mail },
  link_clicked:        { label: 'Link Clicked',        color: C.teal,   icon: MousePointer },
  bounce_detected:     { label: 'Bounce Detected',     color: C.red,    icon: AlertTriangle },
  member_flagged:      { label: 'Member Flagged',      color: C.orange, icon: Flag },
  workflow_triggered:  { label: 'Workflow Triggered',   color: C.purple, icon: Workflow },
  staff_outreach:      { label: 'Staff Outreach',      color: C.amber,  icon: ClipboardCheck },
  ab_test_completed:   { label: 'A/B Test Completed',  color: C.pink,   icon: GitBranch },
  report_generated:    { label: 'Report Generated',    color: '#8899aa', icon: FileText },
};

/* ── event interface ───────────────────────────────────────────────── */
interface TimelineEvent {
  id: string;
  type: EventType;
  timestamp: string;        // ISO
  description: string;
  member?: string;
  campaign?: string;
  staff?: string;
}

/* ── 20 synthetic events over the last 24h ─────────────────────────── */
const SEED_EVENTS: TimelineEvent[] = [
  { id: 'e1',  type: 'email_opened',       timestamp: '2026-04-14T08:58:00', description: 'Jane Smith opened "PFL Compliance Notice — April Wave 3"', member: 'First American Title', campaign: 'PFL Compliance Notice' },
  { id: 'e2',  type: 'link_clicked',        timestamp: '2026-04-14T08:52:00', description: 'Sarah Williams clicked "Register Now" in ALTA ONE Early Bird email', member: 'Liberty Title Group', campaign: 'ALTA ONE Early Bird' },
  { id: 'e3',  type: 'staff_outreach',      timestamp: '2026-04-14T08:45:00', description: 'Taylor Spolidoro logged a follow-up call to Heritage Abstract', member: 'Heritage Abstract LLC', staff: 'Taylor Spolidoro' },
  { id: 'e4',  type: 'campaign_sent',       timestamp: '2026-04-14T08:30:00', description: 'Title News Weekly Issue #15 sent to 4,840 recipients', campaign: 'Title News Weekly' },
  { id: 'e5',  type: 'workflow_triggered',   timestamp: '2026-04-14T08:15:00', description: 'Churn prevention workflow triggered for Heritage Abstract (score: 92)', member: 'Heritage Abstract LLC' },
  { id: 'e6',  type: 'bounce_detected',      timestamp: '2026-04-14T07:48:00', description: 'Hard bounce: info@heritageabstract.com — address invalid', member: 'Heritage Abstract LLC', campaign: 'PFL Compliance Notice' },
  { id: 'e7',  type: 'email_opened',        timestamp: '2026-04-14T07:30:00', description: 'Lisa Anderson opened "ALTA ONE 2026 — Early Bird Registration"', member: 'Commonwealth Land Title', campaign: 'ALTA ONE Early Bird' },
  { id: 'e8',  type: 'report_generated',     timestamp: '2026-04-14T07:00:00', description: 'Daily engagement report auto-generated and sent to leadership team', staff: 'System' },
  { id: 'e9',  type: 'link_clicked',        timestamp: '2026-04-14T06:42:00', description: 'Robert Chen clicked "View Dashboard" in ACU Retention email', member: 'Chicago Title Insurance', campaign: 'ACU Retention Check-in' },
  { id: 'e10', type: 'email_opened',        timestamp: '2026-04-14T06:15:00', description: 'David Park opened "Spring Regional Networking" invite', member: 'Old Republic Title', campaign: 'EDge Spring Invite' },
  { id: 'e11', type: 'member_flagged',       timestamp: '2026-04-14T05:00:00', description: 'National Title Services flagged by DecayRadar — engagement declining 55%', member: 'National Title Services' },
  { id: 'e12', type: 'ab_test_completed',    timestamp: '2026-04-14T04:00:00', description: 'A/B test "Subject Line v3" completed: Variant B won with 38% open rate', campaign: 'PFL Compliance Notice' },
  { id: 'e13', type: 'email_opened',        timestamp: '2026-04-14T02:30:00', description: 'Karen Lee opened "Membership Tier Upgrade" offer email', member: 'Stewart Title Guaranty', campaign: 'Renewal April Batch' },
  { id: 'e14', type: 'campaign_sent',       timestamp: '2026-04-13T22:00:00', description: 'TIPAC Q2 Pledge Drive reminder sent to 320 recipients (re-engage)', campaign: 'TIPAC Q2 Pledge Drive' },
  { id: 'e15', type: 'staff_outreach',      timestamp: '2026-04-13T17:30:00', description: 'Chris Morton scheduled CEO roundtable lunch with WFG National Title', member: 'WFG National Title', staff: 'Chris Morton' },
  { id: 'e16', type: 'workflow_triggered',   timestamp: '2026-04-13T16:00:00', description: 'New member onboarding workflow triggered for 3 April signups', campaign: 'New Member Welcome Series' },
  { id: 'e17', type: 'link_clicked',        timestamp: '2026-04-13T15:12:00', description: 'Angela Torres clicked "Complete Profile" in onboarding email', member: 'Fidelity National Title', campaign: 'New Member Welcome' },
  { id: 'e18', type: 'bounce_detected',      timestamp: '2026-04-13T14:00:00', description: 'Soft bounce: events@nationaltitle.com — mailbox full', member: 'National Title Services', campaign: 'EDge Spring Invite' },
  { id: 'e19', type: 'member_flagged',       timestamp: '2026-04-13T12:00:00', description: 'First American Title flagged by TrustScore — engagement declining, $61K at risk', member: 'First American Title' },
  { id: 'e20', type: 'report_generated',     timestamp: '2026-04-13T09:00:00', description: 'Weekly campaign performance report generated for board review', staff: 'System' },
];

/* ── helpers ────────────────────────────────────────────────────────── */
function timeAgo(iso: string): string {
  const now = new Date('2026-04-14T09:00:00').getTime();
  const then = new Date(iso).getTime();
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) + ', ' +
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ── page ──────────────────────────────────────────────────────────── */
export default function ActivityTimelinePage() {
  const [events] = useState<TimelineEvent[]>(SEED_EVENTS);
  const [activeFilter, setActiveFilter] = useState<EventType | 'all'>('all');
  const [lastUpdated, setLastUpdated] = useState('just now');

  /* simulate refreshing timestamp */
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated('just now');
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  /* filtered */
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return events;
    return events.filter(e => e.type === activeFilter);
  }, [events, activeFilter]);

  /* KPI computations */
  const eventsToday = events.filter(e => e.timestamp.startsWith('2026-04-14')).length;
  const hoursActive = 9; // 9am current
  const eventsPerHour = (eventsToday / Math.max(1, hoursActive)).toFixed(1);
  const campaignCounts: Record<string, number> = {};
  events.forEach(e => { if (e.campaign) campaignCounts[e.campaign] = (campaignCounts[e.campaign] || 0) + 1; });
  const mostActiveCampaign = Object.entries(campaignCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const typeCounts: Record<string, number> = {};
  events.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
  const topEventType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  const topTypeLabel = topEventType ? eventMeta[topEventType[0] as EventType].label : 'N/A';

  /* event type filter buttons */
  const eventTypes = Object.keys(eventMeta) as EventType[];

  return (
    <div className="p-6">
      {/* ── Header with live indicator ──────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4A90D9, #7C5CFC)', boxShadow: '0 4px 16px rgba(74,144,217,0.3)' }}
          >
            <Activity className="w-5 h-5" style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              Activity Timeline
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.blue }}>
              Real-time feed of everything happening across MEMTrak
            </p>
          </div>
        </div>
        {/* Live indicator */}
        <div className="flex items-center gap-2 mt-3">
          <div className="relative">
            <div className="w-2 h-2 rounded-full" style={{ background: C.green }} />
            <div
              className="absolute inset-0 w-2 h-2 rounded-full"
              style={{ background: C.green, animation: 'livePulse 2s ease-in-out infinite' }}
            />
          </div>
          <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            Last updated: {lastUpdated}
          </span>
        </div>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger-children">
        <SparkKpi
          label="Events Today"
          value={eventsToday}
          icon={Zap}
          color={C.green}
          sub={`Since midnight`}
          sparkData={[3, 5, 4, 6, 8, 7, eventsToday]}
          sparkColor={C.green}
          trend={{ value: 18, label: 'vs yesterday' }}
          accent
        />
        <SparkKpi
          label="Events Per Hour"
          value={eventsPerHour}
          icon={TrendingUp}
          color={C.blue}
          sub="Average rate today"
          sparkData={[0.8, 1.2, 1.0, 1.4, 1.6, 1.3, parseFloat(eventsPerHour)]}
          sparkColor={C.blue}
          accent
        />
        <SparkKpi
          label="Most Active Campaign"
          value={mostActiveCampaign.length > 18 ? mostActiveCampaign.slice(0, 18) + '...' : mostActiveCampaign}
          icon={Send}
          color={C.purple}
          sub={`${campaignCounts[mostActiveCampaign] || 0} events`}
          accent
        />
        <SparkKpi
          label="Top Event Type"
          value={topTypeLabel}
          icon={BarChart3}
          color={C.orange}
          sub={`${topEventType?.[1] || 0} occurrences`}
          sparkData={[2, 3, 4, 3, 5, 4, topEventType?.[1] || 0]}
          sparkColor={C.orange}
          accent
        />
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <Card title="Filter Events" subtitle="Click to filter the timeline below" className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200"
            style={{
              background: activeFilter === 'all' ? 'color-mix(in srgb, var(--accent) 20%, transparent)' : 'var(--input-bg)',
              border: `1.5px solid ${activeFilter === 'all' ? 'var(--accent)' : 'var(--card-border)'}`,
              color: activeFilter === 'all' ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            <span className="flex items-center gap-1">
              <Filter className="w-3 h-3" />
              All ({events.length})
            </span>
          </button>
          {eventTypes.map(et => {
            const meta = eventMeta[et];
            const Icon = meta.icon;
            const count = typeCounts[et] || 0;
            const isActive = activeFilter === et;
            return (
              <button
                key={et}
                onClick={() => setActiveFilter(isActive ? 'all' : et)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200"
                style={{
                  background: isActive ? `color-mix(in srgb, ${meta.color} 18%, transparent)` : 'var(--input-bg)',
                  border: `1.5px solid ${isActive ? meta.color : 'var(--card-border)'}`,
                  color: isActive ? meta.color : 'var(--text-muted)',
                }}
              >
                <span className="flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  {meta.label} ({count})
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ── Timeline Feed ───────────────────────────────────────────── */}
      <Card
        title={`Activity Feed (${filtered.length})`}
        subtitle="Chronological stream of system events"
        className="mb-6"
      >
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-[17px] top-0 bottom-0 w-px"
            style={{ background: 'var(--card-border)' }}
          />

          <div className="space-y-1">
            {filtered.map((event, idx) => {
              const meta = eventMeta[event.type];
              const Icon = meta.icon;
              const isNewest = idx === 0;

              return (
                <div
                  key={event.id}
                  className="relative flex items-start gap-3 pl-1 py-3 rounded-xl transition-all duration-200 hover:translate-x-1 group"
                  style={{
                    animation: isNewest ? 'fadeSlideIn 0.5s ease-out' : undefined,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--input-bg)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {/* Event dot/icon */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className="w-[34px] h-[34px] rounded-full flex items-center justify-center"
                      style={{
                        background: `color-mix(in srgb, ${meta.color} 18%, transparent)`,
                        border: `2px solid ${meta.color}`,
                        boxShadow: isNewest ? `0 0 12px ${meta.color}40` : 'none',
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                    </div>
                    {/* Pulse on newest */}
                    {isNewest && (
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          border: `2px solid ${meta.color}`,
                          animation: 'eventPulse 2s ease-out infinite',
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-md font-bold"
                        style={{ background: `color-mix(in srgb, ${meta.color} 15%, transparent)`, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                        {timeAgo(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold mt-1 leading-relaxed" style={{ color: 'var(--heading)' }}>
                      {event.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {event.member && (
                        <span className="text-[9px] font-bold" style={{ color: C.blue }}>
                          {event.member}
                        </span>
                      )}
                      {event.campaign && (
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                          Campaign: {event.campaign}
                        </span>
                      )}
                      {event.staff && (
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                          Staff: {event.staff}
                        </span>
                      )}
                      <span className="text-[8px]" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <Filter className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>No events match this filter.</p>
          </div>
        )}
      </Card>

      {/* ── Hourly Distribution Chart ───────────────────────────────── */}
      <Card title="Hourly Activity" subtitle="Event distribution over the past 24 hours" className="mb-6">
        {(() => {
          /* bucket events into hours */
          const hours: string[] = [];
          const counts: number[] = [];
          for (let h = 9; h < 24; h++) {
            hours.push(`${h > 12 ? h - 12 : h}${h >= 12 ? 'p' : 'a'}`);
            const prefix = `2026-04-13T${String(h).padStart(2, '0')}`;
            counts.push(events.filter(e => e.timestamp.startsWith(prefix)).length);
          }
          for (let h = 0; h <= 9; h++) {
            hours.push(`${h === 0 ? 12 : h}${h >= 12 ? 'p' : 'a'}`);
            const prefix = `2026-04-14T${String(h).padStart(2, '0')}`;
            counts.push(events.filter(e => e.timestamp.startsWith(prefix)).length);
          }

          const chartData = {
            labels: hours,
            datasets: [{
              label: 'Events',
              data: counts,
              backgroundColor: counts.map((c, i) => i >= hours.length - 10 ? `rgba(74,144,217,${0.3 + c * 0.15})` : `rgba(74,144,217,${0.15 + c * 0.1})`),
              borderRadius: 4,
              borderSkipped: false as const,
            }],
          };

          return (
            <ClientChart
              type="bar"
              height={220}
              data={chartData}
              options={{
                scales: {
                  y: { grid: { color: '#1e3350' }, ticks: { color: '#8899aa' }, beginAtZero: true },
                  x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 } } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          );
        })()}
      </Card>

      {/* ── Animations ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0; transform: scale(2.5); }
        }
        @keyframes eventPulse {
          0% { opacity: 0.6; transform: scale(1); }
          100% { opacity: 0; transform: scale(2); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
