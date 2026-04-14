/**
 * Supabase Database Types — MEMTrak
 *
 * Run the SQL in supabase-schema.sql to create these tables
 * in your Supabase project.
 */

export interface Database {
  public: {
    Tables: {
      memtrak_events: {
        Row: {
          id: string;
          created_at: string;
          type: 'open' | 'click' | 'send' | 'bounce' | 'reply';
          campaign_id: string;
          recipient_email: string;
          recipient_name: string | null;
          metadata: Record<string, string>;
        };
        Insert: {
          id?: string;
          created_at?: string;
          type: 'open' | 'click' | 'send' | 'bounce' | 'reply';
          campaign_id: string;
          recipient_email: string;
          recipient_name?: string | null;
          metadata?: Record<string, string>;
        };
        Update: Partial<Database['public']['Tables']['memtrak_events']['Insert']>;
      };
      memtrak_suppression: {
        Row: {
          email: string;
          reason: string;
          created_at: string;
        };
        Insert: {
          email: string;
          reason?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['memtrak_suppression']['Insert']>;
      };
      memtrak_campaigns: {
        Row: {
          id: string;
          name: string;
          type: string;
          status: string;
          source: string;
          sent_date: string | null;
          list_size: number;
          delivered: number;
          opened: number;
          unique_opened: number;
          clicked: number;
          bounced: number;
          unsubscribed: number;
          revenue: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          status: string;
          source: string;
          sent_date?: string | null;
          list_size?: number;
          delivered?: number;
          opened?: number;
          unique_opened?: number;
          clicked?: number;
          bounced?: number;
          unsubscribed?: number;
          revenue?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['memtrak_campaigns']['Insert']>;
      };
      memtrak_audit_log: {
        Row: {
          id: string;
          created_at: string;
          action: string;
          actor: string;
          details: Record<string, string>;
          ip_address: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          action: string;
          actor: string;
          details?: Record<string, string>;
          ip_address?: string | null;
        };
        Update: Partial<Database['public']['Tables']['memtrak_audit_log']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
