'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import ClientChart from '@/components/ClientChart';
import ProgressRing from '@/components/ProgressRing';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Database,
  TrendingUp,
  Sparkles,
  FileSearch,
  Mail,
  Phone,
  MapPin,
  Users,
  Wrench,
  ArrowRight,
  Zap,
  X,
} from 'lucide-react';

/* ── Brand Colors ─────────────────────────────────────────── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  teal: '#14b8a6',
};

/* ── Dimension scores ─────────────────────────────────────── */
interface QualityDimension {
  name: string;
  score: number;
  description: string;
  icon: typeof Database;
  color: string;
  details: string;
}

const dimensions: QualityDimension[] = [
  { name: 'Completeness', score: 68, description: 'How many fields are filled', icon: Database, color: C.orange, details: 'Of 18,400 member records, 32% are missing at least one critical field (phone, address, or email). Phone numbers are the most commonly missing field at 1,200 records.' },
  { name: 'Accuracy', score: 82, description: 'Verified vs unverified', icon: CheckCircle, color: C.green, details: '82% of email addresses have been verified via deliverability check in the past 90 days. 680 emails are confirmed invalid (hard bounces). 1,400 remain unverified.' },
  { name: 'Timeliness', score: 75, description: 'How recently updated', icon: TrendingUp, color: C.blue, details: '75% of records were updated within the last 6 months. 15% are 6-12 months stale. 10% have not been updated in over a year.' },
  { name: 'Consistency', score: 85, description: 'Format standardization', icon: Sparkles, color: C.teal, details: '85% of records use standardized formats for phone, address, and name fields. 15% have inconsistencies like mixed phone formats (xxx-xxx-xxxx vs (xxx) xxx-xxxx) or non-standardized state abbreviations.' },
  { name: 'Uniqueness', score: 92, description: 'Duplicate detection', icon: Users, color: C.purple, details: '420 suspected duplicate records detected across the database. Most duplicates arise from members registering under both personal and company email addresses.' },
  { name: 'Validity', score: 78, description: 'Email & phone format', icon: FileSearch, color: C.amber, details: '78% of email and phone fields pass format validation. 680 emails fail RFC-5322 validation. 340 phone numbers contain too few or too many digits.' },
];

/* ── Issues ────────────────────────────────────────────────── */
interface DataIssue {
  category: string;
  count: number;
  icon: typeof Mail;
  color: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  recommendation: string;
}

const issues: DataIssue[] = [
  { category: 'Invalid Emails', count: 680, icon: Mail, color: C.red, severity: 'Critical', description: 'Email addresses that fail format validation or have hard-bounced.', recommendation: 'Run batch email verification, suppress confirmed invalids, and request updates from members via phone.' },
  { category: 'Missing Phone Numbers', count: 1200, icon: Phone, color: C.orange, severity: 'High', description: 'Member records with no phone number on file.', recommendation: 'Add phone field to renewal form. Launch "complete your profile" campaign targeting these records.' },
  { category: 'Duplicate Records', count: 420, icon: Users, color: C.amber, severity: 'Medium', description: 'Suspected duplicate member records based on name + org matching.', recommendation: 'Review top 50 highest-confidence duplicates. Merge records, preserving the most recent engagement data.' },
  { category: 'Outdated Addresses', count: 340, icon: MapPin, color: C.blue, severity: 'Medium', description: 'Physical addresses that have not been validated in over 12 months.', recommendation: 'Run NCOA (National Change of Address) batch processing to detect moves.' },
];

/* ── Trend data ───────────────────────────────────────────── */
const trendMonths = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
const trendScores = [64, 66, 68, 70, 71, 73];

/* ── Cleanup actions ──────────────────────────────────────── */
const cleanupActions = [
  { action: 'Batch email verification', expectedImprovement: '+4 pts', effort: 'Low', timeline: '1-2 days', icon: Mail, color: C.green },
  { action: 'Phone field campaign', expectedImprovement: '+3 pts', effort: 'Medium', timeline: '2-4 weeks', icon: Phone, color: C.blue },
  { action: 'Duplicate merge (top 50)', expectedImprovement: '+1 pt', effort: 'Low', timeline: '2-3 days', icon: Users, color: C.purple },
  { action: 'NCOA address update', expectedImprovement: '+2 pts', effort: 'Low', timeline: '3-5 days', icon: MapPin, color: C.teal },
  { action: 'Format standardization script', expectedImprovement: '+2 pts', effort: 'Medium', timeline: '1 week', icon: Wrench, color: C.amber },
];

export default function DataQuality() {
  const [selectedIssue, setSelectedIssue] = useState<DataIssue | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<QualityDimension | null>(null);

  const overallScore = 73;
  const totalIssues = issues.reduce((s, i) => s + i.count, 0);

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(140,198,63,0.2) 0%, rgba(74,144,217,0.2) 100%)',
              border: '1px solid rgba(140,198,63,0.3)',
            }}
          >
            <ShieldCheck className="w-5 h-5" style={{ color: C.green }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              DataQuality<span style={{ color: C.green, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.green }}>
              Trust your data. Trust your decisions.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Comprehensive data health assessment across six quality dimensions. Monitors completeness, accuracy,
          timeliness, consistency, uniqueness, and validity of your member database in real time, surfacing
          actionable cleanup opportunities.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Quality Score"
          value={`${overallScore}/100`}
          sub="Overall data health"
          icon={ShieldCheck}
          color={C.green}
          sparkData={trendScores}
          sparkColor={C.green}
          trend={{ value: 9.0, label: 'vs 6 months ago' }}
          accent
        />
        <SparkKpi
          label="Issues Found"
          value={totalIssues.toLocaleString()}
          sub="Across all dimensions"
          icon={AlertTriangle}
          color={C.red}
          sparkData={[3200, 3050, 2900, 2780, 2700, totalIssues]}
          sparkColor={C.red}
          trend={{ value: -6.8, label: 'decreasing' }}
          accent
        />
        <SparkKpi
          label="Records Cleaned (30d)"
          value="1,842"
          sub="Automated + manual"
          icon={Sparkles}
          color={C.blue}
          sparkData={[980, 1100, 1250, 1400, 1600, 1842]}
          sparkColor={C.blue}
          trend={{ value: 22.5, label: 'vs prior 30d' }}
          accent
        />
        <SparkKpi
          label="Improvement Rate"
          value="+1.5/mo"
          sub="Average monthly gain"
          icon={TrendingUp}
          color={C.purple}
          sparkData={[0.8, 1.0, 1.2, 1.0, 1.5, 1.5]}
          sparkColor={C.purple}
          trend={{ value: 12.0, label: 'accelerating' }}
          accent
        />
      </div>

      {/* ── 3. Overall Score + Dimensions ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Overall Score - Large ring */}
        <Card title="Overall Data Quality" subtitle="Composite score across 6 dimensions">
          <div className="flex flex-col items-center py-4">
            <div className="relative">
              <ProgressRing value={overallScore} max={100} color={C.green} size={160} />
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold"
                style={{
                  background: overallScore >= 80 ? 'rgba(140,198,63,0.15)' : overallScore >= 60 ? 'rgba(232,146,63,0.15)' : 'rgba(217,74,74,0.15)',
                  color: overallScore >= 80 ? C.green : overallScore >= 60 ? C.orange : C.red,
                }}
              >
                {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Work'}
              </div>
            </div>
            <div className="mt-6 w-full space-y-2">
              <div className="flex items-center justify-between text-[10px] px-2">
                <span style={{ color: 'var(--text-muted)' }}>Target Score</span>
                <span className="font-bold" style={{ color: C.green }}>85/100</span>
              </div>
              <div className="flex items-center justify-between text-[10px] px-2">
                <span style={{ color: 'var(--text-muted)' }}>Gap to Target</span>
                <span className="font-bold" style={{ color: C.orange }}>12 points</span>
              </div>
              <div className="flex items-center justify-between text-[10px] px-2">
                <span style={{ color: 'var(--text-muted)' }}>Est. Time to Target</span>
                <span className="font-bold" style={{ color: C.blue }}>~8 months</span>
              </div>
            </div>
          </div>
        </Card>

        {/* 6 Dimension Scores */}
        <div className="lg:col-span-2">
          <Card title="Quality Dimensions" subtitle="Score breakdown by data quality category">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {dimensions.map((dim) => (
                <div
                  key={dim.name}
                  className="rounded-xl border p-4 text-center cursor-pointer transition-all hover:translate-y-[-2px]"
                  style={{
                    background: 'var(--input-bg)',
                    borderColor: 'var(--card-border)',
                    borderTopWidth: '3px',
                    borderTopColor: dim.color,
                  }}
                  onClick={() => setSelectedDimension(dim)}
                >
                  <ProgressRing value={dim.score} max={100} color={dim.color} size={64} />
                  <div className="mt-2 text-[11px] font-bold" style={{ color: 'var(--heading)' }}>
                    {dim.name}
                  </div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    {dim.description}
                  </div>
                  <div className="text-[8px] mt-1 font-semibold" style={{ color: dim.color }}>
                    Click for details
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── 4. Issues Detected ────────────────────────────────── */}
      <Card title="Issues Detected" subtitle={`${totalIssues.toLocaleString()} total issues across ${issues.length} categories`} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {issues.map((issue) => {
            const severityColors: Record<string, { bg: string; text: string }> = {
              Critical: { bg: 'rgba(217,74,74,0.12)', text: C.red },
              High: { bg: 'rgba(232,146,63,0.12)', text: C.orange },
              Medium: { bg: 'rgba(245,158,11,0.12)', text: C.amber },
              Low: { bg: 'rgba(140,198,63,0.12)', text: C.green },
            };
            const sc = severityColors[issue.severity];

            return (
              <div
                key={issue.category}
                className="rounded-xl border p-4 cursor-pointer transition-all hover:translate-y-[-1px]"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--card-border)',
                  borderLeftWidth: '4px',
                  borderLeftColor: issue.color,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
                onClick={() => setSelectedIssue(issue)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
                    style={{ background: `${issue.color}15`, border: `1px solid ${issue.color}25` }}
                  >
                    <issue.icon className="w-4.5 h-4.5" style={{ color: issue.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{issue.category}</span>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>
                        {issue.severity}
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold" style={{ color: issue.color }}>
                      {issue.count.toLocaleString()}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {issue.description}
                    </div>
                  </div>
                </div>
                <div className="text-[8px] mt-2 font-semibold text-right" style={{ color: issue.color }}>
                  Click for recommendation
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── 5. Trend Chart + Cleanup Actions ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quality Score Trend */}
        <Card title="Quality Score Trend" subtitle="6-month improvement trajectory">
          <ClientChart
            type="line"
            height={260}
            data={{
              labels: trendMonths,
              datasets: [
                {
                  label: 'Quality Score',
                  data: trendScores,
                  borderColor: C.green,
                  backgroundColor: C.green + '15',
                  fill: true,
                  tension: 0.4,
                  borderWidth: 2.5,
                  pointRadius: 5,
                  pointBackgroundColor: C.green,
                  pointBorderColor: 'var(--card)',
                  pointBorderWidth: 2,
                  pointHoverRadius: 7,
                },
                {
                  label: 'Target',
                  data: trendMonths.map(() => 85),
                  borderColor: C.blue + '50',
                  borderDash: [5, 5],
                  borderWidth: 1.5,
                  pointRadius: 0,
                  fill: false,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  display: true,
                  position: 'top' as const,
                  labels: { color: '#8899aa', usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 10 } },
                },
                tooltip: {
                  callbacks: {
                    label: (ctx: { dataset: { label: string }; raw: number }) => `${ctx.dataset.label}: ${ctx.raw}/100`,
                  },
                },
              },
              scales: {
                y: {
                  min: 50,
                  max: 100,
                  grid: { color: '#1e3350' },
                  ticks: { color: '#8899aa', callback: (v: number | string) => v + '/100' },
                },
                x: { grid: { display: false }, ticks: { color: '#8899aa' } },
              },
            }}
          />
        </Card>

        {/* Recommended Cleanup Actions */}
        <Card title="Recommended Cleanup Actions" subtitle="Prioritized by expected improvement">
          <div className="space-y-3">
            {cleanupActions.map((action, i) => (
              <div
                key={action.action}
                className="rounded-lg border p-3 transition-all hover:translate-y-[-1px]"
                style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                    style={{ background: `${action.color}15`, border: `1px solid ${action.color}25` }}
                  >
                    <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>
                        {i + 1}. {action.action}
                      </span>
                      <span className="text-[10px] font-extrabold" style={{ color: C.green }}>
                        {action.expectedImprovement}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        Effort: <span style={{ color: action.effort === 'Low' ? C.green : C.amber }}>{action.effort}</span>
                      </span>
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        Timeline: <span style={{ color: 'var(--heading)' }}>{action.timeline}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div
              className="rounded-lg border p-3 text-center"
              style={{ borderColor: 'var(--card-border)', borderStyle: 'dashed' }}
            >
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-3.5 h-3.5" style={{ color: C.green }} />
                <span className="text-[11px] font-bold" style={{ color: C.green }}>
                  Total potential improvement: +12 pts
                </span>
                <ArrowRight className="w-3 h-3" style={{ color: C.green }} />
                <span className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>
                  73 {'\u2192'} 85
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 6. Data Quality by Record Type ────────────────────── */}
      <Card title="Quality by Record Type" subtitle="Dimension scores per member category" className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--card-border)' }}>
                <th className="text-left py-2 px-2 uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Type</th>
                <th className="text-left py-2 px-2 uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Records</th>
                {dimensions.map((d) => (
                  <th key={d.name} className="text-center py-2 px-2 uppercase tracking-wider font-bold" style={{ color: d.color }}>
                    {d.name.slice(0, 4)}
                  </th>
                ))}
                <th className="text-center py-2 px-2 uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>Avg</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'ACU', records: 42, scores: [92, 95, 88, 90, 98, 94] },
                { type: 'ACA', records: 3400, scores: [72, 85, 78, 88, 94, 82] },
                { type: 'REA', records: 1200, scores: [65, 80, 72, 82, 90, 75] },
                { type: 'ACB', records: 780, scores: [58, 75, 68, 80, 88, 70] },
                { type: 'AFF', records: 350, scores: [70, 82, 76, 85, 92, 78] },
                { type: 'Other', records: 12628, scores: [64, 78, 72, 84, 91, 76] },
              ].map((row) => {
                const avg = Math.round(row.scores.reduce((s, v) => s + v, 0) / row.scores.length);
                return (
                  <tr key={row.type} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td className="py-2 px-2 font-bold" style={{ color: 'var(--heading)' }}>{row.type}</td>
                    <td className="py-2 px-2" style={{ color: 'var(--text-muted)' }}>{row.records.toLocaleString()}</td>
                    {row.scores.map((score, i) => {
                      const dimColor = dimensions[i].color;
                      return (
                        <td key={i} className="text-center py-2 px-2">
                          <span
                            className="inline-flex items-center justify-center w-8 h-5 rounded text-[9px] font-bold"
                            style={{
                              background: score >= 85 ? 'rgba(140,198,63,0.15)' : score >= 70 ? 'rgba(74,144,217,0.15)' : 'rgba(217,74,74,0.15)',
                              color: score >= 85 ? C.green : score >= 70 ? C.blue : C.red,
                            }}
                          >
                            {score}
                          </span>
                        </td>
                      );
                    })}
                    <td className="text-center py-2 px-2">
                      <span className="font-extrabold" style={{ color: avg >= 85 ? C.green : avg >= 70 ? C.blue : C.orange }}>
                        {avg}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Dimension Detail Modal ────────────────────────────── */}
      {selectedDimension && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedDimension(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedDimension.name}</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedDimension.description}</p>
              </div>
              <button onClick={() => setSelectedDimension(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-center">
                <ProgressRing value={selectedDimension.score} max={100} color={selectedDimension.color} size={120} />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {selectedDimension.details}
              </p>
              <div className="rounded-lg p-3" style={{ background: 'var(--input-bg)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: selectedDimension.color }}>
                  Score Assessment
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {selectedDimension.score >= 85 ? 'Excellent - meets or exceeds target quality standards.' :
                   selectedDimension.score >= 70 ? 'Good - within acceptable range but improvement opportunities exist.' :
                   'Needs attention - below target threshold, prioritize cleanup.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Issue Detail Modal ────────────────────────────────── */}
      {selectedIssue && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedIssue(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border"
            style={{ background: 'var(--card)', borderColor: 'var(--card-border)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--card) 90%, transparent)', borderColor: 'var(--card-border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{selectedIssue.category}</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{selectedIssue.count.toLocaleString()} records affected</p>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-4xl font-extrabold" style={{ color: selectedIssue.color }}>
                {selectedIssue.count.toLocaleString()}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {selectedIssue.description}
              </p>
              <div className="rounded-lg p-3" style={{ background: 'rgba(140,198,63,0.06)' }}>
                <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: C.green }}>
                  Recommended Action
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--heading)' }}>
                  {selectedIssue.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(140,198,63,0.08)',
            color: C.green,
            border: '1px solid rgba(140,198,63,0.15)',
          }}
        >
          <ShieldCheck className="w-3 h-3" />
          DataQuality&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
