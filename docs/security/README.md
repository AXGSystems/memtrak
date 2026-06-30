# MEMTrak — Information Security Management

This directory holds the documented security controls and policies for MEMTrak,
mapped to **ISO/IEC 27001:2022 Annex A**. They describe the controls **as
actually implemented in this repository** — each policy cites the source files
that enforce it. Where a control is partial or a follow-up is outstanding it is
marked explicitly; nothing here is aspirational.

Standard reference: <https://www.iso.org/standard/27001>

## ISMS governance layer (Clauses 4–10)

Beyond the per-control policies below, the management-system artifacts that turn
this from a *control set* into a *managed ISMS* are:

| Document | ISO clause | Summary |
|----------|-----------|---------|
| [risk-assessment.md](./risk-assessment.md) | 6.1.2 / 6.1.3 | Asset inventory, risk register (inherent → treatment → residual), owners |
| [statement-of-applicability.md](./statement-of-applicability.md) | 6.1.3 d) | Every Annex A:2022 control: applicable Y/N, justification, implementing artifact |

Every policy below now carries an **owner, approval date, and review date**
header (A.5.1/A.5.2/A.5.36), so the set is dated, owned, and reviewable evidence.

## Policy index

| Document | Annex A controls | Summary |
|----------|------------------|---------|
| [access-control.md](./access-control.md) | A.5.15, A.5.18, A.8.2, A.8.3 | Default-deny auth gate, role model, RLS posture, service-role data plane |
| [cryptographic-controls.md](./cryptographic-controls.md) | A.8.24 | Hashing, transport, secret handling, key rotation |
| [logging-and-monitoring.md](./logging-and-monitoring.md) | A.8.15, A.8.16 | Tamper-evident hash-chained audit trail, retention, monitoring |
| [backup-and-continuity.md](./backup-and-continuity.md) | A.5.29, A.5.30, A.8.13, A.8.14 | Backup, RTO/RPO, restore drill + evidence, statelessness |
| [supplier-and-data-flows.md](./supplier-and-data-flows.md) | A.5.12, A.5.19–A.5.22 | Classification, supplier register + DPA/attestation evidence, data-flow inventory |
| [secure-development.md](./secure-development.md) | A.8.8, A.8.25–A.8.29, A.8.31 | SDLC, CI gates, dependency CVE management, env separation |
| [incident-response.md](./incident-response.md) | A.5.24–A.5.28 | Detect → triage → contain → eradicate → notify → review runbook |

## Control ownership

- **Owner:** ALTA Technical Lead (Information Security responsibility, A.5.2).
- **Review cadence:** these policies are reviewed at least annually and on any
  material architecture change (A.5.1, A.5.36).
- **Scope:** the MEMTrak application, its Supabase data project, and the
  third-party processors enumerated in `supplier-and-data-flows.md`.
