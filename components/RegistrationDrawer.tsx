'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save, AlertCircle, CheckCircle2, Loader2, Search } from 'lucide-react';
import SideDrawer from './SideDrawer';
import type { EventAttendance, EventType, Organization, RegistrationStatus } from '@/lib/member-data';

export type RegistrationDrawerMode = 'add-to-event' | 'new-event';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (row: EventAttendance) => void;
  mode: RegistrationDrawerMode;
  /** Required when mode === 'add-to-event'. */
  eventId?: string;
  /** When mode === 'add-to-event', shows the locked metadata in the header. */
  eventMeta?: { event_name: string; event_date: string; event_type: EventType };
}

const EVENT_TYPES: EventType[] = ['Conference', 'Webinar', 'Workshop', 'Committee Meeting', 'Board Meeting', 'Social', 'Training'];
const STATUSES: RegistrationStatus[] = ['Registered', 'Attended', 'No Show', 'Cancelled'];

const slugify = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const todayIso = () => new Date().toISOString().slice(0, 10);

interface FormState {
  // event metadata (only used when mode === 'new-event')
  alta_connect_event_id: string;
  event_name: string;
  event_date: string;
  event_type: EventType;
  // registration
  org_id: string;
  org_search: string;
  contact_id: string;
  registration_status: RegistrationStatus;
  registration_fee: string;
  paid: boolean;
}

const blank = (): FormState => ({
  alta_connect_event_id: '',
  event_name: '',
  event_date: todayIso(),
  event_type: 'Webinar',
  org_id: '',
  org_search: '',
  contact_id: '',
  registration_status: 'Registered',
  registration_fee: '0',
  paid: false,
});

export default function RegistrationDrawer({ isOpen, onClose, onSaved, mode, eventId, eventMeta }: Props) {
  const [form, setForm] = useState<FormState>(blank());
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(blank());
    setError(null);
    setSuccess(false);
    setOrgsLoading(true);
    fetch('/api/memtrak/members?pageSize=2000&sort=org_name&order=asc')
      .then((r) => r.json())
      .then((d: { rows?: Organization[] }) => setOrgs(d.rows ?? []))
      .catch(() => setOrgs([]))
      .finally(() => setOrgsLoading(false));
  }, [isOpen]);

  // Auto-derive event_id slug as user types event_name (only on new-event mode, only if user hasn't manually edited it)
  const [idTouched, setIdTouched] = useState(false);
  useEffect(() => {
    if (mode !== 'new-event') return;
    if (idTouched) return;
    setForm((f) => ({ ...f, alta_connect_event_id: f.event_name ? `evt-${slugify(f.event_name)}-${f.event_date.slice(0, 7)}` : '' }));
  }, [form.event_name, form.event_date, mode, idTouched]);

  const filteredOrgs = useMemo(() => {
    const q = form.org_search.trim().toLowerCase();
    if (!q) return orgs.slice(0, 50);
    return orgs
      .filter((o) =>
        o.org_name.toLowerCase().includes(q) ||
        (o.member_id ?? '').toLowerCase().includes(q) ||
        (o.state ?? '').toLowerCase() === q,
      )
      .slice(0, 50);
  }, [orgs, form.org_search]);

  const selectedOrg = orgs.find((o) => o.id === form.org_id);

  async function submit() {
    setError(null);
    setSuccess(false);

    if (!form.org_id) { setError('Pick an organization to register'); return; }

    const targetEventId = mode === 'new-event' ? form.alta_connect_event_id.trim() : eventId!;
    if (!targetEventId) { setError('Event id required'); return; }

    if (mode === 'new-event') {
      if (!form.event_name.trim()) { setError('Event name required'); return; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(form.event_date)) { setError('Event date must be YYYY-MM-DD'); return; }
    }

    const fee = Number(form.registration_fee);
    if (!Number.isFinite(fee) || fee < 0) { setError('Fee must be a non-negative number'); return; }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        org_id: form.org_id,
        registration_status: form.registration_status,
        registration_fee: fee,
        paid: form.paid,
      };
      if (form.contact_id) body.contact_id = form.contact_id;
      if (mode === 'new-event') {
        body.event_name = form.event_name.trim();
        body.event_date = form.event_date;
        body.event_type = form.event_type;
      }

      const res = await fetch(`/api/memtrak/connect-events/${encodeURIComponent(targetEventId)}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? `Request failed (${res.status})`); return; }

      setSuccess(true);
      onSaved(data.registration as EventAttendance);
      setTimeout(() => onClose(), 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'new-event' ? 'Create event' : 'Register member'}
      subtitle={mode === 'add-to-event' && eventMeta
        ? `${eventMeta.event_name} · ${eventMeta.event_date} · ${eventMeta.event_type}`
        : 'Bootstrap a new event with its first registration'}
      width="lg"
    >
      <div className="space-y-5 text-xs">
        {mode === 'new-event' && (
          <Section title="Event details">
            <Field label="Event name">
              <input
                value={form.event_name}
                onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                placeholder="Spring Compliance Webinar"
                className="form-input"
              />
            </Field>
            <Row>
              <Field label="Date">
                <input
                  type="date"
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                  className="form-input"
                />
              </Field>
              <Field label="Type">
                <select
                  value={form.event_type}
                  onChange={(e) => setForm({ ...form, event_type: e.target.value as EventType })}
                  className="form-input"
                >
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </Row>
            <Field label="ALTA Connect event id" hint="Auto-generated; edit if you have a real Connect id.">
              <input
                value={form.alta_connect_event_id}
                onChange={(e) => { setIdTouched(true); setForm({ ...form, alta_connect_event_id: e.target.value }); }}
                className="form-input font-mono"
                placeholder="evt-something-2026-05"
              />
            </Field>
          </Section>
        )}

        <Section title="Member to register">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <input
              value={form.org_search}
              onChange={(e) => setForm({ ...form, org_search: e.target.value })}
              placeholder={orgsLoading ? 'Loading members…' : 'Search by name, member id, or 2-letter state'}
              className="form-input pl-8"
              disabled={orgsLoading}
            />
          </div>
          <div className="mt-2 max-h-64 overflow-y-auto rounded-md" style={{ border: '1px solid var(--card-border)' }}>
            {filteredOrgs.length === 0 ? (
              <div className="text-[11px] py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                No matches.
              </div>
            ) : filteredOrgs.map((o) => {
              const checked = form.org_id === o.id;
              return (
                <label
                  key={o.id}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors"
                  style={{
                    background: checked ? 'color-mix(in srgb, var(--accent) 14%, transparent)' : 'transparent',
                    borderBottom: '1px solid var(--card-border)',
                  }}
                >
                  <input
                    type="radio"
                    name="org_id"
                    checked={checked}
                    onChange={() => setForm({ ...form, org_id: o.id })}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold truncate" style={{ color: 'var(--heading)' }}>{o.org_name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {o.org_type} · {o.member_id ?? '—'} · {o.city ?? ''}{o.state ? `, ${o.state}` : ''}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
          {selectedOrg && (
            <div className="mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Selected: <span style={{ color: 'var(--heading)' }}>{selectedOrg.org_name}</span>
            </div>
          )}
        </Section>

        <Section title="Registration">
          <Row>
            <Field label="Status">
              <select
                value={form.registration_status}
                onChange={(e) => setForm({ ...form, registration_status: e.target.value as RegistrationStatus })}
                className="form-input"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Fee (USD)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.registration_fee}
                onChange={(e) => setForm({ ...form, registration_fee: e.target.value })}
                className="form-input tabular-nums"
              />
            </Field>
          </Row>
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={form.paid}
              onChange={(e) => setForm({ ...form, paid: e.target.checked })}
            />
            <span style={{ color: 'var(--text-muted)' }}>Mark as paid now</span>
          </label>
        </Section>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-md" style={{ background: 'color-mix(in srgb, #D94A4A 14%, transparent)', color: '#D94A4A' }}>
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 p-3 rounded-md" style={{ background: 'color-mix(in srgb, #8CC63F 14%, transparent)', color: '#8CC63F' }}>
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Saved.</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-[11px] font-semibold"
            style={{ color: 'var(--text-muted)', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ color: '#fff', background: 'var(--accent)' }}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving…' : (mode === 'new-event' ? 'Create event' : 'Register')}
          </button>
        </div>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 11px;
          background: var(--input-bg);
          color: var(--heading);
          border: 1px solid var(--card-border);
          border-radius: 6px;
          outline: none;
        }
        .form-input:focus { border-color: var(--accent); }
      `}</style>
    </SideDrawer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
  );
}
