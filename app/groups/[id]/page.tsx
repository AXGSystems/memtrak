'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import { SkeletonCard } from '@/components/Skeleton';
import DocumentsPanel from '@/components/DocumentsPanel';
import { ChevronLeft, Star, Mail, Building2, Calendar, ExternalLink } from 'lucide-react';
import type { Group, GroupRole, Contact, Organization, GroupMember } from '@/lib/member-data';

const ROLE_COLOR: Record<GroupRole, string> = {
  Chair:        '#F5C542',
  'Vice Chair': '#a855f7',
  Secretary:    '#14b8a6',
  Member:       '#4A90D9',
  Liaison:      '#8CC63F',
  Observer:     '#888888',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

interface RosterPayload {
  group: Group;
  members: Array<GroupMember & { contact?: Contact | null; org?: Organization | null }>;
}

export default function GroupDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [data, setData] = useState<RosterPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/memtrak/groups/${encodeURIComponent(id)}`)
      .then(async (r) => {
        if (!r.ok) {
          const e = await r.json().catch(() => ({}));
          setError(e.error ?? `Request failed (${r.status})`);
          return;
        }
        setData(await r.json());
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Network error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="space-y-6"><SkeletonCard height={80} /><SkeletonCard height={300} /></div>;
  if (error || !data) {
    return (
      <div className="space-y-6">
        <Link href="/groups" className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
          <ChevronLeft className="w-3 h-3" /> Back to groups
        </Link>
        <Card glass><p className="text-xs" style={{ color: '#D94A4A' }}>{error ?? 'Not found.'}</p></Card>
      </div>
    );
  }

  const { group, members } = data;
  const activeMembers = members.filter((m) => m.is_active);
  const chair = members.find((m) => m.role === 'Chair');

  return (
    <div className="space-y-6">
      <div>
        <Link href="/groups" className="inline-flex items-center gap-1 text-xs no-print" style={{ color: 'var(--accent)' }}>
          <ChevronLeft className="w-3 h-3" /> Back to groups
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight mt-2" style={{ color: 'var(--heading)' }}>
          {group.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {group.group_type}{group.meeting_frequency && ` · meets ${group.meeting_frequency}`}{group.staff_liaison && ` · liaison ${group.staff_liaison}`}
        </p>
        {group.description && (
          <p className="text-xs mt-2 max-w-2xl" style={{ color: 'var(--text-muted)' }}>{group.description}</p>
        )}
      </div>

      <Card glass title="Roster" subtitle={`${activeMembers.length} active members${members.length > activeMembers.length ? ` · ${members.length - activeMembers.length} alumni` : ''}`}>
        {members.length === 0 ? (
          <p className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>No members on file.</p>
        ) : (
          <div className="space-y-2">
            {members.map((m) => {
              const color = ROLE_COLOR[m.role];
              const isChairOrViceChair = m.role === 'Chair' || m.role === 'Vice Chair';
              return (
                <div
                  key={m.id}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: 'var(--input-bg)' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
                    style={{
                      background: `color-mix(in srgb, ${color} 18%, transparent)`,
                      color,
                    }}
                  >
                    {m.contact ? `${m.contact.first_name[0] ?? '?'}${m.contact.last_name[0] ?? ''}` : '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
                        {m.contact ? `${m.contact.first_name} ${m.contact.last_name}` : `Contact ${m.contact_id}`}
                      </span>
                      {isChairOrViceChair && <Star className="w-3 h-3" fill={color} style={{ color }} />}
                      <span className="text-[11px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded" style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
                        {m.role}
                      </span>
                      {!m.is_active && (
                        <span className="text-[11px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--card-border)', color: 'var(--text-muted)' }}>
                          Alum
                        </span>
                      )}
                    </div>
                    {m.contact?.title && (
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.contact.title}</div>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {m.contact?.email && (
                        <a href={`mailto:${m.contact.email}`} className="inline-flex items-center gap-1 hover:underline">
                          <Mail className="w-3 h-3" /> {m.contact.email}
                        </a>
                      )}
                      {m.org && (
                        <Link
                          href={`/member-360?id=${encodeURIComponent(m.org.id)}`}
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          <Building2 className="w-3 h-3" /> {m.org.org_name}
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    <div className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {m.joined_date}</div>
                    {m.term_end && <div className="mt-0.5">Term ends {m.term_end}</div>}
                  </div>
                  {m.org && (
                    <Link
                      href={`/member-360?id=${encodeURIComponent(m.org.id)}`}
                      className="text-[10px] flex-shrink-0 px-2 py-1 rounded-md no-print"
                      style={{ color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}
                    >
                      <ExternalLink className="w-3 h-3 inline-block" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {chair && chair.contact && (
        <Card glass>
          <div className="text-xs">
            <strong style={{ color: 'var(--heading)' }}>Chair:</strong>{' '}
            <span style={{ color: 'var(--text-muted)' }}>{chair.contact.first_name} {chair.contact.last_name}</span>
            {chair.term_end && <span style={{ color: 'var(--text-muted)' }}> · term ends {chair.term_end}</span>}
          </div>
        </Card>
      )}

      <DocumentsPanel groupId={group.id} title="Documents" subtitle="Bylaws, minutes, agendas attached to this group" />
    </div>
  );
}
