'use client';

import { demoCampaigns } from '@/lib/demo-data';
import { Calendar, Send, Clock, CheckCircle } from 'lucide-react';

const months = ['Apr 2026', 'May 2026', 'Jun 2026'];
const statusColors = { Sent: '#8CC63F', Scheduled: '#4A90D9', Draft: '#E8923F' };

export default function SendCalendar() {
  const campaigns = demoCampaigns;

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Send Calendar</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Shared email send calendar — prevents over-mailing members. See all scheduled, sent, and draft campaigns in one view.</p>

      {/* Calendar Grid */}
      <div className="space-y-6">
        {months.map(month => {
          const monthCampaigns = campaigns.filter(c => {
            if (month === 'Apr 2026') return c.sentDate.startsWith('Apr') || c.sentDate.startsWith('2026-04');
            if (month === 'May 2026') return c.sentDate.startsWith('May') || c.sentDate.startsWith('2026-05');
            return false;
          });
          return (
            <div key={month} className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--heading)' }}>
                <Calendar className="w-4 h-4" style={{ color: 'var(--accent)' }} /> {month}
                <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>({monthCampaigns.length} campaigns)</span>
              </h3>
              {monthCampaigns.length > 0 ? (
                <div className="space-y-2">
                  {monthCampaigns.map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg transition-all hover:translate-x-1" style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}>
                      <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: statusColors[c.status] }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{c.name}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.type} · {c.source} · {c.listSize.toLocaleString()} recipients</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.sentDate}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `color-mix(in srgb, ${statusColors[c.status]} 15%, transparent)`, color: statusColors[c.status] }}>{c.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs" style={{ color: 'var(--text-muted)' }}>No campaigns this month yet</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
