import { NextRequest, NextResponse } from 'next/server';
import { bulkCreateOrganizations, type OrganizationInput } from '@/lib/member-data';

/**
 * POST /api/memtrak/members/import
 *
 * Body: { rows: OrganizationInput[] }
 *   Each row must include org_name and org_type at minimum.
 *
 * Response: { inserted, failed: [{ index, error }] }
 *   503 when Supabase is not configured (demo mode cannot persist).
 *   400 when the payload shape is invalid or rows fail validation.
 */

const ORG_TYPES = new Set(['ACU', 'ACA', 'ACB', 'REA', 'Associate', 'Affiliate', 'Government', 'Honorary']);
const MAX_ROWS = 5000;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body || typeof body !== 'object' || !Array.isArray((body as { rows?: unknown }).rows)) {
    return NextResponse.json({ error: 'Body must be { rows: [...] }' }, { status: 400 });
  }

  const rows = (body as { rows: unknown[] }).rows;
  if (rows.length === 0) {
    return NextResponse.json({ error: 'No rows provided' }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `Too many rows (max ${MAX_ROWS})` }, { status: 400 });
  }

  const errors: { index: number; error: string }[] = [];
  const cleaned: OrganizationInput[] = [];

  rows.forEach((raw, index) => {
    if (!raw || typeof raw !== 'object') {
      errors.push({ index, error: 'Row is not an object' });
      return;
    }
    const r = raw as Record<string, unknown>;
    const org_name = typeof r.org_name === 'string' ? r.org_name.trim() : '';
    const org_type = typeof r.org_type === 'string' ? r.org_type.trim() : '';

    if (!org_name) {
      errors.push({ index, error: 'org_name required' });
      return;
    }
    if (!ORG_TYPES.has(org_type)) {
      errors.push({ index, error: `org_type must be one of ${[...ORG_TYPES].join(', ')}` });
      return;
    }

    cleaned.push({ ...r, org_name, org_type } as OrganizationInput);
  });

  if (errors.length) {
    return NextResponse.json(
      { error: 'Validation failed', failed: errors, inserted: 0 },
      { status: 400 },
    );
  }

  try {
    const result = await bulkCreateOrganizations(cleaned);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import failed';
    const isConfig = message.includes('Supabase not configured');
    return NextResponse.json({ error: message }, { status: isConfig ? 503 : 500 });
  }
}
