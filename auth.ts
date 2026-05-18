import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';
import { SupabaseAdapter } from '@auth/supabase-adapter';
import { authConfig, type AuthRole } from '@/lib/auth.config';
import { getAdminSupabase, isAdminSupabaseConfigured } from '@/lib/supabase-admin';

/**
 * Full NextAuth (Auth.js v5) instance. Routed through this single module so
 * the Supabase adapter and Node-only deps stay out of the edge runtime —
 * `middleware.ts` imports from `lib/auth.config` instead.
 *
 * Magic-link auth via Resend. Invite-only: the `signIn` callback rejects
 * any email that isn't pre-authorized in `public.memtrak_invites`.
 *
 * The Supabase adapter is only attached when service-role env vars are set —
 * otherwise the auth gate is off and we don't need verification_tokens.
 */

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: isAdminSupabaseConfigured()
    ? SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      })
    : undefined,
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM ?? 'MEMTrak <noreply@alta.org>',
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;

      const admin = getAdminSupabase();
      if (!admin) {
        console.error('signIn: Supabase admin client unavailable — env vars missing');
        return false;
      }

      // 1. Staff invite (memtrak_invites). Highest priority.
      const { data: invite } = await admin
        .from('memtrak_invites')
        .select('email, role, revoked_at')
        .eq('email', email)
        .maybeSingle();

      if (invite && !invite.revoked_at) {
        (user as { role?: AuthRole }).role = invite.role as AuthRole;
        await admin
          .from('memtrak_invites')
          .update({ accepted_at: new Date().toISOString() })
          .eq('email', email)
          .is('accepted_at', null);
        return true;
      }

      // 2. Member portal — email belongs to a contact on an active org.
      const { data: contact } = await admin
        .from('memtrak_contacts')
        .select('id, org_id, email')
        .ilike('email', email)
        .maybeSingle();

      if (contact?.org_id) {
        const u = user as { role?: AuthRole; contact_id?: string; org_id?: string };
        u.role = 'member';
        u.contact_id = contact.id;
        u.org_id = contact.org_id;
        return true;
      }

      // Not invited, not a known contact — reject.
      return false;
    },
  },
});
