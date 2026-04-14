'use client';

import ClientChart from '@/components/ClientChart';
import Card, { KpiCard } from '@/components/Card';
import { demoMonthly, demoDecayAlerts, demoChurnScores, demoCampaigns, getCampaignTotals, demoSendTimes } from '@/lib/demo-data';
import { exportCSV } from '@/lib/export-utils';
import { memtrakPrint } from '@/lib/print';
import { Send, Eye, MousePointerClick, TrendingDown, TrendingUp, CheckCircle, Target, AlertTriangle, Download, Printer, DollarSign, Users, Clock, Zap, ArrowRight, Shield } from 'lucide-react';

const C = { navy: '#002D5C', blue: '#4A90D9', green: '#8CC63F', red: '#D94A4A', orange: '#E8923F' };
const totals = getCampaignTotals();
const openRate = ((totals.totalOpened / totals.totalDelivered) * 100).toFixed(1);
const clickRate = ((totals.totalClicked / totals.totalDelivered) * 100).toFixed(1);
const bounceRate = ((totals.totalBounced / totals.totalSent) * 100).toFixed(1);
const sentCampaigns = demoCampaigns.filter(c => c.status === 'Sent');
const topCampaign = sentCampaigns.sort((a, b) => b.revenue - a.revenue)[0];

export default function DailyBriefing() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: 'var(--heading)' }}>Good morning, membership team.</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} — Your daily MEMTrak intelligence briefing
          </p>
        </div>
        <div className="flex gap-2 no-print">
          <button onClick={() => exportCSV(['Metric', 'Value'], [['Sent', totals.totalSent], ['Open Rate', openRate + '%'], ['Click Rate', clickRate + '%'], ['Bounce Rate', bounceRate + '%'], ['Revenue', '$' + totals.totalRevenue], ['Campaigns', totals.campaignCount]], 'MEMTrak_Daily_Brief')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ color: 'var(--accent)', borderColor: 'var(--card-border)' }}>
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* KPI Row — ALL clickable with detail modals */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6 stagger-children">
        <KpiCard label="Emails Sent" value={totals.totalSent.toLocaleString()} icon={Send} color={C.blue} sub={`${totals.campaignCount} campaigns`} detail={
          <div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Total emails sent across all platforms (MEMTrak, Higher Logic, Outlook) this month.</p>
            <div className="space-y-2">
              {sentCampaigns.slice(0, 5).map(c => (
                <div key={c.id} className="flex justify-between text-xs p-2 rounded-lg" style={{ background: 'var(--background)' }}>
                  <span style={{ color: 'var(--heading)' }}>{c.name}</span>
                  <span className="font-bold">{c.listSize.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        } />
        <KpiCard label="Open Rate" value={openRate + '%'} icon={Eye} color={parseFloat(openRate) >= 35 ? C.green : C.orange} sub="Industry avg: 25-35%" detail={
          <div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Percentage of delivered emails that were opened. ALTA exceeds the association industry average of 25-35%.</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>⚠️ Note: Apple Mail Privacy Protection inflates this by ~30%. True open rate is likely ~{(parseFloat(openRate) * 0.7).toFixed(1)}%. Use click rate as the more reliable engagement metric.</p>
          </div>
        } />
        <KpiCard label="Click Rate" value={clickRate + '%'} icon={MousePointerClick} color={C.green} sub="100% reliable metric" detail={
          <div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Percentage of delivered emails where a recipient clicked a link. This is MEMTrak's primary engagement metric because it cannot be inflated by Apple MPP or blocked by corporate Outlook.</p>
            <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>ALTA's {clickRate}% CTR is 3x the industry average of 3-5%.</p>
          </div>
        } />
        <KpiCard label="Revenue" value={'$' + (totals.totalRevenue / 1000).toFixed(0) + 'K'} icon={DollarSign} color={C.green} sub="Attributed to email" detail={
          <div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Revenue directly attributed to email campaigns — renewals, PFL purchases, and event registrations that occurred within 14 days of an email send.</p>
            <div className="space-y-1">
              {sentCampaigns.filter(c => c.revenue > 0).map(c => (
                <div key={c.id} className="flex justify-between text-xs p-2 rounded-lg" style={{ background: 'var(--background)' }}>
                  <span style={{ color: 'var(--heading)' }}>{c.name}</span>
                  <span className="font-bold" style={{ color: C.green }}>${(c.revenue / 1000).toFixed(0)}K</span>
                </div>
              ))}
            </div>
          </div>
        } />
        <KpiCard label="Bounce Rate" value={bounceRate + '%'} icon={AlertTriangle} color={parseFloat(bounceRate) > 3 ? C.red : C.green} sub={`${totals.totalBounced} addresses`} detail={
          <div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Percentage of sent emails that bounced. Industry recommendation: keep below 3%. Above 5% damages domain reputation and affects ALL future sends.</p>
            <p className="text-xs" style={{ color: C.red }}>Action: Remove {totals.totalBounced} bounced addresses from the list immediately via Address Hygiene page.</p>
          </div>
        } />
        <KpiCard label="Decay Alerts" value={String(demoDecayAlerts.filter(d => d.decay >= 50).length)} icon={TrendingDown} color={C.red} sub={'$' + demoDecayAlerts.filter(d => d.decay >= 50).reduce((s, d) => s + d.revenue, 0).toLocaleString() + ' at risk'} detail={
          <div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Members whose email engagement is declining — a leading indicator of non-renewal. Each alert represents revenue at risk.</p>
            <div className="space-y-2">
              {demoDecayAlerts.filter(d => d.decay >= 50).map(d => (
                <div key={d.email} className="flex items-center justify-between text-xs p-2 rounded-lg" style={{ background: 'var(--background)' }}>
                  <div><span className="font-bold" style={{ color: 'var(--heading)' }}>{d.org}</span> <span style={{ color: 'var(--text-muted)' }}>({d.type})</span></div>
                  <span className="font-bold" style={{ color: C.red }}>${d.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        } />
      </div>

      {/* Top Campaign Spotlight */}
      <Card glass title="Campaign Spotlight" subtitle="Best performing campaign this month" className="mb-6" detailTitle="Campaign Deep Dive" detailContent={
        <div>
          <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--heading)' }}>{topCampaign.name}</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}><div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Sent</div><div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{topCampaign.listSize.toLocaleString()}</div></div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}><div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Open Rate</div><div className="text-lg font-extrabold" style={{ color: C.green }}>{(topCampaign.uniqueOpened / topCampaign.delivered * 100).toFixed(1)}%</div></div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}><div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Clicks</div><div className="text-lg font-extrabold" style={{ color: 'var(--heading)' }}>{topCampaign.clicked.toLocaleString()}</div></div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--background)' }}><div className="text-[9px] uppercase" style={{ color: 'var(--text-muted)' }}>Revenue</div><div className="text-lg font-extrabold" style={{ color: C.green }}>${(topCampaign.revenue / 1000).toFixed(0)}K</div></div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>This campaign generated the most revenue this month. Click rate was {(topCampaign.clicked / topCampaign.delivered * 100).toFixed(1)}% — well above average. {topCampaign.bounced} emails bounced ({(topCampaign.bounced / topCampaign.listSize * 100).toFixed(1)}%).</p>
        </div>
      }>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
            <Zap className="w-6 h-6" style={{ color: 'var(--accent)' }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{topCampaign.name}</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{topCampaign.listSize.toLocaleString()} sent · {(topCampaign.uniqueOpened / topCampaign.delivered * 100).toFixed(1)}% open rate · <span style={{ color: C.green, fontWeight: 700 }}>${(topCampaign.revenue / 1000).toFixed(0)}K revenue</span></div>
          </div>
        </div>
      </Card>

      {/* Priority Actions */}
      <Card title="Priority Actions" subtitle="What needs attention today" accent={C.red} className="mb-6" detailTitle="Action Item Details" detailContent={
        <div className="space-y-3">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>These actions are generated automatically based on MEMTrak's analysis of engagement patterns, bounce rates, and campaign performance. Items are ranked by urgency and revenue impact.</p>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(217,74,74,0.06)' }}>
            <p className="text-xs font-bold" style={{ color: C.red }}>About Engagement Decay Alerts</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>When a member who historically opened 80% of emails drops to 20%, that's a decay signal. Research shows this pattern predicts non-renewal 3-6 months before it happens. Each alert includes the member's annual dues revenue at risk.</p>
          </div>
        </div>
      }>
        <div className="space-y-2">
          {[
            { urgency: 'HIGH', color: C.red, icon: AlertTriangle, text: `${demoDecayAlerts.filter(d => d.decay >= 70).length} engagement decay alerts — $${demoDecayAlerts.filter(d => d.decay >= 70).reduce((s, d) => s + d.revenue, 0).toLocaleString()} at risk`, action: 'View in Intelligence →' },
            { urgency: 'HIGH', color: C.red, icon: Shield, text: `${totals.totalBounced} bounced addresses need immediate cleanup`, action: 'Clean in Address Hygiene →' },
            { urgency: 'MEDIUM', color: C.orange, icon: Send, text: `${totals.scheduled} campaign scheduled, ${totals.drafts} draft needs review`, action: 'Review in Campaigns →' },
            { urgency: 'PLAN', color: C.blue, icon: Users, text: 'Renewal season: 4,994 members need comms by Q4', action: 'Plan in Renewals →' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg transition-all hover:translate-x-1" style={{ background: 'color-mix(in srgb, var(--card-border) 30%, transparent)' }}>
                <span className="flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-full font-bold flex-shrink-0 mt-0.5" style={{ background: `color-mix(in srgb, ${item.color} 15%, transparent)`, color: item.color }}><Icon className="w-3 h-3" />{item.urgency}</span>
                <div className="flex-1">
                  <span className="text-xs" style={{ color: 'var(--heading)' }}>{item.text}</span>
                  <div className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: 'var(--accent)' }}>{item.action} <ArrowRight className="w-3 h-3" /></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend */}
        <Card title="Monthly Performance" subtitle="Volume, opens, clicks by month" detailTitle="Monthly Trend Analysis" detailContent={
          <div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>March was the highest-volume month driven by ALTA ONE promotion and Advocacy Summit. Open rates improved from January (34.5%) to April (40%+), likely due to A/B subject line testing and better list segmentation.</p>
            <div className="space-y-1 text-xs">
              {demoMonthly.map(m => (
                <div key={m.month} className="flex justify-between p-2 rounded" style={{ background: 'var(--background)' }}>
                  <span style={{ color: 'var(--heading)' }}>{m.month}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{m.sent.toLocaleString()} sent · {((m.opened / (m.sent - m.bounced)) * 100).toFixed(1)}% open · {m.bounced} bounced</span>
                </div>
              ))}
            </div>
          </div>
        }>
          <ClientChart type="bar" height={280} data={{ labels: demoMonthly.map(m => m.month), datasets: [
            { label: 'Sent', data: demoMonthly.map(m => m.sent), backgroundColor: 'var(--accent)', borderRadius: 6 },
            { label: 'Opened', data: demoMonthly.map(m => m.opened), backgroundColor: C.blue, borderRadius: 6 },
            { label: 'Clicked', data: demoMonthly.map(m => m.clicked), backgroundColor: C.green, borderRadius: 6 },
          ] }} options={{
            plugins: { legend: { display: true, position: 'top' as const, labels: { color: 'var(--text-muted)', usePointStyle: true, padding: 16, font: { size: 10 } } }, datalabels: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: 'var(--grid-line)' }, ticks: { color: 'var(--text-muted)' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-muted)' } } },
          }} />
        </Card>

        {/* Churn Watchlist */}
        <Card title="Churn Watchlist" subtitle="Highest risk members by revenue" accent={C.orange} detailTitle="Churn Risk Analysis" detailContent={
          <div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>MEMTrak scores churn risk by combining email engagement decay, event attendance, dues payment patterns, and member type (ACU underwriters are weighted 50x due to revenue impact). Scores above 70 typically predict non-renewal.</p>
          </div>
        }>
          <div className="space-y-2">
            {demoChurnScores.map(c => (
              <div key={c.org} className="flex items-center gap-3 p-3 rounded-lg transition-all hover:translate-x-1" style={{ background: 'color-mix(in srgb, var(--card-border) 30%, transparent)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm" style={{ background: c.score >= 70 ? 'rgba(217,74,74,0.15)' : c.score >= 50 ? 'rgba(232,146,63,0.15)' : 'rgba(140,198,63,0.15)', color: c.score >= 70 ? C.red : c.score >= 50 ? C.orange : C.green }}>{c.score}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{c.org} <span className="font-normal" style={{ color: 'var(--text-muted)' }}>({c.type})</span></div>
                  <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.factors[0]}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold" style={{ color: C.red }}>${c.revenue.toLocaleString()}</div>
                  <div className="text-[9px]" style={{ color: C.green }}>{c.action}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card glass title="Best Send Time Today" subtitle="Based on segment analysis">
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
              <Clock className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{demoSendTimes[0].day} {demoSendTimes[0].time}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{demoSendTimes[0].segment} — {demoSendTimes[0].openRate}% expected open rate</div>
            </div>
          </div>
        </Card>

        <Card glass title="Top CTA This Month" subtitle="Highest click-through">
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
              <MousePointerClick className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>"Renew Your Membership"</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>39.2% click rate — 8x better than "Learn More"</div>
            </div>
          </div>
        </Card>

        <Card glass title="Platform Savings" subtitle="vs Higher Logic + ActiveCampaign + HubSpot">
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
              <DollarSign className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: C.green }}>$3,010/mo saved</div>
              <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>MEMTrak $75/mo vs $3,085/mo combined cost</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card title="Recent Campaigns" subtitle="Last 5 campaigns sent" detailTitle="All Campaigns" detailContent={
        <div className="space-y-2">
          {sentCampaigns.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--background)' }}>
              <div>
                <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{c.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.source} · {c.sentDate} · {c.listSize.toLocaleString()} sent</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold" style={{ color: c.uniqueOpened / c.delivered >= 0.4 ? C.green : C.orange }}>{(c.uniqueOpened / c.delivered * 100).toFixed(1)}% open</div>
                {c.revenue > 0 && <div className="text-[10px] font-bold" style={{ color: C.green }}>${(c.revenue / 1000).toFixed(0)}K</div>}
              </div>
            </div>
          ))}
        </div>
      }>
        <div className="space-y-2">
          {sentCampaigns.slice(0, 5).map(c => (
            <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg transition-all hover:translate-x-1" style={{ background: 'color-mix(in srgb, var(--card-border) 20%, transparent)' }}>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate" style={{ color: 'var(--heading)' }}>{c.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{c.source} · {c.sentDate}</div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <span className="text-xs font-bold" style={{ color: (c.uniqueOpened / c.delivered) >= 0.4 ? C.green : C.orange }}>{(c.uniqueOpened / c.delivered * 100).toFixed(1)}%</span>
                {c.revenue > 0 && <span className="text-xs font-bold" style={{ color: C.green }}>${(c.revenue / 1000).toFixed(0)}K</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
