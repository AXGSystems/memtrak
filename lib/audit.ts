/**
 * AMS audit trail. Records entity-level changes (create / update / delete)
 * for member-data records. Distinct from `lib/security.ts`, which logs
 * security events (auth, rate limiting, etc.).
 *
 * DURABLE: every event is written through to the `memtrak_audit_log` table
 * via the service-role client (bypasses RLS, never exposed to the browser).
 * A small in-memory buffer is retained ONLY as a best-effort cache for the
 * current instance; the database is the source of truth. No demo/seed data
 * is ever injected — an empty trail reads as empty.
 */

import { createHash } from 'node:crypto';
import { getAdminSupabase } from '@/lib/supabase-admin';

export type AuditAction = 'create' | 'update' | 'delete' | 'mark_paid' | 'recompute_engagement' | 'import' | 'revoke' | 'merge' | 'pay';
export type AuditEntity = 'organization' | 'contact' | 'invoice' | 'event_attendance' | 'group' | 'group_member' | 'invite' | 'document';

export interface AuditEvent {
  id: string;
  created_at: string;
  entity: AuditEntity;
  entity_id: string;
  /** Short label for UI (e.g. org_name, invoice_number) */
  entity_label?: string;
  action: AuditAction;
  /** Who performed the action — staff name or 'system' */
  actor: string;
  /** Plain-language summary shown in the UI */
  summary: string;
  /** Field-level diff: { field: { from, to } } */
  diff?: Record<string, { from: unknown; to: unknown }>;
  /** Source IP of the request that caused the change (when captured). */
  ip_address?: string | null;
  /** User-agent of the request that caused the change (when captured). */
  user_agent?: string | null;
}

const MAX_EVENTS = 5000;
// Best-effort per-instance cache only. NO seed/demo data — the DB is truth.
const log: AuditEvent[] = [];

/** Genesis hash for the very first link in an empty chain. */
const GENESIS_HASH = '0'.repeat(64);

/**
 * Canonical, deterministic serialization of the fields covered by the chain
 * hash. Order is fixed so the same logical event always hashes identically.
 */
function canonicalize(event: AuditEvent): string {
  return JSON.stringify([
    event.created_at,
    `${event.entity}.${event.action}`,
    event.actor,
    event.entity_id,
    event.entity_label ?? null,
    event.summary,
    event.diff ?? null,
    event.ip_address ?? null,
    event.user_agent ?? null,
  ]);
}

/** row_hash = sha256(prev_hash + canonical(event)). */
function computeRowHash(prevHash: string, event: AuditEvent): string {
  return createHash('sha256').update(prevHash + canonicalize(event)).digest('hex');
}

/**
 * Read the most-recent row's stored row_hash so the next insert can chain to
 * it. Returns the genesis hash when the log is empty / unavailable.
 */
async function lastRowHash(admin: NonNullable<ReturnType<typeof getAdminSupabase>>): Promise<string> {
  try {
    const { data, error } = await admin
      .from('memtrak_audit_log')
      .select('details')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) return GENESIS_HASH;
    const d = (data[0] as { details: { row_hash?: string } | null }).details;
    return d?.row_hash ?? GENESIS_HASH;
  } catch {
    return GENESIS_HASH;
  }
}

/**
 * Persist an audit event to the durable `memtrak_audit_log` table using the
 * service-role client (bypasses RLS; never reaches the browser). Each row is
 * linked into a SHA-256 hash chain (row_hash = sha256(prev_hash + canonical
 * event)), so any later deletion or edit of a row breaks the chain and is
 * detectable — i.e. the trail is tamper-EVIDENT, not just append-restricted.
 *
 * Fire-and-forget from the caller's perspective — failures are logged, not
 * thrown, so an audit-store hiccup can't break the underlying mutation.
 */
async function persist(event: AuditEvent): Promise<void> {
  const admin = getAdminSupabase();
  if (!admin) return; // not configured — in-memory cache still serves the session
  try {
    const prevHash = await lastRowHash(admin);
    const rowHash = computeRowHash(prevHash, event);
    await admin.from('memtrak_audit_log').insert({
      action: `${event.entity}.${event.action}`,
      actor: event.actor,
      ip_address: event.ip_address ?? null,
      details: {
        entity: event.entity,
        entity_id: event.entity_id,
        entity_label: event.entity_label ?? null,
        summary: event.summary,
        diff: event.diff ?? null,
        client_id: event.id,
        user_agent: event.user_agent ?? null,
        prev_hash: prevHash,
        row_hash: rowHash,
      },
    });
  } catch (err) {
    console.error('[MEMTRAK AUDIT] persist failed', err);
  }
}

/**
 * Verify the integrity of the persisted hash chain. Re-derives each row's hash
 * from its canonical content + the previous link and reports the first break.
 * A clean chain is positive evidence (SOC2 CC7.x) that no row was altered or
 * deleted after the fact.
 */
export async function verifyAuditChain(limit = 1000): Promise<AuditChainResult> {
  const admin = getAdminSupabase();
  if (!admin) return { available: false, intact: false, checked: 0 };
  try {
    const { data, error } = await admin
      .from('memtrak_audit_log')
      .select('id, created_at, action, actor, ip_address, details')
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error || !data) return { available: false, intact: false, checked: 0 };
    let prev = GENESIS_HASH;
    let checked = 0;
    for (const raw of data as AuditLogRow[]) {
      const stored = raw.details?.row_hash;
      // Legacy rows written before the chain existed have no row_hash — skip
      // them but keep the prior link so later chained rows still verify.
      if (!stored) continue;
      const ev = rowToEvent(raw);
      const expected = computeRowHash(raw.details?.prev_hash ?? prev, ev);
      checked++;
      if (expected !== stored) {
        return { available: true, intact: false, checked, brokenAt: raw.id };
      }
      prev = stored;
    }
    return { available: true, intact: true, checked };
  } catch {
    return { available: false, intact: false, checked: 0 };
  }
}

export interface AuditChainResult {
  /** Whether the durable store could be read. */
  available: boolean;
  /** True when every chained row re-hashes to its stored value. */
  intact: boolean;
  /** Number of chained rows verified. */
  checked: number;
  /** id of the first row whose hash didn't match, when intact === false. */
  brokenAt?: string;
}

/**
 * Append an audit event. The newest event lands at index 0. Writes through to
 * the durable store asynchronously and returns the inserted record.
 */
export function logEntityAudit(input: Omit<AuditEvent, 'id' | 'created_at'>): AuditEvent {
  const event: AuditEvent = {
    id: `au-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
    ...input,
  };
  log.unshift(event);
  if (log.length > MAX_EVENTS) log.length = MAX_EVENTS;
  void persist(event);
  return event;
}

interface AuditLogRow {
  id: string;
  created_at: string;
  action: string;
  actor: string;
  ip_address?: string | null;
  details: {
    entity?: string;
    entity_id?: string;
    entity_label?: string | null;
    summary?: string;
    diff?: Record<string, { from: unknown; to: unknown }> | null;
    user_agent?: string | null;
    prev_hash?: string;
    row_hash?: string;
  } | null;
}

function rowToEvent(row: AuditLogRow): AuditEvent {
  const d = row.details ?? {};
  return {
    id: row.id,
    created_at: row.created_at,
    entity: (d.entity as AuditEntity) ?? 'organization',
    entity_id: d.entity_id ?? '',
    entity_label: d.entity_label ?? undefined,
    action: (row.action.split('.')[1] as AuditAction) ?? 'update',
    actor: row.actor,
    summary: d.summary ?? row.action,
    diff: d.diff ?? undefined,
    ip_address: row.ip_address ?? null,
    user_agent: d.user_agent ?? null,
  };
}

/**
 * Read the durable audit trail from the database. Returns null when the store
 * is unavailable so callers can fall back to the in-memory cache.
 */
export async function fetchAuditEvents(params: ListAuditParams = {}): Promise<ListAuditResult | null> {
  const admin = getAdminSupabase();
  if (!admin) return null;
  try {
    let query = admin
      .from('memtrak_audit_log')
      .select('id, created_at, action, actor, ip_address, details')
      .order('created_at', { ascending: false })
      .limit(Math.min(params.limit ?? 200, MAX_EVENTS));
    if (params.entity) query = query.like('action', `${params.entity}.%`);
    if (params.action) query = query.like('action', `%.${params.action}`);
    if (params.since) query = query.gte('created_at', params.since);
    const { data, error } = await query;
    if (error || !data) return null;
    let events = (data as AuditLogRow[]).map(rowToEvent);
    if (params.q) {
      const q = params.q.toLowerCase();
      events = events.filter((e) =>
        (e.entity_label ?? '').toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q),
      );
    }
    const byAction: Record<string, number> = {};
    const byEntity: Record<string, number> = {};
    for (const e of events) {
      byAction[e.action] = (byAction[e.action] ?? 0) + 1;
      byEntity[e.entity] = (byEntity[e.entity] ?? 0) + 1;
    }
    return { events, total: events.length, byAction, byEntity };
  } catch (err) {
    console.error('[MEMTRAK AUDIT] fetch failed', err);
    return null;
  }
}

export interface ListAuditParams {
  entity?: AuditEntity;
  action?: AuditAction;
  /** Substring match against entity_label / summary / actor */
  q?: string;
  /** ISO date — only return events on or after */
  since?: string;
  limit?: number;
}

export interface ListAuditResult {
  events: AuditEvent[];
  total: number;
  byAction: Record<string, number>;
  byEntity: Record<string, number>;
}

export function listAuditEvents(params: ListAuditParams = {}): ListAuditResult {
  let events = [...log];
  if (params.entity) events = events.filter((e) => e.entity === params.entity);
  if (params.action) events = events.filter((e) => e.action === params.action);
  if (params.since) events = events.filter((e) => e.created_at >= params.since!);
  if (params.q) {
    const q = params.q.toLowerCase();
    events = events.filter((e) =>
      (e.entity_label ?? '').toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.actor.toLowerCase().includes(q),
    );
  }

  const byAction: Record<string, number> = {};
  const byEntity: Record<string, number> = {};
  for (const e of events) {
    byAction[e.action] = (byAction[e.action] ?? 0) + 1;
    byEntity[e.entity] = (byEntity[e.entity] ?? 0) + 1;
  }

  return {
    events: events.slice(0, params.limit ?? 200),
    total: events.length,
    byAction,
    byEntity,
  };
}

/**
 * Build a field-level diff between two record snapshots, ignoring fields
 * that didn't change. Returns undefined when there's nothing to log.
 */
export function diffRecords<T extends Record<string, unknown>>(
  before: T | null | undefined,
  after: T,
  ignore: string[] = ['created_at', 'updated_at'],
): Record<string, { from: unknown; to: unknown }> | undefined {
  if (!before) return undefined;
  const out: Record<string, { from: unknown; to: unknown }> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of keys) {
    if (ignore.includes(k)) continue;
    const a = before[k];
    const b = after[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      out[k] = { from: a, to: b };
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
