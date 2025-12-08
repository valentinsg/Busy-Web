import { FilesMasonry } from '@/components/files/files-masonry';
import { FilesQueryProvider } from '@/components/files/files-query-provider';
import { FilesSearch } from '@/components/files/files-search';
import { FilesSkeleton } from '@/components/files/files-skeleton';
import { getServiceClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Busy Files | Galería del universo de Busy',
  description: 'Explorá Busy Files: galería visual de momentos, la cultura que promueve Busy en Mar del Plata e ideas inspiracionales. Buscá lo que necesites dentro de nuestro universo.',
  keywords: [
    'busy files',
    'busy streetwear',
    'contenido sobre Busy',
    'ideas streetwear',
    'cultura busy',
    'cultura urbana',
    'universo busy',
    'mar del plata',
    'streetwear argentina',
    'galería streetwear',
    'fotos streetwear',
    'moda urbana argentina',
  ],
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  openGraph: {
  title: 'Busy Files | Galería del universo de Busy',
    description: 'Explorá Busy Files: galería visual de momentos, la cultura que promueve Busy en Mar del Plata e ideas inspiracionales.',
    type: 'website',
    url: 'https://busy.com.ar/files',
    siteName: 'Busy Streetwear',
    locale: 'es_AR',
    images: [
      {
        url: 'https://busy.com.ar/busy-parche.png',
        width: 1200,
        height: 630,
        alt: 'Busy Files - Galería de Cultura Urbana',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Busy Files | Galería del universo de Busy',
    description: 'Explorá momentos y cultura streetwear de Mar del Plata',
    site: '@busy.streetwear',
    images: ['https://busy.com.ar/busy-parche.png'],
  },
  alternates: {
    canonical: 'https://busy.com.ar/files',
  },
};

export const revalidate = 3600; // Revalidate every hour

export default async function FilesPage({
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
    sort: (searchParams?.sort as 'newest' | 'oldest') || 'newest',
  };

  // Get unique values for filters (cached at page level)
  const [uniquePlaces, uniqueMoods, uniqueColors] = await Promise.all([
    getUniquePlaces(),
    getUniqueMoods(),
    getUniqueColors(),
  ]);

  return (
    <FilesQueryProvider>
      <div className="min-h-screen pt-20 md:pt-24">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Page Title - More compact */}
          <div className="mb-4 md:mb-6">
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
              Busy Files
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Momentos, cultura y streetwear. Buscá lo que te inspire.
            </p>
          </div>

          {/* Search & Filters - Pinterest style */}
          <div className="mb-6 md:mb-8">
            <FilesSearch
              places={uniquePlaces}
              moods={uniqueMoods}
              colors={uniqueColors}
            />
          </div>

          {/* Masonry Grid */}
          <Suspense fallback={<FilesSkeleton />}>
            <FilesMasonry filters={filters} />
          </Suspense>
        </div>
      </div>
    </FilesQueryProvider>
  );
}

async function getUniquePlaces(): Promise<string[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .schema('archive')
    .from('entries')
    .select('place');

  if (error) {
    console.error('Error fetching places:', error);
    return [];
  }

  // Normalize places to avoid duplicates like "Mar del Plata" vs "Mar Del Plata"
  const placesMap = new Map<string, string>();
  const rows = (data ?? []) as { place: string | null }[];
  rows.forEach((item) => {
    const place = item.place;
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

  const rows = (data ?? []) as { mood: string[] | null }[];
  const allMoods = rows.flatMap((entry) => entry.mood || []);
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
  const rows = (data ?? []) as { colors: string[] | null }[];
  const allColors = rows.flatMap((entry) => entry.colors || []);
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
