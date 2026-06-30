# Non-production fixtures — DO NOT LOAD INTO PRODUCTION

The `*.sql` files in this directory contain **fabricated, non-real** member
organizations, contacts, invoices, and financials used only for local
development and demo/preview environments.

- They are **not** referenced by any application code or migration and are
  never auto-loaded.
- They must **never** be applied to a production Supabase project — doing so
  would inject fictitious member data and violate the data-integrity / honesty
  requirement (SOC 2 change-management & data-integrity hygiene).
- Production change management applies only to schema (`supabase-schema.sql`,
  `supabase-*-schema.sql`) and the migrations under `db/migrations/`.

Kept under `db/fixtures/` (out of the repo root / deployable schema path) so the
fabricated data is clearly segregated from anything that ships.
