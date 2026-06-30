# Information Security Risk Assessment & Treatment

**ISO/IEC 27001:2022 — Clause 6.1.2 (risk assessment) & 6.1.3 (risk
treatment).** This document records the asset inventory, the identified risks
(threat × vulnerability → impact), an inherent rating, the treatment, and the
residual rating after the implemented controls. It is the input to the
[Statement of Applicability](./statement-of-applicability.md).

| Field | Value |
|-------|-------|
| **Owner** | ALTA Technical Lead (A.5.2) |
| **Approved / last reviewed** | 2026-06-30 |
| **Next review** | 2027-06-30 (and on any material change) |
| **Methodology** | Qualitative likelihood × impact on a 1–5 scale; risk score = L × I. Ratings: 1–4 Low, 5–9 Medium, 10–14 High, 15–25 Critical. |
| **Risk acceptance authority** | ALTA Technical Lead |

## 1. Asset inventory (A.5.9)

| ID | Asset | Classification | Owner |
|----|-------|----------------|-------|
| AS-1 | Member PII (names, emails, phones), invoices, lifetime revenue | Confidential | Technical Lead |
| AS-2 | `memtrak_audit_log` (tamper-evident change/security trail) | Confidential | Technical Lead |
| AS-3 | Service-role key (`SUPABASE_SERVICE_ROLE_KEY`) | Secret | Technical Lead |
| AS-4 | `AUTH_SECRET` (session signing) / `CRON_SECRET` | Secret | Technical Lead |
| AS-5 | Integration API keys (`memtrak_api_keys`, hashed) | Confidential | Technical Lead |
| AS-6 | Governance document metadata + storage URLs | Internal | Technical Lead |
| AS-7 | The MEMTrak application (Next.js, server runtime) | Internal | Technical Lead |
| AS-8 | Supabase Postgres data project | Confidential (store) | Technical Lead + Supabase |

## 2. Risk register

| ID | Risk (threat → impact on asset) | L | I | Inherent | Treatment (implemented control) | Residual |
|----|----------------------------------|---|---|----------|----------------------------------|----------|
| R-1 | Anonymous/broken-auth read of member PII (AS-1) | 4 | 5 | 20 Critical | **Mitigate:** fail-closed auth gate, prod always-on; RLS + anon revoked on every `memtrak_*` table; service-role server-only (`access-control.md`) | 4 Low |
| R-2 | Audit-trail tampering to hide malicious activity (AS-2) | 2 | 5 | 10 High | **Mitigate:** SHA-256 hash chain + append-only (UPDATE/DELETE revoked incl. service-role) + daily `verifyAuditChain()` cron with critical alert (`logging-and-monitoring.md`) | 3 Low |
| R-3 | Service-role / signing-secret exposure (AS-3/AS-4) | 2 | 5 | 10 High | **Mitigate:** secrets env-injected, never in source; documented rotation; HSTS/TLS; short-lived JWTs (`cryptographic-controls.md`). **Respond:** incident runbook rotation step | 4 Low |
| R-4 | Cross-tenant data exposure in the member portal (AS-1) | 3 | 4 | 12 High | **Mitigate:** server-side `org_id` scoping from the verified JWT; client cannot widen scope (`access-control.md` §3) | 3 Low |
| R-5 | Vulnerable dependency / supply-chain CVE (AS-7) | 3 | 4 | 12 High | **Mitigate:** Dependabot + CI `npm audit` HIGH/CRIT gate blocks merge (`secure-development.md` §2) | 4 Low |
| R-6 | Data loss / corruption of the data store (AS-8) | 2 | 5 | 10 High | **Mitigate:** Supabase automated encrypted PITR backups; RPO ≤24h / RTO ≤4h app, ≤24h DB; scheduled restore drill (`backup-and-continuity.md`) | 4 Low |
| R-7 | Brute-force / credential-stuffing / DoS on endpoints (AS-7) | 3 | 3 | 9 Medium | **Mitigate:** per-edge rate limiter (100/min, 10/min sensitive) + short sessions. **Recorded follow-up:** shared-store limiter for cluster-wide enforcement (`backup-and-continuity.md` §3, `secure-development.md`) | 5 Medium |
| R-8 | Authorization logic regression (privilege escalation) (AS-1) | 2 | 5 | 10 High | **Mitigate:** monotonic `hasRole`/`isStaffRole`, CI type-check. **Recorded follow-up:** unit-test suite for authz/crypto (`secure-development.md` §4) | 5 Medium |
| R-9 | Sub-processor breach exposing transferred data (AS-1) | 2 | 4 | 8 Medium | **Mitigate:** DPAs + SOC 2/ISO attestations recorded and annually reviewed; minimal data sent to Anthropic; no bulk PII export (`supplier-and-data-flows.md` §2) | 4 Low |
| R-10 | Fabricated/illustrative data mistaken for live figures (AS-1 integrity) | 2 | 3 | 6 Medium | **Mitigate:** every illustrative view carries a visible **Sample data** disclosure (`components/SampleDataBadge.tsx`); production never serves demo fallbacks (`isPreviewOpen()` hard-false); audit/integration status report true runtime state only (`secure-development.md` §3,§5) | 2 Low |
| R-11 | Secret leakage via client bundle / CSP gap (AS-3) | 2 | 5 | 10 High | **Mitigate:** only public anon key in browser (no privilege); strict CSP; secrets server-only (`cryptographic-controls.md`, `access-control.md` §4) | 3 Low |
| R-12 | Prolonged service disruption (AS-7) | 2 | 3 | 6 Medium | **Mitigate:** stateless tier, redeploy from CI-verified `main`, managed-platform redundancy, health probe (`backup-and-continuity.md`) | 3 Low |

## 3. Treatment summary

All identified risks are treated by **mitigation** with implemented controls;
none are accepted at an inherent High/Critical level. The two residual-Medium
items (R-7 cluster-wide rate limiting, R-8 automated authz/crypto tests) have
explicit, recorded follow-ups in `secure-development.md` and are accepted at
their **residual** Medium level by the risk-acceptance authority pending those
enhancements. No risk is left untreated.

## 4. Review

The register is re-assessed at least annually, on any material architecture
change, and after any declared SEV-1/SEV-2 incident (the post-incident review,
`incident-response.md` §4.7, feeds back here).
