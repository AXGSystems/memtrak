-- MEMTrak — API keys for external integrations (Phase 6).
--
-- Apply via Supabase SQL editor against the memtrak project. Idempotent.
--
-- Each key:
--   • secret form: "mtk_live_<32 base32 chars>" — shown once at creation
--   • stored as: SHA-256(secret) hex digest + a 12-char prefix for display
--   • scopes:    JSON array of method+path-prefix matchers (empty = full
--                /api/memtrak/* access)

create table if not exists public.memtrak_api_keys (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  prefix        text not null,
  key_hash      text not null unique,
  scopes        text[] not null default '{}',
  created_by    text,
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz,
  revoked_at    timestamptz,
  note          text
);

create index if not exists memtrak_api_keys_hash_idx   on public.memtrak_api_keys (key_hash) where revoked_at is null;
create index if not exists memtrak_api_keys_prefix_idx on public.memtrak_api_keys (prefix);

alter table public.memtrak_api_keys enable row level security;

-- Service role only — keys never leak via the public RLS path.
drop policy if exists memtrak_api_keys_service_all on public.memtrak_api_keys;
create policy memtrak_api_keys_service_all on public.memtrak_api_keys
  for all to service_role using (true) with check (true);
