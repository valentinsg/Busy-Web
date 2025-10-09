export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPIs Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="h-3 w-24 bg-muted rounded mb-3" />
            <div className="h-8 w-32 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="h-[320px] bg-muted/30 rounded" />
      </div>

      {/* Donut Chart Skeleton */}
      <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <div className="h-5 w-40 bg-muted rounded" />
        <div className="flex items-center justify-center h-[280px]">
          <div className="w-[200px] h-[200px] rounded-full bg-muted/30" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <div className="p-4 bg-muted/40">
          <div className="h-4 w-40 bg-muted rounded" />
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex gap-4">
              <div className="h-4 flex-1 bg-muted/50 rounded" />
              <div className="h-4 w-16 bg-muted/50 rounded" />
              <div className="h-4 w-24 bg-muted/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
