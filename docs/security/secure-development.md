# Secure Development Lifecycle Policy

**ISO 27001:2022 Annex A:** A.8.8 (Management of Technical Vulnerabilities),
A.8.25 (Secure Development Life Cycle), A.8.26 (Application Security
Requirements), A.8.27 (Secure System Architecture & Engineering Principles),
A.8.28 (Secure Coding), A.8.29 (Security Testing in Development & Acceptance),
A.8.31 (Separation of Development, Test & Production Environments).

> **Owner:** ALTA Technical Lead (A.5.2) · **Approved / last reviewed:**
> 2026-06-30 · **Next review:** 2027-06-30 (or on material change).

## 1. Change-management gate (A.8.25 / A.8.29)

Every push and pull request to `main`/`master` runs the CI workflow
(`.github/workflows/ci.yml`) which must pass before merge/deploy:

1. **Type-check** — `tsc --noEmit` (catches type-safety regressions).
2. **Dependency vulnerability scan (SCA)** — `npm audit --audit-level=high
   --omit=dev`; a HIGH/CRITICAL advisory in the production dependency tree
   fails the run.
3. **Production build** — `npm run build` must succeed.

Pair this with a **branch-protection rule** on the default branch requiring the
CI check plus at least one approving review, so no change reaches production
without being reviewed and verified.

## 2. Technical-vulnerability management (A.8.8)

- **Dependabot** (`.github/dependabot.yml`) watches the npm tree and the GitHub
  Actions versions, opening weekly upgrade PRs and immediate security PRs when a
  CVE is published for a package in use.
- The CI `npm audit` gate is the enforcement point: a known-vulnerable
  production dependency cannot be merged.

## 3. Secure architecture & coding principles (A.8.27 / A.8.28)

- **Default-deny / least privilege** throughout (see `access-control.md`):
  fail-closed auth, RLS with anon revoked, service-role confined to the server.
- **Secrets never in source** — all credentials injected from the host
  environment; the public anon key carries no privilege.
- **Defense in depth** — security headers + CSP at both the framework
  (`next.config.ts`) and middleware layers; input normalization
  (`lib/security.ts`); parameterized Supabase queries; React default output
  encoding.
- **Information integrity / no data presented as live when it is not (A.5.12).**
  Integration status and audit trails report **true runtime state only** — empty
  reads render empty, and no provider is shown "Connected" without present
  credentials. The intelligence/analytics views that illustrate the product with
  sample figures (pending live event/member feeds) carry a **visible in-product
  disclosure** — the `Sample data` badge (`components/SampleDataBadge.tsx`) is
  rendered in the first viewport of every such page — so an illustrative figure
  is always labelled as such and is never presented as a live tracked metric.
  Production never serves the demo *fallbacks* in security-sensitive paths:
  `isPreviewOpen()` is hard-`false` in production (§5).

## 4. Security testing (A.8.29)

- CI gates (type-check, build, SCA) run on every change.
- Audit-trail integrity is independently verifiable at runtime via
  `verifyAuditChain()` (see `logging-and-monitoring.md`).
- **Outstanding follow-up:** add a unit test suite (e.g. Vitest) covering
  `hasRole`/`isStaffRole`, the audit hash-chain (`computeRowHash` /
  `verifyAuditChain`), and tenant `org_id` scoping, and wire it into CI as a
  required step. (Adding the test runner touches `package.json`, which is
  deferred to a dedicated change so the build dependency set stays controlled.)

## 5. Environment separation (A.8.31)

- **Production** always runs with the auth gate on; demo fallbacks are
  impossible (`isPreviewOpen()` is hard-`false` in production).
- **Non-production** previews may opt open only via `MEMTRAK_PREVIEW_OPEN` and
  should use a separate, non-production Supabase data project so test activity
  never touches production member PII.
- Secrets are distinct per environment and never shared across the
  prod/preview boundary.
