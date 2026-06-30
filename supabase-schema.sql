-- MEMTrak Supabase Schema
-- Run this in your Supabase SQL editor to set up all tables.

-- ============================================================
-- EVENTS — core tracking data (opens, clicks, sends, bounces)
-- ============================================================
create table if not exists memtrak_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  type text not null check (type in ('open', 'click', 'send', 'bounce', 'reply', 'unsubscribe')),
  campaign_id text not null,
  recipient_email text not null,
  recipient_name text,
  metadata jsonb default '{}'::jsonb
);

-- Migration for existing deployments: widen the type CHECK to include 'unsubscribe'.
-- (Unsubscribes are a distinct deliverability event from bounces.)
do $$
begin
  alter table memtrak_events drop constraint if exists memtrak_events_type_check;
  alter table memtrak_events add constraint memtrak_events_type_check
    check (type in ('open', 'click', 'send', 'bounce', 'reply', 'unsubscribe'));
exception when others then null;
end $$;

create index idx_events_campaign on memtrak_events(campaign_id);
create index idx_events_type on memtrak_events(type);
create index idx_events_recipient on memtrak_events(recipient_email);
create index idx_events_created on memtrak_events(created_at desc);

-- Row Level Security
-- HARDENED: the browser anon key gets NO table access. All reads/writes go
-- through server-only routes using the service-role key (which bypasses RLS).
-- Tracking beacons (pixel/click) also write via a server route, never the
-- anon client. With no permissive policy, anon REST calls return zero rows
-- and inserts/updates/deletes are denied by default.
alter table memtrak_events enable row level security;
revoke all on memtrak_events from anon;

-- ============================================================
-- SUPPRESSION LIST — unsubscribed/bounced emails
-- ============================================================
create table if not exists memtrak_suppression (
  email text primary key,
  reason text default 'unsubscribe',
  created_at timestamptz default now() not null
);

alter table memtrak_suppression enable row level security;
revoke all on memtrak_suppression from anon;

-- ============================================================
-- CAMPAIGNS — campaign metadata and aggregate stats
-- ============================================================
create table if not exists memtrak_campaigns (
  id text primary key,
  name text not null,
  type text not null,
  status text not null default 'Draft',
  source text not null default 'MEMTrak',
  sent_date date,
  list_size int default 0,
  delivered int default 0,
  opened int default 0,
  unique_opened int default 0,
  clicked int default 0,
  bounced int default 0,
  unsubscribed int default 0,
  revenue numeric(12, 2) default 0,
  created_at timestamptz default now() not null
);

alter table memtrak_campaigns enable row level security;
revoke all on memtrak_campaigns from anon;

-- ============================================================
-- AUDIT LOG — security and change tracking
-- ============================================================
create table if not exists memtrak_audit_log (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  action text not null,
  actor text not null,
  details jsonb default '{}'::jsonb,
  ip_address inet
);

create index idx_audit_created on memtrak_audit_log(created_at desc);
create index idx_audit_action on memtrak_audit_log(action);

-- Audit log: append-only from the server (service role). No anon access at
-- all — the trail must not be readable, alterable, or deletable by the
-- browser key. (Tamper-resistance / SOC2 / ISO27001 logging requirement.)
alter table memtrak_audit_log enable row level security;
revoke all on memtrak_audit_log from anon;

-- Tamper-RESISTANCE (SOC2 CC7.2/CC7.3, ISO A.8.15): the trail is append-only
-- at the DB layer. UPDATE/DELETE are revoked from every role — including the
-- service-role key that writes member data — and a BEFORE trigger raises on
-- any attempt, so even that key cannot rewrite its own history (separation of
-- duties from the data-mutation path). See db/migrations/2026-06-30-audit-immutable.sql.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'revoke update, delete on memtrak_audit_log from service_role';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke update, delete on memtrak_audit_log from authenticated';
  end if;
end$$;

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
