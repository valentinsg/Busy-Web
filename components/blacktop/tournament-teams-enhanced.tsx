'use client';

import { Instagram } from 'lucide-react';
import type { TeamWithPlayers } from '@/types/blacktop';
import Image from 'next/image';
import Link from 'next/link';

interface TournamentTeamsEnhancedProps {
  teams: TeamWithPlayers[];
  accentColor: string;
}

export function TournamentTeamsEnhanced({ teams, accentColor }: TournamentTeamsEnhancedProps) {
  // Ordenar equipos alfabéticamente por nombre
  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name, 'es'));

  const renderTeamLogo = (team: TeamWithPlayers) => {
    if (team.logo_url) {
      return (
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white/10 border-2" style={{ borderColor: `${accentColor}40` }}>
          <Image 
            src={team.logo_url} 
            alt={team.name}
            fill
            className="object-cover"
          />
        </div>
      );
    }
    
    // Template logo con inicial del equipo
    return (
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl border-2"
        style={{ 
          backgroundColor: `${accentColor}20`, 
          color: accentColor,
          borderColor: `${accentColor}40`
        }}
      >
        {team.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-body">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedTeams.map((team) => (
          <Link
            key={team.id}
            href={`/blacktop/equipos/${team.id}`}
            className="bg-white/10 backdrop-blur border border-white/20 rounded-lg overflow-hidden hover:bg-white/15 transition-all hover:scale-[1.02] cursor-pointer block"
            style={{ borderColor: `${accentColor}30` }}
          >
            {/* Team Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                {renderTeamLogo(team)}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1" style={{ color: accentColor }}>
                    {team.name}
                  </h3>
                  {team.group_name && (
                    <span className="text-sm text-white/60">
                      Grupo {team.group_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Players List */}
            <div className="p-6">
              <h4 className="text-sm font-bold text-white/60 mb-3 uppercase tracking-wide">
                Jugadores ({team.players?.length || 0})
              </h4>
              <div className="space-y-2">
                {team.players && team.players.length > 0 ? (
                  team.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-2 text-white/80 p-2 rounded hover:bg-white/5 transition-colors"
                    >
                      <Instagram className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
                      <a
                        href={`https://instagram.com/${player.instagram_handle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex-1"
                      >
                        {player.full_name}
                      </a>
                      {player.is_captain && (
                        <span 
                          className="text-xs px-2 py-0.5 rounded font-bold"
                          style={{ backgroundColor: `${accentColor}40`, color: accentColor }}
                        >
                          C
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/50 text-center py-4">
                    Sin jugadores registrados
                  </p>
                )}
              </div>
            </div>

            {/* Team Stats Footer (opcional) */}
            {team.group_name && (
              <div className="px-6 py-3 bg-white/5 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Capitán: {team.captain_name}</span>
                  <a
                    href={`https://instagram.com/${team.captain_instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: accentColor }}
                  >
                    @{team.captain_instagram.replace('@', '')}
                  </a>
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/50 text-lg">
            Aún no hay equipos confirmados
          </p>
        </div>
      )}
    </div>
  );
}
