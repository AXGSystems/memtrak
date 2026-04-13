/**
 * MEMTrak — Member Engagement & Membership Tracking
 *
 * Internal email tracking system for ALTA DASH 2.0.
 * Provides open tracking (via pixel), click tracking (via redirect),
 * and a unified event log.
 *
 * How it works:
 * 1. When composing an email, staff embed a tracking pixel URL in the email body
 *    Example: <img src="https://dash.alta.org/api/memtrak/pixel?cid=renewal-apr-2026&rid=jsmith@firstam.com" width="1" height="1" />
 *
 * 2. When the recipient opens the email, their email client loads the image,
 *    which hits our API and logs the "open" event.
 *
 * 3. Links in the email are wrapped through our click tracker:
 *    Instead of: https://alta.org/join
 *    Use: https://dash.alta.org/api/memtrak/click?cid=renewal-apr-2026&rid=jsmith@firstam.com&url=https://alta.org/join
 *
 * 4. When the recipient clicks, they hit our API (logs the click) then get
 *    redirected to the actual destination URL.
 *
 * Storage: Currently in-memory (resets on server restart).
 * Future: Store in Azure SQL for persistence across deployments.
 */

export interface MemTrakEvent {
  id: string;
  timestamp: string;
  type: 'open' | 'click' | 'send' | 'bounce' | 'reply';
  campaignId: string;
  recipientEmail: string;
  recipientName?: string;
  metadata: Record<string, string>;
}

// In-memory event store (replace with Azure SQL in production)
// This persists across API calls within the same server process
const events: MemTrakEvent[] = [];

export function logEvent(event: Omit<MemTrakEvent, 'id' | 'timestamp'>): MemTrakEvent {
  const entry: MemTrakEvent = {
    id: `mt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...event,
  };
  events.push(entry);
  // Keep last 10,000 events in memory
  if (events.length > 10000) events.splice(0, events.length - 10000);
  return entry;
}

export function getEvents(filters?: { campaignId?: string; type?: string; limit?: number }): MemTrakEvent[] {
  let result = [...events];
  if (filters?.campaignId) result = result.filter(e => e.campaignId === filters.campaignId);
  if (filters?.type) result = result.filter(e => e.type === filters.type);
  result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (filters?.limit) result = result.slice(0, filters.limit);
  return result;
}

export function getStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const recent = events.filter(e => e.timestamp >= thirtyDaysAgo);

  const campaigns = [...new Set(events.map(e => e.campaignId))];
  const uniqueRecipients = [...new Set(events.map(e => e.recipientEmail))];

  return {
    totalEvents: events.length,
    last30Days: recent.length,
    totalCampaigns: campaigns.length,
    uniqueRecipients: uniqueRecipients.length,
    byType: {
      opens: events.filter(e => e.type === 'open').length,
      clicks: events.filter(e => e.type === 'click').length,
      sends: events.filter(e => e.type === 'send').length,
      bounces: events.filter(e => e.type === 'bounce').length,
      replies: events.filter(e => e.type === 'reply').length,
    },
    campaigns: campaigns.map(cid => {
      const campEvents = events.filter(e => e.campaignId === cid);
      const sends = campEvents.filter(e => e.type === 'send').length;
      const opens = campEvents.filter(e => e.type === 'open').length;
      const clicks = campEvents.filter(e => e.type === 'click').length;
      const uniqueOpens = new Set(campEvents.filter(e => e.type === 'open').map(e => e.recipientEmail)).size;
      return {
        campaignId: cid,
        sends,
        opens,
        uniqueOpens,
        clicks,
        openRate: sends > 0 ? ((uniqueOpens / sends) * 100).toFixed(1) : '0',
        clickRate: opens > 0 ? ((clicks / opens) * 100).toFixed(1) : '0',
      };
    }),
  };
}

/**
 * Generate a tracking pixel URL for embedding in emails.
 * Usage: Include this as an <img> tag at the bottom of the email body.
 */
export function generatePixelUrl(baseUrl: string, campaignId: string, recipientEmail: string): string {
  return `${baseUrl}/api/memtrak/pixel?cid=${encodeURIComponent(campaignId)}&rid=${encodeURIComponent(recipientEmail)}`;
}

/**
 * Generate a tracked link URL that redirects after logging the click.
 * Usage: Replace destination URLs in email body with this wrapped version.
 */
export function generateClickUrl(baseUrl: string, campaignId: string, recipientEmail: string, destinationUrl: string): string {
  return `${baseUrl}/api/memtrak/click?cid=${encodeURIComponent(campaignId)}&rid=${encodeURIComponent(recipientEmail)}&url=${encodeURIComponent(destinationUrl)}`;
}

// ===== SUPPRESSION / UNSUBSCRIBE LIST =====
// In-memory (replace with Azure SQL in production)
const suppressionList = new Set<string>();

export function unsubscribe(email: string): void {
  suppressionList.add(email.toLowerCase().trim());
}

export function resubscribe(email: string): void {
  suppressionList.delete(email.toLowerCase().trim());
}

export function isUnsubscribed(email: string): boolean {
  return suppressionList.has(email.toLowerCase().trim());
}

export function getSuppressionList(): string[] {
  return [...suppressionList].sort();
}

export function getSuppressionCount(): number {
  return suppressionList.size;
}

// ===== RECIPIENT LISTS =====
export interface RecipientList {
  id: string;
  name: string;
  description: string;
  recipients: { email: string; name: string; org: string; type: string; state: string }[];
  createdAt: string;
}

const recipientLists: RecipientList[] = [];

export function createList(list: Omit<RecipientList, 'id' | 'createdAt'>): RecipientList {
  const entry: RecipientList = {
    id: `list_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...list,
  };
  recipientLists.push(entry);
  return entry;
}

export function getLists(): RecipientList[] {
  return recipientLists;
}

export function getList(id: string): RecipientList | undefined {
  return recipientLists.find(l => l.id === id);
}

/**
 * Filter a recipient list, removing anyone on the suppression list.
 * This is the critical function — ALWAYS filter before sending.
 */
export function getActiveRecipients(list: RecipientList): RecipientList['recipients'] {
  return list.recipients.filter(r => !isUnsubscribed(r.email));
}
