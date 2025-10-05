export function PlaylistCardSkeleton() {
  return (
    <div className="group relative rounded-2xl p-[4px] bg-gradient-to-br from-white/45 via-white/20 to-transparent shadow-[0_0_50px_rgba(35,35,35,0.3)] ring-2 ring-white/30">
      {/* Soft external glow */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-transparent" />

      {/* Subtle inner border */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15" />

      {/* Corner accents */}
      <span className="pointer-events-none absolute top-3 left-3 h-px w-8 bg-white/40" />
      <span className="pointer-events-none absolute top-3 left-3 h-8 w-px bg-white/40" />
      <span className="pointer-events-none absolute top-3 right-3 h-px w-8 bg-white/40" />
      <span className="pointer-events-none absolute top-3 right-3 h-8 w-px bg-white/40" />
      <span className="pointer-events-none absolute bottom-3 left-3 h-px w-8 bg-white/30" />
      <span className="pointer-events-none absolute bottom-3 left-3 h-8 w-px bg-white/30" />
      <span className="pointer-events-none absolute bottom-3 right-3 h-px w-8 bg-white/30" />
      <span className="pointer-events-none absolute bottom-3 right-3 h-8 w-px bg-white/30" />

      {/* Content card */}
      <div className="relative overflow-hidden rounded-[16px] bg-background ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)]">
        {/* Cover Image Skeleton */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>

        {/* Content Skeleton */}
        <div className="p-6 space-y-4">
          {/* Genre badge skeleton */}
          <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
          
          {/* Title skeleton */}
          <div className="h-7 w-3/4 bg-white/10 rounded animate-pulse" />
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Buttons skeleton */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="h-10 w-full bg-white/10 rounded animate-pulse" />
            <div className="h-10 w-full bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
