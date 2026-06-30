-- MEMTrak — public.memtrak_documents (Phase 5: document management).
--
-- Apply via Supabase SQL editor against the memtrak project. Idempotent.
--
-- Model: documents are metadata + an external URL. Files live on alta.org,
-- Google Drive, SharePoint, etc. — MEMTrak tracks them but doesn't re-host.

create table if not exists public.memtrak_documents (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  doc_type        text not null check (doc_type in (
                    'Bylaws','Policy','Meeting Minutes','Agenda',
                    'Financial Report','Contract','Presentation',
                    'Annual Report','Other'
                  )),
  url             text not null,
  description     text,
  group_id        text,  -- soft FK to memtrak_groups.id (no constraint — group_id is text in seed)
  effective_date  date,
  uploaded_by     text,
  uploaded_at     timestamptz not null default now(),
  tags            text[] not null default '{}'
);

create index if not exists memtrak_documents_group_idx       on public.memtrak_documents (group_id);
create index if not exists memtrak_documents_type_idx        on public.memtrak_documents (doc_type);
create index if not exists memtrak_documents_effective_idx   on public.memtrak_documents (effective_date desc);
create index if not exists memtrak_documents_tags_gin        on public.memtrak_documents using gin (tags);

alter table public.memtrak_documents enable row level security;

-- ISO 27001 A.5.12 (Classification) + A.8.3 (Information Access Restriction):
-- this library holds Contracts, Financial Reports, Bylaws and Meeting Minutes,
-- and the `url` column points at the SharePoint/Drive location of those
-- confidential governance files. Exposing the row to the browser anon key
-- leaks the existence and storage location of confidential documents, so the
-- previous blanket `for select to anon using (true)` is REVOKED. All reads now
-- flow through server-only routes (lib/member-data.ts -> service-role client),
-- which bypass RLS. The anon role gets NO access; default-deny stands.
drop policy if exists memtrak_documents_anon_read on public.memtrak_documents;
revoke all on public.memtrak_documents from anon;
revoke all on public.memtrak_documents from authenticated;

drop policy if exists memtrak_documents_service_all on public.memtrak_documents;
create policy memtrak_documents_service_all on public.memtrak_documents
  for all to service_role using (true) with check (true);
