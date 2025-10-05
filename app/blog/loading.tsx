import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mt-20 px-4 sm:px-3 py-6 sm:py-8 font-body">
      <div className="mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-4 sm:mb-6">
          <Skeleton className="h-10 sm:h-12 w-64 mx-auto mb-3" />
          <Skeleton className="h-6 w-96 max-w-full mx-auto" />
        </div>

        {/* Categories + Search Skeleton */}
        <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-4 sm:px-3">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="max-w-xl mx-auto w-full mt-6">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-4">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Post Skeleton */}
            <div className="mb-8 sm:mb-10">
              <Skeleton className="h-8 w-48 mb-6" />
              <Card className="overflow-hidden rounded-xl">
                <Skeleton className="aspect-[16/9] w-full" />
                <CardContent className="p-4 sm:p-6">
                  <Skeleton className="h-6 w-24 mb-4" />
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-20 w-full mb-6" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Posts Grid Skeleton */}
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-5 w-24" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden rounded-xl">
                    <Skeleton className="aspect-[16/9] w-full" />
                    <CardContent className="p-4 sm:p-5">
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-6 w-3/4 mb-3" />
                      <Skeleton className="h-16 w-full mb-4" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <Card className="rounded-xl p-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-32 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
