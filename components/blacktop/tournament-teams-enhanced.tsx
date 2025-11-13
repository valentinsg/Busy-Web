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
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedTeams.map((team) => (
          <Link
            key={team.id}
            href={`/blacktop/equipos/${team.id}`}
            className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all hover:scale-[1.02] cursor-pointer block"
          >
            {/* Accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" style={{ color: accentColor }} />
            
            {/* Team Header */}
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  {renderTeamLogo(team)}
                  {team.group_name && (
                    <div 
                      className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-black"
                      style={{ backgroundColor: accentColor }}
                    >
                      {team.group_name.replace('Grupo ', '')}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold mb-1 truncate group-hover:text-white transition-colors" style={{ color: accentColor }}>
                    {team.name}
                  </h3>
                  <p className="text-xs text-white/50">
                    {team.players?.length || 0} jugadores
                  </p>
                </div>
              </div>

              {/* Players List - Compact */}
              <div className="space-y-1.5">
                {team.players && team.players.length > 0 ? (
                  team.players.slice(0, 4).map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-2 text-sm text-white/70 group-hover:text-white/90 transition-colors"
                    >
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
                      <span className="flex-1 truncate">{player.full_name}</span>
                      {player.is_captain && (
                        <span 
                          className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                        >
                          C
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/40">Sin jugadores</p>
                )}
                {team.players && team.players.length > 4 && (
                  <p className="text-xs text-white/40 mt-2">+{team.players.length - 4} más</p>
                )}
              </div>
            </div>

            {/* Hover indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accentColor }} />
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
