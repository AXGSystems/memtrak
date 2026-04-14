'use client';

import { useState } from 'react';
import { Zap, Play, Pause, CheckCircle, Clock, Mail, Phone, AlertTriangle, ArrowRight, Users } from 'lucide-react';

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

  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Automated Workflows</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Event-triggered email sequences with staff escalation — what ActiveCampaign charges $186/mo for and HubSpot charges $890/mo for. MEMTrak includes it free.</p>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-6 stagger-children">
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--heading)' }}>{workflows.length}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Workflows</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--heading)' }}>{workflows.reduce((s, w) => s + w.enrolled, 0)}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Members Enrolled</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>{workflows.reduce((s, w) => s + w.converted, 0)}</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Re-engaged</div>
        </div>
        <div className="rounded-xl border p-4 text-center" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
          <div className="text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>${(workflows.reduce((s, w) => s + w.revenueProtected, 0) / 1000).toFixed(0)}K</div>
          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Revenue Protected</div>
        </div>
      </div>

      {/* Workflow Cards */}
      <div className="space-y-4">
        {workflows.map(w => {
          const isExpanded = expanded === w.id;
          return (
            <div key={w.id} className="rounded-xl border overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
