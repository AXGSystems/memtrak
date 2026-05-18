'use client';

import { useEffect, useState, FormEvent } from 'react';
import Card from '@/components/Card';
import { SkeletonCard } from '@/components/Skeleton';
import { Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { Contact } from '@/lib/member-data';

interface FormState { first_name: string; last_name: string; title: string; phone: string }

export default function PortalProfile() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [form, setForm] = useState<FormState>({ first_name: '', last_name: '', title: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/portal/me')
      .then((r) => r.json())
      .then((d: { contact: Contact }) => {
        if (d.contact) {
          setContact(d.contact);
          setForm({
            first_name: d.contact.first_name ?? '',
            last_name: d.contact.last_name ?? '',
            title: d.contact.title ?? '',
            phone: d.contact.phone ?? '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null); setSuccess(false); setSaving(true);
    try {
      const res = await fetch('/api/portal/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? `Update failed (${res.status})`); return; }
      setContact(data.contact);
      setSuccess(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <SkeletonCard height={400} />;
  if (!contact) return <Card glass><p className="text-xs" style={{ color: '#D94A4A' }}>Profile not available.</p></Card>;

  return (
    <div className="space-y-6 mt-2 max-w-xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>My profile</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Update your name, title, and phone. Email is locked — contact ALTA staff to change it.
        </p>
      </div>

      <Card glass>
        <form onSubmit={submit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <input className="form-input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
            </Field>
            <Field label="Last name">
              <input className="form-input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
            </Field>
          </div>
          <Field label="Title">
            <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VP, Operations" />
          </Field>
          <Field label="Phone">
            <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="555-555-1212" />
          </Field>
          <Field label="Email (locked)">
            <input className="form-input opacity-60" value={contact.email} readOnly disabled />
          </Field>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md" style={{ background: 'color-mix(in srgb, #D94A4A 14%, transparent)', color: '#D94A4A' }}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 p-3 rounded-md" style={{ background: 'color-mix(in srgb, #8CC63F 14%, transparent)', color: '#8CC63F' }}>
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> <span>Saved.</span>
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ color: '#fff', background: 'var(--accent)' }}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>

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
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  );
}
