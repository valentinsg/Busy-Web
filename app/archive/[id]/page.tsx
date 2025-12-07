import { ArchiveDetail } from '@/components/archive/archive-detail';
import { ArchiveQueryProvider } from '@/components/archive/archive-query-provider';
import { ArchiveSearch } from '@/components/archive/archive-search';
import { getArchiveEntry } from '@/lib/supabase/archive';
import { getServiceClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ArchiveEntryPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 300; // 5 minutes cache

export async function generateMetadata({ params }: ArchiveEntryPageProps): Promise<Metadata> {
  const entry = await getArchiveEntry(params.id);

  if (!entry) {
    return {
      title: 'No encontrado | Busy Archive',
      description: 'Esta entrada del archivo no fue encontrada.',
    };
  }

  // Use title if available, otherwise use microcopy
  const title = entry.title || entry.microcopy || 'Busy Archive';
  const description = entry.microcopy || 'Un momento del Busy Archive';
  const ogImage = entry.full_url;

  // Build keywords from entry data
  const keywords = ['busy archive', 'busy streetwear', 'cultura urbana', 'mar del plata'];
  if (entry.place) keywords.push(entry.place.toLowerCase());
  if (entry.mood?.length) keywords.push(...entry.mood.slice(0, 3));

  return {
    title: `${title} | Busy Archive`,
    description,
    keywords,
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    openGraph: {
      title: `${title} | Busy Archive`,
      description,
      type: 'article',
      url: `https://busy.com.ar/archive/${entry.id}`,
      siteName: 'Busy Streetwear',
      locale: 'es_AR',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 1200,
          alt: title,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Busy Archive`,
      description,
      images: [ogImage],
      site: '@busy.streetwear',
    },
    alternates: {
      canonical: `https://busy.com.ar/archive/${entry.id}`,
    },
  };
}

export default async function ArchiveEntryPage({ params }: ArchiveEntryPageProps) {
  const entry = await getArchiveEntry(params.id);

  if (!entry) {
    notFound();
  }

  // Get filter options (cached at page level)
  const [uniquePlaces, uniqueMoods, uniqueColors] = await Promise.all([
    getUniquePlaces(),
    getUniqueMoods(),
    getUniqueColors(),
  ]);

  // JSON-LD structured data for Google Images and rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    name: entry.title || entry.microcopy || 'Busy Archive',
    description: entry.microcopy || 'Momento capturado del Busy Archive',
    contentUrl: entry.full_url,
    thumbnailUrl: entry.thumb_url || entry.medium_url || entry.full_url,
    url: `https://busy.com.ar/archive/${entry.id}`,
    datePublished: entry.created_at,
    dateModified: entry.updated_at || entry.created_at,
    author: {
      '@type': 'Organization',
      name: 'Busy Streetwear',
      url: 'https://busy.com.ar',
    },
    copyrightHolder: {
      '@type': 'Organization',
      name: 'Busy Streetwear',
    },
    ...(entry.place && {
      contentLocation: {
        '@type': 'Place',
        name: entry.place,
        address: {
          '@type': 'PostalAddress',
          addressLocality: entry.place,
          addressCountry: 'AR',
        },
      },
    }),
    isPartOf: {
      '@type': 'CreativeWork',
      name: 'Busy Archive',
      url: 'https://busy.com.ar/archive',
    },
    keywords: [
      'busy streetwear',
      'cultura urbana',
      'streetwear argentina',
      ...(entry.mood || []),
      entry.place,
    ].filter(Boolean).join(', '),
  };

  return (
    <ArchiveQueryProvider>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen pt-20 md:pt-24">
        {/* Search - same as archive page */}
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="mb-6">
            <ArchiveSearch
              places={uniquePlaces}
              moods={uniqueMoods}
              colors={uniqueColors}
              showFilters={true}
              showBackButton
              backHref="/archive"
            />
          </div>

          <ArchiveDetail entry={entry} />
        </div>
      </div>
    </ArchiveQueryProvider>
  );
}

// Helper functions to get filter options
async function getUniquePlaces(): Promise<string[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .schema('archive')
    .from('entries')
    .select('place');

  if (error) return [];

  const placesMap = new Map<string, string>();
  const rows = (data ?? []) as { place: string | null }[];
  rows.forEach((item) => {
    const place = item.place;
    if (place) {
      const normalized = place.toLowerCase().trim();
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

  if (error) return [];

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

  if (error) return [];

  const rows = (data ?? []) as { colors: string[] | null }[];
  const allColors = rows.flatMap((entry) => entry.colors || []);
  const colorCounts = allColors.reduce((acc: Record<string, number>, color: string) => {
    acc[color] = (acc[color] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(colorCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 12)
    .map(([color]) => color);
}
