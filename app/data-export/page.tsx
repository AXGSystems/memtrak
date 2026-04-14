'use client';

import { Download, Database, Mail, Users, Shield, BarChart3 } from 'lucide-react';
import { exportCSV } from '@/lib/export-utils';
import { demoCampaigns, demoDecayAlerts, demoChurnScores, demoSendTimes, demoRelationships, getCampaignTotals } from '@/lib/demo-data';

const exports = [
  { name: 'Campaign Performance', desc: 'All campaigns with open/click/bounce/revenue', icon: Mail, rows: demoCampaigns.length, action: () => exportCSV(['Campaign', 'Type', 'Status', 'Source', 'Date', 'Sent', 'Opened', 'Clicked', 'Bounced', 'Revenue'], demoCampaigns.map(c => [c.name, c.type, c.status, c.source, c.sentDate, c.listSize, c.uniqueOpened, c.clicked, c.bounced, c.revenue]), 'MEMTrak_Campaigns') },
  { name: 'Engagement Decay Alerts', desc: 'Members with declining engagement', icon: Users, rows: demoDecayAlerts.length, action: () => exportCSV(['Organization', 'Type', 'Email', 'Decay Score', 'Recent Open %', 'Historical Open %', 'Last Open', 'Revenue at Risk'], demoDecayAlerts.map(d => [d.org, d.type, d.email, d.decay, d.recent, d.historical, d.lastOpen, d.revenue]), 'MEMTrak_Decay_Alerts') },
  { name: 'Churn Risk Scores', desc: 'Predicted non-renewal with actions', icon: Shield, rows: demoChurnScores.length, action: () => exportCSV(['Organization', 'Type', 'Score', 'Revenue', 'Factors', 'Action'], demoChurnScores.map(c => [c.org, c.type, c.score, c.revenue, c.factors.join('; '), c.action]), 'MEMTrak_Churn_Scores') },
  { name: 'Send Time Optimization', desc: 'Best times per segment', icon: BarChart3, rows: demoSendTimes.length, action: () => exportCSV(['Segment', 'Best Day', 'Best Time', 'Open Rate', 'Sample Size'], demoSendTimes.map(s => [s.segment, s.day, s.time, s.openRate + '%', s.sample]), 'MEMTrak_Send_Times') },
  { name: 'Staff Relationships', desc: 'Reply rates per staff member', icon: Users, rows: demoRelationships.length, action: () => exportCSV(['Staff', 'Outreach', 'Reply Rate', 'Avg Response', 'Strength'], demoRelationships.map(r => [r.staff, r.outreach, r.replyRate + '%', r.responseTime, r.strength]), 'MEMTrak_Relationships') },
  { name: 'Full Summary Report', desc: 'Combined KPIs and metrics', icon: Database, rows: 1, action: () => { const t = getCampaignTotals(); exportCSV(['Metric', 'Value'], [['Total Sent', t.totalSent], ['Open Rate', ((t.totalOpened / t.totalDelivered) * 100).toFixed(1) + '%'], ['Click Rate', ((t.totalClicked / t.totalDelivered) * 100).toFixed(1) + '%'], ['Bounce Rate', ((t.totalBounced / t.totalSent) * 100).toFixed(1) + '%'], ['Revenue Attributed', '$' + t.totalRevenue], ['Campaigns', t.campaignCount], ['Decay Alerts', demoDecayAlerts.filter(d => d.decay >= 50).length], ['Churn High Risk', demoChurnScores.filter(c => c.score >= 70).length]], 'MEMTrak_Summary'); } },
];

export default function DataExport() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-extrabold mb-1" style={{ color: 'var(--heading)' }}>Data Export Center</h1>
      <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Download any MEMTrak dataset as CSV for compliance, backup, or external analysis. All exports include headers and are Excel-compatible.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {exports.map(exp => {
          const Icon = exp.icon;
          return (
            <div key={exp.name} className="rounded-xl border p-5 flex items-center gap-4 transition-all hover:translate-y-[-1px]" style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                <Icon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{exp.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{exp.desc} · {exp.rows} rows</div>
              </div>
              <button onClick={exp.action} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold flex-shrink-0" style={{ background: 'var(--accent)', color: 'white' }}>
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
