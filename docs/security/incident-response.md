# Incident Response Runbook

**SOC 2 Trust Services Criteria:** CC7.3 (evaluate security events), CC7.4
(respond to identified incidents), CC7.5 (recover).
**ISO 27001:2022 Annex A:** A.5.24–A.5.28 (incident management).

> **Owner:** ALTA Technical Lead (A.5.2) · **Approved / last reviewed:**
> 2026-06-30 · **Next review:** 2027-06-30 (or on material change).

This runbook defines how MEMTRAK security events are detected, triaged,
contained, eradicated, communicated, and reviewed. It is the operational
companion to [`logging-and-monitoring.md`](./logging-and-monitoring.md).

## 1. Roles

| Role | Responsibility |
|------|----------------|
| **Incident Lead** | Owns the incident end-to-end; declares severity, coordinates response, owns the final write-up. Default: the on-call MEMTRAK admin. |
| **Operator** | Executes containment/eradication steps (key rotation, deploy, RLS changes). |
| **Comms** | Handles internal/stakeholder notification and, where applicable, member/regulatory notification. |

For a small team one person may hold multiple roles; the Incident Lead is
always named explicitly when an incident is declared.

## 2. Detection sources

- **Out-of-band alerts** — critical security events (`severity: 'critical'`)
  dispatch via `dispatchSecurityAlert` (`lib/security.ts`): email through
  Microsoft Graph when configured (`SECURITY_ALERT_EMAIL` → `GRAPH_SENDER`),
  with a `console.error` floor otherwise.
- **Scheduled audit-chain verification** — the daily cron
  (`/api/memtrak/audit/verify`, `vercel.json`) raises
  `audit.chain_tampering_detected` and a critical alert on `intact === false`.
- **Availability probe** — `/api/health` (`200 ok` / `503 degraded`) for
  external uptime monitors.
- **Manual review** — `/security` and `/audit` staff dashboards.

## 3. Severity classification

| Sev | Definition | Target acknowledge | Target contain |
|-----|------------|--------------------|----------------|
| **SEV-1** | Confirmed unauthorized access to member PII, audit-chain tampering, or service-role key exposure. | 15 min | 1 hour |
| **SEV-2** | Suspected breach, repeated auth/rate-limit abuse, partial outage. | 1 hour | 4 hours |
| **SEV-3** | Single failed control, degraded probe, low-impact anomaly. | 1 business day | best-effort |

## 4. Response phases

1. **Detect & record.** Confirm the alert is real (not a transient). Open an
   incident record (time, source, Incident Lead, initial severity).
2. **Triage.** Scope blast radius: which data, which keys, which time window.
   Pull the durable audit trail (`/audit`) for the window.
3. **Contain.**
   - Suspected credential/key exposure → **rotate** the affected secret
     (`SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, `CRON_SECRET`, or the relevant
     `memtrak_api_keys` row via `revoked_at`) and redeploy. Rotating
     `AUTH_SECRET` invalidates all active sessions.
   - Suspected app compromise → roll back to the last known-good deploy.
   - Audit-chain break → freeze the affected data project from further writes
     pending forensic review; do **not** attempt to "repair" the chain.
4. **Eradicate.** Remove the root cause (revoke the path, patch the code, fix
   the misconfiguration). Verify via re-running `/api/memtrak/audit/verify` and
   `/api/health`.
5. **Notify.** Comms informs stakeholders per severity. For confirmed PII
   exposure, follow applicable breach-notification obligations within their
   statutory windows; Comms owns timing and content.
6. **Recover.** Restore normal operation; confirm controls (auth gate, RLS,
   rate limiting, append-only audit log) are intact.
7. **Post-incident review.** Within 5 business days the Incident Lead produces a
   blameless write-up: timeline, root cause, what detection worked/missed, and
   concrete follow-up actions with owners and due dates.

## 5. Key contacts & escalation

- Primary: MEMTRAK admin / Incident Lead (set `SECURITY_ALERT_EMAIL`).
- Escalation path and external contacts are maintained out-of-band by the
  Incident Lead and are not stored in the repository.

## 6. Testing

This runbook is exercised at least annually via a tabletop walkthrough of a
SEV-1 scenario (e.g. service-role key exposure), and after any real incident the
review feeds back into both this document and the detection controls.
