'use client';

import { useEffect, useState } from 'react';
import Card, { KpiCard } from '@/components/Card';
import { SkeletonCard, SkeletonKPI } from '@/components/Skeleton';
import { Receipt, DollarSign, AlertCircle, Clock, CreditCard } from 'lucide-react';
import type { Invoice, InvoiceStatus } from '@/lib/member-data';

interface Totals {
  amount: number;
  paid: number;
  outstanding: number;
  pastDue: number;
}

const STATUS_COLOR: Record<InvoiceStatus, string> = {
  Pending:    '#F5C542',
  Sent:       '#4A90D9',
  Paid:       '#8CC63F',
  'Past Due': '#D94A4A',
  Cancelled:  '#888888',
  Refunded:   '#a855f7',
};

const PAYABLE: InvoiceStatus[] = ['Pending', 'Sent', 'Past Due'];

export default function PortalInvoices() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payMessage, setPayMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/portal/invoices')
      .then((r) => r.json())
      .then((d: { rows: Invoice[]; totals: Totals }) => {
        setRows(d.rows ?? []);
        setTotals(d.totals ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Surface the post-checkout outcome from the Stripe return URL.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('paid')) setPayMessage(`Payment received for invoice ${sp.get('paid')}. Thank you.`);
    else if (sp.get('cancelled')) setPayMessage('Payment was cancelled. Your invoice is unchanged.');
  }, []);

  async function payInvoice(inv: Invoice) {
    setPayingId(inv.id);
    setPayMessage(null);
    try {
      const res = await fetch(`/api/portal/invoices/${inv.id}/pay`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url as string;
        return;
      }
      if (res.status === 503) {
        setPayMessage('Online payment is not enabled yet. Please contact ALTA staff to pay this invoice.');
      } else {
        setPayMessage(typeof data.error === 'string' ? data.error : 'Could not start payment. Please try again.');
      }
    } catch {
      setPayMessage('Could not start payment. Please try again.');
    } finally {
      setPayingId(null);
    }
  }

  return (
    <div className="space-y-6 mt-2">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>Invoices</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Your organization&apos;s billing history. Pay open invoices online with a card via secure checkout.
        </p>
      </div>

      {payMessage && (
        <div
          className="text-xs rounded-lg px-3 py-2.5"
          style={{ color: 'var(--heading)', background: 'color-mix(in srgb, #4A90D9 12%, transparent)', border: '1px solid color-mix(in srgb, #4A90D9 30%, transparent)' }}
          role="status"
        >
          {payMessage}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {loading || !totals ? (
          <><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /></>
        ) : (
          <>
            <KpiCard label="Total billed" value={`$${totals.amount.toLocaleString()}`} sub="lifetime" icon={DollarSign} color="#4A90D9" />
            <KpiCard label="Collected" value={`$${totals.paid.toLocaleString()}`} sub="lifetime" icon={Receipt} color="#8CC63F" />
            <KpiCard label="Outstanding" value={`$${totals.outstanding.toLocaleString()}`} sub="current" icon={Clock} color="#F5C542" />
            <KpiCard label="Past due" value={`$${totals.pastDue.toLocaleString()}`} sub="past the due date" icon={AlertCircle} color="#D94A4A" />
          </>
        )}
      </div>

      {loading ? <SkeletonCard height={300} /> : (
        <Card glass title="History" subtitle={`${rows.length} invoices`} noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--table-header)', color: 'var(--text-muted)' }}>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Invoice</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Issued</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Due</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wider">Pay</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="px-3 py-6 text-center" style={{ color: 'var(--text-muted)' }}>No invoices yet.</td></tr>
                )}
                {rows.map((i) => {
                  const color = STATUS_COLOR[i.status];
                  return (
                    <tr key={i.id} style={{ borderTop: '1px solid var(--card-border)' }}>
                      <td className="px-3 py-2.5">
                        <div className="font-mono text-[11px]" style={{ color: 'var(--heading)' }}>{i.invoice_number}</div>
                        {i.description && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{i.description}</div>}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>{i.date_issued}</td>
                      <td className="px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>{i.date_due}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums font-bold" style={{ color: 'var(--heading)' }}>${i.amount.toLocaleString()}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
                          {i.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {PAYABLE.includes(i.status) ? (
                          <button
                            type="button"
                            onClick={() => payInvoice(i)}
                            disabled={payingId === i.id}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition disabled:opacity-50"
                            style={{ color: '#fff', background: '#4A90D9' }}
                          >
                            <CreditCard className="w-3 h-3" />
                            {payingId === i.id ? 'Starting…' : 'Pay now'}
                          </button>
                        ) : (
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
