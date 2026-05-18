/**
 * AMS audit trail. Records entity-level changes (create / update / delete)
 * for member-data records. Distinct from `lib/security.ts`, which logs
 * security events (auth, rate limiting, etc.).
 *
 * In-memory ring buffer for now — when a `memtrak_audit_log` table lands
 * the persist path can be added without changing callers.
 */

export type AuditAction = 'create' | 'update' | 'delete' | 'mark_paid' | 'recompute_engagement' | 'import' | 'revoke';
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
}

const MAX_EVENTS = 5000;
const log: AuditEvent[] = seedDemoEvents();

function seedDemoEvents(): AuditEvent[] {
  // 8 representative events spread across the recent past to populate the UI.
  const now = Date.now();
  const offset = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();
  return [
    { id: 'au-001', created_at: offset(0.5), entity: 'invoice',  entity_id: 'inv-001', entity_label: 'INV-2025-001', action: 'mark_paid', actor: 'Paul Martin',     summary: 'Marked INV-2025-001 paid via ACH ($61,554)', diff: { status: { from: 'Sent', to: 'Paid' }, payment_method: { from: null, to: 'ACH' } } },
    { id: 'au-002', created_at: offset(2),   entity: 'organization', entity_id: 'demo-acu-005', entity_label: 'WFG National Title Insurance', action: 'update',  actor: 'Caroline Ehrenfeld', summary: 'Updated WFG National Title Insurance', diff: { tier: { from: 'Standard', to: 'Enterprise' } } },
    { id: 'au-003', created_at: offset(4),   entity: 'contact',  entity_id: 'c-004-2', entity_label: 'Linda Park', action: 'create', actor: 'Taylor Spolidoro', summary: 'Added contact Linda Park (Fidelity)' },
    { id: 'au-004', created_at: offset(6),   entity: 'organization', entity_id: 'demo-new-082', entity_label: 'TrueVault Title', action: 'create', actor: 'Emily Mincey', summary: 'Created TrueVault Title (ACB, $2,450 dues)' },
    { id: 'au-005', created_at: offset(20),  entity: 'invoice',  entity_id: 'inv-301', entity_label: 'INV-2026-301', action: 'create', actor: 'system', summary: 'Generated INV-2026-301 for North American Title' },
    { id: 'au-006', created_at: offset(28),  entity: 'event_attendance', entity_id: 'att-201', entity_label: 'TIPAC Reception — Patrick Sullivan', action: 'update', actor: 'Caroline Ehrenfeld', summary: 'Checked in Patrick Sullivan at TIPAC Reception', diff: { registration_status: { from: 'Registered', to: 'Attended' } } },
    { id: 'au-007', created_at: offset(40),  entity: 'organization', entity_id: 'demo-lapsed-070', entity_label: 'Pacific Title Group', action: 'update', actor: 'Paul Martin', summary: 'Marked Pacific Title Group as Lapsed', diff: { status: { from: 'Active', to: 'Lapsed' }, health_tier: { from: 'Disengaged', to: 'Gone Dark' } } },
    { id: 'au-008', created_at: offset(56),  entity: 'organization', entity_id: 'demo-acu-004', entity_label: 'Fidelity National Financial', action: 'recompute_engagement', actor: 'system', summary: 'Recomputed Fidelity engagement: 88 → 80', diff: { engagement_score: { from: 88, to: 80 } } },
  ];
}

/**
 * Append an audit event. The newest event lands at index 0. Returns the
 * inserted record.
 */
export function logEntityAudit(input: Omit<AuditEvent, 'id' | 'created_at'>): AuditEvent {
  const event: AuditEvent = {
    id: `au-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
    ...input,
  };
  log.unshift(event);
  if (log.length > MAX_EVENTS) log.length = MAX_EVENTS;
  return event;
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
