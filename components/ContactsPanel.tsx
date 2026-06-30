'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, Phone, Plus, Pencil, Trash2, Star, Loader2, AlertCircle, Save, CheckCircle2 } from 'lucide-react';
import Card from './Card';
import SideDrawer from './SideDrawer';
import type { Contact } from '@/lib/member-data';

const ROLES = ['Primary', 'Billing', 'Operations', 'Marketing', 'Technical', 'Other'] as const;

interface ContactsPanelProps {
  orgId: string;
  orgName: string;
}

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  role: string;
  phone: string;
  is_primary: boolean;
};

const blankForm = (): FormState => ({
  first_name: '',
  last_name: '',
  email: '',
  title: '',
  role: 'Primary',
  phone: '',
  is_primary: false,
});

const fromContact = (c: Contact): FormState => ({
  first_name: c.first_name ?? '',
  last_name: c.last_name ?? '',
  email: c.email ?? '',
  title: c.title ?? '',
  role: c.role ?? 'Primary',
  phone: c.phone ?? '',
  is_primary: !!c.is_primary,
});

export default function ContactsPanel({ orgId, orgName }: ContactsPanelProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoading(true);
    fetch(`/api/memtrak/orgs/${encodeURIComponent(orgId)}/contacts`)
      .then((r) => r.json())
      .then((d: { rows: Contact[] }) => setContacts(d.rows ?? []))
      .finally(() => setLoading(false));
  }, [orgId]);

  useEffect(() => { reload(); }, [reload]);

  const onAdd = () => { setEditing(null); setDrawerOpen(true); };
  const onEdit = (c: Contact) => { setEditing(c); setDrawerOpen(true); };

  const onDelete = async (id: string) => {
    if (pendingDelete) return;
    setPendingDelete(id);
    try {
      const res = await fetch(`/api/memtrak/contacts/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? `Delete failed (${res.status}).`);
      } else {
        reload();
      }
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <>
      <Card title="Contacts" subtitle={`People at ${orgName}`}>
        <div className="flex justify-end mb-2 no-print">
          <button
            onClick={onAdd}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all hover:scale-[1.05]"
            style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
          >
            <Plus className="w-3 h-3" /> Add Contact
          </button>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-xs py-3" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading contacts…
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>
            No contacts yet. Click <strong>Add</strong> to create one.
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-3 p-3 rounded-lg group"
                style={{ background: 'var(--background)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                  style={{
                    background: c.is_primary
                      ? 'color-mix(in srgb, var(--accent) 18%, transparent)'
                      : 'color-mix(in srgb, #888 12%, transparent)',
                    color: c.is_primary ? 'var(--accent)' : 'var(--text-muted)',
                  }}
                >
                  {(c.first_name[0] ?? '?')}{(c.last_name[0] ?? '')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
                      {c.first_name} {c.last_name}
                    </span>
                    {c.is_primary && <Star className="w-3 h-3" style={{ color: '#F5C542' }} fill="#F5C542" />}
                    <span
                      className="text-[11px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}
                    >
                      {c.role}
                    </span>
                  </div>
                  {c.title && (
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.title}</div>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 hover:underline">
                      <Mail className="w-3 h-3" /> {c.email}
                    </a>
                    {c.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {c.phone}
                      </span>
                    )}
                  </div>
                  {(c.total_opens > 0 || c.total_clicks > 0) && (
                    <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      {c.total_opens} opens · {c.total_clicks} clicks
                      {c.last_email_open && ` · last open ${c.last_email_open}`}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                  <button
                    onClick={() => onEdit(c)}
                    aria-label={`Edit ${c.first_name} ${c.last_name}`}
                    title="Edit contact"
                    className="p-1.5 rounded-md transition-all hover:scale-[1.08]"
                    style={{ color: 'var(--text-muted)', background: 'var(--input-bg)' }}
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    disabled={pendingDelete === c.id}
                    aria-label={`Delete ${c.first_name} ${c.last_name}`}
                    title="Delete contact"
                    className="p-1.5 rounded-md transition-all hover:scale-[1.08] disabled:opacity-50"
                    style={{ color: '#D94A4A', background: 'color-mix(in srgb, #D94A4A 10%, transparent)' }}
                  >
                    {pendingDelete === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ContactDrawer
        isOpen={drawerOpen}
        contact={editing}
        orgId={orgId}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => { setDrawerOpen(false); reload(); }}
      />
    </>
  );
}

function ContactDrawer({
  isOpen, contact, orgId, onClose, onSaved,
}: {
  isOpen: boolean;
  contact: Contact | null;
  orgId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const mode = contact ? 'edit' : 'create';
  const [form, setForm] = useState<FormState>(contact ? fromContact(contact) : blankForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(contact ? fromContact(contact) : blankForm());
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, contact]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async () => {
    setError(null);
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First and last name are required.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Valid email required.');
      return;
    }

    setSubmitting(true);
    const payload: Record<string, unknown> = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      title: form.title.trim() || null,
      role: form.role,
      phone: form.phone.trim() || null,
      is_primary: form.is_primary,
    };

    const url = mode === 'create'
      ? `/api/memtrak/orgs/${encodeURIComponent(orgId)}/contacts`
      : `/api/memtrak/contacts/${encodeURIComponent(contact!.id)}`;
    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status}).`);
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setTimeout(onSaved, 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={() => { if (!submitting) onClose(); }}
      title={mode === 'create' ? 'Add Contact' : 'Edit Contact'}
      subtitle={mode === 'edit' ? `${contact?.first_name} ${contact?.last_name}` : undefined}
      width="md"
    >
      <div className="space-y-3 print:hidden">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name *">
            <Input value={form.first_name} onChange={(v) => update('first_name', v)} />
          </Field>
          <Field label="Last Name *">
            <Input value={form.last_name} onChange={(v) => update('last_name', v)} />
          </Field>
        </div>

        <Field label="Email *">
          <Input value={form.email} onChange={(v) => update('email', v)} type="email" placeholder="name@example.com" />
        </Field>

        <Field label="Title">
          <Input value={form.title} onChange={(v) => update('title', v)} placeholder="VP Government Affairs" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Role">
            <select
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(v) => update('phone', v)} placeholder="555-555-0123" />
          </Field>
        </div>

        <label className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
          <input
            type="checkbox"
            checked={form.is_primary}
            onChange={(e) => update('is_primary', e.target.checked)}
          />
          <span className="text-xs" style={{ color: 'var(--heading)' }}>Primary contact</span>
        </label>

        {error && (
          <div
            className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
            style={{
              background: 'color-mix(in srgb, #D94A4A 12%, transparent)',
              color: '#D94A4A',
              border: '1px solid color-mix(in srgb, #D94A4A 30%, transparent)',
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {success && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{
              background: 'color-mix(in srgb, #8CC63F 14%, transparent)',
              color: '#8CC63F',
              border: '1px solid color-mix(in srgb, #8CC63F 32%, transparent)',
            }}
          >
            <CheckCircle2 className="w-4 h-4" /> Saved.
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={() => { if (!submitting) onClose(); }}
            disabled={submitting}
            className="px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-50"
            style={{ color: 'var(--text-muted)', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-60"
            style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {submitting ? 'Saving…' : mode === 'create' ? 'Save Contact' : 'Save Changes'}
          </button>
        </div>

        <p className="text-[10px] pt-2" style={{ color: 'var(--text-muted)' }}>
          Requires Supabase env vars. In demo mode the API will return a 503.
        </p>
      </div>
    </SideDrawer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Input({
  value, onChange, type = 'text', placeholder,
}: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2"
      style={{
        background: 'var(--input-bg)',
        borderColor: 'var(--input-border)',
        color: 'var(--heading)',
      }}
    />
  );
}
