'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Star, Loader2, ExternalLink } from 'lucide-react';
import Card from './Card';
import type { Group, GroupMember, GroupRole, Contact } from '@/lib/member-data';

interface GroupsPanelProps {
  orgId: string;
  orgName: string;
}

const ROLE_COLOR: Record<GroupRole, string> = {
  Chair:        '#F5C542',
  'Vice Chair': '#a855f7',
  Secretary:    '#14b8a6',
  Member:       '#4A90D9',
  Liaison:      '#8CC63F',
  Observer:     '#888888',
};

interface Row {
  group: Group;
  member: GroupMember;
  contact: Contact;
}

export default function GroupsPanel({ orgId, orgName }: GroupsPanelProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/memtrak/orgs/${encodeURIComponent(orgId)}/groups`)
      .then((r) => r.json())
      .then((d: { rows: Row[] }) => setRows(d.rows ?? []))
      .finally(() => setLoading(false));
  }, [orgId]);

  return (
    <Card title="Committee & group memberships" subtitle={`Where ${orgName} contacts serve`}>
      {loading ? (
        <div className="flex items-center gap-2 text-xs py-3" style={{ color: 'var(--text-muted)' }}>
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading memberships…
        </div>
      ) : rows.length === 0 ? (
        <div className="text-xs py-3" style={{ color: 'var(--text-muted)' }}>
          No group memberships on file for this organization.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => {
            const color = ROLE_COLOR[r.member.role];
            const isLead = r.member.role === 'Chair' || r.member.role === 'Vice Chair';
            return (
              <Link
                key={r.member.id}
                href={`/groups/${encodeURIComponent(r.group.id)}`}
                className="flex items-start gap-3 p-2.5 rounded-lg transition-all hover:translate-x-0.5"
                style={{ background: 'var(--input-bg)' }}
              >
                <div className="p-1.5 rounded-md flex-shrink-0" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}>
                  <Briefcase className="w-3 h-3" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{r.group.name}</span>
                    {isLead && <Star className="w-3 h-3" fill={color} style={{ color }} />}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {r.contact.first_name} {r.contact.last_name} · <span style={{ color }}>{r.member.role}</span>
                    {r.member.term_end && ` · term ${r.member.term_end}`}
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
