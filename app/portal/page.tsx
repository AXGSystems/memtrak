'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card, { KpiCard } from '@/components/Card';
import { SkeletonCard, SkeletonKPI } from '@/components/Skeleton';
import { Receipt, Calendar, Users, DollarSign, Building2, Mail, Award, AlertCircle } from 'lucide-react';
import type { Contact, Organization } from '@/lib/member-data';

interface Payload {
  contact: Contact;
  org: Organization;
  summary: {
    open_invoices: number;
    open_balance: number;
    upcoming_events: number;
    groups: number;
  };
}

export default function PortalHome() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/portal/me')
      .then(async (r) => {
        if (!r.ok) { const e = await r.json().catch(() => ({})); setError(e.error ?? `Request failed (${r.status})`); return; }
        setData(await r.json());
      })
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <Card glass>
        <div className="flex items-start gap-2 text-xs" style={{ color: '#D94A4A' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
        </div>
      </Card>
    );
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <SkeletonCard height={100} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3"><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /></div>
      </div>
    );
  }

  const { contact, org, summary } = data;

  return (
    <div className="space-y-6 mt-2">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
          Welcome, {contact.first_name}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          You&apos;re signed in as <strong style={{ color: 'var(--heading)' }}>{org.org_name}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        <KpiCard label="Open invoices" value={summary.open_invoices} sub={`$${summary.open_balance.toLocaleString()} balance`} icon={Receipt} color="#F5C542" />
        <KpiCard label="Upcoming events" value={summary.upcoming_events} sub="you're registered" icon={Calendar} color="#4A90D9" />
        <KpiCard label="Groups" value={summary.groups} sub="active memberships" icon={Users} color="#a855f7" />
        <KpiCard label="Engagement" value={`${org.engagement_score ?? 0}`} sub={org.health_tier ?? '—'} icon={Award} color="#8CC63F" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card glass title="Your organization" subtitle={org.member_id ?? '—'}>
          <div className="space-y-1.5 text-xs">
            <Row icon={Building2} label={org.org_type} value={org.tier ?? 'Standard'} />
            <Row icon={Mail} label="Renewal" value={org.renewal_date ?? '—'} />
            <Row icon={DollarSign} label="Annual dues" value={`$${org.annual_dues?.toLocaleString() ?? 0}`} />
          </div>
        </Card>

        <Card glass title="Your profile" subtitle={contact.role}>
          <div className="space-y-1.5 text-xs">
            <Row label="Name" value={`${contact.first_name} ${contact.last_name}`} />
            <Row label="Email" value={contact.email} />
            {contact.title && <Row label="Title" value={contact.title} />}
            {contact.phone && <Row label="Phone" value={contact.phone} />}
          </div>
          <Link href="/portal/profile" className="inline-block mt-3 text-[11px] font-semibold" style={{ color: 'var(--accent)' }}>
            Update profile →
          </Link>
        </Card>
      </div>
    </div>
  );
}

interface RowProps { label: string; value: string; icon?: typeof Mail }
function Row({ label, value, icon: Icon }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
        {Icon && <Icon className="w-3 h-3" />} {label}
      </span>
      <span style={{ color: 'var(--heading)' }}>{value}</span>
    </div>
  );
}
