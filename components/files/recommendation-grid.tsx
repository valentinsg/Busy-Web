'use client';

import { cn } from '@/lib/utils';
import { ArchiveEntry } from '@/types/files';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { FilesItem } from './files-item';

// Batch preload URLs for visible images
async function preloadImageUrls(entries: ArchiveEntry[]): Promise<void> {
  const keys: string[] = [];

  for (const entry of entries) {
    // Extract R2 keys from URLs
    const thumbMatch = entry.thumb_url?.match(/https:\/\/[^/]+\.r2\.dev\/(.+)/);
    if (thumbMatch) keys.push(thumbMatch[1]);
  }

  if (keys.length === 0) return;

  try {
    await fetch('/api/files/batch-urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys }),
    });
  } catch {
    // Silently fail - images will load via proxy fallback
  }
}

interface RecommendationGridProps {
  entryId: string;
  showMore?: boolean; // When true, shows full-width grid with more columns
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
];

// Initial items to show, then load more on scroll
const INITIAL_ITEMS = 12;
const ITEMS_PER_LOAD = 12;

async function fetchRecommendations(entryId: string): Promise<ArchiveEntry[]> {
  const res = await fetch(`/api/files/recommend?id=${entryId}&limit=32`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  const data = await res.json();
  // API returns array directly or { recommendations: [] }
  return Array.isArray(data) ? data : (data.recommendations || []);
}

export function RecommendationGrid({ entryId, showMore = false }: RecommendationGridProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', entryId],
    queryFn: () => fetchRecommendations(entryId),
    staleTime: 1000 * 60 * 10, // 10 minutes - recommendations rarely change
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on tab focus
  });

  // Reset visible count when entry changes
  useEffect(() => {
    setVisibleCount(INITIAL_ITEMS);
  }, [entryId]);

  // Load more when scrolling into view
  useEffect(() => {
    if (inView && visibleCount < recommendations.length) {
      setVisibleCount(prev => Math.min(prev + ITEMS_PER_LOAD, recommendations.length));
    }
  }, [inView, visibleCount, recommendations.length]);

  const visibleRecommendations = recommendations.slice(0, visibleCount);

  // Track which batches we've preloaded
  const preloadedBatches = useRef<Set<number>>(new Set());
  const recommendationsLength = recommendations.length;

  // Preload URLs for visible items + next batch
  useEffect(() => {
    if (recommendationsLength === 0) return;

    const currentBatch = Math.floor(visibleCount / ITEMS_PER_LOAD);

    // Preload current batch if not done
    if (!preloadedBatches.current.has(currentBatch)) {
      preloadedBatches.current.add(currentBatch);
      const start = currentBatch * ITEMS_PER_LOAD;
      const batchItems = recommendations.slice(start, start + ITEMS_PER_LOAD);
      if (batchItems.length > 0) {
        preloadImageUrls(batchItems);
      }
    }

    // Preload next batch
    const nextBatch = currentBatch + 1;
    const nextStart = nextBatch * ITEMS_PER_LOAD;
    if (!preloadedBatches.current.has(nextBatch) && nextStart < recommendationsLength) {
      preloadedBatches.current.add(nextBatch);
      const nextItems = recommendations.slice(nextStart, nextStart + ITEMS_PER_LOAD);
      if (nextItems.length > 0) {
        preloadImageUrls(nextItems);
      }
    }
  }, [visibleCount, recommendationsLength]); // Use primitive values to avoid unnecessary re-runs

  const hasMore = visibleCount < recommendations.length;

  if (isLoading) {
    // Masonry skeleton using CSS columns
    return (
      <div className="columns-2 sm:columns-3 gap-2">
        {SKELETON_ASPECTS.map((aspect, i) => (
          <div
            key={i}
            className={cn(
              aspect,
              'relative overflow-hidden rounded-xl bg-muted/50 mb-2 break-inside-avoid'
            )}
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <>
      {/* Masonry layout using CSS columns - items fit like puzzle pieces */}
      <div className="columns-2 sm:columns-3 gap-2">
        {visibleRecommendations.map((rec) => (
          <div key={rec.id} className="mb-2 break-inside-avoid">
            <FilesItem entry={rec} />
          </div>
        ))}
      </div>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="h-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground/30" />
        </div>
      )}
    </>
  );
}
