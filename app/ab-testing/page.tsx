'use client';

import Card from '@/components/Card';
import { FlaskConical, AlertTriangle } from 'lucide-react';

/**
 * A/B Testing — test design catalog
 *
 * MEMTrak does not yet ship a statistical testing engine (variant bucketing,
 * per-variant send/open/click capture, two-proportion z-test, auto-winner).
 * Rather than display fabricated p-values, confidence levels, and CI bounds,
 * this page presents the A/B test DESIGNS — the hypotheses and variant copy —
 * that ALTA membership can run once the send engine and a real significance
 * calculation are wired. No invented sample sizes or "winner" claims.
 */

const testDesigns = [
  {
    id: 1, name: 'PFL Compliance Subject Line Test',
    hypothesis: 'Urgency framing ("Action Required") will lift open rate over generic "Important" framing on compliance emails.',
    metric: 'Open rate',
    a: { label: 'Control', subject: 'Important: Your PFL Compliance Status' },
    b: { label: 'Variant', subject: 'Action Required: PFL License Renewal Deadline' },
  },
  {
    id: 2, name: 'Renewal Email Send-Time Test',
    hypothesis: 'A Tuesday-morning send will outperform a Thursday-afternoon send for renewal reminders.',
    metric: 'Open rate',
    a: { label: 'Control', subject: 'Tuesday 9:00 AM ET' },
    b: { label: 'Variant', subject: 'Thursday 2:00 PM ET' },
  },
  {
    id: 3, name: 'ALTA ONE From-Address Test',
    hypothesis: 'A personal CEO from-address will lift open and click rates over the generic membership@ address.',
    metric: 'Open rate + click-through rate',
    a: { label: 'Control', subject: 'From: membership@alta.org' },
    b: { label: 'Variant', subject: 'From: Chief Executive (personal)' },
  },
];

export default function ABTesting() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>A/B Testing</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        Split-test designs for ALTA membership communications.
      </p>

      {/* Honest status banner — no fabricated statistics */}
      <div className="rounded-xl border p-4 mb-6 flex items-start gap-3" style={{ background: 'color-mix(in srgb, var(--accent) 6%, transparent)', borderColor: 'var(--card-border)' }}>
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
        <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          These are test <strong style={{ color: 'var(--heading)' }}>designs</strong> — the hypotheses and variant copy
          ready to run. Live results (sample sizes, open/click rates, statistical significance, and the winning variant)
          require the send engine plus deterministic recipient bucketing and a server-side significance calculation.
          Until those are connected, no sample sizes, p-values, or "winner" labels are shown rather than invented.
        </div>
      </div>

      <div className="space-y-6">
        {testDesigns.map(test => (
          <Card
            key={test.id}
            detailTitle={`${test.name} — Design`}
            detailContent={
              <div className="space-y-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <div>
                  <div className="font-bold mb-1" style={{ color: 'var(--heading)' }}>Hypothesis</div>
                  <div>{test.hypothesis}</div>
                </div>
                <div>
                  <div className="font-bold mb-1" style={{ color: 'var(--heading)' }}>Primary Metric</div>
                  <div>{test.metric}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                    <div className="font-bold mb-1" style={{ color: 'var(--heading)' }}>{test.a.label} (A)</div>
                    <div>{test.a.subject}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                    <div className="font-bold mb-1" style={{ color: 'var(--heading)' }}>{test.b.label} (B)</div>
                    <div>{test.b.subject}</div>
                  </div>
                </div>
                <div className="p-3 rounded-lg border text-[11px]" style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}>
                  Results will populate from real MEMTrak send/open/click events once this test is executed. Statistical
                  significance will be computed with a two-proportion z-test against a 95% confidence threshold.
                </div>
              </div>
            }
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{test.name}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-500/20 text-slate-400">Not yet run</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Primary metric</div>
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{test.metric}</div>
              </div>
            </div>

            <div className="text-[11px] mb-4 p-3 rounded-lg" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--heading)' }}>Hypothesis:</strong> {test.hypothesis}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                <div className="text-xs font-bold mb-2" style={{ color: 'var(--heading)' }}>{test.a.label} (A)</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{test.a.subject}</div>
                <div className="text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>Results pending — no data yet</div>
              </div>
              <div className="p-4 rounded-lg" style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)' }}>
                <div className="text-xs font-bold mb-2" style={{ color: 'var(--heading)' }}>{test.b.label} (B)</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{test.b.subject}</div>
                <div className="text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>Results pending — no data yet</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
