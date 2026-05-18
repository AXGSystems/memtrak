'use client';

import { useEffect, useState } from 'react';
import Card, { KpiCard } from '@/components/Card';
import { SkeletonCard, SkeletonKPI } from '@/components/Skeleton';
import { Receipt, DollarSign, AlertCircle, Clock } from 'lucide-react';
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

export default function PortalInvoices() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal/invoices')
      .then((r) => r.json())
      .then((d: { rows: Invoice[]; totals: Totals }) => {
        setRows(d.rows ?? []);
        setTotals(d.totals ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 mt-2">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>Invoices</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Your organization&apos;s billing history. Online payment is coming soon — for now, contact ALTA staff to pay.
        </p>
      </div>

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
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center" style={{ color: 'var(--text-muted)' }}>No invoices yet.</td></tr>
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
