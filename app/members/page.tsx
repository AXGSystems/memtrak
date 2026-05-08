'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card, { KpiCard } from '@/components/Card';
import AnimatedCounter from '@/components/AnimatedCounter';
import { SkeletonKPI } from '@/components/Skeleton';
import MemberFormDrawer from '@/components/MemberFormDrawer';
import ImportMembersDrawer from '@/components/ImportMembersDrawer';
import {
  Users, Building2, DollarSign, Heart, Search, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Plus, Download, Printer, Upload, Pencil,
} from 'lucide-react';
import type { Organization, SortField, ListOrgsResult } from '@/lib/member-data';

const ORG_TYPES = ['ACU', 'ACA', 'ACB', 'REA', 'Associate', 'Affiliate', 'Government', 'Honorary'] as const;
const HEALTH_TIERS = ['Champion', 'Engaged', 'At Risk', 'Disengaged', 'Gone Dark'] as const;
const STATUSES = ['Active', 'Pending', 'Suspended', 'Lapsed', 'Cancelled', 'Honorary'] as const;
const PAGE_SIZE = 25;

const HEALTH_COLOR: Record<string, string> = {
  'Champion': '#8CC63F',
  'Engaged': '#4A90D9',
  'At Risk': '#F5C542',
  'Disengaged': '#E8923F',
  'Gone Dark': '#D94A4A',
};

const TYPE_COLOR: Record<string, string> = {
  'ACU': '#a855f7',
  'ACA': '#14b8a6',
  'ACB': '#4A90D9',
  'REA': '#F5C542',
  'Associate': '#8CC63F',
  'Affiliate': '#E8923F',
  'Government': '#475569',
  'Honorary': '#a855f7',
};

interface Filters {
  q: string;
  type: string;
  health: string;
  state: string;
  status: string;
}

const EMPTY_FILTERS: Filters = { q: '', type: '', health: '', state: '', status: '' };

export default function MembersDirectoryPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState('');
  const [sort, setSort] = useState<SortField>('annual_dues');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListOrgsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [allStates, setAllStates] = useState<string[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q), 250);
    return () => clearTimeout(t);
  }, [filters.q]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (filters.type) params.set('type', filters.type);
    if (filters.health) params.set('health', filters.health);
    if (filters.state) params.set('state', filters.state);
    if (filters.status) params.set('status', filters.status);
    params.set('sort', sort);
    params.set('order', order);
    params.set('page', String(page));
    params.set('pageSize', String(PAGE_SIZE));

    fetch(`/api/memtrak/members?${params}`)
      .then((r) => r.json())
      .then((d: ListOrgsResult) => setData(d))
      .finally(() => setLoading(false));
  }, [debouncedQ, filters.type, filters.health, filters.state, filters.status, sort, order, page, reloadKey]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedQ, filters.type, filters.health, filters.state, filters.status]);

  // Load distinct states once for the dropdown
  useEffect(() => {
    fetch('/api/memtrak/members?pageSize=200&sort=state&order=asc')
      .then((r) => r.json())
      .then((d: ListOrgsResult) => {
        const states = Array.from(new Set(d.rows.map((r) => r.state).filter(Boolean))).sort();
        setAllStates(states);
      })
      .catch(() => setAllStates([]));
  }, []);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const aggregates = useMemo(() => {
    if (!data) return null;
    const rows = data.rows;
    const totalDues = rows.reduce((s, o) => s + (o.annual_dues ?? 0), 0);
    const avgEng = rows.length
      ? Math.round(rows.reduce((s, o) => s + (o.engagement_score ?? 0), 0) / rows.length)
      : 0;
    const champions = rows.filter((o) => o.health_tier === 'Champion').length;
    const atRisk = rows.filter((o) => ['At Risk', 'Disengaged', 'Gone Dark'].includes(o.health_tier)).length;
    return { totalDues, avgEng, champions, atRisk };
  }, [data]);

  const exportCsv = () => {
    if (!data) return;
    const cols: (keyof Organization)[] = [
      'member_id', 'org_name', 'org_type', 'status', 'tier',
      'city', 'state', 'annual_dues', 'health_tier',
      'engagement_score', 'churn_risk', 'lifetime_revenue', 'renewal_date',
    ];
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
    a.download = `members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (field: SortField) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder(field === 'org_name' || field === 'state' || field === 'org_type' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return order === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            Member Directory
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {data ? <><AnimatedCounter value={data.total} /> organizations · search, filter, and drill into Member360</> : 'Loading members…'}
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
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03]"
            style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
          >
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-[1.03]"
            style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Member
          </button>
        </div>
      </div>

      {/* KPI strip — page-scope aggregates */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {loading || !aggregates ? (
          <>
            <SkeletonKPI /><SkeletonKPI /><SkeletonKPI /><SkeletonKPI />
          </>
        ) : (
          <>
            <KpiCard
              label="Members on page"
              value={data?.rows.length ?? 0}
              sub={`of ${data?.total.toLocaleString() ?? 0} matching`}
              icon={Users}
              color="#4A90D9"
            />
            <KpiCard
              label="Page dues total"
              value={`$${(aggregates.totalDues / 1000).toFixed(0)}K`}
              sub="annual"
              icon={DollarSign}
              color="#8CC63F"
            />
            <KpiCard
              label="Avg engagement"
              value={`${aggregates.avgEng}`}
              sub="0–100 scale"
              icon={Heart}
              color="#a855f7"
            />
            <KpiCard
              label="Champions / At-risk"
              value={`${aggregates.champions} / ${aggregates.atRisk}`}
              sub="on this page"
              icon={Building2}
              color="#F5C542"
            />
          </>
        )}
      </div>

      {/* Filter bar */}
      <Card glass>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search name, city, state, ID, tag…"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2"
              style={{
                background: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--heading)',
              }}
            />
          </div>
          <FilterSelect
            value={filters.type}
            onChange={(v) => setFilters({ ...filters, type: v })}
            placeholder="All types"
            options={ORG_TYPES}
          />
          <FilterSelect
            value={filters.health}
            onChange={(v) => setFilters({ ...filters, health: v })}
            placeholder="All health"
            options={HEALTH_TIERS}
          />
          <FilterSelect
            value={filters.state}
            onChange={(v) => setFilters({ ...filters, state: v })}
            placeholder="All states"
            options={allStates}
          />
          <FilterSelect
            value={filters.status}
            onChange={(v) => setFilters({ ...filters, status: v })}
            placeholder="All statuses"
            options={STATUSES}
          />
        </div>

        {/* Active filter chips + reset */}
        {(filters.q || filters.type || filters.health || filters.state || filters.status) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {Object.entries(filters).map(([k, v]) => v ? (
              <button
                key={k}
                onClick={() => setFilters({ ...filters, [k]: '' })}
                className="text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all hover:scale-[1.05]"
                style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
              >
                {k}: {v} ✕
              </button>
            ) : null)}
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all hover:scale-[1.05]"
              style={{ color: 'var(--text-muted)' }}
            >
              Reset all
            </button>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card glass noPad>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--table-header)', color: 'var(--text-muted)' }}>
                <Th onClick={() => toggleSort('org_name')}>Organization <SortIcon field="org_name" /></Th>
                <Th onClick={() => toggleSort('org_type')}>Type <SortIcon field="org_type" /></Th>
                <Th onClick={() => toggleSort('state')}>Location <SortIcon field="state" /></Th>
                <Th onClick={() => toggleSort('annual_dues')} align="right">Dues <SortIcon field="annual_dues" /></Th>
                <Th onClick={() => toggleSort('health_tier')}>Health <SortIcon field="health_tier" /></Th>
                <Th onClick={() => toggleSort('engagement_score')} align="right">Eng. <SortIcon field="engagement_score" /></Th>
                <Th onClick={() => toggleSort('churn_risk')} align="right">Churn <SortIcon field="churn_risk" /></Th>
                <Th onClick={() => toggleSort('renewal_date')}>Renewal <SortIcon field="renewal_date" /></Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`skel-${i}`} style={{ borderTop: '1px solid var(--card-border)' }}>
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-3 py-3">
                        <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data && data.rows.length > 0 ? (
                data.rows.map((o) => (
                  <Row key={o.id} org={o} onEdit={() => setEditing(o)} />
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-3 py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                    No members match those filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t no-print" style={{ borderColor: 'var(--card-border)' }}>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Page {page} of {totalPages} · {data.total.toLocaleString()} matches
            </span>
            <div className="flex items-center gap-1">
              <PageBtn disabled={page === 1} onClick={() => setPage(1)}>«</PageBtn>
              <PageBtn disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft className="w-3 h-3" /></PageBtn>
              <PageBtn disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="w-3 h-3" /></PageBtn>
              <PageBtn disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</PageBtn>
            </div>
          </div>
        )}
      </Card>

      <MemberFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={() => setReloadKey((k) => k + 1)}
      />

      <MemberFormDrawer
        isOpen={editing !== null}
        org={editing}
        onClose={() => setEditing(null)}
        onSaved={() => setReloadKey((k) => k + 1)}
      />

      <ImportMembersDrawer
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}

function Th({ children, onClick, align = 'left' }: { children: React.ReactNode; onClick?: () => void; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-3 py-2.5 font-semibold text-[10px] uppercase tracking-wider ${onClick ? 'cursor-pointer select-none hover:opacity-80' : ''}`}
      style={{ textAlign: align }}
      onClick={onClick}
    >
      <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>{children}</span>
    </th>
  );
}

function Row({ org, onEdit }: { org: Organization; onEdit: () => void }) {
  return (
    <tr
      className="transition-colors hover:bg-white/[0.04]"
      style={{ borderTop: '1px solid var(--card-border)' }}
    >
      <td className="px-3 py-2.5">
        <div className="font-semibold" style={{ color: 'var(--heading)' }}>{org.org_name}</div>
        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{org.member_id}</div>
      </td>
      <td className="px-3 py-2.5">
        <span
          className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold"
          style={{
            color: TYPE_COLOR[org.org_type] ?? 'var(--accent)',
            background: `color-mix(in srgb, ${TYPE_COLOR[org.org_type] ?? 'var(--accent)'} 12%, transparent)`,
          }}
        >
          {org.org_type}
        </span>
      </td>
      <td className="px-3 py-2.5" style={{ color: 'var(--text-muted)' }}>
        {org.city}, {org.state}
      </td>
      <td className="px-3 py-2.5 text-right font-semibold tabular-nums" style={{ color: 'var(--heading)' }}>
        ${org.annual_dues.toLocaleString()}
      </td>
      <td className="px-3 py-2.5">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
          style={{
            color: HEALTH_COLOR[org.health_tier] ?? 'var(--text-muted)',
            background: `color-mix(in srgb, ${HEALTH_COLOR[org.health_tier] ?? '#888'} 12%, transparent)`,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: HEALTH_COLOR[org.health_tier] ?? '#888' }} />
          {org.health_tier}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right tabular-nums" style={{ color: 'var(--heading)' }}>{org.engagement_score}</td>
      <td className="px-3 py-2.5 text-right tabular-nums">
        <span style={{ color: org.churn_risk >= 60 ? '#D94A4A' : org.churn_risk >= 30 ? '#F5C542' : '#8CC63F' }}>
          {org.churn_risk}
        </span>
      </td>
      <td className="px-3 py-2.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {org.renewal_date}
      </td>
      <td className="px-3 py-2.5 text-right">
        <div className="inline-flex items-center gap-1 no-print">
          <button
            onClick={onEdit}
            aria-label={`Edit ${org.org_name}`}
            title="Edit member"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all hover:scale-[1.05]"
            style={{ color: 'var(--text-muted)', background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}
          >
            <Pencil className="w-3 h-3" />
          </button>
          <Link
            href={`/member-360?id=${encodeURIComponent(org.id)}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all hover:scale-[1.05]"
            style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
          >
            View <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </td>
    </tr>
  );
}

function FilterSelect({ value, onChange, placeholder, options }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: readonly string[] | string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2"
      style={{
        background: 'var(--input-bg)',
        borderColor: 'var(--input-border)',
        color: 'var(--heading)',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function PageBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
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
