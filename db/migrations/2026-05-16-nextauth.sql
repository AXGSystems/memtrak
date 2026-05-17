-- MEMTrak — NextAuth.js (Auth.js v5) tables + invite-only gating.
--
-- Apply via Supabase SQL editor against the memtrak project. Idempotent.
--
-- Layout:
--   • next_auth schema  →  standard Auth.js tables (users, accounts,
--     sessions, verification_tokens). Owned by Supabase admin only; no RLS.
--   • public.memtrak_invites  →  pre-authorized email + role. Gate enforced
--     in the NextAuth signIn callback.

-- ── 1. next_auth schema (Auth.js standard) ─────────────────────────

create schema if not exists next_auth;

grant usage on schema next_auth to service_role;
grant all on all tables    in schema next_auth to service_role;
grant all on all sequences in schema next_auth to service_role;
grant all on all functions in schema next_auth to service_role;

create table if not exists next_auth.users (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  email         text unique,
  "emailVerified" timestamptz,
  image         text
);

create table if not exists next_auth.accounts (
  id                  uuid primary key default gen_random_uuid(),
  "userId"            uuid not null references next_auth.users(id) on delete cascade,
  type                text not null,
  provider            text not null,
  "providerAccountId" text not null,
  refresh_token       text,
  access_token        text,
  expires_at          bigint,
  token_type          text,
  scope               text,
  id_token            text,
  session_state       text,
  unique (provider, "providerAccountId")
);

create table if not exists next_auth.sessions (
  id            uuid primary key default gen_random_uuid(),
  "userId"      uuid not null references next_auth.users(id) on delete cascade,
  "sessionToken" text not null unique,
  expires       timestamptz not null
);

create table if not exists next_auth.verification_tokens (
  identifier text not null,
  token      text not null,
  expires    timestamptz not null,
  primary key (identifier, token)
);

-- ── 2. Invite-only gate ────────────────────────────────────────────

create table if not exists public.memtrak_invites (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  role         text not null check (role in ('admin', 'staff', 'read-only')),
  invited_by   text,
  invited_at   timestamptz not null default now(),
  accepted_at  timestamptz,
  revoked_at   timestamptz,
  note         text
);

create index if not exists memtrak_invites_email_idx on public.memtrak_invites (lower(email));

alter table public.memtrak_invites enable row level security;

-- Only the service role (server-side NextAuth + admin API) touches this.
drop policy if exists memtrak_invites_service_all on public.memtrak_invites;
create policy memtrak_invites_service_all on public.memtrak_invites
  for all
  to service_role
  using (true) with check (true);

-- Seed the bootstrap admin so the first deploy isn't locked out.
insert into public.memtrak_invites (email, role, invited_by, note)
values ('vscott@alta.org', 'admin', 'system', 'Bootstrap admin')
on conflict (email) do nothing;
