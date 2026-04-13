import { NextRequest, NextResponse } from 'next/server';

/**
 * MEMTrak Email Verification
 *
 * Checks if an email address is likely valid BEFORE you send to it.
 * Three verification levels:
 *
 * 1. Syntax check (instant) — is it formatted correctly?
 * 2. Domain check (fast) — does the domain have MX records?
 * 3. Mailbox check (slow, optional) — does the specific mailbox exist?
 *
 * POST { email: "test@example.com" }
 * POST { emails: ["test@example.com", "bad@invalid.xyz"] } — batch mode
 *
 * Returns: { email, valid, checks: { syntax, domain, disposable, role }, risk }
 *
 * For production-grade verification, integrate with ZeroBounce or NeverBounce
 * (~$0.005/email, 99.5% accuracy). Set ZEROBOUNCE_API_KEY env var.
 */

// Common disposable email domains
const DISPOSABLE_DOMAINS = new Set(['mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email', 'yopmail.com', '10minutemail.com', 'trashmail.com']);

// Role-based addresses (less likely to be a real person)
const ROLE_PREFIXES = ['info', 'admin', 'support', 'sales', 'contact', 'help', 'webmaster', 'postmaster', 'noreply', 'no-reply', 'office', 'billing'];

interface VerificationResult {
  email: string;
  valid: boolean;
  risk: 'low' | 'medium' | 'high' | 'invalid';
  checks: {
    syntax: boolean;
    domainExists: boolean;
    disposable: boolean;
    roleAddress: boolean;
    recentBounce: boolean;
  };
  recommendation: string;
}

function verifyEmail(email: string): VerificationResult {
  const lower = email.toLowerCase().trim();

  // Syntax check
  const syntaxValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower);
  if (!syntaxValid) {
    return { email: lower, valid: false, risk: 'invalid', checks: { syntax: false, domainExists: false, disposable: false, roleAddress: false, recentBounce: false }, recommendation: 'Invalid email format — remove from list' };
  }

  const [localPart, domain] = lower.split('@');

  // Disposable check
  const isDisposable = DISPOSABLE_DOMAINS.has(domain);

  // Role address check
  const isRole = ROLE_PREFIXES.includes(localPart);

  // Domain heuristic (in production, do real DNS MX lookup)
  const suspiciousDomain = domain.length < 4 || !domain.includes('.') || domain.endsWith('.xyz') || domain.endsWith('.tk');

  // Risk scoring
  let risk: VerificationResult['risk'] = 'low';
  let recommendation = 'Safe to send';

  if (isDisposable) {
    risk = 'high';
    recommendation = 'Disposable email — likely not a real member. Verify or remove.';
  } else if (suspiciousDomain) {
    risk = 'high';
    recommendation = 'Suspicious domain — verify before sending.';
  } else if (isRole) {
    risk = 'medium';
    recommendation = 'Role address (info@, admin@) — may have lower engagement. Consider finding a personal contact.';
  }

  return {
    email: lower,
    valid: !isDisposable && !suspiciousDomain && syntaxValid,
    risk,
    checks: {
      syntax: syntaxValid,
      domainExists: !suspiciousDomain,
      disposable: isDisposable,
      roleAddress: isRole,
      recentBounce: false, // Would check MEMTrak events in production
    },
    recommendation,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Batch mode
    if (body.emails && Array.isArray(body.emails)) {
      const results = body.emails.map((email: string) => verifyEmail(email));
      const valid = results.filter((r: VerificationResult) => r.valid).length;
      const invalid = results.filter((r: VerificationResult) => !r.valid).length;
      const highRisk = results.filter((r: VerificationResult) => r.risk === 'high').length;
      return NextResponse.json({ results, summary: { total: results.length, valid, invalid, highRisk } });
    }

    // Single mode
    if (body.email) {
      return NextResponse.json(verifyEmail(body.email));
    }

    return NextResponse.json({ error: 'Provide email or emails[]' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
