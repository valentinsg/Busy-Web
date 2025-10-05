export function PlaylistDetailSkeleton() {
  return (
    <div className="min-h-screen bg-black font-body py-8 sm:py-14 md:py-18 lg:py-18">
      {/* Header */}
      <div className="backdrop-blur-md sticky top-0 z-10">
        <div className="container px-4 sm:px-6 py-4 sm:py-8">
          <div className="h-9 w-32 bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Content */}
      <section>
        <div className="container px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 mb-8 sm:mb-12">
              {/* Cover Image Skeleton */}
              <div className="relative w-full md:w-48 lg:w-64 aspect-square rounded-2xl overflow-hidden bg-white/5 ring-2 ring-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </div>

              {/* Info Skeleton */}
              <div className="flex-1 flex flex-col justify-center space-y-4">
                {/* Genre badge */}
                <div className="h-6 w-24 bg-white/10 rounded-full animate-pulse" />
                
                {/* Title */}
                <div className="h-12 w-3/4 bg-white/10 rounded animate-pulse" />
                
                {/* Description */}
                <div className="space-y-2">
                  <div className="h-5 w-full bg-white/10 rounded animate-pulse" />
                  <div className="h-5 w-5/6 bg-white/10 rounded animate-pulse" />
                </div>

                {/* Button */}
                <div className="h-12 w-48 bg-white/10 rounded animate-pulse" />
              </div>
            </div>

            {/* Player Skeleton */}
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10 bg-gradient-to-br from-white/5 via-black to-white/5 p-1">
              <div className="rounded-xl overflow-hidden bg-black/50 backdrop-blur-sm">
                <div className="h-[380px] sm:h-[450px] md:h-[500px] lg:h-[600px] bg-white/5 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 bg-white/10 rounded-full mx-auto animate-pulse" />
                    <div className="h-4 w-48 bg-white/10 rounded mx-auto animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card Skeleton */}
            <div className="mt-8 sm:mt-10 md:mt-12 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
              <div className="h-6 w-48 bg-white/10 rounded mb-3 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
