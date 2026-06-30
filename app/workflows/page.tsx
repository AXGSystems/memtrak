'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import { Zap, Mail, Phone, AlertTriangle, ArrowRight } from 'lucide-react';

/**
 * Automated Workflows — definition catalog
 *
 * These are the workflow definitions (triggers + step sequences) MEMTrak ships.
 * They are honest blueprints, not a running engine: MEMTrak does not yet run an
 * event-driven enrollment/evaluation loop, so we do NOT display enrollment
 * counts, conversion rates, or "revenue protected" — those would be fabricated.
 * Each definition is marked "Definition" (designed, not yet executing) so the
 * page never claims automation that isn't wired. Execution requires the send
 * engine (Microsoft Graph) plus a scheduled evaluator; until both exist, status
 * stays "Definition".
 */

const workflows = [
  {
    id: 'decay-reengagement', name: 'Engagement Decay Re-engagement',
    trigger: 'Member engagement score drops below 40',
    steps: [
      { day: 0, action: 'Send "We miss you" email with personalized content', channel: 'Email', kind: 'auto' },
      { day: 3, action: 'If opened → send follow-up with upcoming events', channel: 'Email', kind: 'auto' },
      { day: 3, action: 'If NOT opened → notify assigned staff for phone outreach', channel: 'Alert', kind: 'auto' },
      { day: 7, action: 'Staff makes personal call (MEMTrak logs outcome)', channel: 'Phone', kind: 'manual' },
      { day: 14, action: 'If still no engagement → flag as "At Risk" for retention team', channel: 'System', kind: 'auto' },
    ],
  },
  {
    id: 'bounce-cleanup', name: 'Hard Bounce Auto-Cleanup',
    trigger: 'Email address bounces 2+ times within 30 days',
    steps: [
      { day: 0, action: 'Auto-suppress from all future sends', channel: 'System', kind: 'auto' },
      { day: 0, action: 'Log in MEMTrak audit trail with bounce reason', channel: 'System', kind: 'auto' },
      { day: 1, action: 'Search for alternate email in member record', channel: 'System', kind: 'auto' },
      { day: 1, action: 'If alternate found → send verification email to new address', channel: 'Email', kind: 'auto' },
      { day: 7, action: 'If no alternate → flag for staff to find updated contact', channel: 'Alert', kind: 'manual' },
    ],
  },
  {
    id: 'new-member-30day', name: 'New Member 30-Day Check',
    trigger: 'Member completes Day 30 of onboarding with engagement score < 50',
    steps: [
      { day: 0, action: 'Personal email from membership team: "How can we help?"', channel: 'Email', kind: 'auto' },
      { day: 2, action: 'If replied → route to assigned staff for follow-up', channel: 'Alert', kind: 'auto' },
      { day: 5, action: 'If no reply → phone call from membership team', channel: 'Phone', kind: 'manual' },
      { day: 10, action: 'Invite to next webinar with personalized registration link', channel: 'Email', kind: 'auto' },
    ],
  },
  {
    id: 'renewal-sequence', name: 'Renewal Countdown Sequence',
    trigger: 'Member renewal date is 90 days away',
    steps: [
      { day: 0, action: '90-day notice: "Your renewal is coming up"', channel: 'Email', kind: 'auto' },
      { day: 30, action: '60-day reminder with renewal link', channel: 'Email', kind: 'auto' },
      { day: 60, action: '30-day urgency: "Don\'t lose your benefits"', channel: 'Email', kind: 'auto' },
      { day: 75, action: 'Staff phone call for non-responders', channel: 'Phone', kind: 'manual' },
      { day: 85, action: 'Final notice: "5 days remaining"', channel: 'Email', kind: 'auto' },
      { day: 90, action: 'If not renewed → enter lapsed member workflow', channel: 'System', kind: 'auto' },
    ],
  },
];

const channelIcons: Record<string, typeof Mail> = { Email: Mail, Phone: Phone, Alert: AlertTriangle, System: Zap };

export default function Workflows() {
  const [expanded, setExpanded] = useState<string | null>(workflows[0].id);

  const totalSteps = workflows.reduce((s, w) => s + w.steps.length, 0);
  const autoSteps = workflows.reduce((s, w) => s + w.steps.filter(st => st.kind === 'auto').length, 0);
  const manualSteps = totalSteps - autoSteps;

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Automated Workflows</h1>
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        Event-triggered email sequences with staff escalation — designed for ALTA membership retention.
      </p>

      {/* Honest status banner — no fabricated runtime metrics */}
      <div className="rounded-xl border p-4 mb-6 flex items-start gap-3" style={{ background: 'color-mix(in srgb, var(--accent) 6%, transparent)', borderColor: 'var(--card-border)' }}>
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
        <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          These are workflow <strong style={{ color: 'var(--heading)' }}>definitions</strong> — the triggers and step
          sequences MEMTrak ships, ready to wire up. Live enrollment and automatic execution require the email send
          engine (Microsoft Graph) plus a scheduled evaluator. Until both are connected, enrollment counts and
          conversion metrics are not shown here rather than displayed as estimates.
        </div>
      </div>

      {/* Catalog summary — counts of what's defined, not invented performance */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border p-4" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--heading)' }}>{workflows.length}</div>
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Workflow definitions</div>
        </div>
        <div className="rounded-xl border p-4" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>{autoSteps}</div>
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Automated steps defined</div>
        </div>
        <div className="rounded-xl border p-4" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--heading)' }}>{manualSteps}</div>
          <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Manual staff escalation points</div>
        </div>
      </div>

      {/* Workflow Cards */}
      <div className="space-y-4">
        {workflows.map((w, i) => {
          const isExpanded = expanded === w.id;
          return (
            <div key={w.id} style={{ animation: `slideInUp 0.3s ease-out ${i * 0.06}s both` }}>
            <Card
              glass
              title={w.name}
              subtitle={`Trigger: ${w.trigger}`}
              detailTitle={`${w.name} — Definition`}
              detailContent={
                <div className="space-y-4">
                  <div className="rounded-lg p-3 text-[11px]" style={{ background: 'var(--background)', color: 'var(--text-muted)' }}>
                    This workflow is a <strong style={{ color: 'var(--heading)' }}>definition</strong>: its trigger and
                    step sequence are configured, but MEMTrak is not yet running live enrollment for it. Once the send
                    engine and scheduled evaluator are connected, this view will show real enrollment and outcome data
                    sourced from the MEMTrak event log.
                  </div>

                  <div>
                    <div className="text-xs font-bold mb-2" style={{ color: 'var(--heading)' }}>Trigger Condition</div>
                    <div className="rounded-lg p-3 text-[11px]" style={{ background: 'var(--background)', color: 'var(--heading)' }}>{w.trigger}</div>
                  </div>

                  {/* Workflow steps detail */}
                  <div>
                    <div className="text-xs font-bold mb-2" style={{ color: 'var(--heading)' }}>Step-by-Step Breakdown</div>
                    <div className="space-y-2">
                      {w.steps.map((step, j) => {
                        const Icon = channelIcons[step.channel] || Mail;
                        return (
                          <div key={j} className="rounded-lg p-3 flex items-start gap-3" style={{ background: 'var(--background)' }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: step.kind === 'auto' ? 'rgba(140,198,63,0.15)' : 'rgba(74,144,217,0.15)' }}>
                              <Icon className="w-3 h-3" style={{ color: step.kind === 'auto' ? '#8CC63F' : '#4A90D9' }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}>Day {step.day}</span>
                                <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${step.kind === 'auto' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{step.kind === 'auto' ? 'Automated' : 'Manual'}</span>
                                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>via {step.channel}</span>
                              </div>
                              <div className="text-[10px]" style={{ color: 'var(--heading)' }}>{step.action}</div>
                            </div>
                          </div>
                        );
                      })}
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
                  <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-slate-500/20 text-slate-400">Definition</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{w.steps.length} steps</span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} style={{ color: 'var(--text-muted)' }} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: 'var(--card-border)' }}>
                  {/* Steps timeline */}
                  <div className="relative pl-6 mt-4">
                    <div className="absolute left-[9px] top-0 bottom-0 w-0.5" style={{ background: 'var(--card-border)' }} />
                    <div className="space-y-3">
                      {w.steps.map((step, j) => {
                        const Icon = channelIcons[step.channel] || Mail;
                        return (
                          <div key={j} className="relative flex items-start gap-3" style={{ animation: `slideInUp 0.3s ease-out ${j * 0.06}s both` }}>
                            <div className="absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: step.kind === 'auto' ? 'rgba(140,198,63,0.15)' : 'rgba(74,144,217,0.15)' }}>
                              <Icon className="w-2.5 h-2.5" style={{ color: step.kind === 'auto' ? '#8CC63F' : '#4A90D9' }} />
                            </div>
                            <div className="flex-1 p-3 rounded-lg ml-2" style={{ background: 'var(--background)' }}>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}>Day {step.day}</span>
                                <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${step.kind === 'auto' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{step.kind === 'auto' ? 'Automated' : 'Manual'}</span>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
