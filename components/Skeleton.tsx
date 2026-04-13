export function SkeletonCard({ height = 200 }: { height?: number }) {
  return (
    <div className="rounded-xl overflow-hidden animate-pulse" style={{ height, background: 'var(--theme-card, white)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--theme-card-border, #e5e7eb)' }}>
      <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--theme-card-border, #e5e7eb)' }}>
        <div>
          <div className="h-4 w-32 rounded mb-1.5" style={{ background: 'var(--theme-skeleton, #e5e7eb)' }} />
          <div className="h-2.5 w-48 rounded" style={{ background: 'var(--theme-skeleton-light, #f3f4f6)' }} />
        </div>
        <div className="h-7 w-20 rounded-lg" style={{ background: 'var(--theme-skeleton-light, #f3f4f6)' }} />
      </div>
      <div className="p-5 space-y-3">
        <div className="h-3 w-full rounded" style={{ background: 'var(--theme-skeleton-light, #f3f4f6)' }} />
        <div className="h-3 w-4/5 rounded" style={{ background: 'var(--theme-skeleton-light, #f3f4f6)' }} />
        <div className="h-3 w-3/5 rounded" style={{ background: 'var(--theme-skeleton-light, #f3f4f6)' }} />
        <div className="h-20 w-full rounded-lg mt-4" style={{ background: 'var(--theme-skeleton-subtle, #f9fafb)' }} />
      </div>
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="rounded-xl border-l-4 p-5 animate-pulse" style={{ background: 'var(--theme-card, white)', borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--theme-card-border, #e5e7eb)', borderLeftColor: 'var(--theme-skeleton, #d1d5db)' }}>
      <div className="h-2.5 w-20 rounded mb-3" style={{ background: 'var(--theme-skeleton, #e5e7eb)' }} />
      <div className="h-7 w-24 rounded mb-2" style={{ background: 'var(--theme-skeleton, #e5e7eb)' }} />
      <div className="h-4 w-28 rounded-full" style={{ background: 'var(--theme-skeleton-light, #f3f4f6)' }} />
    </div>
  );
}

export function SkeletonMap() {
  return (
    <div className="rounded-xl overflow-hidden animate-pulse h-[300px] lg:h-[480px]" style={{ borderWidth: 1, borderStyle: 'solid', borderColor: 'var(--theme-card-border, #e5e7eb)' }}>
      <div className="h-full w-full flex items-center justify-center" style={{ background: 'var(--theme-skeleton-subtle, #f0f2f5)' }}>
        <div className="text-center">
          <div className="h-8 w-8 rounded-lg mx-auto mb-3" style={{ background: 'var(--theme-skeleton, #e5e7eb)' }} />
          <div className="h-3 w-24 rounded mx-auto" style={{ background: 'var(--theme-skeleton, #e5e7eb)' }} />
        </div>
      </div>
    </div>
  );
}
