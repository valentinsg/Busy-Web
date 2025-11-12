'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function FixtureSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </CardContent>
      </Card>

      {/* Groups Skeleton */}
      {[1, 2].map((group) => (
        <Card key={group}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((match) => (
              <div key={match} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between gap-4">
                  {/* Team A */}
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>

                  {/* VS */}
                  <Skeleton className="h-4 w-8" />

                  {/* Team B */}
                  <div className="flex-1 text-right">
                    <Skeleton className="h-5 w-32 mb-2 ml-auto" />
                    <Skeleton className="h-3 w-16 ml-auto" />
                  </div>

                  {/* Button */}
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StandingsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((group) => (
        <Card key={group}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Header */}
              <div className="flex gap-4 pb-2 border-b">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
              
              {/* Rows */}
              {[1, 2, 3, 4].map((row) => (
                <div key={row} className="flex gap-4 py-3 border-b">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
