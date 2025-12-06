import { ArchiveHeader } from '@/components/archive/archive-header';
import { ArchiveItem } from '@/components/archive/archive-item';
import { archiveService } from '@/lib/supabase/archive';
import { TimelineGroup } from '@/types/archive';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Busy Archive Timeline | Vista Cronológica',
  description: 'Explorá el Busy Archive cronológicamente. Momentos organizados por año y mes.',
  keywords: ['archive', 'timeline', 'busy', 'chronological', 'history', 'cultura'],
  openGraph: {
    title: 'Busy Archive Timeline',
    description: 'Una vista cronológica de momentos y cultura Busy',
    type: 'website',
    url: 'https://busystreetwear.com/archive/timeline',
  },
};

export const revalidate = 300;

export default async function ArchiveTimelinePage() {
  const timeline = (await archiveService.getTimeline()) as TimelineGroup[];

  if (!timeline.length) {
    return (
      <div className="min-h-screen pt-20 md:pt-24">
        <ArchiveHeader activeTab="timeline" />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="font-body text-muted-foreground">
            No hay entradas en el archivo todavía.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <ArchiveHeader activeTab="timeline" />

      <div className="container mx-auto px-4 py-6 md:py-8 space-y-8 md:space-y-10">
        {/* Page Title */}
        <header className="space-y-2">
          <h1 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight">
            Timeline
          </h1>
          <p className="font-body max-w-2xl text-sm text-muted-foreground">
            Una línea de tiempo visual de momentos Busy. Año por año, mes por mes.
          </p>
        </header>

        {/* Timeline Content */}
        <div className="space-y-8 md:space-y-10">
          {timeline
            .sort((a, b) => b.year - a.year)
            .map((yearGroup) => {
              const months = yearGroup.months ?? [];

              if (!months.length) return null;

              return (
                <section key={yearGroup.year} className="space-y-4 md:space-y-6">
                  {/* Year Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <div className="font-heading rounded-full border bg-background px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {yearGroup.year}
                    </div>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* Months */}
                  <div className="space-y-6">
                    {months
                      .slice()
                      .sort((a, b) => b.month - a.month)
                      .map((month) => (
                        <div key={`${yearGroup.year}-${month.month}`} className="space-y-3">
                          <div className="flex items-baseline justify-between gap-2">
                            <h2 className="font-body text-sm font-medium text-muted-foreground">
                              {month.monthName} · {month.entries.length}{' '}
                              {month.entries.length === 1 ? 'entrada' : 'entradas'}
                            </h2>
                          </div>
                          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                            {month.entries.map((entry) => (
                              <ArchiveItem key={entry.id} entry={entry} />
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              );
            })}
        </div>
      </div>
    </div>
  );
}
