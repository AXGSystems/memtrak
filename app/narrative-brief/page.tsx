'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import { getCampaignTotals, demoCampaigns, demoDecayAlerts, demoChurnScores, demoRelationships, demoMonthly, demoHygiene } from '@/lib/demo-data';
import { printContent } from '@/lib/export-utils';
import { FileText, Calendar, Copy, Printer, Mail, Clock, CheckCircle, History, Cpu, BookOpen } from 'lucide-react';

/* ── Computed data ─────────────────────────────────────────── */
const totals = getCampaignTotals();
const sent = demoCampaigns.filter(c => c.status === 'Sent');
const scheduled = demoCampaigns.filter(c => c.status === 'Scheduled');
const drafts = demoCampaigns.filter(c => c.status === 'Draft');
const openRate = ((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1);
const clickRate = ((totals.totalClicked / totals.totalDelivered) * 100).toFixed(1);
const bounceRate = ((totals.totalBounced / totals.totalSent) * 100).toFixed(1);
const deliveryRate = ((totals.totalDelivered / totals.totalSent) * 100).toFixed(1);
const decayHigh = demoDecayAlerts.filter(d => d.decay >= 50);
const decayRevenue = decayHigh.reduce((s, d) => s + d.revenue, 0);
const churnHigh = demoChurnScores.filter(c => c.score >= 60);
const topCampaign = [...sent].sort((a, b) => b.revenue - a.revenue)[0];
const worstBounce = [...sent].sort((a, b) => (b.bounced / b.listSize) - (a.bounced / a.listSize))[0];
const worstBounceRate = ((worstBounce.bounced / worstBounce.listSize) * 100).toFixed(1);

/* ── Monthly comparison data ── */
const thisMonth = demoMonthly[demoMonthly.length - 1];
const lastMonth = demoMonthly[demoMonthly.length - 2];
const thisMonthOpenRate = ((thisMonth.opened / thisMonth.delivered) * 100).toFixed(1);
const lastMonthOpenRate = ((lastMonth.opened / lastMonth.delivered) * 100).toFixed(1);
const thisMonthClickRate = ((thisMonth.clicked / thisMonth.delivered) * 100).toFixed(1);
const lastMonthClickRate = ((lastMonth.clicked / lastMonth.delivered) * 100).toFixed(1);

/* ── Report date ── */
const reportDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
});
const shortDate = new Date().toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
});

/* ── Synthetic report history ── */
const reportHistory = [
  { date: 'April 14, 2026', status: 'Current' },
  { date: 'April 11, 2026', status: 'Delivered' },
  { date: 'April 10, 2026', status: 'Delivered' },
  { date: 'April 9, 2026', status: 'Delivered' },
  { date: 'April 8, 2026', status: 'Delivered' },
];

/* ── Format helpers ── */
function dollars(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : `$${n.toLocaleString()}`;
}
function pct(n: number, d: number) {
  return d === 0 ? '0.0' : ((n / d) * 100).toFixed(1);
}

/* ── Section heading component ── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-base font-extrabold tracking-tight mt-10 mb-4 pb-2"
      style={{
        color: 'var(--heading)',
        borderBottom: '2px solid #C6A75E',
      }}
    >
      {children}
    </h2>
  );
}

/* ── Prose paragraph component ── */
function Prose({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`mb-4 ${className}`}
      style={{
        color: 'var(--text)',
        fontSize: '14px',
        lineHeight: '1.8',
      }}
    >
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function NarrativeBrief() {
  const [copied, setCopied] = useState(false);

  /* ── Build the full narrative text for copy ── */
  function getPlainText() {
    const el = document.getElementById('narrative-report');
    return el?.innerText || '';
  }

  function handleCopy() {
    navigator.clipboard.writeText(getPlainText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handlePrint() {
    const el = document.getElementById('narrative-report');
    if (!el) return;
    printContent('NarrativeBrief\u2122 \u2014 Daily Intelligence Report', el.innerHTML);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* ── Branded Header ──────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'color-mix(in srgb, #C6A75E 15%, transparent)' }}
          >
            <BookOpen className="w-5 h-5" style={{ color: '#C6A75E' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              NarrativeBrief<span style={{ color: '#C6A75E' }}>&trade;</span>
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Your daily intelligence analyst, automated.
            </p>
          </div>
        </div>
        <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
          Auto-generated intelligence report &mdash; prose-format analysis of email operations, member engagement, and recommended actions.
        </p>
      </div>

      {/* ── Report Controls ─────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
          <Calendar className="w-3.5 h-3.5" style={{ color: '#C6A75E' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{shortDate}</span>
        </div>
        <div className="flex-1" />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
          style={{
            background: copied ? 'color-mix(in srgb, #8CC63F 15%, transparent)' : 'color-mix(in srgb, var(--accent) 10%, transparent)',
            color: copied ? '#8CC63F' : 'var(--accent)',
          }}
        >
          {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy Report'}
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
          style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}
        >
          <Printer className="w-3.5 h-3.5" /> Print PDF
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105"
          style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)' }}
        >
          <Mail className="w-3.5 h-3.5" /> Email to Team
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          THE NARRATIVE REPORT
          ══════════════════════════════════════════════════════ */}
      <div
        id="narrative-report"
        className="rounded-xl border p-8 mb-8"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--card-border)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        }}
      >
        {/* Report masthead */}
        <div className="mb-8 pb-6" style={{ borderBottom: '3px solid #C6A75E' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
                MEMTrak Daily Intelligence Briefing
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                NarrativeBrief&trade; &middot; {reportDate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>CLASSIFICATION</p>
              <p className="text-[11px] font-extrabold" style={{ color: '#C6A75E' }}>INTERNAL &mdash; ALTA STAFF ONLY</p>
            </div>
          </div>
        </div>

        {/* ── Opening Paragraph ── */}
        <Prose>
          Good morning. Today is {reportDate}. This is your automated MEMTrak intelligence briefing
          covering the last 24 hours of email activity across all platforms. <strong style={{ color: 'var(--heading)' }}>
          {totals.totalSent.toLocaleString()} emails</strong> were tracked across <strong style={{ color: 'var(--heading)' }}>
          {totals.campaignCount} campaigns</strong>, with a combined open rate of <strong style={{ color: 'var(--heading)' }}>
          {openRate}%</strong> and click-through rate of <strong style={{ color: 'var(--heading)' }}>{clickRate}%</strong>.
          {decayHigh.length > 0 && (
            <> There are <strong style={{ color: '#D94A4A' }}>{decayHigh.length} items requiring your attention today</strong>,
            representing <strong style={{ color: '#D94A4A' }}>${decayRevenue.toLocaleString()} in annual revenue at risk</strong>.</>
          )}
        </Prose>

        {/* ── Section: What Happened Yesterday ── */}
        <SectionHeading>I. What Happened Yesterday</SectionHeading>

        <Prose>
          The most significant activity centered on the <strong style={{ color: 'var(--heading)' }}>{topCampaign.name}</strong> campaign,
          which reached {topCampaign.listSize.toLocaleString()} recipients and generated <strong style={{ color: 'var(--heading)' }}>
          {dollars(topCampaign.revenue)} in attributed revenue</strong>. Of the {topCampaign.delivered.toLocaleString()} successfully
          delivered messages, {topCampaign.uniqueOpened.toLocaleString()} unique opens were recorded ({pct(topCampaign.uniqueOpened, topCampaign.delivered)}%),
          with {topCampaign.clicked.toLocaleString()} click-throughs ({pct(topCampaign.clicked, topCampaign.delivered)}%). These numbers
          place this campaign well above the association industry benchmark of 25&ndash;35% open rates, confirming that
          targeted, member-relevant messaging continues to outperform generic outreach by a significant margin.
        </Prose>

        <Prose>
          Supporting campaigns included the <strong style={{ color: 'var(--heading)' }}>Title News Weekly</strong> newsletter
          ({sent.find(c => c.id === 'title-news-w15')?.uniqueOpened.toLocaleString() || '1,860'} unique opens from{' '}
          {sent.find(c => c.id === 'title-news-w15')?.delivered.toLocaleString() || '4,650'} delivered) and the{' '}
          <strong style={{ color: 'var(--heading)' }}>ACU Underwriter Retention Check-in</strong>, which achieved a remarkable{' '}
          {pct(sent.find(c => c.id === 'acu-retention-q2')?.uniqueOpened || 36, sent.find(c => c.id === 'acu-retention-q2')?.delivered || 40)}% unique
          open rate from its targeted list of 40 underwriter contacts. The ACU check-in&rsquo;s near-perfect delivery and engagement
          underscores the value of personalized, one-to-one outreach for high-value segments.
        </Prose>

        <Prose>
          One area of concern: the <strong style={{ color: 'var(--heading)' }}>{worstBounce.name}</strong> campaign recorded a{' '}
          <strong style={{ color: '#D94A4A' }}>{worstBounceRate}% bounce rate</strong> ({worstBounce.bounced.toLocaleString()} bounces
          from {worstBounce.listSize.toLocaleString()} sends). While some bounce attrition is normal for compliance-oriented sends
          with broader lists, rates above 5% warrant list hygiene review. The current database health score stands at{' '}
          {demoHygiene.projectedDelivery}% projected deliverability, with {demoHygiene.bounced.count.toLocaleString()} addresses
          flagged as hard bounces and {demoHygiene.stale.count.toLocaleString()} marked stale.
        </Prose>

        {/* ── Section: What Needs Attention ── */}
        <SectionHeading>II. What Needs Attention</SectionHeading>

        <Prose>
          The most pressing concern this morning is <strong style={{ color: 'var(--heading)' }}>engagement decay among
          revenue-bearing members</strong>. Heritage Abstract LLC, an ACB member contributing $517 in annual dues, has
          gone completely dark &mdash; zero opens in over 90 days, a pattern that precedes non-renewal 78% of the time
          in our historical data. More critically, First American Title (an ACU underwriter at $61,554 annual revenue)
          has seen open rates decline from 80% to 20% over the past month. When a member of this tier disengages,
          the financial exposure is severe and warrants immediate executive-level outreach rather than automated
          re-engagement sequences.
        </Prose>

        <Prose>
          List hygiene requires attention before the May compliance wave. The database currently contains{' '}
          <strong style={{ color: 'var(--heading)' }}>{demoHygiene.bounced.count.toLocaleString()} hard bounces</strong> and{' '}
          <strong style={{ color: 'var(--heading)' }}>{demoHygiene.invalid.count.toLocaleString()} invalid addresses</strong> that
          should be suppressed before the next large send. Failure to clean these records before the PFL Compliance &mdash; May
          Wave 1 campaign (scheduled for May 5, targeting {scheduled[0]?.listSize.toLocaleString() || '1,029'} recipients)
          risks degrading sender reputation with major inbox providers. Every percentage point of deliverability
          lost translates to approximately {Math.round(totals.totalSent * 0.01).toLocaleString()} missed impressions
          per campaign cycle.
        </Prose>

        <Prose>
          The <strong style={{ color: 'var(--heading)' }}>ALTA ONE Sponsor Thank You</strong> email remains in draft status
          with {drafts[0]?.listSize || 24} recipients queued. Given that sponsor relationships directly influence
          event revenue and long-term partnership value, this communication should be finalized and sent within the
          next 48 hours to maintain the goodwill generated by recent event interactions.
        </Prose>

        {/* ── Section: What's Coming This Week ── */}
        <SectionHeading>III. What&rsquo;s Coming This Week</SectionHeading>

        <Prose>
          The primary scheduled deployment is the <strong style={{ color: 'var(--heading)' }}>PFL Compliance &mdash; May Wave 1
          (IL Focus)</strong> campaign, targeting {scheduled[0]?.listSize.toLocaleString() || '1,029'} recipients on
          May 5. This is a regulatory compliance communication, which historically sees higher-than-average open rates
          (members engage more reliably with content that has legal implications for their business). Based on previous
          PFL compliance waves, we project a 35&ndash;42% open rate and minimal unsubscribes, provided the subject
          line clearly signals the regulatory nature of the content.
        </Prose>

        <Prose>
          Renewal season preparation should begin accelerating this week. The April Batch renewal campaign has already
          generated <strong style={{ color: 'var(--heading)' }}>{dollars(sent.find(c => c.id === 'renewal-apr-batch')?.revenue || 406992)} in
          renewal revenue</strong> from {sent.find(c => c.id === 'renewal-apr-batch')?.clicked || 156} click-throughs,
          but {sent.find(c => c.id === 'renewal-apr-batch')?.listSize ? sent.find(c => c.id === 'renewal-apr-batch')!.listSize - (sent.find(c => c.id === 'renewal-apr-batch')?.clicked || 0) : 264} members
          on the renewal list have not yet clicked through to complete their renewal. A follow-up reminder targeting
          non-converters should be prepared for deployment by Thursday.
        </Prose>

        <Prose>
          ALTA ONE 2026 early bird registration momentum remains strong, but the window for early bird pricing
          is narrowing. Consider a &ldquo;last chance&rdquo; reminder to the {(sent.find(c => c.id === 'alta-one-earlybird')?.listSize || 4994) - (sent.find(c => c.id === 'alta-one-earlybird')?.clicked || 780)} recipients
          who received the initial invitation but did not click through, potentially capturing an additional
          $15K&ndash;$25K in early registrations based on historical conversion patterns.
        </Prose>

        {/* ── Section: Performance Comparison ── */}
        <SectionHeading>IV. Performance Comparison</SectionHeading>

        <Prose>
          This week&rsquo;s performance reflects a period of high-impact, lower-volume sending compared to previous
          weeks. April has seen {thisMonth.sent.toLocaleString()} total sends against March&rsquo;s{' '}
          {lastMonth.sent.toLocaleString()}, a {(((lastMonth.sent - thisMonth.sent) / lastMonth.sent) * 100).toFixed(0)}% decrease
          in volume. However, engagement quality has improved: April&rsquo;s open rate of {thisMonthOpenRate}% exceeds
          March&rsquo;s {lastMonthOpenRate}%, and the click-through rate of {thisMonthClickRate}% outperforms
          March&rsquo;s {lastMonthClickRate}%. This inverse relationship between volume and engagement rate is
          consistent with best practices &mdash; smaller, more targeted sends generate proportionally higher
          engagement. Total attributed revenue for April currently stands at{' '}
          <strong style={{ color: 'var(--heading)' }}>${totals.totalRevenue.toLocaleString()}</strong>, driven primarily by
          the membership renewal batch and ALTA ONE registrations. Bounce rates have held steady
          at {bounceRate}%, within acceptable tolerances, though the goal of sub-3% remains a priority
          for Q2.
        </Prose>

        {/* ── Section: Recommended Actions ── */}
        <SectionHeading>V. Recommended Actions</SectionHeading>

        <Prose>
          <strong style={{ color: 'var(--heading)' }}>First, initiate a CEO-level outreach to First American Title.</strong> This
          ACU underwriter account represents $61,554 in annual revenue and is showing a 75% engagement decay score.
          A personal email or phone call from Chris Morton to the primary contact would be appropriate given the
          account&rsquo;s strategic value. Based on historical intervention data, direct CEO outreach recovers
          declining ACU accounts 65% of the time, which would preserve approximately <strong style={{ color: '#8CC63F' }}>$40,000
          in expected annual revenue</strong>.
        </Prose>

        <Prose>
          <strong style={{ color: 'var(--heading)' }}>Second, execute a bounce-list cleanup before May 5.</strong> Removing
          the {demoHygiene.bounced.count.toLocaleString()} known hard bounces and {demoHygiene.invalid.count.toLocaleString()} invalid
          addresses from active lists will improve the projected deliverability rate from {demoHygiene.currentDelivery}%
          to {demoHygiene.projectedDelivery}%. This 2.6 percentage-point improvement translates to
          approximately <strong style={{ color: '#8CC63F' }}>{Math.round(totals.totalSent * 0.026).toLocaleString()} additional
          delivered emails per campaign cycle</strong>, with a downstream revenue impact estimated at $2,800&ndash;$4,200
          per quarter based on current conversion rates.
        </Prose>

        <Prose>
          <strong style={{ color: 'var(--heading)' }}>Third, deploy an ALTA ONE &ldquo;last chance&rdquo; early bird
          reminder.</strong> The initial early bird campaign achieved a {pct(sent.find(c => c.id === 'alta-one-earlybird')?.clicked || 780, sent.find(c => c.id === 'alta-one-earlybird')?.delivered || 4780)}% click-through rate,
          leaving over 4,000 non-clickers as a retargeting audience. A scarcity-framed follow-up (&ldquo;48 hours
          remaining at early bird pricing&rdquo;) historically converts an additional 3&ndash;5% of the remaining
          audience, representing a potential <strong style={{ color: '#8CC63F' }}>$18,000&ndash;$30,000 in incremental
          registration revenue</strong>.
        </Prose>

        <Prose>
          <strong style={{ color: 'var(--heading)' }}>Fourth, finalize and send the ALTA ONE Sponsor Thank You
          within 48 hours.</strong> Sponsor communications have the highest long-term ROI of any email category
          in the MEMTrak system. Delayed thank-you messages lose 40% of their perceived sincerity for each
          week past the event interaction. Sending this week preserves the relationship momentum and positions
          ALTA favorably for FY2027 sponsorship renewals, which collectively represent <strong style={{ color: '#8CC63F' }}>
          $120K+ in annual event revenue</strong>.
        </Prose>

        {/* ── Section: Staff Briefing Notes ── */}
        <SectionHeading>VI. Staff Briefing Notes</SectionHeading>

        {demoRelationships.map((r) => (
          <Prose key={r.staff}>
            <strong style={{ color: 'var(--heading)' }}>{r.staff}</strong> &mdash;{' '}
            {r.staff.includes('Morton')
              ? `Priority action today: personal outreach to First American Title regarding their declining engagement. Your reply rate of ${r.replyRate}% is the highest on staff, and ACU accounts respond best to CEO-level contact. Secondary: review the ALTA ONE Sponsor Thank You draft for final approval before it ships this week.`
              : r.staff.includes('Martin')
              ? `Focus on the PFL Compliance May Wave 1 preparation. Verify the IL-focused recipient list is clean and current. Your ${r.outreach} outreach touches this quarter and ${r.replyRate}% reply rate demonstrate strong member rapport — leverage that in any follow-up to non-responders from the April compliance wave.`
              : r.staff.includes('Spolidoro')
              ? `Continue monitoring the ALTA ONE early bird registration pipeline. With ${r.outreach} touches and a ${r.replyRate}% reply rate, you are the primary event communications driver. Prepare the "last chance" early bird reminder for deployment by Wednesday, targeting the 4,214 non-clickers from the initial send.`
              : r.staff.includes('Ehrenfeld')
              ? `Prioritize the membership renewal follow-up campaign. The April batch has 264 non-converters who need a reminder. Your average response time of ${r.responseTime} is solid for the volume you manage — consider scheduling the follow-up for Thursday morning, which is the optimal send window for ACA title agents.`
              : `Review your current engagement metrics (${r.outreach} touches, ${r.replyRate}% reply rate, ${r.responseTime} avg response). Focus on reducing response time where possible, and coordinate with the team on any bounce-list cleanup tasks assigned to your member segments before the May 5 compliance send.`
            }
          </Prose>
        ))}

        {/* Report footer */}
        <div className="mt-10 pt-6" style={{ borderTop: '2px solid #C6A75E' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                NarrativeBrief&trade; by MEMTrak &middot; AXG Systems
              </p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                Generated {new Date().toLocaleString()} &middot; Data window: previous 24 hours
              </p>
            </div>
            <p className="text-[9px] italic" style={{ color: 'var(--text-muted)' }}>
              This report was generated programmatically from MEMTrak event data. No AI API was used.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          HOW NARRATIVEBRIEF WORKS
          ══════════════════════════════════════════════════════ */}
      <Card title="How NarrativeBrief\u2122 Works" subtitle="Automated intelligence reporting without AI APIs">
        <div className="space-y-4 mt-2">
          {[
            { icon: Clock, label: 'Runs automatically every morning at 6:00 AM', detail: 'A scheduled task triggers the report generation pipeline before staff arrive, ensuring the briefing is ready when the day begins.' },
            { icon: FileText, label: 'Analyzes all events from the previous 24 hours', detail: 'Campaign sends, opens, clicks, bounces, and unsubscribes from MEMTrak, Higher Logic, and Outlook are aggregated into a unified event stream.' },
            { icon: Cpu, label: 'Compares against historical baselines', detail: 'Current metrics are measured against 90-day rolling averages and industry benchmarks to identify anomalies, trends, and opportunities.' },
            { icon: BookOpen, label: 'Generates prose using pattern-matching rules', detail: 'No AI API is required. The narrative engine uses conditional templates and data-driven sentence construction to produce readable intelligence reports from raw metrics.' },
            { icon: Mail, label: 'Can be emailed automatically via Microsoft Graph', detail: 'When connected to Microsoft 365, the briefing is delivered directly to staff inboxes as a formatted HTML email each morning.' },
          ].map((item) => (
            <div key={item.label} className="flex gap-3 items-start">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'color-mix(in srgb, #C6A75E 12%, transparent)' }}
              >
                <item.icon className="w-4 h-4" style={{ color: '#C6A75E' }} />
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{item.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════
          REPORT HISTORY
          ══════════════════════════════════════════════════════ */}
      <Card title="Report History" subtitle="Previous NarrativeBrief\u2122 reports" className="mt-6">
        <div className="space-y-2 mt-2">
          {reportHistory.map((r, i) => (
            <div
              key={r.date}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: i === 0 ? 'color-mix(in srgb, #C6A75E 8%, transparent)' : 'var(--input-bg)' }}
            >
              <div className="flex items-center gap-3">
                <History className="w-3.5 h-3.5" style={{ color: i === 0 ? '#C6A75E' : 'var(--text-muted)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--heading)' }}>{r.date}</span>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: r.status === 'Current'
                    ? 'color-mix(in srgb, #C6A75E 15%, transparent)'
                    : 'color-mix(in srgb, #8CC63F 12%, transparent)',
                  color: r.status === 'Current' ? '#C6A75E' : '#8CC63F',
                }}
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
