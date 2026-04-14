'use client';

import { useState } from 'react';
import {
  Shield, ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, Circle,
  Mail, TrendingUp, Bell, Lock, Eye, Zap, X,
} from 'lucide-react';
import SparkKpi from '@/components/SparkKpi';
import Card from '@/components/Card';
import ClientChart from '@/components/ClientChart';

/* ── Palette ── */
const C = {
  green: '#8CC63F',
  red: '#D94A4A',
  amber: '#E8923F',
  blue: '#4A90D9',
  gray: '#6B7A8D',
  navy: '#1B3A5C',
};

/* ── Auth protocol data ── */
const authProtocols = [
  {
    name: 'SPF',
    status: 'configured',
    statusLabel: 'Configured',
    color: C.green,
    icon: CheckCircle2,
    record: 'v=spf1 include:alta.org ~all',
    recommendation: 'No action needed. SPF is correctly configured and passing validation.',
    detail: 'SPF (Sender Policy Framework) specifies which mail servers are authorized to send email on behalf of alta.org. Your current record authorizes all alta.org infrastructure with a soft fail (~all) for unauthorized senders.',
  },
  {
    name: 'DKIM',
    status: 'configured',
    statusLabel: 'Configured',
    color: C.green,
    icon: CheckCircle2,
    record: '2048-bit key, selector: alta',
    recommendation: 'No action needed. DKIM signatures are valid and 2048-bit key length exceeds minimum requirements.',
    detail: 'DKIM (DomainKeys Identified Mail) adds a cryptographic signature to outgoing emails, proving they originated from alta.org and were not altered in transit. Your 2048-bit key provides strong protection.',
  },
  {
    name: 'DMARC',
    status: 'partial',
    statusLabel: 'Partial',
    color: C.amber,
    icon: AlertTriangle,
    record: 'p=none (should be p=quarantine)',
    recommendation: 'Upgrade policy from p=none to p=quarantine to actively protect against spoofing and enable BIMI.',
    detail: 'DMARC (Domain-based Message Authentication, Reporting & Conformance) tells receiving servers what to do when SPF or DKIM fail. Your current policy (p=none) only monitors — it does not block spoofed emails. Upgrading to p=quarantine would route suspicious messages to spam, protecting your domain reputation.',
  },
  {
    name: 'BIMI',
    status: 'not-set',
    statusLabel: 'Not Set',
    color: C.gray,
    icon: Circle,
    record: 'Requires DMARC p=quarantine or p=reject first',
    recommendation: 'Complete DMARC upgrade and obtain VMC certificate to enable BIMI logo display in inboxes.',
    detail: 'BIMI (Brand Indicators for Message Identification) displays your organization logo next to emails in supporting inboxes (Gmail, Apple Mail, Yahoo). It requires a DMARC policy of p=quarantine or p=reject, a Verified Mark Certificate (VMC), and an SVG logo file.',
  },
];

/* ── Complaint rate data ── */
const complaintMonths = ['Jan', 'Feb', 'Mar', 'Apr'];
const complaintRates = [0.05, 0.04, 0.08, 0.06];

/* ── Reputation trend data ── */
const reputationMonths = ['Jan', 'Feb', 'Mar', 'Apr'];
const reputationScores = [82, 84, 85, 87];

/* ── Deliverability simulator data ── */
const providers = [
  { name: 'Gmail', pct: 96, color: C.green },
  { name: 'Outlook', pct: 94, color: C.green },
  { name: 'Yahoo', pct: 91, color: C.amber },
  { name: 'Apple Mail', pct: 98, color: C.green },
];

/* ── BIMI checklist ── */
const bimiSteps = [
  { label: 'SPF configured', status: 'done' as const, detail: 'Your SPF record is valid and passing authentication checks.' },
  { label: 'DKIM configured', status: 'done' as const, detail: 'DKIM 2048-bit key is active and signing outbound messages.' },
  { label: 'DMARC policy upgrade needed', status: 'warn' as const, detail: 'Current policy is p=none. Must upgrade to p=quarantine or p=reject.' },
  { label: 'VMC certificate (Verified Mark Certificate)', status: 'pending' as const, detail: 'A VMC from DigiCert or Entrust is required. Cost: ~$1,500/year. Requires trademarked logo.' },
  { label: 'SVG logo file', status: 'pending' as const, detail: 'A Tiny PS SVG logo must be submitted. Must be square, under 32KB, and meet SVG Tiny 1.2 spec.' },
];

/* ── Alert rules ── */
const alertRules = [
  { icon: ShieldAlert, label: 'Block send if complaint rate would exceed 0.25%', severity: 'critical', detail: 'Proactive guard that halts any campaign predicted to push the domain complaint rate above 0.25% — safely below Google\'s 0.3% threshold. This prevents reputation damage before it happens.' },
  { icon: AlertTriangle, label: 'Alert if bounce rate exceeds 3% on any campaign', severity: 'warning', detail: 'A bounce rate above 3% on a single campaign signals list quality issues. This alert triggers an immediate review of the recipient list and pauses follow-up sends until resolved.' },
  { icon: Lock, label: 'Alert if authentication fails on any subdomain', severity: 'warning', detail: 'Monitors all subdomains (events.alta.org, news.alta.org, etc.) for SPF, DKIM, or DMARC failures. A failure could indicate misconfiguration or an active spoofing attempt.' },
];

/* ── Auth Detail Modal Component ── */
function AuthDetailModal({ proto, onClose }: { proto: typeof authProtocols[0]; onClose: () => void }) {
  const Icon = proto.icon;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
        style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in srgb, ${proto.color} 15%, transparent)` }}>
              <Icon className="w-4 h-4" style={{ color: proto.color }} />
            </div>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{proto.name}</h3>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Authentication Protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[10px] px-2.5 py-1 rounded-full font-bold"
              style={{
                background: `color-mix(in srgb, ${proto.color} 15%, transparent)`,
                color: proto.color,
              }}
            >
              {proto.statusLabel}
            </span>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Record Value</p>
            <code className="text-xs px-3 py-2 rounded-lg block font-mono" style={{ background: 'var(--input-bg)', color: 'var(--heading)' }}>{proto.record}</code>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>About</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{proto.detail}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Recommendation</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--heading)' }}>{proto.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function InboxGuard() {
  const [selectedAuth, setSelectedAuth] = useState<typeof authProtocols[0] | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<typeof alertRules[0] | null>(null);

  return (
    <div className="p-6 space-y-6">

      {/* ── 1. Branded Header ── */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #4A90D9, #1B3A5C)',
            boxShadow: '0 4px 20px rgba(74,144,217,0.3)',
          }}
        >
          <Shield className="w-6 h-6" style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            InboxGuard<span className="text-[10px] align-super font-bold" style={{ color: 'var(--text-muted)' }}>&trade;</span>
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Your domain reputation, protected in real-time.
          </p>
        </div>
      </div>

      {/* ── 2. SparkKpi Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <SparkKpi
          label="Domain Health Score"
          value="87/100"
          sub="Composite score across authentication, complaint rate, and reputation"
          icon={ShieldCheck}
          color={C.green}
          sparkData={[82, 83, 84, 84, 85, 86, 87]}
          sparkColor={C.green}
          trend={{ value: 2.4, label: 'vs last month' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Your domain health score is a composite metric calculated from four factors:
              </p>
              <div className="space-y-2">
                {[
                  { factor: 'Authentication', weight: '30%', score: '75%', note: 'DMARC at p=none reduces this' },
                  { factor: 'Complaint Rate', weight: '25%', score: '97%', note: '0.08% is well below threshold' },
                  { factor: 'Bounce Rate', weight: '25%', score: '92%', note: 'Minor hard bounces detected' },
                  { factor: 'Sender Reputation', weight: '20%', score: '87%', note: 'Trending upward over 4 months' },
                ].map(f => (
                  <div key={f.factor} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                    <div>
                      <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{f.factor}</span>
                      <span className="text-[9px] ml-2" style={{ color: 'var(--text-muted)' }}>({f.weight})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold" style={{ color: C.green }}>{f.score}</span>
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{f.note}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Achieving a score of 90+ requires upgrading DMARC to p=quarantine and reducing hard bounces below 1%.
              </p>
            </div>
          }
        />
        <SparkKpi
          label="Complaint Rate"
          value="0.08%"
          sub="Google threshold: 0.3% | Recommended: under 0.1%"
          icon={AlertTriangle}
          color={C.green}
          sparkData={[0.05, 0.04, 0.08, 0.06, 0.05, 0.08]}
          sparkColor={C.green}
          trend={{ value: -2.5, label: 'vs last month' }}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Your complaint rate of 0.08% is safely below both the recommended threshold (0.1%) and Google&apos;s hard limit (0.3%). Exceeding 0.3% can result in Gmail blocking your domain entirely.
              </p>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="flex justify-between text-[10px] mb-2">
                  <span style={{ color: 'var(--text-muted)' }}>Current Rate</span>
                  <span className="font-bold" style={{ color: C.green }}>0.08%</span>
                </div>
                <div className="h-3 rounded-full relative overflow-hidden" style={{ background: 'var(--card-border)' }}>
                  <div className="h-full rounded-full" style={{ width: '27%', background: C.green }} />
                  <div className="absolute top-0 h-full w-px" style={{ left: '33%', background: C.amber }} />
                  <div className="absolute top-0 h-full w-px" style={{ left: '100%', background: C.red }} />
                </div>
                <div className="flex justify-between text-[8px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>0%</span>
                  <span style={{ color: C.amber }}>0.1% recommended</span>
                  <span style={{ color: C.red }}>0.3% Google limit</span>
                </div>
              </div>
            </div>
          }
        />
        <SparkKpi
          label="Authentication Score"
          value="3/4"
          sub="SPF, DKIM, DMARC, BIMI — 3 of 4 checks passing"
          icon={Lock}
          color={C.amber}
          sparkData={[2, 2, 3, 3, 3, 3]}
          sparkColor={C.amber}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Three of four authentication protocols are active. BIMI requires completing the DMARC upgrade first.
              </p>
              {authProtocols.map(p => (
                <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <p.icon className="w-4 h-4 flex-shrink-0" style={{ color: p.color }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{p.name}</span>
                    <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded-full font-semibold" style={{ background: `color-mix(in srgb, ${p.color} 15%, transparent)`, color: p.color }}>{p.statusLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          }
        />
        <SparkKpi
          label="BIMI Ready"
          value="Pending"
          sub="Brand logo display in inboxes — requires DMARC upgrade"
          icon={Eye}
          color={C.gray}
          accent
          detail={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                BIMI (Brand Indicators for Message Identification) displays your ALTA logo next to every email in recipient inboxes. Studies show BIMI increases open rates by up to 38% and brand recall by 120%.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Before BIMI can be enabled, DMARC must be upgraded from p=none to at least p=quarantine. Then a Verified Mark Certificate (VMC) and SVG logo file are required.
              </p>
              <div className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[10px] font-bold mb-1" style={{ color: 'var(--heading)' }}>Estimated Timeline</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>DMARC upgrade: 1-2 weeks monitoring, then enforce. VMC: 2-4 weeks procurement. Full BIMI: 4-6 weeks.</div>
              </div>
            </div>
          }
        />
      </div>

      {/* ── 3. Authentication Status Dashboard ── */}
      <Card
        title="Authentication Status Dashboard"
        subtitle="SPF / DKIM / DMARC / BIMI for alta.org"
        detailTitle="Email Authentication Explained"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Email authentication is a set of protocols that verify your domain identity and prevent spoofing. All four protocols working together provide maximum deliverability and enable premium features like BIMI logo display.
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              ALTA currently has SPF and DKIM fully configured. DMARC needs a policy upgrade from monitoring (p=none) to enforcement (p=quarantine). Once DMARC is enforced, BIMI can be activated with a VMC certificate and SVG logo.
            </p>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {authProtocols.map(proto => {
            const Icon = proto.icon;
            return (
              <div
                key={proto.name}
                onClick={() => setSelectedAuth(proto)}
                className="p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:translate-y-[-2px]"
                style={{
                  background: 'var(--input-bg)',
                  borderColor: `color-mix(in srgb, ${proto.color} 25%, var(--card-border))`,
                  borderTopWidth: '3px',
                  borderTopColor: proto.color,
                }}
              >
                {/* Status icon + name */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `color-mix(in srgb, ${proto.color} 12%, transparent)` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: proto.color }} />
                  </div>
                  <div>
                    <span className="text-xs font-bold block" style={{ color: 'var(--heading)' }}>{proto.name}</span>
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full font-bold inline-block mt-0.5"
                      style={{
                        background: `color-mix(in srgb, ${proto.color} 15%, transparent)`,
                        color: proto.color,
                      }}
                    >
                      {proto.status === 'configured' ? '✓' : proto.status === 'partial' ? '⚠' : '○'} {proto.statusLabel}
                    </span>
                  </div>
                </div>
                {/* Record value */}
                <code className="text-[10px] block mb-2 leading-relaxed font-mono" style={{ color: 'var(--text-muted)' }}>
                  {proto.record}
                </code>
                {/* Recommendation */}
                <p className="text-[10px] leading-relaxed" style={{ color: proto.color }}>
                  {proto.recommendation.split('.')[0]}.
                </p>
                <div className="text-[8px] mt-2 font-semibold" style={{ color: 'var(--accent)' }}>Click for details</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Auth detail modal */}
      {selectedAuth && <AuthDetailModal proto={selectedAuth} onClose={() => setSelectedAuth(null)} />}

      {/* ── 4 & 6. Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 4. Complaint Rate Monitor */}
        <Card
          title="Complaint Rate Monitor"
          subtitle="Monthly complaint rate vs Google thresholds"
          detailTitle="Complaint Rate Analysis"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Google requires senders to maintain a complaint rate below 0.3%. Exceeding this threshold can result in emails being sent directly to spam or the domain being blocked entirely. The recommended target is below 0.1%.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                ALTA&apos;s complaint rate has remained well within safe limits over the past four months, peaking at 0.08% in March. The slight uptick was traced to the renewal reminder series and has since stabilized.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {complaintMonths.map((m, i) => (
                  <div key={m} className="p-2.5 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m}</span>
                    <span className="text-sm font-bold block" style={{ color: complaintRates[i] >= 0.1 ? C.amber : C.green }}>{complaintRates[i]}%</span>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <ClientChart
            type="line"
            height={260}
            data={{
              labels: complaintMonths,
              datasets: [
                {
                  label: 'Complaint Rate %',
                  data: complaintRates,
                  borderColor: C.blue,
                  backgroundColor: 'rgba(74,144,217,0.1)',
                  borderWidth: 2.5,
                  fill: true,
                  tension: 0.3,
                  pointRadius: 5,
                  pointBackgroundColor: C.blue,
                  pointBorderColor: C.blue,
                  pointHoverRadius: 7,
                },
                {
                  label: 'Google Limit (0.3%)',
                  data: [0.3, 0.3, 0.3, 0.3],
                  borderColor: C.red,
                  borderWidth: 2,
                  borderDash: [8, 4],
                  fill: false,
                  pointRadius: 0,
                  pointHoverRadius: 0,
                },
                {
                  label: 'Recommended (0.1%)',
                  data: [0.1, 0.1, 0.1, 0.1],
                  borderColor: C.amber,
                  borderWidth: 1.5,
                  borderDash: [4, 4],
                  fill: false,
                  pointRadius: 0,
                  pointHoverRadius: 0,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: 'top' as const,
                  labels: { color: '#8899aa', usePointStyle: true, padding: 14, font: { size: 10 } },
                },
                datalabels: { display: false },
              },
              scales: {
                y: {
                  min: 0,
                  max: 0.35,
                  grid: { color: '#1e3350' },
                  ticks: {
                    color: '#8899aa',
                    callback: (v: number) => v.toFixed(2) + '%',
                    stepSize: 0.05,
                  },
                },
                x: { grid: { display: false }, ticks: { color: '#8899aa' } },
              },
            }}
          />
        </Card>

        {/* 6. Domain Reputation Trend */}
        <Card
          title="Domain Reputation Trend"
          subtitle="Composite reputation score over time"
          detailTitle="Reputation Trend Analysis"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                ALTA&apos;s domain reputation has improved steadily from 82 to 87 over the past four months, driven by improved list hygiene and consistent sending patterns. Reaching 90+ would unlock premium placement tiers at major ISPs.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {reputationMonths.map((m, i) => (
                  <div key={m} className="p-2.5 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                    <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>{m}</span>
                    <span className="text-sm font-bold block" style={{ color: C.green }}>{reputationScores[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <ClientChart
            type="line"
            height={260}
            data={{
              labels: reputationMonths,
              datasets: [
                {
                  label: 'Reputation Score',
                  data: reputationScores,
                  borderColor: C.green,
                  backgroundColor: 'rgba(140,198,63,0.12)',
                  borderWidth: 2.5,
                  fill: true,
                  tension: 0.4,
                  pointRadius: 5,
                  pointBackgroundColor: C.green,
                  pointBorderColor: C.green,
                  pointHoverRadius: 7,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: 'top' as const,
                  labels: { color: '#8899aa', usePointStyle: true, padding: 14, font: { size: 10 } },
                },
                datalabels: { display: false },
              },
              scales: {
                y: {
                  min: 70,
                  max: 100,
                  grid: { color: '#1e3350' },
                  ticks: { color: '#8899aa' },
                },
                x: { grid: { display: false }, ticks: { color: '#8899aa' } },
              },
            }}
          />
        </Card>
      </div>

      {/* ── 5. Deliverability Simulator ── */}
      <Card
        title="Deliverability Simulator"
        subtitle="Predicted inbox placement for next campaign send"
        detailTitle="How Inbox Placement Is Estimated"
        detailContent={
          <div className="space-y-3">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Inbox placement predictions are based on your current authentication status, domain reputation, recent complaint rates, and provider-specific deliverability signals. These are estimates — actual placement depends on content, sending volume, and recipient engagement.
            </p>
            {providers.map(p => (
              <div key={p.name} className="p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="font-bold" style={{ color: 'var(--heading)' }}>{p.name}</span>
                  <span className="font-bold" style={{ color: p.color }}>{p.pct}% inbox</span>
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {p.name === 'Gmail' && 'Strong authentication and low complaint rate ensure high placement. BIMI would further improve brand visibility.'}
                  {p.name === 'Outlook' && 'Good sender reputation with Microsoft. Maintaining consistent sending patterns preserves this score.'}
                  {p.name === 'Yahoo' && 'Slightly lower due to DMARC p=none policy. Upgrading to p=quarantine would improve Yahoo placement to 94%+.'}
                  {p.name === 'Apple Mail' && 'Apple Mail relies heavily on SPF/DKIM which are fully configured. Highest placement rate across all providers.'}
                </p>
              </div>
            ))}
          </div>
        }
      >
        <div className="space-y-4">
          {providers.map(p => (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" style={{ color: p.color }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{p.name}</span>
                </div>
                <span className="text-xs font-extrabold" style={{ color: p.color }}>{p.pct}% inbox</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--input-bg)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${p.pct}%`,
                    background: `linear-gradient(90deg, color-mix(in srgb, ${p.color} 70%, transparent), ${p.color})`,
                    boxShadow: `0 0 8px color-mix(in srgb, ${p.color} 40%, transparent)`,
                  }}
                />
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2 pt-3" style={{ borderTop: '1px solid var(--card-border)' }}>
            <Zap className="w-3.5 h-3.5" style={{ color: C.green }} />
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span className="font-bold" style={{ color: 'var(--heading)' }}>Weighted Average: 95.2% inbox</span> — Based on ALTA member email provider distribution
            </span>
          </div>
        </div>
      </Card>

      {/* ── 7 & 8. Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 7. BIMI Readiness Checklist */}
        <Card
          title="BIMI Readiness Checklist"
          subtitle="Steps to display your ALTA logo in every inbox"
          detailTitle="Why BIMI Matters"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                BIMI (Brand Indicators for Message Identification) allows your organization logo to appear next to emails in recipient inboxes. This provides powerful benefits:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-lg font-extrabold" style={{ color: C.green }}>+38%</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Open Rate Increase</div>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ background: 'var(--input-bg)' }}>
                  <div className="text-lg font-extrabold" style={{ color: C.blue }}>+120%</div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Brand Recall</div>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                BIMI is supported by Gmail, Yahoo, Apple Mail, and Fastmail. It requires DMARC enforcement (p=quarantine or p=reject), a Verified Mark Certificate (VMC) from DigiCert or Entrust (~$1,500/year), and a compliant SVG Tiny PS logo file.
              </p>
            </div>
          }
        >
          <div className="space-y-3">
            {bimiSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <div className="mt-0.5 flex-shrink-0">
                  {step.status === 'done' && <CheckCircle2 className="w-4 h-4" style={{ color: C.green }} />}
                  {step.status === 'warn' && <AlertTriangle className="w-4 h-4" style={{ color: C.amber }} />}
                  {step.status === 'pending' && <Circle className="w-4 h-4" style={{ color: C.gray }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>
                      {i + 1}. {step.label}
                    </span>
                    <span
                      className="text-[8px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                      style={{
                        background: `color-mix(in srgb, ${step.status === 'done' ? C.green : step.status === 'warn' ? C.amber : C.gray} 15%, transparent)`,
                        color: step.status === 'done' ? C.green : step.status === 'warn' ? C.amber : C.gray,
                      }}
                    >
                      {step.status === 'done' ? 'Complete' : step.status === 'warn' ? 'Action Needed' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-[10px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.detail}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 p-3 rounded-lg mt-2" style={{ background: 'color-mix(in srgb, var(--accent) 8%, transparent)', borderLeft: `3px solid ${C.blue}` }}>
              <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: C.blue }} />
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                <span className="font-bold" style={{ color: 'var(--heading)' }}>BIMI increases opens 38% and brand recall 120%.</span>{' '}
                Completing these steps will display the ALTA logo in Gmail, Yahoo, Apple Mail, and Fastmail inboxes.
              </p>
            </div>
          </div>
        </Card>

        {/* 8. Proactive Alerts */}
        <Card
          title="Proactive Alerts"
          subtitle="Automated safeguards protecting your domain reputation"
          detailTitle="Alert Rules Explained"
          detailContent={
            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                InboxGuard proactive alerts monitor your domain health continuously and take action before problems occur. These rules run against every campaign before and during sending to prevent reputation damage.
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                The block-send rule is the most critical — it will halt a campaign mid-send if the projected complaint rate approaches the danger zone. This has prevented 2 potential incidents in the last 6 months.
              </p>
            </div>
          }
        >
          <div className="space-y-3">
            {alertRules.map((rule, i) => {
              const RuleIcon = rule.icon;
              const ruleColor = rule.severity === 'critical' ? C.red : C.amber;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedAlert(rule)}
                  className="flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 hover:translate-y-[-1px]"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: `color-mix(in srgb, ${ruleColor} 20%, var(--card-border))`,
                    borderLeftWidth: '3px',
                    borderLeftColor: ruleColor,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `color-mix(in srgb, ${ruleColor} 12%, transparent)` }}
                  >
                    <RuleIcon className="w-4 h-4" style={{ color: ruleColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        style={{
                          background: `color-mix(in srgb, ${ruleColor} 15%, transparent)`,
                          color: ruleColor,
                        }}
                      >
                        {rule.severity === 'critical' ? 'Block' : 'Alert'}
                      </span>
                      <Bell className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <p className="text-[11px] font-bold leading-relaxed" style={{ color: 'var(--heading)' }}>
                      {rule.label}
                    </p>
                    <div className="text-[8px] mt-1.5 font-semibold" style={{ color: 'var(--accent)' }}>Click for details</div>
                  </div>
                </div>
              );
            })}

            <div className="flex items-center gap-2 pt-3 mt-1" style={{ borderTop: '1px solid var(--card-border)' }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: C.green }} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span className="font-bold" style={{ color: C.green }}>All alerts active</span> — 0 incidents in the last 30 days
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Alert detail modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedAlert(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${selectedAlert.severity === 'critical' ? C.red : C.amber} 15%, transparent)` }}
                >
                  <selectedAlert.icon className="w-4 h-4" style={{ color: selectedAlert.severity === 'critical' ? C.red : C.amber }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Alert Rule</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {selectedAlert.severity === 'critical' ? 'Block Rule' : 'Warning Alert'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs font-bold leading-relaxed" style={{ color: 'var(--heading)' }}>
                {selectedAlert.label}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {selectedAlert.detail}
              </p>
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                <ShieldCheck className="w-4 h-4" style={{ color: C.green }} />
                <span className="text-[10px] font-bold" style={{ color: C.green }}>Currently Active</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>— Last triggered: Never (clean record)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
