'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card, { KpiCard } from '@/components/Card';
import { SkeletonCard, SkeletonKPI } from '@/components/Skeleton';
import { Users, Briefcase, Calendar, ChevronRight, Pause } from 'lucide-react';
import type { Group, GroupType } from '@/lib/member-data';

const TYPE_COLOR: Record<GroupType, string> = {
  Board:           '#a855f7',
  Committee:       '#4A90D9',
  'Working Group': '#14b8a6',
  Section:         '#F5C542',
  'Task Force':    '#E8923F',
  'Interest Group':'#8CC63F',
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/memtrak/groups')
      .then((r) => r.json())
      .then((d: { groups: Group[] }) => setGroups(d.groups ?? []))
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    if (!groups) return null;
    const active = groups.filter((g) => g.is_active).length;
    const inactive = groups.length - active;
    const byType = groups.reduce((acc: Record<string, number>, g) => {
      acc[g.group_type] = (acc[g.group_type] ?? 0) + 1;
      return acc;
    }, {});
    return { active, inactive, byType };
  }, [groups]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
            Committees & Groups
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Boards, committees, sections, working groups, task forces, and interest groups
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
        {loading || !totals ? (
          <><SkeletonKPI /><SkeletonKPI /><SkeletonKPI /></>
        ) : (
          <>
            <KpiCard label="Active groups" value={totals.active} sub={`${totals.inactive} inactive`} icon={Users} color="#8CC63F" />
            <KpiCard label="Boards & committees" value={(totals.byType.Board ?? 0) + (totals.byType.Committee ?? 0)} sub="formal governance bodies" icon={Briefcase} color="#a855f7" />
            <KpiCard label="Working / task / interest" value={(totals.byType['Working Group'] ?? 0) + (totals.byType['Task Force'] ?? 0) + (totals.byType['Interest Group'] ?? 0)} sub="topical groups" icon={Calendar} color="#4A90D9" />
          </>
        )}
      </div>

      {loading ? (
        <SkeletonCard height={400} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(groups ?? []).map((g) => {
            const color = TYPE_COLOR[g.group_type];
            return (
              <Link
                key={g.id}
                href={`/groups/${encodeURIComponent(g.id)}`}
                className="block transition-all hover:translate-y-[-2px]"
              >
                <Card glass>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-1 self-stretch rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold" style={{ color: 'var(--heading)' }}>{g.name}</h3>
                        <span
                          className="text-[11px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
                          style={{ color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
                        >
                          {g.group_type}
                        </span>
                        {!g.is_active && (
                          <span className="text-[11px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded inline-flex items-center gap-1" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)' }}>
                            <Pause className="w-2.5 h-2.5" /> Inactive
                          </span>
                        )}
                      </div>
                      {g.description && (
                        <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>{g.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {g.staff_liaison && <span>Liaison: <strong style={{ color: 'var(--heading)' }}>{g.staff_liaison}</strong></span>}
                        {g.meeting_frequency && <span>Meets {g.meeting_frequency}</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
