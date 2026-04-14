'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import AnimatedCounter from '@/components/AnimatedCounter';
import { MiniBar } from '@/components/SparkKpi';
import {
  Search,
  DollarSign,
  TrendingUp,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
  Lightbulb,
  BarChart3,
  Users,
  Mail,
  Sparkles,
  CheckCircle2,
  Clock,
  Signal,
  Rocket,
} from 'lucide-react';

/* -- Palette -- */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  indigo: '#6366f1',
  teal: '#14b8a6',
  rose: '#f43f5e',
  emerald: '#10b981',
};

type EffortLevel = 'Low' | 'Medium' | 'High';
type ConfidenceLevel = 'High' | 'Medium' | 'Low';
type OpportunityCategory = 'Upsell' | 'Retention' | 'Compliance' | 'Cross-sell' | 'Win-back' | 'Engagement' | 'Advertising' | 'Events' | 'Advocacy';

const effortColors: Record<EffortLevel, string> = { Low: C.green, Medium: C.amber, High: C.orange };
const confidenceColors: Record<ConfidenceLevel, string> = { High: C.green, Medium: C.blue, Low: C.orange };
const categoryColors: Record<OpportunityCategory, string> = {
  Upsell: C.purple,
  Retention: C.orange,
  Compliance: C.red,
  'Cross-sell': C.blue,
  'Win-back': C.amber,
  Engagement: C.teal,
  Advertising: C.indigo,
  Events: C.emerald,
  Advocacy: C.rose,
};

interface Opportunity {
  id: number;
  title: string;
  description: string;
  category: OpportunityCategory;
  revenue: number;
  revenueLabel: string;
  confidence: ConfidenceLevel;
  effort: EffortLevel;
  audienceSize: number;
  action: string;
  rationale: string;
  dataPoints: string[];
}

const opportunities: Opportunity[] = [
  {
    id: 1,
    title: 'Upsell 3,208 ACA agents to Premium membership',
    description: 'ACA agents who opened 3+ emails in the last quarter but have not upgraded to Premium tier.',
    category: 'Upsell',
    revenue: 1200000,
    revenueLabel: '$1.2M potential',
    confidence: 'High',
    effort: 'Medium',
    audienceSize: 3208,
    action: 'Launch targeted upsell campaign with ROI calculator',
    rationale: 'High engagement signals upgrade readiness. Historical conversion for similar segments: 12-18%.',
    dataPoints: ['3,208 ACA agents opened 3+ emails', '67% above avg engagement', 'Premium yields 4.2x more revenue per member'],
  },
  {
    id: 2,
    title: 'Re-engage 344 Gone Dark members before renewal',
    description: 'Members with zero engagement in 60+ days whose renewals fall within the next 90 days.',
    category: 'Retention',
    revenue: 278000,
    revenueLabel: '$278K at risk',
    confidence: 'High',
    effort: 'Low',
    audienceSize: 344,
    action: 'Trigger win-back sequence with personal outreach from staff',
    rationale: 'Gone Dark members churn at 72% without intervention. Staff outreach reduces churn to 34%.',
    dataPoints: ['344 members zero engagement 60+ days', 'Renewal within 90 days', '$278K in annual dues at risk'],
  },
  {
    id: 3,
    title: 'Convert 7,108 non-compliant orgs to PFL',
    description: 'Organizations in states with active PFL requirements who have not yet purchased compliance tools.',
    category: 'Compliance',
    revenue: 520000,
    revenueLabel: '$520K potential',
    confidence: 'Medium',
    effort: 'Medium',
    audienceSize: 7108,
    action: 'Run state-specific compliance alert campaign with deadline urgency',
    rationale: 'Compliance emails have 44% open rate. Deadline urgency drives 3x conversion vs. general outreach.',
    dataPoints: ['7,108 orgs in affected states', 'PFL compliance emails: 44% open rate', 'Avg PFL sale: $73 per org'],
  },
  {
    id: 4,
    title: 'Cross-sell ALTA ONE to 2,150 email openers',
    description: 'Members who opened ALTA ONE teasers but have not registered. Early bird pricing still available.',
    category: 'Cross-sell',
    revenue: 162000,
    revenueLabel: '$162K from early bird',
    confidence: 'High',
    effort: 'Low',
    audienceSize: 2150,
    action: 'Send personalized early bird reminder with agenda highlights',
    rationale: 'Opened but not registered = high intent. Personalized follow-up converts 8-12% of this segment.',
    dataPoints: ['2,150 opened ALTA ONE teasers', 'Early bird saves $300 per attendee', 'Registration deadline in 21 days'],
  },
  {
    id: 5,
    title: 'Win back 420 sunset candidates with personal outreach',
    description: 'Members flagged for sunset (non-renewal) who still have open email engagement.',
    category: 'Win-back',
    revenue: 89000,
    revenueLabel: '$89K recoverable',
    confidence: 'Medium',
    effort: 'High',
    audienceSize: 420,
    action: 'Assign staff outreach with personalized value proposition',
    rationale: 'Personal phone/email outreach saves 22% of sunset candidates. ROI: $89K saved for ~40 staff hours.',
    dataPoints: ['420 flagged for non-renewal', '58% still opened recent emails', 'Staff save rate: 22% historically'],
  },
  {
    id: 6,
    title: 'Upgrade 257 ATXA agents to national ACA membership',
    description: 'Texas-only agents who attend national events and engage with national content.',
    category: 'Upsell',
    revenue: 312000,
    revenueLabel: '$312K potential',
    confidence: 'Medium',
    effort: 'Medium',
    audienceSize: 257,
    action: 'Launch ATXA-to-ACA upgrade campaign with dual-benefit messaging',
    rationale: 'ATXA agents engaging nationally signal readiness. Upgrade ARPU is $1,214 vs. $280 ATXA dues.',
    dataPoints: ['257 ATXA agents attend national events', '84% opened 2+ national emails', 'ACA membership: $1,214 avg annual value'],
  },
  {
    id: 7,
    title: 'Target 566 new members with committee recruitment',
    description: 'Members in their first year who have high engagement but no committee involvement.',
    category: 'Engagement',
    revenue: 0,
    revenueLabel: 'Retention lift',
    confidence: 'High',
    effort: 'Low',
    audienceSize: 566,
    action: 'Send committee interest survey with personalized recommendations',
    rationale: 'Committee members renew at 94% vs. 78% for non-committee. Early involvement cements loyalty.',
    dataPoints: ['566 first-year members, high engagement', 'Committee members: 94% renewal rate', '16pp renewal lift = ~$108K protected'],
  },
  {
    id: 8,
    title: 'Monetize 1.2M ad impressions with 4 unsold zones',
    description: 'Four newsletter ad placements consistently go unsold despite high viewership.',
    category: 'Advertising',
    revenue: 48000,
    revenueLabel: '$48K/yr',
    confidence: 'High',
    effort: 'Low',
    audienceSize: 0,
    action: 'Package unsold zones into a discounted annual bundle for sponsors',
    rationale: '1.2M annual impressions at $40 CPM = $48K. Bundle discount of 20% still yields $38.4K net new.',
    dataPoints: ['4 unsold ad zones per issue', '1.2M annual impressions wasted', 'Title News CPM benchmark: $40'],
  },
  {
    id: 9,
    title: 'Launch ACU CEO dinner using relationship data',
    description: 'Use RelationshipIQ data to identify top ACU contacts for an exclusive CEO dinner at ALTA ONE.',
    category: 'Events',
    revenue: 0,
    revenueLabel: 'Retention of $2.4M segment',
    confidence: 'Medium',
    effort: 'High',
    audienceSize: 12,
    action: 'Curate invite list from top 12 ACU relationships, personal invite from CEO',
    rationale: 'ACU segment represents $2.4M in dues. Exclusive events strengthen retention of highest-value members.',
    dataPoints: ['12 ACU contacts with "Exceptional" relationship scores', '$2.4M annual dues from ACU segment', 'CEO personal outreach: 95% attendance rate'],
  },
  {
    id: 10,
    title: 'Convert top 10 event attendees to TIPAC donors',
    description: 'Frequent event attendees who have never donated to TIPAC but show advocacy interest.',
    category: 'Advocacy',
    revenue: 25000,
    revenueLabel: '$25K potential',
    confidence: 'Low',
    effort: 'Low',
    audienceSize: 10,
    action: 'Personal ask at next event with matching gift incentive',
    rationale: 'Event attendees who donate have 2.3x higher lifetime value. Personal ask converts at 40% for engaged members.',
    dataPoints: ['10 frequent attendees, zero TIPAC history', 'Opened 100% of advocacy emails', 'Avg first TIPAC pledge: $2,500'],
  },
];

export default function OpportunityFinder() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activatedIds, setActivatedIds] = useState<Set<number>>(new Set());

  const totalRevenue = opportunities.reduce((s, o) => s + o.revenue, 0);
  const highImpact = opportunities.filter(o => o.revenue >= 200000).length;
  const quickWins = opportunities.filter(o => o.effort === 'Low').length;

  const handleActivate = (id: number) => {
    setActivatedIds(prev => new Set(prev).add(id));
  };

  /* Doughnut chart data by category */
  const categoryTotals: Record<string, number> = {};
  opportunities.forEach(o => {
    const cat = o.category;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (o.revenue || 0);
  });
  const doughnutLabels = Object.keys(categoryTotals).filter(k => categoryTotals[k] > 0);
  const doughnutValues = doughnutLabels.map(k => categoryTotals[k]);
  const doughnutColors = doughnutLabels.map(k => categoryColors[k as OpportunityCategory] || C.blue);

  return (
    <div className="p-6">
      {/* -- 1. Branded Header -- */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(245,158,11,0.2) 100%)',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            <Search className="w-5 h-5" style={{ color: C.emerald }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              OpportunityFinder<span style={{ color: C.emerald, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.emerald }}>
              Find revenue hiding in your data.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          AI-identified growth opportunities ranked by potential revenue impact. OpportunityFinder scans
          engagement patterns, membership data, and behavioral signals to surface the actions most likely
          to drive revenue, retention, and growth.
        </p>
      </div>

      {/* -- 2. SparkKpi Row -- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <SparkKpi
          label="Opportunities Found"
          value={opportunities.length}
          sub="AI-identified growth actions"
          icon={Lightbulb}
          color={C.emerald}
          sparkData={[4, 5, 6, 7, 8, 9, 10]}
          sparkColor={C.emerald}
          trend={{ value: 25, label: 'vs last scan' }}
          accent
        />
        <SparkKpi
          label="Total Revenue Potential"
          value={'$' + (totalRevenue / 1000000).toFixed(1) + 'M'}
          sub="Combined pipeline value"
          icon={DollarSign}
          color={C.green}
          sparkData={[1.2, 1.5, 1.8, 2.0, 2.2, 2.4, totalRevenue / 1000000]}
          sparkColor={C.green}
          trend={{ value: 18.4, label: 'growing pipeline' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Total addressable revenue across all identified opportunities.
              </p>
              {opportunities.filter(o => o.revenue > 0).sort((a, b) => b.revenue - a.revenue).map(o => (
                <div key={o.id} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)' }}>
                  <span className="truncate mr-2" style={{ color: 'var(--heading)' }}>{o.title.substring(0, 40)}...</span>
                  <span className="font-bold flex-shrink-0" style={{ color: C.green }}>${(o.revenue / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Highest Impact"
          value={highImpact}
          sub="Opportunities above $200K"
          icon={Target}
          color={C.purple}
          sparkData={[1, 2, 2, 3, 3, 3, highImpact]}
          sparkColor={C.purple}
          accent
        />
        <SparkKpi
          label="Quick Wins"
          value={quickWins}
          sub="Low effort, high confidence"
          icon={Zap}
          color={C.amber}
          sparkData={[2, 2, 3, 3, 4, 4, quickWins]}
          sparkColor={C.amber}
          trend={{ value: 33, label: 'more than last month' }}
          accent
        />
      </div>

      {/* -- 3. Total Opportunity Pipeline -- */}
      <Card
        title="Total Opportunity Pipeline"
        subtitle="Combined revenue potential across all identified opportunities"
        className="mb-8"
      >
        <div className="flex items-center justify-center py-4">
          <div className="text-center">
            <AnimatedCounter
              value={totalRevenue}
              prefix="$"
              className="text-5xl"
              color={C.green}
              duration={2000}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              in identified revenue potential across {opportunities.length} opportunities
            </p>
          </div>
        </div>
      </Card>

      {/* -- 4. Opportunity Cards -- */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="w-4 h-4" style={{ color: C.emerald }} />
          <h2 className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>Ranked Opportunities</h2>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: C.emerald }}>
            Sorted by revenue impact
          </span>
        </div>

        <div className="space-y-3">
          {opportunities.map((opp, idx) => {
            const isExpanded = expandedId === opp.id;
            const isActivated = activatedIds.has(opp.id);
            const catColor = categoryColors[opp.category];

            return (
              <div
                key={opp.id}
                className="rounded-xl border overflow-hidden transition-all duration-200"
                style={{
                  background: 'var(--card)',
                  borderColor: isActivated ? C.green + '50' : 'var(--card-border)',
                  borderLeftWidth: '4px',
                  borderLeftColor: catColor,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : opp.id)}
                >
                  {/* Rank */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-extrabold"
                    style={{
                      background: idx < 3 ? `color-mix(in srgb, ${C.green} 15%, transparent)` : 'var(--input-bg)',
                      color: idx < 3 ? C.green : 'var(--text-muted)',
                      border: idx < 3 ? `1px solid ${C.green}30` : '1px solid var(--card-border)',
                    }}
                  >
                    {idx + 1}
                  </div>

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[11px] font-bold truncate" style={{ color: 'var(--heading)' }}>{opp.title}</h3>
                      {isActivated && (
                        <span className="flex items-center gap-1 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(140,198,63,0.15)', color: C.green }}>
                          <CheckCircle2 className="w-2.5 h-2.5" /> Activated
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `color-mix(in srgb, ${catColor} 12%, transparent)`, color: catColor }}>{opp.category}</span>
                      <span className="flex items-center gap-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        <Signal className="w-3 h-3" style={{ color: confidenceColors[opp.confidence] }} />
                        {opp.confidence} confidence
                      </span>
                      <span className="flex items-center gap-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="w-3 h-3" style={{ color: effortColors[opp.effort] }} />
                        {opp.effort} effort
                      </span>
                      {opp.audienceSize > 0 && (
                        <span className="flex items-center gap-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                          <Users className="w-3 h-3" />
                          {opp.audienceSize.toLocaleString()} members
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-extrabold" style={{ color: opp.revenue > 0 ? C.green : C.teal }}>{opp.revenueLabel}</div>
                  </div>

                  {/* Expand arrow */}
                  <div style={{ color: 'var(--text-muted)' }}>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Description & Rationale */}
                      <div className="space-y-3">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Description</div>
                          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--heading)' }}>{opp.description}</p>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Rationale</div>
                          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--heading)' }}>{opp.rationale}</p>
                        </div>
                      </div>

                      {/* Data points + Action */}
                      <div className="space-y-3">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Supporting Data</div>
                          <div className="space-y-1.5">
                            {opp.dataPoints.map((dp, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: catColor }} />
                                <span className="text-[10px]" style={{ color: 'var(--heading)' }}>{dp}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-lg p-3" style={{ background: `color-mix(in srgb, ${catColor} 6%, transparent)`, border: `1px solid ${catColor}20` }}>
                          <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: catColor }}>Recommended Action</div>
                          <p className="text-[10px] font-semibold" style={{ color: 'var(--heading)' }}>{opp.action}</p>
                        </div>
                        {!isActivated && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleActivate(opp.id); }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02] w-full justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${C.emerald}, ${C.teal})`,
                              color: '#fff',
                              boxShadow: `0 4px 16px ${C.emerald}40`,
                            }}
                          >
                            <Zap className="w-4 h-4" /> Activate This Opportunity
                          </button>
                        )}
                        {isActivated && (
                          <div className="flex items-center gap-2 justify-center py-2">
                            <CheckCircle2 className="w-4 h-4" style={{ color: C.green }} />
                            <span className="text-[11px] font-bold" style={{ color: C.green }}>Activated — Workflow queued</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* -- 5. Doughnut Chart: Opportunities by Category -- */}
      <Card
        title="Revenue Potential by Category"
        subtitle="Doughnut breakdown of opportunity pipeline"
        className="mb-8"
      >
        <ClientChart
          type="doughnut"
          height={320}
          data={{
            labels: doughnutLabels,
            datasets: [{
              data: doughnutValues,
              backgroundColor: doughnutColors.map(c => c + '80'),
              borderColor: doughnutColors,
              borderWidth: 2,
            }],
          }}
          options={{
            cutout: '60%',
            plugins: {
              legend: {
                display: true,
                position: 'bottom' as const,
                labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 11 } },
              },
            },
          }}
        />
      </Card>

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(16,185,129,0.08)', color: C.emerald, border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <Search className="w-3 h-3" />
          OpportunityFinder&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
