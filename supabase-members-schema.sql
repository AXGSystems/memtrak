-- ============================================================
-- MEMTrak Member Database Schema
-- Extends existing memtrak_events/campaigns/suppression tables
-- with full AMS member management capabilities
-- ============================================================

-- Organizations (member companies)
CREATE TABLE IF NOT EXISTS memtrak_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name TEXT NOT NULL,
  org_type TEXT NOT NULL CHECK (org_type IN ('ACU', 'ACA', 'ACB', 'REA', 'Associate', 'Affiliate', 'Government', 'Honorary')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Suspended', 'Lapsed', 'Cancelled', 'Honorary')),
  member_id TEXT UNIQUE, -- ALTA member ID (e.g., "ALTA-2024-0001")
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  renewal_date DATE,
  annual_dues NUMERIC(10,2) DEFAULT 0,
  dues_status TEXT DEFAULT 'Current' CHECK (dues_status IN ('Current', 'Due', 'Past Due', 'Exempt', 'Cancelled')),
  tier TEXT DEFAULT 'Standard' CHECK (tier IN ('Standard', 'Premium', 'Enterprise', 'Founding', 'Honorary')),
  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  -- Contact info
  phone TEXT,
  website TEXT,
  -- Engagement (updated by MEMTrak intelligence)
  engagement_score INTEGER DEFAULT 50 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  churn_risk INTEGER DEFAULT 0 CHECK (churn_risk >= 0 AND churn_risk <= 100),
  decay_score INTEGER DEFAULT 0 CHECK (decay_score >= 0 AND decay_score <= 100),
  health_tier TEXT DEFAULT 'Engaged' CHECK (health_tier IN ('Champion', 'Engaged', 'At Risk', 'Disengaged', 'Gone Dark')),
  -- Revenue tracking
  lifetime_revenue NUMERIC(12,2) DEFAULT 0,
  last_payment_date DATE,
  -- Metadata
  notes TEXT,
  tags TEXT[], -- flexible tagging
  source TEXT DEFAULT 'manual', -- 'manual', 'import', 'remembers_sync', 'alta_connect'
  remembers_id TEXT, -- ID in re:Members for sync
  alta_connect_id TEXT, -- ID in ALTA Connect for event sync
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts (people within organizations)
CREATE TABLE IF NOT EXISTS memtrak_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES memtrak_organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  title TEXT,
  role TEXT DEFAULT 'Member' CHECK (role IN ('Primary', 'Billing', 'Executive', 'Board', 'Committee', 'Member', 'Staff')),
  phone TEXT,
  mobile TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  -- Communication preferences
  email_opted_in BOOLEAN DEFAULT true,
  preferred_channel TEXT DEFAULT 'email' CHECK (preferred_channel IN ('email', 'phone', 'mail', 'text')),
  preferred_frequency TEXT DEFAULT 'normal' CHECK (preferred_frequency IN ('minimal', 'normal', 'frequent')),
  -- Engagement (per-contact)
  last_email_open TIMESTAMPTZ,
  last_email_click TIMESTAMPTZ,
  last_outreach TIMESTAMPTZ,
  total_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  -- Sync references
  remembers_contact_id TEXT,
  alta_connect_contact_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dues & Invoices
CREATE TABLE IF NOT EXISTS memtrak_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES memtrak_organizations(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  date_issued DATE NOT NULL DEFAULT CURRENT_DATE,
  date_due DATE NOT NULL,
  date_paid DATE,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sent', 'Paid', 'Past Due', 'Cancelled', 'Refunded')),
  payment_method TEXT,
  payment_reference TEXT, -- Stripe charge ID, check number, etc.
  fiscal_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Committees & Groups
CREATE TABLE IF NOT EXISTS memtrak_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  group_type TEXT NOT NULL CHECK (group_type IN ('Committee', 'Board', 'Task Force', 'Section', 'Working Group', 'Interest Group')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  chair_contact_id UUID REFERENCES memtrak_contacts(id),
  staff_liaison TEXT, -- ALTA staff name
  meeting_frequency TEXT, -- 'monthly', 'quarterly', 'annual', 'as-needed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memtrak_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES memtrak_groups(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES memtrak_contacts(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Member' CHECK (role IN ('Chair', 'Vice Chair', 'Secretary', 'Member', 'Liaison', 'Observer')),
  joined_date DATE DEFAULT CURRENT_DATE,
  term_end DATE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(group_id, contact_id)
);

-- ALTA Connect Event Integration
-- Events live in ALTA Connect; this table stores the sync reference + attendance
CREATE TABLE IF NOT EXISTS memtrak_event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alta_connect_event_id TEXT NOT NULL, -- ID from ALTA Connect
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT CHECK (event_type IN ('Conference', 'Webinar', 'Workshop', 'Committee Meeting', 'Board Meeting', 'Social', 'Training')),
  contact_id UUID REFERENCES memtrak_contacts(id) ON DELETE CASCADE,
  org_id UUID REFERENCES memtrak_organizations(id) ON DELETE CASCADE,
  registration_status TEXT DEFAULT 'Registered' CHECK (registration_status IN ('Registered', 'Attended', 'No Show', 'Cancelled')),
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  check_in_time TIMESTAMPTZ,
  -- Revenue
  registration_fee NUMERIC(10,2) DEFAULT 0,
  paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication Log (replaces demo arrays)
CREATE TABLE IF NOT EXISTS memtrak_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES memtrak_organizations(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES memtrak_contacts(id) ON DELETE SET NULL,
  staff_name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('Email', 'Phone', 'Meeting', 'Mail', 'Text', 'Event')),
  direction TEXT DEFAULT 'Outbound' CHECK (direction IN ('Inbound', 'Outbound')),
  subject TEXT,
  body TEXT,
  outcome TEXT CHECK (outcome IN ('Reply Received', 'Action Taken', 'Bounced', 'Meeting Scheduled', 'Not Interested', 'Sent — No Reply', 'Voicemail', 'Connected')),
  campaign_id TEXT, -- links to memtrak_campaigns if from a campaign
  sentiment TEXT CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff relationship scores (replaces demoRelationships)
CREATE TABLE IF NOT EXISTS memtrak_staff_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_name TEXT NOT NULL,
  org_id UUID REFERENCES memtrak_organizations(id) ON DELETE CASCADE,
  relationship_strength TEXT DEFAULT 'Moderate' CHECK (relationship_strength IN ('Exceptional', 'Strong', 'Moderate', 'Weak', 'New')),
  outreach_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  avg_response_hours NUMERIC(6,1) DEFAULT 0,
  last_interaction TIMESTAMPTZ,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orgs_status ON memtrak_organizations(status);
CREATE INDEX IF NOT EXISTS idx_orgs_type ON memtrak_organizations(org_type);
CREATE INDEX IF NOT EXISTS idx_orgs_renewal ON memtrak_organizations(renewal_date);
CREATE INDEX IF NOT EXISTS idx_orgs_health ON memtrak_organizations(health_tier);
CREATE INDEX IF NOT EXISTS idx_orgs_churn ON memtrak_organizations(churn_risk DESC);
CREATE INDEX IF NOT EXISTS idx_orgs_remembers ON memtrak_organizations(remembers_id);
CREATE INDEX IF NOT EXISTS idx_orgs_altaconnect ON memtrak_organizations(alta_connect_id);

CREATE INDEX IF NOT EXISTS idx_contacts_org ON memtrak_contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON memtrak_contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_remembers ON memtrak_contacts(remembers_contact_id);

CREATE INDEX IF NOT EXISTS idx_invoices_org ON memtrak_invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON memtrak_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON memtrak_invoices(date_due);

CREATE INDEX IF NOT EXISTS idx_attendance_event ON memtrak_event_attendance(alta_connect_event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_contact ON memtrak_event_attendance(contact_id);
CREATE INDEX IF NOT EXISTS idx_attendance_org ON memtrak_event_attendance(org_id);

CREATE INDEX IF NOT EXISTS idx_comms_org ON memtrak_communications(org_id);
CREATE INDEX IF NOT EXISTS idx_comms_contact ON memtrak_communications(contact_id);
CREATE INDEX IF NOT EXISTS idx_comms_staff ON memtrak_communications(staff_name);
CREATE INDEX IF NOT EXISTS idx_comms_date ON memtrak_communications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_staff_rel_org ON memtrak_staff_relationships(org_id);
CREATE INDEX IF NOT EXISTS idx_staff_rel_staff ON memtrak_staff_relationships(staff_name);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE memtrak_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE memtrak_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE memtrak_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE memtrak_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE memtrak_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE memtrak_event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE memtrak_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE memtrak_staff_relationships ENABLE ROW LEVEL SECURITY;

-- Permissive policies for authenticated users (tighten for production)
CREATE POLICY "Authenticated read" ON memtrak_organizations FOR SELECT USING (true);
CREATE POLICY "Authenticated write" ON memtrak_organizations FOR ALL USING (true);
CREATE POLICY "Authenticated read" ON memtrak_contacts FOR SELECT USING (true);
CREATE POLICY "Authenticated write" ON memtrak_contacts FOR ALL USING (true);
CREATE POLICY "Authenticated read" ON memtrak_invoices FOR SELECT USING (true);
CREATE POLICY "Authenticated write" ON memtrak_invoices FOR ALL USING (true);
CREATE POLICY "Authenticated read" ON memtrak_groups FOR SELECT USING (true);
CREATE POLICY "Authenticated write" ON memtrak_groups FOR ALL USING (true);
CREATE POLICY "Authenticated read" ON memtrak_group_members FOR SELECT USING (true);
CREATE POLICY "Authenticated write" ON memtrak_group_members FOR ALL USING (true);
CREATE POLICY "Authenticated read" ON memtrak_event_attendance FOR SELECT USING (true);
CREATE POLICY "Authenticated write" ON memtrak_event_attendance FOR ALL USING (true);
CREATE POLICY "Authenticated read" ON memtrak_communications FOR SELECT USING (true);
CREATE POLICY "Authenticated write" ON memtrak_communications FOR ALL USING (true);
CREATE POLICY "Authenticated read" ON memtrak_staff_relationships FOR SELECT USING (true);
CREATE POLICY "Authenticated write" ON memtrak_staff_relationships FOR ALL USING (true);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_orgs BEFORE UPDATE ON memtrak_organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_contacts BEFORE UPDATE ON memtrak_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_staff_rel BEFORE UPDATE ON memtrak_staff_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at();
