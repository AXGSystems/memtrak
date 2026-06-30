/**
 * MEMTrak Security Utilities
 * Input validation, sanitization, and API key management.
 */

/**
 * Light input normaliser — NOT an output-encoding boundary.
 *
 * This strips angle-bracket markup and a few control/dangerous chars so junk
 * doesn't get persisted, but it is deliberately conservative: real XSS safety
 * comes from React's default text-encoding on render and from parameterised
 * Supabase queries, NOT from this function. Never use sanitize() as the sole
 * defense for a value that will be rendered as HTML — use a vetted HTML
 * sanitiser (e.g. DOMPurify) at the render site instead.
 *
 * Iterates the tag strip so nested/malformed constructs like `<<b>script>`
 * can't survive a single pass.
 */
export function sanitize(input: string | null, maxLength = 500): string {
  if (!input) return '';
  let out = input;
  let prev: string;
  do {
    prev = out;
    out = out.replace(/<[^>]*>/g, ''); // strip HTML tags (repeat until stable)
  } while (out !== prev);
  return out
    .replace(/[<>"'&]/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, maxLength);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

// Validate campaign ID (alphanumeric + hyphens only)
export function isValidCampaignId(cid: string): boolean {
  return /^[a-zA-Z0-9\-_]{1,100}$/.test(cid);
}

/**
 * API Key Management
 * ------------------------------------------------------------------
 * External-integration API keys are NEVER stored or compared in plaintext.
 * The live path (see `middleware.ts`) hashes the presented key with SHA-256
 * and looks the digest up against `memtrak_api_keys.key_hash`, with the raw
 * secret kept only client-side. ISO 27001 A.8.24 (Use of Cryptography): no
 * cleartext secret material at rest, no `Array.includes()` plaintext compare
 * (which was also timing-variable). The former env-var `validateApiKey()`
 * helper has been removed to eliminate that dead, weaker code path.
 */

/**
 * Security Audit Log
 *
 * Logs security-relevant events (tracking beacons, rejected requests, etc.).
 * DURABLE: each event is written through to the `memtrak_audit_log` table via
 * the service-role client. The in-memory ring buffer is a per-instance cache
 * only — the database is the source of truth.
 */
interface AuditEvent {
  timestamp: string;
  action: string;
  ip: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
}

const auditLog: AuditEvent[] = [];

async function persistSecurityEvent(event: AuditEvent): Promise<void> {
  // Lazy import keeps the service-role client out of any edge bundle that
  // might transitively import this module's pure validators.
  try {
    const { getAdminSupabase } = await import('@/lib/supabase-admin');
    const admin = getAdminSupabase();
    if (!admin) return;
    await admin.from('memtrak_audit_log').insert({
      action: `security.${event.action}`,
      actor: 'system',
      details: { detail: event.detail, severity: event.severity },
      ip_address: event.ip && event.ip !== 'unknown' ? event.ip : null,
    });
  } catch (err) {
    console.error('[MEMTRAK SECURITY] persist failed', err);
  }
}

/**
 * Out-of-band alert sink for critical security events (SOC2 CC7.4/CC7.5 —
 * incident notification, not just detection). Sends an email via Microsoft
 * Graph when configured, to the address in SECURITY_ALERT_EMAIL (falling back
 * to GRAPH_SENDER). When Graph is NOT configured this degrades to a structured
 * console.error — there is no silent drop and nothing is fabricated. Safe to
 * await (errors are swallowed) so a failed alert can never break the caller.
 *
 * See docs/security/incident-response.md for the escalation path this feeds.
 */
export async function dispatchSecurityAlert(subject: string, detail: string): Promise<void> {
  const line = `[MEMTRAK SECURITY ALERT] ${subject} — ${detail}`;
  // Floor: always emit to the server log so the event is captured even with no
  // mail transport configured.
  console.error(line);
  try {
    const recipient = process.env.SECURITY_ALERT_EMAIL || process.env.GRAPH_SENDER;
    if (!recipient) return; // no destination configured — console floor stands
    const { isGraphConfigured, sendGraphMail } = await import('@/lib/graph');
    if (!isGraphConfigured()) return;
    const from = process.env.GRAPH_SENDER || recipient;
    await sendGraphMail({
      from,
      toEmail: recipient,
      subject: `[MEMTRAK SECURITY] ${subject}`,
      htmlBody:
        `<p style="font-family:system-ui,sans-serif"><strong>Security alert</strong></p>` +
        `<p style="font-family:system-ui,sans-serif">${escapeHtml(subject)}</p>` +
        `<pre style="font-family:ui-monospace,monospace;background:#f6f6f6;padding:12px;border-radius:6px;white-space:pre-wrap">${escapeHtml(detail)}</pre>` +
        `<p style="font-family:system-ui,sans-serif;color:#666;font-size:12px">Sent ${new Date().toISOString()} by MEMTRAK monitoring.</p>`,
    });
  } catch (err) {
    console.error('[MEMTRAK SECURITY] alert dispatch failed', err);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}

export function logAudit(action: string, ip: string, detail: string, severity: AuditEvent['severity'] = 'info') {
  const event: AuditEvent = {
    timestamp: new Date().toISOString(),
    action,
    ip,
    detail,
    severity,
  };
  auditLog.push(event);
  // Keep last 1000 events
  if (auditLog.length > 1000) auditLog.splice(0, auditLog.length - 1000);

  // Critical events: console floor + out-of-band alert (email when configured).
  // Best-effort and non-blocking so a notification hiccup can't break the path.
  if (severity === 'critical') {
    console.error('[MEMTRAK SECURITY]', event);
    void dispatchSecurityAlert(action, `${detail} (ip=${ip})`);
  }

  // Durable write-through (best-effort, non-blocking).
  void persistSecurityEvent(event);
}

export function getAuditLog(limit = 100): AuditEvent[] {
  return auditLog.slice(-limit).reverse();
}

export function getAuditStats() {
  return {
    total: auditLog.length,
    critical: auditLog.filter(e => e.severity === 'critical').length,
    warning: auditLog.filter(e => e.severity === 'warning').length,
    last24h: auditLog.filter(e => new Date(e.timestamp) > new Date(Date.now() - 86400000)).length,
  };
}

/**
 * Map a stored `memtrak_audit_log` row (action prefixed `security.`) back to an
 * AuditEvent for the security view.
 */
interface SecurityLogRow {
  created_at: string;
  action: string;
  details: { detail?: string; severity?: AuditEvent['severity'] } | null;
  ip_address: string | null;
}

function rowToSecurityEvent(row: SecurityLogRow): AuditEvent {
  return {
    timestamp: row.created_at,
    action: row.action.replace(/^security\./, ''),
    ip: row.ip_address ?? 'unknown',
    detail: row.details?.detail ?? '',
    severity: row.details?.severity ?? 'info',
  };
}

/**
 * DURABLE security audit read. Reads the authoritative `memtrak_audit_log`
 * table (security.* rows) via the service-role client rather than the
 * per-instance in-memory ring buffer, which is near-empty on each cold start.
 * Returns null when the store is unavailable so callers can fall back to the
 * cache (never to fabricated data).
 */
export async function fetchSecurityAudit(
  limit = 50,
): Promise<{ events: AuditEvent[]; stats: ReturnType<typeof getAuditStats> } | null> {
  try {
    const { getAdminSupabase } = await import('@/lib/supabase-admin');
    const admin = getAdminSupabase();
    if (!admin) return null;
    const { data, error } = await admin
      .from('memtrak_audit_log')
      .select('created_at, action, details, ip_address')
      .like('action', 'security.%')
      .order('created_at', { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 1000));
    if (error || !data) return null;
    const events = (data as SecurityLogRow[]).map(rowToSecurityEvent);

    const dayAgo = Date.now() - 86_400_000;
    const stats = {
      total: events.length,
      critical: events.filter(e => e.severity === 'critical').length,
      warning: events.filter(e => e.severity === 'warning').length,
      last24h: events.filter(e => new Date(e.timestamp).getTime() > dayAgo).length,
    };
    return { events: events.slice(0, limit), stats };
  } catch {
    return null;
  }
}
