import type {
  Organization, Invoice, EventSummary, EventAttendance, Group, GroupMember,
} from './member-data';

export type ChartKind = 'bar' | 'pie' | 'horizontal-bar' | 'none';

export interface ReportRowCell {
  label: string;
  value: string | number;
  /** Right-aligned numeric column hint */
  numeric?: boolean;
  /** Render as bold (typically a totals row) */
  bold?: boolean;
}

export interface ReportChartPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ReportResult {
  /** Headers for the table */
  columns: string[];
  /** Data rows */
  rows: ReportRowCell[][];
  /** Optional chart data, in display order */
  chart?: { kind: ChartKind; title: string; points: ReportChartPoint[] };
  /** Optional headline KPIs to render above the chart/table */
  kpis?: { label: string; value: string; sub?: string; color?: string }[];
  /** Plain-language note shown beneath the report */
  note?: string;
}

export interface ReportPreset {
  slug: string;
  title: string;
  subtitle: string;
  category: 'Membership' | 'Finance' | 'Engagement' | 'Governance';
  /** Returns a fully-rendered ReportResult given the data inputs. */
  run: (data: ReportInputs) => ReportResult;
}

/** Everything the reports need — fetched once on the page and passed in. */
export interface ReportInputs {
  organizations: Organization[];
  invoices: Invoice[];
  events: EventSummary[];
  attendance: EventAttendance[];
  groups: Group[];
  groupMembers: GroupMember[];
}

const TYPE_COLOR: Record<string, string> = {
  ACU: '#a855f7',
  ACA: '#14b8a6',
  ACB: '#4A90D9',
  REA: '#F5C542',
  Associate: '#8CC63F',
  Affiliate: '#E8923F',
  Government: '#475569',
  Honorary: '#a855f7',
};

const HEALTH_COLOR: Record<string, string> = {
  Champion:   '#8CC63F',
  Engaged:    '#4A90D9',
  'At Risk':  '#F5C542',
  Disengaged: '#E8923F',
  'Gone Dark':'#D94A4A',
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const offsetIso = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

// ── Presets ─────────────────────────────────────────────────

const memberHealthByType: ReportPreset = {
  slug: 'member-health-by-type',
  title: 'Member health by type',
  subtitle: 'Health-tier distribution across each membership category',
  category: 'Membership',
  run: ({ organizations }) => {
    const types = ['ACU', 'ACA', 'ACB', 'REA', 'Associate', 'Affiliate', 'Government', 'Honorary'];
    const tiers = ['Champion', 'Engaged', 'At Risk', 'Disengaged', 'Gone Dark'];
    const rows: ReportRowCell[][] = [];
    for (const t of types) {
      const orgs = organizations.filter((o) => o.org_type === t);
      if (!orgs.length) continue;
      const buckets = tiers.map((tier) => orgs.filter((o) => o.health_tier === tier).length);
      rows.push([
        { label: t, value: t },
        ...buckets.map((c) => ({ label: '', value: c, numeric: true })),
        { label: '', value: orgs.length, numeric: true, bold: true },
      ]);
    }
    return {
      columns: ['Type', ...tiers, 'Total'],
      rows,
      chart: {
        kind: 'horizontal-bar',
        title: 'Total members by type',
        points: types
          .map((t) => ({ label: t, value: organizations.filter((o) => o.org_type === t).length, color: TYPE_COLOR[t] }))
          .filter((p) => p.value > 0)
          .sort((a, b) => b.value - a.value),
      },
      note: 'Counts pulled live from /api/memtrak/members. Use this to spot member types skewing toward at-risk or gone-dark.',
    };
  },
};

const topRevenuePayers: ReportPreset = {
  slug: 'top-revenue-payers',
  title: 'Top revenue payers',
  subtitle: 'Cumulative paid invoices per organization',
  category: 'Finance',
  run: ({ invoices, organizations }) => {
    const orgsById = new Map(organizations.map((o) => [o.id, o]));
    const totals = new Map<string, number>();
    for (const inv of invoices) {
      if (inv.status !== 'Paid') continue;
      totals.set(inv.org_id, (totals.get(inv.org_id) ?? 0) + inv.amount);
    }
    const ranked = [...totals.entries()]
      .map(([orgId, amount]) => ({ org: orgsById.get(orgId), amount }))
      .filter((r) => r.org)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 15);
    const rows: ReportRowCell[][] = ranked.map((r, i) => [
      { label: '', value: i + 1, numeric: true },
      { label: '', value: r.org!.org_name },
      { label: '', value: r.org!.org_type },
      { label: '', value: r.org!.state },
      { label: '', value: `$${r.amount.toLocaleString()}`, numeric: true, bold: true },
    ]);
    const grandTotal = ranked.reduce((s, r) => s + r.amount, 0);
    return {
      columns: ['#', 'Organization', 'Type', 'State', 'Cash collected'],
      rows,
      kpis: [
        { label: 'Top-15 cash', value: `$${grandTotal.toLocaleString()}`, color: '#8CC63F' },
        { label: 'Distinct payers', value: String(totals.size) },
      ],
      chart: {
        kind: 'bar',
        title: 'Top 10 payers — cash collected',
        points: ranked.slice(0, 10).map((r) => ({ label: r.org!.org_name, value: r.amount, color: TYPE_COLOR[r.org!.org_type] })),
      },
    };
  },
};

const engagementDistribution: ReportPreset = {
  slug: 'engagement-distribution',
  title: 'Engagement score distribution',
  subtitle: 'Histogram of engagement scores across the active roster',
  category: 'Engagement',
  run: ({ organizations }) => {
    const buckets = [
      { label: '0-19', min: 0, max: 19, color: '#D94A4A' },
      { label: '20-39', min: 20, max: 39, color: '#E8923F' },
      { label: '40-59', min: 40, max: 59, color: '#F5C542' },
      { label: '60-79', min: 60, max: 79, color: '#4A90D9' },
      { label: '80-100', min: 80, max: 100, color: '#8CC63F' },
    ];
    const rows: ReportRowCell[][] = [];
    for (const b of buckets) {
      const orgs = organizations.filter((o) => (o.engagement_score ?? 0) >= b.min && (o.engagement_score ?? 0) <= b.max);
      const dues = orgs.reduce((s, o) => s + (o.annual_dues ?? 0), 0);
      const pct = organizations.length > 0 ? (orgs.length / organizations.length * 100).toFixed(1) : '0';
      rows.push([
        { label: '', value: b.label },
        { label: '', value: orgs.length, numeric: true },
        { label: '', value: `${pct}%`, numeric: true },
        { label: '', value: `$${dues.toLocaleString()}`, numeric: true },
      ]);
    }
    return {
      columns: ['Score band', 'Members', '% of total', 'Annual dues'],
      rows,
      chart: {
        kind: 'bar',
        title: 'Members per engagement band',
        points: buckets.map((b) => ({
          label: b.label,
          value: organizations.filter((o) => (o.engagement_score ?? 0) >= b.min && (o.engagement_score ?? 0) <= b.max).length,
          color: b.color,
        })),
      },
      note: 'Engagement scores roll up email signal, attendance frequency/recency/quality, trust, and penalties. Recompute per-org from Member360.',
    };
  },
};

const lapsingRenewals: ReportPreset = {
  slug: 'lapsing-renewals',
  title: 'Lapsing renewals — next 90 days',
  subtitle: 'Members whose renewals fall in the next 90 days, sorted by churn risk',
  category: 'Finance',
  run: ({ organizations }) => {
    const today = todayIso();
    const cutoff = offsetIso(90);
    const upcoming = organizations
      .filter((o) => o.renewal_date >= today && o.renewal_date <= cutoff)
      .sort((a, b) => (b.churn_risk ?? 0) - (a.churn_risk ?? 0));
    const rows: ReportRowCell[][] = upcoming.map((o) => [
      { label: '', value: o.org_name },
      { label: '', value: o.org_type },
      { label: '', value: o.state },
      { label: '', value: o.renewal_date },
      { label: '', value: o.churn_risk ?? 0, numeric: true },
      { label: '', value: o.health_tier },
      { label: '', value: `$${o.annual_dues.toLocaleString()}`, numeric: true, bold: true },
    ]);
    const totalDues = upcoming.reduce((s, o) => s + o.annual_dues, 0);
    const atRisk = upcoming.filter((o) => (o.churn_risk ?? 0) >= 50).length;
    return {
      columns: ['Organization', 'Type', 'State', 'Renewal', 'Churn', 'Health', 'Annual dues'],
      rows,
      kpis: [
        { label: 'Renewals in 90d', value: String(upcoming.length) },
        { label: 'Dues at stake', value: `$${totalDues.toLocaleString()}`, color: '#8CC63F' },
        { label: 'At-risk', value: String(atRisk), color: '#D94A4A' },
      ],
      chart: upcoming.length > 0 ? {
        kind: 'pie',
        title: 'Health tier of upcoming renewals',
        points: ['Champion', 'Engaged', 'At Risk', 'Disengaged', 'Gone Dark'].map((tier) => ({
          label: tier,
          value: upcoming.filter((o) => o.health_tier === tier).length,
          color: HEALTH_COLOR[tier],
        })).filter((p) => p.value > 0),
      } : undefined,
    };
  },
};

const eventPerformance: ReportPreset = {
  slug: 'event-performance',
  title: 'Event performance',
  subtitle: 'Attendance rate and revenue per event',
  category: 'Engagement',
  run: ({ events }) => {
    const sorted = [...events].sort((a, b) => b.event_date.localeCompare(a.event_date));
    const rows: ReportRowCell[][] = sorted.map((e) => [
      { label: '', value: e.event_date },
      { label: '', value: e.event_name },
      { label: '', value: e.event_type },
      { label: '', value: e.registered + e.attended + e.no_show, numeric: true },
      { label: '', value: `${e.attendance_rate}%`, numeric: true },
      { label: '', value: e.no_show, numeric: true },
      { label: '', value: `$${e.revenue_paid.toLocaleString()}`, numeric: true, bold: true },
    ]);
    const totalRevenue = events.reduce((s, e) => s + e.revenue_paid, 0);
    const totalRegs = events.reduce((s, e) => s + e.registered + e.attended + e.no_show, 0);
    return {
      columns: ['Date', 'Event', 'Type', 'Registered', 'Attendance', 'No-shows', 'Revenue'],
      rows,
      kpis: [
        { label: 'Events', value: String(events.length) },
        { label: 'Total registrations', value: totalRegs.toLocaleString() },
        { label: 'Revenue collected', value: `$${totalRevenue.toLocaleString()}`, color: '#8CC63F' },
      ],
      chart: {
        kind: 'bar',
        title: 'Attendance rate by event',
        points: sorted.map((e) => ({ label: e.event_name.length > 22 ? e.event_name.slice(0, 22) + '…' : e.event_name, value: e.attendance_rate, color: e.attendance_rate >= 80 ? '#8CC63F' : e.attendance_rate >= 60 ? '#4A90D9' : '#E8923F' })),
      },
    };
  },
};

const geographicConcentration: ReportPreset = {
  slug: 'geographic-concentration',
  title: 'Geographic concentration',
  subtitle: 'Members and revenue by state',
  category: 'Membership',
  run: ({ organizations }) => {
    const byState = new Map<string, { count: number; dues: number; lifetime: number }>();
    for (const o of organizations) {
      if (!o.state) continue;
      const cur = byState.get(o.state) ?? { count: 0, dues: 0, lifetime: 0 };
      cur.count += 1;
      cur.dues += o.annual_dues ?? 0;
      cur.lifetime += o.lifetime_revenue ?? 0;
      byState.set(o.state, cur);
    }
    const sorted = [...byState.entries()]
      .sort((a, b) => b[1].count - a[1].count);
    const rows: ReportRowCell[][] = sorted.map(([state, v]) => [
      { label: '', value: state },
      { label: '', value: v.count, numeric: true },
      { label: '', value: `$${v.dues.toLocaleString()}`, numeric: true },
      { label: '', value: `$${v.lifetime.toLocaleString()}`, numeric: true, bold: true },
    ]);
    const top = sorted.slice(0, 10);
    return {
      columns: ['State', 'Members', 'Annual dues', 'Lifetime revenue'],
      rows,
      kpis: [
        { label: 'States represented', value: String(byState.size) },
        { label: 'Top state', value: sorted[0]?.[0] ?? '—', sub: sorted[0] ? `${sorted[0][1].count} members` : undefined },
      ],
      chart: {
        kind: 'horizontal-bar',
        title: 'Top 10 states by member count',
        points: top.map(([state, v]) => ({ label: state, value: v.count, color: '#4A90D9' })),
      },
      note: 'Useful for advocacy targeting and chapter strategy. Concentration in 5 states often signals organic growth opportunity in adjacent markets.',
    };
  },
};

export const REPORT_PRESETS: ReportPreset[] = [
  memberHealthByType,
  topRevenuePayers,
  engagementDistribution,
  lapsingRenewals,
  eventPerformance,
  geographicConcentration,
];

export function getReport(slug: string): ReportPreset | null {
  return REPORT_PRESETS.find((p) => p.slug === slug) ?? null;
}
