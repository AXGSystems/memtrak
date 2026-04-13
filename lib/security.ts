/**
 * MEMTrak Security Utilities
 * Input validation, sanitization, and API key management.
 */

// Sanitize string input — strip HTML, limit length
export function sanitize(input: string | null, maxLength = 500): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '')  // strip HTML tags
    .replace(/[<>"'&]/g, '')  // strip dangerous chars
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
 * For future use: advertisers and external integrations can authenticate
 * with API keys instead of session cookies.
 *
 * Keys are stored as env vars: MEMTRAK_API_KEY_1, MEMTRAK_API_KEY_2, etc.
 * Or a single MEMTRAK_API_KEYS as comma-separated list.
 */
export function validateApiKey(key: string | null): boolean {
  if (!key) return false;
  const validKeys = process.env.MEMTRAK_API_KEYS?.split(',').map(k => k.trim()) || [];
  // Also check individual key env vars
  for (let i = 1; i <= 10; i++) {
    const envKey = process.env[`MEMTRAK_API_KEY_${i}`];
    if (envKey) validKeys.push(envKey.trim());
  }
  return validKeys.includes(key);
}

/**
 * Audit Log
 * Logs security-relevant events for review.
 * In production, write to database. For now, in-memory with console.
 */
interface AuditEvent {
  timestamp: string;
  action: string;
  ip: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
}

const auditLog: AuditEvent[] = [];

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

  // Console log critical events
  if (severity === 'critical') {
    console.error('[MEMTRAK SECURITY]', event);
  }
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
