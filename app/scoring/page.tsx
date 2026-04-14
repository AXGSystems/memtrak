'use client';

import Card, { KpiCard } from '@/components/Card';
import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import { exportCSV } from '@/lib/export-utils';
import { Download, Users, DollarSign, AlertTriangle } from 'lucide-react';

const C = { navy: '#002D5C', blue: '#4A90D9', green: '#8CC63F', red: '#D94A4A', orange: '#E8923F', purple: '#a855f7' };

// Engagement scoring model — what ActiveCampaign charges $186/mo for
const scoringModel = [
  { factor: 'Email Opens (last 90d)', weight: 25, description: 'How often they open emails from ALTA' },
  { factor: 'Email Clicks (last 90d)', weight: 20, description: 'Did they click through to content or registration?' },
  { factor: 'Event Attendance (YTD)', weight: 20, description: 'Webinars, conferences, regional events' },
  { factor: 'Committee Participation', weight: 15, description: 'Engagement group or board involvement' },
  { factor: 'Dues Payment Timeliness', weight: 10, description: 'Early, on-time, late, or overdue' },
  { factor: 'Website Activity (GA4)', weight: 10, description: 'Page views, resource downloads, login frequency' },
];

// Member scores — what Klaviyo charges $150/mo+ for
const memberScores = [
  { org: 'First American Title', type: 'ACU', score: 94, ltv: 308000, trend: 'stable', emails: 92, clicks: 45, events: 8, dues: 'Early', risk: 'Low' },
  { org: 'Commonwealth Land Title', type: 'ACA', score: 87, ltv: 12160, trend: 'rising', emails: 88, clicks: 38, events: 5, dues: 'On-time', risk: 'Low' },
  { org: 'Old Republic Title', type: 'ACU', score: 82, ltv: 246000, trend: 'stable', emails: 78, clicks: 32, events: 4, dues: 'On-time', risk: 'Low' },
  { org: 'Liberty Title Group', type: 'ACA', score: 65, ltv: 8512, trend: 'declining', emails: 50, clicks: 18, events: 2, dues: 'On-time', risk: 'Medium' },
  { org: 'Stewart Title', type: 'ACU', score: 58, ltv: 184662, trend: 'declining', emails: 42, clicks: 12, events: 1, dues: 'Late', risk: 'High' },
  { org: 'National Title Services', type: 'REA', score: 38, ltv: 2646, trend: 'declining', emails: 30, clicks: 5, events: 0, dues: 'Late', risk: 'High' },
  { org: 'Heritage Abstract LLC', type: 'ACB', score: 8, ltv: 1551, trend: 'gone-dark', emails: 0, clicks: 0, events: 0, dues: 'Overdue', risk: 'Critical' },
];

const scoreDistribution = [
  { range: '90-100 (Champions)', count: 420, pct: 8.4, color: C.green },
  { range: '70-89 (Engaged)', count: 1850, pct: 37.1, color: C.blue },
  { range: '50-69 (At Risk)', count: 1520, pct: 30.4, color: C.orange },
  { range: '25-49 (Disengaged)', count: 860, pct: 17.2, color: C.red },
  { range: '0-24 (Gone Dark)', count: 344, pct: 6.9, color: '#666' },
];

const riskColors: Record<string, string> = { Low: 'text-green-400', Medium: 'text-amber-400', High: 'text-red-400', Critical: 'text-red-500 font-extrabold' };

export default function Scoring() {
  const totalMembers = scoreDistribution.reduce((s, d) => s + d.count, 0);
  const avgScore = Math.round(memberScores.reduce((s, m) => s + m.score, 0) / memberScores.length);
  const totalLTV = memberScores.reduce((s, m) => s + m.ltv, 0);
  const atRiskCount = memberScores.filter(m => m.risk === 'High' || m.risk === 'Critical').length;

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Engagement Scoring & Member Lifetime Value</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Per-member composite scoring + predicted lifetime revenue — what ActiveCampaign and Klaviyo charge $300+/mo for. MEMTrak does it for free.</p>

      {/* Score Distribution KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6 stagger-children">
        {scoreDistribution.map(d => (
          <KpiCard
            key={d.range}
            label={d.range}
            value={d.count.toLocaleString()}
            sub={`${d.pct}% of members`}
            color={d.color}
            detail={
              <div className="space-y-3">
                <div className="text-xs" style={{ color: 'var(--heading)' }}>
                  <strong>{d.count.toLocaleString()}</strong> members fall in the <strong>{d.range}</strong> scoring tier, representing <strong>{d.pct}%</strong> of total membership.
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {d.pct > 30
                    ? 'This is the largest segment. Focus re-engagement campaigns here for maximum impact.'
                    : d.pct > 15
                    ? 'A significant portion of members. Monitor for movement into higher or lower tiers.'
                    : d.pct < 10 && d.color === C.green
                    ? 'Your most engaged advocates. Leverage them as ambassadors and testimonial sources.'
                    : 'A smaller but important segment. Targeted outreach can prevent further disengagement.'}
                </div>
                <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                  <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Recommended Actions</div>
                  <ul className="text-[10px] space-y-1" style={{ color: 'var(--text-muted)' }}>
                    {d.color === C.green && <><li>- Send exclusive Champion perks and early access invites</li><li>- Recruit for committee participation and testimonials</li><li>- Feature in ALTA newsletters and case studies</li></>}
                    {d.color === C.blue && <><li>- Nurture with personalized event recommendations</li><li>- Encourage committee involvement to push into Champion tier</li><li>- Send targeted content based on engagement patterns</li></>}
                    {d.color === C.orange && <><li>- Trigger re-engagement workflow immediately</li><li>- Personal outreach from assigned staff within 7 days</li><li>- Offer incentives for upcoming event attendance</li></>}
                    {d.color === C.red && <><li>- Escalate to retention team for phone outreach</li><li>- Send "We miss you" campaign with personalized value proposition</li><li>- Review dues status and offer payment flexibility if needed</li></>}
                    {d.color === '#666' && <><li>- Final attempt: personal call from membership director</li><li>- Verify contact information is still valid</li><li>- Prepare lapsed member recovery campaign</li></>}
                  </ul>
                </div>
              </div>
            }
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Scoring Model */}
        <Card
          title="Scoring Model (6 Factors)"
          subtitle="Each member gets a 0-100 engagement score based on weighted factors. Updated in real-time as new data arrives."
          detailTitle="Engagement Scoring Model — Full Breakdown"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                MEMTrak calculates a composite engagement score (0-100) for every member by weighting six behavioral factors. Scores update in real-time as new data arrives from email, events, dues, and analytics systems.
              </p>
              {scoringModel.map(f => (
                <div key={f.factor} className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{f.factor}</span>
                    <span className="text-xs font-extrabold" style={{ color: 'var(--accent)' }}>{f.weight}% weight</span>
                  </div>
                  <p className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>{f.description}</p>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {f.factor.includes('Email Opens') && (
                      <><strong style={{ color: 'var(--heading)' }}>Data Source:</strong> Resend webhook events (open tracking pixel). Measures unique opens over rolling 90-day window. Members opening 80%+ of emails score full points; below 20% scores near zero.</>
                    )}
                    {f.factor.includes('Email Clicks') && (
                      <><strong style={{ color: 'var(--heading)' }}>Data Source:</strong> Resend click tracking on all email links. Tracks click-through rate on registration links, content links, and CTAs. Higher click rates indicate active interest beyond passive reading.</>
                    )}
                    {f.factor.includes('Event Attendance') && (
                      <><strong style={{ color: 'var(--heading)' }}>Data Source:</strong> Cvent registration + attendance records synced via API. Counts webinars, ALTA ONE, regional events, and committee meetings attended year-to-date.</>
                    )}
                    {f.factor.includes('Committee') && (
                      <><strong style={{ color: 'var(--heading)' }}>Data Source:</strong> NetForum committee roster + meeting attendance. Active committee members get full points; inactive roster members get partial credit.</>
                    )}
                    {f.factor.includes('Dues') && (
                      <><strong style={{ color: 'var(--heading)' }}>Data Source:</strong> NetForum billing records. Early payment = full points, on-time = 80%, late = 40%, overdue = 0%. Payment history over 3 years is factored in.</>
                    )}
                    {f.factor.includes('Website') && (
                      <><strong style={{ color: 'var(--heading)' }}>Data Source:</strong> GA4 via BigQuery export. Tracks authenticated page views, resource downloads, and login frequency. Members visiting 5+ times/month with downloads score highest.</>
                    )}
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-2">
            {scoringModel.map(f => (
              <div key={f.factor} className="flex items-center gap-3">
                <div className="w-full">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span style={{ color: 'var(--heading)' }}>{f.factor}</span>
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>{f.weight}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--card-border)' }}>
                    <div className="h-2 rounded-full" style={{ width: `${f.weight}%`, background: 'var(--accent)' }} />
                  </div>
                  <div className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{f.description}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Score Distribution Chart */}
        <Card
          title="Member Score Distribution"
          detailTitle="Member Score Distribution — Analysis"
          detailContent={
            <div className="space-y-4">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Distribution of {totalMembers.toLocaleString()} scored members across engagement tiers. A healthy association targets 50%+ in Engaged or Champion tiers.
              </p>
              <div className="space-y-2">
                {scoreDistribution.map(d => (
                  <div key={d.range} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--heading)' }}>{d.range}</span>
                        <span className="font-bold" style={{ color: d.color }}>{d.count.toLocaleString()} ({d.pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full mt-1" style={{ background: 'var(--card-border)' }}>
                        <div className="h-2 rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Key Insight</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Currently {((scoreDistribution[0].pct + scoreDistribution[1].pct)).toFixed(1)}% of members are Engaged or Champions — {scoreDistribution[0].pct + scoreDistribution[1].pct > 50 ? 'above' : 'below'} the 50% health benchmark. The {scoreDistribution[2].count.toLocaleString()} At Risk members represent the highest-impact re-engagement opportunity, as they still show some activity and can be recovered with targeted outreach.
                </div>
              </div>
            </div>
          }
        >
          <ClientChart type="doughnut" height={280} data={{
            labels: scoreDistribution.map(d => d.range),
            datasets: [{ data: scoreDistribution.map(d => d.count), backgroundColor: scoreDistribution.map(d => d.color), borderWidth: 2, borderColor: 'var(--card)', hoverOffset: 10 }],
          }} />
        </Card>
      </div>

      {/* Member Scoreboard with LTV */}
      <Card
        title="Member Scoreboard — Engagement + Lifetime Value"
        detailTitle="Per-Member Engagement Analysis"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Expanded view of each member's engagement profile, scoring breakdown, and recommended actions based on current trajectory.
            </p>
            {memberScores.map(m => (
              <div key={m.org} className="rounded-lg p-4" style={{ background: 'var(--background)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{m.org}</span>
                    <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>({m.type})</span>
                  </div>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full font-extrabold text-xs" style={{ background: m.score >= 80 ? 'rgba(140,198,63,0.15)' : m.score >= 50 ? 'rgba(74,144,217,0.15)' : m.score >= 25 ? 'rgba(232,146,63,0.15)' : 'rgba(217,74,74,0.15)', color: m.score >= 80 ? C.green : m.score >= 50 ? C.blue : m.score >= 25 ? C.orange : C.red }}>{m.score}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
                  <div><span style={{ color: 'var(--text-muted)' }}>Email Opens:</span> <strong style={{ color: m.emails >= 70 ? C.green : m.emails >= 40 ? C.orange : C.red }}>{m.emails}%</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Click Rate:</span> <strong style={{ color: 'var(--heading)' }}>{m.clicks}%</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Events YTD:</span> <strong style={{ color: 'var(--heading)' }}>{m.events}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Dues:</span> <strong className={m.dues === 'Early' ? 'text-green-400' : m.dues === 'On-time' ? 'text-blue-400' : m.dues === 'Late' ? 'text-amber-400' : 'text-red-400'}>{m.dues}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>5yr LTV:</span> <strong style={{ color: 'var(--accent)' }}>${m.ltv.toLocaleString()}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Trend:</span> <strong className={m.trend === 'rising' ? 'text-green-400' : m.trend === 'stable' ? 'text-blue-400' : m.trend === 'declining' ? 'text-amber-400' : 'text-red-400'}>{m.trend}</strong></div>
                </div>
                <div className="text-[10px] pt-2" style={{ borderTop: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--heading)' }}>Recommendation: </strong>
                  {m.risk === 'Low' && 'Continue nurturing. Consider for committee recruitment or speaking opportunities. High-value advocate.'}
                  {m.risk === 'Medium' && 'Monitor closely. Send personalized event invites and check in within 30 days. Declining engagement needs attention before it worsens.'}
                  {m.risk === 'High' && 'Immediate staff outreach required. Schedule personal call within 7 days. Review dues status and offer support. This member is at risk of lapsing.'}
                  {m.risk === 'Critical' && 'Emergency retention action. Membership director should call this week. Verify contact information is current. Consider offering a renewal incentive.'}
                </div>
              </div>
            ))}
          </div>
        }
        className="mb-6"
      >
        <div className="flex items-center justify-end mb-3">
          <button onClick={() => exportCSV(['Organization', 'Type', 'Score', 'LTV (5yr)', 'Email Open %', 'Click %', 'Events', 'Dues', 'Risk'], memberScores.map(m => [m.org, m.type, m.score, m.ltv, m.emails + '%', m.clicks + '%', m.events, m.dues, m.risk]), 'MEMTrak_Engagement_Scores')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ color: 'var(--accent)', border: '1px solid var(--card-border)' }}>
            <Download className="w-3 h-3" /> CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              <th className="text-left pb-2" style={{ color: 'var(--text-muted)' }}>Organization</th>
              <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Score</th>
              <th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>5yr LTV</th>
              <th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>Opens</th>
              <th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>Clicks</th>
              <th className="text-right pb-2" style={{ color: 'var(--text-muted)' }}>Events</th>
              <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Dues</th>
              <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Trend</th>
              <th className="text-center pb-2" style={{ color: 'var(--text-muted)' }}>Risk</th>
            </tr></thead>
            <tbody>
              {memberScores.map(m => (
                <tr key={m.org} style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td className="py-2.5 font-semibold" style={{ color: 'var(--heading)' }}>{m.org} <span className="font-normal" style={{ color: 'var(--text-muted)' }}>({m.type})</span></td>
                  <td className="py-2.5 text-center">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full font-extrabold text-sm" style={{ background: m.score >= 80 ? 'rgba(140,198,63,0.15)' : m.score >= 50 ? 'rgba(74,144,217,0.15)' : m.score >= 25 ? 'rgba(232,146,63,0.15)' : 'rgba(217,74,74,0.15)', color: m.score >= 80 ? C.green : m.score >= 50 ? C.blue : m.score >= 25 ? C.orange : C.red }}>{m.score}</span>
                  </td>
                  <td className="py-2.5 text-right font-bold" style={{ color: 'var(--accent)' }}>${m.ltv.toLocaleString()}</td>
                  <td className="py-2.5 text-right" style={{ color: m.emails >= 70 ? C.green : m.emails >= 40 ? C.orange : C.red }}>{m.emails}%</td>
                  <td className="py-2.5 text-right" style={{ color: 'var(--heading)' }}>{m.clicks}%</td>
                  <td className="py-2.5 text-right" style={{ color: 'var(--heading)' }}>{m.events}</td>
                  <td className="py-2.5 text-center"><span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${m.dues === 'Early' ? 'bg-green-500/20 text-green-400' : m.dues === 'On-time' ? 'bg-blue-500/20 text-blue-400' : m.dues === 'Late' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{m.dues}</span></td>
                  <td className="py-2.5 text-center"><span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${m.trend === 'rising' ? 'bg-green-500/20 text-green-400' : m.trend === 'stable' ? 'bg-blue-500/20 text-blue-400' : m.trend === 'declining' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{m.trend}</span></td>
                  <td className={`py-2.5 text-center font-bold ${riskColors[m.risk]}`}>{m.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* LTV Chart */}
      <Card
        title="5-Year Lifetime Value by Member"
        detailTitle="Lifetime Value Analysis"
        detailContent={
          <div className="space-y-4">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Projected 5-year revenue contribution per member based on dues type, event participation, sponsorship history, and engagement trajectory. Color-coded by engagement score tier.
            </p>
            <div className="space-y-2">
              {memberScores.sort((a, b) => b.ltv - a.ltv).map(m => (
                <div key={m.org} className="flex items-center justify-between rounded-lg p-3" style={{ background: 'var(--background)' }}>
                  <div>
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{m.org}</span>
                    <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>({m.type}) — Score: {m.score}</span>
                  </div>
                  <span className="text-sm font-extrabold" style={{ color: 'var(--accent)' }}>${m.ltv.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
              <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>LTV Methodology</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                LTV is calculated using: (Annual Dues x Predicted Retention Years) + (Avg Event Spend x Predicted Events) + (Sponsorship Revenue if applicable). ACU (Underwriter) members have significantly higher LTV due to underwriter dues tiers and conference sponsorship. Retention probability is derived from the engagement score — higher scores correlate with longer membership tenure.
              </div>
            </div>
            <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
              <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Color Key</div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: C.green }} /> Score 80+ (Champions/Engaged)</div>
                <div><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: C.blue }} /> Score 50-79 (Moderate)</div>
                <div><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: C.orange }} /> Score 25-49 (At Risk)</div>
                <div><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: C.red }} /> Score 0-24 (Critical)</div>
              </div>
            </div>
          </div>
        }
        className="mt-6"
      >
        <ClientChart type="bar" height={260} data={{
          labels: memberScores.map(m => m.org.length > 16 ? m.org.slice(0, 16) + '...' : m.org),
          datasets: [{ label: '5yr LTV', data: memberScores.map(m => m.ltv), backgroundColor: memberScores.map(m => m.score >= 80 ? C.green : m.score >= 50 ? C.blue : m.score >= 25 ? C.orange : C.red), borderRadius: 6 }],
        }} options={{
          plugins: { legend: { display: false }, datalabels: { display: true, anchor: 'end' as const, align: 'top' as const, color: 'var(--heading)', font: { weight: 'bold' as const, size: 9 }, formatter: (v: number) => v >= 1e6 ? '$' + (v/1e6).toFixed(1) + 'M' : v >= 1e3 ? '$' + (v/1e3).toFixed(0) + 'K' : '$' + v } },
          scales: { y: { beginAtZero: true, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => '$' + (v/1e3).toFixed(0) + 'K' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)', font: { size: 9 } } } },
        }} />
      </Card>
    </div>
  );
}
