export function TournamentHeaderSkeleton() {
  return (
    <div className="relative h-[420px] sm:h-[480px] md:h-[540px] bg-black overflow-hidden animate-pulse">
      {/* Banner skeleton */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.02]" />
      
      {/* Content skeleton */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 sm:pb-16 md:pb-20">
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 text-center">
          {/* CTA skeleton */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="h-14 w-64 bg-white/10 rounded-xl" />
            <div className="h-4 w-48 bg-white/5 rounded" />
          </div>

          {/* Info bar skeleton */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 px-6 py-4 rounded-2xl bg-white/10 border border-white/10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-white/5 rounded" />
                    <div className="h-4 w-24 bg-white/10 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TournamentDashboardSkeleton() {
  return (
    <div className="space-y-6 font-body animate-pulse">
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="space-y-3">
              <div className="h-8 w-16 bg-white/10 rounded mx-auto" />
              <div className="h-3 w-20 bg-white/5 rounded mx-auto" />
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid skeleton */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 sm:p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-white/10 rounded-lg" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-white/10 rounded" />
                <div className="h-3 w-24 bg-white/5 rounded" />
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 bg-white/5 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamCardSkeleton() {
  return (
    <div className="relative bg-white/5 border border-white/10 rounded-xl overflow-hidden animate-pulse">
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10" />
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-20 bg-white/10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-32 bg-white/10 rounded" />
            <div className="h-4 w-20 bg-white/5 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-5 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TeamProfileSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white font-body animate-pulse">
      <div className="container mx-auto px-4 pt-20 pb-12 max-w-6xl">
        {/* Back button skeleton */}
        <div className="h-9 w-32 bg-white/10 rounded mb-6" />

        {/* Header skeleton */}
        <div className="relative mb-8 p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10" />
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/10 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 bg-white/10 rounded" />
              <div className="h-4 w-64 bg-white/5 rounded" />
              <div className="h-3 w-40 bg-white/5 rounded" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="space-y-2">
                <div className="h-8 w-12 bg-white/10 rounded mx-auto" />
                <div className="h-3 w-16 bg-white/5 rounded mx-auto" />
              </div>
            </div>
          ))}
        </div>

        {/* Players skeleton */}
        <div className="relative mb-8 p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/10 rounded-lg" />
            <div className="h-6 w-24 bg-white/10 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Matches skeleton */}
        <div className="relative p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/10 rounded-lg" />
            <div className="h-6 w-32 bg-white/10 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
