'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ArchiveFilters } from '@/types/files';
import { ArrowDownUp, ArrowLeft, Home, Search, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState, useTransition } from 'react';

interface FilesSearchProps {
  places: string[];
  colors: string[];
  showFilters?: boolean;
  showBackButton?: boolean;
  backHref?: string;
}

export function FilesSearch({ places, colors, showFilters = true, showBackButton = false, backHref = '/files' }: FilesSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for search input (debounced)
  const [searchValue, setSearchValue] = useState(
    searchParams?.get('q') || ''
  );

  // Get current filters from URL (memoized for stable dependencies)
  const currentFilters = useMemo(
    () => ({
      q: searchParams?.get('q') || '',
      color: searchParams?.get('color') || '',
      mood: searchParams?.getAll('mood') || [],
      place: searchParams?.get('place') || '',
      sort: (searchParams?.get('sort') as 'newest' | 'oldest') || 'newest',
    }),
    [searchParams]
  );

  // Check if any filters are active
  const hasActiveFilters =
    currentFilters.q ||
    (showFilters && (
      currentFilters.color ||
      currentFilters.mood.length > 0 ||
      currentFilters.place ||
      currentFilters.sort === 'oldest'
    ));

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters: Partial<ArchiveFilters & { q?: string }>) => {
      const params = new URLSearchParams();

      // Keep existing filters
      if (currentFilters.q && !('q' in newFilters)) params.set('q', currentFilters.q);
      if (currentFilters.color && !('color' in newFilters)) params.set('color', currentFilters.color);
      if (currentFilters.place && !('place' in newFilters)) params.set('place', currentFilters.place);
      if (currentFilters.sort && currentFilters.sort !== 'newest' && !('sort' in newFilters)) params.set('sort', currentFilters.sort);
      if (!('mood' in newFilters)) {
        currentFilters.mood.forEach((m) => params.append('mood', m));
      }

      // Apply new filters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.delete(key);
          value.forEach((v) => params.append(key, v));
        } else if (value) {
          params.set(key, value as string);
        } else {
          params.delete(key);
        }
      });

      startTransition(() => {
        router.push(`/files?${params.toString()}`);
      });
    },
    [currentFilters, router]
  );

  // Run search (used by Enter and button)
  const runSearch = () => {
    const trimmed = searchValue.trim();
    if (trimmed === currentFilters.q) return;
    updateFilters({ q: trimmed || undefined });
  };

  // Submit handler: only search on Enter / submit
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    runSearch();
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchValue('');
    startTransition(() => {
      router.push('/files');
    });
  };

  // Toggle mood filter
  const toggleMood = (mood: string) => {
    const current = [...currentFilters.mood];
    const newMoods = current.includes(mood)
      ? current.filter((m) => m !== mood)
      : [...current, mood];
    updateFilters({ mood: newMoods.length ? newMoods : undefined });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar - Pinterest style */}
      <div className="relative flex items-center gap-2">
        {showBackButton && (
          <div className="hidden md:flex items-center gap-1">
            {/* Back button */}
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  router.push(backHref);
                }
              }}
              className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Volver atrás"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            {/* Archive home button */}
            <Link
              href={backHref}
              className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Ir al archivo"
            >
              <Home className="h-4 w-4" />
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar... noche, básquet, Mar del Plata, Busy..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-4 h-11 font-body text-sm bg-muted/50 border-0 rounded-full focus-visible:ring-1"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </form>

        <Button
          type="button"
          size="sm"
          className="h-11 px-4 rounded-full font-body text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={runSearch}
          disabled={!searchValue.trim()}
        >
          Buscar
        </Button>

        {showFilters && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  'h-11 w-11 rounded-full border-0 bg-muted/50',
                  hasActiveFilters && 'bg-primary text-primary-foreground'
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4 space-y-4" align="end">
            {/* Places */}
            {places.length > 0 && (
              <div className="space-y-2">
                <p className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Lugar
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {places.slice(0, 8).map((place) => (
                    <Badge
                      key={place}
                      variant={currentFilters.place === place ? 'default' : 'outline'}
                      className="cursor-pointer font-body text-xs"
                      onClick={() =>
                        updateFilters({
                          place: currentFilters.place === place ? undefined : place,
                        })
                      }
                    >
                      {place}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Colors - Dynamic from DB */}
            {colors.length > 0 && (
              <div className="space-y-2">
                <p className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Color dominante
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        'h-7 w-7 rounded-full border-2 transition-all hover:scale-110',
                        currentFilters.color === color
                          ? 'ring-2 ring-offset-2 ring-primary border-white'
                          : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        updateFilters({
                          color: currentFilters.color === color ? undefined : color,
                        })
                      }
                      aria-label={`Filtrar por color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sort Order */}
            <div className="space-y-2">
              <p className="font-body text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <ArrowDownUp className="inline h-3 w-3 mr-1" />
                Ordenar por fecha
              </p>
              <div className="flex gap-1.5">
                <Badge
                  variant={currentFilters.sort === 'newest' ? 'default' : 'outline'}
                  className="cursor-pointer font-body text-xs"
                  onClick={() => updateFilters({ sort: 'newest' })}
                >
                  Más recientes
                </Badge>
                <Badge
                  variant={currentFilters.sort === 'oldest' ? 'default' : 'outline'}
                  className="cursor-pointer font-body text-xs"
                  onClick={() => updateFilters({ sort: 'oldest' })}
                >
                  Más antiguos
                </Badge>
              </div>
            </div>

              {/* Clear */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full font-body text-xs"
                  onClick={clearFilters}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Limpiar filtros
                </Button>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters Pills */}
      {showFilters && hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {currentFilters.q && (
            <Badge variant="secondary" className="font-body text-xs gap-1 pr-1">
              &quot;{currentFilters.q}&quot;
              <button
                onClick={() => {
                  setSearchValue('');
                  updateFilters({ q: undefined });
                }}
                className="ml-1 p-0.5 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentFilters.color && (
            <Badge variant="secondary" className="font-body text-xs gap-1.5 pr-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentFilters.color }}
              />
              Color
              <button
                onClick={() => updateFilters({ color: undefined })}
                className="ml-1 p-0.5 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentFilters.mood.map((mood) => (
            <Badge key={mood} variant="secondary" className="font-body text-xs gap-1 pr-1">
              {mood}
              <button
                onClick={() => toggleMood(mood)}
                className="ml-1 p-0.5 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {currentFilters.place && (
            <Badge variant="secondary" className="font-body text-xs gap-1 pr-1">
              📍 {currentFilters.place}
              <button
                onClick={() => updateFilters({ place: undefined })}
                className="ml-1 p-0.5 hover:bg-muted rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <button
            onClick={clearFilters}
            className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="flex justify-center">
          <div className="h-1 w-16 bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
