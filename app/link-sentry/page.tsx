'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import {
  Link2, ShieldCheck, AlertTriangle, Clock, ExternalLink,
  CheckCircle2, XCircle, ArrowUpRight, X, Search, Tag,
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

/* ── tracked URLs data ───────────────────────────────────── */
interface TrackedLink {
  id: string;
  url: string;
  shortUrl: string;
  campaign: string;
  status: 'Active' | 'Broken' | 'Redirect' | 'Slow';
  clicks: number;
  uniqueClicks: number;
  loadTime: number; // ms
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  lastChecked: string;
}

const trackedLinks: TrackedLink[] = [
  {
    id: 'lnk-1', url: 'https://www.alta.org/alta-one-2026/register', shortUrl: 'alta.org/alta-one-reg',
    campaign: 'ALTA ONE 2026 — Early Bird', status: 'Active', clicks: 780, uniqueClicks: 624,
    loadTime: 420, utmSource: 'memtrak', utmMedium: 'email', utmCampaign: 'alta-one-2026-earlybird', utmContent: 'cta-register',
    lastChecked: '2 hours ago',
  },
  {
    id: 'lnk-2', url: 'https://www.alta.org/membership/renew', shortUrl: 'alta.org/renew',
    campaign: 'Membership Renewal — April', status: 'Active', clicks: 156, uniqueClicks: 142,
    loadTime: 380, utmSource: 'memtrak', utmMedium: 'email', utmCampaign: 'renewal-apr-2026', utmContent: 'cta-renew',
    lastChecked: '2 hours ago',
  },
  {
    id: 'lnk-3', url: 'https://www.alta.org/news/title-news-weekly-15', shortUrl: 'alta.org/tnw-15',
    campaign: 'Title News Weekly #15', status: 'Active', clicks: 465, uniqueClicks: 398,
    loadTime: 510, utmSource: 'higher-logic', utmMedium: 'email', utmCampaign: 'tnw-issue-15', utmContent: 'headline',
    lastChecked: '3 hours ago',
  },
  {
    id: 'lnk-4', url: 'https://www.alta.org/advocacy/pfl-compliance-guide', shortUrl: 'alta.org/pfl-guide',
    campaign: 'PFL Compliance — April Wave 3', status: 'Redirect', clicks: 267, uniqueClicks: 218,
    loadTime: 1850, utmSource: 'memtrak', utmMedium: 'email', utmCampaign: 'pfl-compliance-apr-w3', utmContent: 'cta-guide',
    lastChecked: '1 hour ago',
  },
  {
    id: 'lnk-5', url: 'https://www.alta.org/education/edge-spring-2026', shortUrl: 'alta.org/edge-spring',
    campaign: 'EDge Program — Spring Cohort', status: 'Broken', clicks: 173, uniqueClicks: 152,
    loadTime: 0, utmSource: 'higher-logic', utmMedium: 'email', utmCampaign: 'edge-spring-2026', utmContent: 'cta-apply',
    lastChecked: '30 min ago',
  },
  {
    id: 'lnk-6', url: 'https://www.alta.org/tipac/pledge', shortUrl: 'alta.org/tipac-pledge',
    campaign: 'TIPAC Q2 Pledge Drive', status: 'Active', clicks: 115, uniqueClicks: 98,
    loadTime: 290, utmSource: 'memtrak', utmMedium: 'email', utmCampaign: 'tipac-q2-pledge', utmContent: 'cta-pledge',
    lastChecked: '2 hours ago',
  },
  {
    id: 'lnk-7', url: 'https://www.alta.org/advocacy/state-alert-tx-fl', shortUrl: 'alta.org/state-alert',
    campaign: 'State Legislation Alert — TX & FL', status: 'Active', clicks: 404, uniqueClicks: 356,
    loadTime: 340, utmSource: 'memtrak', utmMedium: 'email', utmCampaign: 'state-alert-tx-fl', utmContent: 'cta-action',
    lastChecked: '4 hours ago',
  },
  {
    id: 'lnk-8', url: 'https://www.alta.org/events/webinar-digital-closings', shortUrl: 'alta.org/webinar-dc',
    campaign: 'New Member Welcome Series', status: 'Slow', clicks: 32, uniqueClicks: 28,
    loadTime: 3200, utmSource: 'memtrak', utmMedium: 'email', utmCampaign: 'new-member-welcome', utmContent: 'resource-link',
    lastChecked: '1 hour ago',
  },
  {
    id: 'lnk-9', url: 'https://www.alta.org/resources/best-practices-2025', shortUrl: 'alta.org/bp-2025',
    campaign: 'ACU Retention Check-in', status: 'Redirect', clicks: 12, uniqueClicks: 11,
    loadTime: 2100, utmSource: 'outlook', utmMedium: 'email', utmCampaign: 'acu-retention-q2', utmContent: '',
    lastChecked: '5 hours ago',
  },
  {
    id: 'lnk-10', url: 'https://www.alta.org/membership/upgrade-options', shortUrl: 'alta.org/upgrade',
    campaign: 'Membership Renewal — April', status: 'Active', clicks: 89, uniqueClicks: 76,
    loadTime: 450, utmSource: 'memtrak', utmMedium: 'email', utmCampaign: 'renewal-apr-2026', utmContent: 'cta-upgrade',
    lastChecked: '2 hours ago',
  },
];

/* ── UTM audit data ──────────────────────────────────────── */
interface UtmIssue {
  campaign: string;
  issue: string;
  severity: 'error' | 'warning';
  detail: string;
}

const utmIssues: UtmIssue[] = [
  { campaign: 'ACU Retention Check-in', issue: 'Missing utm_content', severity: 'error', detail: 'The utm_content parameter is empty. Without it, you cannot distinguish between multiple links in the same campaign.' },
  { campaign: 'EDge Program — Spring Cohort', issue: 'Source mismatch', severity: 'warning', detail: 'This campaign uses "higher-logic" as utm_source but the send was co-managed by MEMTrak. Standardize to one source for consistent attribution.' },
  { campaign: 'ACU Retention Check-in', issue: 'Non-standard source', severity: 'warning', detail: 'Using "outlook" as utm_source. Consider standardizing to "memtrak" or "staff-outreach" for consistent reporting across all platforms.' },
];

/* ── click analytics per status ──────────────────────────── */
const statusCounts = {
  Active: trackedLinks.filter(l => l.status === 'Active').length,
  Broken: trackedLinks.filter(l => l.status === 'Broken').length,
  Redirect: trackedLinks.filter(l => l.status === 'Redirect').length,
  Slow: trackedLinks.filter(l => l.status === 'Slow').length,
};

const totalLinks = trackedLinks.length;
const brokenLinks = statusCounts.Broken;
const avgLoadTime = Math.round(trackedLinks.filter(l => l.loadTime > 0).reduce((s, l) => s + l.loadTime, 0) / trackedLinks.filter(l => l.loadTime > 0).length);
const utmCompliance = Math.round(((totalLinks - utmIssues.filter(i => i.severity === 'error').length) / totalLinks) * 100);

/* ── status helpers ──────────────────────────────────────── */
function statusColor(status: string) {
  if (status === 'Active') return C.green;
  if (status === 'Broken') return C.red;
  if (status === 'Redirect') return C.amber;
  if (status === 'Slow') return C.orange;
  return C.blue;
}

function statusIcon(status: string) {
  if (status === 'Active') return CheckCircle2;
  if (status === 'Broken') return XCircle;
  if (status === 'Redirect') return ArrowUpRight;
  if (status === 'Slow') return Clock;
  return Link2;
}

function loadTimeColor(ms: number) {
  if (ms === 0) return C.red;
  if (ms <= 500) return C.green;
  if (ms <= 1500) return C.amber;
  return C.red;
}

/* ══════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ══════════════════════════════════════════════════════════ */
export default function LinkSentryPage() {
  const [selectedLink, setSelectedLink] = useState<TrackedLink | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<UtmIssue | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const filteredLinks = filter === 'All' ? trackedLinks : trackedLinks.filter(l => l.status === filter);

  return (
    <div className="p-6 space-y-6">

      {/* ── 1. Branded Header ── */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #4A90D9, #002D5C)',
            boxShadow: '0 4px 20px rgba(74,144,217,0.3)',
          }}
        >
          <Link2 className="w-6 h-6" style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            LinkSentry<span className="text-[10px] align-super font-bold" style={{ color: 'var(--accent)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Every link verified. Every click tracked.
          </p>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
        UTM management, link health monitoring, and click analytics. LinkSentry continuously validates every URL in your campaigns, catches <strong style={{ color: 'var(--heading)' }}>broken links before members click them</strong>, and ensures UTM consistency for accurate attribution.
      </p>

      {/* ── 2. SparkKpi Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <SparkKpi
          label="Links Tracked"
          value={totalLinks}
          sub="Across all active campaigns"
          icon={Link2}
          color={C.blue}
          sparkData={[6, 7, 8, 8, 9, totalLinks]}
          sparkColor={C.blue}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {totalLinks} unique URLs are currently being tracked across all active and recent campaigns. Each link is checked for availability, redirect chains, and load performance every 2 hours.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="rounded-lg p-2 text-center" style={{ background: `color-mix(in srgb, ${statusColor(status)} 10%, transparent)` }}>
                    <div className="text-sm font-extrabold" style={{ color: statusColor(status) }}>{count}</div>
                    <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{status}</div>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Broken Links Found"
          value={brokenLinks}
          sub="Requiring immediate attention"
          icon={XCircle}
          color={C.red}
          sparkData={[0, 1, 0, 2, 1, brokenLinks]}
          sparkColor={C.red}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {brokenLinks} link(s) returned HTTP errors (4xx/5xx) during the latest health check. Members clicking these links will see an error page.
              </p>
              {trackedLinks.filter(l => l.status === 'Broken').map(l => (
                <div key={l.id} className="rounded-lg p-3" style={{ background: 'rgba(217,74,74,0.08)', border: '1px solid rgba(217,74,74,0.15)' }}>
                  <div className="text-[10px] font-bold" style={{ color: C.red }}>{l.campaign}</div>
                  <div className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>{l.url}</div>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="UTM Compliance Rate"
          value={`${utmCompliance}%`}
          sub={`${utmIssues.length} issues found across campaigns`}
          icon={Tag}
          color={utmCompliance >= 90 ? C.green : C.amber}
          sparkData={[82, 85, 88, 87, 89, utmCompliance]}
          sparkColor={utmCompliance >= 90 ? C.green : C.amber}
          trend={{ value: 3.2, label: 'vs last month' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                UTM compliance measures whether all required parameters (source, medium, campaign, content) are present and follow naming conventions.
              </p>
              {utmIssues.map((issue, i) => (
                <div key={i} className="rounded-lg p-3" style={{
                  background: issue.severity === 'error' ? 'rgba(217,74,74,0.08)' : 'rgba(232,146,63,0.08)',
                  border: `1px solid ${issue.severity === 'error' ? 'rgba(217,74,74,0.15)' : 'rgba(232,146,63,0.15)'}`,
                }}>
                  <div className="text-[10px] font-bold" style={{ color: issue.severity === 'error' ? C.red : C.orange }}>{issue.campaign}: {issue.issue}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{issue.detail}</div>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Avg Click-to-Load Time"
          value={`${(avgLoadTime / 1000).toFixed(1)}s`}
          sub={avgLoadTime <= 500 ? 'Excellent performance' : avgLoadTime <= 1500 ? 'Within acceptable range' : 'Some links are slow'}
          icon={Clock}
          color={loadTimeColor(avgLoadTime)}
          sparkData={[920, 880, 810, 780, 750, avgLoadTime]}
          sparkColor={loadTimeColor(avgLoadTime)}
          trend={{ value: -8.4, label: 'faster vs last month' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Average time for tracked landing pages to fully load after a member clicks. Target is under 500ms. Links over 1.5s are flagged as slow.
              </p>
              <div className="space-y-2">
                {trackedLinks.filter(l => l.loadTime > 0).sort((a, b) => b.loadTime - a.loadTime).slice(0, 5).map(l => (
                  <div key={l.id} className="flex items-center justify-between text-[10px]">
                    <span style={{ color: 'var(--heading)' }}>{l.shortUrl}</span>
                    <span className="font-bold" style={{ color: loadTimeColor(l.loadTime) }}>{l.loadTime}ms</span>
                  </div>
                ))}
              </div>
            </div>
          }
        />
      </div>

      {/* ── 3. Link Table (full width) ── */}
      <Card
        title="Tracked URLs"
        subtitle="All monitored links from recent campaigns"
        detailTitle="Link Health Report"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              LinkSentry monitors every outbound URL in your campaigns. Links are checked every 2 hours for availability, redirect status, and load performance.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="rounded-lg p-3 text-center" style={{ background: `color-mix(in srgb, ${statusColor(status)} 10%, transparent)` }}>
                  <div className="text-lg font-extrabold" style={{ color: statusColor(status) }}>{count}</div>
                  <div className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>{status}</div>
                </div>
              ))}
            </div>
          </div>
        }
      >
        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-3 mt-1">
          {['All', 'Active', 'Broken', 'Redirect', 'Slow'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-[9px] px-3 py-1 rounded-full font-bold transition-all"
              style={{
                background: filter === f ? 'var(--accent)' : 'var(--input-bg)',
                color: filter === f ? '#fff' : 'var(--text-muted)',
              }}
            >
              {f} {f !== 'All' && <span>({f === 'Active' ? statusCounts.Active : f === 'Broken' ? statusCounts.Broken : f === 'Redirect' ? statusCounts.Redirect : statusCounts.Slow})</span>}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th className="text-left py-2 pr-3 font-bold" style={{ color: 'var(--text-muted)' }}>Status</th>
                <th className="text-left py-2 pr-3 font-bold" style={{ color: 'var(--text-muted)' }}>URL</th>
                <th className="text-left py-2 pr-3 font-bold" style={{ color: 'var(--text-muted)' }}>Campaign</th>
                <th className="text-right py-2 pr-3 font-bold" style={{ color: 'var(--text-muted)' }}>Clicks</th>
                <th className="text-right py-2 pr-3 font-bold" style={{ color: 'var(--text-muted)' }}>Load</th>
                <th className="text-right py-2 font-bold" style={{ color: 'var(--text-muted)' }}>Checked</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map(l => {
                const StatusIcon = statusIcon(l.status);
                return (
                  <tr
                    key={l.id}
                    className="cursor-pointer transition-colors hover:bg-[var(--input-bg)]"
                    style={{ borderBottom: '1px solid var(--card-border)' }}
                    onClick={() => setSelectedLink(l)}
                  >
                    <td className="py-2.5 pr-3">
                      <span
                        className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: `color-mix(in srgb, ${statusColor(l.status)} 15%, transparent)`,
                          color: statusColor(l.status),
                        }}
                      >
                        <StatusIcon className="w-2.5 h-2.5" /> {l.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="font-mono font-semibold" style={{ color: 'var(--heading)' }}>{l.shortUrl}</div>
                    </td>
                    <td className="py-2.5 pr-3" style={{ color: 'var(--text-muted)' }}>{l.campaign}</td>
                    <td className="py-2.5 pr-3 text-right font-bold" style={{ color: 'var(--heading)' }}>{l.clicks.toLocaleString()}</td>
                    <td className="py-2.5 pr-3 text-right font-bold" style={{ color: loadTimeColor(l.loadTime) }}>
                      {l.loadTime === 0 ? 'N/A' : `${l.loadTime}ms`}
                    </td>
                    <td className="py-2.5 text-right" style={{ color: 'var(--text-muted)' }}>{l.lastChecked}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 4. Two-column: UTM Audit + Click Analytics ── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* UTM Consistency Audit */}
        <Card
          title="UTM Consistency Audit"
          subtitle="Parameter compliance across all tracked links"
          detailTitle="UTM Naming Convention Guide"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Consistent UTM parameters ensure accurate attribution in analytics. LinkSentry audits every link against ALTA&apos;s naming conventions.
              </p>
              <div>
                <div className="text-[10px] font-bold mb-2" style={{ color: 'var(--heading)' }}>Required Parameters</div>
                {['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].map(p => (
                  <div key={p} className="flex items-center gap-2 py-1 text-[10px]">
                    <CheckCircle2 className="w-3 h-3" style={{ color: C.green }} />
                    <code className="font-mono" style={{ color: 'var(--heading)' }}>{p}</code>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[10px] font-bold mb-2" style={{ color: 'var(--heading)' }}>Naming Standards</div>
                <div className="rounded-lg p-3 space-y-1" style={{ background: 'var(--background)' }}>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--heading)' }}>Source:</strong> memtrak, higher-logic, staff-outreach</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--heading)' }}>Medium:</strong> email, sms, web</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--heading)' }}>Campaign:</strong> kebab-case, descriptive</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}><strong style={{ color: 'var(--heading)' }}>Content:</strong> cta-[type] or link position</div>
                </div>
              </div>
            </div>
          }
        >
          <div className="mt-1 space-y-3">
            {/* Compliance score bar */}
            <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>Overall Compliance</span>
                <span className="text-sm font-extrabold" style={{ color: utmCompliance >= 90 ? C.green : C.amber }}>{utmCompliance}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${utmCompliance}%`, background: utmCompliance >= 90 ? C.green : C.amber }} />
              </div>
            </div>

            {/* Issues list */}
            {utmIssues.map((issue, i) => (
              <div
                key={i}
                className="rounded-lg p-3 cursor-pointer transition-transform hover:scale-[1.01]"
                style={{
                  background: issue.severity === 'error' ? 'rgba(217,74,74,0.06)' : 'rgba(232,146,63,0.06)',
                  border: `1px solid ${issue.severity === 'error' ? 'rgba(217,74,74,0.2)' : 'rgba(232,146,63,0.2)'}`,
                }}
                onClick={() => setSelectedIssue(issue)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {issue.severity === 'error'
                    ? <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.red }} />
                    : <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.orange }} />
                  }
                  <span className="text-[10px] font-bold" style={{ color: issue.severity === 'error' ? C.red : C.orange }}>
                    {issue.issue}
                  </span>
                </div>
                <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{issue.campaign}</div>
              </div>
            ))}

            {/* Standards summary */}
            <div className="rounded-lg p-3" style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>UTM Sources in Use</div>
              <div className="flex flex-wrap gap-1.5">
                {['memtrak', 'higher-logic', 'outlook'].map(src => (
                  <span key={src} className="text-[9px] font-mono font-bold px-2 py-0.5 rounded" style={{ background: 'var(--input-bg)', color: 'var(--heading)' }}>
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Click Analytics */}
        <Card
          title="Click Analytics by Campaign"
          subtitle="Top campaigns by total link clicks"
        >
          <div className="mt-1">
            <ClientChart
              type="bar"
              height={240}
              data={{
                labels: [...new Set(trackedLinks.map(l => l.campaign))].slice(0, 6).map(c => c.length > 25 ? c.slice(0, 25) + '...' : c),
                datasets: [{
                  label: 'Total Clicks',
                  data: [...new Set(trackedLinks.map(l => l.campaign))].slice(0, 6).map(campaign =>
                    trackedLinks.filter(l => l.campaign === campaign).reduce((s, l) => s + l.clicks, 0)
                  ),
                  backgroundColor: [C.green, C.blue, C.blue, C.navy, C.teal, C.purple],
                  borderRadius: 6,
                }],
              }}
              options={{
                indexAxis: 'y',
                scales: {
                  x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } },
                  y: { grid: { display: false }, ticks: { font: { size: 8 } } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>

          {/* Status breakdown mini chart */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="rounded-lg p-2 text-center" style={{ background: `color-mix(in srgb, ${statusColor(status)} 8%, transparent)` }}>
                <div className="text-sm font-extrabold" style={{ color: statusColor(status) }}>{count}</div>
                <div className="text-[8px] font-bold" style={{ color: 'var(--text-muted)' }}>{status}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Broken Link Alerts */}
        <Card
          title="Broken Link Alerts"
          subtitle="Links that need immediate attention"
          accent={C.red}
        >
          <div className="space-y-3 mt-1">
            {trackedLinks.filter(l => l.status === 'Broken' || l.status === 'Slow' || l.status === 'Redirect').map(l => {
              const StatusIcon = statusIcon(l.status);
              return (
                <div
                  key={l.id}
                  className="rounded-lg p-3 cursor-pointer transition-transform hover:scale-[1.01]"
                  style={{
                    background: l.status === 'Broken' ? 'rgba(217,74,74,0.06)' : l.status === 'Slow' ? 'rgba(232,146,63,0.06)' : 'rgba(245,197,66,0.06)',
                    border: `1px solid ${l.status === 'Broken' ? 'rgba(217,74,74,0.2)' : l.status === 'Slow' ? 'rgba(232,146,63,0.2)' : 'rgba(245,197,66,0.2)'}`,
                  }}
                  onClick={() => setSelectedLink(l)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <StatusIcon className="w-3.5 h-3.5" style={{ color: statusColor(l.status) }} />
                    <span className="text-[10px] font-bold" style={{ color: statusColor(l.status) }}>{l.status}</span>
                    <span className="text-[9px] ml-auto" style={{ color: 'var(--text-muted)' }}>Checked {l.lastChecked}</span>
                  </div>
                  <div className="text-[10px] font-mono font-semibold" style={{ color: 'var(--heading)' }}>{l.url}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{l.campaign}</div>
                  {l.status === 'Slow' && (
                    <div className="text-[9px] mt-1 font-bold" style={{ color: C.orange }}>Load time: {l.loadTime}ms (target: &lt;500ms)</div>
                  )}
                  {l.status === 'Redirect' && (
                    <div className="text-[9px] mt-1 font-bold" style={{ color: C.amber }}>Redirect detected. Load time: {l.loadTime}ms</div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Click Performance */}
        <Card
          title="Unique vs. Total Clicks"
          subtitle="Click deduplication across tracked links"
        >
          <div className="mt-1">
            <ClientChart
              type="bar"
              height={220}
              data={{
                labels: trackedLinks.slice(0, 6).map(l => l.shortUrl.replace('alta.org/', '')),
                datasets: [
                  {
                    label: 'Total Clicks',
                    data: trackedLinks.slice(0, 6).map(l => l.clicks),
                    backgroundColor: 'rgba(74,144,217,0.6)',
                    borderRadius: 4,
                  },
                  {
                    label: 'Unique Clicks',
                    data: trackedLinks.slice(0, 6).map(l => l.uniqueClicks),
                    backgroundColor: 'rgba(140,198,63,0.6)',
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                scales: {
                  y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } },
                  x: { grid: { display: false }, ticks: { font: { size: 8 } } },
                },
                plugins: {
                  legend: { labels: { usePointStyle: true, pointStyleWidth: 8, font: { size: 9 } } },
                },
              }}
            />
          </div>
        </Card>
      </div>

      {/* ── Link Detail Modal ── */}
      {selectedLink && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedLink(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Link Detail</h3>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{selectedLink.shortUrl}</p>
              </div>
              <button onClick={() => setSelectedLink(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                {(() => { const SI = statusIcon(selectedLink.status); return <SI className="w-4 h-4" style={{ color: statusColor(selectedLink.status) }} />; })()}
                <span className="text-xs font-bold" style={{ color: statusColor(selectedLink.status) }}>{selectedLink.status}</span>
              </div>

              {/* URL */}
              <div>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Full URL</div>
                <code className="text-[10px] px-3 py-2 rounded-lg block font-mono break-all" style={{ background: 'var(--input-bg)', color: 'var(--heading)' }}>
                  {selectedLink.url}
                </code>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg p-3 text-center" style={{ background: 'var(--background)' }}>
                  <div className="text-lg font-extrabold" style={{ color: C.blue }}>{selectedLink.clicks}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Total Clicks</div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: 'var(--background)' }}>
                  <div className="text-lg font-extrabold" style={{ color: C.green }}>{selectedLink.uniqueClicks}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Unique Clicks</div>
                </div>
                <div className="rounded-lg p-3 text-center" style={{ background: 'var(--background)' }}>
                  <div className="text-lg font-extrabold" style={{ color: loadTimeColor(selectedLink.loadTime) }}>
                    {selectedLink.loadTime === 0 ? 'N/A' : `${selectedLink.loadTime}ms`}
                  </div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Load Time</div>
                </div>
              </div>

              {/* UTM Parameters */}
              <div>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>UTM Parameters</div>
                <div className="rounded-lg p-3 space-y-1.5" style={{ background: 'var(--background)' }}>
                  {[
                    { label: 'utm_source', val: selectedLink.utmSource },
                    { label: 'utm_medium', val: selectedLink.utmMedium },
                    { label: 'utm_campaign', val: selectedLink.utmCampaign },
                    { label: 'utm_content', val: selectedLink.utmContent || '(missing)' },
                  ].map(p => (
                    <div key={p.label} className="flex items-center justify-between text-[10px]">
                      <code className="font-mono" style={{ color: 'var(--text-muted)' }}>{p.label}</code>
                      <code className="font-mono font-bold" style={{ color: p.val === '(missing)' ? C.red : 'var(--heading)' }}>{p.val}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                Campaign: {selectedLink.campaign} | Last checked: {selectedLink.lastChecked}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── UTM Issue Detail Modal ── */}
      {selectedIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedIssue(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: selectedIssue.severity === 'error' ? C.red : C.orange }}>UTM Issue</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedIssue.campaign}</p>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                {selectedIssue.severity === 'error'
                  ? <XCircle className="w-5 h-5" style={{ color: C.red }} />
                  : <AlertTriangle className="w-5 h-5" style={{ color: C.orange }} />
                }
                <span className="text-sm font-bold" style={{ color: selectedIssue.severity === 'error' ? C.red : C.orange }}>
                  {selectedIssue.issue}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {selectedIssue.detail}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
