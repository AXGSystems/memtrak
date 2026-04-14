'use client';

import { useState, useMemo } from 'react';
import Card from '@/components/Card';
import ClientChart from '@/components/ClientChart';
import AnimatedCounter from '@/components/AnimatedCounter';
import SparkKpi from '@/components/SparkKpi';
import {
  Sparkles, TrendingUp, TrendingDown, DollarSign, Mail, AlertTriangle,
  Users, Zap, BarChart3, ArrowRight, Activity, Target, Gauge,
  ChevronRight, Shield,
} from 'lucide-react';

/* ── palette ───────────────────────────────────────────────── */
const C = {
  navy: '#002D5C',
  blue: '#4A90D9',
  green: '#8CC63F',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F5C542',
  purple: '#a855f7',
  teal: '#14b8a6',
};

/* ── baseline values ─────────────────────────────────────── */
const baseline = {
  openRate: 40.4,
  bounceRate: 3.7,
  memberCount: 4994,
  avgDues: 1350,
  sendFrequency: 4, // per month
  monthlyRevenue: 56085, // avg monthly campaign revenue
  deliverabilityRate: 96.2,
  engagementScore: 72,
};

/* ── impact calculation helpers ──────────────────────────── */
function calcOpenRateImpact(improvement: number) {
  const newRate = baseline.openRate + improvement;
  // Every 1% open rate improvement ~ $2,400/yr additional revenue from engagement
  const revenueIncrease = improvement * 2400;
  const engagementLift = improvement * 0.8;
  return { newRate, revenueIncrease, engagementLift };
}

function calcBounceImpact(newBounce: number) {
  const improvement = baseline.bounceRate - newBounce;
  const newDeliverability = baseline.deliverabilityRate + (improvement * 0.8);
  // Fewer bounces = more delivered = more opens = more revenue
  const additionalDelivered = Math.round(baseline.memberCount * (improvement / 100));
  const revenueIncrease = Math.round(additionalDelivered * 3.2);
  return { newDeliverability, additionalDelivered, revenueIncrease, improvement };
}

function calcNewMemberImpact(newMembers: number) {
  const projectedDues = newMembers * baseline.avgDues;
  const retentionRate = newMembers > 200 ? 72 : newMembers > 100 ? 76 : 82;
  const retainedRevenue = Math.round(projectedDues * (retentionRate / 100));
  return { projectedDues, retentionRate, retainedRevenue };
}

function calcFrequencyImpact(additionalSends: number) {
  // More sends = more engagement up to a point, then fatigue kicks in
  const fatigueThreshold = 2;
  const engagementChange = additionalSends <= fatigueThreshold
    ? additionalSends * 3.5
    : fatigueThreshold * 3.5 - (additionalSends - fatigueThreshold) * 5;
  const fatigueRisk = additionalSends <= 1 ? 'Low' : additionalSends <= 2 ? 'Medium' : 'High';
  const fatigueColor = additionalSends <= 1 ? C.green : additionalSends <= 2 ? C.amber : C.red;
  const unsubIncrease = additionalSends <= 1 ? 0.02 : additionalSends <= 2 ? 0.08 : 0.18;
  return { engagementChange, fatigueRisk, fatigueColor, unsubIncrease };
}

export default function ImpactCalc() {
  /* ── slider state ──────────────────────────────────────── */
  const [openImprove, setOpenImprove] = useState(5);
  const [bounceTarget, setBounceTarget] = useState(2.0);
  const [newMembers, setNewMembers] = useState(150);
  const [addSends, setAddSends] = useState(1);

  /* ── computed impacts ──────────────────────────────────── */
  const openImpact = useMemo(() => calcOpenRateImpact(openImprove), [openImprove]);
  const bounceImpact = useMemo(() => calcBounceImpact(bounceTarget), [bounceTarget]);
  const memberImpact = useMemo(() => calcNewMemberImpact(newMembers), [newMembers]);
  const freqImpact = useMemo(() => calcFrequencyImpact(addSends), [addSends]);

  const totalRevenueImpact = openImpact.revenueIncrease + bounceImpact.revenueIncrease + memberImpact.retainedRevenue;
  const totalEngagementChange = openImpact.engagementLift + freqImpact.engagementChange;

  /* ── projection data ───────────────────────────────────── */
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const currentTrajectory = [56085, 58200, 60100, 61800, 63200, 64500];
  const projectedTrajectory = currentTrajectory.map((v, i) => Math.round(v + (totalRevenueImpact / 12) * ((i + 1) / 6) * 1.5));

  return (
    <div className="p-6 space-y-6">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <h1 className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>ImpactCalc&#8482;</h1>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>What if you could see the future?</p>
      </div>

      {/* ── Scenario 1: Open Rate ─────────────────────────────── */}
      <Card title="Open Rate Improvement" subtitle="If we improve open rate..." accent={C.blue}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
                Improve open rate by <span style={{ color: C.blue }}>{openImprove}%</span>
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>0-20%</span>
            </div>
            <input
              type="range" min={0} max={20} step={1} value={openImprove}
              onChange={e => setOpenImprove(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: 'var(--card-border)', accentColor: C.blue }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl text-center" style={{ background: 'var(--background)' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Current</div>
              <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{baseline.openRate}%</div>
            </div>
            <div className="p-3 rounded-xl text-center flex flex-col items-center justify-center" style={{ background: 'var(--background)' }}>
              <ArrowRight className="w-5 h-5" style={{ color: C.blue }} />
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: `color-mix(in srgb, ${C.blue} 10%, transparent)` }}>
              <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Projected</div>
              <div className="text-lg font-extrabold" style={{ color: C.blue }}>{openImpact.newRate.toFixed(1)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <DollarSign className="w-4 h-4" style={{ color: C.green }} />
              <div>
                <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Revenue Increase</div>
                <div className="text-sm font-extrabold" style={{ color: C.green }}>+${openImpact.revenueIncrease.toLocaleString()}/yr</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <TrendingUp className="w-4 h-4" style={{ color: C.blue }} />
              <div>
                <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Engagement Lift</div>
                <div className="text-sm font-extrabold" style={{ color: C.blue }}>+{openImpact.engagementLift.toFixed(1)} pts</div>
              </div>
            </div>
          </div>

          {/* Before/After bar */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold w-14" style={{ color: 'var(--text-muted)' }}>Current</span>
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 12, background: 'var(--card-border)' }}>
                <div className="h-full rounded-full" style={{ width: `${(baseline.openRate / 60) * 100}%`, background: 'var(--text-muted)' }} />
              </div>
              <span className="text-[9px] font-bold w-10 text-right" style={{ color: 'var(--text-muted)' }}>{baseline.openRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold w-14" style={{ color: C.blue }}>Projected</span>
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 12, background: 'var(--card-border)' }}>
                <div className="h-full rounded-full" style={{ width: `${(openImpact.newRate / 60) * 100}%`, background: C.blue, boxShadow: `0 0 8px color-mix(in srgb, ${C.blue} 40%, transparent)` }} />
              </div>
              <span className="text-[9px] font-bold w-10 text-right" style={{ color: C.blue }}>{openImpact.newRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Scenario 2: Bounce Rate ──────────────────────────── */}
      <Card title="Bounce Rate Reduction" subtitle="If we reduce bounce rate to..." accent={C.teal}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
                Reduce bounce rate to <span style={{ color: C.teal }}>{bounceTarget.toFixed(1)}%</span>
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>0-5%</span>
            </div>
            <input
              type="range" min={0} max={5} step={0.1} value={bounceTarget}
              onChange={e => setBounceTarget(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: 'var(--card-border)', accentColor: C.teal }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl text-center" style={{ background: 'var(--background)' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Current Bounce</div>
              <div className="text-lg font-extrabold" style={{ color: C.orange }}>{baseline.bounceRate}%</div>
            </div>
            <div className="p-3 rounded-xl text-center flex flex-col items-center justify-center" style={{ background: 'var(--background)' }}>
              <ArrowRight className="w-5 h-5" style={{ color: C.teal }} />
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: `color-mix(in srgb, ${C.teal} 10%, transparent)` }}>
              <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Target Bounce</div>
              <div className="text-lg font-extrabold" style={{ color: C.teal }}>{bounceTarget.toFixed(1)}%</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <Shield className="w-4 h-4" style={{ color: C.teal }} />
              <div>
                <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Deliverability</div>
                <div className="text-sm font-extrabold" style={{ color: C.teal }}>{bounceImpact.newDeliverability.toFixed(1)}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <Mail className="w-4 h-4" style={{ color: C.blue }} />
              <div>
                <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>More Delivered</div>
                <div className="text-sm font-extrabold" style={{ color: C.blue }}>+{bounceImpact.additionalDelivered.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <DollarSign className="w-4 h-4" style={{ color: C.green }} />
              <div>
                <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Revenue</div>
                <div className="text-sm font-extrabold" style={{ color: C.green }}>+${bounceImpact.revenueIncrease.toLocaleString()}/yr</div>
              </div>
            </div>
          </div>

          {/* Before/After bar */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold w-14" style={{ color: 'var(--text-muted)' }}>Current</span>
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 12, background: 'var(--card-border)' }}>
                <div className="h-full rounded-full" style={{ width: `${(baseline.bounceRate / 6) * 100}%`, background: C.orange }} />
              </div>
              <span className="text-[9px] font-bold w-10 text-right" style={{ color: C.orange }}>{baseline.bounceRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold w-14" style={{ color: C.teal }}>Projected</span>
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 12, background: 'var(--card-border)' }}>
                <div className="h-full rounded-full" style={{ width: `${(bounceTarget / 6) * 100}%`, background: C.teal, boxShadow: `0 0 8px color-mix(in srgb, ${C.teal} 40%, transparent)` }} />
              </div>
              <span className="text-[9px] font-bold w-10 text-right" style={{ color: C.teal }}>{bounceTarget.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Scenario 3: New Members ──────────────────────────── */}
      <Card title="New Member Growth" subtitle="If we add new members..." accent={C.purple}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
                Add <span style={{ color: C.purple }}>{newMembers}</span> new members
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>0-500</span>
            </div>
            <input
              type="range" min={0} max={500} step={10} value={newMembers}
              onChange={e => setNewMembers(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: 'var(--card-border)', accentColor: C.purple }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl text-center" style={{ background: 'var(--background)' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Current Members</div>
              <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{baseline.memberCount.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-xl text-center flex flex-col items-center justify-center" style={{ background: 'var(--background)' }}>
              <ArrowRight className="w-5 h-5" style={{ color: C.purple }} />
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: `color-mix(in srgb, ${C.purple} 10%, transparent)` }}>
              <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Projected Total</div>
              <div className="text-lg font-extrabold" style={{ color: C.purple }}>{(baseline.memberCount + newMembers).toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <DollarSign className="w-4 h-4" style={{ color: C.green }} />
              <div>
                <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Projected Dues</div>
                <div className="text-sm font-extrabold" style={{ color: C.green }}>${memberImpact.projectedDues.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <Users className="w-4 h-4" style={{ color: C.purple }} />
              <div>
                <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Est. Retention</div>
                <div className="text-sm font-extrabold" style={{ color: memberImpact.retentionRate >= 80 ? C.green : C.amber }}>{memberImpact.retentionRate}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <Target className="w-4 h-4" style={{ color: C.blue }} />
              <div>
                <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Retained Rev</div>
                <div className="text-sm font-extrabold" style={{ color: C.blue }}>${memberImpact.retainedRevenue.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Before/After bar */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold w-14" style={{ color: 'var(--text-muted)' }}>Current</span>
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 12, background: 'var(--card-border)' }}>
                <div className="h-full rounded-full" style={{ width: `${(baseline.memberCount / (baseline.memberCount + 500)) * 100}%`, background: 'var(--text-muted)' }} />
              </div>
              <span className="text-[9px] font-bold w-14 text-right" style={{ color: 'var(--text-muted)' }}>{baseline.memberCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold w-14" style={{ color: C.purple }}>Projected</span>
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: 12, background: 'var(--card-border)' }}>
                <div className="h-full rounded-full" style={{ width: `${((baseline.memberCount + newMembers) / (baseline.memberCount + 500)) * 100}%`, background: C.purple, boxShadow: `0 0 8px color-mix(in srgb, ${C.purple} 40%, transparent)` }} />
              </div>
              <span className="text-[9px] font-bold w-14 text-right" style={{ color: C.purple }}>{(baseline.memberCount + newMembers).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Scenario 4: Send Frequency ───────────────────────── */}
      <Card title="Send Frequency Change" subtitle="If we increase send frequency..." accent={C.amber}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
                Add <span style={{ color: C.amber }}>{addSends}</span> email{addSends !== 1 ? 's' : ''}/month
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>0-3</span>
            </div>
            <input
              type="range" min={0} max={3} step={1} value={addSends}
              onChange={e => setAddSends(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: 'var(--card-border)', accentColor: C.amber }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl text-center" style={{ background: 'var(--background)' }}>
              <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Current Freq</div>
              <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{baseline.sendFrequency}/mo</div>
            </div>
            <div className="p-3 rounded-xl text-center flex flex-col items-center justify-center" style={{ background: 'var(--background)' }}>
              <ArrowRight className="w-5 h-5" style={{ color: C.amber }} />
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: `color-mix(in srgb, ${C.amber} 10%, transparent)` }}>
              <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>New Freq</div>
              <div className="text-lg font-extrabold" style={{ color: C.amber }}>{baseline.sendFrequency + addSends}/mo</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <Activity className="w-4 h-4" style={{ color: freqImpact.engagementChange >= 0 ? C.green : C.red }} />
              <div>
                <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Engagement</div>
                <div className="text-sm font-extrabold" style={{ color: freqImpact.engagementChange >= 0 ? C.green : C.red }}>
                  {freqImpact.engagementChange >= 0 ? '+' : ''}{freqImpact.engagementChange.toFixed(1)} pts
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <AlertTriangle className="w-4 h-4" style={{ color: freqImpact.fatigueColor }} />
              <div>
                <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Fatigue Risk</div>
                <div className="text-sm font-extrabold" style={{ color: freqImpact.fatigueColor }}>{freqImpact.fatigueRisk}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <TrendingDown className="w-4 h-4" style={{ color: freqImpact.unsubIncrease > 0.1 ? C.red : C.amber }} />
              <div>
                <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Unsub Risk</div>
                <div className="text-sm font-extrabold" style={{ color: freqImpact.unsubIncrease > 0.1 ? C.red : C.amber }}>+{freqImpact.unsubIncrease.toFixed(2)}%</div>
              </div>
            </div>
          </div>

          {freqImpact.fatigueRisk === 'High' && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: `color-mix(in srgb, ${C.red} 10%, transparent)`, borderLeft: `3px solid ${C.red}` }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: C.red }} />
              <span className="text-[10px] font-semibold" style={{ color: C.red }}>
                Warning: {baseline.sendFrequency + addSends} emails/month exceeds recommended frequency. Expect increased unsubscribes and potential spam complaints.
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* ── Combined Impact Summary ──────────────────────────── */}
      <div className="rounded-xl border p-5" style={{
        background: 'var(--card)', borderColor: 'var(--card-border)',
        borderTopWidth: '3px', borderTopColor: 'var(--accent)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
      }}>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Combined Impact of All Adjustments</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-4 rounded-xl" style={{ background: `color-mix(in srgb, ${C.green} 8%, transparent)` }}>
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Total Revenue Impact</div>
            <AnimatedCounter value={totalRevenueImpact} prefix="+$" className="text-2xl" color={C.green} suffix="/yr" />
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: `color-mix(in srgb, ${C.blue} 8%, transparent)` }}>
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Engagement Change</div>
            <div className="text-2xl font-extrabold" style={{ color: totalEngagementChange >= 0 ? C.blue : C.red }}>
              {totalEngagementChange >= 0 ? '+' : ''}{totalEngagementChange.toFixed(1)} pts
            </div>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: `color-mix(in srgb, ${C.purple} 8%, transparent)` }}>
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>New Members Added</div>
            <div className="text-2xl font-extrabold" style={{ color: C.purple }}>+{newMembers}</div>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: `color-mix(in srgb, ${C.teal} 8%, transparent)` }}>
            <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Deliverability</div>
            <div className="text-2xl font-extrabold" style={{ color: C.teal }}>{bounceImpact.newDeliverability.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* ── Projection Chart ─────────────────────────────────── */}
      <Card title="Revenue Trajectory" subtitle="Current vs projected monthly revenue with all adjustments applied">
        <ClientChart
          type="line"
          height={260}
          data={{
            labels: months,
            datasets: [
              {
                label: 'Current Trajectory',
                data: currentTrajectory,
                borderColor: 'rgba(255,255,255,0.25)',
                borderDash: [6, 4],
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(255,255,255,0.3)',
                pointBorderColor: 'var(--card)',
                pointBorderWidth: 2,
                borderWidth: 2,
              },
              {
                label: 'Projected with Changes',
                data: projectedTrajectory,
                borderColor: C.green,
                backgroundColor: 'rgba(140,198,63,0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: C.green,
                pointBorderColor: 'var(--card)',
                pointBorderWidth: 2,
                borderWidth: 2,
              },
            ],
          }}
          options={{
            plugins: { legend: { display: true, position: 'bottom' as const, labels: { color: 'var(--text-muted)', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 10 } } } },
            scales: {
              y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'var(--text-muted)', callback: (v: number) => '$' + (v / 1000).toFixed(0) + 'K' } },
              x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } },
            },
          }}
        />
      </Card>
    </div>
  );
}
