'use client';

import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, Users, Calendar, TrendingUp, FileText, BookOpen } from 'lucide-react';
import type { Tournament, TeamWithPlayers, MatchWithTeams, TournamentLeaderboard, TournamentMedia } from '@/types/blacktop';
import { TournamentDashboard } from './tournament-dashboard';
import { TournamentTeamsEnhanced } from './tournament-teams-enhanced';
import { TournamentFixtureEnhanced } from './tournament-fixture-enhanced';
import { TournamentStatsPublic } from './tournament-stats-public';
import { TournamentRules } from './tournament-rules';
import { TournamentGlossary } from './tournament-glossary';

interface TournamentPanelsProps {
  tournament: Tournament;
  teams: TeamWithPlayers[];
  matches: MatchWithTeams[];
  leaderboard: TournamentLeaderboard[];
}

export function TournamentTabsNav() {
  return (
    <div className="overflow-x-auto pb-2 flex justify-center -mx-4 px-4">
      <TabsList className="inline-flex bg-white/5 backdrop-blur-sm border border-white/10 p-1 rounded-lg h-auto gap-0.5">
        <TabsTrigger
          value="dashboard"
          className="flex items-center gap-1.5 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 font-body text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-md transition-all hover:text-white/80"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Inicio</span>
        </TabsTrigger>

        <TabsTrigger
          value="teams"
          className="flex items-center gap-1.5 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 font-body text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-md transition-all hover:text-white/80"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Equipos</span>
        </TabsTrigger>

        <TabsTrigger
          value="fixture"
          className="flex items-center gap-1.5 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 font-body text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-md transition-all hover:text-white/80"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">Fixture</span>
        </TabsTrigger>

        <TabsTrigger
          value="stats"
          className="flex items-center gap-1.5 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 font-body text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-md transition-all hover:text-white/80"
        >
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">Stats</span>
        </TabsTrigger>

        <TabsTrigger
          value="rules"
          className="flex items-center gap-1.5 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 font-body text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-md transition-all hover:text-white/80"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Reglas</span>
        </TabsTrigger>

        <TabsTrigger
          value="glossary"
          className="flex items-center gap-1.5 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 font-body text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-md transition-all hover:text-white/80"
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Info</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
}

export function TournamentTabPanels({
  tournament,
  teams,
  matches,
  leaderboard,
}: TournamentPanelsProps) {
  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <TabsContent value="dashboard" className="mt-0">
          <TournamentDashboard
            tournament={tournament}
            teams={teams}
            matches={matches}
            leaderboard={leaderboard}
            accentColor={tournament.accent_color}
            showPrizes={true}
          />
        </TabsContent>

        <TabsContent value="teams" className="mt-0">
          <TournamentTeamsEnhanced
            teams={teams}
            accentColor={tournament.accent_color}
          />
        </TabsContent>

        <TabsContent value="fixture" className="mt-0">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5" style={{ color: tournament.accent_color }}>
              Fixture y Resultados
            </h2>
            <p className="text-white/50 font-body text-sm">
              Calendario completo, tablas de posiciones y llaves de playoff
            </p>
          </div>
          <TournamentFixtureEnhanced
            matches={matches}
            teams={teams}
            accentColor={tournament.accent_color}
          />
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5" style={{ color: tournament.accent_color }}>
              Estadísticas de Jugadores
            </h2>
            <p className="text-white/50 font-body text-sm">
              Líderes en puntos, rebotes, asistencias y más
            </p>
          </div>
          <TournamentStatsPublic
            leaderboard={leaderboard}
            teams={teams}
            accentColor={tournament.accent_color}
          />
        </TabsContent>

        <TabsContent value="rules" className="mt-0">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5" style={{ color: tournament.accent_color }}>
              Reglamento del Torneo
            </h2>
            <p className="text-white/50 font-body text-sm">
              Reglas oficiales y código de conducta
            </p>
          </div>
          <TournamentRules tournament={tournament} />
        </TabsContent>

        <TabsContent value="glossary" className="mt-0">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5" style={{ color: tournament.accent_color }}>
              Glosario de Términos
            </h2>
            <p className="text-white/50 font-body text-sm">
              Explicación de estadísticas y términos del básquet
            </p>
          </div>
          <TournamentGlossary accentColor={tournament.accent_color} />
        </TabsContent>
      </div>
    </div>
  );
}
