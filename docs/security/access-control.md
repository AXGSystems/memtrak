# Access Control Policy

**ISO 27001:2022 Annex A:** A.5.15 (Access Control), A.5.18 (Access Rights),
A.8.2 (Privileged Access Rights), A.8.3 (Information Access Restriction).

> **Owner:** ALTA Technical Lead (A.5.2) · **Approved / last reviewed:**
> 2026-06-30 · **Next review:** 2027-06-30 (or on material change).

## 1. Principle: default-deny, least privilege

Access is **fail-closed**. Authentication and authorization deny by default;
access is granted only by explicit positive policy.

- The NextAuth session gate (`lib/auth.config.ts`) is **always enabled in
  production** — there is no production kill-switch. `isAuthEnabled()` returns
  `true` unconditionally when `NODE_ENV === 'production'`. A missing
  `AUTH_SECRET` still reports the gate as enabled, so requests are denied (the
  session machinery rejects without a secret) rather than served open.
- The only way to disable the gate is an **explicit non-production opt-in**
  (`MEMTRAK_PREVIEW_OPEN === 'true'`) used solely for throwaway demo deploys.
  Demo fallbacks are gated on `isPreviewOpen()`, which is hard-`false` in
  production.

## 2. Role model

Roles are defined in `lib/auth.config.ts` (`AuthRole`): `admin`, `staff`,
`read-only`, `member`, ranked by `ROLE_RANK`.

- **Staff roles** (`admin`/`staff`/`read-only`) reach staff surfaces.
- **Members** are confined to `/portal/*` and `/api/portal/*`; the `authorized`
  callback denies any member request outside those paths.
- Authorization checks use `hasRole(role, required)` (monotonic rank compare).

## 3. Tenant isolation (A.8.3)

Member-portal data is scoped **server-side** by the authenticated session's
`org_id` claim (carried on the JWT, set at sign-in, re-applied in the
`session` callback). The client cannot widen its own scope: portal API routes
read `org_id` from the verified token, never from request input.

## 4. Data-plane access (A.8.2 privileged access)

- The **browser holds only the public anon key.** Every `memtrak_*` member-PII
  table has Row Level Security **enabled** and the anon role **revoked**
  (`supabase-rls-hardening.sql`, `supabase-members-schema.sql`,
  `db/migrations/2026-05-18-documents.sql`). There are no permissive
  `USING (true)` write policies; default-deny stands even if a policy is
  accidentally reintroduced.
- All member-data reads and writes flow through **server-only API routes**
  using the **service-role key** (`lib/supabase-admin.ts` → `getAdminSupabase()`),
  which bypasses RLS and is never shipped to the client. The service-role key
  is the single privileged credential and is held only in the server runtime
  environment.

## 5. Review of access rights (A.5.18)

- Member/staff roles are provisioned at sign-in from the identity record; role
  changes propagate via the `jwt`/`session` update trigger.
- API keys for external integrations are individually revocable
  (`memtrak_api_keys.revoked_at`) and scoped per key.
- Access-right review is performed at least annually and on role/offboarding
  changes.

## 6. Outstanding follow-ups

- Tighten member-PII `SELECT` from service-role-only server routes to
  per-`org_id` RLS policies bound to the Supabase session once the portal moves
  fully behind a Supabase-issued JWT (tracked in `supabase-members-schema.sql`).
