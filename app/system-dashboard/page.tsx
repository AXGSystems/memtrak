'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { MiniBar } from '@/components/SparkKpi';
import PulsingMeter from '@/components/PulsingMeter';
import {
  Server,
  Activity,
  Database,
  Wifi,
  WifiOff,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  HardDrive,
  BarChart3,
  Shield,
  Eye,
  MousePointerClick,
  Mail,
  Link2,
  Globe,
  Cloud,
  Cpu,
  Timer,
  Gauge,
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
  emerald: '#10b981',
  cyan: '#06b6d4',
};

/* -- API Endpoints -- */
interface ApiEndpoint {
  path: string;
  method: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  latencyHistory: number[];
}

const apiEndpoints: ApiEndpoint[] = [
  { path: '/api/track/pixel', method: 'GET', status: 'healthy', responseTime: 12, latencyHistory: [14, 12, 13, 11, 12, 13, 12] },
  { path: '/api/track/logo', method: 'GET', status: 'healthy', responseTime: 15, latencyHistory: [16, 14, 15, 15, 14, 16, 15] },
  { path: '/api/track/click', method: 'GET', status: 'healthy', responseTime: 18, latencyHistory: [20, 19, 18, 17, 19, 18, 18] },
  { path: '/api/track/confirm', method: 'POST', status: 'healthy', responseTime: 22, latencyHistory: [24, 22, 23, 21, 22, 24, 22] },
  { path: '/api/track/receipt', method: 'POST', status: 'healthy', responseTime: 28, latencyHistory: [30, 28, 29, 27, 28, 30, 28] },
  { path: '/api/events', method: 'GET', status: 'healthy', responseTime: 45, latencyHistory: [48, 46, 44, 47, 45, 43, 45] },
  { path: '/api/events', method: 'POST', status: 'healthy', responseTime: 52, latencyHistory: [55, 52, 54, 50, 53, 51, 52] },
  { path: '/api/campaigns', method: 'GET', status: 'healthy', responseTime: 38, latencyHistory: [42, 39, 38, 40, 37, 39, 38] },
  { path: '/api/members', method: 'GET', status: 'healthy', responseTime: 62, latencyHistory: [68, 65, 63, 60, 64, 62, 62] },
  { path: '/api/decay', method: 'GET', status: 'healthy', responseTime: 78, latencyHistory: [82, 79, 80, 76, 78, 80, 78] },
  { path: '/api/hygiene', method: 'GET', status: 'healthy', responseTime: 55, latencyHistory: [58, 56, 54, 57, 55, 53, 55] },
  { path: '/api/segments', method: 'GET', status: 'healthy', responseTime: 88, latencyHistory: [95, 90, 88, 92, 87, 89, 88] },
  { path: '/api/analytics', method: 'GET', status: 'healthy', responseTime: 120, latencyHistory: [135, 128, 122, 125, 118, 121, 120] },
  { path: '/api/reports', method: 'POST', status: 'healthy', responseTime: 185, latencyHistory: [195, 190, 188, 182, 186, 184, 185] },
  { path: '/api/ai/predict', method: 'POST', status: 'healthy', responseTime: 145, latencyHistory: [160, 152, 148, 145, 150, 146, 145] },
];

/* -- Email Tracking Endpoints -- */
interface TrackingEndpoint {
  name: string;
  path: string;
  hits24h: number;
  hitsTotal: number;
  status: 'healthy' | 'degraded' | 'down';
}

const trackingEndpoints: TrackingEndpoint[] = [
  { name: 'Pixel Tracker', path: '/api/track/pixel', hits24h: 4280, hitsTotal: 892140, status: 'healthy' },
  { name: 'Logo Tracker', path: '/api/track/logo', hits24h: 3150, hitsTotal: 654820, status: 'healthy' },
  { name: 'Click Tracker', path: '/api/track/click', hits24h: 1420, hitsTotal: 298560, status: 'healthy' },
  { name: 'Confirm Endpoint', path: '/api/track/confirm', hits24h: 86, hitsTotal: 18240, status: 'healthy' },
  { name: 'Receipt Endpoint', path: '/api/track/receipt', hits24h: 62, hitsTotal: 12808, status: 'healthy' },
];

/* -- Integrations -- */
interface Integration {
  name: string;
  status: 'connected' | 'pending' | 'error';
  lastSync?: string;
  details: string;
}

const integrations: Integration[] = [
  { name: 'Microsoft Graph', status: 'pending', details: 'Awaiting OAuth consent from IT admin. Required for Outlook tracking.' },
  { name: 'Higher Logic', status: 'connected', lastSync: '2026-04-14 08:15 AM', details: 'Syncing newsletters and email events. Last batch: 4,840 records.' },
  { name: 'Google Analytics 4', status: 'pending', details: 'GA4 property created. Awaiting measurement protocol key configuration.' },
  { name: 'Azure SQL', status: 'pending', details: 'Database credentials received. Firewall rule pending from infrastructure team.' },
  { name: 'Supabase', status: 'connected', lastSync: '2026-04-14 09:42 AM', details: 'Primary event database. 12,808 events stored. Real-time subscriptions active.' },
];

/* -- Error Log -- */
interface ErrorEntry {
  timestamp: string;
  endpoint: string;
  code: number;
  message: string;
}

const errorLog: ErrorEntry[] = [
  { timestamp: '2026-04-14 09:18:22', endpoint: '/api/reports', code: 504, message: 'Gateway timeout — report generation exceeded 30s limit' },
  { timestamp: '2026-04-13 22:41:05', endpoint: '/api/ai/predict', code: 429, message: 'Rate limit exceeded — AI prediction queue backed up' },
  { timestamp: '2026-04-13 14:02:33', endpoint: '/api/events', code: 500, message: 'Supabase connection pool exhausted — auto-recovered in 2s' },
  { timestamp: '2026-04-12 08:55:17', endpoint: '/api/track/pixel', code: 503, message: 'Temporary Vercel edge function cold start — resolved' },
  { timestamp: '2026-04-11 16:30:44', endpoint: '/api/segments', code: 400, message: 'Invalid segment query — malformed filter parameter' },
];

/* -- Uptime data (30 days) -- */
const uptimeDays = Array.from({ length: 30 }, (_, i) => {
  // 29 days green, 1 day with partial outage (day 18)
  return { day: i + 1, status: i === 17 ? 'partial' : 'up' as 'up' | 'partial' | 'down' };
});

const statusColors = {
  healthy: C.green,
  connected: C.green,
  degraded: C.amber,
  pending: C.blue,
  down: C.red,
  error: C.red,
};

export default function SystemDashboard() {
  const [showEndpoints, setShowEndpoints] = useState(false);

  const allHealthy = apiEndpoints.every(e => e.status === 'healthy');
  const avgResponseTime = Math.round(apiEndpoints.reduce((s, e) => s + e.responseTime, 0) / apiEndpoints.length);
  const healthPct = Math.round((apiEndpoints.filter(e => e.status === 'healthy').length / apiEndpoints.length) * 100);
  const uptime = 99.97;
  const errorRate = 0.03;
  const eventsProcessed = 12808;
  const cacheHitRate = 94.2;
  const peakLoad = 342;
  const storageUsed = 1.8;
  const storageLimit = 8;

  return (
    <div className="p-6">
      {/* -- 1. Branded Header -- */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(99,102,241,0.2) 100%)',
              border: '1px solid rgba(6,182,212,0.3)',
            }}
          >
            <Server className="w-5 h-5" style={{ color: C.cyan }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              SystemDashboard<span style={{ color: C.cyan, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.cyan }}>
              Everything running. Nothing missed.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Infrastructure and system health monitoring for all MEMTrak components. Real-time status
          for APIs, database connections, email tracking endpoints, and third-party integrations.
        </p>
      </div>

      {/* -- All Systems Operational Banner -- */}
      {allHealthy && (
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-xl mb-8"
          style={{
            background: 'rgba(140,198,63,0.06)',
            border: '1px solid rgba(140,198,63,0.2)',
          }}
        >
          <CheckCircle2 className="w-5 h-5" style={{ color: C.green }} />
          <div>
            <span className="text-sm font-extrabold" style={{ color: C.green }}>All Systems Operational</span>
            <span className="text-[10px] ml-3" style={{ color: 'var(--text-muted)' }}>Last checked: April 14, 2026 at 9:42 AM CDT</span>
          </div>
        </div>
      )}

      {/* -- 2. SparkKpi Row -- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SparkKpi
          label="System Health"
          value={`${healthPct}%`}
          sub={`${apiEndpoints.length} endpoints monitored`}
          icon={Activity}
          color={C.green}
          sparkData={[98, 99, 100, 99, 100, 100, healthPct]}
          sparkColor={C.green}
          accent
        />
        <SparkKpi
          label="Uptime (30d)"
          value={`${uptime}%`}
          sub="1 partial outage (2m 14s)"
          icon={Shield}
          color={C.cyan}
          sparkData={[99.95, 99.96, 99.97, 99.98, 99.97, 99.96, uptime]}
          sparkColor={C.cyan}
          accent
        />
        <SparkKpi
          label="Avg Response Time"
          value={`${avgResponseTime}ms`}
          sub="Across all endpoints"
          icon={Timer}
          color={C.blue}
          sparkData={[85, 80, 78, 75, 72, 70, avgResponseTime]}
          sparkColor={C.blue}
          trend={{ value: -8.2, label: 'faster than last week' }}
          accent
        />
        <SparkKpi
          label="Events Processed"
          value={eventsProcessed.toLocaleString()}
          sub="Total tracked events"
          icon={Zap}
          color={C.indigo}
          sparkData={[8400, 9200, 10100, 10800, 11500, 12200, eventsProcessed]}
          sparkColor={C.indigo}
          trend={{ value: 14.8, label: 'growing' }}
          accent
        />
      </div>

      {/* -- 3. System Health Meter + Performance Metrics -- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* PulsingMeter */}
        <Card title="Overall System Health" subtitle="Real-time aggregate health score">
          <div className="flex justify-center py-4">
            <PulsingMeter value={healthPct} label="Health" color={C.green} size="lg" />
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card title="Performance Metrics" subtitle="Current system performance indicators" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Avg Response Time</div>
              <div className="text-xl font-extrabold" style={{ color: C.blue }}>{avgResponseTime}ms</div>
              <MiniBar value={avgResponseTime} max={200} color={C.blue} height={3} />
              <div className="text-[8px] mt-1" style={{ color: 'var(--text-muted)' }}>Target: under 200ms</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Peak Load</div>
              <div className="text-xl font-extrabold" style={{ color: C.purple }}>{peakLoad} req/min</div>
              <MiniBar value={peakLoad} max={1000} color={C.purple} height={3} />
              <div className="text-[8px] mt-1" style={{ color: 'var(--text-muted)' }}>Capacity: 1,000 req/min</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Cache Hit Rate</div>
              <div className="text-xl font-extrabold" style={{ color: C.teal }}>{cacheHitRate}%</div>
              <MiniBar value={cacheHitRate} max={100} color={C.teal} height={3} />
              <div className="text-[8px] mt-1" style={{ color: 'var(--text-muted)' }}>Target: above 90%</div>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Error Rate</div>
              <div className="text-xl font-extrabold" style={{ color: errorRate < 0.1 ? C.green : C.red }}>{errorRate}%</div>
              <MiniBar value={errorRate} max={1} color={errorRate < 0.1 ? C.green : C.red} height={3} />
              <div className="text-[8px] mt-1" style={{ color: 'var(--text-muted)' }}>Target: under 0.1%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* -- 4. API Endpoints -- */}
      <Card
        title={`API Endpoints (${apiEndpoints.length})`}
        subtitle="All endpoints healthy — response times under 200ms"
        className="mb-8"
        detailTitle="API Endpoint Details"
        detailContent={
          <div className="space-y-2">
            {apiEndpoints.map((ep, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: statusColors[ep.status] }} />
                  <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--heading)' }}>{ep.method}</span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{ep.path}</span>
                </div>
                <span className="text-[10px] font-bold" style={{ color: ep.responseTime < 100 ? C.green : C.blue }}>{ep.responseTime}ms</span>
              </div>
            ))}
          </div>
        }
      >
        <div className="space-y-1.5">
          {apiEndpoints.slice(0, showEndpoints ? undefined : 6).map((ep, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColors[ep.status] }} />
              <span className="text-[10px] font-mono font-semibold flex-shrink-0 w-10" style={{ color: 'var(--text-muted)' }}>{ep.method}</span>
              <span className="text-[10px] font-mono flex-1 truncate" style={{ color: 'var(--heading)' }}>{ep.path}</span>
              <div className="w-16 flex-shrink-0">
                <MiniBar value={200 - ep.responseTime} max={200} color={ep.responseTime < 50 ? C.green : ep.responseTime < 100 ? C.teal : C.blue} height={3} />
              </div>
              <span className="text-[10px] font-bold flex-shrink-0 w-12 text-right" style={{ color: ep.responseTime < 50 ? C.green : ep.responseTime < 100 ? C.teal : C.blue }}>{ep.responseTime}ms</span>
            </div>
          ))}
          {apiEndpoints.length > 6 && (
            <button
              onClick={() => setShowEndpoints(!showEndpoints)}
              className="text-[10px] font-semibold mt-2"
              style={{ color: C.cyan }}
            >
              {showEndpoints ? 'Show less' : `Show all ${apiEndpoints.length} endpoints`}
            </button>
          )}
        </div>
      </Card>

      {/* -- 5. Database + Email Tracking -- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Database */}
        <Card title="Database (Supabase)" subtitle="Primary event store">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ background: C.green }} />
              <span className="text-[11px] font-bold" style={{ color: C.green }}>Connected</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Events Stored</div>
                <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{eventsProcessed.toLocaleString()}</div>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Storage Used</div>
                <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{storageUsed} GB</div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>Storage: {storageUsed} GB / {storageLimit} GB</span>
                <span className="text-[9px] font-bold" style={{ color: C.teal }}>{((storageUsed / storageLimit) * 100).toFixed(0)}%</span>
              </div>
              <MiniBar value={storageUsed} max={storageLimit} color={C.teal} height={6} />
            </div>
          </div>
        </Card>

        {/* Email Tracking */}
        <Card title="Email Tracking Endpoints" subtitle="Pixel, logo, click, confirm, and receipt tracking">
          <div className="space-y-3">
            {trackingEndpoints.map((te, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: statusColors[te.status] }} />
                  <div>
                    <span className="text-[10px] font-bold block" style={{ color: 'var(--heading)' }}>{te.name}</span>
                    <span className="text-[8px] font-mono" style={{ color: 'var(--text-muted)' }}>{te.path}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{te.hits24h.toLocaleString()}</div>
                  <div className="text-[8px]" style={{ color: 'var(--text-muted)' }}>24h | {te.hitsTotal.toLocaleString()} total</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* -- 6. Integrations -- */}
      <Card
        title="Integrations"
        subtitle="Third-party service connections and sync status"
        className="mb-8"
      >
        <div className="space-y-3">
          {integrations.map((ig, i) => {
            const sColor = statusColors[ig.status];
            const StatusIcon = ig.status === 'connected' ? CheckCircle2 : ig.status === 'pending' ? Clock : XCircle;
            return (
              <div key={i} className="rounded-lg p-4" style={{ background: 'var(--input-bg)', borderLeft: `3px solid ${sColor}` }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4" style={{ color: sColor }} />
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{ig.name}</span>
                  </div>
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `color-mix(in srgb, ${sColor} 12%, transparent)`, color: sColor }}
                  >
                    {ig.status.charAt(0).toUpperCase() + ig.status.slice(1)}
                  </span>
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{ig.details}</p>
                {ig.lastSync && (
                  <div className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>Last sync: {ig.lastSync}</div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* -- 7. Uptime Bar -- */}
      <Card
        title={`Uptime: ${uptime}% (30 Days)`}
        subtitle="Green = fully operational | Yellow = partial outage | Red = down"
        className="mb-8"
      >
        <div className="flex gap-1 py-2">
          {uptimeDays.map((d, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all hover:scale-y-125"
              style={{
                height: 28,
                background: d.status === 'up' ? C.green + '80' : d.status === 'partial' ? C.amber + '80' : C.red + '80',
                border: `1px solid ${d.status === 'up' ? C.green : d.status === 'partial' ? C.amber : C.red}`,
              }}
              title={`Day ${d.day}: ${d.status === 'up' ? 'Fully operational' : d.status === 'partial' ? 'Partial outage (2m 14s)' : 'Outage'}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>30 days ago</span>
          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Today</span>
        </div>
      </Card>

      {/* -- 8. Error Log -- */}
      <Card
        title={`Error Log (${errorRate}% error rate)`}
        subtitle="Last 5 errors across all endpoints"
        className="mb-8"
      >
        <div className="space-y-2">
          {errorLog.map((err, i) => (
            <div key={i} className="rounded-lg p-3" style={{ background: 'var(--input-bg)', borderLeft: `3px solid ${err.code >= 500 ? C.red : C.orange}` }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-extrabold px-1.5 py-0.5 rounded"
                    style={{
                      background: err.code >= 500 ? 'rgba(217,74,74,0.12)' : 'rgba(232,146,63,0.12)',
                      color: err.code >= 500 ? C.red : C.orange,
                    }}
                  >
                    {err.code}
                  </span>
                  <span className="text-[10px] font-mono font-semibold" style={{ color: 'var(--heading)' }}>{err.endpoint}</span>
                </div>
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{err.timestamp}</span>
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{err.message}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* -- 9. API Latency Chart -- */}
      <Card
        title="API Response Time Distribution"
        subtitle="Average response time per endpoint"
        className="mb-8"
      >
        <ClientChart
          type="bar"
          height={280}
          data={{
            labels: apiEndpoints.map(e => `${e.method} ${e.path.split('/').slice(-1)[0]}`),
            datasets: [{
              label: 'Response Time (ms)',
              data: apiEndpoints.map(e => e.responseTime),
              backgroundColor: apiEndpoints.map(e =>
                e.responseTime < 50 ? C.green + '60' : e.responseTime < 100 ? C.teal + '60' : C.blue + '60'
              ),
              borderColor: apiEndpoints.map(e =>
                e.responseTime < 50 ? C.green : e.responseTime < 100 ? C.teal : C.blue
              ),
              borderWidth: 2,
              borderRadius: 6,
            }],
          }}
          options={{
            indexAxis: 'y' as const,
            plugins: {
              legend: { display: false },
              datalabels: {
                display: true,
                anchor: 'end' as const,
                align: 'end' as const,
                color: '#e2e8f0',
                font: { weight: 'bold' as const, size: 9 },
                formatter: (v: number) => v + 'ms',
              },
            },
            scales: {
              x: { max: 250, grid: { color: '#1e3350' }, ticks: { color: '#8899aa', callback: (v: number) => v + 'ms' } },
              y: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 8 } } },
            },
          }}
        />
      </Card>

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(6,182,212,0.08)', color: C.cyan, border: '1px solid rgba(6,182,212,0.15)' }}
        >
          <Server className="w-3 h-3" />
          SystemDashboard&trade; is a MEMTrak infrastructure feature
        </span>
      </div>
    </div>
  );
}
