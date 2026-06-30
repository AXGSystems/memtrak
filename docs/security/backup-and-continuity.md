# Backup & Business Continuity Policy

**ISO 27001:2022 Annex A:** A.5.29 (Information Security During Disruption),
A.5.30 (ICT Readiness for Business Continuity), A.8.13 (Information Backup),
A.8.14 (Redundancy of Information Processing Facilities).

> **Owner:** ALTA Technical Lead (A.5.2) · **Approved / last reviewed:**
> 2026-06-30 · **Next review:** 2027-06-30 (or on material change).

## 1. Data backup (A.8.13)

- All durable MEMTrak state — member PII, organizations, contacts, invoices,
  communications, document metadata, and the `memtrak_audit_log` trail — lives
  in the **Supabase Postgres data project**, which provides automated,
  encrypted, point-in-time backups as a managed-platform control.
- **Backup scope:** the entire Postgres database (all `memtrak_*` tables).
- **Verification:** restore capability is verified by performing a test restore
  to a scratch project at least annually.
- MEMTrak holds **no authoritative state on application instances.** Source
  documents themselves are not re-hosted by MEMTrak — only their metadata and
  external URL are stored (`db/migrations/2026-05-18-documents.sql`); the files
  remain in their systems of record (SharePoint / Drive / alta.org), which carry
  their own backup regimes.

## 2. Recovery objectives

| Objective | Target |
|-----------|--------|
| **RPO** (max data loss) | ≤ 24 h, bounded by Supabase daily backup + point-in-time recovery window |
| **RTO** (max downtime)  | ≤ 4 h for the application tier (stateless redeploy); ≤ 24 h for a full database restore |

These are the documented targets; they are reviewed annually and after any
incident.

## 3. Statelessness & redundancy (A.8.14)

- The application tier is **stateless**: it can be redeployed or scaled
  horizontally with no loss of authoritative data, because all durable state is
  in Postgres and all secrets are injected from the host environment.
- The rate limiter and the in-memory audit caches are **per-instance and
  ephemeral by design** — losing them on restart degrades only best-effort
  caching, never the durable record (the audit trail is persisted; see
  `logging-and-monitoring.md`). The rate limiter fails safe on restart (counters
  reset, no lockout of legitimate traffic).
- The managed Postgres platform provides storage redundancy and failover.

## 4. Disruption response (A.5.29 / A.5.30)

1. **Detect** — platform health (`/api/health`), audit-chain integrity
   (`verifyAuditChain()`), and provider status pages.
2. **Recover application tier** — redeploy from `main` (CI-verified build);
   re-inject secrets from the secret store.
3. **Recover data tier** — restore the most recent verified Supabase backup /
   point-in-time snapshot; confirm `verifyAuditChain()` reports `intact`.
4. **Validate** — smoke-test auth, portal tenant scoping, and a sample
   member-data read before reopening access.

## 5. Restore-drill procedure & evidence (A.5.30 / A.8.13)

A restore drill is performed on a **quarterly** cadence (and after any change to
the backup configuration) to demonstrate — not merely assert — recoverability.
The drill is a documented operating procedure (A.5.37) owned by the **ALTA
Technical Lead**:

1. **Trigger restore.** From the Supabase dashboard, restore the latest
   point-in-time snapshot of the production data project into a **scratch**
   project (never over production). Record `T_start`.
2. **Validate integrity.** Point a non-prod app instance at the scratch project
   and run `verifyAuditChain()` (via `/api/memtrak/audit/verify` with an admin
   session); confirm it reports `intact: true`.
3. **Validate data.** Smoke-test: a sample authenticated member-data read, a
   portal `org_id`-scoped read, and a row count on a key `memtrak_*` table vs.
   the source snapshot. Record `T_ready`.
4. **Measure.** Restore time = `T_ready − T_start` (the measured RTO for the
   data tier); the snapshot age at restore = measured RPO. Compare to the
   targets in §2.
5. **Record evidence & tear down.** Append a dated row to the evidence log
   below, then delete the scratch project.

**Restore-drill evidence log** (measured vs. target — to be appended after each
drill):

| Date | Snapshot age (measured RPO) | Restore time (measured RTO) | Chain intact? | Result vs. target (RPO ≤24h / RTO ≤24h DB) | Operator |
|------|------------------------------|------------------------------|---------------|---------------------------------------------|----------|
| _next scheduled: 2026-09-30_ | — | — | — | — | Technical Lead |

The first dated row is captured at the next scheduled drill; until then the
figures in §2 are documented **targets** and this is stated honestly rather than
claimed as measured.

## 6. Outstanding follow-ups

- Automate the §5 drill as a scheduled job that restores to a scratch project,
  runs `verifyAuditChain()`, records the measured RTO/RPO into the evidence log,
  and tears the scratch project down — removing the manual step.
