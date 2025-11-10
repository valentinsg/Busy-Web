import { Instagram } from 'lucide-react';
import type { TeamWithPlayers } from '@/types/blacktop';

interface TournamentTeamsListProps {
  teams: TeamWithPlayers[];
  accentColor: string;
}

export function TournamentTeamsList({ teams, accentColor }: TournamentTeamsListProps) {
  return (
    <div className="py-16 px-4 bg-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-abstract-slab)' }}
          >
            EQUIPOS
          </h2>
          <p className="text-xl text-white/70">
            {teams.length} equipos confirmados
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-colors"
              style={{ borderColor: `${accentColor}40` }}
            >
              <h3 className="text-2xl font-bold mb-4" style={{ color: accentColor }}>
                {team.name}
              </h3>

              <div className="space-y-2">
                {team.players?.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 text-white/80"
                  >
                    <Instagram className="h-4 w-4" />
                    <a
                      href={`https://instagram.com/${player.instagram_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      @{player.instagram_handle.replace('@', '')}
                    </a>
                    {player.is_captain && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${accentColor}40` }}>
                        C
                      </span>
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
