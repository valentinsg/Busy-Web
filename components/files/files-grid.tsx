'use client';

import { ArchiveEntry, ArchiveFilters } from '@/types/files';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { FilesItem } from './files-item';

export function FilesGrid({ filters }: { filters: ArchiveFilters }) {
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
    queryKey: ['files-entries', filters],
    queryFn: async ({ pageParam }) => {
      const page = (pageParam as number | undefined) ?? 1;
      const pageSize = 12; // items per page

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      if (filters.color) params.set('color', filters.color);
      if (filters.mood?.length) filters.mood.forEach((m) => params.append('mood', m));
      if (filters.tags?.length) filters.tags.forEach((t) => params.append('tags', t));
      if (filters.place) params.set('place', filters.place);
      if (filters.person) params.set('person', filters.person);
      if (filters.search) params.set('search', filters.search);

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
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
      ))}
    </div>;
  }

  if (isError) {
    return <div>Error: {error instanceof Error ? error.message : 'Error loading files entries'}</div>;
  }

  const pages = (data?.pages ?? []) as unknown as { data: ArchiveEntry[] }[];
  const entries: ArchiveEntry[] = pages.flatMap((page) => page.data);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No entries found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {entries.map((entry) => (
          <FilesItem key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Loading indicator at the bottom */}
      <div ref={ref} className="h-20 flex items-center justify-center">
        {isFetchingNextPage ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        ) : hasNextPage ? (
          <button
            onClick={() => fetchNextPage()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Load more
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">No more entries to load</p>
        )}
      </div>
    </div>
  );
}
