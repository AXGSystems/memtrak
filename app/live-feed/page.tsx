'use client';

import { useState, useEffect } from 'react';
import { Eye, MousePointerClick, Mail, Send, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface FeedEvent {
  id: string;
  time: string;
  type: 'open' | 'click' | 'send' | 'bounce' | 'unsubscribe' | 'confirm';
  org: string;
  email: string;
  campaign: string;
  detail: string;
}

const typeConfig = {
  open: { icon: Eye, color: '#8CC63F', label: 'Opened', bg: 'rgba(140,198,63,0.1)' },
  click: { icon: MousePointerClick, color: '#4A90D9', label: 'Clicked', bg: 'rgba(74,144,217,0.1)' },
  send: { icon: Send, color: '#4A90D9', label: 'Sent', bg: 'rgba(74,144,217,0.06)' },
  bounce: { icon: XCircle, color: '#D94A4A', label: 'Bounced', bg: 'rgba(217,74,74,0.1)' },
  unsubscribe: { icon: AlertTriangle, color: '#E8923F', label: 'Unsubscribed', bg: 'rgba(232,146,63,0.1)' },
  confirm: { icon: CheckCircle, color: '#8CC63F', label: 'Confirmed', bg: 'rgba(140,198,63,0.1)' },
};

// Simulated live events — in production these come from /api/memtrak/events in real-time
const demoEvents: Omit<FeedEvent, 'id' | 'time'>[] = [
  { type: 'open', org: 'First American Title', email: 'jsmith@firstam.com', campaign: 'ALTA ONE Early Bird', detail: 'Opened via iPhone (Apple Mail)' },
  { type: 'click', org: 'First American Title', email: 'jsmith@firstam.com', campaign: 'ALTA ONE Early Bird', detail: 'Clicked: Register Now → alta.org/altaone' },
  { type: 'open', org: 'Old Republic Title', email: 'info@oldrepublic.com', campaign: 'Title News Weekly #15', detail: 'Opened via Outlook Desktop' },
  { type: 'send', org: 'Heritage Abstract LLC', email: 'info@heritageabstract.com', campaign: 'PFL Compliance Wave 3', detail: 'Email queued for delivery' },
  { type: 'bounce', org: 'Heritage Abstract LLC', email: 'info@heritageabstract.com', campaign: 'PFL Compliance Wave 3', detail: 'Hard bounce — mailbox does not exist' },
  { type: 'open', org: 'Commonwealth Land Title', email: 'landerson@commonwealth.com', campaign: 'Membership Renewal', detail: 'Opened via Gmail (Web)' },
  { type: 'click', org: 'Commonwealth Land Title', email: 'landerson@commonwealth.com', campaign: 'Membership Renewal', detail: 'Clicked: Renew Your Membership → alta.org/renew' },
  { type: 'confirm', org: 'Commonwealth Land Title', email: 'landerson@commonwealth.com', campaign: 'Membership Renewal', detail: 'Confirmed receipt of renewal notice' },
  { type: 'open', org: 'Liberty Title Group', email: 'swilliams@libertytitle.com', campaign: 'ALTA ONE Early Bird', detail: 'Opened via Outlook Web' },
  { type: 'send', org: 'National Title Services', email: 'mbrown@nationaltitle.com', campaign: 'PFL Compliance Wave 3', detail: 'Email delivered successfully' },
  { type: 'open', org: 'Stewart Title', email: 'info@stewart.com', campaign: 'Title News Weekly #15', detail: 'Opened via Apple Mail (macOS)' },
  { type: 'unsubscribe', org: 'Summit Title Services', email: 'admin@summittitle.com', campaign: 'Title News Weekly #15', detail: 'Unsubscribed — removed from future sends' },
  { type: 'click', org: 'Old Republic Title', email: 'info@oldrepublic.com', campaign: 'Title News Weekly #15', detail: 'Clicked: Read Full Article → alta.org/news/123' },
  { type: 'open', org: 'Fidelity National Title', email: 'info@fnt.com', campaign: 'ALTA ONE Early Bird', detail: 'Opened via Gmail (Android)' },
  { type: 'click', org: 'Fidelity National Title', email: 'info@fnt.com', campaign: 'ALTA ONE Early Bird', detail: 'Clicked: View Speaker Lineup → alta.org/altaone/speakers' },
];

export default function LiveFeed() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [paused, setPaused] = useState(false);

  // Simulate live events arriving
  useEffect(() => {
    if (paused) return;
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= demoEvents.length) idx = 0;
      const ev = demoEvents[idx];
      const now = new Date();
      setEvents(prev => [{
        id: `${Date.now()}-${idx}`,
        time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }),
        ...ev,
      }, ...prev].slice(0, 50));
      idx++;
    }, 2500);
    return () => clearInterval(interval);
  }, [paused]);

  const counts = { opens: events.filter(e => e.type === 'open').length, clicks: events.filter(e => e.type === 'click').length, bounces: events.filter(e => e.type === 'bounce').length };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>Live Activity Feed</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Real-time tracking events as they happen. Every open, click, bounce, and confirmation — live.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${paused ? 'bg-amber-500' : 'bg-green-500 animate-pulse'}`} />
            <span className="text-[10px] font-bold" style={{ color: paused ? '#E8923F' : '#8CC63F' }}>{paused ? 'PAUSED' : 'LIVE'}</span>
          </div>
          <button onClick={() => setPaused(!paused)} className="px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ borderColor: 'var(--card-border)', color: 'var(--heading)' }}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>
      </div>

      {/* Live counters */}
      <div className="grid grid-cols-4 gap-3 mb-6 stagger-children">
        <div className="rounded-xl border p-3 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-xl font-extrabold num-transition" style={{ color: 'var(--heading)' }}>{events.length}</div>
          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Total Events</div>
        </div>
        <div className="rounded-xl border p-3 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-xl font-extrabold num-transition" style={{ color: '#8CC63F' }}>{counts.opens}</div>
          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Opens</div>
        </div>
        <div className="rounded-xl border p-3 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-xl font-extrabold num-transition" style={{ color: '#4A90D9' }}>{counts.clicks}</div>
          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Clicks</div>
        </div>
        <div className="rounded-xl border p-3 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-xl font-extrabold num-transition" style={{ color: '#D94A4A' }}>{counts.bounces}</div>
          <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Bounces</div>
        </div>
      </div>

      {/* Event Stream */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--card-border)' }}>
          <span className={`w-2 h-2 rounded-full ${paused ? 'bg-amber-500' : 'bg-green-500 animate-pulse'}`} />
          <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Event Stream</span>
          <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>{events.length} events</span>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {events.map((ev, i) => {
            const cfg = typeConfig[ev.type];
            const Icon = cfg.icon;
            return (
              <div key={ev.id} className="flex items-start gap-3 px-5 py-3 border-b transition-all" style={{ borderColor: 'var(--card-border)', background: i === 0 ? cfg.bg : 'transparent', opacity: i === 0 ? 1 : Math.max(0.4, 1 - i * 0.03) }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: cfg.bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{ev.org}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--background)', color: 'var(--text-muted)' }}>{ev.campaign}</span>
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{ev.detail}</div>
                </div>
                <div className="text-[9px] flex-shrink-0 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <Clock className="w-3 h-3" />{ev.time}
                </div>
              </div>
            );
          })}
          {events.length === 0 && (
            <div className="text-center py-12 text-xs" style={{ color: 'var(--text-muted)' }}>Waiting for events... Events will appear here in real-time as recipients interact with your emails.</div>
          )}
        </div>
      </div>
    </div>
  );
}
