'use client';

import { useEffect, useMemo, useState } from 'react';
import Card, { KpiCard } from '@/components/Card';
import SideDrawer from '@/components/SideDrawer';
import { SkeletonCard, SkeletonKPI } from '@/components/Skeleton';
import {
  Mail, AlertTriangle, Clock, Send, Loader2, AlertCircle, FileText, ChevronRight, CheckCircle2,
} from 'lucide-react';
import type { Invoice } from '@/lib/member-data';
import type { DunningCohortKey } from '@/lib/dunning';

interface BucketRow {
  key: DunningCohortKey;
  label: string;
  tone: 'friendly' | 'firm' | 'urgent';
  description: string;
  offsetDays: number;
  total: number;
  count: number;
  invoices: Invoice[];
}

interface PreviewPayload {
  invoice: { id: string; invoice_number: string; amount: number; date_due: string };
  org: { id: string; org_name: string; org_type: string };
  contact: { id: string; first_name: string; last_name: string; email: string; is_primary: boolean } | null;
  cohort: { key: DunningCohortKey; label: string; tone: 'friendly' | 'firm' | 'urgent'; description: string };
  email: { subject: string; body: string; to: { email: string; name?: string }[]; campaignId: string };
}

const TONE_COLOR: Record<'friendly' | 'firm' | 'urgent', string> = {
  friendly: '#8CC63F',
  firm:     '#F5C542',
  urgent:   '#D94A4A',
};

export default function DunningPage() {
  const [buckets, setBuckets] = useState<BucketRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState<{ invoiceId: string; bucket: BucketRow } | null>(null);

  useEffect(() => {
    fetch('/api/memtrak/dunning/buckets')
      .then((r) => r.json())
      .then((d: { buckets: BucketRow[] }) => setBuckets(d.buckets ?? []))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    if (!buckets) return null;
    const preDue = buckets.filter((b) => b.offsetDays < 0).reduce((s, b) => s + b.total, 0);
    const pastDue = buckets.filter((b) => b.offsetDays > 0).reduce((s, b) => s + b.total, 0);
    const totalInvoices = buckets.reduce((s, b) => s + b.count, 0);
    return { preDue, pastDue, totalInvoices };
  }, [buckets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            Dunning workflow
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Pre-due reminders and past-due nudges. Open any invoice to preview the email that would be sent.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
        {loading || !totals ? (
          <><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /></>
        ) : (
          <>
            <KpiCard label="Invoices in workflow" value={totals.totalInvoices} sub="across 6 cohorts" icon={FileText} color="#4A90D9" />
            <KpiCard label="Pre-due exposure" value={`$${(totals.preDue / 1000).toFixed(0)}K`} sub="60 / 30 / 7 day reminders" icon={Clock} color="#F5C542" />
            <KpiCard label="Past-due exposure" value={`$${(totals.pastDue / 1000).toFixed(0)}K`} sub="7 / 30 / 60 day chase" icon={AlertTriangle} color="#D94A4A" />
          </>
        )}
      </div>

      {loading || !buckets ? (
        <SkeletonCard height={400} />
      ) : (
        <div className="space-y-3">
          {buckets.map((b) => (
            <BucketCard key={b.key} bucket={b} onPreview={(invoiceId) => setPreviewing({ invoiceId, bucket: b })} />
          ))}
        </div>
      )}

      <DunningPreviewDrawer
        target={previewing}
        onClose={() => setPreviewing(null)}
      />

      <p className="text-[10px] pt-2" style={{ color: 'var(--text-muted)' }}>
        Sending requires Microsoft Graph credentials (GRAPH_CLIENT_ID / GRAPH_CLIENT_SECRET / GRAPH_TENANT_ID).
        Without them, the underlying /api/memtrak/send endpoint runs in preview mode and does not deliver mail.
      </p>
    </div>
  );
}

function BucketCard({ bucket, onPreview }: { bucket: BucketRow; onPreview: (invoiceId: string) => void }) {
  const color = TONE_COLOR[bucket.tone];
  const empty = bucket.count === 0;

  return (
    <Card glass>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className="p-2 rounded-lg flex-shrink-0"
            style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}
          >
            <Mail className="w-4 h-4" style={{ color }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{bucket.label}</h3>
              <span
                className="text-[11px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
                style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
              >
                {bucket.tone}
              </span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{bucket.description}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xl font-extrabold tabular-nums" style={{ color: empty ? 'var(--text-muted)' : 'var(--heading)' }}>
            {bucket.count}
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            ${bucket.total.toLocaleString()}
          </div>
        </div>
      </div>

      {!empty && (
        <div className="mt-3 space-y-1.5">
          {bucket.invoices.slice(0, 8).map((inv) => (
            <button
              key={inv.id}
              onClick={() => onPreview(inv.id)}
              className="w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-all hover:translate-x-0.5"
              style={{ background: 'var(--input-bg)' }}
            >
              <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
              <span className="font-mono text-xs font-semibold flex-shrink-0" style={{ color: 'var(--heading)' }}>{inv.invoice_number}</span>
              <span className="text-[10px] flex-1 truncate" style={{ color: 'var(--text-muted)' }}>{inv.description}</span>
              <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>{inv.date_due}</span>
              <span className="text-xs font-bold tabular-nums" style={{ color }}>${inv.amount.toLocaleString()}</span>
              <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
            </button>
          ))}
          {bucket.invoices.length > 8 && (
            <p className="text-[10px] text-center pt-1" style={{ color: 'var(--text-muted)' }}>
              + {bucket.invoices.length - 8} more in this cohort
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function DunningPreviewDrawer({
  target, onClose,
}: { target: { invoiceId: string; bucket: BucketRow } | null; onClose: () => void }) {
  const [data, setData] = useState<PreviewPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  useEffect(() => {
    if (!target) { setData(null); setError(null); setSendResult(null); return; }
    setLoading(true); setError(null); setSendResult(null);
    fetch(`/api/memtrak/dunning/preview?invoice_id=${encodeURIComponent(target.invoiceId)}`)
      .then(async (r) => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({}));
          setError(e.error ?? `Request failed (${r.status}).`);
          return;
        }
        const d: PreviewPayload = await r.json();
        setData(d);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Network error.'))
      .finally(() => setLoading(false));
  }, [target]);

  const send = async () => {
    if (!data) return;
    setSending(true); setSendResult(null);
    try {
      const res = await fetch('/api/memtrak/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'membership@alta.org',
          to: data.email.to,
          subject: data.email.subject,
          body: data.email.body,
          campaignId: data.email.campaignId,
          autoTrack: true,
        }),
      });
      const body = await res.json().catch(() => ({}));
      setSendResult(body.preview ? 'Preview only — Graph not connected.' : 'Sent.');
    } catch (e) {
      setSendResult(e instanceof Error ? e.message : 'Network error.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SideDrawer
      isOpen={target !== null}
      onClose={() => { if (!sending) onClose(); }}
      title="Dunning email preview"
      subtitle={data ? `${data.cohort.label} · ${data.email.campaignId}` : undefined}
      width="xl"
    >
      <div className="space-y-4 print:hidden">
        {loading && (
          <div className="flex items-center gap-2 text-xs py-3" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Rendering email…
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'color-mix(in srgb, #D94A4A 12%, transparent)', color: '#D94A4A', border: '1px solid color-mix(in srgb, #D94A4A 30%, transparent)' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Organization">
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{data.org.org_name}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{data.org.org_type}</div>
              </Field>
              <Field label="Invoice">
                <div className="text-xs font-mono font-bold" style={{ color: 'var(--heading)' }}>{data.invoice.invoice_number}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>${data.invoice.amount.toLocaleString()} due {data.invoice.date_due}</div>
              </Field>
            </div>

            <Field label="Recipient">
              {data.contact ? (
                <div>
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{data.contact.first_name} {data.contact.last_name} {data.contact.is_primary && '★'}</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{data.contact.email}</div>
                </div>
              ) : (
                <div className="text-xs" style={{ color: '#D94A4A' }}>No contact on file — add one before sending.</div>
              )}
            </Field>

            <Field label="Subject">
              <div className="px-3 py-2 rounded-lg text-xs font-bold" style={{ background: 'var(--input-bg)', color: 'var(--heading)', border: '1px solid var(--card-border)' }}>
                {data.email.subject}
              </div>
            </Field>

            <Field label="Body">
              <div
                className="px-4 py-3 rounded-lg text-xs"
                style={{ background: '#fff', color: '#111', border: '1px solid var(--card-border)', maxHeight: 360, overflowY: 'auto' }}
                dangerouslySetInnerHTML={{ __html: data.email.body }}
              />
            </Field>

            {sendResult && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{
                  background: 'color-mix(in srgb, #4A90D9 12%, transparent)',
                  color: '#4A90D9',
                  border: '1px solid color-mix(in srgb, #4A90D9 30%, transparent)',
                }}
              >
                <CheckCircle2 className="w-4 h-4" /> {sendResult}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => { if (!sending) onClose(); }}
                disabled={sending}
                className="px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-50"
                style={{ color: 'var(--text-muted)', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
              >
                Close
              </button>
              <button
                onClick={send}
                disabled={sending || !data.contact}
                title={!data.contact ? 'Add a contact to this org first' : undefined}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 14%, transparent)' }}
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {sending ? 'Sending…' : 'Send via /api/memtrak/send'}
              </button>
            </div>
          </>
        )}
      </div>
    </SideDrawer>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {children}
    </div>
  );
}
