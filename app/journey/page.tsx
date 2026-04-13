'use client';

import { useState } from 'react';
import { Search, Mail, Phone, Users, Calendar, CheckCircle, XCircle, Eye, MousePointerClick, DollarSign, Clock } from 'lucide-react';

interface TouchEvent {
  date: string;
  type: 'email-sent' | 'email-opened' | 'email-clicked' | 'phone' | 'meeting' | 'event' | 'payment' | 'bounced';
  description: string;
  staff?: string;
  campaign?: string;
}

const demoOrgs: { name: string; type: string; email: string; member: string; dues: number; since: number; events: TouchEvent[] }[] = [
  {
    name: 'First American Title', type: 'ACU', email: 'jsmith@firstam.com', member: 'M-1001', dues: 61554, since: 2008,
    events: [
      { date: '2026-04-11', type: 'email-opened', description: 'Opened: Title News Weekly #15', campaign: 'title-news-w15' },
      { date: '2026-04-10', type: 'phone', description: 'ACU Retention Check-in — happy with DASH 2.0', staff: 'Paul Martin' },
      { date: '2026-04-07', type: 'email-clicked', description: 'Clicked ALTA ONE registration link', campaign: 'alta-one-earlybird' },
      { date: '2026-04-07', type: 'email-opened', description: 'Opened: ALTA ONE Early Bird', campaign: 'alta-one-earlybird' },
      { date: '2026-04-01', type: 'payment', description: 'Membership renewal payment — $61,554', staff: 'System' },
      { date: '2026-03-28', type: 'email-opened', description: 'Opened: State Legislation Alert', campaign: 'advocacy-alert-state' },
      { date: '2026-03-15', type: 'event', description: 'Attended: Q1 Industry Outlook Webinar', staff: 'Deirdre Green' },
      { date: '2026-03-01', type: 'email-sent', description: 'Sent: Membership Renewal Notice', campaign: 'renewal-apr-batch', staff: 'Taylor Spolidoro' },
      { date: '2026-01-15', type: 'meeting', description: 'Annual strategy review with CEO', staff: 'Chris Morton' },
    ],
  },
  {
    name: 'Heritage Abstract LLC', type: 'ACB', email: 'info@heritageabstract.com', member: 'M-4421', dues: 517, since: 2019,
    events: [
      { date: '2026-04-09', type: 'bounced', description: 'BOUNCED: PFL Compliance Notice — invalid address', campaign: 'pfl-compliance-apr-w3' },
      { date: '2026-03-15', type: 'email-sent', description: 'Sent: PFL Compliance Wave 2', campaign: 'pfl-compliance-mar', staff: 'Taylor Spolidoro' },
      { date: '2026-01-20', type: 'email-opened', description: 'Opened: Title News Weekly #3 (LAST OPEN)', campaign: 'title-news-w3' },
      { date: '2025-11-10', type: 'email-sent', description: 'Sent: Membership Renewal', campaign: 'renewal-2026', staff: 'Taylor Spolidoro' },
      { date: '2025-09-15', type: 'email-opened', description: 'Opened: ALTA ONE Save the Date', campaign: 'alta-one-std' },
    ],
  },
  {
    name: 'Liberty Title Group', type: 'ACA', email: 'swilliams@libertytitle.com', member: 'M-2205', dues: 1216, since: 2015,
    events: [
      { date: '2026-04-08', type: 'meeting', description: 'CEO met regional director — considering multi-office upgrade', staff: 'Chris Morton' },
      { date: '2026-04-05', type: 'email-opened', description: 'Opened: ALTA ONE Early Bird', campaign: 'alta-one-earlybird' },
      { date: '2026-04-01', type: 'email-clicked', description: 'Clicked renewal link', campaign: 'renewal-apr-batch' },
      { date: '2026-03-25', type: 'email-opened', description: 'Opened: TIPAC Pledge Drive', campaign: 'tipac-q2-pledge' },
      { date: '2026-03-15', type: 'event', description: 'Attended: EDge Spring Cohort', staff: 'Deirdre Green' },
      { date: '2026-02-20', type: 'payment', description: 'Membership renewal payment — $1,216', staff: 'System' },
      { date: '2026-01-10', type: 'phone', description: 'New year check-in — positive', staff: 'Paul Martin' },
    ],
  },
];

const typeIcons: Record<string, typeof Mail> = { 'email-sent': Mail, 'email-opened': Eye, 'email-clicked': MousePointerClick, phone: Phone, meeting: Users, event: Calendar, payment: DollarSign, bounced: XCircle };
const typeColors: Record<string, string> = { 'email-sent': 'bg-blue-500/20 text-blue-400', 'email-opened': 'bg-green-500/20 text-green-400', 'email-clicked': 'bg-purple-500/20 text-purple-400', phone: 'bg-amber-500/20 text-amber-400', meeting: 'bg-cyan-500/20 text-cyan-400', event: 'bg-indigo-500/20 text-indigo-400', payment: 'bg-green-500/20 text-green-400', bounced: 'bg-red-500/20 text-red-400' };

export default function Journey() {
  const [selected, setSelected] = useState(demoOrgs[0]);
  const [search, setSearch] = useState('');

  const filtered = search ? demoOrgs.filter(o => o.name.toLowerCase().includes(search.toLowerCase())) : demoOrgs;

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold text-white mb-6">Member Journey</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Org List */}
        <div>
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organizations..." className="w-full pl-9 pr-3 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#8CC63F]/50" />
          </div>
          <div className="space-y-2">
            {filtered.map(org => (
              <button key={org.member} onClick={() => setSelected(org)} className={`w-full text-left p-3.5 rounded-xl transition-all ${selected.member === org.member ? 'bg-[#8CC63F]/20 border-2 border-[#8CC63F]/50' : 'bg-[var(--card)] border border-[var(--card-border)] hover:border-white/30'}`}>
                <div className="text-xs font-bold text-white">{org.name}</div>
                <div className="text-[10px] text-white/40">{org.type} · {org.email}</div>
                <div className="text-[10px] text-white/30 mt-1">{org.events.length} touchpoints · Since {org.since}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">{selected.name}</h2>
                <div className="text-[10px] text-white/40">{selected.type} · {selected.email} · {selected.member} · Since {selected.since}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-white">${selected.dues.toLocaleString()}</div>
                <div className="text-[10px] text-white/40">annual dues</div>
              </div>
            </div>
          </div>

          <div className="relative pl-6">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-white/10" />

            <div className="space-y-3">
              {selected.events.map((ev, i) => {
                const Icon = typeIcons[ev.type] || Mail;
                return (
                  <div key={i} className="relative">
                    <div className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center ${typeColors[ev.type]}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-3 ml-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{ev.description}</span>
                        <span className="text-[10px] text-white/30">{ev.date}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-white/30">
                        {ev.staff && <span><Users className="w-3 h-3 inline mr-0.5" />{ev.staff}</span>}
                        {ev.campaign && <span className="px-1.5 py-0.5 rounded bg-white/5">{ev.campaign}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
