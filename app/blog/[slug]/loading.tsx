import { Skeleton } from "@/components/ui/skeleton"

export default function BlogPostLoading() {
  return (
    <div className="container py-8 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Back button skeleton */}
        <Skeleton className="h-9 w-28 mb-8" />

        {/* Chips */}
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>

        {/* Title */}
        <Skeleton className="h-10 w-4/5 mb-3" />
        <Skeleton className="h-6 w-3/5 mb-8" />

        {/* Meta row */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-11/12" />
          <Skeleton className="h-5 w-10/12" />
          <Skeleton className="h-64 w-full my-6" />
          <Skeleton className="h-5 w-9/12" />
          <Skeleton className="h-5 w-8/12" />
          <Skeleton className="h-5 w-10/12" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-11/12" />
        </div>
      </div>
    </div>
  )
}
