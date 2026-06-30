# Logging & Monitoring Policy

**ISO 27001:2022 Annex A:** A.8.15 (Logging), A.8.16 (Monitoring Activities).

> **Owner:** ALTA Technical Lead (A.5.2) · **Approved / last reviewed:**
> 2026-06-30 · **Next review:** 2027-06-30 (or on material change).

## 1. Durable, tamper-evident audit trail (A.8.15)

The entity-level change trail (create/update/delete of organizations, contacts,
invoices, documents, etc.) and the security-event trail both write through to a
single durable store: the `memtrak_audit_log` table.

- **Persistence is the source of truth.** `lib/audit.ts` (`logEntityAudit` →
  `persist`) and `lib/security.ts` (`logAudit` → `persistSecurityEvent`) both
  insert every event via the **service-role client** (`lib/supabase-admin.ts`).
  The small in-memory buffers are a best-effort per-instance cache only; the
  database is authoritative. **No demo/seed data is ever injected** — an empty
  trail reads as empty.
- **Tamper-evidence via hash chain.** Each persisted row carries
  `prev_hash` and `row_hash`, where
  `row_hash = SHA-256(prev_hash + canonical(event))` over a fixed field order
  (`lib/audit.ts` → `canonicalize`/`computeRowHash`). Any later edit or
  deletion of a row breaks the chain and is detectable. `verifyAuditChain()`
  re-derives every link and reports the first break — positive evidence that no
  record was altered after the fact.
- **Tamper-resistance at the DB layer (CC7.2/CC7.3).** Beyond detection, the
  table is **append-only**: `UPDATE` and `DELETE` are revoked from every role —
  **including the service-role key** that writes member data — and a
  `BEFORE UPDATE OR DELETE` trigger
  (`memtrak_audit_log_append_only`) raises `insufficient_privilege` on any
  attempt (`supabase-schema.sql`, `db/migrations/2026-06-30-audit-immutable.sql`).
  This gives **separation of duties** between the data-mutation path and the
  audit history: the one key that can change records cannot rewrite the log of
  those changes.

## 2. Access restriction on the log (A.8.15)

- `memtrak_audit_log` has RLS **enabled** and the anon role **fully revoked**
  (`supabase-schema.sql`, `supabase-rls-hardening.sql`). The browser key cannot
  read, insert, update, or delete audit records. All writes are server-side via
  the service-role key. The log is not exposed for client mutation.

## 3. Captured fields

Each event records: timestamp, action (`entity.action` or `security.action`),
actor, source IP (when captured), and an event detail/diff payload. Field-level
diffs (`diffRecords`) capture before/after values for changed fields.

## 4. Retention

- Durable rows are retained in the database (indexed by `created_at`,
  `action`). Minimum retention target: **12 months** for security and
  change-management evidence. Routine purge below that window is prohibited; any
  purge is itself performed server-side and is auditable.

## 5. Monitoring (A.8.16)

- Critical-severity security events are surfaced to the server console at write
  time AND dispatched out-of-band via `dispatchSecurityAlert` (`lib/security.ts`)
  — email through Microsoft Graph when configured (`SECURITY_ALERT_EMAIL`,
  falling back to `GRAPH_SENDER`), degrading to a structured `console.error`
  floor when no transport is configured (no silent drop, nothing fabricated).
- Aggregate stats (total / critical / warning / last-24 h) are exposed to staff
  via `/security` and `/audit`.
- **Scheduled integrity check.** `verifyAuditChain()` runs automatically on a
  daily Vercel Cron (`vercel.json` → `/api/memtrak/audit/verify`, 07:00 UTC).
  The endpoint fails closed: it accepts only a matching `CRON_SECRET` bearer
  token (timing-safe compare) or an authenticated **admin** session. Every run
  is recorded as a durable `audit.chain_verified` / `audit.chain_unavailable`
  security event; a non-intact result (`intact: false`, `brokenAt`) is logged as
  `audit.chain_tampering_detected` and fires a critical out-of-band alert. The
  same endpoint can be re-run on demand by an admin from the audit UI.

## 6. Incident response

See [`incident-response.md`](./incident-response.md) for the detect → triage →
contain → eradicate → notify → review runbook, roles, and SLAs that the alerts
above feed into.
