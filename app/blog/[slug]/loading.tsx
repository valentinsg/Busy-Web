export default function BlogPostLoading() {
  return (
    <div className="container py-8 pt-20">
      <div className="max-w-4xl mx-auto animate-pulse">
        {/* Back button skeleton */}
        <div className="h-9 w-28 bg-muted rounded mb-8" />

        {/* Chips */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-muted rounded" />
          <div className="h-6 w-20 bg-muted rounded" />
          <div className="h-6 w-14 bg-muted rounded" />
        </div>

        {/* Title */}
        <div className="h-10 bg-muted rounded w-4/5 mb-3" />
        <div className="h-6 bg-muted rounded w-3/5 mb-8" />

        {/* Meta row */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
          <div className="h-5 w-24 bg-muted rounded" />
          <div className="h-5 w-28 bg-muted rounded" />
          <div className="h-5 w-20 bg-muted rounded" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-5 bg-muted rounded" />
          <div className="h-5 bg-muted rounded w-11/12" />
          <div className="h-5 bg-muted rounded w-10/12" />
          <div className="h-64 bg-muted rounded my-6" />
          <div className="h-5 bg-muted rounded w-9/12" />
          <div className="h-5 bg-muted rounded w-8/12" />
          <div className="h-5 bg-muted rounded w-10/12" />
        </div>
      </div>
    </div>
  )
}
