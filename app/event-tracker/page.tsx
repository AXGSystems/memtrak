'use client';

import ClientChart from '@/components/ClientChart';
import { Download } from 'lucide-react';
import { exportCSV } from '@/lib/export-utils';

const C = { green: '#8CC63F', blue: '#4A90D9', red: '#D94A4A', navy: '#002D5C', orange: '#E8923F' };

const events = [
  { name: 'ALTA ONE 2026', date: 'Oct 14-17', location: 'San Diego, CA', registered: 340, capacity: 800, emailsSent: 4994, conversionRate: 6.8, revenue: 162000, status: 'Registration Open' },
  { name: 'Advocacy Summit', date: 'Mar 18-20', location: 'Washington, DC', registered: 221, capacity: 250, emailsSent: 2100, conversionRate: 10.5, revenue: 44200, status: 'Completed' },
  { name: 'EDge Spring Cohort', date: 'Apr 22-24', location: 'Virtual', registered: 180, capacity: 400, emailsSent: 1500, conversionRate: 12.0, revenue: 34000, status: 'Registration Open' },
  { name: 'Regional: Texas', date: 'Jun 5-6', location: 'Austin, TX', registered: 85, capacity: 150, emailsSent: 800, conversionRate: 10.6, revenue: 12750, status: 'Registration Open' },
  { name: 'Regional: Florida', date: 'Jul 10-11', location: 'Orlando, FL', registered: 0, capacity: 200, emailsSent: 0, conversionRate: 0, revenue: 0, status: 'Coming Soon' },
];

export default function EventTracker() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Event Tracker</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Track email-to-registration conversion for every ALTA event. See which campaigns drive registrations and how email engagement correlates with attendance.</p>

      <div className="grid grid-cols-3 gap-3 mb-6 stagger-children">
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--heading)' }}>{events.length}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Events Tracked</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>{events.reduce((s, e) => s + e.registered, 0)}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total Registrations</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: C.green }}>${(events.reduce((s, e) => s + e.revenue, 0) / 1000).toFixed(0)}K</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Event Revenue</div>
        </div>
      </div>

      {/* Event Cards */}
      <div className="space-y-3 mb-6">
        {events.map(e => (
          <div key={e.name} className="rounded-xl border p-5 transition-all hover:translate-y-[-1px]" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{e.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{e.date} · {e.location}</div>
              </div>
              <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold ${e.status === 'Completed' ? 'bg-green-500/20 text-green-400' : e.status === 'Coming Soon' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{e.status}</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div><div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{e.registered}</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>of {e.capacity} capacity</div></div>
              <div><div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{e.emailsSent.toLocaleString()}</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>emails sent</div></div>
              <div><div className="text-lg font-extrabold" style={{ color: e.conversionRate >= 10 ? C.green : C.blue }}>{e.conversionRate}%</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>email→reg rate</div></div>
              <div><div className="text-lg font-extrabold" style={{ color: C.green }}>${(e.revenue / 1000).toFixed(0)}K</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>revenue</div></div>
              <div>
                <div className="h-2 rounded-full" style={{ background: 'var(--card-border)' }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${(e.registered / e.capacity) * 100}%`, background: (e.registered / e.capacity) >= 0.8 ? C.green : C.blue }} />
                </div>
                <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{((e.registered / e.capacity) * 100).toFixed(0)}% filled</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conversion Chart */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: 'var(--heading)' }}>Email-to-Registration Conversion by Event</h3>
        <ClientChart type="bar" height={220} data={{
          labels: events.filter(e => e.emailsSent > 0).map(e => e.name.length > 16 ? e.name.slice(0, 16) + '...' : e.name),
          datasets: [{ label: 'Conversion Rate', data: events.filter(e => e.emailsSent > 0).map(e => e.conversionRate), backgroundColor: events.filter(e => e.emailsSent > 0).map(e => e.conversionRate >= 10 ? C.green : C.blue), borderRadius: 6 }],
        }} options={{
          plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: 'var(--heading)', font: { weight: 'bold' as const, size: 11 }, formatter: (v: number) => v + '%' } },
          scales: { y: { beginAtZero: true, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => v + '%' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)', font: { size: 9 } } } },
        }} />
      </div>
    </div>
  );
}
