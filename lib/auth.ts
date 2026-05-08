/**
 * MEMTrak auth — passphrase-gated session, edge-compatible.
 *
 * Auth is strictly off by default. It activates only when BOTH env vars
 * are set:
 *   MEMTRAK_AUTH_ENABLED   = "true"
 *   MEMTRAK_AUTH_PASSPHRASE
 *
 * Without those, every request bypasses the gate. This keeps live
 * deploys safe across rollouts of this code.
 */

export type AuthRole = 'admin' | 'staff' | 'read-only';

export interface SessionPayload {
  role: AuthRole;
  /** Unix seconds */
  exp: number;
}

const COOKIE_NAME = 'memtrak_session';
const SESSION_HOURS = 12;

const enc = (s: string) => new TextEncoder().encode(s);

/** True when both env vars are set. Always false in client/edge contexts where they're missing. */
export function isAuthEnabled(): boolean {
  return process.env.MEMTRAK_AUTH_ENABLED === 'true' && Boolean(process.env.MEMTRAK_AUTH_PASSPHRASE);
}

function getSecretKeyBytes(): Uint8Array {
  // The session-signing secret. Falls back to the passphrase so deployers
  // only need to set one variable. In production set MEMTRAK_AUTH_SECRET
  // explicitly to a long random string.
  const secret = process.env.MEMTRAK_AUTH_SECRET ?? process.env.MEMTRAK_AUTH_PASSPHRASE ?? '';
  return enc(secret);
}

const b64url = (bytes: ArrayBuffer | Uint8Array): string => {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64url = (str: string): Uint8Array => {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(str.length / 4) * 4, '=');
  const bin = atob(padded);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
};

async function importKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    getSecretKeyBytes() as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

/** Sign a session payload, returning `<payload>.<sig>` cookie value. */
export async function signSession(payload: SessionPayload): Promise<string> {
  const json = JSON.stringify(payload);
  const payloadB64 = b64url(enc(json));
  const key = await importKey();
  const sig = await crypto.subtle.sign('HMAC', key, enc(payloadB64));
  return `${payloadB64}.${b64url(sig)}`;
}

/**
 * Verifies and parses a cookie value. Returns null on any failure
 * (bad shape, bad signature, expired). Never throws.
 */
export async function verifySession(cookieValue: string | undefined): Promise<SessionPayload | null> {
  if (!cookieValue) return null;
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  try {
    const key = await importKey();
    const ok = await crypto.subtle.verify('HMAC', key, fromB64url(sigB64) as BufferSource, enc(payloadB64) as BufferSource);
    if (!ok) return null;
    const json = new TextDecoder().decode(fromB64url(payloadB64));
    const payload = JSON.parse(json) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Returns the cookie name + base options for set/clear. */
export const SESSION_COOKIE = {
  name: COOKIE_NAME,
  sessionHours: SESSION_HOURS,
};

export function newSessionPayload(role: AuthRole): SessionPayload {
  return { role, exp: Math.floor(Date.now() / 1000) + SESSION_HOURS * 60 * 60 };
}

const ROLE_RANK: Record<AuthRole, number> = { admin: 3, staff: 2, 'read-only': 1 };

/** True when the session role meets or exceeds the required role. */
export function hasRole(session: SessionPayload | null, required: AuthRole): boolean {
  if (!session) return false;
  return ROLE_RANK[session.role] >= ROLE_RANK[required];
}
