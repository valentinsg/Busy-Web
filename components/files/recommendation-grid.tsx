'use client';

import { cn } from '@/lib/utils';
import { ArchiveEntry } from '@/types/files';
import { useQuery } from '@tanstack/react-query';
import { FilesItem } from './files-item';

interface RecommendationGridProps {
  entryId: string;
}

// Same skeleton aspects as archive-masonry for consistency
const SKELETON_ASPECTS = [
  'aspect-[3/4]',    // tall
  'aspect-square',   // square
  'aspect-[2/3]',    // portrait
  'aspect-[4/3]',    // wide
  'aspect-square',   // square
  'aspect-[3/4]',    // tall
  'aspect-[16/10]',  // landscape
  'aspect-[2/3]',    // portrait
  'aspect-[3/4]',    // tall
  'aspect-square',   // square
  'aspect-[2/3]',    // portrait
  'aspect-[4/3]',    // wide
];

async function fetchRecommendations(entryId: string): Promise<ArchiveEntry[]> {
  const res = await fetch(`/api/files/recommend?id=${entryId}&limit=24`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  const data = await res.json();
  // API returns array directly or { recommendations: [] }
  return Array.isArray(data) ? data : (data.recommendations || []);
}

export function RecommendationGrid({ entryId }: RecommendationGridProps) {
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', entryId],
    queryFn: () => fetchRecommendations(entryId),
    staleTime: 1000 * 60 * 10, // 10 minutes - recommendations rarely change
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab focus
  });

  if (isLoading) {
    // Masonry-style skeleton using CSS columns
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
        {SKELETON_ASPECTS.map((aspect, i) => (
          <div
            key={i}
            className={cn(
              aspect,
              'relative overflow-hidden rounded-xl bg-muted/50 mb-3 break-inside-avoid'
            )}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Fake content placeholders */}
            <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
              <div className="h-2 w-3/4 rounded-full bg-white/5" />
              <div className="h-2 w-1/2 rounded-full bg-white/5" />
            </div>

            {/* Fake tag */}
            <div className="absolute top-2 left-2">
              <div className="h-4 w-12 rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
      {recommendations.map((rec) => (
        <div key={rec.id} className="mb-3 break-inside-avoid">
          <FilesItem entry={rec} />
        </div>
      ))}
    </div>
  );
}
