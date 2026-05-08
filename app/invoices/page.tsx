'use client';

import { useEffect, useMemo, useState } from 'react';
import Card, { KpiCard } from '@/components/Card';
import AnimatedCounter from '@/components/AnimatedCounter';
import { SkeletonKPI } from '@/components/Skeleton';
import SideDrawer from '@/components/SideDrawer';
import {
  Receipt, DollarSign, AlertCircle, CheckCircle2, Clock, Search, Printer, Download,
  PlayCircle, Loader2, X, Save,
} from 'lucide-react';
import type { Invoice, InvoiceStatus, ListInvoicesResult } from '@/lib/member-data';

const STATUSES: InvoiceStatus[] = ['Pending', 'Sent', 'Paid', 'Past Due', 'Cancelled', 'Refunded'];

const STATUS_COLOR: Record<InvoiceStatus, string> = {
  'Pending':   '#F5C542',
  'Sent':      '#4A90D9',
  'Paid':      '#8CC63F',
  'Past Due':  '#D94A4A',
  'Cancelled': '#888888',
  'Refunded':  '#a855f7',
};

const PAGE_SIZE = 50;

const todayIso = () => new Date().toISOString().slice(0, 10);
const fy = () => new Date().getFullYear();

export default function InvoicesPage() {
  const [data, setData] = useState<ListInvoicesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | ''>('');
  const [fiscalYear, setFiscalYear] = useState<number | ''>('');
  const [page, setPage] = useState(1);

  const [generateOpen, setGenerateOpen] = useState(false);
  const [paying, setPaying] = useState<Invoice | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => { setPage(1); }, [debouncedQ, status, fiscalYear]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (status) params.set('status', status);
    if (fiscalYear) params.set('fiscal_year', String(fiscalYear));
    params.set('page', String(page));
    params.set('pageSize', String(PAGE_SIZE));
    fetch(`/api/memtrak/invoices?${params}`)
      .then((r) => r.json())
      .then((d: ListInvoicesResult) => setData(d))
      .finally(() => setLoading(false));
  }, [debouncedQ, status, fiscalYear, page, reloadKey]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const exportCsv = () => {
    if (!data) return;
    const cols: (keyof Invoice)[] = ['invoice_number', 'org_id', 'amount', 'description', 'date_issued', 'date_due', 'date_paid', 'status', 'payment_method', 'payment_reference', 'fiscal_year'];
    const header = cols.join(',');
    const rows = data.rows.map((r) =>
      cols.map((c) => {
        const v = r[c];
        if (v === null || v === undefined) return '';
        const s = String(v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      }).join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${todayIso()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            Invoices
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {data ? <><AnimatedCounter value={data.total} /> invoices · ${data.totals.outstanding.toLocaleString()} outstanding</> : 'Loading invoices…'}
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            onClick={exportCsv}
            disabled={!data || data.rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-50"
            style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03]"
            style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button
            onClick={() => setGenerateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03]"
            style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}
          >
            <PlayCircle className="w-3.5 h-3.5" /> Generate Invoices
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {loading || !data ? (
          <><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /></>
        ) : (
          <>
            <KpiCard label="Total billed" value={`$${(data.totals.amount / 1000).toFixed(0)}K`} sub={`${data.total} invoices`} icon={Receipt} color="#4A90D9" />
            <KpiCard label="Paid" value={`$${(data.totals.paid / 1000).toFixed(0)}K`} sub="settled" icon={CheckCircle2} color="#8CC63F" />
            <KpiCard label="Outstanding" value={`$${(data.totals.outstanding / 1000).toFixed(0)}K`} sub="not yet paid" icon={Clock} color="#F5C542" />
            <KpiCard label="Past due" value={`$${(data.totals.pastDue / 1000).toFixed(0)}K`} sub="needs dunning" icon={AlertCircle} color="#D94A4A" />
          </>
        )}
      </div>

      <Card glass>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search invoice #, description, payment ref…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2"
              style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus | '')}
            className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2"
            style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }}
          >
            <option value="">All years</option>
            {[fy(), fy() - 1, fy() - 2].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </Card>

      <Card glass noPad>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--table-header)', color: 'var(--text-muted)' }}>
                <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Invoice #</th>
                <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Description</th>
                <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wider">Amount</th>
                <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Issued</th>
                <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Due</th>
                <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Status</th>
                <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wider no-print">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skel-${i}`} style={{ borderTop: '1px solid var(--card-border)' }}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-3 py-3">
                        <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data && data.rows.length > 0 ? (
                data.rows.map((inv) => (
                  <Row key={inv.id} inv={inv} onMarkPaid={() => setPaying(inv)} />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    No invoices match those filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t no-print" style={{ borderColor: 'var(--card-border)' }}>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Page {page} of {totalPages} · {data.total.toLocaleString()} matches
            </span>
            <div className="flex items-center gap-1">
              <Btn disabled={page === 1} onClick={() => setPage(1)}>«</Btn>
              <Btn disabled={page === 1} onClick={() => setPage(page - 1)}>‹</Btn>
              <Btn disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</Btn>
              <Btn disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</Btn>
            </div>
          </div>
        )}
      </Card>

      <GenerateInvoicesDrawer
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onGenerated={() => setReloadKey((k) => k + 1)}
      />

      <MarkPaidDrawer
        invoice={paying}
        onClose={() => setPaying(null)}
        onPaid={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}

function Row({ inv, onMarkPaid }: { inv: Invoice; onMarkPaid: () => void }) {
  const isPaid = inv.status === 'Paid';
  const isPastDue = inv.status === 'Past Due' || (!isPaid && inv.date_due < todayIso());
  const color = STATUS_COLOR[inv.status];
  return (
    <tr style={{ borderTop: '1px solid var(--card-border)' }} className="transition-colors hover:bg-white/[0.04]">
      <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: 'var(--heading)' }}>{inv.invoice_number}</td>
      <td className="px-3 py-2.5" style={{ color: 'var(--text-muted)' }}>{inv.description ?? '—'}</td>
      <td className="px-3 py-2.5 text-right tabular-nums font-semibold" style={{ color: 'var(--heading)' }}>${inv.amount.toLocaleString()}</td>
      <td className="px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>{inv.date_issued}</td>
      <td className="px-3 py-2.5 tabular-nums" style={{ color: isPastDue ? '#D94A4A' : 'var(--text-muted)' }}>{inv.date_due}</td>
      <td className="px-3 py-2.5">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
          style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          {inv.status}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right no-print">
        {!isPaid && (
          <button
            onClick={onMarkPaid}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all hover:scale-[1.05]"
            style={{ color: '#8CC63F', background: 'color-mix(in srgb, #8CC63F 12%, transparent)' }}
          >
            <CheckCircle2 className="w-3 h-3" /> Mark paid
          </button>
        )}
      </td>
    </tr>
  );
}

function Btn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-2 py-1 rounded-md text-[11px] font-semibold transition-all hover:scale-[1.05] disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
    >
      {children}
    </button>
  );
}

function GenerateInvoicesDrawer({
  isOpen, onClose, onGenerated,
}: { isOpen: boolean; onClose: () => void; onGenerated: () => void }) {
  const [from, setFrom] = useState(todayIso());
  const [to, setTo] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 90); return d.toISOString().slice(0, 10);
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ generated: number; skipped: number } | null>(null);

  const submit = async () => {
    setError(null); setResult(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/memtrak/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status}).`);
        return;
      }
      setResult({ generated: data.generated, skipped: data.skipped });
      if (data.generated > 0) onGenerated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SideDrawer isOpen={isOpen} onClose={() => { if (!submitting) { setResult(null); setError(null); onClose(); } }} title="Generate Invoices" subtitle="Create Pending invoices for upcoming renewals" width="md">
      <div className="space-y-4 print:hidden">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Creates a Pending invoice for every Active org with a renewal date in the chosen window that does not already have an invoice for the target fiscal year. Idempotent within a year — safe to re-run.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>From</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }} />
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>To</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }} />
          </label>
        </div>

        {error && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'color-mix(in srgb, #D94A4A 12%, transparent)', color: '#D94A4A', border: '1px solid color-mix(in srgb, #D94A4A 30%, transparent)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}
        {result && (
          <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'color-mix(in srgb, #8CC63F 14%, transparent)', color: '#8CC63F', border: '1px solid color-mix(in srgb, #8CC63F 32%, transparent)' }}>
            Generated <strong>{result.generated}</strong> · skipped <strong>{result.skipped}</strong> existing.
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={() => { if (!submitting) { setResult(null); setError(null); onClose(); } }} disabled={submitting} className="px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-50" style={{ color: 'var(--text-muted)', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
            Close
          </button>
          <button onClick={submit} disabled={submitting} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-60" style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}>
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
            {submitting ? 'Generating…' : 'Generate'}
          </button>
        </div>

        <p className="text-[10px] pt-2" style={{ color: 'var(--text-muted)' }}>
          Requires Supabase env vars. In demo mode the API will return a 503.
        </p>
      </div>
    </SideDrawer>
  );
}

function MarkPaidDrawer({
  invoice, onClose, onPaid,
}: { invoice: Invoice | null; onClose: () => void; onPaid: () => void }) {
  const [method, setMethod] = useState('Stripe');
  const [reference, setReference] = useState('');
  const [datePaid, setDatePaid] = useState(todayIso());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoice) {
      setMethod('Stripe'); setReference(''); setDatePaid(todayIso()); setError(null);
    }
  }, [invoice]);

  const submit = async () => {
    if (!invoice) return;
    setError(null); setSubmitting(true);
    try {
      const res = await fetch(`/api/memtrak/invoices/${encodeURIComponent(invoice.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_paid',
          payment_method: method,
          payment_reference: reference || undefined,
          date_paid: datePaid,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status}).`);
        return;
      }
      onPaid();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const memo = useMemo(() => invoice ? `${invoice.invoice_number} · $${invoice.amount.toLocaleString()}` : '', [invoice]);

  return (
    <SideDrawer isOpen={invoice !== null} onClose={() => { if (!submitting) onClose(); }} title="Mark Paid" subtitle={memo} width="md">
      <div className="space-y-4 print:hidden">
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Payment Method</span>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }}>
            {['Stripe', 'ACH', 'Check', 'Wire', 'Credit Card', 'Other'].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Reference</span>
          <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="ch_1A2B… or check #" className="mt-1 w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }} />
        </label>

        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Date Paid</span>
          <input type="date" value={datePaid} onChange={(e) => setDatePaid(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2" style={{ background: 'var(--input-bg)', borderColor: 'var(--input-border)', color: 'var(--heading)' }} />
        </label>

        {error && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'color-mix(in srgb, #D94A4A 12%, transparent)', color: '#D94A4A', border: '1px solid color-mix(in srgb, #D94A4A 30%, transparent)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button onClick={() => { if (!submitting) onClose(); }} disabled={submitting} className="px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-50" style={{ color: 'var(--text-muted)', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
            <X className="w-3.5 h-3.5 inline-block" /> Cancel
          </button>
          <button onClick={submit} disabled={submitting} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-60" style={{ color: '#8CC63F', background: 'color-mix(in srgb, #8CC63F 14%, transparent)' }}>
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {submitting ? 'Saving…' : 'Mark Paid'}
          </button>
        </div>

        <p className="text-[10px] pt-2" style={{ color: 'var(--text-muted)' }}>
          Requires Supabase env vars. In demo mode the API will return a 503.
        </p>
      </div>
    </SideDrawer>
  );
}
