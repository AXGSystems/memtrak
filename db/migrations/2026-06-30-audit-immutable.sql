-- ============================================================
-- Audit log immutability — tamper-RESISTANT, not just tamper-evident
-- SOC2 CC7.2 / CC7.3, ISO/IEC 27001 A.8.15 (logging)
-- ============================================================
--
-- The application already chains every audit row with a SHA-256 hash so any
-- after-the-fact edit is *detectable* (tamper-evident). This migration makes
-- the table append-only at the DATABASE layer so an edit is *prevented*
-- (tamper-resistant) — including via the single service-role key that also
-- writes member data. That removes the separation-of-duties gap where the
-- same key that mutates records could silently rewrite its own history.
--
-- Effect:
--   • UPDATE and DELETE on memtrak_audit_log are blocked for ALL roles
--     (service_role included) by a BEFORE trigger that raises an exception.
--   • INSERT remains allowed (the trail must keep growing).
--   • The grant-level REVOKE is belt-and-suspenders so a future role can't
--     mutate rows even if the trigger were ever dropped.
--
-- Idempotent: safe to run more than once.

-- 1) Hard REVOKE of UPDATE/DELETE from every grantee, including service_role.
--    (anon/authenticated already have ALL revoked by the base hardening, but
--    we re-assert the destructive grants here explicitly and for service_role.)
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'revoke update, delete on memtrak_audit_log from service_role';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke update, delete on memtrak_audit_log from authenticated';
  end if;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke update, delete on memtrak_audit_log from anon';
  end if;
end$$;

-- 2) Append-only guard. Even a superuser/owner write goes through this trigger;
--    only a deliberate DISABLE TRIGGER + privileged session can bypass it,
--    which is itself an auditable, out-of-band action.
create or replace function memtrak_audit_log_append_only()
returns trigger
language plpgsql
as $$
begin
  raise exception
    'memtrak_audit_log is append-only; % is not permitted (SOC2 CC7.2 / ISO A.8.15)',
    tg_op
    using errcode = 'insufficient_privilege';
  return null;
end;
$$;

drop trigger if exists trg_memtrak_audit_log_append_only on memtrak_audit_log;
create trigger trg_memtrak_audit_log_append_only
  before update or delete on memtrak_audit_log
  for each row
  execute function memtrak_audit_log_append_only();

-- 3) Retention note: rows are never edited or deleted in-band. Time-based
--    retention/archival (if ever required) must be performed as a deliberate,
--    logged maintenance operation that explicitly disables this trigger for
--    the duration, so the action itself is reviewable.
