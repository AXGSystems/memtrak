'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { MiniBar } from '@/components/SparkKpi';
import {
  Building2,
  Users,
  DollarSign,
  BarChart3,
  Palette,
  Globe,
  Shield,
  Lock,
  Database,
  Layers,
  CheckCircle,
  XCircle,
  Minus,
  ChevronRight,
  Settings,
  Sparkles,
  Crown,
  Zap,
} from 'lucide-react';

const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  teal: '#14b8a6',
  cyan: '#06b6d4',
};

/* ── Tenant Data ──────────────────────────────────── */
const tenants = [
  {
    name: 'ALTA',
    domain: 'memtrak.alta.org',
    members: 4994,
    tier: 'Enterprise' as const,
    primaryColor: '#002D5C',
    accentColor: '#8CC63F',
    status: 'Active' as const,
    monthlyRevenue: 4500,
    campaigns: 42,
    features: 18,
    logo: 'ALTA',
    setupDate: 'Jan 2026',
  },
  {
    name: 'Texas Land Title Association',
    domain: 'engage.tlta.com',
    members: 3200,
    tier: 'Professional' as const,
    primaryColor: '#1E3A5F',
    accentColor: '#C7923E',
    status: 'Active' as const,
    monthlyRevenue: 2800,
    campaigns: 28,
    features: 14,
    logo: 'TLTA',
    setupDate: 'Mar 2026',
  },
  {
    name: 'National Notary Association',
    domain: 'track.nationalnotary.org',
    members: 8500,
    tier: 'Enterprise' as const,
    primaryColor: '#2C1810',
    accentColor: '#D4A574',
    status: 'Active' as const,
    monthlyRevenue: 5200,
    campaigns: 56,
    features: 18,
    logo: 'NNA',
    setupDate: 'Feb 2026',
  },
];

const tierConfig: Record<string, { color: string; bg: string; icon: typeof Crown }> = {
  Starter: { color: C.blue, bg: 'rgba(74,144,217,0.12)', icon: Zap },
  Professional: { color: C.purple, bg: 'rgba(168,85,247,0.12)', icon: Sparkles },
  Enterprise: { color: C.amber, bg: 'rgba(245,158,11,0.12)', icon: Crown },
};

/* ── Pricing Tiers ────────────────────────────────── */
const pricingTiers = [
  {
    name: 'Starter',
    price: '$499',
    period: '/month',
    color: C.blue,
    icon: Zap,
    memberLimit: 'Up to 1,000 members',
    features: [
      'Core email analytics',
      'Basic campaign tracking',
      'Standard reports',
      'Email support',
      '1 admin user',
    ],
    highlight: false,
  },
  {
    name: 'Professional',
    price: '$1,499',
    period: '/month',
    color: C.purple,
    icon: Sparkles,
    memberLimit: 'Up to 5,000 members',
    features: [
      'Everything in Starter',
      'Custom domain + branding',
      'DecayRadar + GhostWatch',
      'Advanced segmentation',
      'API access',
      '5 admin users',
      'Priority support',
    ],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$3,499',
    period: '/month',
    color: C.amber,
    icon: Crown,
    memberLimit: 'Unlimited members',
    features: [
      'Everything in Professional',
      'Full feature suite (18 modules)',
      'Custom integrations',
      'Dedicated success manager',
      'SSO + advanced security',
      'Unlimited admin users',
      'SLA guarantee',
      'On-premise option',
    ],
    highlight: false,
  },
];

/* ── Feature Matrix ───────────────────────────────── */
const featureMatrix = [
  { feature: 'Email Analytics', starter: true, professional: true, enterprise: true },
  { feature: 'Campaign Tracking', starter: true, professional: true, enterprise: true },
  { feature: 'Standard Reports', starter: true, professional: true, enterprise: true },
  { feature: 'Custom Domain', starter: false, professional: true, enterprise: true },
  { feature: 'Custom Branding', starter: false, professional: true, enterprise: true },
  { feature: 'DecayRadar', starter: false, professional: true, enterprise: true },
  { feature: 'GhostWatch', starter: false, professional: true, enterprise: true },
  { feature: 'AnomalyAlert', starter: false, professional: false, enterprise: true },
  { feature: 'EngagePoints', starter: false, professional: false, enterprise: true },
  { feature: 'Board Briefing', starter: false, professional: false, enterprise: true },
  { feature: 'Predictive Content', starter: false, professional: false, enterprise: true },
  { feature: 'API Access', starter: false, professional: true, enterprise: true },
  { feature: 'SSO Integration', starter: false, professional: false, enterprise: true },
  { feature: 'Custom Integrations', starter: false, professional: false, enterprise: true },
];

/* ── Setup Wizard Steps ───────────────────────────── */
const wizardSteps = [
  { step: 1, name: 'Organization', desc: 'Name, domain, contact info', icon: Building2, status: 'complete' as const },
  { step: 2, name: 'Branding', desc: 'Logo, colors, theme', icon: Palette, status: 'complete' as const },
  { step: 3, name: 'Domain', desc: 'Custom domain + SSL', icon: Globe, status: 'current' as const },
  { step: 4, name: 'Data Import', desc: 'Member + campaign data', icon: Database, status: 'upcoming' as const },
  { step: 5, name: 'Configuration', desc: 'Features, permissions, roles', icon: Settings, status: 'upcoming' as const },
  { step: 6, name: 'Go Live', desc: 'Final review + launch', icon: CheckCircle, status: 'upcoming' as const },
];

export default function WhiteLabel() {
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tenants' | 'pricing'>('tenants');

  const totalMembers = tenants.reduce((s, t) => s + t.members, 0);
  const totalRevenue = tenants.reduce((s, t) => s + t.monthlyRevenue, 0);
  const avgFeatures = Math.round(tenants.reduce((s, t) => s + t.features, 0) / tenants.length);

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(74,144,217,0.2) 100%)',
              border: '1px solid rgba(20,184,166,0.3)',
            }}
          >
            <Building2 className="w-5 h-5" style={{ color: C.teal }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              WhiteLabel<span style={{ color: C.teal, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.teal }}>
              Your platform, your brand.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Multi-tenant white-label platform for deploying MEMTrak to other organizations. Each tenant gets
          their own branded experience with custom domain, logo, colors, and theme &mdash; while sharing the
          same powerful infrastructure. Full data isolation ensures complete privacy between organizations.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Active Tenants"
          value={tenants.length}
          sub="Organizations on platform"
          icon={Building2}
          color={C.teal}
          sparkData={[1, 1, 2, 2, 3, 3]}
          sparkColor={C.teal}
          trend={{ value: 50, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Total Members"
          value={totalMembers.toLocaleString()}
          sub="Across all tenants"
          icon={Users}
          color={C.blue}
          sparkData={[5200, 8400, 11200, 13800, 15200, 16694]}
          sparkColor={C.blue}
          trend={{ value: 28.4, label: 'vs last quarter' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Member distribution across tenants:
              </p>
              {tenants.map((t) => (
                <div key={t.name} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)' }}>
                  <span style={{ color: 'var(--heading)' }}>{t.name}</span>
                  <span className="font-bold" style={{ color: C.blue }}>{t.members.toLocaleString()}</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Monthly Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          sub="Platform licensing fees"
          icon={DollarSign}
          color={C.green}
          sparkData={[4500, 6200, 8800, 10500, 11800, 12500]}
          sparkColor={C.green}
          trend={{ value: 34.2, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Feature Adoption"
          value="83%"
          sub={`Avg ${avgFeatures} of 18 features used`}
          icon={BarChart3}
          color={C.purple}
          sparkData={[60, 65, 70, 74, 78, 83]}
          sparkColor={C.purple}
          trend={{ value: 12.1, label: 'vs last quarter' }}
          accent
        />
      </div>

      {/* ── 3. Tenant Management Dashboard ────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4" style={{ color: C.teal }} />
          <h2 className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>
            Tenant Dashboard
          </h2>
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(20,184,166,0.15)', color: C.teal }}
          >
            {tenants.length} organizations
          </span>
        </div>

        <div className="space-y-3">
          {tenants.map((t) => {
            const tc = tierConfig[t.tier];
            const isExpanded = selectedTenant === t.name;

            return (
              <div
                key={t.name}
                className="rounded-xl border overflow-hidden transition-all duration-200 hover:translate-y-[-1px]"
                style={{
                  background: 'var(--card)',
                  borderColor: isExpanded ? tc.color : 'var(--card-border)',
                  borderLeftWidth: '4px',
                  borderLeftColor: t.accentColor,
                  boxShadow: isExpanded
                    ? `0 4px 24px rgba(0,0,0,0.15), 0 0 0 1px ${tc.color}20`
                    : '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setSelectedTenant(isExpanded ? null : t.name)}
                >
                  <div className="flex items-start gap-4">
                    {/* Tenant logo placeholder */}
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 text-xs font-extrabold"
                      style={{
                        background: `linear-gradient(135deg, ${t.primaryColor} 0%, ${t.accentColor} 100%)`,
                        color: '#fff',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {t.logo}
                    </div>

                    {/* Tenant info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: 'var(--heading)' }}>
                          {t.name}
                        </span>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: tc.bg, color: tc.color }}
                        >
                          {t.tier}
                        </span>
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(140,198,63,0.12)', color: C.green }}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="text-[10px] mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Globe className="w-3 h-3 flex-shrink-0" />
                        {t.domain}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <span className="font-bold" style={{ color: 'var(--heading)' }}>{t.members.toLocaleString()}</span> members
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <span className="font-bold" style={{ color: 'var(--heading)' }}>{t.campaigns}</span> campaigns
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <span className="font-bold" style={{ color: 'var(--heading)' }}>{t.features}/18</span> features
                        </div>
                      </div>
                    </div>

                    {/* Revenue + expand */}
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <div className="text-lg font-extrabold" style={{ color: C.green }}>
                        ${t.monthlyRevenue.toLocaleString()}
                      </div>
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        monthly revenue
                      </div>
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        Since {t.setupDate}
                      </div>
                      <ChevronRight
                        className="w-4 h-4 mt-1 transition-transform duration-200"
                        style={{
                          color: 'var(--text-muted)',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded: per-tenant customization */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      {/* Branding */}
                      <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                        <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                          Branding
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded" style={{ background: t.primaryColor }} />
                            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              Primary: <span className="font-mono font-bold" style={{ color: 'var(--heading)' }}>{t.primaryColor}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded" style={{ background: t.accentColor }} />
                            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              Accent: <span className="font-mono font-bold" style={{ color: 'var(--heading)' }}>{t.accentColor}</span>
                            </div>
                          </div>
                          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            Theme: <span style={{ color: 'var(--heading)' }}>Dark</span>
                          </div>
                        </div>
                      </div>

                      {/* Domain + Security */}
                      <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                        <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                          Domain &amp; Security
                        </div>
                        <div className="space-y-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <div className="flex justify-between">
                            <span>Domain</span>
                            <span style={{ color: 'var(--heading)' }}>{t.domain}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>SSL</span>
                            <span style={{ color: C.green }}>Active</span>
                          </div>
                          <div className="flex justify-between">
                            <span>SSO</span>
                            <span style={{ color: t.tier === 'Enterprise' ? C.green : 'var(--text-muted)' }}>
                              {t.tier === 'Enterprise' ? 'Enabled' : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Data Isolation</span>
                            <span style={{ color: C.green }}>Verified</span>
                          </div>
                        </div>
                      </div>

                      {/* Usage */}
                      <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                        <div className="text-[9px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                          Usage
                        </div>
                        <div className="space-y-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <div className="flex justify-between">
                            <span>Active campaigns</span>
                            <span style={{ color: 'var(--heading)' }}>{t.campaigns}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Features enabled</span>
                            <span style={{ color: 'var(--heading)' }}>{t.features}/18</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Feature adoption</span>
                            <span className="font-bold" style={{ color: C.green }}>{Math.round((t.features / 18) * 100)}%</span>
                          </div>
                          <div className="mt-1">
                            <MiniBar value={t.features} max={18} color={t.accentColor} height={4} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Data Isolation Visualization ───────────────────── */}
      <Card
        title="Data Isolation Architecture"
        subtitle="How tenant data is kept completely separate"
        className="mb-8"
        detailTitle="Isolation Details"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              WhiteLabel uses row-level security with tenant-scoped database connections. Each tenant&apos;s
              data is cryptographically isolated &mdash; even infrastructure administrators cannot cross-query
              tenant boundaries without explicit authorization.
            </p>
            {[
              { layer: 'Application Layer', desc: 'Tenant ID injected into every query. Middleware validates tenant context on each request.', icon: Layers },
              { layer: 'Database Layer', desc: 'Row-level security policies. Separate schemas per tenant. Encrypted at rest with tenant-specific keys.', icon: Database },
              { layer: 'Network Layer', desc: 'Custom domains with dedicated SSL. Isolated CDN configs. Per-tenant WAF rules.', icon: Globe },
              { layer: 'Authentication Layer', desc: 'Separate auth pools per tenant. Optional SSO integration. MFA enforcement configurable per org.', icon: Lock },
            ].map((l) => (
              <div key={l.layer} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <l.icon className="w-3.5 h-3.5" style={{ color: C.teal }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{l.layer}</span>
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{l.desc}</p>
              </div>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tenants.map((t) => (
            <div
              key={t.name}
              className="rounded-xl p-4 text-center"
              style={{
                background: 'var(--input-bg)',
                border: `2px solid ${t.accentColor}30`,
              }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg mx-auto mb-2 text-[10px] font-extrabold"
                style={{ background: `linear-gradient(135deg, ${t.primaryColor}, ${t.accentColor})`, color: '#fff' }}
              >
                {t.logo}
              </div>
              <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--heading)' }}>{t.name}</div>
              <div className="space-y-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" style={{ color: C.green }} />
                  Isolated Database
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" style={{ color: C.green }} />
                  Encrypted Storage
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Globe className="w-3 h-3" style={{ color: C.green }} />
                  Custom Domain
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg p-3 text-center" style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)' }}>
          <div className="text-[10px] font-bold" style={{ color: C.teal }}>
            Zero cross-tenant data access &mdash; cryptographic isolation at every layer
          </div>
        </div>
      </Card>

      {/* ── 5. Pricing Tiers ──────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4" style={{ color: C.green }} />
          <h2 className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>
            Pricing Tiers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pricingTiers.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border overflow-hidden transition-all duration-200 hover:translate-y-[-2px]"
              style={{
                background: 'var(--card)',
                borderColor: t.highlight ? t.color : 'var(--card-border)',
                borderWidth: t.highlight ? '2px' : '1px',
                boxShadow: t.highlight
                  ? `0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px ${t.color}30`
                  : '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              {t.highlight && (
                <div
                  className="text-center text-[9px] font-bold py-1 uppercase tracking-wider"
                  style={{ background: t.color + '20', color: t.color }}
                >
                  Most Popular
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <t.icon className="w-5 h-5" style={{ color: t.color }} />
                  <span className="text-sm font-extrabold" style={{ color: t.color }}>{t.name}</span>
                </div>
                <div className="mb-1">
                  <span className="text-2xl font-extrabold" style={{ color: 'var(--heading)' }}>{t.price}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.period}</span>
                </div>
                <div className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>{t.memberLimit}</div>

                <div className="space-y-2">
                  {t.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-[10px]">
                      <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: C.green }} />
                      <span style={{ color: 'var(--heading)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ── 6. Feature Matrix ───────────────────────────────── */}
        <Card
          title="Feature Matrix"
          subtitle="Feature availability by tier"
          detailTitle="Complete Feature Matrix"
          detailContent={
            <div className="space-y-1">
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                Each tier builds on the previous one. Enterprise includes all 18 MEMTrak modules
                plus advanced security and integration options.
              </p>
              {featureMatrix.map((f) => (
                <div key={f.feature} className="flex items-center justify-between p-2 rounded-lg text-[10px]" style={{ background: 'var(--input-bg)' }}>
                  <span style={{ color: 'var(--heading)' }}>{f.feature}</span>
                  <div className="flex items-center gap-6">
                    {[f.starter, f.professional, f.enterprise].map((v, i) => (
                      <div key={i} className="w-12 text-center">
                        {v ? (
                          <CheckCircle className="w-3.5 h-3.5 mx-auto" style={{ color: C.green }} />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-1">
            {/* Header */}
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Feature</span>
              <div className="flex items-center gap-3">
                {['Starter', 'Pro', 'Ent'].map((l, i) => (
                  <span key={l} className="w-8 text-center text-[8px] font-bold uppercase" style={{ color: [C.blue, C.purple, C.amber][i] }}>
                    {l}
                  </span>
                ))}
              </div>
            </div>
            {featureMatrix.map((f) => (
              <div key={f.feature} className="flex items-center justify-between px-2 py-1.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <span className="text-[10px]" style={{ color: 'var(--heading)' }}>{f.feature}</span>
                <div className="flex items-center gap-3">
                  {[f.starter, f.professional, f.enterprise].map((v, i) => (
                    <div key={i} className="w-8 text-center">
                      {v ? (
                        <CheckCircle className="w-3 h-3 mx-auto" style={{ color: C.green }} />
                      ) : (
                        <Minus className="w-3 h-3 mx-auto" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 7. Setup Wizard Preview ─────────────────────────── */}
        <Card
          title="Tenant Setup Wizard"
          subtitle="6-step onboarding process for new organizations"
          detailTitle="Wizard Details"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                New tenants go through a guided 6-step setup wizard. Average completion time is
                2.5 hours. The wizard handles everything from branding to data import to go-live.
              </p>
              {wizardSteps.map((s) => (
                <div key={s.step} className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="w-4 h-4" style={{ color: s.status === 'complete' ? C.green : s.status === 'current' ? C.teal : 'var(--text-muted)' }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>Step {s.step}: {s.name}</span>
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded-full ml-auto"
                      style={{
                        background: s.status === 'complete' ? 'rgba(140,198,63,0.12)' : s.status === 'current' ? 'rgba(20,184,166,0.12)' : 'var(--input-bg)',
                        color: s.status === 'complete' ? C.green : s.status === 'current' ? C.teal : 'var(--text-muted)',
                      }}
                    >
                      {s.status === 'complete' ? 'Complete' : s.status === 'current' ? 'In Progress' : 'Upcoming'}
                    </span>
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-0">
            {wizardSteps.map((s, idx) => {
              const isComplete = s.status === 'complete';
              const isCurrent = s.status === 'current';
              const lineColor = isComplete ? C.green : isCurrent ? C.teal : 'var(--card-border)';

              return (
                <div key={s.step} className="flex gap-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                      style={{
                        background: isComplete ? C.green + '20' : isCurrent ? C.teal + '20' : 'var(--input-bg)',
                        border: `2px solid ${isComplete ? C.green : isCurrent ? C.teal : 'var(--card-border)'}`,
                      }}
                    >
                      {isComplete ? (
                        <CheckCircle className="w-4 h-4" style={{ color: C.green }} />
                      ) : (
                        <s.icon className="w-3.5 h-3.5" style={{ color: isCurrent ? C.teal : 'var(--text-muted)' }} />
                      )}
                    </div>
                    {idx < wizardSteps.length - 1 && (
                      <div className="w-0.5 flex-1 min-h-[24px]" style={{ background: lineColor }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`pb-4 ${idx === wizardSteps.length - 1 ? '' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold" style={{ color: isCurrent ? C.teal : isComplete ? 'var(--heading)' : 'var(--text-muted)' }}>
                        {s.name}
                      </span>
                      {isCurrent && (
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse"
                          style={{ background: C.teal + '20', color: C.teal }}
                        >
                          In Progress
                        </span>
                      )}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Setup Progress</span>
              <span className="text-[10px] font-bold" style={{ color: C.teal }}>33% Complete</span>
            </div>
            <div className="mt-1.5">
              <MiniBar value={33} max={100} color={C.teal} height={4} />
            </div>
          </div>
        </Card>
      </div>

      {/* ── 8. Revenue by Tenant (Chart) ──────────────────────── */}
      <Card
        title="Monthly Revenue by Tenant"
        subtitle="Platform licensing revenue distribution"
        className="mb-8"
      >
        <ClientChart
          type="bar"
          height={240}
          data={{
            labels: tenants.map((t) => t.name.length > 20 ? t.logo : t.name),
            datasets: [
              {
                label: 'Monthly Revenue',
                data: tenants.map((t) => t.monthlyRevenue),
                backgroundColor: tenants.map((t) => t.accentColor + '80'),
                borderColor: tenants.map((t) => t.accentColor),
                borderWidth: 2,
                borderRadius: 8,
              },
            ],
          }}
          options={{
            plugins: {
              legend: { display: false },
              datalabels: {
                display: true,
                anchor: 'end' as const,
                align: 'end' as const,
                color: '#e2e8f0',
                font: { weight: 'bold' as const, size: 10 },
                formatter: (v: number) => '$' + v.toLocaleString(),
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: '#1e3350' },
                ticks: {
                  color: '#8899aa',
                  callback: (v: number | string) => '$' + Number(v).toLocaleString(),
                },
              },
              x: {
                grid: { display: false },
                ticks: { color: '#8899aa', font: { weight: 'bold' as const } },
              },
            },
          }}
        />
      </Card>

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(20,184,166,0.08)',
            color: C.teal,
            border: '1px solid rgba(20,184,166,0.15)',
          }}
        >
          <Building2 className="w-3 h-3" />
          WhiteLabel&trade; is a MEMTrak platform feature
        </span>
      </div>
    </div>
  );
}
