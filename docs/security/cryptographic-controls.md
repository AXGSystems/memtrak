# Cryptographic Controls Policy

**ISO 27001:2022 Annex A:** A.8.24 (Use of Cryptography).

> **Owner:** ALTA Technical Lead (A.5.2) · **Approved / last reviewed:**
> 2026-06-30 · **Next review:** 2027-06-30 (or on material change).

## 1. Transport encryption

- All traffic is HTTPS. `Strict-Transport-Security: max-age=63072000;
  includeSubDomains; preload` is set at both the framework layer
  (`next.config.ts`, applies to every path) and the middleware layer
  (`middleware.ts`), forcing HTTPS for two years including subdomains.
- Supabase connections use TLS (`https://*.supabase.co`, `wss://*.supabase.co`
  are the only non-self `connect-src` origins permitted by the CSP).

## 2. Secret material — no plaintext at rest

- **API keys** presented by external integrations are validated by hashing the
  presented key with **SHA-256** and looking the digest up against
  `memtrak_api_keys.key_hash` (`middleware.ts`). The raw secret is never stored
  and never compared in plaintext. SHA-256 (single round, unsalted) is
  acceptable here because the keys are **high-entropy random tokens**, not
  user-chosen passwords, so brute-force/rainbow-table risk does not apply.
- The previous env-var helper that compared keys to plaintext
  `MEMTRAK_API_KEY_*` values with a non-constant-time `Array.includes()` has
  been **removed** (`lib/security.ts`) to eliminate that weaker, timing-variable
  path.
- **HTTP Basic auth** comparisons (where used) use a constant-time compare to
  resist timing attacks.

## 3. Encryption at rest

- Member PII, invoices, communications, documents metadata, and the audit log
  reside in the Supabase Postgres data project, which provides
  **encryption at rest** (AES-256) and encrypted backups as a managed-platform
  control. MEMTrak relies on this platform control and does not store member
  PII outside that boundary.

**Platform at-rest encryption attestation (CC6.7 / A.8.24).** The reliance on a
provider control is documented and reviewable rather than implicit:

| Aspect | Control |
|--------|---------|
| Cipher | AES-256 on the underlying storage volumes (Supabase-managed Postgres). |
| Key management | Provider-managed KMS; data-encryption keys are wrapped by a KMS master key. MEMTrak does not hold or handle the at-rest keys. |
| Key rotation | KMS master-key rotation is performed by the platform on its cadence; encrypted, point-in-time backups inherit the same protection. |
| Boundary | No member PII is persisted outside the Supabase project (no local disk, no third-party store). Egress is TLS-only (see §1). |
| Attestation source | The provider's SOC 2 / ISO 27001 report is the evidence of these controls and is reviewed under the supplier-management policy (`supplier-and-data-flows.md`). |

**Application-level field encryption (optional hardening).** For the most
sensitive member-financial fields, column-level encryption via `pgcrypto` /
`pgsodium` is available as a future enhancement layered on top of the platform
control. It is **not** enabled today; the at-rest protection above is the
operative control, and this is recorded honestly rather than asserted as done.

## 4. Key management & rotation

| Secret | Storage | Rotation |
|--------|---------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server runtime env only (never client) | Rotate in the Supabase dashboard; redeploy. Rotate immediately on suspected exposure. |
| `AUTH_SECRET` (NextAuth) | Server runtime env only | Rotate on personnel change or suspected exposure; rotation invalidates active JWT sessions (30 min idle / 12 h absolute). |
| `CRON_SECRET` (scheduled audit verify) | Server runtime env only; sent by Vercel Cron as a bearer token | Rotate on suspected exposure; the verify endpoint compares it timing-safely and rejects when unset. |
| Integration API keys (`memtrak_api_keys`) | Only the SHA-256 hash is stored | Revoke via `revoked_at`; issue a new key. Per-key scopes limit blast radius. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public by design (browser) | Carries no privilege beyond default-deny RLS; rotated with the Supabase project. |

- No cryptographic secret is committed to the repository; all are injected from
  the host environment.
- Sessions are short-lived JWTs with a **30-minute idle timeout** (rolling
  `maxAge`, refreshed every 5 min of activity) and a **12-hour absolute cap**
  (`absExp` enforced in the jwt callback, `lib/auth.config.ts`), limiting both
  unattended-session and continuous credential-replay windows (CC6.1 / A.8.5).
