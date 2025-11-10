import type { Tournament } from '@/types/blacktop';

interface TournamentPrizesProps {
  tournament: Tournament;
}

export function TournamentPrizes({ tournament }: TournamentPrizesProps) {
  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-abstract-slab)' }}
          >
            {tournament.prizes_title}
          </h2>
        </div>

        <div
          className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-8 md:p-12"
          style={{ borderColor: `${tournament.accent_color}40` }}
        >
          <div className="whitespace-pre-wrap text-lg md:text-xl leading-relaxed">
            {tournament.prizes_description}
          </div>
        </div>
      </div>
    </div>
  );
}
