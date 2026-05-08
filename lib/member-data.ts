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

export type InvoiceStatus = 'Pending' | 'Sent' | 'Paid' | 'Past Due' | 'Cancelled' | 'Refunded';

export interface Invoice {
  id: string;
  org_id: string;
  invoice_number: string;
  amount: number;
  description?: string | null;
  date_issued: string;
  date_due: string;
  date_paid?: string | null;
  status: InvoiceStatus;
  payment_method?: string | null;
  payment_reference?: string | null;
  fiscal_year?: number | null;
  created_at?: string;
}

export type GroupType = 'Committee' | 'Board' | 'Task Force' | 'Section' | 'Working Group' | 'Interest Group';
export type GroupRole = 'Chair' | 'Vice Chair' | 'Secretary' | 'Member' | 'Liaison' | 'Observer';

export interface Group {
  id: string;
  name: string;
  group_type: GroupType;
  description?: string | null;
  is_active: boolean;
  chair_contact_id?: string | null;
  staff_liaison?: string | null;
  meeting_frequency?: string | null;
  created_at?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  contact_id: string;
  role: GroupRole;
  joined_date: string;
  term_end?: string | null;
  is_active: boolean;
}

/** Aggregated view: a group plus its member roster (joined to contacts/orgs). */
export interface GroupWithRoster {
  group: Group;
  members: Array<GroupMember & {
    contact?: Contact | null;
    org?: Organization | null;
  }>;
}

export type EventType = 'Conference' | 'Webinar' | 'Workshop' | 'Committee Meeting' | 'Board Meeting' | 'Social' | 'Training';
export type RegistrationStatus = 'Registered' | 'Attended' | 'No Show' | 'Cancelled';

export interface EventAttendance {
  id: string;
  alta_connect_event_id: string;
  event_name: string;
  event_date: string;
  event_type: EventType;
  contact_id?: string | null;
  org_id: string;
  registration_status: RegistrationStatus;
  registration_date?: string;
  check_in_time?: string | null;
  registration_fee: number;
  paid: boolean;
  created_at?: string;
}

/** Aggregate view derived from attendance rows. */
export interface EventSummary {
  alta_connect_event_id: string;
  event_name: string;
  event_date: string;
  event_type: EventType;
  registered: number;
  attended: number;
  no_show: number;
  cancelled: number;
  attendance_rate: number;
  revenue_paid: number;
  revenue_outstanding: number;
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
  /** Filter to orgs whose join_date is on or after this YYYY-MM-DD. */
  joined_after?: string;
  /** Filter to orgs whose renewal_date is between [start, end] inclusive (YYYY-MM-DD). */
  renewal_from?: string;
  renewal_to?: string;
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
      if (params.joined_after) query = query.gte('join_date', params.joined_after);
      if (params.renewal_from) query = query.gte('renewal_date', params.renewal_from);
      if (params.renewal_to) query = query.lte('renewal_date', params.renewal_to);
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
  if (params.joined_after) rows = rows.filter((o) => o.join_date >= params.joined_after!);
  if (params.renewal_from) rows = rows.filter((o) => o.renewal_date >= params.renewal_from!);
  if (params.renewal_to) rows = rows.filter((o) => o.renewal_date <= params.renewal_to!);
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

// ── Contacts ─────────────────────────────────────────────────

export type ContactInput = Partial<Omit<Contact, 'id'>> & {
  org_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

const demoContactsByOrg: Record<string, Contact[]> = {
  'demo-acu-001': [
    { id: 'c-001-1', org_id: 'demo-acu-001', first_name: 'Sarah', last_name: 'Mitchell', email: 'smitchell@firstam.com', title: 'VP Government Affairs', role: 'Primary', phone: '714-555-0142', is_primary: true, total_opens: 47, total_clicks: 12, last_email_open: '2026-04-22' },
    { id: 'c-001-2', org_id: 'demo-acu-001', first_name: 'David', last_name: 'Chen', email: 'dchen@firstam.com', title: 'CFO', role: 'Billing', phone: '714-555-0188', is_primary: false, total_opens: 23, total_clicks: 4 },
  ],
  'demo-acu-004': [
    { id: 'c-004-1', org_id: 'demo-acu-004', first_name: 'Patrick', last_name: 'Sullivan', email: 'psullivan@fnf.com', title: 'EVP', role: 'Primary', phone: '904-555-0100', is_primary: true, total_opens: 89, total_clicks: 34, last_email_open: '2026-05-01' },
    { id: 'c-004-2', org_id: 'demo-acu-004', first_name: 'Linda', last_name: 'Park', email: 'lpark@fnf.com', title: 'AVP Compliance', role: 'Operations', phone: '904-555-0205', is_primary: false, total_opens: 56, total_clicks: 18, last_email_open: '2026-04-28' },
  ],
  'demo-acb-020': [
    { id: 'c-020-1', org_id: 'demo-acb-020', first_name: 'Michael', last_name: 'Thompson', email: 'mthompson@chicagotitle.com', title: 'Branch Manager', role: 'Primary', phone: '312-555-0301', is_primary: true, total_opens: 38, total_clicks: 9, last_email_open: '2026-04-18' },
  ],
};

const demoContactsAll: Contact[] = Object.values(demoContactsByOrg).flat();

/**
 * Lists contacts for a given organization.
 */
export async function listContacts(org_id: string): Promise<Contact[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('memtrak_contacts')
        .select('*')
        .eq('org_id', org_id)
        .order('is_primary', { ascending: false })
        .order('last_name', { ascending: true });
      if (data && !error) return data;
    } catch {
      // fall through
    }
  }
  return demoContactsByOrg[org_id] ?? [];
}

/**
 * Returns a single contact by id.
 */
export async function getContact(id: string): Promise<Contact | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('memtrak_contacts')
        .select('*')
        .eq('id', id)
        .single();
      if (data && !error) return data;
    } catch {
      // fall through
    }
  }
  return demoContactsAll.find((c) => c.id === id) ?? null;
}

/**
 * Creates a contact. Requires Supabase configuration.
 */
export async function createContact(input: ContactInput): Promise<Contact> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot create contact');
  }
  const { data, error } = await supabase
    .from('memtrak_contacts')
    .insert(input)
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Insert failed');
  return data;
}

/**
 * Updates a contact by id. Requires Supabase configuration.
 */
export async function updateContact(id: string, patch: Partial<Contact>): Promise<Contact> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot update contact');
  }
  const { id: _ignore, ...rest } = patch;
  void _ignore;
  const { data, error } = await supabase
    .from('memtrak_contacts')
    .update(rest)
    .eq('id', id)
    .select()
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Update failed');
  return data;
}

/**
 * Deletes a contact by id. Requires Supabase configuration.
 */
export async function deleteContact(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot delete contact');
  }
  const { error } = await supabase
    .from('memtrak_contacts')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Invoices ────────────────────────────────────────────────

export type InvoiceInput = Partial<Omit<Invoice, 'id' | 'created_at'>> & {
  org_id: string;
  invoice_number: string;
  amount: number;
  date_due: string;
};

const todayIso = () => new Date().toISOString().slice(0, 10);
const yearOf = (iso: string) => Number(iso.slice(0, 4)) || new Date().getFullYear();

const demoInvoices: Invoice[] = [
  // Paid invoices for Champion orgs (proof of payment behavior)
  { id: 'inv-001', org_id: 'demo-acu-004', invoice_number: 'INV-2025-001', amount: 61554, description: '2025 Annual Dues — ACU', date_issued: '2025-09-01', date_due: '2025-10-01', date_paid: '2025-09-28', status: 'Paid', payment_method: 'ACH', payment_reference: 'CHK-44521', fiscal_year: 2025 },
  { id: 'inv-002', org_id: 'demo-acu-001', invoice_number: 'INV-2025-002', amount: 61554, description: '2025 Annual Dues — ACU', date_issued: '2025-09-01', date_due: '2025-10-01', date_paid: '2025-10-15', status: 'Paid', payment_method: 'Check', payment_reference: 'CHK-90122', fiscal_year: 2025 },
  { id: 'inv-003', org_id: 'demo-acb-020', invoice_number: 'INV-2025-003', amount: 2450, description: '2025 Annual Dues — ACB', date_issued: '2025-09-01', date_due: '2025-10-01', date_paid: '2025-09-22', status: 'Paid', payment_method: 'Stripe', payment_reference: 'ch_1A2B3C', fiscal_year: 2025 },
  // Pending invoices for upcoming renewals
  { id: 'inv-101', org_id: 'demo-acu-005', invoice_number: 'INV-2026-101', amount: 61554, description: '2026 Annual Dues — ACU', date_issued: '2026-04-15', date_due: '2026-10-01', status: 'Sent', fiscal_year: 2026 },
  { id: 'inv-102', org_id: 'demo-acb-022', invoice_number: 'INV-2026-102', amount: 2450, description: '2026 Annual Dues — ACB', date_issued: '2026-04-15', date_due: '2026-10-01', status: 'Sent', fiscal_year: 2026 },
  // Past due (long stale)
  { id: 'inv-201', org_id: 'demo-lapsed-070', invoice_number: 'INV-2025-201', amount: 2450, description: '2025 Annual Dues — ACB', date_issued: '2025-09-01', date_due: '2025-10-01', status: 'Past Due', fiscal_year: 2025 },
  { id: 'inv-202', org_id: 'demo-lapsed-072', invoice_number: 'INV-2025-202', amount: 2450, description: '2025 Annual Dues — ACB', date_issued: '2025-09-01', date_due: '2025-10-01', status: 'Past Due', fiscal_year: 2025 },
  // In active dunning windows (pre-due)
  ...buildDunningDemoInvoices(),
];

/**
 * Build a handful of demo invoices whose `date_due` falls inside the active
 * dunning windows (pre_30, pre_7, past_7, past_30) relative to today. This
 * lets /finance/dunning show non-empty cohorts in demo mode without
 * requiring Supabase. Computed at module load — re-evaluates per cold start.
 */
function buildDunningDemoInvoices(): Invoice[] {
  const offset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  const fy = new Date().getFullYear();
  return [
    { id: 'inv-301', org_id: 'demo-acb-022', invoice_number: `INV-${fy}-301`, amount: 2450, description: `${fy} Annual Dues — ACB`, date_issued: offset(-21), date_due: offset(26), status: 'Sent', fiscal_year: fy },
    { id: 'inv-302', org_id: 'demo-rea-033', invoice_number: `INV-${fy}-302`, amount: 850,  description: `${fy} Annual Dues — REA`, date_issued: offset(-23), date_due: offset(5),  status: 'Sent', fiscal_year: fy },
    { id: 'inv-303', org_id: 'demo-aca-010', invoice_number: `INV-${fy}-303`, amount: 517,  description: `${fy} Annual Dues — ACA`, date_issued: offset(-32), date_due: offset(-3), status: 'Past Due', fiscal_year: fy },
    { id: 'inv-304', org_id: 'demo-assoc-042', invoice_number: `INV-${fy}-304`, amount: 1200, description: `${fy} Annual Dues — Associate`, date_issued: offset(-44), date_due: offset(-15), status: 'Past Due', fiscal_year: fy },
  ];
}

export interface ListInvoicesParams {
  org_id?: string;
  status?: InvoiceStatus;
  fiscal_year?: number;
  due_from?: string;
  due_to?: string;
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface ListInvoicesResult {
  rows: Invoice[];
  total: number;
  page: number;
  pageSize: number;
  totals: { amount: number; paid: number; outstanding: number; pastDue: number };
}

export async function listInvoices(params: ListInvoicesParams = {}): Promise<ListInvoicesResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(200, Math.max(1, params.pageSize ?? 50));

  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('memtrak_invoices').select('*', { count: 'exact' });
      if (params.org_id) query = query.eq('org_id', params.org_id);
      if (params.status) query = query.eq('status', params.status);
      if (params.fiscal_year) query = query.eq('fiscal_year', params.fiscal_year);
      if (params.due_from) query = query.gte('date_due', params.due_from);
      if (params.due_to) query = query.lte('date_due', params.due_to);
      if (params.q) {
        const pattern = `%${params.q}%`;
        query = query.or(`invoice_number.ilike.${pattern},description.ilike.${pattern},payment_reference.ilike.${pattern}`);
      }
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await query
        .order('date_due', { ascending: false })
        .range(from, to);
      if (data && !error) {
        const totals = computeInvoiceTotals(data);
        return { rows: data, total: count ?? data.length, page, pageSize, totals };
      }
    } catch {
      // fall through
    }
  }

  let rows = [...demoInvoices];
  if (params.org_id) rows = rows.filter((i) => i.org_id === params.org_id);
  if (params.status) rows = rows.filter((i) => i.status === params.status);
  if (params.fiscal_year) rows = rows.filter((i) => i.fiscal_year === params.fiscal_year);
  if (params.due_from) rows = rows.filter((i) => i.date_due >= params.due_from!);
  if (params.due_to) rows = rows.filter((i) => i.date_due <= params.due_to!);
  if (params.q) {
    const lower = params.q.toLowerCase();
    rows = rows.filter((i) =>
      i.invoice_number.toLowerCase().includes(lower) ||
      (i.description ?? '').toLowerCase().includes(lower) ||
      (i.payment_reference ?? '').toLowerCase().includes(lower),
    );
  }
  rows.sort((a, b) => b.date_due.localeCompare(a.date_due));
  const total = rows.length;
  const totals = computeInvoiceTotals(rows);
  const fromIdx = (page - 1) * pageSize;
  return { rows: rows.slice(fromIdx, fromIdx + pageSize), total, page, pageSize, totals };
}

function computeInvoiceTotals(rows: Invoice[]) {
  const today = todayIso();
  let amount = 0, paid = 0, outstanding = 0, pastDue = 0;
  for (const i of rows) {
    amount += i.amount;
    if (i.status === 'Paid') paid += i.amount;
    else if (i.status === 'Cancelled' || i.status === 'Refunded') { /* skip */ }
    else {
      outstanding += i.amount;
      if (i.status === 'Past Due' || i.date_due < today) pastDue += i.amount;
    }
  }
  return { amount, paid, outstanding, pastDue };
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('memtrak_invoices').select('*').eq('id', id).single();
      if (data && !error) return data;
    } catch { /* fall through */ }
  }
  return demoInvoices.find((i) => i.id === id) ?? null;
}

export async function createInvoice(input: InvoiceInput): Promise<Invoice> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot create invoice');
  }
  const payload: InvoiceInput = {
    status: 'Pending',
    date_issued: todayIso(),
    fiscal_year: yearOf(input.date_due),
    ...input,
  };
  const { data, error } = await supabase.from('memtrak_invoices').insert(payload).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Insert failed');
  return data;
}

export async function updateInvoice(id: string, patch: Partial<Invoice>): Promise<Invoice> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot update invoice');
  }
  const { id: _ignore, created_at: _c, ...rest } = patch;
  void _ignore; void _c;
  const { data, error } = await supabase.from('memtrak_invoices').update(rest).eq('id', id).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Update failed');
  return data;
}

export async function markInvoicePaid(id: string, payment: { payment_method: string; payment_reference?: string; date_paid?: string }): Promise<Invoice> {
  return updateInvoice(id, {
    status: 'Paid',
    date_paid: payment.date_paid ?? todayIso(),
    payment_method: payment.payment_method,
    payment_reference: payment.payment_reference ?? null,
  });
}

export async function deleteInvoice(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot delete invoice');
  }
  const { error } = await supabase.from('memtrak_invoices').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export interface GenerateInvoicesResult {
  generated: number;
  skipped: number;
  invoices: Invoice[];
}

export interface FinanceStats {
  /** Total billed across all non-cancelled / non-refunded invoices */
  billed: number;
  /** Total collected (Paid invoices) */
  collected: number;
  /** Outstanding (not paid, not cancelled, not refunded) */
  outstanding: number;
  /** Past-due dollar amount */
  pastDue: number;
  /** AR aging in dollars: current (not yet due), 1-30 / 31-60 / 61-90 / 91+ days past due */
  aging: { current: number; d1_30: number; d31_60: number; d61_90: number; d91_plus: number };
  /** Last 12 months of cash collected (most recent month last). Months are YYYY-MM. */
  monthlyCash: { month: string; amount: number }[];
  /** Revenue collected per org_type (Paid invoices only) */
  byOrgType: { org_type: string; amount: number }[];
  /** Top 5 paying orgs by collected dollars */
  topPayers: { org_id: string; org_name: string; amount: number }[];
}

const monthKey = (iso: string) => iso.slice(0, 7);

function pastDueBucket(dueIso: string, today: string): keyof Omit<FinanceStats['aging'], 'current'> | 'current' {
  if (dueIso >= today) return 'current';
  const due = new Date(dueIso + 'T00:00:00Z').getTime();
  const now = new Date(today + 'T00:00:00Z').getTime();
  const days = Math.floor((now - due) / (1000 * 60 * 60 * 24));
  if (days <= 30) return 'd1_30';
  if (days <= 60) return 'd31_60';
  if (days <= 90) return 'd61_90';
  return 'd91_plus';
}

// ── Groups / Committees ─────────────────────────────────────

export type GroupInput = Partial<Omit<Group, 'id' | 'created_at'>> & {
  name: string;
  group_type: GroupType;
};

export type GroupMemberInput = Partial<Omit<GroupMember, 'id'>> & {
  group_id: string;
  contact_id: string;
};

const demoGroups: Group[] = [
  { id: 'grp-001', name: 'Board of Governors', group_type: 'Board', description: 'ALTA governing body — fiduciary oversight and strategic direction.', is_active: true, chair_contact_id: 'c-004-1', staff_liaison: 'Chris Morton', meeting_frequency: 'quarterly' },
  { id: 'grp-002', name: 'TIPAC Steering Committee', group_type: 'Committee', description: 'Federal advocacy and political action committee oversight.', is_active: true, chair_contact_id: 'c-001-1', staff_liaison: 'Paul Martin', meeting_frequency: 'monthly' },
  { id: 'grp-003', name: 'Compliance & Standards Working Group', group_type: 'Working Group', description: 'Updates ALTA Best Practices and reviews regulatory developments.', is_active: true, chair_contact_id: 'c-020-1', staff_liaison: 'Caroline Ehrenfeld', meeting_frequency: 'monthly' },
  { id: 'grp-004', name: 'Technology Section', group_type: 'Section', description: 'Cross-industry forum for title automation, RON, eClosing, and AI.', is_active: true, staff_liaison: 'Taylor Spolidoro', meeting_frequency: 'quarterly' },
  { id: 'grp-005', name: 'Membership Recruitment Task Force', group_type: 'Task Force', description: 'Time-bound initiative to grow ACA agent membership 2026-2027.', is_active: true, staff_liaison: 'Emily Mincey', meeting_frequency: 'as-needed' },
];

const demoGroupMembers: GroupMember[] = [
  // Board of Governors
  { id: 'gm-001', group_id: 'grp-001', contact_id: 'c-004-1', role: 'Chair',     joined_date: '2024-01-15', term_end: '2027-01-15', is_active: true },
  { id: 'gm-002', group_id: 'grp-001', contact_id: 'c-001-1', role: 'Vice Chair', joined_date: '2025-01-15', term_end: '2028-01-15', is_active: true },
  { id: 'gm-003', group_id: 'grp-001', contact_id: 'c-020-1', role: 'Member',    joined_date: '2024-06-01', term_end: '2027-06-01', is_active: true },
  // TIPAC
  { id: 'gm-101', group_id: 'grp-002', contact_id: 'c-001-1', role: 'Chair',     joined_date: '2025-01-15', term_end: '2027-01-15', is_active: true },
  { id: 'gm-102', group_id: 'grp-002', contact_id: 'c-004-1', role: 'Member',    joined_date: '2024-03-01', term_end: '2027-03-01', is_active: true },
  // Compliance
  { id: 'gm-201', group_id: 'grp-003', contact_id: 'c-020-1', role: 'Chair',     joined_date: '2025-04-01', term_end: '2027-04-01', is_active: true },
  { id: 'gm-202', group_id: 'grp-003', contact_id: 'c-001-2', role: 'Member',    joined_date: '2024-09-15', term_end: '2026-09-15', is_active: true },
  // Technology Section
  { id: 'gm-301', group_id: 'grp-004', contact_id: 'c-004-2', role: 'Member',    joined_date: '2025-02-01', term_end: '2027-02-01', is_active: true },
];

export async function listGroups(): Promise<Group[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('memtrak_groups')
        .select('*')
        .order('name', { ascending: true });
      if (data && !error) return data;
    } catch { /* fall through */ }
  }
  return [...demoGroups].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getGroup(id: string): Promise<GroupWithRoster | null> {
  // Look up the group
  let group: Group | null = null;
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('memtrak_groups').select('*').eq('id', id).single();
      if (data && !error) group = data;
    } catch { /* fall through */ }
  }
  if (!group) group = demoGroups.find((g) => g.id === id) ?? null;
  if (!group) return null;

  // Look up members
  let memberRows: GroupMember[] = [];
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('memtrak_group_members')
        .select('*')
        .eq('group_id', id);
      if (data && !error) memberRows = data;
    } catch { /* fall through */ }
  }
  if (!memberRows.length) memberRows = demoGroupMembers.filter((m) => m.group_id === id);

  // Resolve contact + org for each row (best-effort; uses cached lookups)
  const enriched = await Promise.all(memberRows.map(async (m) => {
    const contact = await getContact(m.contact_id);
    const org = contact ? await getOrganization(contact.org_id) : null;
    return { ...m, contact, org };
  }));

  // Sort: Chair → Vice Chair → Secretary → Member → Liaison → Observer
  const order: GroupRole[] = ['Chair', 'Vice Chair', 'Secretary', 'Member', 'Liaison', 'Observer'];
  enriched.sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role));

  return { group, members: enriched };
}

/** Returns groups that any contact at the given org is a member of. */
export async function listGroupsForOrg(org_id: string): Promise<Array<{ group: Group; member: GroupMember; contact: Contact }>> {
  const contacts = await listContacts(org_id);
  if (!contacts.length) return [];
  const contactIds = new Set(contacts.map((c) => c.id));

  let memberRows: GroupMember[] = [];
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('memtrak_group_members')
        .select('*')
        .in('contact_id', [...contactIds]);
      if (data && !error) memberRows = data;
    } catch { /* fall through */ }
  }
  if (!memberRows.length) memberRows = demoGroupMembers.filter((m) => contactIds.has(m.contact_id));

  const groups = await listGroups();
  const groupsById = new Map(groups.map((g) => [g.id, g]));
  const contactsById = new Map(contacts.map((c) => [c.id, c]));

  const out: Array<{ group: Group; member: GroupMember; contact: Contact }> = [];
  for (const m of memberRows) {
    const group = groupsById.get(m.group_id);
    const contact = contactsById.get(m.contact_id);
    if (group && contact) out.push({ group, member: m, contact });
  }
  return out;
}

export async function createGroup(input: GroupInput): Promise<Group> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured — cannot create group');
  const { data, error } = await supabase.from('memtrak_groups').insert({ is_active: true, ...input }).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Insert failed');
  return data;
}

export async function updateGroup(id: string, patch: Partial<Group>): Promise<Group> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured — cannot update group');
  const { id: _i, created_at: _c, ...rest } = patch;
  void _i; void _c;
  const { data, error } = await supabase.from('memtrak_groups').update(rest).eq('id', id).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Update failed');
  return data;
}

export async function deleteGroup(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured — cannot delete group');
  const { error } = await supabase.from('memtrak_groups').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addGroupMember(input: GroupMemberInput): Promise<GroupMember> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured — cannot add member');
  const payload = { is_active: true, role: 'Member' as GroupRole, joined_date: todayIso(), ...input };
  const { data, error } = await supabase.from('memtrak_group_members').insert(payload).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Insert failed');
  return data;
}

export async function removeGroupMember(membershipId: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error('Supabase not configured — cannot remove member');
  const { error } = await supabase.from('memtrak_group_members').delete().eq('id', membershipId);
  if (error) throw new Error(error.message);
}

// ── Events / Attendance ─────────────────────────────────────

export type EventAttendanceInput = Partial<Omit<EventAttendance, 'id' | 'created_at'>> & {
  alta_connect_event_id: string;
  event_name: string;
  event_date: string;
  event_type: EventType;
  org_id: string;
};

const demoEventAttendance: EventAttendance[] = [
  // ALTA ONE 2026 (Annual conference, Oct 2026)
  { id: 'att-001', alta_connect_event_id: 'evt-altaone-2026', event_name: 'ALTA ONE 2026', event_date: '2026-10-12', event_type: 'Conference', contact_id: 'c-004-1', org_id: 'demo-acu-004', registration_status: 'Registered', registration_fee: 1495, paid: true, registration_date: '2026-04-15' },
  { id: 'att-002', alta_connect_event_id: 'evt-altaone-2026', event_name: 'ALTA ONE 2026', event_date: '2026-10-12', event_type: 'Conference', contact_id: 'c-001-1', org_id: 'demo-acu-001', registration_status: 'Registered', registration_fee: 1495, paid: true, registration_date: '2026-04-22' },
  { id: 'att-003', alta_connect_event_id: 'evt-altaone-2026', event_name: 'ALTA ONE 2026', event_date: '2026-10-12', event_type: 'Conference', contact_id: 'c-020-1', org_id: 'demo-acb-020', registration_status: 'Registered', registration_fee: 1495, paid: false, registration_date: '2026-05-01' },

  // Spring Compliance Webinar — past event
  { id: 'att-101', alta_connect_event_id: 'evt-compwebinar-spring26', event_name: 'Spring Compliance Update', event_date: '2026-03-18', event_type: 'Webinar', contact_id: 'c-004-1', org_id: 'demo-acu-004', registration_status: 'Attended', registration_fee: 0, paid: true, check_in_time: '2026-03-18T14:02:00Z' },
  { id: 'att-102', alta_connect_event_id: 'evt-compwebinar-spring26', event_name: 'Spring Compliance Update', event_date: '2026-03-18', event_type: 'Webinar', contact_id: 'c-020-1', org_id: 'demo-acb-020', registration_status: 'Attended', registration_fee: 0, paid: true, check_in_time: '2026-03-18T14:00:00Z' },
  { id: 'att-103', alta_connect_event_id: 'evt-compwebinar-spring26', event_name: 'Spring Compliance Update', event_date: '2026-03-18', event_type: 'Webinar', org_id: 'demo-acu-001', registration_status: 'No Show', registration_fee: 0, paid: true },
  { id: 'att-104', alta_connect_event_id: 'evt-compwebinar-spring26', event_name: 'Spring Compliance Update', event_date: '2026-03-18', event_type: 'Webinar', org_id: 'demo-rea-032', registration_status: 'Attended', registration_fee: 0, paid: true, check_in_time: '2026-03-18T14:08:00Z' },

  // TIPAC Reception 2026 (Spring)
  { id: 'att-201', alta_connect_event_id: 'evt-tipac-spring26', event_name: 'TIPAC Reception — Capitol Hill', event_date: '2026-04-22', event_type: 'Social', contact_id: 'c-004-1', org_id: 'demo-acu-004', registration_status: 'Attended', registration_fee: 250, paid: true, check_in_time: '2026-04-22T18:15:00Z' },
  { id: 'att-202', alta_connect_event_id: 'evt-tipac-spring26', event_name: 'TIPAC Reception — Capitol Hill', event_date: '2026-04-22', event_type: 'Social', contact_id: 'c-020-1', org_id: 'demo-acb-020', registration_status: 'Attended', registration_fee: 250, paid: true, check_in_time: '2026-04-22T18:30:00Z' },

  // Title Insurance 101 Workshop — past
  { id: 'att-301', alta_connect_event_id: 'evt-title101-feb26', event_name: 'Title Insurance 101 Workshop', event_date: '2026-02-08', event_type: 'Workshop', org_id: 'demo-acb-022', registration_status: 'Attended', registration_fee: 195, paid: true, check_in_time: '2026-02-08T09:00:00Z' },
  { id: 'att-302', alta_connect_event_id: 'evt-title101-feb26', event_name: 'Title Insurance 101 Workshop', event_date: '2026-02-08', event_type: 'Workshop', org_id: 'demo-aca-013', registration_status: 'Attended', registration_fee: 195, paid: true, check_in_time: '2026-02-08T09:05:00Z' },
  { id: 'att-303', alta_connect_event_id: 'evt-title101-feb26', event_name: 'Title Insurance 101 Workshop', event_date: '2026-02-08', event_type: 'Workshop', org_id: 'demo-rea-033', registration_status: 'Cancelled', registration_fee: 195, paid: false },

  // Board Meeting — Q2 2026
  { id: 'att-401', alta_connect_event_id: 'evt-board-q226', event_name: 'Board Meeting — Q2 2026', event_date: '2026-04-30', event_type: 'Board Meeting', contact_id: 'c-004-1', org_id: 'demo-acu-004', registration_status: 'Attended', registration_fee: 0, paid: true, check_in_time: '2026-04-30T10:00:00Z' },
  { id: 'att-402', alta_connect_event_id: 'evt-board-q226', event_name: 'Board Meeting — Q2 2026', event_date: '2026-04-30', event_type: 'Board Meeting', org_id: 'demo-acb-023', registration_status: 'Attended', registration_fee: 0, paid: true, check_in_time: '2026-04-30T10:02:00Z' },
];

function summarizeEvent(rows: EventAttendance[]): EventSummary | null {
  if (!rows.length) return null;
  const first = rows[0];
  const summary: EventSummary = {
    alta_connect_event_id: first.alta_connect_event_id,
    event_name: first.event_name,
    event_date: first.event_date,
    event_type: first.event_type,
    registered: 0, attended: 0, no_show: 0, cancelled: 0,
    attendance_rate: 0,
    revenue_paid: 0, revenue_outstanding: 0,
  };
  for (const r of rows) {
    if (r.registration_status === 'Registered') summary.registered++;
    else if (r.registration_status === 'Attended') summary.attended++;
    else if (r.registration_status === 'No Show') summary.no_show++;
    else summary.cancelled++;
    if (r.registration_fee) {
      if (r.paid) summary.revenue_paid += r.registration_fee;
      else if (r.registration_status !== 'Cancelled') summary.revenue_outstanding += r.registration_fee;
    }
  }
  const eligible = summary.attended + summary.no_show;
  summary.attendance_rate = eligible > 0 ? Math.round((summary.attended / eligible) * 100) : 0;
  return summary;
}

export async function listEvents(): Promise<EventSummary[]> {
  let rows: EventAttendance[] = [];
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('memtrak_event_attendance').select('*');
      if (data && !error) rows = data;
    } catch { /* fall through */ }
  }
  if (!rows.length) rows = demoEventAttendance;

  const byEvent = new Map<string, EventAttendance[]>();
  for (const r of rows) {
    const list = byEvent.get(r.alta_connect_event_id) ?? [];
    list.push(r);
    byEvent.set(r.alta_connect_event_id, list);
  }
  const summaries: EventSummary[] = [];
  for (const list of byEvent.values()) {
    const s = summarizeEvent(list);
    if (s) summaries.push(s);
  }
  summaries.sort((a, b) => b.event_date.localeCompare(a.event_date));
  return summaries;
}

export async function getEvent(altaConnectEventId: string): Promise<{ event: EventSummary; roster: EventAttendance[] } | null> {
  let rows: EventAttendance[] = [];
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('memtrak_event_attendance')
        .select('*')
        .eq('alta_connect_event_id', altaConnectEventId);
      if (data && !error) rows = data;
    } catch { /* fall through */ }
  }
  if (!rows.length) rows = demoEventAttendance.filter((r) => r.alta_connect_event_id === altaConnectEventId);
  if (!rows.length) return null;
  const event = summarizeEvent(rows);
  if (!event) return null;
  return { event, roster: rows };
}

export async function listAttendanceForOrg(org_id: string): Promise<EventAttendance[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('memtrak_event_attendance')
        .select('*')
        .eq('org_id', org_id)
        .order('event_date', { ascending: false });
      if (data && !error) return data;
    } catch { /* fall through */ }
  }
  return demoEventAttendance
    .filter((r) => r.org_id === org_id)
    .sort((a, b) => b.event_date.localeCompare(a.event_date));
}

export async function recordAttendance(input: EventAttendanceInput): Promise<EventAttendance> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot record attendance');
  }
  const { data, error } = await supabase.from('memtrak_event_attendance').insert(input).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Insert failed');
  return data;
}

export async function updateAttendance(id: string, patch: Partial<EventAttendance>): Promise<EventAttendance> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot update attendance');
  }
  const { id: _i, created_at: _c, ...rest } = patch;
  void _i; void _c;
  const { data, error } = await supabase.from('memtrak_event_attendance').update(rest).eq('id', id).select().single();
  if (error || !data) throw new Error(error?.message ?? 'Update failed');
  return data;
}

/**
 * Recomputes an organization's engagement score from current org data plus
 * attendance history. When `persist` is true and Supabase is configured the
 * new score and health_tier are saved; otherwise the result is preview-only.
 */
export async function recomputeEngagement(
  org_id: string,
  options: { persist?: boolean } = {},
): Promise<{
  org_id: string;
  previous_score: number;
  previous_tier: string;
  new_score: number;
  new_tier: string;
  breakdown: import('./engagement').EngagementBreakdown;
  persisted: boolean;
}> {
  const { computeEngagementScore } = await import('./engagement');

  const org = await getOrganization(org_id);
  if (!org) throw new Error(`Organization ${org_id} not found`);

  const attendance = await listAttendanceForOrg(org_id);
  const breakdown = computeEngagementScore(org, attendance);

  const previous_score = org.engagement_score ?? 0;
  const previous_tier = org.health_tier ?? '';

  let persisted = false;
  if (options.persist && isSupabaseConfigured()) {
    try {
      await updateOrganization(org_id, {
        engagement_score: breakdown.score,
        health_tier: breakdown.tier,
      });
      persisted = true;
    } catch {
      // fall through — return breakdown without persisting
    }
  }

  return {
    org_id,
    previous_score,
    previous_tier,
    new_score: breakdown.score,
    new_tier: breakdown.tier,
    breakdown,
    persisted,
  };
}

export interface FiscalYearReport {
  fiscal_year: number;
  /** All non-cancelled invoices issued in the year, summed */
  billed: number;
  /** Cash actually received during the year (date_paid in year), regardless of issue date */
  collected: number;
  /** Issued in year, not yet paid (and not cancelled / refunded) */
  outstanding: number;
  /** Issued in year that are past their due date and unpaid */
  pastDue: number;
  /** Cancelled or Refunded amounts issued in the year */
  writeOffs: number;
  /** Collected count of invoices */
  invoiceCount: { billed: number; collected: number; outstanding: number; pastDue: number; writeOffs: number };
  /** Monthly billed vs collected. 12 entries Jan→Dec for that year */
  monthly: { month: string; billed: number; collected: number }[];
  /** By-org-type collected dollars */
  byOrgType: { org_type: string; billed: number; collected: number }[];
  /** Top-10 paying orgs in the year */
  topPayers: { org_id: string; org_name: string; org_type: string; amount: number }[];
  /** Active member organizations whose join_date falls in the year */
  newMembers: number;
  /** Active member organizations whose join_date predates the year (renewing) */
  renewingMembers: number;
  /** Lapsed/Cancelled organizations as of report time */
  lapsedMembers: number;
}

const startOfYear = (year: number) => `${year}-01-01`;
const endOfYear = (year: number) => `${year}-12-31`;

export async function getFiscalYearReport(year: number): Promise<FiscalYearReport> {
  const orgs = await getOrganizations();
  const orgsById = new Map(orgs.map((o) => [o.id, o]));

  // Pull a generous slice of invoices and filter in-process. The volume in this
  // deployment is small; if it grows we can swap to per-FY filtered queries.
  const { rows: invoices } = await listInvoices({ pageSize: 200, page: 1 });

  const yearStart = startOfYear(year);
  const yearEnd = endOfYear(year);
  const today = todayIso();

  let billed = 0, collected = 0, outstanding = 0, pastDue = 0, writeOffs = 0;
  const counts = { billed: 0, collected: 0, outstanding: 0, pastDue: 0, writeOffs: 0 };

  const monthly: { month: string; billed: number; collected: number }[] = [];
  for (let m = 1; m <= 12; m++) {
    monthly.push({ month: `${year}-${String(m).padStart(2, '0')}`, billed: 0, collected: 0 });
  }
  const monthIdx = new Map(monthly.map((m, i) => [m.month, i]));

  const byTypeMap = new Map<string, { billed: number; collected: number }>();
  const byOrgMap = new Map<string, number>();

  for (const inv of invoices) {
    const issuedInYear = inv.date_issued >= yearStart && inv.date_issued <= yearEnd;
    const paidInYear = inv.date_paid && inv.date_paid >= yearStart && inv.date_paid <= yearEnd;
    const org = orgsById.get(inv.org_id);

    if (issuedInYear) {
      if (inv.status === 'Cancelled' || inv.status === 'Refunded') {
        writeOffs += inv.amount;
        counts.writeOffs++;
      } else {
        billed += inv.amount;
        counts.billed++;
        const idx = monthIdx.get(monthKey(inv.date_issued));
        if (idx !== undefined) monthly[idx].billed += inv.amount;
        if (org) {
          const t = byTypeMap.get(org.org_type) ?? { billed: 0, collected: 0 };
          t.billed += inv.amount;
          byTypeMap.set(org.org_type, t);
        }
        if (inv.status !== 'Paid') {
          outstanding += inv.amount;
          counts.outstanding++;
          if (inv.status === 'Past Due' || inv.date_due < today) {
            pastDue += inv.amount;
            counts.pastDue++;
          }
        }
      }
    }

    // Cash collected during the FY — counts even if invoice issued in a prior year.
    if (paidInYear && inv.status === 'Paid') {
      collected += inv.amount;
      counts.collected++;
      const idx = monthIdx.get(monthKey(inv.date_paid!));
      if (idx !== undefined) monthly[idx].collected += inv.amount;
      if (org) {
        const t = byTypeMap.get(org.org_type) ?? { billed: 0, collected: 0 };
        t.collected += inv.amount;
        byTypeMap.set(org.org_type, t);
        byOrgMap.set(org.id, (byOrgMap.get(org.id) ?? 0) + inv.amount);
      }
    }
  }

  const byOrgType = [...byTypeMap.entries()]
    .map(([org_type, v]) => ({ org_type, ...v }))
    .sort((a, b) => b.collected - a.collected);

  const topPayers = [...byOrgMap.entries()]
    .map(([org_id, amount]) => {
      const org = orgsById.get(org_id);
      return {
        org_id,
        org_name: org?.org_name ?? org_id,
        org_type: org?.org_type ?? '—',
        amount,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  let newMembers = 0, renewingMembers = 0, lapsedMembers = 0;
  for (const o of orgs) {
    const lapsed = o.status === 'Lapsed' || o.status === 'Cancelled' || o.status === 'Suspended';
    if (lapsed) lapsedMembers++;
    else if (o.join_date >= yearStart && o.join_date <= yearEnd) newMembers++;
    else if (o.join_date < yearStart) renewingMembers++;
  }

  return {
    fiscal_year: year,
    billed, collected, outstanding, pastDue, writeOffs,
    invoiceCount: counts,
    monthly, byOrgType, topPayers,
    newMembers, renewingMembers, lapsedMembers,
  };
}

export async function getFinanceStats(): Promise<FinanceStats> {
  // Pull all (active-status) invoices: Pending/Sent/Paid/Past Due
  const { rows: invoices } = await listInvoices({ pageSize: 200, page: 1 });
  const orgs = await getOrganizations();
  const orgsById = new Map(orgs.map((o) => [o.id, o]));

  const today = todayIso();

  let billed = 0, collected = 0, outstanding = 0, pastDue = 0;
  const aging: FinanceStats['aging'] = { current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d91_plus: 0 };

  // Last 12 months bucket scaffold
  const months: { month: string; amount: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ month: key, amount: 0 });
  }
  const monthIdx = new Map(months.map((m, i) => [m.month, i]));

  const byTypeMap = new Map<string, number>();
  const byOrgMap = new Map<string, number>();

  for (const inv of invoices) {
    const isCancelled = inv.status === 'Cancelled' || inv.status === 'Refunded';
    if (isCancelled) continue;

    billed += inv.amount;

    if (inv.status === 'Paid') {
      collected += inv.amount;
      // Monthly cash collected — bucket by date_paid (fall back to date_issued)
      const paidKey = inv.date_paid ? monthKey(inv.date_paid) : monthKey(inv.date_issued);
      const idx = monthIdx.get(paidKey);
      if (idx !== undefined) months[idx].amount += inv.amount;

      const org = orgsById.get(inv.org_id);
      if (org) {
        byTypeMap.set(org.org_type, (byTypeMap.get(org.org_type) ?? 0) + inv.amount);
        byOrgMap.set(org.id, (byOrgMap.get(org.id) ?? 0) + inv.amount);
      }
    } else {
      outstanding += inv.amount;
      const bucket = pastDueBucket(inv.date_due, today);
      aging[bucket] += inv.amount;
      if (bucket !== 'current') pastDue += inv.amount;
    }
  }

  const byOrgType = [...byTypeMap.entries()]
    .map(([org_type, amount]) => ({ org_type, amount }))
    .sort((a, b) => b.amount - a.amount);

  const topPayers = [...byOrgMap.entries()]
    .map(([org_id, amount]) => {
      const org = orgsById.get(org_id);
      return { org_id, org_name: org?.org_name ?? org_id, amount };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return { billed, collected, outstanding, pastDue, aging, monthlyCash: months, byOrgType, topPayers };
}

/**
 * Generates Pending invoices for every active org with a renewal_date in
 * [from, to] that does NOT already have an invoice for that fiscal year.
 * Requires Supabase. Idempotent within a fiscal year.
 */
export async function generateInvoices(from: string, to: string): Promise<GenerateInvoicesResult> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured — cannot generate invoices');
  }

  const { rows: orgs } = await listOrganizations({
    renewal_from: from,
    renewal_to: to,
    status: 'Active',
    pageSize: 200,
  });

  const fiscalYear = yearOf(to);
  const { data: existing } = await supabase
    .from('memtrak_invoices')
    .select('org_id, fiscal_year')
    .eq('fiscal_year', fiscalYear);
  const taken = new Set((existing ?? []).map((r: { org_id: string }) => r.org_id));

  const candidates = orgs.filter((o) => !taken.has(o.id));
  if (!candidates.length) {
    return { generated: 0, skipped: orgs.length - candidates.length, invoices: [] };
  }

  const issued = todayIso();
  const payload = candidates.map((o, i) => ({
    org_id: o.id,
    invoice_number: `INV-${fiscalYear}-${String(Date.now()).slice(-4)}-${String(i + 1).padStart(3, '0')}`,
    amount: o.annual_dues,
    description: `${fiscalYear} Annual Dues — ${o.org_type}`,
    date_issued: issued,
    date_due: o.renewal_date,
    status: 'Pending' as InvoiceStatus,
    fiscal_year: fiscalYear,
  }));

  const { data, error } = await supabase.from('memtrak_invoices').insert(payload).select();
  if (error) throw new Error(error.message);
  return { generated: data?.length ?? 0, skipped: orgs.length - candidates.length, invoices: data ?? [] };
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
