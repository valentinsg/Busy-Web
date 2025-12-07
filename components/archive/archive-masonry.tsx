'use client';

import { cn } from '@/lib/utils';
import { ArchiveEntry, ArchiveFilters } from '@/types/archive';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { ArchiveItem, AspectRatioVariant } from './archive-item';

interface ArchiveMasonryProps {
  filters: ArchiveFilters;
}

const COLUMN_CONFIG = {
  mobile: 2,
  tablet: 3,
  desktop: 4,
};

// Pinterest-style aspect ratio patterns for visual variety
const ASPECT_PATTERNS: AspectRatioVariant[][] = [
  ['portrait', 'square', 'tall', 'landscape'],
  ['tall', 'portrait', 'square', 'wide'],
  ['square', 'tall', 'portrait', 'square'],
  ['landscape', 'square', 'portrait', 'tall'],
];

/**
 * Get a consistent aspect ratio for an entry based on its ID
 * This ensures the same entry always gets the same aspect ratio
 */
function getAspectRatio(entryId: string, index: number): AspectRatioVariant {
  // Use a simple hash of the ID to pick a pattern row
  const hash = entryId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const patternRow = hash % ASPECT_PATTERNS.length;
  const patternCol = index % ASPECT_PATTERNS[0].length;
  return ASPECT_PATTERNS[patternRow][patternCol];
}

// Skeleton aspect ratios for loading state - varied like Pinterest
const SKELETON_ASPECTS = [
  'aspect-[3/4]',    // tall
  'aspect-square',   // square
  'aspect-[2/3]',    // portrait
  'aspect-[4/3]',    // wide
  'aspect-square',   // square
  'aspect-[3/4]',    // tall
  'aspect-[16/10]',  // landscape
  'aspect-[2/3]',    // portrait
  'aspect-square',   // square
  'aspect-[3/4]',    // tall
  'aspect-[4/3]',    // wide
  'aspect-[2/3]',    // portrait
];

export function ArchiveMasonry({ filters }: ArchiveMasonryProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const [columns, setColumns] = useState(COLUMN_CONFIG.desktop);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive column detection
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width < 768) {
          setColumns(COLUMN_CONFIG.mobile);
        } else if (width < 1024) {
          setColumns(COLUMN_CONFIG.tablet);
        } else {
          setColumns(COLUMN_CONFIG.desktop);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['archive-entries-masonry', filters],
    queryFn: async ({ pageParam }) => {
      const page = (pageParam as number | undefined) ?? 1;
      const pageSize = 16; // Reduced for better performance

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      if (filters.color) params.set('color', filters.color);
      if (filters.mood?.length) filters.mood.forEach((m) => params.append('mood', m));
      if (filters.tags?.length) filters.tags.forEach((t) => params.append('tags', t));
      if (filters.place) params.set('place', filters.place);
      if (filters.person) params.set('person', filters.person);
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`/api/archive/list?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load archive entries');
      }

      const json = await res.json();
      return json as { data: ArchiveEntry[]; hasMore: boolean; nextCursor?: string };
    },
    getNextPageParam: (lastPage: { hasMore: boolean }, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes - prevent refetches
    gcTime: 1000 * 60 * 30, // 30 minutes cache
    refetchOnWindowFocus: false, // Don't refetch on tab focus
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  if (isLoading) {
    // Distribute skeletons across columns like real masonry
    const skeletonColumns: number[][] = Array.from({ length: columns }, () => []);
    SKELETON_ASPECTS.forEach((_, i) => {
      skeletonColumns[i % columns].push(i);
    });

    return (
      <div
        className="gap-3 md:gap-4"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          alignItems: 'start',
        }}
      >
        {skeletonColumns.map((colItems, colIndex) => (
          <div key={colIndex} className="space-y-3 md:space-y-4">
            {colItems.map((itemIndex) => (
              <div
                key={itemIndex}
                className={cn(
                  SKELETON_ASPECTS[itemIndex],
                  'relative overflow-hidden rounded-xl bg-muted/50'
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
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-destructive">
          Error: {error instanceof Error ? error.message : 'No se pudo cargar el archivo.'}
        </p>
      </div>
    );
  }

  const pages = (data?.pages ?? []) as unknown as { data: ArchiveEntry[] }[];
  const entries: ArchiveEntry[] = pages.flatMap((page) => page.data);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-muted-foreground">
          No se encontraron entradas. Probá ajustando los filtros.
        </p>
      </div>
    );
  }

  // Distribute entries across columns for masonry effect
  // Track index per entry for consistent aspect ratio assignment
  const columnArrays: { entry: ArchiveEntry; globalIndex: number }[][] = Array.from(
    { length: columns },
    () => []
  );
  entries.forEach((entry: ArchiveEntry, index: number) => {
    columnArrays[index % columns].push({ entry, globalIndex: index });
  });

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="gap-3 md:gap-4"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          alignItems: 'start',
        }}
      >
        {columnArrays.map((column, colIndex) => (
          <div key={colIndex} className="space-y-3 md:space-y-4">
            {column.map(({ entry, globalIndex }) => (
              <ArchiveItem
                key={entry.id}
                entry={entry}
                aspectRatio={getAspectRatio(entry.id, globalIndex)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Loading indicator at the bottom */}
      <div ref={ref} className="h-16 flex items-center justify-center col-span-full">
        {isFetchingNextPage ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground" />
        ) : hasNextPage ? (
          <button
            onClick={() => fetchNextPage()}
            className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cargar más
          </button>
        ) : entries.length > 0 ? (
          <p className="font-body text-xs text-muted-foreground/60">
            — Fin del archivo —
          </p>
        ) : null}
      </div>
    </div>
  );
}
