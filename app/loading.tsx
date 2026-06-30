import { SkeletonKPI, SkeletonCard } from '@/components/Skeleton';

/**
 * Route-level loading fallback. Rendered by the App Router during navigation /
 * data fetch so users get a theme-aware skeleton instead of a blank frame.
 */
export default function Loading() {
  return (
    <div className="p-6 space-y-6" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonKPI key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard height={260} />
        <SkeletonCard height={260} />
      </div>
    </div>
  );
}
