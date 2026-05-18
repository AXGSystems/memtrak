'use client';

import { useEffect, useState, FormEvent } from 'react';
import { Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import SideDrawer from './SideDrawer';
import { DOCUMENT_TYPES, type DocumentType, type MemtrakDocument } from '@/lib/member-data';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (doc: MemtrakDocument) => void;
  /** If provided, drawer is in edit mode. */
  document?: MemtrakDocument | null;
  /** Pre-fill a group_id (e.g. when launched from /groups/[id]). */
  defaultGroupId?: string | null;
}

interface FormState {
  name: string;
  doc_type: DocumentType;
  url: string;
  description: string;
  group_id: string;
  effective_date: string;
  tags: string;
}

const blank = (groupId?: string | null): FormState => ({
  name: '',
  doc_type: 'Meeting Minutes',
  url: '',
  description: '',
  group_id: groupId ?? '',
  effective_date: '',
  tags: '',
});

const fromDoc = (d: MemtrakDocument): FormState => ({
  name: d.name,
  doc_type: d.doc_type,
  url: d.url,
  description: d.description ?? '',
  group_id: d.group_id ?? '',
  effective_date: d.effective_date ?? '',
  tags: (d.tags ?? []).join(', '),
});

export default function DocumentFormDrawer({ isOpen, onClose, onSaved, document, defaultGroupId }: Props) {
  const editing = !!document;
  const [form, setForm] = useState<FormState>(blank(defaultGroupId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setForm(document ? fromDoc(document) : blank(defaultGroupId));
    setError(null);
    setSuccess(false);
  }, [isOpen, document, defaultGroupId]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        doc_type: form.doc_type,
        url: form.url.trim(),
        description: form.description.trim() || null,
        group_id: form.group_id.trim() || null,
        effective_date: form.effective_date || null,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      const res = editing
        ? await fetch(`/api/memtrak/documents/${document!.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/memtrak/documents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? `Request failed (${res.status})`); return; }

      setSuccess(true);
      onSaved(data.document as MemtrakDocument);
      setTimeout(() => onClose(), 500);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : 'Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? 'Edit document' : 'Add document'}
      subtitle={editing ? document?.name : 'Link to a document stored elsewhere (alta.org, Drive, etc.)'}
      width="lg"
    >
      <form onSubmit={submit} className="space-y-4 text-xs">
        <Field label="Title">
          <input
            required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Board Meeting — Q2 2026 Minutes"
            className="form-input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select
              value={form.doc_type}
              onChange={(e) => setForm({ ...form, doc_type: e.target.value as DocumentType })}
              className="form-input"
            >
              {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Effective date">
            <input
              type="date"
              value={form.effective_date}
              onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
              className="form-input"
            />
          </Field>
        </div>

        <Field label="URL" hint="External link — alta.org, Google Drive, SharePoint, etc.">
          <input
            required type="url" value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://www.alta.org/..."
            className="form-input font-mono"
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What this document is and when it applies."
            className="form-input"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Group ID" hint="Leave blank for un-attached documents.">
            <input
              value={form.group_id}
              onChange={(e) => setForm({ ...form, group_id: e.target.value })}
              placeholder="grp-board"
              className="form-input font-mono"
            />
          </Field>
          <Field label="Tags" hint="Comma-separated.">
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="governance, board, fy2026"
              className="form-input"
            />
          </Field>
        </div>

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

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-[11px] font-semibold"
            style={{ color: 'var(--text-muted)', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all hover:scale-[1.02] disabled:opacity-50"
            style={{ color: '#fff', background: 'var(--accent)' }}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add document'}
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
    </SideDrawer>
  );
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
