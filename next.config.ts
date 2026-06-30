import type { NextConfig } from "next";

/**
 * Baseline security headers, defined here so they apply to EVERY path —
 * including paths excluded by the middleware matcher (static assets, etc.).
 * The middleware layers on a few path-specific tweaks (e.g. dropping
 * X-Frame-Options for the email tracking pixel).
 *
 * CSP notes:
 *  • `unsafe-eval` is intentionally NOT present — eval()/new Function() are
 *    blocked, neutralising a large class of XSS payloads.
 *  • `unsafe-inline` is retained ONLY for style-src (Tailwind/Next inline
 *    styles). script-src keeps it for the Next.js bootstrap inline script;
 *    a per-request nonce strategy is the follow-up to drop it entirely.
 *  • frame-ancestors 'none' replaces reliance on X-Frame-Options alone.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: CSP },
];

const nextConfig: NextConfig = {
  /**
   * Tree-shake heavy barrel imports so only the modules actually used ship in
   * each route's first-load JS (a Core Web Vitals win — smaller bundles → lower
   * LCP/INP, less main-thread parse/compile on mobile).
   *
   * `lucide-react` IS in this Next version's default allow-list, but we list it
   * explicitly so per-icon tree-shaking is guaranteed regardless of future
   * default-list changes — it sits on every route's first-load path here, so
   * shipping only the imported icons materially trims first-load JS (INP/TBT).
   * `chart.js` is NOT in the default allow-list, so we opt it in explicitly.
   */
  experimental: {
    optimizePackageImports: ['lucide-react', 'chart.js', 'chartjs-plugin-datalabels'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
