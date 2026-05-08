'use client';

import { useEffect, useState } from 'react';
import { Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import SideDrawer from './SideDrawer';
import type { Organization } from '@/lib/member-data';

export type MemberFormMode = 'create' | 'edit';

interface MemberFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (org: Organization) => void;
  /** Provide an org to switch the drawer into edit mode. */
  org?: Organization | null;
}

const ORG_TYPES: Organization['org_type'][] = ['ACU', 'ACA', 'ACB', 'REA', 'Associate', 'Affiliate', 'Government', 'Honorary'];
const STATUSES: Organization['status'][] = ['Active', 'Pending', 'Suspended', 'Lapsed', 'Cancelled', 'Honorary'];
const TIERS = ['Enterprise', 'Premium', 'Standard'];
const HEALTH_TIERS = ['Champion', 'Engaged', 'At Risk', 'Disengaged', 'Gone Dark'];

const DEFAULT_DUES: Record<Organization['org_type'], number> = {
  ACU: 61554,
  ACA: 517,
  ACB: 2450,
  REA: 850,
  Associate: 1200,
  Affiliate: 600,
  Government: 0,
  Honorary: 0,
};

interface FormState {
  org_name: string;
  org_type: Organization['org_type'];
  status: Organization['status'];
  member_id: string;
  city: string;
  state: string;
  annual_dues: string;
  tier: string;
  renewal_date: string;
  health_tier: string;
  tags: string;
  notes: string;
}

const todayPlusYear = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

const blankForm = (): FormState => ({
  org_name: '',
  org_type: 'ACB',
  status: 'Active',
  member_id: '',
  city: '',
  state: '',
  annual_dues: String(DEFAULT_DUES.ACB),
  tier: 'Standard',
  renewal_date: todayPlusYear(),
  health_tier: 'Engaged',
  tags: '',
  notes: '',
});

const fromOrg = (org: Organization): FormState => ({
  org_name: org.org_name ?? '',
  org_type: org.org_type,
  status: org.status,
  member_id: org.member_id ?? '',
  city: org.city ?? '',
  state: org.state ?? '',
  annual_dues: String(org.annual_dues ?? 0),
  tier: org.tier ?? 'Standard',
  renewal_date: org.renewal_date ?? todayPlusYear(),
  health_tier: org.health_tier ?? 'Engaged',
  tags: (org.tags ?? []).join(', '),
  notes: org.notes ?? '',
});

export default function MemberFormDrawer({ isOpen, onClose, onSaved, org }: MemberFormDrawerProps) {
  const mode: MemberFormMode = org ? 'edit' : 'create';
  const [form, setForm] = useState<FormState>(org ? fromOrg(org) : blankForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(org ? fromOrg(org) : blankForm());
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, org]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onTypeChange = (next: Organization['org_type']) => {
    setForm((f) => ({
      ...f,
      org_type: next,
      annual_dues: mode === 'create' ? String(DEFAULT_DUES[next]) : f.annual_dues,
    }));
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const submit = async () => {
    setError(null);
    if (!form.org_name.trim()) {
      setError('Organization name is required.');
      return;
    }
    const dues = Number(form.annual_dues);
    if (!Number.isFinite(dues) || dues < 0) {
      setError('Annual dues must be a non-negative number.');
      return;
    }

    setSubmitting(true);
    const today = new Date().toISOString().slice(0, 10);

    const basePayload: Record<string, unknown> = {
      org_name: form.org_name.trim(),
      org_type: form.org_type,
      status: form.status,
      annual_dues: dues,
      tier: form.tier,
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
      renewal_date: form.renewal_date,
      health_tier: form.health_tier,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: form.notes.trim() || null,
    };

    const createPayload = {
      ...basePayload,
      member_id: form.member_id.trim() || `ALTA-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      join_date: today,
      dues_status: 'Current',
      engagement_score: 50,
      trust_score: 50,
      churn_risk: 30,
      decay_score: 20,
      lifetime_revenue: 0,
      last_payment_date: today,
    };

    const editPayload = { ...basePayload, member_id: form.member_id.trim() };

    const url = mode === 'create' ? '/api/memtrak/members' : `/api/memtrak/members/${encodeURIComponent(org!.id)}`;
    const method = mode === 'create' ? 'POST' : 'PUT';
    const body = JSON.stringify(mode === 'create' ? createPayload : editPayload);

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status}).`);
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      onSaved(data.org as Organization);
      setTimeout(() => onClose(), 700);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Add Member' : 'Edit Member'}
      subtitle={mode === 'create' ? 'Create a new organization record' : org?.member_id}
      width="lg"
    >
      <div className="space-y-4 print:hidden">
        <Field label="Organization Name *">
          <Input value={form.org_name} onChange={(v) => update('org_name', v)} placeholder="Acme Title Insurance" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <Select value={form.org_type} onChange={(v) => onTypeChange(v as Organization['org_type'])} options={ORG_TYPES} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(v) => update('status', v as Organization['status'])} options={STATUSES} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Member ID" hint={mode === 'create' ? 'Auto-generated if blank' : undefined}>
            <Input value={form.member_id} onChange={(v) => update('member_id', v)} placeholder="ALTA-2026-0001" />
          </Field>
          <Field label="Tier">
            <Select value={form.tier} onChange={(v) => update('tier', v)} options={TIERS} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Field label="City">
              <Input value={form.city} onChange={(v) => update('city', v)} placeholder="Atlanta" />
            </Field>
          </div>
          <Field label="State">
            <Input value={form.state} onChange={(v) => update('state', v.slice(0, 2).toUpperCase())} placeholder="GA" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Annual Dues ($)">
            <Input value={form.annual_dues} onChange={(v) => update('annual_dues', v)} type="number" />
          </Field>
          <Field label="Renewal Date">
            <Input value={form.renewal_date} onChange={(v) => update('renewal_date', v)} type="date" />
          </Field>
        </div>

        <Field label="Health Tier">
          <Select value={form.health_tier} onChange={(v) => update('health_tier', v)} options={HEALTH_TIERS} />
        </Field>

        <Field label="Tags" hint="Comma-separated, e.g. underwriter, board-rep">
          <Input value={form.tags} onChange={(v) => update('tags', v)} placeholder="agent, new-member-2026" />
        </Field>

        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2"
            style={{
              background: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--heading)',
            }}
          />
        </Field>

        {error && (
          <div
            className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs"
            style={{
              background: 'color-mix(in srgb, #D94A4A 12%, transparent)',
              color: '#D94A4A',
              border: '1px solid color-mix(in srgb, #D94A4A 30%, transparent)',
            }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
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
            <CheckCircle2 className="w-4 h-4" />
            {mode === 'create' ? 'Member created — refreshing list…' : 'Saved.'}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={handleClose}
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
            {submitting ? 'Saving…' : mode === 'create' ? 'Save Member' : 'Save Changes'}
          </button>
        </div>

        <p className="text-[10px] pt-2" style={{ color: 'var(--text-muted)' }}>
          Requires Supabase env vars. In demo mode the API will return a 503.
        </p>
      </div>
    </SideDrawer>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      {hint && <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Input({
  value, onChange, placeholder, type = 'text',
}: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
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

function Select({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2"
      style={{
        background: 'var(--input-bg)',
        borderColor: 'var(--input-border)',
        color: 'var(--heading)',
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}
