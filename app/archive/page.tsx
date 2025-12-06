import { ArchiveMasonry } from '@/components/archive/archive-masonry';
import { ArchiveQueryProvider } from '@/components/archive/archive-query-provider';
import { ArchiveSearch } from '@/components/archive/archive-search';
import { ArchiveSkeleton } from '@/components/archive/archive-skeleton';
import { getServiceClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Busy Archive | Cultura, Momentos y Streetwear',
  description: 'Explorá el Busy Archive: momentos, cultura y streetwear de Mar del Plata. Buscá por palabras clave, lugar y color.',
  keywords: ['busy archive', 'busy streetwear', 'cultura urbana', 'mar del plata', 'streetwear argentina'],
  openGraph: {
    title: 'Busy Archive',
    description: 'Una línea de tiempo visual de momentos y cultura Busy',
    type: 'website',
    url: 'https://busy.com.ar/archive',
  },
};

export const revalidate = 3600; // Revalidate every hour

export default async function ArchivePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Extract filters from search params (including search query)
  const filters = {
    search: searchParams?.q as string | undefined,
    color: searchParams?.color as string | undefined,
    mood: typeof searchParams?.mood === 'string' ? [searchParams.mood] : searchParams?.mood as string[] | undefined,
    tags: typeof searchParams?.tags === 'string' ? [searchParams.tags] : searchParams?.tags as string[] | undefined,
    place: searchParams?.place as string | undefined,
    person: searchParams?.person as string | undefined,
  };

  // Get unique values for filters (cached at page level)
  const [uniquePlaces, uniqueMoods, uniqueColors] = await Promise.all([
    getUniquePlaces(),
    getUniqueMoods(),
    getUniqueColors(),
  ]);

  return (
    <ArchiveQueryProvider>
      <div className="min-h-screen pt-20 md:pt-24">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Page Title - More compact */}
          <div className="mb-4 md:mb-6">
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
              Busy Archive
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Momentos, cultura y streetwear. Buscá lo que te inspire.
            </p>
          </div>

          {/* Search & Filters - Pinterest style */}
          <div className="mb-6 md:mb-8">
            <ArchiveSearch
              places={uniquePlaces}
              moods={uniqueMoods}
              colors={uniqueColors}
            />
          </div>

          {/* Masonry Grid */}
          <Suspense fallback={<ArchiveSkeleton />}>
            <ArchiveMasonry filters={filters} />
          </Suspense>
        </div>
      </div>
    </ArchiveQueryProvider>
  );
}

async function getUniquePlaces(): Promise<string[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .schema('archive')
    .from('entries')
    .select('place')
    .not('place', 'is', null)
    .neq('place', '');

  if (error) {
    console.error('Error fetching places:', error);
    return [];
  }

  // Normalize places to avoid duplicates like "Mar del Plata" vs "Mar Del Plata"
  const placesMap = new Map<string, string>();
  data?.forEach((item: any) => {
    const place = item.place as string;
    if (place) {
      const normalized = place.toLowerCase().trim();
      // Keep the first occurrence (or prefer title case)
      if (!placesMap.has(normalized)) {
        placesMap.set(normalized, place);
      }
    }
  });

  return Array.from(placesMap.values());
}

async function getUniqueMoods(): Promise<string[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .schema('archive')
    .from('entries')
    .select('mood');

  if (error) {
    console.error('Error fetching moods:', error);
    return [];
  }

  const allMoods = data?.flatMap((entry: any) => entry.mood || []) || [];
  return [...new Set(allMoods)].filter(Boolean) as string[];
}

async function getUniqueColors(): Promise<string[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .schema('archive')
    .from('entries')
    .select('colors');

  if (error) {
    console.error('Error fetching colors:', error);
    return [];
  }

  // Flatten and count colors
  const allColors = data?.flatMap((entry: any) => entry.colors || []) || [];
  const colorCounts = allColors.reduce((acc: Record<string, number>, color: string) => {
    acc[color] = (acc[color] || 0) + 1;
    return acc;
  }, {});

  // Return top 12 most common colors
  return Object.entries(colorCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 12)
    .map(([color]) => color);
}
