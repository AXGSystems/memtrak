-- MEMTrak Supabase Schema
-- Run this in your Supabase SQL editor to set up all tables.

-- ============================================================
-- EVENTS — core tracking data (opens, clicks, sends, bounces)
-- ============================================================
create table if not exists memtrak_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  type text not null check (type in ('open', 'click', 'send', 'bounce', 'reply')),
  campaign_id text not null,
  recipient_email text not null,
  recipient_name text,
  metadata jsonb default '{}'::jsonb
);

create index idx_events_campaign on memtrak_events(campaign_id);
create index idx_events_type on memtrak_events(type);
create index idx_events_recipient on memtrak_events(recipient_email);
create index idx_events_created on memtrak_events(created_at desc);

-- Row Level Security
alter table memtrak_events enable row level security;
create policy "Allow all for anon" on memtrak_events for all using (true);

-- ============================================================
-- SUPPRESSION LIST — unsubscribed/bounced emails
-- ============================================================
create table if not exists memtrak_suppression (
  email text primary key,
  reason text default 'unsubscribe',
  created_at timestamptz default now() not null
);

alter table memtrak_suppression enable row level security;
create policy "Allow all for anon" on memtrak_suppression for all using (true);

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
create policy "Allow all for anon" on memtrak_campaigns for all using (true);

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

alter table memtrak_audit_log enable row level security;
create policy "Allow all for anon" on memtrak_audit_log for all using (true);
