// ============================================================
// MEMTrak Duplicate Detection + Merge ("golden record")
// ------------------------------------------------------------
// Computes duplicate-candidate pairs from LIVE organization data
// (no fabricated counts). Scoring is deterministic + fuzzy:
//   • normalized org name (Levenshtein-ratio similarity)
//   • same state (strong signal for a true duplicate)
//   • shared member_id stem
// Pairs are blocked by a cheap name-prefix key so we never do a
// full O(n^2) scan across the whole database.
//
// The merge path collapses a duplicate org into a surviving org,
// preserving the richer/most-recent engagement signals and the
// union of tags, then deletes the duplicate. All writes go through
// member-data.ts (service-role on the server).
// ============================================================

import { listOrganizations, getOrganization, updateOrganization, deleteOrganization, type Organization } from './member-data';

export interface DuplicateCandidate {
  /** Surviving (kept) org — the one with stronger engagement / more recent activity. */
  primary: Pick<Organization, 'id' | 'org_name' | 'member_id' | 'state' | 'engagement_score' | 'last_payment_date' | 'lifetime_revenue'>;
  /** Likely-duplicate org proposed for merge. */
  duplicate: Pick<Organization, 'id' | 'org_name' | 'member_id' | 'state' | 'engagement_score' | 'last_payment_date' | 'lifetime_revenue'>;
  /** 0–100 match confidence. */
  score: number;
  /** Human-readable reasons the pair was flagged. */
  reasons: string[];
}

export interface DedupeResult {
  candidates: DuplicateCandidate[];
  /** Total organizations scanned to produce the candidate set. */
  scanned: number;
  /** Number of high-confidence (>= 80) pairs. */
  highConfidence: number;
}

// ── String normalization + similarity ────────────────────────

const ORG_NOISE = /\b(the|inc|incorporated|llc|llp|lp|ltd|co|company|corp|corporation|group|holdings|title|escrow|agency|agencies|services|svcs|of|and)\b/g;

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,&/\\#!$%^*;:{}=\-_`~()'"]/g, ' ')
    .replace(ORG_NOISE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Classic Levenshtein edit distance. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** Similarity ratio in [0,1]; 1 = identical. */
function similarity(a: string, b: string): number {
  if (!a.length && !b.length) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/** Blocking key: first 4 chars of the normalized name (cheap candidate gate). */
function blockKey(normalized: string): string {
  return normalized.slice(0, 4);
}

function recency(dateStr?: string): number {
  if (!dateStr) return 0;
  const t = Date.parse(dateStr);
  return Number.isFinite(t) ? t : 0;
}

/**
 * Decide which of the two orgs should survive a merge: prefer higher
 * engagement, then more recent payment, then higher lifetime revenue.
 */
function pickPrimary(a: Organization, b: Organization): [Organization, Organization] {
  const scoreA = a.engagement_score * 1e9 + recency(a.last_payment_date) / 1e6 + a.lifetime_revenue;
  const scoreB = b.engagement_score * 1e9 + recency(b.last_payment_date) / 1e6 + b.lifetime_revenue;
  return scoreA >= scoreB ? [a, b] : [b, a];
}

function slim(o: Organization): DuplicateCandidate['primary'] {
  return {
    id: o.id, org_name: o.org_name, member_id: o.member_id, state: o.state,
    engagement_score: o.engagement_score, last_payment_date: o.last_payment_date,
    lifetime_revenue: o.lifetime_revenue,
  };
}

/**
 * Scan live organizations and return duplicate candidate pairs.
 * NAME_THRESHOLD keeps only genuinely-similar names; same-state and
 * shared member-id stems add confidence.
 */
export async function findDuplicateCandidates(opts: { limit?: number } = {}): Promise<DedupeResult> {
  const limit = Math.min(200, Math.max(1, opts.limit ?? 50));

  // Pull a bounded population (sorted by dues desc by default) to scan.
  const { rows } = await listOrganizations({ page: 1, pageSize: 200 });

  // Bucket by blocking key so comparisons stay local.
  const buckets = new Map<string, Organization[]>();
  for (const o of rows) {
    const key = blockKey(normalizeName(o.org_name));
    if (!key) continue;
    (buckets.get(key) ?? buckets.set(key, []).get(key)!).push(o);
  }

  const NAME_THRESHOLD = 0.82;
  const seen = new Set<string>();
  const candidates: DuplicateCandidate[] = [];

  for (const group of buckets.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i];
        const b = group[j];
        const pairKey = [a.id, b.id].sort().join('|');
        if (seen.has(pairKey)) continue;

        const na = normalizeName(a.org_name);
        const nb = normalizeName(b.org_name);
        const nameSim = similarity(na, nb);
        if (nameSim < NAME_THRESHOLD) continue;

        const reasons: string[] = [];
        let score = Math.round(nameSim * 70); // name carries up to 70 pts
        reasons.push(`Name match ${Math.round(nameSim * 100)}%`);

        if (a.state && b.state && a.state === b.state) {
          score += 18;
          reasons.push(`Same state (${a.state})`);
        }
        // Shared member-id stem (e.g. both derive from the same legacy id).
        const stemA = (a.member_id || '').replace(/[^a-z0-9]/gi, '').slice(0, 5).toLowerCase();
        const stemB = (b.member_id || '').replace(/[^a-z0-9]/gi, '').slice(0, 5).toLowerCase();
        if (stemA && stemA === stemB) {
          score += 12;
          reasons.push('Shared member-ID stem');
        }
        score = Math.min(100, score);

        seen.add(pairKey);
        const [primary, duplicate] = pickPrimary(a, b);
        candidates.push({ primary: slim(primary), duplicate: slim(duplicate), score, reasons });
      }
    }
  }

  candidates.sort((x, y) => y.score - x.score);
  return {
    candidates: candidates.slice(0, limit),
    scanned: rows.length,
    highConfidence: candidates.filter((c) => c.score >= 80).length,
  };
}

export interface MergeResult {
  survivor: Organization;
  mergedFromId: string;
}

/**
 * Merge `duplicateId` into `survivorId`. The survivor keeps its identity but
 * absorbs the union of tags and the more-recent engagement signals, then the
 * duplicate org row is deleted. Caller (the route) is responsible for auth.
 */
export async function mergeOrganizations(survivorId: string, duplicateId: string): Promise<MergeResult> {
  if (survivorId === duplicateId) throw new Error('Cannot merge an organization into itself');

  const [survivor, dup] = await Promise.all([
    getOrganization(survivorId),
    getOrganization(duplicateId),
  ]);
  if (!survivor) throw new Error('Survivor organization not found');
  if (!dup) throw new Error('Duplicate organization not found');

  // Preserve the most favorable signals on the survivor.
  const mergedTags = Array.from(new Set([...(survivor.tags ?? []), ...(dup.tags ?? [])]));
  const patch: Partial<Organization> = {
    tags: mergedTags,
    engagement_score: Math.max(survivor.engagement_score, dup.engagement_score),
    lifetime_revenue: (survivor.lifetime_revenue || 0) + (dup.lifetime_revenue || 0),
  };
  // Keep the more recent payment date.
  if (recency(dup.last_payment_date) > recency(survivor.last_payment_date)) {
    patch.last_payment_date = dup.last_payment_date;
  }

  const updated = await updateOrganization(survivorId, patch);
  await deleteOrganization(duplicateId);

  return { survivor: updated, mergedFromId: duplicateId };
}
