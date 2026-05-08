// ============================================================
// MEMTrak Data Access Layer
// Tries Supabase first, falls back to in-memory demo data
// ============================================================

import { supabase, isSupabaseConfigured } from './supabase';

// ── Type Definitions ─────────────────────────────────────────

export interface Organization {
  id: string;
  org_name: string;
  org_type: 'ACU' | 'ACA' | 'ACB' | 'REA' | 'Associate' | 'Affiliate' | 'Government' | 'Honorary';
  status: 'Active' | 'Pending' | 'Suspended' | 'Lapsed' | 'Cancelled' | 'Honorary';
  member_id: string;
  join_date: string;
  renewal_date: string;
  annual_dues: number;
  dues_status: string;
  tier: string;
  city: string;
  state: string;
  engagement_score: number;
  trust_score: number;
  churn_risk: number;
  decay_score: number;
  health_tier: string;
  lifetime_revenue: number;
  last_payment_date: string;
  tags: string[];
  notes?: string;
}

export interface Contact {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string;
  email: string;
  title?: string;
  role: string;
  phone?: string;
  is_primary: boolean;
  total_opens: number;
  total_clicks: number;
  last_email_open?: string;
}

export interface OrgStats {
  totalOrgs: number;
  totalRevenue: number;
  avgEngagement: number;
  avgChurn: number;
  byType: Record<string, number>;
  byHealth: Record<string, number>;
}

// ── Demo Fallback Data ───────────────────────────────────────
// Matches the seed SQL — 20 representative orgs covering all types,
// health tiers, lapsed members, and new 2026 members.

const demoOrganizations: Organization[] = [
  // ACU Underwriters (all 5)
  {
    id: 'demo-acu-001',
    org_name: 'First American Title Insurance',
    org_type: 'ACU',
    status: 'Active',
    member_id: 'ALTA-2001-0001',
    join_date: '2001-03-15',
    renewal_date: '2026-10-01',
    annual_dues: 61554.00,
    dues_status: 'Current',
    tier: 'Enterprise',
    city: 'Santa Ana',
    state: 'CA',
    engagement_score: 35,
    trust_score: 42,
    churn_risk: 75,
    decay_score: 75,
    health_tier: 'At Risk',
    lifetime_revenue: 1477296.00,
    last_payment_date: '2025-10-01',
    tags: ['underwriter', 'board-rep', 'convention-sponsor'],
  },
  {
    id: 'demo-acu-002',
    org_name: 'Old Republic National Title',
    org_type: 'ACU',
    status: 'Active',
    member_id: 'ALTA-1999-0002',
    join_date: '1999-06-01',
    renewal_date: '2026-10-01',
    annual_dues: 61554.00,
    dues_status: 'Current',
    tier: 'Enterprise',
    city: 'Tampa',
    state: 'FL',
    engagement_score: 28,
    trust_score: 35,
    churn_risk: 82,
    decay_score: 85,
    health_tier: 'Disengaged',
    lifetime_revenue: 1600404.00,
    last_payment_date: '2025-10-01',
    tags: ['underwriter', 'declining'],
  },
  {
    id: 'demo-acu-003',
    org_name: 'Stewart Information Services',
    org_type: 'ACU',
    status: 'Active',
    member_id: 'ALTA-2003-0003',
    join_date: '2003-01-10',
    renewal_date: '2026-10-01',
    annual_dues: 61554.00,
    dues_status: 'Current',
    tier: 'Enterprise',
    city: 'Houston',
    state: 'TX',
    engagement_score: 72,
    trust_score: 78,
    churn_risk: 25,
    decay_score: 18,
    health_tier: 'Engaged',
    lifetime_revenue: 1415742.00,
    last_payment_date: '2025-10-01',
    tags: ['underwriter', 'alta-one-sponsor'],
  },
  {
    id: 'demo-acu-004',
    org_name: 'Fidelity National Financial',
    org_type: 'ACU',
    status: 'Active',
    member_id: 'ALTA-1998-0004',
    join_date: '1998-08-22',
    renewal_date: '2026-10-01',
    annual_dues: 61554.00,
    dues_status: 'Current',
    tier: 'Enterprise',
    city: 'Jacksonville',
    state: 'FL',
    engagement_score: 88,
    trust_score: 92,
    churn_risk: 10,
    decay_score: 5,
    health_tier: 'Champion',
    lifetime_revenue: 1723512.00,
    last_payment_date: '2025-10-01',
    tags: ['underwriter', 'board-member', 'tipac-contributor'],
  },
  {
    id: 'demo-acu-005',
    org_name: 'WFG National Title Insurance',
    org_type: 'ACU',
    status: 'Active',
    member_id: 'ALTA-2010-0005',
    join_date: '2010-02-14',
    renewal_date: '2026-10-01',
    annual_dues: 61554.00,
    dues_status: 'Current',
    tier: 'Enterprise',
    city: 'Portland',
    state: 'OR',
    engagement_score: 65,
    trust_score: 70,
    churn_risk: 35,
    decay_score: 28,
    health_tier: 'Engaged',
    lifetime_revenue: 984864.00,
    last_payment_date: '2025-10-01',
    tags: ['underwriter'],
  },
  // Top ACB agents
  {
    id: 'demo-acb-020',
    org_name: 'Chicago Title Insurance',
    org_type: 'ACB',
    status: 'Active',
    member_id: 'ALTA-2005-0020',
    join_date: '2005-05-18',
    renewal_date: '2026-10-01',
    annual_dues: 2450.00,
    dues_status: 'Current',
    tier: 'Premium',
    city: 'Chicago',
    state: 'IL',
    engagement_score: 82,
    trust_score: 85,
    churn_risk: 12,
    decay_score: 8,
    health_tier: 'Champion',
    lifetime_revenue: 51450.00,
    last_payment_date: '2025-10-01',
    tags: ['agent', 'alta-one-attendee', 'pac-contributor'],
  },
  {
    id: 'demo-acb-022',
    org_name: 'North American Title',
    org_type: 'ACB',
    status: 'Active',
    member_id: 'ALTA-2011-0022',
    join_date: '2011-08-05',
    renewal_date: '2026-10-01',
    annual_dues: 2450.00,
    dues_status: 'Current',
    tier: 'Premium',
    city: 'Miami',
    state: 'FL',
    engagement_score: 45,
    trust_score: 50,
    churn_risk: 52,
    decay_score: 48,
    health_tier: 'At Risk',
    lifetime_revenue: 36750.00,
    last_payment_date: '2025-10-01',
    tags: ['agent'],
  },
  {
    id: 'demo-acb-023',
    org_name: 'Westcor Land Title Insurance',
    org_type: 'ACB',
    status: 'Active',
    member_id: 'ALTA-2009-0023',
    join_date: '2009-12-14',
    renewal_date: '2026-10-01',
    annual_dues: 2450.00,
    dues_status: 'Current',
    tier: 'Premium',
    city: 'Maitland',
    state: 'FL',
    engagement_score: 90,
    trust_score: 95,
    churn_risk: 5,
    decay_score: 2,
    health_tier: 'Champion',
    lifetime_revenue: 41650.00,
    last_payment_date: '2025-10-01',
    tags: ['agent', 'board-member', 'tipac-leader'],
  },
  // ACA Abstracters (mix of health tiers)
  {
    id: 'demo-aca-010',
    org_name: 'Heritage Abstract Company',
    org_type: 'ACA',
    status: 'Active',
    member_id: 'ALTA-2015-0010',
    join_date: '2015-04-01',
    renewal_date: '2026-10-01',
    annual_dues: 517.00,
    dues_status: 'Current',
    tier: 'Standard',
    city: 'Oklahoma City',
    state: 'OK',
    engagement_score: 15,
    trust_score: 20,
    churn_risk: 90,
    decay_score: 100,
    health_tier: 'Gone Dark',
    lifetime_revenue: 3619.00,
    last_payment_date: '2025-10-01',
    tags: ['abstracter', 'high-churn-risk'],
  },
  {
    id: 'demo-aca-013',
    org_name: 'Pioneer Abstract & Title',
    org_type: 'ACA',
    status: 'Active',
    member_id: 'ALTA-2020-0013',
    join_date: '2020-01-08',
    renewal_date: '2026-10-01',
    annual_dues: 517.00,
    dues_status: 'Current',
    tier: 'Standard',
    city: 'Boise',
    state: 'ID',
    engagement_score: 92,
    trust_score: 88,
    churn_risk: 5,
    decay_score: 2,
    health_tier: 'Champion',
    lifetime_revenue: 3102.00,
    last_payment_date: '2025-10-01',
    tags: ['abstracter', 'new-member-mentor'],
  },
  // REA Attorneys
  {
    id: 'demo-rea-032',
    org_name: 'Henderson Title Law',
    org_type: 'REA',
    status: 'Active',
    member_id: 'ALTA-2018-0032',
    join_date: '2018-03-20',
    renewal_date: '2026-10-01',
    annual_dues: 850.00,
    dues_status: 'Current',
    tier: 'Standard',
    city: 'Atlanta',
    state: 'GA',
    engagement_score: 92,
    trust_score: 90,
    churn_risk: 5,
    decay_score: 3,
    health_tier: 'Champion',
    lifetime_revenue: 6800.00,
    last_payment_date: '2025-10-01',
    tags: ['attorney', 'speaker', 'tipac'],
  },
  {
    id: 'demo-rea-033',
    org_name: 'Blackwell Real Estate Law',
    org_type: 'REA',
    status: 'Active',
    member_id: 'ALTA-2021-0033',
    join_date: '2021-01-05',
    renewal_date: '2026-10-01',
    annual_dues: 850.00,
    dues_status: 'Current',
    tier: 'Standard',
    city: 'Austin',
    state: 'TX',
    engagement_score: 35,
    trust_score: 40,
    churn_risk: 65,
    decay_score: 60,
    health_tier: 'Disengaged',
    lifetime_revenue: 4250.00,
    last_payment_date: '2025-10-01',
    tags: ['attorney'],
  },
  // Associates (tech vendors)
  {
    id: 'demo-assoc-040',
    org_name: 'Qualia Holdings',
    org_type: 'Associate',
    status: 'Active',
    member_id: 'ALTA-2019-0040',
    join_date: '2019-08-01',
    renewal_date: '2026-10-01',
    annual_dues: 1200.00,
    dues_status: 'Current',
    tier: 'Premium',
    city: 'Austin',
    state: 'TX',
    engagement_score: 95,
    trust_score: 92,
    churn_risk: 3,
    decay_score: 1,
    health_tier: 'Champion',
    lifetime_revenue: 8400.00,
    last_payment_date: '2025-10-01',
    tags: ['technology', 'sponsor', 'alta-one-exhibitor'],
  },
  {
    id: 'demo-assoc-042',
    org_name: 'RamQuest',
    org_type: 'Associate',
    status: 'Active',
    member_id: 'ALTA-2010-0042',
    join_date: '2010-11-22',
    renewal_date: '2026-10-01',
    annual_dues: 1200.00,
    dues_status: 'Current',
    tier: 'Standard',
    city: 'Plano',
    state: 'TX',
    engagement_score: 55,
    trust_score: 60,
    churn_risk: 42,
    decay_score: 38,
    health_tier: 'At Risk',
    lifetime_revenue: 19200.00,
    last_payment_date: '2025-10-01',
    tags: ['technology'],
  },
  {
    id: 'demo-assoc-043',
    org_name: 'Notarize',
    org_type: 'Associate',
    status: 'Active',
    member_id: 'ALTA-2021-0043',
    join_date: '2021-03-10',
    renewal_date: '2026-10-01',
    annual_dues: 1200.00,
    dues_status: 'Current',
    tier: 'Standard',
    city: 'Boston',
    state: 'MA',
    engagement_score: 88,
    trust_score: 85,
    churn_risk: 8,
    decay_score: 5,
    health_tier: 'Champion',
    lifetime_revenue: 6000.00,
    last_payment_date: '2025-10-01',
    tags: ['technology', 'ron-provider'],
  },
  // Lapsed / Suspended
  {
    id: 'demo-lapsed-070',
    org_name: 'Pacific Title Group',
    org_type: 'ACB',
    status: 'Lapsed',
    member_id: 'ALTA-2010-0070',
    join_date: '2010-06-15',
    renewal_date: '2025-10-01',
    annual_dues: 2450.00,
    dues_status: 'Past Due',
    tier: 'Standard',
    city: 'Los Angeles',
    state: 'CA',
    engagement_score: 8,
    trust_score: 12,
    churn_risk: 95,
    decay_score: 98,
    health_tier: 'Gone Dark',
    lifetime_revenue: 36750.00,
    last_payment_date: '2024-10-01',
    tags: ['agent', 'lapsed', 'recovery-target'],
  },
  {
    id: 'demo-lapsed-072',
    org_name: 'Meridian Title Company',
    org_type: 'ACB',
    status: 'Suspended',
    member_id: 'ALTA-2015-0072',
    join_date: '2015-07-22',
    renewal_date: '2025-10-01',
    annual_dues: 2450.00,
    dues_status: 'Cancelled',
    tier: 'Standard',
    city: 'Indianapolis',
    state: 'IN',
    engagement_score: 0,
    trust_score: 5,
    churn_risk: 100,
    decay_score: 100,
    health_tier: 'Gone Dark',
    lifetime_revenue: 24500.00,
    last_payment_date: '2023-10-01',
    tags: ['agent', 'suspended', 'non-payment'],
  },
  // New 2026 members
  {
    id: 'demo-new-080',
    org_name: 'ClearTitle AI',
    org_type: 'Associate',
    status: 'Active',
    member_id: 'ALTA-2026-0080',
    join_date: '2026-01-15',
    renewal_date: '2027-01-15',
    annual_dues: 1200.00,
    dues_status: 'Current',
    tier: 'Standard',
    city: 'Austin',
    state: 'TX',
    engagement_score: 95,
    trust_score: 90,
    churn_risk: 2,
    decay_score: 0,
    health_tier: 'Champion',
    lifetime_revenue: 1200.00,
    last_payment_date: '2026-01-15',
    tags: ['technology', 'ai', 'new-member-2026'],
  },
  {
    id: 'demo-new-081',
    org_name: 'NextGen Title Solutions',
    org_type: 'ACB',
    status: 'Active',
    member_id: 'ALTA-2026-0081',
    join_date: '2026-02-01',
    renewal_date: '2027-02-01',
    annual_dues: 2450.00,
    dues_status: 'Current',
    tier: 'Standard',
    city: 'Charlotte',
    state: 'NC',
    engagement_score: 85,
    trust_score: 80,
    churn_risk: 8,
    decay_score: 3,
    health_tier: 'Champion',
    lifetime_revenue: 2450.00,
    last_payment_date: '2026-02-01',
    tags: ['agent', 'new-member-2026'],
  },
  {
    id: 'demo-new-082',
    org_name: 'TrueVault Title',
    org_type: 'ACB',
    status: 'Active',
    member_id: 'ALTA-2026-0082',
    join_date: '2026-03-10',
    renewal_date: '2027-03-10',
    annual_dues: 2450.00,
    dues_status: 'Current',
    tier: 'Standard',
    city: 'Seattle',
    state: 'WA',
    engagement_score: 78,
    trust_score: 75,
    churn_risk: 12,
    decay_score: 5,
    health_tier: 'Engaged',
    lifetime_revenue: 2450.00,
    last_payment_date: '2026-03-10',
    tags: ['agent', 'new-member-2026', 'digital-closing'],
  },
];

// ── Data Access Functions ────────────────────────────────────

/**
 * Returns all organizations sorted by annual_dues DESC.
 * Tries Supabase first, falls back to demo data.
 */
export async function getOrganizations(): Promise<Organization[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('memtrak_organizations')
        .select('*')
        .order('annual_dues', { ascending: false });
      if (data && !error) return data;
    } catch {
      // Supabase unavailable — fall through to demo data
    }
  }
  return [...demoOrganizations].sort((a, b) => b.annual_dues - a.annual_dues);
}

/**
 * Returns a single organization by ID.
 */
export async function getOrganization(id: string): Promise<Organization | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('memtrak_organizations')
        .select('*')
        .eq('id', id)
        .single();
      if (data && !error) return data;
    } catch {
      // fall through
    }
  }
  return demoOrganizations.find((o) => o.id === id) ?? null;
}

/**
 * Returns organizations filtered by health_tier
 * (Champion, Engaged, At Risk, Disengaged, Gone Dark).
 */
export async function getOrganizationsByHealth(tier: string): Promise<Organization[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('memtrak_organizations')
        .select('*')
        .eq('health_tier', tier)
        .order('annual_dues', { ascending: false });
      if (data && !error) return data;
    } catch {
      // fall through
    }
  }
  return demoOrganizations
    .filter((o) => o.health_tier === tier)
    .sort((a, b) => b.annual_dues - a.annual_dues);
}

/**
 * Returns organizations filtered by org_type
 * (ACU, ACA, ACB, REA, Associate, Affiliate, Government, Honorary).
 */
export async function getOrganizationsByType(type: string): Promise<Organization[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('memtrak_organizations')
        .select('*')
        .eq('org_type', type)
        .order('annual_dues', { ascending: false });
      if (data && !error) return data;
    } catch {
      // fall through
    }
  }
  return demoOrganizations
    .filter((o) => o.org_type === type)
    .sort((a, b) => b.annual_dues - a.annual_dues);
}

/**
 * Returns at-risk organizations (churn_risk >= 50), sorted by annual_dues DESC.
 * These are the members most likely to leave and should be prioritized for outreach.
 */
export async function getAtRiskOrganizations(): Promise<Organization[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('memtrak_organizations')
        .select('*')
        .gte('churn_risk', 50)
        .order('annual_dues', { ascending: false });
      if (data && !error) return data;
    } catch {
      // fall through
    }
  }
  return demoOrganizations
    .filter((o) => o.churn_risk >= 50)
    .sort((a, b) => b.annual_dues - a.annual_dues);
}

/**
 * Returns aggregate statistics across all organizations.
 */
export async function getOrgStats(): Promise<OrgStats> {
  const orgs = await getOrganizations();

  const totalOrgs = orgs.length;
  const totalRevenue = orgs.reduce((sum, o) => sum + o.annual_dues, 0);
  const avgEngagement = totalOrgs > 0
    ? Math.round(orgs.reduce((sum, o) => sum + o.engagement_score, 0) / totalOrgs)
    : 0;
  const avgChurn = totalOrgs > 0
    ? Math.round(orgs.reduce((sum, o) => sum + o.churn_risk, 0) / totalOrgs)
    : 0;

  const byType: Record<string, number> = {};
  const byHealth: Record<string, number> = {};

  for (const o of orgs) {
    byType[o.org_type] = (byType[o.org_type] ?? 0) + 1;
    byHealth[o.health_tier] = (byHealth[o.health_tier] ?? 0) + 1;
  }

  return { totalOrgs, totalRevenue, avgEngagement, avgChurn, byType, byHealth };
}

/**
 * Searches organizations by name, city, state, or member_id.
 * Case-insensitive partial match.
 */
export async function searchOrganizations(query: string): Promise<Organization[]> {
  if (isSupabaseConfigured()) {
    try {
      const pattern = `%${query}%`;
      const { data, error } = await supabase
        .from('memtrak_organizations')
        .select('*')
        .or(`org_name.ilike.${pattern},city.ilike.${pattern},state.ilike.${pattern},member_id.ilike.${pattern}`)
        .order('annual_dues', { ascending: false });
      if (data && !error) return data;
    } catch {
      // fall through
    }
  }

  const q = query.toLowerCase();
  return demoOrganizations
    .filter(
      (o) =>
        o.org_name.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.state.toLowerCase().includes(q) ||
        o.member_id.toLowerCase().includes(q)
    )
    .sort((a, b) => b.annual_dues - a.annual_dues);
}

// ── Directory listing (paginated/filtered/sorted) ───────────

export type SortField =
  | 'org_name'
  | 'org_type'
  | 'state'
  | 'annual_dues'
  | 'engagement_score'
  | 'churn_risk'
  | 'health_tier'
  | 'renewal_date'
  | 'lifetime_revenue';

export interface ListOrgsParams {
  q?: string;
  type?: string;
  health?: string;
  state?: string;
  status?: string;
  sort?: SortField;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface ListOrgsResult {
  rows: Organization[];
  total: number;
  page: number;
  pageSize: number;
}

const ALLOWED_SORTS: SortField[] = [
  'org_name', 'org_type', 'state', 'annual_dues',
  'engagement_score', 'churn_risk', 'health_tier',
  'renewal_date', 'lifetime_revenue',
];

/**
 * Paginated, filtered, sorted directory listing.
 * Tries Supabase first, falls back to filtering demo data in-memory.
 */
export async function listOrganizations(params: ListOrgsParams = {}): Promise<ListOrgsResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(200, Math.max(1, params.pageSize ?? 25));
  const sort: SortField = ALLOWED_SORTS.includes(params.sort as SortField)
    ? (params.sort as SortField)
    : 'annual_dues';
  const order: 'asc' | 'desc' = params.order === 'asc' ? 'asc' : 'desc';
  const q = params.q?.trim() ?? '';

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('memtrak_organizations')
        .select('*', { count: 'exact' });

      if (params.type) query = query.eq('org_type', params.type);
      if (params.health) query = query.eq('health_tier', params.health);
      if (params.state) query = query.eq('state', params.state);
      if (params.status) query = query.eq('status', params.status);
      if (q) {
        const pattern = `%${q}%`;
        query = query.or(
          `org_name.ilike.${pattern},city.ilike.${pattern},state.ilike.${pattern},member_id.ilike.${pattern}`
        );
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await query
        .order(sort, { ascending: order === 'asc' })
        .range(from, to);

      if (data && !error) {
        return { rows: data, total: count ?? data.length, page, pageSize };
      }
    } catch {
      // fall through
    }
  }

  let rows = [...demoOrganizations];
  if (params.type) rows = rows.filter((o) => o.org_type === params.type);
  if (params.health) rows = rows.filter((o) => o.health_tier === params.health);
  if (params.state) rows = rows.filter((o) => o.state === params.state);
  if (params.status) rows = rows.filter((o) => o.status === params.status);
  if (q) {
    const lower = q.toLowerCase();
    rows = rows.filter(
      (o) =>
        o.org_name.toLowerCase().includes(lower) ||
        o.city.toLowerCase().includes(lower) ||
        o.state.toLowerCase().includes(lower) ||
        o.member_id.toLowerCase().includes(lower) ||
        (o.tags ?? []).some((t) => t.toLowerCase().includes(lower))
    );
  }

  rows.sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[sort];
    const bv = (b as unknown as Record<string, unknown>)[sort];
    if (typeof av === 'number' && typeof bv === 'number') {
      return order === 'asc' ? av - bv : bv - av;
    }
    const as = String(av ?? '');
    const bs = String(bv ?? '');
    return order === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
  });

  const total = rows.length;
  const from = (page - 1) * pageSize;
  return { rows: rows.slice(from, from + pageSize), total, page, pageSize };
}

// ── Mutations (require Supabase) ─────────────────────────────

export type OrganizationInput = Partial<Omit<Organization, 'id'>> & {
  org_name: string;
  org_type: Organization['org_type'];
};

/**
 * Creates a new organization. Requires Supabase configuration.
 */
export async function createOrganization(input: OrganizationInput): Promise<Organization> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot create organization');
  }
  const { data, error } = await supabase
    .from('memtrak_organizations')
    .insert(input)
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Insert failed');
  return data;
}

/**
 * Updates an organization by id. Requires Supabase configuration.
 */
export async function updateOrganization(id: string, patch: Partial<Organization>): Promise<Organization> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot update organization');
  }
  const { id: _ignore, ...rest } = patch;
  void _ignore;
  const { data, error } = await supabase
    .from('memtrak_organizations')
    .update(rest)
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Update failed');
  return data;
}

/**
 * Deletes an organization by id. Requires Supabase configuration.
 */
export async function deleteOrganization(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot delete organization');
  }
  const { error } = await supabase
    .from('memtrak_organizations')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export interface BulkCreateResult {
  inserted: number;
  failed: { index: number; error: string }[];
}

/**
 * Bulk-creates organizations. Inserts in a single Supabase call so partial
 * failure rolls back. Requires Supabase configuration.
 */
export async function bulkCreateOrganizations(rows: OrganizationInput[]): Promise<BulkCreateResult> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot import organizations');
  }
  if (!rows.length) return { inserted: 0, failed: [] };

  const { data, error } = await supabase
    .from('memtrak_organizations')
    .insert(rows)
    .select('id');

  if (error) {
    return { inserted: 0, failed: rows.map((_, index) => ({ index, error: error.message })) };
  }
  return { inserted: data?.length ?? 0, failed: [] };
}

/**
 * Returns the distinct list of US states present in the dataset.
 * Used to populate filter dropdowns.
 */
export async function getDistinctStates(): Promise<string[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('memtrak_organizations')
        .select('state');
      if (data && !error) {
        return Array.from(new Set(data.map((r: { state: string }) => r.state).filter(Boolean))).sort();
      }
    } catch {
      // fall through
    }
  }
  return Array.from(new Set(demoOrganizations.map((o) => o.state))).sort();
}
