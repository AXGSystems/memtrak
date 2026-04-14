/**
 * MEMTrak — Member Engagement & Membership Tracking
 *
 * Internal email tracking system for ALTA.
 * Provides open tracking (via pixel/logo), click tracking (via redirect),
 * and a unified event log.
 *
 * Storage: Uses Supabase when configured (NEXT_PUBLIC_SUPABASE_URL),
 * falls back to in-memory store for local development.
 */

import { supabase, isSupabaseConfigured } from './supabase';

export interface MemTrakEvent {
  id: string;
  timestamp: string;
  type: 'open' | 'click' | 'send' | 'bounce' | 'reply';
  campaignId: string;
  recipientEmail: string;
  recipientName?: string;
  metadata: Record<string, string>;
}

// ===== IN-MEMORY FALLBACK =====
const memoryEvents: MemTrakEvent[] = [];
const memorySuppression = new Set<string>();

// ===== EVENT LOGGING =====

export async function logEvent(event: Omit<MemTrakEvent, 'id' | 'timestamp'>): Promise<MemTrakEvent> {
  const entry: MemTrakEvent = {
    id: `mt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...event,
  };

  if (isSupabaseConfigured()) {
    await supabase.from('memtrak_events').insert({
      type: entry.type,
      campaign_id: entry.campaignId,
      recipient_email: entry.recipientEmail,
      recipient_name: entry.recipientName || null,
      metadata: entry.metadata,
    });
  } else {
    memoryEvents.push(entry);
    if (memoryEvents.length > 10000) memoryEvents.splice(0, memoryEvents.length - 10000);
  }

  return entry;
}

export async function getEvents(filters?: { campaignId?: string; type?: string; limit?: number }): Promise<MemTrakEvent[]> {
  if (isSupabaseConfigured()) {
    let query = supabase
      .from('memtrak_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.campaignId) query = query.eq('campaign_id', filters.campaignId);
    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data } = await query;
    return (data || []).map(row => ({
      id: row.id,
      timestamp: row.created_at,
      type: row.type as MemTrakEvent['type'],
      campaignId: row.campaign_id,
      recipientEmail: row.recipient_email,
      recipientName: row.recipient_name || undefined,
      metadata: (row.metadata as Record<string, string>) || {},
    }));
  }

  let result = [...memoryEvents];
  if (filters?.campaignId) result = result.filter(e => e.campaignId === filters.campaignId);
  if (filters?.type) result = result.filter(e => e.type === filters.type);
  result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (filters?.limit) result = result.slice(0, filters.limit);
  return result;
}

export async function getStats() {
  const events = await getEvents();
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

// ===== URL GENERATORS =====

export function generatePixelUrl(baseUrl: string, campaignId: string, recipientEmail: string): string {
  return `${baseUrl}/api/memtrak/pixel?cid=${encodeURIComponent(campaignId)}&rid=${encodeURIComponent(recipientEmail)}`;
}

export function generateClickUrl(baseUrl: string, campaignId: string, recipientEmail: string, destinationUrl: string): string {
  return `${baseUrl}/api/memtrak/click?cid=${encodeURIComponent(campaignId)}&rid=${encodeURIComponent(recipientEmail)}&url=${encodeURIComponent(destinationUrl)}`;
}

// ===== SUPPRESSION / UNSUBSCRIBE =====

export async function unsubscribe(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();
  if (isSupabaseConfigured()) {
    await supabase.from('memtrak_suppression').upsert({ email: normalized, reason: 'unsubscribe' });
  } else {
    memorySuppression.add(normalized);
  }
}

export async function resubscribe(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();
  if (isSupabaseConfigured()) {
    await supabase.from('memtrak_suppression').delete().eq('email', normalized);
  } else {
    memorySuppression.delete(normalized);
  }
}

export async function isUnsubscribed(email: string): Promise<boolean> {
  const normalized = email.toLowerCase().trim();
  if (isSupabaseConfigured()) {
    const { data } = await supabase.from('memtrak_suppression').select('email').eq('email', normalized).single();
    return !!data;
  }
  return memorySuppression.has(normalized);
}

export async function getSuppressionList(): Promise<string[]> {
  if (isSupabaseConfigured()) {
    const { data } = await supabase.from('memtrak_suppression').select('email').order('email');
    return (data || []).map(row => row.email);
  }
  return [...memorySuppression].sort();
}

export async function getSuppressionCount(): Promise<number> {
  if (isSupabaseConfigured()) {
    const { count } = await supabase.from('memtrak_suppression').select('*', { count: 'exact', head: true });
    return count || 0;
  }
  return memorySuppression.size;
}

// ===== AUDIT LOG =====

export async function auditLog(action: string, actor: string, details: Record<string, string> = {}, ipAddress?: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.from('memtrak_audit_log').insert({
      action,
      actor,
      details,
      ip_address: ipAddress || null,
    });
  }
  // In-memory: audit logs are not persisted (only meaningful with a database)
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

export async function getActiveRecipients(list: RecipientList): Promise<RecipientList['recipients']> {
  const results = [];
  for (const r of list.recipients) {
    const suppressed = await isUnsubscribed(r.email);
    if (!suppressed) results.push(r);
  }
  return results;
}
