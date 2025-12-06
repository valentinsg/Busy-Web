'use client';

import { Share2 } from 'lucide-react';

interface BusyCardButtonProps {
  entryId: string;
}

export function BusyCardButton({ entryId }: BusyCardButtonProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/api/archive/share-card?id=${entryId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
    >
      <Share2 className="h-4 w-4" />
      <span>Busy Share Card</span>
    </button>
  );
}
