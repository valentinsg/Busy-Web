'use client';

import { cn } from '@/lib/utils';
import { Film } from 'lucide-react';

interface FilmStripToggleProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

export function FilmStripToggle({ enabled, onToggle }: FilmStripToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!enabled)}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        enabled ? 'border-sky-400/40 bg-sky-400/10 text-sky-300' : 'border-border bg-background hover:bg-muted',
      )}
    >
      <Film className="h-4 w-4" />
      <span>Film strip</span>
    </button>
  );
}
