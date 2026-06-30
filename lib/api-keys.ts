/**
 * Edge-safe API key helpers. Used by both:
 *   • middleware (Bearer auth on /api/memtrak/*)
 *   • admin routes that create/verify keys
 *
 * Format:    mtk_live_<32 base32 chars>          (38 chars total)
 * Prefix:    first 12 chars of the secret        (e.g. "mtk_live_AB")
 * Storage:   SHA-256 hex digest in memtrak_api_keys.key_hash
 *
 * No Node-only deps — uses SubtleCrypto + getRandomValues so this file
 * works in the edge runtime.
 */

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  key_hash: string;
  scopes: string[];
  created_by: string | null;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
  note: string | null;
}

const SECRET_PREFIX = 'mtk_live_';
const SECRET_BODY_LEN = 32;

/** Generate a brand-new opaque secret (caller hashes and stores it). */
export function generateApiKeySecret(): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; // base32 (no 0/1/8/9 ambiguity)
  const bytes = new Uint8Array(SECRET_BODY_LEN);
  crypto.getRandomValues(bytes);
  let body = '';
  for (let i = 0; i < bytes.length; i++) body += alphabet[bytes[i] % alphabet.length];
  return `${SECRET_PREFIX}${body}`;
}

export function prefixOf(secret: string): string {
  // First 12 chars — enough to be useful in the UI without leaking entropy.
  return secret.slice(0, 12);
}

export async function hashApiKey(secret: string): Promise<string> {
  const buf = new TextEncoder().encode(secret);
  const digest = await crypto.subtle.digest('SHA-256', buf as BufferSource);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Extract a Bearer token from a Headers object. Returns null when:
 *   • no Authorization header
 *   • header isn't Bearer
 *   • token doesn't look like one of our keys (cheap pre-check)
 */
export function extractBearer(headers: Headers): string | null {
  const auth = headers.get('authorization') ?? headers.get('Authorization');
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(\S+)$/i);
  if (!m) return null;
  const token = m[1];
  if (!token.startsWith(SECRET_PREFIX)) return null;
  return token;
}

/**
 * Returns true when the scope list permits the (method, path) combo.
 * An EMPTY scope list grants NO access (deny) — keys must be created with
 * explicit scopes. Scope strings look like:
 *   "GET:/api/memtrak/members"        → exact verb + path prefix
 *   "*:/api/memtrak/invoices"         → any method on that prefix
 *   "GET:/api/memtrak"                → all GETs under /api/memtrak
 *   "*:/api/memtrak"                  → full access (must be explicit)
 */
export function scopeAllows(scopes: string[], method: string, pathname: string): boolean {
  if (!scopes.length) return false; // deny by default — no scopes, no access
  const upper = method.toUpperCase();
  for (const s of scopes) {
    const [verb, prefix] = s.split(':');
    if (!prefix) continue;
    if (verb !== '*' && verb.toUpperCase() !== upper) continue;
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return true;
  }
  return false;
}
