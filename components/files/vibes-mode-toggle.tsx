'use client';

import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface VibesModeToggleProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

export function VibesModeToggle({ enabled, onToggle }: VibesModeToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!enabled)}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        enabled ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' : 'border-border bg-background hover:bg-muted',
      )}
    >
      <Sparkles className="h-4 w-4" />
      <span>Vibes mode</span>
    </button>
  );
}
