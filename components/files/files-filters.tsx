'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { ArchiveFilters as ArchiveFiltersType } from '@/types/files';
import { Filter, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ArchiveFiltersProps {
  initialFilters: ArchiveFiltersType;
  places: string[];
  moods: string[];
}

export function ArchiveFilters({ initialFilters: _initialFilters, places, moods }: ArchiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!searchParams) {
    return null;
  }

  // Get current filters from URL
  const currentFilters = {
    color: searchParams.get('color') || '',
    mood: searchParams.getAll('mood'),
    tags: searchParams.getAll('tags'),
    place: searchParams.get('place') || '',
    person: searchParams.get('person') || '',
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(currentFilters).some(
    (filter) => (Array.isArray(filter) ? filter.length > 0 : Boolean(filter))
  );

  // Update URL with new filters
  const updateFilters = (newFilters: Partial<ArchiveFiltersType>) => {
    const params = new URLSearchParams();

    // Keep existing filters
    if (currentFilters.color) params.set('color', currentFilters.color);
    if (currentFilters.place) params.set('place', currentFilters.place);
    if (currentFilters.person) params.set('person', currentFilters.person);
    currentFilters.mood.forEach(mood => params.append('mood', mood));
    currentFilters.tags.forEach(tag => params.append('tags', tag));

    // Apply new filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Remove all existing values for this key
        params.delete(key as string);
        // Add new values
        value.forEach(v => params.append(key as string, v));
      } else if (value) {
        params.set(key as string, value as string);
      } else {
        params.delete(key as string);
      }
    });

    // Reset pagination when filters change
    params.delete('page');

    router.push(`/archive?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    router.push('/archive');
  };

  // Toggle a filter value (only for array-based filters)
  const toggleFilter = (key: 'mood' | 'tags', value: string) => {
    const current = Array.isArray(currentFilters[key])
      ? [...(currentFilters[key] as string[])]
      : [];

    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];

    updateFilters({ [key]: newValue });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 font-body"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="px-1.5 font-body">
                  {Object.values(currentFilters).reduce(
                    (count, val) => count + (Array.isArray(val) ? val.length : val ? 1 : 0),
                    0
                  )}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="center"
            side="bottom"
            sideOffset={8}
            className="w-[calc(100vw-2rem)] max-w-xs sm:w-64 p-4 space-y-4 mx-auto"
          >
            <div className="space-y-2">
              <Label className="font-body text-xs">Mood</Label>
              <div className="flex flex-wrap gap-2">
                {moods.slice(0, 5).map((mood) => (
                  <Badge
                    key={mood}
                    variant={currentFilters.mood.includes(mood) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleFilter('mood', mood)}
                  >
                    {mood}
                  </Badge>
                ))}
                {moods.length > 5 && (
                  <Badge variant="outline" className="cursor-pointer">
                    +{moods.length - 5} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-body text-xs">Lugar</Label>
              <select
                value={currentFilters.place || ''}
                onChange={(e) => updateFilters({ place: e.target.value || undefined })}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 font-body text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todos los lugares</option>
                {places.map((place) => (
                  <option key={place} value={place}>
                    {place}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="font-body text-xs">Persona</Label>
              <Input
                placeholder="Filtrar por persona"
                value={currentFilters.person}
                onChange={(e) => updateFilters({ person: e.target.value || undefined })}
                className="h-9 font-body"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-body text-xs">Color</Label>
              <div className="flex gap-2">
                {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                      currentFilters.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => updateFilters({ color: currentFilters.color === color ? undefined : color })}
                    aria-label={`Filter by color ${color}`}
                  />
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 font-body"
                onClick={clearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {currentFilters.color && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: currentFilters.color }}
                />
                Color
                <button
                  onClick={() => updateFilters({ color: undefined })}
                  className="ml-1 p-0.5 hover:bg-muted rounded-full"
                  aria-label="Remove color filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {currentFilters.mood.map((mood) => (
              <Badge
                key={mood}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {mood}
                <button
                  onClick={() => toggleFilter('mood', mood)}
                  className="ml-1 p-0.5 hover:bg-muted rounded-full"
                  aria-label={`Remove ${mood} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {currentFilters.place && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
              >
                Place: {currentFilters.place}
                <button
                  onClick={() => updateFilters({ place: undefined })}
                  className="ml-1 p-0.5 hover:bg-muted rounded-full"
                  aria-label="Remove place filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {currentFilters.person && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
              >
                Person: {currentFilters.person}
                <button
                  onClick={() => updateFilters({ person: undefined })}
                  className="ml-1 p-0.5 hover:bg-muted rounded-full"
                  aria-label="Remove person filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 font-body text-xs text-muted-foreground"
              onClick={clearFilters}
            >
              Limpiar todo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
