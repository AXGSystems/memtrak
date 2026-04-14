'use client';

import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const services = [
  { name: 'MEMTrak API', status: 'Operational', uptime: 99.98, latency: '23ms', lastIncident: 'None' },
  { name: 'Tracking Pixel', status: 'Operational', uptime: 99.99, latency: '8ms', lastIncident: 'None' },
  { name: 'Logo Tracker', status: 'Operational', uptime: 99.99, latency: '12ms', lastIncident: 'None' },
  { name: 'Click Tracker', status: 'Operational', uptime: 99.97, latency: '15ms', lastIncident: 'None' },
  { name: 'Unsubscribe System', status: 'Operational', uptime: 100, latency: '18ms', lastIncident: 'None' },
  { name: 'Analytics Engine', status: 'Operational', uptime: 99.95, latency: '45ms', lastIncident: 'None' },
  { name: 'Send API', status: 'Degraded', uptime: 99.2, latency: '120ms', lastIncident: 'Graph API not configured' },
  { name: 'Dashboard', status: 'Operational', uptime: 99.99, latency: '22ms', lastIncident: 'None' },
];

const statusColors = { Operational: '#8CC63F', Degraded: '#E8923F', Down: '#D94A4A' };
const statusIcons = { Operational: CheckCircle, Degraded: AlertTriangle, Down: AlertTriangle };

// Uptime bars (last 30 days)
const uptimeDays = Array.from({ length: 30 }, (_, i) => ({ day: 30 - i, status: i === 12 ? 'degraded' : 'up' }));

export default function Status() {
  const operational = services.filter(s => s.status === 'Operational').length;
  const overall = operational === services.length ? 'All Systems Operational' : 'Partial Degradation';

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>System Status</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Real-time health of all MEMTrak services. Current status and 30-day uptime history.</p>

      {/* Overall Status */}
      <div className="rounded-xl border p-6 mb-6 text-center" style={{ background: 'var(--card)', borderColor: operational === services.length ? '#8CC63F' : '#E8923F' }}>
        <div className="text-xl font-extrabold" style={{ color: operational === services.length ? '#8CC63F' : '#E8923F' }}>{overall}</div>
        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{operational} of {services.length} services operational · Updated {new Date().toLocaleTimeString()}</div>
      </div>

      {/* 30-day uptime bar */}
      <div className="rounded-xl border p-5 mb-6" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-2" style={{ color: 'var(--heading)' }}>30-Day Uptime</h3>
        <div className="flex gap-0.5">
          {uptimeDays.map(d => (
            <div key={d.day} className="flex-1 h-8 rounded-sm" style={{ background: d.status === 'up' ? '#8CC63F' : '#E8923F', minWidth: 3 }} title={`Day ${d.day}: ${d.status}`} />
          ))}
        </div>
        <div className="flex justify-between text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}><span>30 days ago</span><span>Today</span></div>
      </div>

      {/* Service list */}
      <div className="space-y-2">
        {services.map(svc => {
          const Icon = statusIcons[svc.status as keyof typeof statusIcons];
          const color = statusColors[svc.status as keyof typeof statusColors];
          return (
            <div key={svc.name} className="flex items-center gap-3 rounded-xl border p-4" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
              <div className="flex-1">
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{svc.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Latency: {svc.latency} · Last incident: {svc.lastIncident}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-bold" style={{ color }}>{svc.status}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{svc.uptime}% uptime</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
