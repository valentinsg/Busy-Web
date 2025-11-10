import type { MatchWithTeams } from '@/types/blacktop';

interface TournamentFixturePublicProps {
  matches: MatchWithTeams[];
  accentColor: string;
}

const ROUND_LABELS: Record<string, string> = {
  group_a: 'Grupo A',
  group_b: 'Grupo B',
  semifinal: 'Semifinales',
  third_place: 'Tercer puesto',
  final: 'Final',
};

export function TournamentFixturePublic({ matches, accentColor }: TournamentFixturePublicProps) {
  const matchesByRound = Object.entries(ROUND_LABELS).map(([key, label]) => ({
    key,
    label,
    matches: matches.filter((m) => m.round === key),
  })).filter(r => r.matches.length > 0);

  return (
    <div className="py-16 px-4 bg-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-abstract-slab)' }}
          >
            FIXTURE
          </h2>
        </div>

        <div className="space-y-8">
          {matchesByRound.map((round) => (
            <div key={round.key}>
              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: accentColor }}
              >
                {round.label}
              </h3>

              <div className="space-y-4">
                {round.matches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6"
                    style={{ borderColor: `${accentColor}40` }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Equipo A */}
                      <div className="flex-1 text-right">
                        <p className="text-xl font-bold">
                          {match.team_a?.name || 'TBD'}
                        </p>
                        {match.team_a_score !== null && match.team_a_score !== undefined && (
                          <p className="text-4xl font-bold mt-2" style={{ color: accentColor }}>
                            {match.team_a_score}
                          </p>
                        )}
                      </div>

                      {/* VS */}
                      <div className="text-white/50 text-xl font-bold">VS</div>

                      {/* Equipo B */}
                      <div className="flex-1 text-left">
                        <p className="text-xl font-bold">
                          {match.team_b?.name || 'TBD'}
                        </p>
                        {match.team_b_score !== null && match.team_b_score !== undefined && (
                          <p className="text-4xl font-bold mt-2" style={{ color: accentColor }}>
                            {match.team_b_score}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Hora */}
                    {match.scheduled_time && (
                      <div className="text-center mt-4 text-sm text-white/60">
                        {new Date(match.scheduled_time).toLocaleString('es-AR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}

                    {/* Ganador */}
                    {match.winner_id && (
                      <div className="text-center mt-2">
                        <span
                          className="inline-block px-3 py-1 rounded text-sm font-bold"
                          style={{ backgroundColor: `${accentColor}40` }}
                        >
                          Ganador: {match.winner?.name}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
