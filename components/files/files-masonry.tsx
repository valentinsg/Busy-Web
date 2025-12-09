'use client';

import { cn } from '@/lib/utils';
import { ArchiveEntry, ArchiveFilters } from '@/types/files';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { FilesItem } from './files-item';

interface FilesMasonryProps {
  filters: ArchiveFilters;
}

// Batch preload URLs for visible images
async function preloadImageUrls(entries: ArchiveEntry[]): Promise<void> {
  const keys: string[] = [];

  for (const entry of entries) {
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
    // Silently fail
  }
}

// Skeleton aspect ratios for loading state - varied like Pinterest
const SKELETON_ASPECTS = [
  'aspect-[3/4]',
  'aspect-square',
  'aspect-[2/3]',
  'aspect-[4/3]',
  'aspect-square',
  'aspect-[3/4]',
  'aspect-[16/10]',
  'aspect-[2/3]',
  'aspect-square',
  'aspect-[3/4]',
  'aspect-[4/3]',
  'aspect-[2/3]',
];

export function FilesMasonry({ filters }: FilesMasonryProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['files-entries-masonry', filters],
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
      // Always send sort parameter to ensure consistent ordering
      params.set('sort', filters.sort || 'newest');

      const res = await fetch(`/api/files/list?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load files entries');
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

  // Track preloaded pages - must be before any conditional returns
  const preloadedPages = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  // Derive data from query result
  const pages = (data?.pages ?? []) as unknown as { data: ArchiveEntry[] }[];
  const entries: ArchiveEntry[] = pages.flatMap((page) => page.data);
  const pagesCount = pages.length;

  // Preload URLs for new pages
  useEffect(() => {
    if (pagesCount === 0 || entries.length === 0) return;
    if (preloadedPages.current.has(pagesCount)) return;

    preloadedPages.current.add(pagesCount);
    // Only preload last batch (new page)
    const lastPageEntries = entries.slice(-16);
    if (lastPageEntries.length > 0) {
      preloadImageUrls(lastPageEntries);
    }
  }, [pagesCount, entries.length]); // Use .length to avoid re-running on same data

  if (isLoading) {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4">
        {SKELETON_ASPECTS.map((aspect, i) => (
          <div
            key={i}
            className={cn(
              aspect,
              'relative overflow-hidden rounded-xl bg-muted/50 mb-3 md:mb-4 break-inside-avoid'
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

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-destructive">
          Error: {error instanceof Error ? error.message : 'No se pudo cargar el archivo.'}
        </p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-body text-muted-foreground">
          No se encontraron entradas. Probá ajustando los filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* True CSS columns masonry - items flow naturally without gaps */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4">
        {entries.map((entry: ArchiveEntry) => (
          <div key={entry.id} className="mb-3 md:mb-4 break-inside-avoid">
            <FilesItem entry={entry} />
          </div>
        ))}
      </div>

      {/* Loading indicator at the bottom */}
      <div ref={ref} className="h-16 flex items-center justify-center">
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
            — Fin de los files —
          </p>
        ) : null}
      </div>
    </div>
  );
}
