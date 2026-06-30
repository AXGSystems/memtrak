# Statement of Applicability (SoA)

**ISO/IEC 27001:2022 — Clause 6.1.3 d).** This SoA records, for every Annex A
(2022) control, whether it is **Applicable** to MEMTrak, the **justification**,
and the **implementing artifact** (policy + source file) that satisfies it.
Controls marked *Not applicable* state why. Controls marked *Applicable —
partial* link to the recorded follow-up.

| Field | Value |
|-------|-------|
| **Owner** | ALTA Technical Lead (Information Security responsibility, A.5.2) |
| **Approved by** | ALTA Technical Lead |
| **Approved / last reviewed** | 2026-06-30 |
| **Next review** | 2027-06-30 (and on any material architecture change) |
| **Scope** | The MEMTrak application, its Supabase data project, and the sub-processors in `supplier-and-data-flows.md` |

Status legend: **A** = Applicable & implemented · **A‑P** = Applicable, partial
(follow-up recorded) · **N/A** = Not applicable (justified).

## A.5 — Organizational controls

| Control | Title | Status | Justification / implementing artifact |
|---------|-------|--------|----------------------------------------|
| A.5.1 | Policies for information security | A | This `docs/security/` policy set, owned and annually reviewed (`README.md`). |
| A.5.2 | Information security roles & responsibilities | A | Owner = ALTA Technical Lead; incident roles in `incident-response.md` §1. |
| A.5.3 | Segregation of duties | A | Append-only audit log: the service-role key that mutates data **cannot** rewrite the log (`logging-and-monitoring.md` §1). |
| A.5.4 | Management responsibilities | A | Technical Lead approves/reviews this SoA and the policy set. |
| A.5.5 | Contact with authorities | A‑P | Breach-notification path in `incident-response.md` §4.5; external contacts held out-of-band (§5). |
| A.5.6 | Contact with special interest groups | N/A | Single-app team; threat intel consumed via Dependabot/CVE feeds (A.8.8) rather than formal SIG membership. |
| A.5.7 | Threat intelligence | A | Dependabot + CI `npm audit` ingest published CVEs (`secure-development.md` §2). |
| A.5.8 | Information security in project management | A | Secure SDLC + CI change gate (`secure-development.md` §1). |
| A.5.9 | Inventory of information & other associated assets | A | Asset register in `risk-assessment.md` §1; data-flow inventory in `supplier-and-data-flows.md` §3. |
| A.5.10 | Acceptable use of information & assets | A | Least-privilege access model (`access-control.md`); secrets never in source. |
| A.5.11 | Return of assets | N/A | No physical assets issued by the app; access is revoked by role/offboarding (A.5.18). |
| A.5.12 | Classification of information | A | Three-class scheme (`supplier-and-data-flows.md` §1); intelligence views that show illustrative figures carry a visible **Sample data** disclosure (`components/SampleDataBadge.tsx`) so no figure is presented as live when it is not. |
| A.5.13 | Labelling of information | A | Classification labels applied per §1; sample-vs-live data labelled in-product. |
| A.5.14 | Information transfer | A | TLS everywhere; egress only to enumerated TLS origins (`cryptographic-controls.md` §1, CSP). |
| A.5.15 | Access control | A | Default-deny auth gate + role model (`access-control.md` §1–2). |
| A.5.16 | Identity management | A | Identities from the NextAuth/Supabase adapter; roles on the JWT. |
| A.5.17 | Authentication information | A | No plaintext secrets at rest; SHA-256 key hashing; short-lived JWTs (`cryptographic-controls.md` §2,§4). |
| A.5.18 | Access rights | A | Provisioned at sign-in, revocable keys, annual review (`access-control.md` §5). |
| A.5.19 | Information security in supplier relationships | A | Sub-processor register + supplier controls (`supplier-and-data-flows.md` §2). |
| A.5.20 | Addressing security in supplier agreements | A | DPA-required policy + recorded DPA references (`supplier-and-data-flows.md` §2). |
| A.5.21 | Managing security in the ICT supply chain | A | Suppliers assessed before enablement; "Not implemented" gating (`supplier-and-data-flows.md` §2). |
| A.5.22 | Monitoring & review of supplier services | A | Annual attestation review with recorded last-review dates (`supplier-and-data-flows.md` §2). |
| A.5.23 | Information security for use of cloud services | A | Supabase/M365/Anthropic treated as sub-processors with DPAs + attestations (`supplier-and-data-flows.md`). |
| A.5.24 | Information security incident management planning | A | `incident-response.md`. |
| A.5.25 | Assessment & decision on security events | A | Severity classification (`incident-response.md` §3). |
| A.5.26 | Response to information security incidents | A | Response phases (`incident-response.md` §4). |
| A.5.27 | Learning from information security incidents | A | Blameless post-incident review (`incident-response.md` §4.7). |
| A.5.28 | Collection of evidence | A | Tamper-evident hash-chained audit trail (`logging-and-monitoring.md` §1). |
| A.5.29 | Information security during disruption | A | `backup-and-continuity.md` §4. |
| A.5.30 | ICT readiness for business continuity | A‑P | RPO/RTO targets + recovery steps + scheduled restore drill (`backup-and-continuity.md` §2,§4,§5). |
| A.5.31 | Legal, statutory, regulatory & contractual requirements | A | Breach-notification obligation (`incident-response.md` §4.5); DPAs (A.5.20). |
| A.5.32 | Intellectual property rights | A | Dependency licenses tracked via npm tree; no unlicensed bundling. |
| A.5.33 | Protection of records | A | Append-only audit log, ≥12-month retention (`logging-and-monitoring.md` §1,§4). |
| A.5.34 | Privacy & protection of PII | A | PII classified Confidential; server-only access; no client anon reads (`access-control.md` §4). |
| A.5.35 | Independent review of information security | A‑P | This audit (AUDIX) acts as periodic independent review; cadence recorded in `README.md`. |
| A.5.36 | Compliance with policies, rules & standards | A | Annual policy review; CI gates enforce coding standards (`secure-development.md`). |
| A.5.37 | Documented operating procedures | A | Incident runbook + restore-drill procedure are documented operating procedures. |

## A.6 — People controls

| Control | Title | Status | Justification / implementing artifact |
|---------|-------|--------|----------------------------------------|
| A.6.1 | Screening | N/A | Personnel screening is an ALTA HR control outside this application's boundary. |
| A.6.2 | Terms & conditions of employment | N/A | Covered by ALTA HR; out of app scope. |
| A.6.3 | Information security awareness, education & training | A‑P | Maintainer follows this policy set; formal training tracked at the ALTA org level. |
| A.6.4 | Disciplinary process | N/A | ALTA HR control, out of app scope. |
| A.6.5 | Responsibilities after termination | A | Access revoked on offboarding (`access-control.md` §5); secret rotation on personnel change (`cryptographic-controls.md` §4). |
| A.6.6 | Confidentiality / non-disclosure agreements | N/A | Org-level HR/legal control. |
| A.6.7 | Remote working | A | All access is over authenticated HTTPS; no trust placed in network location. |
| A.6.8 | Information security event reporting | A | Events reported via the alerting + dashboards (`logging-and-monitoring.md` §5). |

## A.7 — Physical controls

| Control | Title | Status | Justification |
|---------|-------|--------|---------------|
| A.7.1 – A.7.14 | Physical & environmental security | N/A | MEMTrak operates entirely on managed cloud platforms (Vercel + Supabase). Physical/environmental controls are the providers' responsibility and are evidenced by their SOC 2 / ISO 27001 attestations (`supplier-and-data-flows.md` §2). The app holds no on-premise assets. |

## A.8 — Technological controls

| Control | Title | Status | Justification / implementing artifact |
|---------|-------|--------|----------------------------------------|
| A.8.1 | User endpoint devices | N/A | No managed endpoints; access is browser-based over TLS. |
| A.8.2 | Privileged access rights | A | Service-role key is server-only, single privileged credential (`access-control.md` §4). |
| A.8.3 | Information access restriction | A | Tenant `org_id` scoping server-side (`access-control.md` §3). |
| A.8.4 | Access to source code | A | Repo access controlled in GitHub; no secrets in source. |
| A.8.5 | Secure authentication | A | Short-lived JWTs, 30-min idle / 12-h absolute (`cryptographic-controls.md` §4). |
| A.8.6 | Capacity management | A | Stateless tier scales horizontally; managed Postgres (`backup-and-continuity.md` §3). |
| A.8.7 | Protection against malware | N/A | No file ingestion/execution; documents are external URLs only (`backup-and-continuity.md` §1). |
| A.8.8 | Management of technical vulnerabilities | A | Dependabot + CI `npm audit` HIGH/CRIT gate (`secure-development.md` §2). |
| A.8.9 | Configuration management | A | Config-as-code (`next.config.ts`, `middleware.ts`, `vercel.json`); env-injected secrets. |
| A.8.10 | Information deletion | A | Member-data deletes flow through audited server routes; retention policy in `logging-and-monitoring.md` §4. |
| A.8.11 | Data masking | A | Sample/illustrative figures explicitly labelled; production never serves demo data (`access-control.md` §1, `secure-development.md` §5). |
| A.8.12 | Data leakage prevention | A | Anon key default-deny on all member tables; strict CSP `connect-src` (`access-control.md` §4, `cryptographic-controls.md` §1). |
| A.8.13 | Information backup | A | Supabase automated encrypted PITR backups (`backup-and-continuity.md` §1). |
| A.8.14 | Redundancy of information processing facilities | A | Stateless tier + managed Postgres redundancy (`backup-and-continuity.md` §3). |
| A.8.15 | Logging | A | Durable hash-chained audit trail (`logging-and-monitoring.md` §1). |
| A.8.16 | Monitoring activities | A | Critical-event alerts + daily chain-verify cron (`logging-and-monitoring.md` §5). |
| A.8.17 | Clock synchronization | A | Platform-managed NTP on the serverless runtime and Postgres; audit timestamps are server-issued. |
| A.8.18 | Use of privileged utility programs | N/A | No privileged utilities shipped; admin actions go through audited app routes. |
| A.8.19 | Installation of software on operational systems | A | Deploys only via CI-verified build from `main` (`secure-development.md` §1). |
| A.8.20 | Network security | A | TLS-only; HSTS at framework + middleware (`cryptographic-controls.md` §1). |
| A.8.21 | Security of network services | A | CSP restricts egress origins; no inbound services beyond the app. |
| A.8.22 | Segregation of networks | N/A | Single managed network boundary per provider; no VPC self-management. |
| A.8.23 | Web filtering | N/A | Not an end-user-network control; egress restricted by CSP instead. |
| A.8.24 | Use of cryptography | A | `cryptographic-controls.md` (TLS, SHA-256 hashing, at-rest AES-256, rotation). |
| A.8.25 | Secure development life cycle | A | CI change gate + branch protection (`secure-development.md` §1). |
| A.8.26 | Application security requirements | A | Default-deny, input normalization, parameterized queries (`secure-development.md` §3). |
| A.8.27 | Secure system architecture & engineering principles | A | Defense-in-depth headers + least privilege (`secure-development.md` §3). |
| A.8.28 | Secure coding | A | `lib/security.ts` normalization, React output encoding, constant-time compares (`secure-development.md` §3). |
| A.8.29 | Security testing in development & acceptance | A‑P | CI type-check/build/SCA + runtime `verifyAuditChain()`; unit-test suite for authz/crypto is a recorded follow-up (`secure-development.md` §4). |
| A.8.30 | Outsourced development | N/A | Development is in-house; no outsourced code. |
| A.8.31 | Separation of development, test & production environments | A | Prod auth always on; preview opt-in only; separate data project for non-prod (`secure-development.md` §5). |
| A.8.32 | Change management | A | CI gate + review on `main` (`secure-development.md` §1). |
| A.8.33 | Test information | A | Non-prod uses a separate Supabase project so test activity never touches prod PII (`secure-development.md` §5). |
| A.8.34 | Protection of information systems during audit testing | A | Audit/verify endpoint fails closed (CRON_SECRET or admin only); read-only dashboards. |
