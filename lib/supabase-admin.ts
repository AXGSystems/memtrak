import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client using the service-role key. Used by NextAuth
 * (Supabase adapter, invite lookups) and by admin-side routes that need to
 * bypass RLS. Never import this from a `'use client'` file.
 *
 * Returns `null` (rather than throwing) when env vars are absent so callers
 * can render a 503 instead of crashing at build time.
 */

let _client: SupabaseClient | null = null;

export function getAdminSupabase(): SupabaseClient | null {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export function isAdminSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
