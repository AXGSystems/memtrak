'use client';

import { useState } from 'react';
import Card, { KpiCard } from '@/components/Card';
import { Zap, Play, Pause, CheckCircle, Clock, Mail, Phone, AlertTriangle, ArrowRight, Users, DollarSign, TrendingUp } from 'lucide-react';

const workflows = [
  {
    id: 'decay-reengagement', name: 'Engagement Decay Re-engagement', status: 'Active' as const,
    trigger: 'Member engagement score drops below 40',
    steps: [
      { day: 0, action: 'Send "We miss you" email with personalized content', channel: 'Email', status: 'auto' },
      { day: 3, action: 'If opened → send follow-up with upcoming events', channel: 'Email', status: 'auto' },
      { day: 3, action: 'If NOT opened → notify assigned staff for phone outreach', channel: 'Alert', status: 'auto' },
      { day: 7, action: 'Staff makes personal call (MEMTrak logs outcome)', channel: 'Phone', status: 'manual' },
      { day: 14, action: 'If still no engagement → flag as "At Risk" for retention team', channel: 'System', status: 'auto' },
    ],
    enrolled: 344, converted: 52, conversionRate: 15.1, revenueProtected: 78400,
  },
  {
    id: 'bounce-cleanup', name: 'Hard Bounce Auto-Cleanup', status: 'Active' as const,
    trigger: 'Email address bounces 2+ times within 30 days',
    steps: [
      { day: 0, action: 'Auto-suppress from all future sends', channel: 'System', status: 'auto' },
      { day: 0, action: 'Log in MEMTrak audit trail with bounce reason', channel: 'System', status: 'auto' },
      { day: 1, action: 'Search for alternate email in member record', channel: 'System', status: 'auto' },
      { day: 1, action: 'If alternate found → send verification email to new address', channel: 'Email', status: 'auto' },
      { day: 7, action: 'If no alternate → flag for staff to find updated contact', channel: 'Alert', status: 'manual' },
    ],
    enrolled: 265, converted: 89, conversionRate: 33.6, revenueProtected: 12600,
  },
  {
    id: 'new-member-30day', name: 'New Member 30-Day Check', status: 'Active' as const,
    trigger: 'Member completes Day 30 of onboarding with engagement score < 50',
    steps: [
      { day: 0, action: 'Personal email from membership team: "How can we help?"', channel: 'Email', status: 'auto' },
      { day: 2, action: 'If replied → route to assigned staff for follow-up', channel: 'Alert', status: 'auto' },
      { day: 5, action: 'If no reply → phone call from Paul Martin', channel: 'Phone', status: 'manual' },
      { day: 10, action: 'Invite to next webinar with personalized registration link', channel: 'Email', status: 'auto' },
    ],
    enrolled: 42, converted: 28, conversionRate: 66.7, revenueProtected: 33600,
  },
  {
    id: 'renewal-sequence', name: 'Renewal Countdown Sequence', status: 'Scheduled' as const,
    trigger: 'Member renewal date is 90 days away',
    steps: [
      { day: 0, action: '90-day notice: "Your renewal is coming up"', channel: 'Email', status: 'auto' },
      { day: 30, action: '60-day reminder with renewal link', channel: 'Email', status: 'auto' },
      { day: 60, action: '30-day urgency: "Don\'t lose your benefits"', channel: 'Email', status: 'auto' },
      { day: 75, action: 'Staff phone call for non-responders', channel: 'Phone', status: 'manual' },
      { day: 85, action: 'Final notice: "5 days remaining"', channel: 'Email', status: 'auto' },
      { day: 90, action: 'If not renewed → enter lapsed member workflow', channel: 'System', status: 'auto' },
    ],
    enrolled: 0, converted: 0, conversionRate: 0, revenueProtected: 0,
  },
];

const statusColors = { Active: 'bg-green-500/20 text-green-400', Scheduled: 'bg-blue-500/20 text-blue-400', Paused: 'bg-amber-500/20 text-amber-400' };
const channelIcons: Record<string, typeof Mail> = { Email: Mail, Phone: Phone, Alert: AlertTriangle, System: Zap };

export default function Workflows() {
  const [expanded, setExpanded] = useState<string | null>(workflows[0].id);

  const totalEnrolled = workflows.reduce((s, w) => s + w.enrolled, 0);
  const totalConverted = workflows.reduce((s, w) => s + w.converted, 0);
  const totalRevenue = workflows.reduce((s, w) => s + w.revenueProtected, 0);
  const activeWorkflows = workflows.filter(w => w.enrolled > 0);
  const avgConversion = activeWorkflows.length > 0 ? (activeWorkflows.reduce((s, w) => s + w.conversionRate, 0) / activeWorkflows.length).toFixed(1) : '0';

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Automated Workflows</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Event-triggered email sequences with staff escalation — what ActiveCampaign charges $186/mo for and HubSpot charges $890/mo for. MEMTrak includes it free.</p>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6 stagger-children">
        <KpiCard
          label="Workflows"
          value={workflows.length}
          sub={`${workflows.filter(w => w.status === 'Active').length} active, ${workflows.filter(w => w.status === 'Scheduled').length} scheduled`}
          icon={Zap}
          color="var(--heading)"
          detail={
            <div className="space-y-3">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                MEMTrak manages {workflows.length} automated workflows that trigger based on member behavior events. Each workflow combines automated email sequences with manual staff escalation points.
              </div>
              <div className="space-y-2">
                {workflows.map(w => (
                  <div key={w.id} className="flex items-center justify-between rounded-lg p-2" style={{ background: 'var(--background)' }}>
                    <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{w.name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${statusColors[w.status]}`}>{w.status}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Workflows run 24/7 and trigger automatically when conditions are met. Staff are notified only at manual escalation points, keeping the workload minimal while ensuring no member falls through the cracks.
              </div>
            </div>
          }
        />
        <KpiCard
          label="Members Enrolled"
          value={totalEnrolled}
          sub={`Across ${activeWorkflows.length} active workflows`}
          icon={Users}
          color="var(--heading)"
          detail={
            <div className="space-y-3">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {totalEnrolled} members are currently being nurtured through automated workflows. Enrollment is triggered by real-time behavior events — no manual list management needed.
              </div>
              <div className="space-y-2">
                {workflows.filter(w => w.enrolled > 0).map(w => (
                  <div key={w.id} className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="font-bold" style={{ color: 'var(--heading)' }}>{w.name}</span>
                      <span className="font-bold" style={{ color: 'var(--accent)' }}>{w.enrolled} enrolled</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--card-border)' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${(w.enrolled / totalEnrolled) * 100}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        />
        <KpiCard
          label="Re-engaged"
          value={totalConverted}
          sub={`${avgConversion}% avg conversion rate`}
          icon={TrendingUp}
          color="var(--accent)"
          detail={
            <div className="space-y-3">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {totalConverted} members have been successfully re-engaged through automated workflows. "Re-engaged" means the member resumed meaningful activity (opened emails, attended events, or renewed dues) after being flagged for intervention.
              </div>
              <div className="space-y-2">
                {workflows.filter(w => w.converted > 0).map(w => (
                  <div key={w.id} className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="font-bold" style={{ color: 'var(--heading)' }}>{w.name}</span>
                      <span className="font-bold" style={{ color: 'var(--accent)' }}>{w.converted} converted ({w.conversionRate}%)</span>
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {w.enrolled - w.converted} members still in progress
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                The New Member 30-Day Check has the highest conversion rate ({workflows.find(w => w.id === 'new-member-30day')?.conversionRate}%), confirming that early intervention with new members is the most effective retention strategy.
              </div>
            </div>
          }
        />
        <KpiCard
          label="Revenue Protected"
          value={`$${(totalRevenue / 1000).toFixed(0)}K`}
          sub="Estimated retained dues & event revenue"
          icon={DollarSign}
          color="var(--accent)"
          detail={
            <div className="space-y-3">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ${totalRevenue.toLocaleString()} in membership dues and event revenue has been protected by successfully re-engaging members who were at risk of lapsing.
              </div>
              <div className="space-y-2">
                {workflows.filter(w => w.revenueProtected > 0).map(w => (
                  <div key={w.id} className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="font-bold" style={{ color: 'var(--heading)' }}>{w.name}</span>
                      <span className="font-bold" style={{ color: 'var(--accent)' }}>${(w.revenueProtected / 1000).toFixed(0)}K protected</span>
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      ${Math.round(w.revenueProtected / w.converted).toLocaleString()} avg revenue per re-engaged member
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>ROI Calculation</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  ActiveCampaign + HubSpot equivalent: ~$1,076/mo ($12,912/yr). MEMTrak workflows: $0/mo. Revenue protected: ${totalRevenue.toLocaleString()}. That is a {Math.round(totalRevenue / 12912)}x return on what you would have spent on third-party automation.
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* Workflow Cards */}
      <div className="space-y-4">
        {workflows.map(w => {
          const isExpanded = expanded === w.id;
          const autoSteps = w.steps.filter(s => s.status === 'auto').length;
          const manualSteps = w.steps.filter(s => s.status === 'manual').length;
          return (
            <Card
              key={w.id}
              title={w.name}
              subtitle={`Trigger: ${w.trigger}`}
              detailTitle={`${w.name} — Full Analysis`}
              detailContent={
                <div className="space-y-4">
                  {/* Conversion funnel */}
                  <div>
                    <div className="text-xs font-bold mb-2" style={{ color: 'var(--heading)' }}>Conversion Funnel</div>
                    {w.enrolled > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-24 text-[10px] text-right font-semibold" style={{ color: 'var(--text-muted)' }}>Triggered</div>
                          <div className="flex-1 h-6 rounded" style={{ background: 'var(--accent)', opacity: 0.3 }}>
                            <div className="h-6 rounded flex items-center px-2" style={{ width: '100%', background: 'var(--accent)' }}>
                              <span className="text-[9px] font-bold text-white">{w.enrolled}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 text-[10px] text-right font-semibold" style={{ color: 'var(--text-muted)' }}>In Progress</div>
                          <div className="flex-1 h-6 rounded" style={{ background: 'var(--card-border)' }}>
                            <div className="h-6 rounded flex items-center px-2" style={{ width: `${((w.enrolled - w.converted) / w.enrolled) * 100}%`, background: 'var(--accent)', opacity: 0.7 }}>
                              <span className="text-[9px] font-bold text-white">{w.enrolled - w.converted}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 text-[10px] text-right font-semibold" style={{ color: 'var(--text-muted)' }}>Converted</div>
                          <div className="flex-1 h-6 rounded" style={{ background: 'var(--card-border)' }}>
                            <div className="h-6 rounded flex items-center px-2" style={{ width: `${w.conversionRate}%`, background: '#8CC63F' }}>
                              <span className="text-[9px] font-bold text-white">{w.converted} ({w.conversionRate}%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] rounded-lg p-3" style={{ background: 'var(--background)', color: 'var(--text-muted)' }}>
                        This workflow is scheduled but has not yet enrolled any members. Funnel data will appear once it activates.
                      </div>
                    )}
                  </div>

                  {/* Revenue impact */}
                  <div>
                    <div className="text-xs font-bold mb-2" style={{ color: 'var(--heading)' }}>Revenue Impact</div>
                    <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                      {w.revenueProtected > 0 ? (
                        <div className="grid grid-cols-2 gap-3 text-[10px]">
                          <div>
                            <div style={{ color: 'var(--text-muted)' }}>Revenue Protected</div>
                            <div className="text-sm font-extrabold" style={{ color: 'var(--accent)' }}>${w.revenueProtected.toLocaleString()}</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-muted)' }}>Per Conversion</div>
                            <div className="text-sm font-extrabold" style={{ color: 'var(--accent)' }}>${Math.round(w.revenueProtected / w.converted).toLocaleString()}</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-muted)' }}>Still At Risk</div>
                            <div className="text-sm font-extrabold" style={{ color: '#E8923F' }}>{w.enrolled - w.converted} members</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-muted)' }}>Potential Recovery</div>
                            <div className="text-sm font-extrabold" style={{ color: '#E8923F' }}>${Math.round((w.enrolled - w.converted) * (w.revenueProtected / w.converted)).toLocaleString()}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Revenue impact data will be available once members complete this workflow.</div>
                      )}
                    </div>
                  </div>

                  {/* Workflow steps detail */}
                  <div>
                    <div className="text-xs font-bold mb-2" style={{ color: 'var(--heading)' }}>Step-by-Step Breakdown</div>
                    <div className="space-y-2">
                      {w.steps.map((step, i) => {
                        const Icon = channelIcons[step.channel] || Mail;
                        return (
                          <div key={i} className="rounded-lg p-3 flex items-start gap-3" style={{ background: 'var(--background)' }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: step.status === 'auto' ? 'rgba(140,198,63,0.15)' : 'rgba(74,144,217,0.15)' }}>
                              <Icon className="w-3 h-3" style={{ color: step.status === 'auto' ? '#8CC63F' : '#4A90D9' }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}>Day {step.day}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${step.status === 'auto' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{step.status === 'auto' ? 'Automated' : 'Manual'}</span>
                                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>via {step.channel}</span>
                              </div>
                              <div className="text-[10px]" style={{ color: 'var(--heading)' }}>{step.action}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optimization suggestions */}
                  <div>
                    <div className="text-xs font-bold mb-2" style={{ color: 'var(--heading)' }}>Optimization Suggestions</div>
                    <div className="rounded-lg p-3" style={{ background: 'var(--background)' }}>
                      <ul className="text-[10px] space-y-1.5" style={{ color: 'var(--text-muted)' }}>
                        {w.id === 'decay-reengagement' && (
                          <>
                            <li>- Consider adding SMS as an alternate channel for members who never open emails</li>
                            <li>- A/B test subject lines on the initial "We miss you" email to improve open rates</li>
                            <li>- Add a Day 21 touchpoint before escalating to retention team</li>
                            <li>- Segment by member type (ACU vs ACA) for more personalized messaging</li>
                          </>
                        )}
                        {w.id === 'bounce-cleanup' && (
                          <>
                            <li>- Cross-reference bounced emails with LinkedIn to find updated addresses</li>
                            <li>- Add a direct mail fallback for high-LTV members with no valid email</li>
                            <li>- Track bounce rates by email domain to identify deliverability issues</li>
                            <li>- Consider adding BIMI/DMARC verification to reduce false bounces</li>
                          </>
                        )}
                        {w.id === 'new-member-30day' && (
                          <>
                            <li>- The 66.7% conversion rate is excellent — consider replicating this approach for other workflows</li>
                            <li>- Add a Day 15 milestone check before the Day 30 trigger for earlier intervention</li>
                            <li>- Include a peer-matching component to connect new members with Champions</li>
                            <li>- Track which onboarding content correlates with higher 90-day retention</li>
                          </>
                        )}
                        {w.id === 'renewal-sequence' && (
                          <>
                            <li>- Once active, benchmark against industry 85% renewal target</li>
                            <li>- Include personalized value summary ("You attended X events, downloaded Y resources")</li>
                            <li>- Offer early-bird renewal discount at the 90-day mark to incentivize prompt action</li>
                            <li>- Add a post-renewal thank-you sequence to reinforce the decision</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              }
              noPad
            >
              <button onClick={() => setExpanded(isExpanded ? null : w.id)} className="w-full flex items-center justify-between p-5 text-left">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <div>
                    <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{w.name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Trigger: {w.trigger}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] px-2.5 py-1 rounded-full font-bold ${statusColors[w.status]}`}>{w.status}</span>
                  {w.enrolled > 0 && <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{w.conversionRate}% conversion</span>}
                  <ArrowRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} style={{ color: 'var(--text-muted)' }} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--card-border)' }}>
                  {/* Stats */}
                  {w.enrolled > 0 && (
                    <div className="grid grid-cols-4 gap-3 py-4">
                      <div><div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{w.enrolled}</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Enrolled</div></div>
                      <div><div className="text-lg font-extrabold" style={{ color: 'var(--accent)' }}>{w.converted}</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Converted</div></div>
                      <div><div className="text-lg font-extrabold" style={{ color: 'var(--accent)' }}>{w.conversionRate}%</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Rate</div></div>
                      <div><div className="text-lg font-extrabold" style={{ color: 'var(--accent)' }}>${(w.revenueProtected / 1000).toFixed(0)}K</div><div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Protected</div></div>
                    </div>
                  )}

                  {/* Steps */}
                  <div className="relative pl-6 mt-2">
                    <div className="absolute left-[9px] top-0 bottom-0 w-0.5" style={{ background: 'var(--card-border)' }} />
                    <div className="space-y-3">
                      {w.steps.map((step, i) => {
                        const Icon = channelIcons[step.channel] || Mail;
                        return (
                          <div key={i} className="relative flex items-start gap-3">
                            <div className="absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: step.status === 'auto' ? 'rgba(140,198,63,0.15)' : 'rgba(74,144,217,0.15)' }}>
                              <Icon className="w-2.5 h-2.5" style={{ color: step.status === 'auto' ? '#8CC63F' : '#4A90D9' }} />
                            </div>
                            <div className="flex-1 p-3 rounded-lg ml-2" style={{ background: 'var(--background)' }}>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}>Day {step.day}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${step.status === 'auto' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{step.status === 'auto' ? 'Automated' : 'Manual'}</span>
                              </div>
                              <div className="text-xs mt-1" style={{ color: 'var(--heading)' }}>{step.action}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
