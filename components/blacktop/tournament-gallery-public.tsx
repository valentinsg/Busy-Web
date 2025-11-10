import type { TournamentMedia } from '@/types/blacktop';

interface TournamentGalleryPublicProps {
  media: TournamentMedia[];
}

export function TournamentGalleryPublic({ media }: TournamentGalleryPublicProps) {
  return (
    <div className="py-16 px-4 bg-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-abstract-slab)' }}
          >
            GALERÍA
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {media.map((item) => (
            <div
              key={item.id}
              className="aspect-square relative overflow-hidden rounded-lg bg-white/10 group cursor-pointer"
            >
              <img
                src={item.url}
                alt={item.caption || 'Imagen del torneo'}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              {item.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
