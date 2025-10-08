export function AboutSkeleton() {
  return (
    <div className="flex flex-col font-body animate-pulse">
      {/* Hero Section Skeleton */}
      <section className="relative overflow-hidden">
        <div className="container px-3 sm:px-4 relative z-10 py-12 md:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo skeleton */}
            <div className="flex flex-row items-center justify-center gap-3 mb-2 md:mb-2">
              <div className="h-20 w-20 md:h-28 md:w-28 bg-muted rounded-full" />
            </div>
            {/* Title skeleton */}
            <div className="h-10 md:h-14 bg-muted rounded-lg mb-3 md:mb-4 mx-auto max-w-md" />
            {/* Subtitle skeleton */}
            <div className="space-y-2 max-w-2xl mx-auto">
              <div className="h-6 bg-muted rounded-lg mx-auto max-w-xl" />
              <div className="h-6 bg-muted rounded-lg mx-auto max-w-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Story Section Skeleton */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-3 sm:px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 lg:order-1 space-y-4">
                {/* Title skeleton */}
                <div className="h-10 md:h-12 bg-muted rounded-lg max-w-sm" />
                {/* Paragraphs skeleton */}
                <div className="space-y-3">
                  <div className="h-5 bg-muted rounded-lg" />
                  <div className="h-5 bg-muted rounded-lg" />
                  <div className="h-5 bg-muted rounded-lg max-w-4xl" />
                  <div className="h-5 bg-muted rounded-lg" />
                  <div className="h-5 bg-muted rounded-lg max-w-5xl" />
                </div>
                {/* Button skeleton */}
                <div className="h-11 bg-muted rounded-lg max-w-[200px] mt-6" />
              </div>
              {/* Image skeleton */}
              <div className="order-1 lg:order-2 aspect-square bg-muted rounded-xl md:rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section Skeleton */}
      <section className="relative bg-black">
        <div className="container relative z-10">
          <div className="max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-[3/4] md:aspect-[4/5] lg:aspect-[3/4] bg-muted/20" />
              <div className="aspect-[3/4] md:aspect-[4/5] lg:aspect-[3/4] bg-muted/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section Skeleton */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 md:mb-12">
              <div className="h-10 md:h-12 bg-muted rounded-lg mb-3 md:mb-4 mx-auto max-w-md" />
              <div className="h-6 bg-muted rounded-lg mx-auto max-w-lg" />
            </div>
            <div className="space-y-6 md:space-y-8 pl-8 md:pl-12">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 md:gap-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded-lg max-w-[100px]" />
                    <div className="h-6 bg-muted rounded-lg max-w-xs" />
                    <div className="h-5 bg-muted rounded-lg" />
                    <div className="h-5 bg-muted rounded-lg max-w-4xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="py-16 md:py-24">
        <div className="container px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="h-10 md:h-12 bg-muted rounded-lg mb-4 mx-auto max-w-lg" />
            <div className="h-6 bg-muted rounded-lg mx-auto max-w-xl" />
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <div className="h-11 bg-muted rounded-lg w-full sm:w-40" />
              <div className="h-11 bg-muted rounded-lg w-full sm:w-40" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
