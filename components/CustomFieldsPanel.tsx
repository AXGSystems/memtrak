'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Sparkles, Pencil, Loader2, AlertCircle, CheckCircle2, Save, Star,
} from 'lucide-react';
import Card from './Card';
import SideDrawer from './SideDrawer';
import {
  type CustomFieldDef, coerceCustomFieldValue, formatCustomFieldValue,
} from '@/lib/custom-fields';
import type { Organization } from '@/lib/member-data';

interface CustomFieldsPanelProps {
  org: Organization;
  onSaved?: (org: Organization) => void;
}

const GROUP_COLOR: Record<NonNullable<CustomFieldDef['group']>, string> = {
  General:    '#4A90D9',
  Compliance: '#14b8a6',
  Advocacy:   '#a855f7',
  Operations: '#F5C542',
};

export default function CustomFieldsPanel({ org, onSaved }: CustomFieldsPanelProps) {
  const [defs, setDefs] = useState<CustomFieldDef[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    fetch('/api/memtrak/custom-fields/definitions')
      .then((r) => r.json())
      .then((d: { definitions: CustomFieldDef[] }) => setDefs(d.definitions ?? []))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    if (!defs) return {} as Record<string, CustomFieldDef[]>;
    const out: Record<string, CustomFieldDef[]> = {};
    for (const d of defs) {
      const g = d.group ?? 'General';
      out[g] = out[g] ?? [];
      out[g].push(d);
    }
    return out;
  }, [defs]);

  return (
    <>
      <Card title="Custom fields" subtitle="Association-specific data">
        <div className="flex justify-end mb-2 no-print">
          <button
            onClick={() => setDrawerOpen(true)}
            disabled={loading || !defs}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all hover:scale-[1.05] disabled:opacity-50"
            style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
          >
            <Pencil className="w-3 h-3" /> Edit fields
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-xs py-3" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading definitions…
          </div>
        ) : !defs || defs.length === 0 ? (
          <div className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>
            No custom fields defined yet.
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(grouped).map(([group, groupDefs]) => {
              const color = GROUP_COLOR[group as keyof typeof GROUP_COLOR] ?? GROUP_COLOR.General;
              return (
                <div key={group}>
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color }}>{group}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {groupDefs.map((def) => {
                      const v = org.custom_fields?.[def.key];
                      const display = formatCustomFieldValue(def, v);
                      const empty = display === '—';
                      return (
                        <div key={def.key} className="p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{def.label}</span>
                            {def.pin && <Star className="w-2.5 h-2.5" fill={color} style={{ color }} />}
                          </div>
                          <div
                            className="text-xs font-bold tabular-nums"
                            style={{ color: empty ? 'var(--text-muted)' : 'var(--heading)' }}
                          >
                            {display}
                          </div>
                          {def.hint && empty && (
                            <div className="text-[10px] mt-0.5 italic" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>{def.hint}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <CustomFieldsEditDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        org={org}
        defs={defs ?? []}
        onSaved={onSaved}
      />
    </>
  );
}

function CustomFieldsEditDrawer({
  isOpen, onClose, org, defs, onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  org: Organization;
  defs: CustomFieldDef[];
  onSaved?: (org: Organization) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const seed: Record<string, string> = {};
      for (const def of defs) {
        const raw = org.custom_fields?.[def.key];
        if (raw === null || raw === undefined) seed[def.key] = '';
        else if (def.type === 'boolean') seed[def.key] = raw ? 'true' : 'false';
        else seed[def.key] = String(raw);
      }
      setValues(seed);
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, defs, org]);

  const submit = async () => {
    setError(null);
    setSubmitting(true);

    const next: Record<string, string | number | boolean | null> = {};
    for (const def of defs) {
      next[def.key] = coerceCustomFieldValue(def, values[def.key]);
    }

    try {
      const res = await fetch(`/api/memtrak/members/${encodeURIComponent(org.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_fields: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status}).`);
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      onSaved?.(data.org as Organization);
      setTimeout(onClose, 700);
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
      title="Edit custom fields"
      subtitle={org.org_name}
      width="md"
    >
      <div className="space-y-3 print:hidden">
        {defs.map((def) => (
          <Field key={def.key} def={def} value={values[def.key] ?? ''} onChange={(v) => setValues((s) => ({ ...s, [def.key]: v }))} />
        ))}

        {error && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'color-mix(in srgb, #D94A4A 12%, transparent)', color: '#D94A4A', border: '1px solid color-mix(in srgb, #D94A4A 30%, transparent)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'color-mix(in srgb, #8CC63F 14%, transparent)', color: '#8CC63F', border: '1px solid color-mix(in srgb, #8CC63F 32%, transparent)' }}>
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
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>

        <p className="text-[10px] pt-2 inline-flex items-start gap-1" style={{ color: 'var(--text-muted)' }}>
          <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>Definitions are managed in <code>lib/custom-fields.ts</code>. Demo mode persists no changes; with Supabase configured the values are stored on the org record.</span>
        </p>
      </div>
    </SideDrawer>
  );
}

function Field({ def, value, onChange }: { def: CustomFieldDef; value: string; onChange: (v: string) => void }) {
  const baseInput = "w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2";
  const baseStyle = { background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' } as React.CSSProperties;
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{def.label}</span>
      {def.hint && <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>{def.hint}</span>}
      <div className="mt-1">
        {def.type === 'select' ? (
          <select value={value} onChange={(e) => onChange(e.target.value)} className={baseInput} style={baseStyle}>
            <option value="">—</option>
            {def.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : def.type === 'boolean' ? (
          <select value={value} onChange={(e) => onChange(e.target.value)} className={baseInput} style={baseStyle}>
            <option value="">—</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        ) : (
          <input
            type={def.type === 'number' ? 'number' : def.type === 'date' ? 'date' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={baseInput}
            style={baseStyle}
          />
        )}
      </div>
    </label>
  );
}
