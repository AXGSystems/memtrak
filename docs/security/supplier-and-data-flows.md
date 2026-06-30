# Information Classification, Supplier Security & Data-Flow Inventory

**ISO 27001:2022 Annex A:** A.5.12 (Classification of Information),
A.5.13 (Labelling), A.5.19 (Information Security in Supplier Relationships),
A.5.20 (Addressing Security in Supplier Agreements), A.5.21 (Managing Security
in the ICT Supply Chain), A.5.22 (Monitoring & Review of Supplier Services).

> **Owner:** ALTA Technical Lead (A.5.2), with ALTA legal for DPA custody ·
> **Approved / last reviewed:** 2026-06-30 · **Next review:** 2027-06-30.

## 1. Information classification scheme (A.5.12)

| Class | Definition | MEMTrak examples |
|-------|------------|------------------|
| **Confidential** | Disclosure causes material harm | Member PII (names, emails, phones), invoices, payment references, lifetime revenue; Contracts and Financial Report documents; the audit trail |
| **Internal** | Not for public release | Bylaws, Meeting Minutes, Agendas, governance document metadata and storage URLs; staff relationships |
| **Public** | Freely shareable | Marketing pixel/logo endpoints, public unsubscribe/confirm pages |

**Handling rule:** all *Confidential* and *Internal* data is served only through
authenticated, server-side routes using the service-role key. The browser anon
key has **no** access to any `memtrak_*` member table or to
`memtrak_documents` (see `access-control.md`). The `memtrak_documents.url`
column is treated as *Internal/Confidential* because it reveals the existence
and storage location of governance files — it is **no longer anon-readable**
(`db/migrations/2026-05-18-documents.sql`).

## 2. Supplier (sub-processor) register

Suppliers that process or store MEMTrak data, with the data classes that flow to
each. "Implemented" reflects whether live client code exists
(`app/api/memtrak/integrations/status/route.ts` reports true runtime state — no
provider is shown "Connected" without present credentials).

| Supplier | Role | Data class processed | Implemented | Security basis |
|----------|------|----------------------|-------------|----------------|
| **Supabase** (Postgres + Auth) | Primary data store, auth adapter | Confidential (all member PII, invoices, audit log) | Yes | RLS + service-role isolation; encryption at rest/in transit; SOC 2 / GDPR DPA from vendor |
| **Anthropic (Claude API)** | AI assist (`lib/anthropic.ts`) | Internal — only the content sent in a given request; **no bulk PII export** | Yes | TLS; vendor DPA; requests carry minimal context |
| **Microsoft 365 / Graph** | Outbound member email (`lib/graph.ts`, `/api/memtrak/send`) | Confidential — recipient email + message body | Yes | OAuth-scoped Graph creds; TLS; Microsoft DPA |
| Azure SQL, GA4, Revive, ZeroBounce, Twilio | Planned integrations | n/a | **Not implemented** — no client code, no data flow today | To be assessed before enablement |

**Supplier controls (A.5.19–A.5.22):**
- A signed **DPA** must be in place with every implemented sub-processor before
  Confidential data flows to it.
- Each supplier's security posture (SOC 2 / ISO 27001 attestation) is reviewed
  at onboarding and at least annually.
- Credentials for each supplier are least-privilege, injected from the host
  environment, and rotated per `cryptographic-controls.md`.
- A planned integration moves out of "Not implemented" only after a supplier
  security review and DPA are recorded here.

**Supplier assurance evidence register (A.5.20 / A.5.22).** The DPA and
attestation evidence for each implemented sub-processor, with the public source
where the attestation is obtained and the date it was last reviewed. Where a
field reads *On file (ALTA legal)* the artifact is held in ALTA's contract
repository, not in this code repo, and is referenced here by its location;
public attestation pages are linked directly.

| Supplier | DPA reference | Security attestation | Attestation source | Last reviewed | Next review |
|----------|---------------|----------------------|--------------------|---------------|-------------|
| **Supabase** | Supabase DPA (incorporated by reference into the platform Terms; on file, ALTA legal) | SOC 2 Type II; ISO 27001 | <https://supabase.com/security> · <https://security.supabase.com> | 2026-06-30 | 2027-06-30 |
| **Anthropic (Claude API)** | Anthropic Commercial DPA (on file, ALTA legal) | SOC 2 Type II | <https://trust.anthropic.com> | 2026-06-30 | 2027-06-30 |
| **Microsoft 365 / Graph** | Microsoft Data Protection Addendum / DPA (covered under the ALTA M365 agreement; on file, ALTA legal) | SOC 1/2/3; ISO 27001/27018 | <https://servicetrust.microsoft.com> · <https://learn.microsoft.com/compliance> | 2026-06-30 | 2027-06-30 |

Owner of this register: **ALTA Technical Lead** (with ALTA legal for DPA
custody). The *Last reviewed* dates above are the dated evidence that the
A.5.22 annual review was performed; the *Next review* date is the committed
cadence.

## 3. Data-flow inventory

```
Member / staff browser
  │  (anon key — DEFAULT-DENY on all member tables; reads/writes go via API)
  ▼
MEMTrak app (Next.js, server runtime)
  ├─ service-role key ─────────────▶ Supabase Postgres   [Confidential at rest, encrypted]
  ├─ Graph OAuth ──────────────────▶ Microsoft 365        [outbound member email]
  └─ Claude API key ───────────────▶ Anthropic            [per-request AI assist, minimal context]

Document files themselves are NOT ingested — only metadata + external URL is
stored; files remain in SharePoint / Google Drive / alta.org (their own DPAs).
```

## 4. Outstanding follow-ups

- As any **planned** integration (Azure SQL, GA4, Revive, ZeroBounce, Twilio)
  moves to "Implemented", add its DPA reference, attestation source, and a dated
  review row to the assurance register in §2 **before** the code that uses it
  merges. The register above is the current, dated evidence for the three live
  sub-processors.
