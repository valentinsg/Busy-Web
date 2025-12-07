'use client';

import { ArchiveEntry } from '@/types/archive';
import useSWR from 'swr';
import { ArchiveItem } from './archive-item';

interface RecommendationRowProps {
  entryId: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function RecommendationRow({ entryId }: RecommendationRowProps) {
  const { data, error } = useSWR<{ entry_id: string; score: number; entry: ArchiveEntry }[]>(
    `/api/archive/recommend?id=${entryId}&limit=8`,
    fetcher,
  );

  if (error) {
    return null;
  }

  const recommendations = data?.map((r) => r.entry).filter(Boolean) ?? [];

  if (!recommendations.length) return null;

  return (
    <div className="mt-8 space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">También puede gustarte</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {recommendations.map((entry: ArchiveEntry) => (
          <ArchiveItem key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
