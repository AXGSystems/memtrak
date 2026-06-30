-- ============================================================
-- MEMTrak Seed Data — Realistic ALTA Member Organizations
-- Run AFTER supabase-members-schema.sql
-- ============================================================

-- ── Organizations (50 ALTA member companies) ──────────────
INSERT INTO memtrak_organizations (org_name, org_type, status, member_id, join_date, renewal_date, annual_dues, dues_status, tier, city, state, engagement_score, trust_score, churn_risk, decay_score, health_tier, lifetime_revenue, last_payment_date, tags, source) VALUES
-- ACU Underwriters (highest dues tier)
('First American Title Insurance', 'ACU', 'Active', 'ALTA-2001-0001', '2001-03-15', '2026-10-01', 61554.00, 'Current', 'Enterprise', 'Santa Ana', 'CA', 35, 42, 75, 75, 'At Risk', 1477296.00, '2025-10-01', ARRAY['underwriter', 'board-rep', 'convention-sponsor'], 'remembers_sync'),
('Old Republic National Title', 'ACU', 'Active', 'ALTA-1999-0002', '1999-06-01', '2026-10-01', 61554.00, 'Current', 'Enterprise', 'Tampa', 'FL', 28, 35, 82, 85, 'Disengaged', 1600404.00, '2025-10-01', ARRAY['underwriter', 'declining'], 'remembers_sync'),
('Stewart Information Services', 'ACU', 'Active', 'ALTA-2003-0003', '2003-01-10', '2026-10-01', 61554.00, 'Current', 'Enterprise', 'Houston', 'TX', 72, 78, 25, 18, 'Engaged', 1415742.00, '2025-10-01', ARRAY['underwriter', 'alta-one-sponsor'], 'remembers_sync'),
('Fidelity National Financial', 'ACU', 'Active', 'ALTA-1998-0004', '1998-08-22', '2026-10-01', 61554.00, 'Current', 'Enterprise', 'Jacksonville', 'FL', 88, 92, 10, 5, 'Champion', 1723512.00, '2025-10-01', ARRAY['underwriter', 'board-member', 'tipac-contributor'], 'remembers_sync'),
('WFG National Title Insurance', 'ACU', 'Active', 'ALTA-2010-0005', '2010-02-14', '2026-10-01', 61554.00, 'Current', 'Enterprise', 'Portland', 'OR', 65, 70, 35, 28, 'Engaged', 984864.00, '2025-10-01', ARRAY['underwriter'], 'remembers_sync'),

-- ACA Abstracters
('Heritage Abstract Company', 'ACA', 'Active', 'ALTA-2015-0010', '2015-04-01', '2026-10-01', 517.00, 'Current', 'Standard', 'Oklahoma City', 'OK', 15, 20, 90, 100, 'Gone Dark', 3619.00, '2025-10-01', ARRAY['abstracter', 'high-churn-risk'], 'remembers_sync'),
('National Title Research', 'ACA', 'Active', 'ALTA-2018-0011', '2018-07-15', '2026-10-01', 517.00, 'Current', 'Standard', 'Denver', 'CO', 55, 60, 45, 40, 'At Risk', 2585.00, '2025-10-01', ARRAY['abstracter'], 'remembers_sync'),
('Accurate Title Research', 'ACA', 'Active', 'ALTA-2012-0012', '2012-11-20', '2026-10-01', 517.00, 'Current', 'Standard', 'Phoenix', 'AZ', 78, 82, 15, 10, 'Engaged', 6721.00, '2025-10-01', ARRAY['abstracter', 'committee-member'], 'remembers_sync'),
('Pioneer Abstract & Title', 'ACA', 'Active', 'ALTA-2020-0013', '2020-01-08', '2026-10-01', 517.00, 'Current', 'Standard', 'Boise', 'ID', 92, 88, 5, 2, 'Champion', 3102.00, '2025-10-01', ARRAY['abstracter', 'new-member-mentor'], 'remembers_sync'),
('Cornerstone Title Services', 'ACA', 'Active', 'ALTA-2016-0014', '2016-09-30', '2026-10-01', 517.00, 'Current', 'Standard', 'Nashville', 'TN', 42, 48, 55, 52, 'At Risk', 4653.00, '2025-10-01', ARRAY['abstracter'], 'remembers_sync'),

-- ACB Title Agents
('Chicago Title Insurance', 'ACB', 'Active', 'ALTA-2005-0020', '2005-05-18', '2026-10-01', 2450.00, 'Current', 'Premium', 'Chicago', 'IL', 82, 85, 12, 8, 'Champion', 51450.00, '2025-10-01', ARRAY['agent', 'alta-one-attendee', 'pac-contributor'], 'remembers_sync'),
('Commonwealth Land Title', 'ACB', 'Active', 'ALTA-2007-0021', '2007-03-22', '2026-10-01', 2450.00, 'Current', 'Premium', 'Philadelphia', 'PA', 68, 72, 30, 22, 'Engaged', 46550.00, '2025-10-01', ARRAY['agent', 'convention-attendee'], 'remembers_sync'),
('North American Title', 'ACB', 'Active', 'ALTA-2011-0022', '2011-08-05', '2026-10-01', 2450.00, 'Current', 'Premium', 'Miami', 'FL', 45, 50, 52, 48, 'At Risk', 36750.00, '2025-10-01', ARRAY['agent'], 'remembers_sync'),
('Westcor Land Title Insurance', 'ACB', 'Active', 'ALTA-2009-0023', '2009-12-14', '2026-10-01', 2450.00, 'Current', 'Premium', 'Maitland', 'FL', 90, 95, 5, 2, 'Champion', 41650.00, '2025-10-01', ARRAY['agent', 'board-member', 'tipac-leader'], 'remembers_sync'),
('Investors Title Insurance', 'ACB', 'Active', 'ALTA-2014-0024', '2014-06-20', '2026-10-01', 2450.00, 'Current', 'Premium', 'Chapel Hill', 'NC', 58, 62, 40, 35, 'At Risk', 29400.00, '2025-10-01', ARRAY['agent'], 'remembers_sync'),
('Alliant National Title', 'ACB', 'Active', 'ALTA-2013-0025', '2013-02-28', '2026-10-01', 2450.00, 'Current', 'Premium', 'Longmont', 'CO', 75, 80, 20, 15, 'Engaged', 31850.00, '2025-10-01', ARRAY['agent', 'webinar-attendee'], 'remembers_sync'),
('Title Resources Guaranty', 'ACB', 'Active', 'ALTA-2017-0026', '2017-10-10', '2026-10-01', 2450.00, 'Current', 'Standard', 'Dallas', 'TX', 62, 65, 35, 30, 'Engaged', 22050.00, '2025-10-01', ARRAY['agent'], 'remembers_sync'),
('Conestoga Title Insurance', 'ACB', 'Active', 'ALTA-2019-0027', '2019-04-15', '2026-10-01', 2450.00, 'Current', 'Standard', 'Lancaster', 'PA', 85, 88, 8, 5, 'Champion', 17150.00, '2025-10-01', ARRAY['agent', 'committee-chair'], 'remembers_sync'),

-- REA Real Estate Attorneys
('Kettler & Associates', 'REA', 'Active', 'ALTA-2016-0030', '2016-05-01', '2026-10-01', 850.00, 'Current', 'Standard', 'Washington', 'DC', 70, 75, 28, 20, 'Engaged', 8500.00, '2025-10-01', ARRAY['attorney', 'legislative-contact'], 'remembers_sync'),
('Sullivan & Cromwell Title', 'REA', 'Active', 'ALTA-2020-0031', '2020-09-12', '2026-10-01', 850.00, 'Current', 'Standard', 'New York', 'NY', 48, 55, 50, 45, 'At Risk', 5100.00, '2025-10-01', ARRAY['attorney'], 'remembers_sync'),
('Henderson Title Law', 'REA', 'Active', 'ALTA-2018-0032', '2018-03-20', '2026-10-01', 850.00, 'Current', 'Standard', 'Atlanta', 'GA', 92, 90, 5, 3, 'Champion', 6800.00, '2025-10-01', ARRAY['attorney', 'speaker', 'tipac'], 'remembers_sync'),
('Blackwell Real Estate Law', 'REA', 'Active', 'ALTA-2021-0033', '2021-01-05', '2026-10-01', 850.00, 'Current', 'Standard', 'Austin', 'TX', 35, 40, 65, 60, 'Disengaged', 4250.00, '2025-10-01', ARRAY['attorney'], 'remembers_sync'),
('Pacific Coast Title Law', 'REA', 'Active', 'ALTA-2022-0034', '2022-06-18', '2026-10-01', 850.00, 'Current', 'Standard', 'San Diego', 'CA', 80, 82, 15, 10, 'Engaged', 3400.00, '2025-10-01', ARRAY['attorney', 'new-member'], 'remembers_sync'),

-- Associates (vendors, tech providers)
('Qualia Holdings', 'Associate', 'Active', 'ALTA-2019-0040', '2019-08-01', '2026-10-01', 1200.00, 'Current', 'Premium', 'Austin', 'TX', 95, 92, 3, 1, 'Champion', 8400.00, '2025-10-01', ARRAY['technology', 'sponsor', 'alta-one-exhibitor'], 'remembers_sync'),
('SoftPro', 'Associate', 'Active', 'ALTA-2008-0041', '2008-04-15', '2026-10-01', 1200.00, 'Current', 'Premium', 'Raleigh', 'NC', 78, 80, 18, 12, 'Engaged', 21600.00, '2025-10-01', ARRAY['technology', 'convention-sponsor'], 'remembers_sync'),
('RamQuest', 'Associate', 'Active', 'ALTA-2010-0042', '2010-11-22', '2026-10-01', 1200.00, 'Current', 'Standard', 'Plano', 'TX', 55, 60, 42, 38, 'At Risk', 19200.00, '2025-10-01', ARRAY['technology'], 'remembers_sync'),
('Notarize', 'Associate', 'Active', 'ALTA-2021-0043', '2021-03-10', '2026-10-01', 1200.00, 'Current', 'Standard', 'Boston', 'MA', 88, 85, 8, 5, 'Champion', 6000.00, '2025-10-01', ARRAY['technology', 'ron-provider'], 'remembers_sync'),
('PropLogix', 'Associate', 'Active', 'ALTA-2020-0044', '2020-07-20', '2026-10-01', 1200.00, 'Current', 'Standard', 'Sarasota', 'FL', 62, 65, 35, 30, 'Engaged', 7200.00, '2025-10-01', ARRAY['technology', 'search-provider'], 'remembers_sync'),

-- More ACB agents (filling out to 50)
('Doma Title Insurance', 'ACB', 'Active', 'ALTA-2021-0050', '2021-02-01', '2026-10-01', 2450.00, 'Current', 'Standard', 'San Francisco', 'CA', 72, 75, 25, 20, 'Engaged', 12250.00, '2025-10-01', ARRAY['agent', 'fintech'], 'remembers_sync'),
('States Title', 'ACB', 'Active', 'ALTA-2020-0051', '2020-05-15', '2026-10-01', 2450.00, 'Current', 'Standard', 'San Francisco', 'CA', 60, 65, 38, 32, 'At Risk', 14700.00, '2025-10-01', ARRAY['agent', 'ai-title'], 'remembers_sync'),
('Amrock Title', 'ACB', 'Active', 'ALTA-2015-0052', '2015-09-01', '2026-10-01', 2450.00, 'Current', 'Premium', 'Detroit', 'MI', 50, 55, 48, 42, 'At Risk', 26950.00, '2025-10-01', ARRAY['agent', 'rocket-companies'], 'remembers_sync'),
('ServiceLink', 'ACB', 'Active', 'ALTA-2012-0053', '2012-04-20', '2026-10-01', 2450.00, 'Current', 'Premium', 'Pittsburgh', 'PA', 82, 85, 12, 8, 'Champion', 34300.00, '2025-10-01', ARRAY['agent', 'servicer'], 'remembers_sync'),
('WillowBend Title', 'ACB', 'Active', 'ALTA-2018-0054', '2018-11-10', '2026-10-01', 2450.00, 'Current', 'Standard', 'Plano', 'TX', 68, 72, 30, 25, 'Engaged', 19600.00, '2025-10-01', ARRAY['agent', 'texas'], 'remembers_sync'),
('Agents National Title', 'ACB', 'Active', 'ALTA-2006-0055', '2006-07-30', '2026-10-01', 2450.00, 'Current', 'Standard', 'Columbia', 'MO', 75, 78, 22, 18, 'Engaged', 49000.00, '2025-10-01', ARRAY['agent', 'independent'], 'remembers_sync'),
('Knight Barry Title', 'ACB', 'Active', 'ALTA-2014-0056', '2014-01-15', '2026-10-01', 2450.00, 'Current', 'Standard', 'Milwaukee', 'WI', 42, 48, 55, 50, 'At Risk', 29400.00, '2025-10-01', ARRAY['agent', 'midwest'], 'remembers_sync'),
('Thoroughbred Title Services', 'ACB', 'Active', 'ALTA-2019-0057', '2019-06-25', '2026-10-01', 2450.00, 'Current', 'Standard', 'Louisville', 'KY', 88, 90, 6, 3, 'Champion', 17150.00, '2025-10-01', ARRAY['agent', 'kentucky'], 'remembers_sync'),

-- Additional members
('Land Title Guarantee', 'ACB', 'Active', 'ALTA-2004-0060', '2004-03-01', '2026-10-01', 2450.00, 'Current', 'Premium', 'Denver', 'CO', 85, 88, 10, 5, 'Champion', 53900.00, '2025-10-01', ARRAY['agent', 'colorado-leader'], 'remembers_sync'),
('Security Title Agency', 'ACB', 'Active', 'ALTA-2011-0061', '2011-10-15', '2026-10-01', 2450.00, 'Current', 'Standard', 'Phoenix', 'AZ', 55, 60, 42, 38, 'At Risk', 36750.00, '2025-10-01', ARRAY['agent', 'arizona'], 'remembers_sync'),
('Landmark Title Assurance', 'ACA', 'Active', 'ALTA-2017-0062', '2017-02-20', '2026-10-01', 517.00, 'Current', 'Standard', 'Salt Lake City', 'UT', 70, 75, 28, 22, 'Engaged', 4653.00, '2025-10-01', ARRAY['abstracter', 'utah'], 'remembers_sync'),
('Republic Title of Texas', 'ACB', 'Active', 'ALTA-2008-0063', '2008-08-12', '2026-10-01', 2450.00, 'Current', 'Premium', 'Dallas', 'TX', 78, 82, 18, 12, 'Engaged', 44100.00, '2025-10-01', ARRAY['agent', 'texas', 'pac-contributor'], 'remembers_sync'),
('National Western Title', 'ACB', 'Active', 'ALTA-2013-0064', '2013-05-05', '2026-10-01', 2450.00, 'Current', 'Standard', 'Portland', 'OR', 40, 45, 58, 55, 'Disengaged', 31850.00, '2025-10-01', ARRAY['agent', 'pacific-nw'], 'remembers_sync'),
('TitleOne Corporation', 'ACB', 'Active', 'ALTA-2016-0065', '2016-12-01', '2026-10-01', 2450.00, 'Current', 'Standard', 'Boise', 'ID', 90, 92, 5, 2, 'Champion', 24500.00, '2025-10-01', ARRAY['agent', 'idaho', 'innovation'], 'remembers_sync'),

-- Lapsed / Suspended members
('Pacific Title Group', 'ACB', 'Lapsed', 'ALTA-2010-0070', '2010-06-15', '2025-10-01', 2450.00, 'Past Due', 'Standard', 'Los Angeles', 'CA', 8, 12, 95, 98, 'Gone Dark', 36750.00, '2024-10-01', ARRAY['agent', 'lapsed', 'recovery-target'], 'remembers_sync'),
('Founders Title Group', 'ACA', 'Lapsed', 'ALTA-2019-0071', '2019-03-10', '2025-10-01', 517.00, 'Past Due', 'Standard', 'Richmond', 'VA', 5, 8, 98, 100, 'Gone Dark', 3102.00, '2024-10-01', ARRAY['abstracter', 'lapsed'], 'remembers_sync'),
('Meridian Title Company', 'ACB', 'Suspended', 'ALTA-2015-0072', '2015-07-22', '2025-10-01', 2450.00, 'Cancelled', 'Standard', 'Indianapolis', 'IN', 0, 5, 100, 100, 'Gone Dark', 24500.00, '2023-10-01', ARRAY['agent', 'suspended', 'non-payment'], 'remembers_sync'),

-- New members (2026)
('ClearTitle AI', 'Associate', 'Active', 'ALTA-2026-0080', '2026-01-15', '2027-01-15', 1200.00, 'Current', 'Standard', 'Austin', 'TX', 95, 90, 2, 0, 'Champion', 1200.00, '2026-01-15', ARRAY['technology', 'ai', 'new-member-2026'], 'manual'),
('NextGen Title Solutions', 'ACB', 'Active', 'ALTA-2026-0081', '2026-02-01', '2027-02-01', 2450.00, 'Current', 'Standard', 'Charlotte', 'NC', 85, 80, 8, 3, 'Champion', 2450.00, '2026-02-01', ARRAY['agent', 'new-member-2026'], 'manual'),
('TrueVault Title', 'ACB', 'Active', 'ALTA-2026-0082', '2026-03-10', '2027-03-10', 2450.00, 'Current', 'Standard', 'Seattle', 'WA', 78, 75, 12, 5, 'Engaged', 2450.00, '2026-03-10', ARRAY['agent', 'new-member-2026', 'digital-closing'], 'manual');
