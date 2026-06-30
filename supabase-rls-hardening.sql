-- ============================================================
-- MEMTrak RLS HARDENING (run AFTER the base schemas)
-- ============================================================
-- Replaces the decorative `USING (true)` policies that let anyone holding
-- the browser-exposed anon key read/write member PII, invoices, financials,
-- and the audit log directly against the Supabase REST endpoint.
--
-- New posture (fail-closed):
--   • The anon role gets NO access to any memtrak_* member table.
--   • All member-data reads/writes flow through server-only API routes that
--     use the service-role key (which bypasses RLS) — see lib/supabase-admin.ts.
--   • RLS stays ENABLED so that even if a permissive policy is ever
--     re-introduced by mistake, the default remains deny.
--
-- This is idempotent: dropping a missing policy is guarded, and REVOKE is safe
-- to re-run. Run it in the Supabase SQL editor.
-- ============================================================

-- ── Drop the old permissive policies (core schema) ──────────────────
DROP POLICY IF EXISTS "Allow all for anon" ON memtrak_events;
DROP POLICY IF EXISTS "Allow all for anon" ON memtrak_suppression;
DROP POLICY IF EXISTS "Allow all for anon" ON memtrak_campaigns;
DROP POLICY IF EXISTS "Allow all for anon" ON memtrak_audit_log;

-- ── Drop the old permissive policies (member schema) ────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'memtrak_organizations','memtrak_contacts','memtrak_invoices',
    'memtrak_groups','memtrak_group_members','memtrak_event_attendance',
    'memtrak_communications','memtrak_staff_relationships'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated read"  ON %I;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated write" ON %I;', t);
  END LOOP;
END $$;

-- ── Ensure RLS is enabled and anon is fully revoked everywhere ──────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'memtrak_events','memtrak_suppression','memtrak_campaigns','memtrak_audit_log',
    'memtrak_organizations','memtrak_contacts','memtrak_invoices',
    'memtrak_groups','memtrak_group_members','memtrak_event_attendance',
    'memtrak_communications','memtrak_staff_relationships'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
    -- No GRANTs and no permissive policy => anon is denied by default.
    EXECUTE format('REVOKE ALL ON %I FROM anon;', t);
    -- Belt-and-suspenders: also revoke from the authenticated role since the
    -- app does not log users into Supabase directly (NextAuth issues its own
    -- JWTs); the server uses the service-role key which is exempt from RLS.
    EXECUTE format('REVOKE ALL ON %I FROM authenticated;', t);
  END LOOP;
END $$;

-- NOTE: the memtrak_api_keys table (created elsewhere) must likewise be
-- service-role-only — never expose key_hash to anon/authenticated.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_name = 'memtrak_api_keys') THEN
    EXECUTE 'ALTER TABLE memtrak_api_keys ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON memtrak_api_keys FROM anon';
    EXECUTE 'REVOKE ALL ON memtrak_api_keys FROM authenticated';
  END IF;
END $$;
