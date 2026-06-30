import type { NextRequest } from 'next/server';

/**
 * Extract the source IP and user-agent from an incoming request so they can be
 * attached to audit events. SOC2 CC7.x expects change records to capture
 * "from where" in addition to "who" and "what".
 *
 * Behind Vercel / a proxy the trusted client IP is in `x-real-ip` (set by the
 * platform to the edge-observed peer). We prefer that, and fall back to the
 * LAST hop of `x-forwarded-for` (the value the trusted proxy appended) rather
 * than the first hop, which is fully client-spoofable. This mirrors
 * middleware.ts `clientIp()` so audit records and rate limiting agree on IP.
 */
export interface AuditContext {
  ip_address: string | null;
  user_agent: string | null;
}

export function auditContext(request: NextRequest): AuditContext {
  const real = request.headers.get('x-real-ip');
  let ip: string | null = real ? real.trim() : null;
  if (!ip) {
    const fwd = request.headers.get('x-forwarded-for');
    if (fwd) {
      const hops = fwd.split(',').map(s => s.trim()).filter(Boolean);
      if (hops.length) ip = hops[hops.length - 1];
    }
  }
  const ua = request.headers.get('user-agent');
  return {
    ip_address: ip && ip.length > 0 ? ip : null,
    user_agent: ua && ua.length > 0 ? ua.slice(0, 512) : null,
  };
}
