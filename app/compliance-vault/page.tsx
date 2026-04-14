'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import { MiniBar } from '@/components/SparkKpi';
import {
  ShieldCheck,
  Lock,
  Globe,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Users,
  Eye,
  X,
  ListChecks,
  Scale,
  Database,
  MapPin,
} from 'lucide-react';

/* ── Palette ── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  emerald: '#10b981',
};

/* ── Consent log synthetic data ── */
const consentLog = [
  { id: 'CL-2026-0414-001', member: 'Sandra Wilkins', org: 'Pacific Title Co.', action: 'Opt-In', method: 'Web Form', timestamp: '2026-04-14 09:23:14', ip: '184.23.98.142', regulation: 'CAN-SPAM', details: 'Member portal opt-in for ALTA ONE communications' },
  { id: 'CL-2026-0413-019', member: 'Hans Mueller', org: 'Europa Title GmbH', action: 'Consent Renewed', method: 'Double Opt-In', timestamp: '2026-04-13 16:45:02', ip: '92.168.45.78', regulation: 'GDPR', details: 'Annual consent renewal — explicit double opt-in confirmed via email link' },
  { id: 'CL-2026-0412-007', member: 'Robert Chen', org: 'First American Title', action: 'Opt-Out', method: 'Email Link', timestamp: '2026-04-12 11:18:33', ip: '67.205.12.44', regulation: 'CAN-SPAM', details: 'Unsubscribed from Title News Weekly via one-click unsubscribe header' },
  { id: 'CL-2026-0411-042', member: 'Marie Dupont', org: 'Transatlantic Realty', action: 'Data Deletion', method: 'GDPR Request', timestamp: '2026-04-11 14:02:19', ip: '86.241.12.90', regulation: 'GDPR', details: 'Right to erasure request — all PII removed within 72 hours. Suppression record retained.' },
  { id: 'CL-2026-0410-015', member: 'James Patterson', org: 'Heritage Abstract LLC', action: 'Opt-In', method: 'Event Registration', timestamp: '2026-04-10 08:55:47', ip: '24.112.67.201', regulation: 'CAN-SPAM', details: 'Consent captured during ALTA ONE 2026 registration flow' },
  { id: 'CL-2026-0409-008', member: 'Carlos Rivera', org: 'Southwest Title Services', action: 'Preference Update', method: 'Preference Center', timestamp: '2026-04-09 13:37:22', ip: '73.158.201.34', regulation: 'CCPA', details: 'Updated email preferences: opted out of advocacy, retained events and compliance' },
  { id: 'CL-2026-0408-031', member: 'Lisa Thompson', org: 'National Title Services', action: 'Opt-In', method: 'API Sync', timestamp: '2026-04-08 10:12:08', ip: '52.14.167.89', regulation: 'CAN-SPAM', details: 'Consent synced from Higher Logic membership portal via API integration' },
  { id: 'CL-2026-0407-022', member: 'Yuki Tanaka', org: 'Pacific Rim Title', action: 'Consent Withdrawn', method: 'CCPA Request', timestamp: '2026-04-07 15:28:51', ip: '104.28.55.123', regulation: 'CCPA', details: 'Do Not Sell request processed. Marketing consent withdrawn. Transactional emails retained per legal basis.' },
];

/* ── Geographic compliance rules ── */
const geoRules = [
  { region: 'European Union', regulation: 'GDPR', status: 'Active', color: C.blue, members: 42, requirements: ['Double opt-in required', 'Right to erasure', 'Data portability', '72hr breach notification', 'DPO appointment'] },
  { region: 'United States', regulation: 'CAN-SPAM', status: 'Active', color: C.green, members: 4820, requirements: ['Physical address in emails', 'Opt-out honored within 10 days', 'No misleading headers', 'Clear identification as ad'] },
  { region: 'California', regulation: 'CCPA/CPRA', status: 'Active', color: C.purple, members: 680, requirements: ['Right to know', 'Right to delete', 'Right to opt-out of sale', 'Non-discrimination', 'Privacy notice at collection'] },
  { region: 'Canada', regulation: 'CASL', status: 'Monitoring', color: C.amber, members: 18, requirements: ['Express consent required', 'Identification of sender', 'Unsubscribe mechanism', 'Record keeping'] },
];

/* ── Compliance checklist ── */
const complianceChecklist = [
  { requirement: 'Unsubscribe link in all commercial emails', status: 'pass' as const, regulation: 'CAN-SPAM', detail: 'All templates verified — one-click unsubscribe header and visible footer link present in 100% of sent emails.' },
  { requirement: 'Physical mailing address included', status: 'pass' as const, regulation: 'CAN-SPAM', detail: 'ALTA headquarters address (1800 M Street NW, Suite 300S, Washington, DC 20036) included in every email footer.' },
  { requirement: 'Opt-out requests honored within 10 business days', status: 'pass' as const, regulation: 'CAN-SPAM', detail: 'Average processing time: 0.3 hours (instant). All platforms sync suppression within 15 minutes via webhook.' },
  { requirement: 'Double opt-in for EU contacts', status: 'pass' as const, regulation: 'GDPR', detail: '42 EU contacts — all 42 have confirmed double opt-in consent on file with IP and timestamp evidence.' },
  { requirement: 'Data processing agreements with vendors', status: 'pass' as const, regulation: 'GDPR', detail: 'DPAs on file with Higher Logic, Microsoft (Outlook), and all MEMTrak sub-processors.' },
  { requirement: 'Privacy policy linked in all emails', status: 'pass' as const, regulation: 'GDPR/CCPA', detail: 'Privacy policy link present in all email templates. Last policy update: March 2026.' },
  { requirement: 'Consent records with timestamps and IPs', status: 'pass' as const, regulation: 'GDPR/CCPA', detail: `${consentLog.length} consent events logged this week. All include timestamp, IP address, method, and regulation context.` },
  { requirement: 'CCPA "Do Not Sell" request processing', status: 'pass' as const, regulation: 'CCPA', detail: '2 CCPA requests processed this quarter. Average fulfillment time: 18 hours (well within 45-day requirement).' },
  { requirement: 'DMARC policy at p=quarantine or p=reject', status: 'fail' as const, regulation: 'Best Practice', detail: 'Current DMARC policy is p=none (monitoring only). Upgrade to p=quarantine recommended — see InboxGuard for remediation.' },
  { requirement: 'Annual consent renewal for EU contacts', status: 'warn' as const, regulation: 'GDPR', detail: '38 of 42 EU contacts renewed consent in 2026. 4 contacts due for renewal by May 15, 2026.' },
  { requirement: 'Suppression list synchronized across all platforms', status: 'pass' as const, regulation: 'CAN-SPAM', detail: 'MEMTrak, Higher Logic, and Outlook suppression lists synced via real-time webhook. Last sync: 14 minutes ago.' },
  { requirement: 'Breach notification procedure documented', status: 'pass' as const, regulation: 'GDPR', detail: 'Incident response playbook v3.1 on file. Last tabletop exercise: February 2026. Next scheduled: August 2026.' },
];

/* ── Suppression list stats ── */
const suppressionStats = {
  total: 432,
  hardBounce: 220,
  optOut: 168,
  complaint: 24,
  gdprErasure: 8,
  ccpaOptOut: 12,
  lastSync: '14 min ago',
  platforms: ['MEMTrak', 'Higher Logic', 'Outlook'],
};

export default function ComplianceVault() {
  const [selectedLog, setSelectedLog] = useState<typeof consentLog[0] | null>(null);
  const [selectedCheck, setSelectedCheck] = useState<typeof complianceChecklist[0] | null>(null);
  const [showGeoDetail, setShowGeoDetail] = useState<typeof geoRules[0] | null>(null);

  /* ── KPI calculations ── */
  const passCount = complianceChecklist.filter(c => c.status === 'pass').length;
  const totalChecks = complianceChecklist.length;
  const complianceScore = Math.round((passCount / totalChecks) * 100);
  const activeConsents = 4862;
  const daysSinceAudit = 12;

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(74,144,217,0.2) 100%)',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: C.emerald }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              ComplianceVault<span style={{ color: C.emerald, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.emerald }}>
              Audit-ready compliance, always.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Unified CAN-SPAM, GDPR, and CCPA compliance dashboard. ComplianceVault tracks every consent event,
          enforces suppression lists across all platforms, monitors geographic compliance rules, and maintains
          an always-current audit trail — so you&apos;re never caught unprepared.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Compliance Score"
          value={`${complianceScore}%`}
          sub={`${passCount}/${totalChecks} requirements passing`}
          icon={ShieldCheck}
          color={complianceScore >= 90 ? C.green : complianceScore >= 70 ? C.amber : C.red}
          sparkData={[82, 85, 88, 90, 88, 91, complianceScore]}
          sparkColor={C.emerald}
          trend={{ value: 2.1, label: 'vs last month' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Compliance score is calculated as the percentage of requirements in a &quot;pass&quot; state.
                Warnings count as partial credit (0.5), failures count as 0.
              </p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(140,198,63,0.08)' }}>
                  <div className="text-lg font-extrabold" style={{ color: C.green }}>{passCount}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Passing</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)' }}>
                  <div className="text-lg font-extrabold" style={{ color: C.amber }}>{complianceChecklist.filter(c => c.status === 'warn').length}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Warning</div>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(217,74,74,0.08)' }}>
                  <div className="text-lg font-extrabold" style={{ color: C.red }}>{complianceChecklist.filter(c => c.status === 'fail').length}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Failing</div>
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Active Consents"
          value={activeConsents.toLocaleString()}
          sub="Across all regulations"
          icon={Users}
          color={C.blue}
          sparkData={[4600, 4680, 4720, 4780, 4810, 4840, activeConsents]}
          sparkColor={C.blue}
          trend={{ value: 1.8, label: 'net new this month' }}
          accent
        />
        <SparkKpi
          label="Suppression List Size"
          value={suppressionStats.total.toLocaleString()}
          sub={`Last sync: ${suppressionStats.lastSync}`}
          icon={Database}
          color={C.orange}
          sparkData={[380, 390, 400, 410, 418, 425, suppressionStats.total]}
          sparkColor={C.orange}
          trend={{ value: -3.2, label: 'growth rate slowing' }}
          accent
          detail={
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Suppression list breakdown by reason. All entries are synchronized across {suppressionStats.platforms.join(', ')} in real-time.
              </p>
              {[
                { label: 'Hard Bounces', count: suppressionStats.hardBounce, color: C.red },
                { label: 'Opt-Outs', count: suppressionStats.optOut, color: C.orange },
                { label: 'Spam Complaints', count: suppressionStats.complaint, color: C.amber },
                { label: 'GDPR Erasure', count: suppressionStats.gdprErasure, color: C.blue },
                { label: 'CCPA Opt-Out', count: suppressionStats.ccpaOptOut, color: C.purple },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: 'var(--input-bg)' }}>
                  <span style={{ color: 'var(--heading)' }}>{s.label}</span>
                  <span className="font-bold" style={{ color: s.color }}>{s.count}</span>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="Days Since Last Audit"
          value={daysSinceAudit}
          sub="Internal compliance review"
          icon={Clock}
          color={daysSinceAudit <= 30 ? C.green : daysSinceAudit <= 60 ? C.amber : C.red}
          sparkData={[45, 38, 30, 22, 18, 15, daysSinceAudit]}
          sparkColor={C.green}
          trend={{ value: 40, label: 'more frequent audits' }}
          accent
        />
      </div>

      {/* ── 3. Compliance Checklist ───────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ListChecks className="w-4 h-4" style={{ color: C.emerald }} />
          <h2 className="text-sm font-extrabold" style={{ color: 'var(--heading)' }}>Compliance Requirements</h2>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: C.emerald }}>
            {passCount}/{totalChecks} passing
          </span>
        </div>

        <Card noPad>
          <div className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
            {complianceChecklist.map((check, i) => {
              const statusConfig = {
                pass: { icon: CheckCircle2, color: C.green, bg: 'rgba(140,198,63,0.12)', label: 'PASS' },
                fail: { icon: XCircle, color: C.red, bg: 'rgba(217,74,74,0.12)', label: 'FAIL' },
                warn: { icon: AlertTriangle, color: C.amber, bg: 'rgba(245,158,11,0.12)', label: 'WARN' },
              }[check.status];
              const Icon = statusConfig.icon;

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors"
                  style={{ borderColor: 'var(--card-border)' }}
                  onClick={() => setSelectedCheck(check)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--input-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: statusConfig.color }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--heading)' }}>{check.requirement}</span>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>{check.regulation}</span>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: statusConfig.bg, color: statusConfig.color }}>{statusConfig.label}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ── 4. Consent Tracking Log ─────────────────────────── */}
        <Card
          title="Consent Tracking Log"
          subtitle="Recent consent events with full audit trail"
          detailTitle="Consent Event Log"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Every consent event is recorded with member identity, timestamp, IP address, method of consent,
                and applicable regulation. This log provides the audit trail required by GDPR Article 7 and
                CAN-SPAM record-keeping requirements.
              </p>
              <div className="space-y-2">
                {consentLog.map(entry => (
                  <div key={entry.id} className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold" style={{ color: 'var(--heading)' }}>{entry.member}</span>
                      <span className="text-[8px] font-mono" style={{ color: 'var(--text-muted)' }}>{entry.id}</span>
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{entry.details}</p>
                    <div className="flex items-center gap-2 mt-1 text-[8px]" style={{ color: 'var(--text-muted)' }}>
                      <span>IP: {entry.ip}</span>
                      <span>&middot;</span>
                      <span>{entry.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <div className="space-y-2 max-h-[340px] overflow-y-auto">
            {consentLog.map(entry => {
              const actionConfig: Record<string, { color: string; bg: string }> = {
                'Opt-In': { color: C.green, bg: 'rgba(140,198,63,0.12)' },
                'Opt-Out': { color: C.red, bg: 'rgba(217,74,74,0.12)' },
                'Consent Renewed': { color: C.blue, bg: 'rgba(74,144,217,0.12)' },
                'Data Deletion': { color: C.red, bg: 'rgba(217,74,74,0.12)' },
                'Preference Update': { color: C.amber, bg: 'rgba(245,158,11,0.12)' },
                'Consent Withdrawn': { color: C.orange, bg: 'rgba(232,146,63,0.12)' },
              };
              const ac = actionConfig[entry.action] || { color: 'var(--text-muted)', bg: 'var(--input-bg)' };

              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'var(--input-bg)' }}
                  onClick={() => setSelectedLog(entry)}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = C.emerald)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold truncate" style={{ color: 'var(--heading)' }}>{entry.member}</span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: ac.bg, color: ac.color }}>{entry.action}</span>
                    </div>
                    <div className="text-[9px] mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <span>{entry.timestamp.split(' ')[0]}</span>
                      <span>&middot;</span>
                      <span>{entry.regulation}</span>
                      <span>&middot;</span>
                      <span>{entry.method}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── 5. Geographic Compliance Rules ──────────────────── */}
        <Card
          title="Geographic Compliance"
          subtitle="Regulation enforcement by region"
          detailTitle="Geographic Compliance Detail"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ComplianceVault automatically applies the correct regulatory framework based on each member&apos;s
                geographic location. EU contacts receive GDPR-level protections, California contacts get CCPA
                treatment, and all US contacts follow CAN-SPAM requirements.
              </p>
              {geoRules.map(g => (
                <div key={g.region} className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{g.region} — {g.regulation}</span>
                    <span className="text-[10px] font-bold" style={{ color: g.color }}>{g.members} members</span>
                  </div>
                  <div className="space-y-1">
                    {g.requirements.map(r => (
                      <div key={r} className="flex items-center gap-2 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: C.green }} />
                        <span style={{ color: 'var(--text-muted)' }}>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <div className="space-y-3">
            {geoRules.map(g => (
              <div
                key={g.region}
                className="rounded-lg border p-3 cursor-pointer transition-all hover:translate-y-[-1px]"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)', borderLeftWidth: '3px', borderLeftColor: g.color }}
                onClick={() => setShowGeoDetail(g)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" style={{ color: g.color }} />
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{g.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `color-mix(in srgb, ${g.color} 15%, transparent)`, color: g.color }}>{g.regulation}</span>
                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{g.members} members</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: g.status === 'Active' ? 'rgba(140,198,63,0.12)' : 'rgba(245,158,11,0.12)', color: g.status === 'Active' ? C.green : C.amber }}>{g.status}</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{g.requirements.length} requirements tracked</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── 6. Suppression Enforcement & Consent Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card
          title="Suppression List Enforcement"
          subtitle="Cross-platform suppression synchronization"
          detailTitle="Suppression Architecture"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ComplianceVault maintains a unified suppression list synchronized across all email platforms via
                real-time webhooks. When a member unsubscribes on any platform, suppression is propagated to
                all others within 15 minutes — well within CAN-SPAM&apos;s 10-day requirement.
              </p>
              <div className="p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: C.emerald }}>Sync Architecture</div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  MEMTrak acts as the source of truth. Higher Logic and Outlook sync bidirectionally via webhooks.
                  Average propagation time: 4.2 minutes.
                </p>
              </div>
            </div>
          }
        >
          <ClientChart
            type="doughnut"
            height={240}
            data={{
              labels: ['Hard Bounces', 'Opt-Outs', 'Spam Complaints', 'GDPR Erasure', 'CCPA Opt-Out'],
              datasets: [{
                data: [suppressionStats.hardBounce, suppressionStats.optOut, suppressionStats.complaint, suppressionStats.gdprErasure, suppressionStats.ccpaOptOut],
                backgroundColor: [C.red + '80', C.orange + '80', C.amber + '80', C.blue + '80', C.purple + '80'],
                borderColor: [C.red, C.orange, C.amber, C.blue, C.purple],
                borderWidth: 2,
              }],
            }}
          />
          <div className="flex items-center justify-between mt-4 p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
            <div>
              <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Total Suppressed</div>
              <div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{suppressionStats.total}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Last Sync</div>
              <div className="text-[11px] font-bold" style={{ color: C.green }}>{suppressionStats.lastSync}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>Platforms</div>
              <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{suppressionStats.platforms.length}</div>
            </div>
          </div>
        </Card>

        <Card
          title="Consent Events by Type"
          subtitle="Last 30 days consent activity distribution"
        >
          <ClientChart
            type="bar"
            height={240}
            data={{
              labels: ['Opt-In', 'Opt-Out', 'Renewed', 'Deleted', 'Pref Update', 'Withdrawn'],
              datasets: [{
                label: 'Events',
                data: [128, 24, 38, 4, 52, 6],
                backgroundColor: [
                  C.green + '80',
                  C.red + '80',
                  C.blue + '80',
                  C.red + '60',
                  C.amber + '80',
                  C.orange + '80',
                ],
                borderColor: [C.green, C.red, C.blue, C.red, C.amber, C.orange],
                borderWidth: 2,
                borderRadius: 8,
              }],
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
                },
              },
              scales: {
                y: { beginAtZero: true, grid: { color: '#1e3350' }, ticks: { color: '#8899aa' } },
                x: { grid: { display: false }, ticks: { color: '#8899aa', font: { size: 9 } } },
              },
            }}
          />
          <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(140,198,63,0.06)', border: '1px solid rgba(140,198,63,0.12)' }}>
            <div className="text-[10px] font-bold mb-0.5" style={{ color: C.green }}>Healthy Ratio</div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Opt-ins outpace opt-outs 5.3:1 — your consent base is growing. Industry benchmark is 3:1.
            </p>
          </div>
        </Card>
      </div>

      {/* ── Consent Log Detail Modal ── */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Consent Event Detail</h3>
                <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{selectedLog.id}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Member', value: selectedLog.member },
                  { label: 'Organization', value: selectedLog.org },
                  { label: 'Action', value: selectedLog.action },
                  { label: 'Method', value: selectedLog.method },
                  { label: 'Regulation', value: selectedLog.regulation },
                  { label: 'IP Address', value: selectedLog.ip },
                ].map(f => (
                  <div key={f.label} className="p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                    <div className="text-[9px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>{f.label}</div>
                    <div className="text-[11px] font-semibold" style={{ color: 'var(--heading)' }}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Timestamp</div>
                <div className="text-[11px] font-mono" style={{ color: 'var(--heading)' }}>{selectedLog.timestamp}</div>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Details</div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--heading)' }}>{selectedLog.details}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Checklist Detail Modal ── */}
      {selectedCheck && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedCheck(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border p-6"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold pr-4" style={{ color: 'var(--heading)' }}>{selectedCheck.requirement}</h3>
              <button onClick={() => setSelectedCheck(null)} className="p-1.5 rounded-lg flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{
                background: selectedCheck.status === 'pass' ? 'rgba(140,198,63,0.12)' : selectedCheck.status === 'fail' ? 'rgba(217,74,74,0.12)' : 'rgba(245,158,11,0.12)',
                color: selectedCheck.status === 'pass' ? C.green : selectedCheck.status === 'fail' ? C.red : C.amber,
              }}>{selectedCheck.status.toUpperCase()}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>{selectedCheck.regulation}</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{selectedCheck.detail}</p>
          </div>
        </div>
      )}

      {/* ── Geo Detail Modal ── */}
      {showGeoDetail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowGeoDetail(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border p-6"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" style={{ color: showGeoDetail.color }} />
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{showGeoDetail.region}</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{showGeoDetail.regulation} &middot; {showGeoDetail.members} members</p>
                </div>
              </div>
              <button onClick={() => setShowGeoDetail(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {showGeoDetail.requirements.map(r => (
                <div key={r} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: C.green }} />
                  <span className="text-[10px]" style={{ color: 'var(--heading)' }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(16,185,129,0.08)', color: C.emerald, border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <ShieldCheck className="w-3 h-3" />
          ComplianceVault&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
