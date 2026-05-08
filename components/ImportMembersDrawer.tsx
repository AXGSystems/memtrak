'use client';

import { useMemo, useState } from 'react';
import { Upload, AlertCircle, CheckCircle2, Loader2, FileText, Trash2, Download } from 'lucide-react';
import SideDrawer from './SideDrawer';

interface ImportMembersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: (inserted: number) => void;
}

interface ParsedRow {
  data: Record<string, string>;
  errors: string[];
}

const ORG_TYPES = new Set(['ACU', 'ACA', 'ACB', 'REA', 'Associate', 'Affiliate', 'Government', 'Honorary']);
const REQUIRED = ['org_name', 'org_type'];
const KNOWN_COLUMNS = [
  'org_name', 'org_type', 'status', 'member_id', 'join_date', 'renewal_date',
  'annual_dues', 'dues_status', 'tier', 'city', 'state', 'engagement_score',
  'trust_score', 'churn_risk', 'decay_score', 'health_tier', 'lifetime_revenue',
  'last_payment_date', 'tags', 'notes',
];
const NUMERIC_COLUMNS = new Set([
  'annual_dues', 'engagement_score', 'trust_score', 'churn_risk',
  'decay_score', 'lifetime_revenue',
]);

const SAMPLE_CSV = `org_name,org_type,status,city,state,annual_dues,tier,renewal_date,tags
Sample Title Co,ACB,Active,Atlanta,GA,2450,Standard,2027-01-15,"agent,new-member-2026"
Sample Underwriter,ACU,Active,Houston,TX,61554,Enterprise,2027-01-15,underwriter
`;

/** Tiny RFC 4180-ish CSV parser — handles quotes, escaped quotes, embedded newlines. */
function parseCsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else { inQuotes = false; }
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(cell); cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.length > 1 || row[0] !== '') out.push(row);
      row = [];
    } else {
      cell += c;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    if (row.length > 1 || row[0] !== '') out.push(row);
  }
  return out;
}

function validateRow(raw: Record<string, string>): ParsedRow {
  const errors: string[] = [];
  const data: Record<string, string> = {};

  for (const [k, v] of Object.entries(raw)) {
    const trimmed = (v ?? '').trim();
    if (trimmed === '') continue;
    data[k] = trimmed;
  }

  for (const req of REQUIRED) {
    if (!data[req]) errors.push(`${req} is required`);
  }
  if (data.org_type && !ORG_TYPES.has(data.org_type)) {
    errors.push(`org_type "${data.org_type}" not recognized`);
  }
  for (const col of NUMERIC_COLUMNS) {
    if (data[col] !== undefined && !Number.isFinite(Number(data[col]))) {
      errors.push(`${col} must be a number`);
    }
  }

  return { data, errors };
}

function coerceRow(row: Record<string, string>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...row };
  for (const col of NUMERIC_COLUMNS) {
    if (out[col] !== undefined) out[col] = Number(out[col]);
  }
  if (typeof out.tags === 'string') {
    out.tags = (out.tags as string).split(',').map((t) => t.trim()).filter(Boolean);
  }
  if (typeof out.state === 'string') out.state = (out.state as string).toUpperCase();
  return out;
}

export default function ImportMembersDrawer({ isOpen, onClose, onImported }: ImportMembersDrawerProps) {
  const [text, setText] = useState('');
  const [filename, setFilename] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const parsed = useMemo(() => {
    if (!text.trim()) return null;
    const rows = parseCsv(text.trim());
    if (rows.length < 2) return { headers: [], records: [], unknown: [] as string[] };

    const headers = rows[0].map((h) => h.trim());
    const records: ParsedRow[] = rows.slice(1).map((cols) => {
      const raw: Record<string, string> = {};
      headers.forEach((h, i) => { raw[h] = cols[i] ?? ''; });
      return validateRow(raw);
    });
    const unknown = headers.filter((h) => !KNOWN_COLUMNS.includes(h));
    return { headers, records, unknown };
  }, [text]);

  const totals = useMemo(() => {
    if (!parsed) return null;
    const valid = parsed.records.filter((r) => r.errors.length === 0).length;
    const invalid = parsed.records.length - valid;
    return { total: parsed.records.length, valid, invalid };
  }, [parsed]);

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(null);
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large (max 5MB).');
      return;
    }
    const t = await file.text();
    setText(t);
    setFilename(file.name);
  };

  const reset = () => {
    setText(''); setFilename(null); setError(null); setSuccess(null);
  };

  const submit = async () => {
    if (!parsed || !totals) return;
    if (totals.invalid > 0) {
      setError('Fix validation errors before importing.');
      return;
    }
    if (totals.valid === 0) {
      setError('No rows to import.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const rows = parsed.records.map((r) => coerceRow(r.data));
      const res = await fetch('/api/memtrak/members/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Import failed (${res.status}).`);
        setSubmitting(false);
        return;
      }
      setSuccess(`Imported ${data.inserted} members.`);
      onImported(data.inserted);
      setTimeout(() => {
        reset();
        onClose();
      }, 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memtrak-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={() => { if (!submitting) { reset(); onClose(); } }}
      title="Import Members"
      subtitle="Bulk-create from a CSV"
      width="xl"
    >
      <div className="space-y-4 print:hidden">
        <div className="flex items-center justify-between gap-2">
          <label
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all hover:scale-[1.03]"
            style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
          >
            <Upload className="w-3.5 h-3.5" /> Choose CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </label>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03]"
            style={{ color: 'var(--text-muted)', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
          >
            <Download className="w-3.5 h-3.5" /> Template
          </button>
        </div>

        {filename && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
            <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--heading)' }}>
              <FileText className="w-3.5 h-3.5" />
              {filename}
            </span>
            <button onClick={reset} className="text-xs hover:scale-110 transition-transform" style={{ color: 'var(--text-muted)' }} aria-label="Clear file">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Or paste CSV
          </span>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setFilename(null); }}
            rows={8}
            placeholder="org_name,org_type,city,state..."
            className="mt-1 w-full px-3 py-2 rounded-lg text-[11px] font-mono border focus:outline-none focus:ring-2"
            style={{
              background: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--heading)',
            }}
          />
        </div>

        {parsed && totals && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Total" value={totals.total} color="#4A90D9" />
              <Stat label="Valid" value={totals.valid} color="#8CC63F" />
              <Stat label="Invalid" value={totals.invalid} color={totals.invalid ? '#D94A4A' : 'var(--text-muted)'} />
            </div>

            {parsed.unknown.length > 0 && (
              <div
                className="px-3 py-2 rounded-lg text-[11px]"
                style={{
                  background: 'color-mix(in srgb, #F5C542 12%, transparent)',
                  color: '#F5C542',
                  border: '1px solid color-mix(in srgb, #F5C542 30%, transparent)',
                }}
              >
                Unknown columns will be ignored: {parsed.unknown.join(', ')}
              </div>
            )}

            {parsed.records.some((r) => r.errors.length) && (
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--card-border)' }}>
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ background: 'var(--table-header)', color: 'var(--text-muted)' }}>
                  Validation errors
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {parsed.records.map((r, i) => r.errors.length ? (
                    <div key={i} className="flex items-start gap-2 px-3 py-1.5 text-[11px]" style={{ borderTop: '1px solid var(--card-border)' }}>
                      <span className="font-mono opacity-50" style={{ color: 'var(--text-muted)' }}>#{i + 2}</span>
                      <span style={{ color: 'var(--heading)' }}>{r.data.org_name || '(no name)'}</span>
                      <span style={{ color: '#D94A4A' }}>{r.errors.join('; ')}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}

            {totals.valid > 0 && (
              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--card-border)' }}>
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ background: 'var(--table-header)', color: 'var(--text-muted)' }}>
                  Preview · first 5 valid rows
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead style={{ color: 'var(--text-muted)' }}>
                      <tr>
                        <th className="px-2 py-1.5 text-left">Name</th>
                        <th className="px-2 py-1.5 text-left">Type</th>
                        <th className="px-2 py-1.5 text-left">Loc</th>
                        <th className="px-2 py-1.5 text-right">Dues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.records.filter((r) => !r.errors.length).slice(0, 5).map((r, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--card-border)' }}>
                          <td className="px-2 py-1.5" style={{ color: 'var(--heading)' }}>{r.data.org_name}</td>
                          <td className="px-2 py-1.5">{r.data.org_type}</td>
                          <td className="px-2 py-1.5" style={{ color: 'var(--text-muted)' }}>{r.data.city ?? ''}{r.data.state ? `, ${r.data.state}` : ''}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums" style={{ color: 'var(--heading)' }}>
                            {r.data.annual_dues ? `$${Number(r.data.annual_dues).toLocaleString()}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

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
            {success}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={() => { if (!submitting) { reset(); onClose(); } }}
            disabled={submitting}
            className="px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-50"
            style={{ color: 'var(--text-muted)', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting || !totals || totals.valid === 0 || totals.invalid > 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {submitting ? 'Importing…' : totals ? `Import ${totals.valid}` : 'Import'}
          </button>
        </div>

        <p className="text-[10px] pt-2" style={{ color: 'var(--text-muted)' }}>
          Required: <code>org_name</code>, <code>org_type</code>. Tags accept comma-separated values inside a quoted cell. Numeric fields auto-coerce.
        </p>
      </div>
    </SideDrawer>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="px-3 py-2 rounded-lg text-center" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
      <div className="text-lg font-extrabold tabular-nums" style={{ color }}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
