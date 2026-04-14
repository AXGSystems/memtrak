'use client';

import { useState, useMemo, useEffect } from 'react';
import Card from '@/components/Card';
import SparkKpi from '@/components/SparkKpi';
import {
  Users,
  Filter,
  Plus,
  X,
  Save,
  ChevronDown,
  Search,
  Layers,
  Target,
  Hash,
  Bookmark,
  Eye,
  Trash2,
  Check,
} from 'lucide-react';

/* ── Brand Colors ─────────────────────────────────────────── */
const C = {
  green: '#8CC63F',
  blue: '#4A90D9',
  red: '#D94A4A',
  orange: '#E8923F',
  amber: '#F59E0B',
  navy: '#002D5C',
  purple: '#a855f7',
  teal: '#14b8a6',
};

/* ── Member types & synthetic data ────────────────────────── */
const MEMBER_TYPES = ['ACA', 'ACU', 'REA', 'ACB', 'AFF', 'ASC', 'HLM', 'STU'];
const STATES = ['TX', 'FL', 'CA', 'NY', 'PA', 'OH', 'IL', 'GA', 'NC', 'NJ', 'VA', 'MI', 'WA', 'AZ', 'CO'];

interface SyntheticMember {
  id: number;
  name: string;
  org: string;
  type: string;
  joinYear: number;
  dues: number;
  engagementScore: number;
  lastOpen: number; // days ago
  state: string;
  eventAttendance: boolean;
  email: string;
}

const syntheticMembers: SyntheticMember[] = [
  { id: 1, name: 'Sarah Chen', org: 'First American Title', type: 'ACU', joinYear: 2018, dues: 61554, engagementScore: 72, lastOpen: 3, state: 'CA', eventAttendance: true, email: 'schen@firstam.com' },
  { id: 2, name: 'Mike Torres', org: 'Heritage Abstract LLC', type: 'ACB', joinYear: 2020, dues: 517, engagementScore: 8, lastOpen: 95, state: 'TX', eventAttendance: false, email: 'mtorres@heritageabstract.com' },
  { id: 3, name: 'Jennifer Walsh', org: 'Liberty Title Group', type: 'ACA', joinYear: 2019, dues: 1216, engagementScore: 65, lastOpen: 7, state: 'FL', eventAttendance: true, email: 'jwalsh@libertytitle.com' },
  { id: 4, name: 'David Park', org: 'National Title Services', type: 'REA', joinYear: 2021, dues: 441, engagementScore: 42, lastOpen: 21, state: 'NY', eventAttendance: false, email: 'dpark@nationaltitle.com' },
  { id: 5, name: 'Amy Rodriguez', org: 'Commonwealth Land Title', type: 'ACA', joinYear: 2017, dues: 1216, engagementScore: 88, lastOpen: 2, state: 'PA', eventAttendance: true, email: 'arodriguez@commonwealth.com' },
  { id: 6, name: 'Robert Kim', org: 'Old Republic Title', type: 'ACU', joinYear: 2015, dues: 61554, engagementScore: 55, lastOpen: 14, state: 'OH', eventAttendance: true, email: 'rkim@oldrepublic.com' },
  { id: 7, name: 'Lisa Nguyen', org: 'Stewart Title Co', type: 'ACA', joinYear: 2022, dues: 1216, engagementScore: 78, lastOpen: 1, state: 'TX', eventAttendance: true, email: 'lnguyen@stewart.com' },
  { id: 8, name: 'Chris Martinez', org: 'WFG National Title', type: 'REA', joinYear: 2023, dues: 441, engagementScore: 34, lastOpen: 45, state: 'AZ', eventAttendance: false, email: 'cmartinez@wfg.com' },
  { id: 9, name: 'Patricia Green', org: 'North American Title', type: 'ACA', joinYear: 2016, dues: 1216, engagementScore: 60, lastOpen: 12, state: 'IL', eventAttendance: true, email: 'pgreen@nat.com' },
  { id: 10, name: 'James Wilson', org: 'Fidelity National Title', type: 'ACU', joinYear: 2014, dues: 61554, engagementScore: 92, lastOpen: 1, state: 'FL', eventAttendance: true, email: 'jwilson@fidelity.com' },
  { id: 11, name: 'Maria Santos', org: 'Chicago Title Insurance', type: 'ACA', joinYear: 2026, dues: 1216, engagementScore: 50, lastOpen: 5, state: 'IL', eventAttendance: false, email: 'msantos@ctic.com' },
  { id: 12, name: 'Tom Anderson', org: 'Land Title Inc', type: 'ACB', joinYear: 2024, dues: 517, engagementScore: 28, lastOpen: 60, state: 'CO', eventAttendance: false, email: 'tanderson@landtitle.com' },
  { id: 13, name: 'Rachel Lee', org: 'Metro Title Co', type: 'ACA', joinYear: 2026, dues: 1216, engagementScore: 45, lastOpen: 8, state: 'GA', eventAttendance: false, email: 'rlee@metrotitle.com' },
  { id: 14, name: 'Bill Thompson', org: 'Westcor Land Title', type: 'REA', joinYear: 2019, dues: 441, engagementScore: 70, lastOpen: 4, state: 'AZ', eventAttendance: true, email: 'bthompson@westcor.com' },
  { id: 15, name: 'Karen Davis', org: 'Title Alliance Ltd', type: 'AFF', joinYear: 2022, dues: 350, engagementScore: 55, lastOpen: 18, state: 'NJ', eventAttendance: true, email: 'kdavis@titlealliance.com' },
  { id: 16, name: 'Steve Brown', org: 'Investors Title Co', type: 'ACU', joinYear: 2013, dues: 61554, engagementScore: 82, lastOpen: 2, state: 'NC', eventAttendance: true, email: 'sbrown@invtitle.com' },
  { id: 17, name: 'Nina Patel', org: 'TitleOne Corp', type: 'ACA', joinYear: 2025, dues: 1216, engagementScore: 62, lastOpen: 10, state: 'WA', eventAttendance: false, email: 'npatel@titleone.com' },
  { id: 18, name: 'Greg Foster', org: 'Conestoga Title', type: 'ACB', joinYear: 2020, dues: 517, engagementScore: 15, lastOpen: 180, state: 'PA', eventAttendance: false, email: 'gfoster@conestoga.com' },
  { id: 19, name: 'Diana Cruz', org: 'Agents National Title', type: 'ACA', joinYear: 2026, dues: 1216, engagementScore: 40, lastOpen: 6, state: 'MI', eventAttendance: false, email: 'dcruz@agents.com' },
  { id: 20, name: 'Paul Martin', org: 'Alliant National Title', type: 'ACU', joinYear: 2017, dues: 61554, engagementScore: 75, lastOpen: 5, state: 'CO', eventAttendance: true, email: 'pmartin@alliant.com' },
];

/* ── Filter types ─────────────────────────────────────────── */
type FilterType = 'memberType' | 'joinYear' | 'duesRange' | 'engagementScore' | 'lastOpen' | 'state' | 'eventAttendance';

interface FilterCondition {
  id: string;
  type: FilterType;
  label: string;
  values?: string[]; // for multi-select
  min?: number;
  max?: number;
  boolValue?: boolean;
}

const FILTER_DEFS: { type: FilterType; label: string; icon: typeof Users }[] = [
  { type: 'memberType', label: 'Member Type', icon: Users },
  { type: 'joinYear', label: 'Join Year', icon: Hash },
  { type: 'duesRange', label: 'Dues Range', icon: Target },
  { type: 'engagementScore', label: 'Engagement Score', icon: Layers },
  { type: 'lastOpen', label: 'Last Open (days)', icon: Eye },
  { type: 'state', label: 'State', icon: Filter },
  { type: 'eventAttendance', label: 'Event Attendance', icon: Check },
];

/* ── Saved Segments ───────────────────────────────────────── */
interface SavedSegment {
  id: string;
  name: string;
  size: number;
  filters: FilterCondition[];
  color: string;
}

const presetSegments: SavedSegment[] = [
  { id: 'all', name: 'All Members', size: 4994, filters: [], color: C.blue },
  { id: 'acu', name: 'ACU Underwriters', size: 42, filters: [{ id: 'f-acu', type: 'memberType', label: 'Member Type', values: ['ACU'] }], color: C.green },
  { id: 'non-compliant', name: 'Non-Compliant Orgs', size: 340, filters: [{ id: 'f-nc', type: 'engagementScore', label: 'Engagement Score', min: 0, max: 30 }], color: C.red },
  { id: 'stale', name: 'Stale 6mo+', size: 680, filters: [{ id: 'f-stale', type: 'lastOpen', label: 'Last Open (days)', min: 180, max: 999 }], color: C.orange },
  { id: 'new2026', name: 'New 2026', size: 312, filters: [{ id: 'f-2026', type: 'joinYear', label: 'Join Year', min: 2026, max: 2026 }], color: C.teal },
];

/* ── Animated counter ─────────────────────────────────────── */
function AnimatedCounter({ value, duration = 600 }: { value: number; duration?: number }) {
  const [displayed, setDisplayed] = useState(0);
  const prevRef = useState(0);

  useEffect(() => {
    if (typeof requestAnimationFrame === 'undefined') { setDisplayed(value); return; }
    const start = prevRef[0];
    prevRef[0] = value;
    const startTime = performance.now();
    function tick() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{displayed.toLocaleString()}</>;
}

/* ── Page Component ───────────────────────────────────────── */
export default function AudienceBuilder() {
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [activePreview, setActivePreview] = useState<string | null>(null);

  /* Apply filters to synthetic members */
  const matchingMembers = useMemo(() => {
    return syntheticMembers.filter((m) => {
      return filters.every((f) => {
        switch (f.type) {
          case 'memberType':
            return !f.values?.length || f.values.includes(m.type);
          case 'joinYear':
            return (!f.min || m.joinYear >= f.min) && (!f.max || m.joinYear <= f.max);
          case 'duesRange':
            return (!f.min || m.dues >= f.min) && (!f.max || m.dues <= f.max);
          case 'engagementScore':
            return (!f.min || m.engagementScore >= f.min) && (!f.max || m.engagementScore <= f.max);
          case 'lastOpen':
            return (!f.min || m.lastOpen >= f.min) && (!f.max || m.lastOpen <= f.max);
          case 'state':
            return !f.values?.length || f.values.includes(m.state);
          case 'eventAttendance':
            return f.boolValue === undefined || m.eventAttendance === f.boolValue;
          default:
            return true;
        }
      });
    });
  }, [filters]);

  /* Compute match count per filter */
  const filterMatchCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filters.forEach((f) => {
      const count = syntheticMembers.filter((m) => {
        switch (f.type) {
          case 'memberType': return !f.values?.length || f.values.includes(m.type);
          case 'joinYear': return (!f.min || m.joinYear >= f.min) && (!f.max || m.joinYear <= f.max);
          case 'duesRange': return (!f.min || m.dues >= f.min) && (!f.max || m.dues <= f.max);
          case 'engagementScore': return (!f.min || m.engagementScore >= f.min) && (!f.max || m.engagementScore <= f.max);
          case 'lastOpen': return (!f.min || m.lastOpen >= f.min) && (!f.max || m.lastOpen <= f.max);
          case 'state': return !f.values?.length || f.values.includes(m.state);
          case 'eventAttendance': return f.boolValue === undefined || m.eventAttendance === f.boolValue;
          default: return true;
        }
      }).length;
      counts[f.id] = count;
    });
    return counts;
  }, [filters]);

  const audienceSize = filters.length === 0 ? syntheticMembers.length : matchingMembers.length;

  function addFilter(type: FilterType) {
    const def = FILTER_DEFS.find((d) => d.type === type)!;
    const id = `f-${Date.now()}`;
    let newFilter: FilterCondition = { id, type, label: def.label };

    switch (type) {
      case 'memberType': newFilter.values = []; break;
      case 'joinYear': newFilter.min = 2020; newFilter.max = 2026; break;
      case 'duesRange': newFilter.min = 0; newFilter.max = 62000; break;
      case 'engagementScore': newFilter.min = 0; newFilter.max = 100; break;
      case 'lastOpen': newFilter.min = 0; newFilter.max = 30; break;
      case 'state': newFilter.values = []; break;
      case 'eventAttendance': newFilter.boolValue = true; break;
    }
    setFilters((prev) => [...prev, newFilter]);
    setShowAddFilter(false);
  }

  function removeFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  }

  function updateFilter(id: string, updates: Partial<FilterCondition>) {
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }

  function toggleSegmentOverlap(segId: string) {
    setSelectedSegments((prev) =>
      prev.includes(segId) ? prev.filter((s) => s !== segId) : prev.length < 3 ? [...prev, segId] : prev
    );
  }

  function loadSegment(seg: SavedSegment) {
    setFilters(seg.filters.map((f) => ({ ...f, id: `f-${Date.now()}-${Math.random()}` })));
  }

  return (
    <div className="p-6">
      {/* ── 1. Branded Header ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(74,144,217,0.2) 0%, rgba(140,198,63,0.2) 100%)',
              border: '1px solid rgba(74,144,217,0.3)',
            }}
          >
            <Target className="w-5 h-5" style={{ color: C.blue }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--heading)' }}>
              AudienceBuilder<span style={{ color: C.blue, fontSize: '0.65em', verticalAlign: 'super' }}>&trade;</span>
            </h1>
            <p className="text-[11px] font-semibold" style={{ color: C.blue }}>
              Build the perfect audience with precision.
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          Visual segment builder for campaign targeting. Add filter conditions to narrow your audience,
          preview matching members in real time, and save segments for reuse across campaigns. Overlap
          analysis shows how your segments intersect.
        </p>
      </div>

      {/* ── 2. SparkKpi Row ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 stagger-children">
        <SparkKpi
          label="Segments Saved"
          value={presetSegments.length}
          sub="Reusable targeting segments"
          icon={Bookmark}
          color={C.blue}
          sparkData={[2, 2, 3, 3, 4, 4, 5]}
          sparkColor={C.blue}
          trend={{ value: 25, label: 'this quarter' }}
          accent
        />
        <SparkKpi
          label="Avg Segment Size"
          value="1,274"
          sub="Members per segment"
          icon={Users}
          color={C.green}
          sparkData={[980, 1020, 1100, 1150, 1200, 1250, 1274]}
          sparkColor={C.green}
          trend={{ value: 8.4, label: 'vs last quarter' }}
          accent
        />
        <SparkKpi
          label="Largest Segment"
          value="4,994"
          sub="All Members"
          icon={Layers}
          color={C.purple}
          sparkData={[4200, 4350, 4500, 4620, 4750, 4880, 4994]}
          sparkColor={C.purple}
          trend={{ value: 3.2, label: 'growing' }}
          accent
        />
        <SparkKpi
          label="Most Used Segment"
          value="ACU"
          sub="Used in 8 campaigns"
          icon={Target}
          color={C.orange}
          sparkData={[3, 4, 5, 5, 6, 7, 8]}
          sparkColor={C.orange}
          trend={{ value: 14.3, label: 'vs last quarter' }}
          accent
        />
      </div>

      {/* ── 3. Main Builder Layout ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Filter Builder + Live Counter */}
        <div className="lg:col-span-2 space-y-4">
          {/* Live audience counter */}
          <div
            className="rounded-xl border p-5 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(74,144,217,0.06) 0%, rgba(140,198,63,0.06) 100%)',
              borderColor: 'var(--card-border)',
            }}
          >
            <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
              Live Audience Size
            </div>
            <div className="text-4xl font-extrabold" style={{ color: C.blue }}>
              <AnimatedCounter value={audienceSize} />
            </div>
            <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
              {filters.length === 0 ? 'No filters applied - showing all members' : `${filters.length} filter${filters.length > 1 ? 's' : ''} active`}
            </div>
          </div>

          {/* Filter conditions */}
          <Card title="Filter Conditions" subtitle="Add rules to refine your audience">
            <div className="space-y-3">
              {filters.length === 0 && (
                <div className="text-center py-6 rounded-lg" style={{ background: 'var(--input-bg)' }}>
                  <Filter className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No filters yet. Add a condition to start building your audience.</p>
                </div>
              )}

              {filters.map((f) => (
                <div
                  key={f.id}
                  className="rounded-lg border p-3"
                  style={{ background: 'var(--input-bg)', borderColor: 'var(--card-border)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.blue }}>
                        {f.label}
                      </span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(74,144,217,0.15)', color: C.blue }}
                      >
                        {filterMatchCounts[f.id] ?? syntheticMembers.length} matches
                      </span>
                    </div>
                    <button onClick={() => removeFilter(f.id)} className="p-1 rounded hover:bg-black/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" style={{ color: C.red }} />
                    </button>
                  </div>

                  {/* Filter-specific controls */}
                  {f.type === 'memberType' && (
                    <div className="flex flex-wrap gap-1.5">
                      {MEMBER_TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            const vals = f.values || [];
                            updateFilter(f.id, { values: vals.includes(t) ? vals.filter((v) => v !== t) : [...vals, t] });
                          }}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                          style={{
                            background: f.values?.includes(t) ? C.blue : 'var(--card)',
                            color: f.values?.includes(t) ? '#fff' : 'var(--text-muted)',
                            border: `1px solid ${f.values?.includes(t) ? C.blue : 'var(--card-border)'}`,
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}

                  {f.type === 'state' && (
                    <div className="flex flex-wrap gap-1.5">
                      {STATES.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            const vals = f.values || [];
                            updateFilter(f.id, { values: vals.includes(s) ? vals.filter((v) => v !== s) : [...vals, s] });
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                          style={{
                            background: f.values?.includes(s) ? C.teal : 'var(--card)',
                            color: f.values?.includes(s) ? '#fff' : 'var(--text-muted)',
                            border: `1px solid ${f.values?.includes(s) ? C.teal : 'var(--card-border)'}`,
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {(f.type === 'joinYear' || f.type === 'duesRange' || f.type === 'engagementScore' || f.type === 'lastOpen') && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Min</label>
                        <input
                          type="number"
                          value={f.min ?? ''}
                          onChange={(e) => updateFilter(f.id, { min: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full mt-0.5 px-2 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background: 'var(--card)', color: 'var(--heading)', border: '1px solid var(--card-border)' }}
                        />
                      </div>
                      <span className="text-[10px] font-bold mt-4" style={{ color: 'var(--text-muted)' }}>to</span>
                      <div className="flex-1">
                        <label className="text-[9px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Max</label>
                        <input
                          type="number"
                          value={f.max ?? ''}
                          onChange={(e) => updateFilter(f.id, { max: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full mt-0.5 px-2 py-1.5 rounded-lg text-xs font-bold"
                          style={{ background: 'var(--card)', color: 'var(--heading)', border: '1px solid var(--card-border)' }}
                        />
                      </div>
                    </div>
                  )}

                  {f.type === 'eventAttendance' && (
                    <div className="flex gap-2">
                      {[true, false].map((val) => (
                        <button
                          key={String(val)}
                          onClick={() => updateFilter(f.id, { boolValue: val })}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                          style={{
                            background: f.boolValue === val ? C.green : 'var(--card)',
                            color: f.boolValue === val ? '#fff' : 'var(--text-muted)',
                            border: `1px solid ${f.boolValue === val ? C.green : 'var(--card-border)'}`,
                          }}
                        >
                          {val ? 'Yes - Attended' : 'No - Not Attended'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Add filter button */}
              <div className="relative">
                <button
                  onClick={() => setShowAddFilter(!showAddFilter)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-bold transition-all hover:scale-[1.02]"
                  style={{
                    background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                    color: 'var(--accent)',
                    border: '1px dashed var(--accent)',
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Filter Condition
                  <ChevronDown className="w-3 h-3" style={{ transform: showAddFilter ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {showAddFilter && (
                  <div
                    className="absolute top-full left-0 mt-1 w-64 rounded-xl border shadow-xl z-20 p-2"
                    style={{ background: 'var(--card)', borderColor: 'var(--card-border)' }}
                  >
                    {FILTER_DEFS.map((def) => (
                      <button
                        key={def.type}
                        onClick={() => addFilter(def.type)}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors"
                        style={{ color: 'var(--heading)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--input-bg)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <def.icon className="w-3.5 h-3.5" style={{ color: C.blue }} />
                        {def.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Audience Preview */}
          <Card title="Audience Preview" subtitle={`Showing first ${Math.min(10, matchingMembers.length)} of ${audienceSize} matching members`}>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                    {['Name', 'Org', 'Type', 'State', 'Engagement', 'Last Open', 'Dues'].map((h) => (
                      <th key={h} className="text-left py-2 px-2 uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matchingMembers.slice(0, 10).map((m) => (
                    <tr
                      key={m.id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid var(--card-border)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--input-bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="py-2 px-2 font-bold" style={{ color: 'var(--heading)' }}>{m.name}</td>
                      <td className="py-2 px-2" style={{ color: 'var(--text-muted)' }}>{m.org}</td>
                      <td className="py-2 px-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'var(--input-bg)', color: 'var(--heading)' }}>
                          {m.type}
                        </span>
                      </td>
                      <td className="py-2 px-2" style={{ color: 'var(--text-muted)' }}>{m.state}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${m.engagementScore}%`,
                                background: m.engagementScore >= 70 ? C.green : m.engagementScore >= 40 ? C.amber : C.red,
                              }}
                            />
                          </div>
                          <span style={{ color: m.engagementScore >= 70 ? C.green : m.engagementScore >= 40 ? C.amber : C.red }}>
                            {m.engagementScore}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2" style={{ color: m.lastOpen <= 7 ? C.green : m.lastOpen <= 30 ? C.amber : C.red }}>
                        {m.lastOpen}d ago
                      </td>
                      <td className="py-2 px-2 font-bold" style={{ color: 'var(--heading)' }}>
                        ${m.dues.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {matchingMembers.length === 0 && (
                <div className="text-center py-6">
                  <Search className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>No members match current filters.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right sidebar: Saved segments + Overlap */}
        <div className="space-y-4">
          {/* Saved Segments */}
          <Card title="Saved Segments" subtitle="Click to load, select multiple for overlap">
            <div className="space-y-2">
              {presetSegments.map((seg) => (
                <div
                  key={seg.id}
                  className="rounded-lg border p-3 cursor-pointer transition-all hover:translate-y-[-1px]"
                  style={{
                    background: selectedSegments.includes(seg.id) ? `${seg.color}10` : 'var(--input-bg)',
                    borderColor: selectedSegments.includes(seg.id) ? seg.color : 'var(--card-border)',
                    borderLeftWidth: '3px',
                    borderLeftColor: seg.color,
                  }}
                  onClick={() => toggleSegmentOverlap(seg.id)}
                  onDoubleClick={() => loadSegment(seg)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold" style={{ color: 'var(--heading)' }}>{seg.name}</div>
                      <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{seg.size.toLocaleString()} members</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {selectedSegments.includes(seg.id) && (
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: seg.color }}>
                          <Check className="w-2.5 h-2.5" style={{ color: '#fff' }} />
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); loadSegment(seg); }}
                        className="p-1 rounded transition-colors"
                        title="Load segment filters"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--heading)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Filter className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-[9px] mt-2" style={{ color: 'var(--text-muted)' }}>
                Click to select for overlap view. Double-click to load filters.
              </p>
            </div>
          </Card>

          {/* Overlap Visualization */}
          <Card title="Segment Overlap" subtitle={selectedSegments.length < 2 ? 'Select 2-3 segments above' : `${selectedSegments.length} segments selected`}>
            {selectedSegments.length < 2 ? (
              <div className="text-center py-8">
                <Layers className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Select 2 or 3 saved segments to visualize overlap.</p>
              </div>
            ) : (
              <div>
                {/* Venn diagram using overlapping circles */}
                <svg viewBox="0 0 280 200" className="w-full" style={{ maxHeight: 200 }}>
                  {(() => {
                    const segs = selectedSegments.map((id) => presetSegments.find((s) => s.id === id)!).filter(Boolean);
                    const positions =
                      segs.length === 2
                        ? [{ cx: 110, cy: 100 }, { cx: 170, cy: 100 }]
                        : [{ cx: 120, cy: 80 }, { cx: 170, cy: 80 }, { cx: 140, cy: 130 }];

                    return (
                      <>
                        {segs.map((seg, i) => (
                          <g key={seg.id}>
                            <circle
                              cx={positions[i].cx}
                              cy={positions[i].cy}
                              r={55}
                              fill={seg.color}
                              fillOpacity={0.15}
                              stroke={seg.color}
                              strokeWidth={2}
                              strokeOpacity={0.6}
                            />
                            <text
                              x={positions[i].cx}
                              y={positions[i].cy - 8}
                              textAnchor="middle"
                              fill={seg.color}
                              fontSize="9"
                              fontWeight="bold"
                            >
                              {seg.name}
                            </text>
                            <text
                              x={positions[i].cx}
                              y={positions[i].cy + 8}
                              textAnchor="middle"
                              fill={seg.color}
                              fontSize="11"
                              fontWeight="800"
                            >
                              {seg.size.toLocaleString()}
                            </text>
                          </g>
                        ))}
                        {/* Overlap label in center */}
                        <text
                          x={segs.length === 2 ? 140 : 143}
                          y={segs.length === 2 ? 100 : 95}
                          textAnchor="middle"
                          fill="var(--heading)"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {Math.round(Math.min(...segs.map((s) => s.size)) * 0.12)} overlap
                        </text>
                      </>
                    );
                  })()}
                </svg>

                {/* Overlap stats */}
                <div className="space-y-1.5 mt-3">
                  {selectedSegments.map((id) => {
                    const seg = presetSegments.find((s) => s.id === id);
                    if (!seg) return null;
                    return (
                      <div key={id} className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px]" style={{ background: 'var(--input-bg)' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
                          <span style={{ color: 'var(--heading)' }}>{seg.name}</span>
                        </div>
                        <span className="font-bold" style={{ color: seg.color }}>{seg.size.toLocaleString()}</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[10px] border" style={{ borderColor: 'var(--card-border)' }}>
                    <span className="font-bold" style={{ color: 'var(--heading)' }}>Estimated Overlap</span>
                    <span className="font-bold" style={{ color: 'var(--accent)' }}>
                      ~{Math.round(Math.min(...selectedSegments.map((id) => presetSegments.find((s) => s.id === id)?.size || 0)) * 0.12).toLocaleString()} members
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Quick actions */}
          <div className="space-y-2">
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
              style={{ background: C.blue, color: '#fff' }}
            >
              <Save className="w-3.5 h-3.5" />
              Save Current Segment
            </button>
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all hover:scale-[1.02]"
              style={{ background: 'var(--input-bg)', color: 'var(--heading)', border: '1px solid var(--card-border)' }}
              onClick={() => { setFilters([]); setSelectedSegments([]); }}
            >
              <X className="w-3.5 h-3.5" />
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Footer badge */}
      <div className="text-center py-4">
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(74,144,217,0.08)',
            color: C.blue,
            border: '1px solid rgba(74,144,217,0.15)',
          }}
        >
          <Target className="w-3 h-3" />
          AudienceBuilder&trade; is a MEMTrak intelligence feature
        </span>
      </div>
    </div>
  );
}
