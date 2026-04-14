'use client';

import { useState, useMemo } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import CountdownClock from '@/components/CountdownClock';
import ClientChart from '@/components/ClientChart';
import {
  Bell, AlertTriangle, Clock, CheckCircle2, Plus, Trash2,
  Phone, Mail, RefreshCw, BarChart3, Pencil, User, ChevronRight,
  CalendarDays,
} from 'lucide-react';

/* ── colors ────────────────────────────────────────────────────────── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  purple: '#7C5CFC',
  teal: '#14B8A6',
};

/* ── types ─────────────────────────────────────────────────────────── */
type Priority = 'High' | 'Medium' | 'Low';
type ReminderType = 'Follow-up Call' | 'Send Email' | 'Check Renewal' | 'Review Campaign' | 'Custom';
type ReminderStatus = 'active' | 'overdue' | 'completed';

interface Reminder {
  id: string;
  org: string;
  type: ReminderType;
  dueDate: string;         // ISO
  priority: Priority;
  notes: string;
  assignedTo: string;
  status: ReminderStatus;
  completedAt?: string;
}

/* ── constants ─────────────────────────────────────────────────────── */
const STAFF = ['Chris Morton', 'Paul Martin', 'Taylor Spolidoro', 'Caroline Ehrenfeld', 'Emily Mincey'];
const REMINDER_TYPES: ReminderType[] = ['Follow-up Call', 'Send Email', 'Check Renewal', 'Review Campaign', 'Custom'];

const typeIcon: Record<ReminderType, typeof Phone> = {
  'Follow-up Call': Phone,
  'Send Email': Mail,
  'Check Renewal': RefreshCw,
  'Review Campaign': BarChart3,
  'Custom': Pencil,
};

const priorityColor: Record<Priority, string> = {
  High: C.red,
  Medium: C.orange,
  Low: C.blue,
};

/* ── seed reminders ────────────────────────────────────────────────── */
const SEED: Reminder[] = [
  { id: 'r1', org: 'Heritage Abstract LLC', type: 'Follow-up Call', dueDate: '2026-04-12T10:00:00', priority: 'High', notes: 'Gone dark 90+ days. Critical churn risk.', assignedTo: 'Taylor Spolidoro', status: 'overdue' },
  { id: 'r2', org: 'First American Title', type: 'Check Renewal', dueDate: '2026-04-13T14:00:00', priority: 'High', notes: 'Renewal due Apr 30 -- $61K account. Confirm payment.', assignedTo: 'Chris Morton', status: 'overdue' },
  { id: 'r3', org: 'National Title Services', type: 'Send Email', dueDate: '2026-04-14T09:00:00', priority: 'Medium', notes: 'Send soft-touch value email. Said not interested to PFL.', assignedTo: 'Paul Martin', status: 'active' },
  { id: 'r4', org: 'Liberty Title Group', type: 'Follow-up Call', dueDate: '2026-04-14T15:00:00', priority: 'Medium', notes: 'Follow up on multi-office upgrade discussion from Apr 11.', assignedTo: 'Chris Morton', status: 'active' },
  { id: 'r5', org: 'Stewart Title Guaranty', type: 'Follow-up Call', dueDate: '2026-04-15T10:00:00', priority: 'Medium', notes: 'Interested in membership tier upgrade. Needs board approval.', assignedTo: 'Paul Martin', status: 'active' },
  { id: 'r6', org: 'Commonwealth Land Title', type: 'Review Campaign', dueDate: '2026-04-16T09:00:00', priority: 'Low', notes: 'Review ALTA ONE early bird registration performance.', assignedTo: 'Emily Mincey', status: 'active' },
  { id: 'r7', org: 'WFG National Title', type: 'Send Email', dueDate: '2026-04-17T11:00:00', priority: 'Low', notes: 'Send CEO roundtable recap and follow-up materials.', assignedTo: 'Chris Morton', status: 'active' },
  { id: 'r8', org: 'Old Republic Title', type: 'Check Renewal', dueDate: '2026-04-18T14:00:00', priority: 'Medium', notes: 'Renewal coming up May 1. Spring event interest confirmed.', assignedTo: 'Caroline Ehrenfeld', status: 'active' },
  { id: 'r9', org: 'Chicago Title Insurance', type: 'Review Campaign', dueDate: '2026-04-10T09:00:00', priority: 'Low', notes: 'Reviewed ACU retention check-in results. No issues found.', assignedTo: 'Paul Martin', status: 'completed', completedAt: '2026-04-10T16:30:00' },
  { id: 'r10', org: 'Fidelity National Title', type: 'Send Email', dueDate: '2026-04-11T10:00:00', priority: 'Medium', notes: 'Sent onboarding follow-up. Awaiting reply.', assignedTo: 'Emily Mincey', status: 'completed', completedAt: '2026-04-11T10:15:00' },
];

/* ── helpers ────────────────────────────────────────────────────────── */
function formatDue(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function dayOfWeek(iso: string): number {
  return new Date(iso).getDay(); // 0=Sun
}

/* ── page ──────────────────────────────────────────────────────────── */
export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>(SEED);
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  /* form state */
  const [fOrg, setFOrg] = useState('');
  const [fType, setFType] = useState<ReminderType>('Follow-up Call');
  const [fDue, setFDue] = useState('2026-04-20T10:00');
  const [fPriority, setFPriority] = useState<Priority>('Medium');
  const [fNotes, setFNotes] = useState('');
  const [fStaff, setFStaff] = useState(STAFF[0]);

  /* derived lists */
  const active = useMemo(() => reminders.filter(r => r.status === 'active').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), [reminders]);
  const overdue = useMemo(() => reminders.filter(r => r.status === 'overdue').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), [reminders]);
  const completed = useMemo(() => reminders.filter(r => r.status === 'completed').sort((a, b) => new Date(b.completedAt || b.dueDate).getTime() - new Date(a.completedAt || a.dueDate).getTime()), [reminders]);

  /* submit */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fOrg.trim()) return;
    const nr: Reminder = {
      id: `u${Date.now()}`,
      org: fOrg.trim(),
      type: fType,
      dueDate: new Date(fDue).toISOString(),
      priority: fPriority,
      notes: fNotes.trim(),
      assignedTo: fStaff,
      status: 'active',
    };
    setReminders(prev => [nr, ...prev]);
    setFOrg('');
    setFNotes('');
    setShowForm(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2500);
  }

  /* complete / delete */
  function completeReminder(id: string) {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' as const, completedAt: new Date().toISOString() } : r));
  }
  function deleteReminder(id: string) {
    setReminders(prev => prev.filter(r => r.id !== id));
  }

  /* calendar mini — this week Mon-Sun */
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekDates = ['2026-04-13', '2026-04-14', '2026-04-15', '2026-04-16', '2026-04-17', '2026-04-18', '2026-04-19'];
  const weekCounts = weekDates.map(d => reminders.filter(r => r.status !== 'completed' && r.dueDate.startsWith(d)).length);

  /* chart: reminders by type */
  const typeLabels = REMINDER_TYPES;
  const typeCounts = typeLabels.map(t => reminders.filter(r => r.type === t).length);
  const typeChartData = {
    labels: typeLabels,
    datasets: [{
      data: typeCounts,
      backgroundColor: [C.green, C.blue, C.orange, C.purple, C.teal],
      borderWidth: 2,
      borderColor: 'rgba(10,22,40,0.8)',
      hoverOffset: 12,
    }],
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--card-border)',
    color: 'var(--heading)',
  };

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #E8923F, #D94A4A)', boxShadow: '0 4px 16px rgba(232,146,63,0.3)' }}
          >
            <Bell className="w-5 h-5" style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              Email Reminders
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.orange }}>
              Schedule follow-up reminders for member outreach
            </p>
          </div>
        </div>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger-children">
        <SparkKpi
          label="Active Reminders"
          value={active.length}
          icon={Bell}
          color={C.blue}
          sub="Pending follow-ups"
          sparkData={[4, 5, 6, 5, 7, 6, active.length]}
          sparkColor={C.blue}
          accent
        />
        <SparkKpi
          label="Overdue"
          value={overdue.length}
          icon={AlertTriangle}
          color={C.red}
          sub="Needs immediate action"
          sparkData={[1, 0, 2, 1, 0, 1, overdue.length]}
          sparkColor={C.red}
          trend={overdue.length > 0 ? { value: overdue.length * 50, label: 'past due' } : undefined}
          accent
        />
        <SparkKpi
          label="Due Today"
          value={active.filter(r => r.dueDate.startsWith('2026-04-14')).length}
          icon={Clock}
          color={C.orange}
          sub="Reminders for today"
          sparkData={[2, 1, 3, 2, 1, 2, active.filter(r => r.dueDate.startsWith('2026-04-14')).length]}
          sparkColor={C.orange}
          accent
        />
        <SparkKpi
          label="Completed This Week"
          value={completed.length}
          icon={CheckCircle2}
          color={C.green}
          sub="Closed out successfully"
          sparkData={[1, 2, 1, 2, 3, 2, completed.length]}
          sparkColor={C.green}
          trend={{ value: 15, label: 'vs last week' }}
          accent
        />
      </div>

      {/* ── Create Reminder Toggle ──────────────────────────────────── */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: showForm ? 'var(--input-bg)' : 'linear-gradient(135deg, #E8923F, #D94A4A)',
            color: showForm ? 'var(--heading)' : '#fff',
            boxShadow: showForm ? 'none' : '0 4px 16px rgba(232,146,63,0.35)',
            border: showForm ? '1px solid var(--card-border)' : 'none',
          }}
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Create Reminder'}
        </button>
        {successMsg && (
          <span
            className="text-xs font-bold px-3 py-1.5 rounded-lg animate-pulse ml-3"
            style={{ background: 'rgba(140,198,63,0.15)', color: C.green }}
          >
            Reminder created!
          </span>
        )}
      </div>

      {/* ── Create Reminder Form ────────────────────────────────────── */}
      {showForm && (
        <Card title="New Reminder" subtitle="Set a follow-up for member outreach" accent={C.orange} className="mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                  Member / Organization
                </label>
                <input
                  type="text"
                  value={fOrg}
                  onChange={e => setFOrg(e.target.value)}
                  placeholder="Organization name..."
                  className="w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none"
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                  Reminder Type
                </label>
                <select
                  value={fType}
                  onChange={e => setFType(e.target.value as ReminderType)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none appearance-none"
                  style={inputStyle}
                >
                  {REMINDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                  Due Date / Time
                </label>
                <input
                  type="datetime-local"
                  value={fDue}
                  onChange={e => setFDue(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                  Priority
                </label>
                <div className="flex gap-1.5">
                  {(['High', 'Medium', 'Low'] as Priority[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFPriority(p)}
                      className="flex-1 px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-200"
                      style={{
                        background: fPriority === p ? `color-mix(in srgb, ${priorityColor[p]} 20%, transparent)` : 'var(--input-bg)',
                        border: `1.5px solid ${fPriority === p ? priorityColor[p] : 'var(--card-border)'}`,
                        color: fPriority === p ? priorityColor[p] : 'var(--text-muted)',
                        transform: fPriority === p ? 'scale(1.03)' : 'scale(1)',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                  Assigned To
                </label>
                <select
                  value={fStaff}
                  onChange={e => setFStaff(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none appearance-none"
                  style={inputStyle}
                >
                  {STAFF.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Notes
              </label>
              <textarea
                value={fNotes}
                onChange={e => setFNotes(e.target.value)}
                placeholder="Additional context..."
                rows={2}
                className="w-full px-3 py-2.5 text-xs rounded-xl focus:outline-none resize-none"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #E8923F, #D94A4A)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(232,146,63,0.35)',
              }}
            >
              <Bell className="w-4 h-4" />
              Set Reminder
            </button>
          </form>
        </Card>
      )}

      {/* ── Overdue Section ─────────────────────────────────────────── */}
      {overdue.length > 0 && (
        <Card
          title={`Overdue (${overdue.length})`}
          subtitle="Past-due reminders requiring immediate action"
          accent={C.red}
          className="mb-6"
        >
          <div className="space-y-2">
            {overdue.map(r => {
              const Icon = typeIcon[r.type];
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                  style={{
                    background: 'rgba(217,74,74,0.06)',
                    border: '1px solid rgba(217,74,74,0.2)',
                    animation: 'overduePulse 2s ease-in-out infinite',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(217,74,74,0.15)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: C.red }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{r.org}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(217,74,74,0.15)', color: C.red }}>
                        OVERDUE
                      </span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: `color-mix(in srgb, ${priorityColor[r.priority]} 15%, transparent)`, color: priorityColor[r.priority] }}
                      >
                        {r.priority}
                      </span>
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {r.type} &middot; Due {formatDue(r.dueDate)} &middot; {r.assignedTo}
                    </div>
                    {r.notes && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>{r.notes}</div>}
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => completeReminder(r.id)}
                      className="p-2 rounded-lg transition-all hover:scale-110"
                      style={{ background: 'rgba(140,198,63,0.1)' }}
                      title="Mark complete"
                    >
                      <CheckCircle2 className="w-4 h-4" style={{ color: C.green }} />
                    </button>
                    <button
                      onClick={() => deleteReminder(r.id)}
                      className="p-2 rounded-lg transition-all hover:scale-110"
                      style={{ background: 'rgba(217,74,74,0.1)' }}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" style={{ color: C.red }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Active Reminders ────────────────────────────────────────── */}
      <Card
        title={`Active Reminders (${active.length})`}
        subtitle="Upcoming follow-ups with live countdowns"
        accent={C.blue}
        className="mb-6"
      >
        {active.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: C.green, opacity: 0.5 }} />
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>All caught up! No active reminders.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map(r => {
              const Icon = typeIcon[r.type];
              const isToday = r.dueDate.startsWith('2026-04-14');
              return (
                <div
                  key={r.id}
                  className="flex items-start gap-3 p-3 rounded-xl transition-all duration-200 hover:translate-x-1"
                  style={{
                    background: isToday ? 'rgba(232,146,63,0.04)' : 'var(--input-bg)',
                    border: `1px solid ${isToday ? 'rgba(232,146,63,0.2)' : 'var(--card-border)'}`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `color-mix(in srgb, ${priorityColor[r.priority]} 15%, transparent)` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: priorityColor[r.priority] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{r.org}</span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: `color-mix(in srgb, ${priorityColor[r.priority]} 15%, transparent)`, color: priorityColor[r.priority] }}
                      >
                        {r.priority}
                      </span>
                      {isToday && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(232,146,63,0.15)', color: C.orange }}>
                          TODAY
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {r.type} &middot; Due {formatDue(r.dueDate)}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <User className="w-2.5 h-2.5" style={{ color: 'var(--text-muted)' }} />
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{r.assignedTo}</span>
                    </div>
                    {r.notes && <div className="text-[10px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)', opacity: 0.8 }}>{r.notes}</div>}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <CountdownClock
                      targetDate={r.dueDate}
                      label=""
                      size="sm"
                      color={priorityColor[r.priority]}
                      startDate="2026-04-14T00:00:00"
                    />
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => completeReminder(r.id)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(140,198,63,0.1)' }}
                        title="Mark complete"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: C.green }} />
                      </button>
                      <button
                        onClick={() => deleteReminder(r.id)}
                        className="p-1.5 rounded-lg transition-all hover:scale-110"
                        style={{ background: 'rgba(217,74,74,0.1)' }}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" style={{ color: C.red }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Calendar Mini + Chart Row ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Calendar Mini-View */}
        <Card title="This Week" subtitle="Reminder distribution Mon-Sun">
          <div className="grid grid-cols-7 gap-2 mt-2">
            {weekLabels.map((day, i) => {
              const count = weekCounts[i];
              const isToday = i === 1; // Tue Apr 14
              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: isToday ? C.orange : 'var(--text-muted)' }}>
                    {day}
                  </span>
                  <div
                    className="w-full aspect-square rounded-xl flex items-center justify-center text-sm font-extrabold transition-all"
                    style={{
                      background: isToday
                        ? `color-mix(in srgb, ${C.orange} 15%, transparent)`
                        : count > 0
                          ? `color-mix(in srgb, ${C.blue} ${Math.min(count * 15, 40)}%, transparent)`
                          : 'var(--input-bg)',
                      border: isToday ? `2px solid ${C.orange}` : '1px solid var(--card-border)',
                      color: count > 0 ? 'var(--heading)' : 'var(--text-muted)',
                    }}
                  >
                    {count}
                  </div>
                  <span className="text-[8px]" style={{ color: 'var(--text-muted)' }}>
                    Apr {13 + i}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Reminder Types Chart */}
        <Card title="By Type" subtitle="Reminder distribution by category">
          <ClientChart
            type="doughnut"
            height={240}
            data={typeChartData}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom' as const,
                  labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 10 } },
                },
              },
            }}
          />
        </Card>
      </div>

      {/* ── Completed Log ───────────────────────────────────────────── */}
      <Card
        title={`Completed (${completed.length})`}
        subtitle="Recently closed reminders"
        accent={C.green}
        className="mb-6"
      >
        {completed.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No completed reminders yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {completed.map(r => {
              const Icon = typeIcon[r.type];
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', opacity: 0.75 }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(140,198,63,0.1)' }}
                  >
                    <CheckCircle2 className="w-4 h-4" style={{ color: C.green }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold line-through" style={{ color: 'var(--heading)' }}>{r.org}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(140,198,63,0.15)', color: C.green }}>
                        Done
                      </span>
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {r.type} &middot; Completed {r.completedAt ? formatDue(r.completedAt) : 'recently'} &middot; {r.assignedTo}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    className="p-1.5 rounded-lg transition-all hover:scale-110 flex-shrink-0"
                    style={{ background: 'rgba(217,74,74,0.05)' }}
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Animations ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes overduePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217,74,74,0); }
          50% { box-shadow: 0 0 16px 2px rgba(217,74,74,0.15); }
        }
      `}</style>
    </div>
  );
}
