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
    <div className="overflow-x-auto pb-2 flex justify-center">
      <TabsList className="inline-flex bg-white/10 backdrop-blur border border-white/20 p-2 rounded-lg h-auto gap-1">
        <TabsTrigger
          value="dashboard"
          className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white font-body text-sm md:text-base px-4 py-3 rounded-md transition-all"
        >
          <Home className="h-5 w-5" />
          <span>Inicio</span>
        </TabsTrigger>

        <TabsTrigger
          value="teams"
          className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white font-body text-sm md:text-base px-4 py-3 rounded-md transition-all"
        >
          <Users className="h-5 w-5" />
          <span>Equipos</span>
        </TabsTrigger>

        <TabsTrigger
          value="fixture"
          className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white font-body text-sm md:text-base px-4 py-3 rounded-md transition-all"
        >
          <Calendar className="h-5 w-5" />
          <span>Fixture</span>
        </TabsTrigger>

        <TabsTrigger
          value="stats"
          className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white font-body text-sm md:text-base px-4 py-3 rounded-md transition-all"
        >
          <TrendingUp className="h-5 w-5" />
          <span>Stats</span>
        </TabsTrigger>

        <TabsTrigger
          value="rules"
          className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white font-body text-sm md:text-base px-4 py-3 rounded-md transition-all"
        >
          <FileText className="h-5 w-5" />
          <span>Reglas</span>
        </TabsTrigger>

        <TabsTrigger
          value="glossary"
          className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white font-body text-sm md:text-base px-4 py-3 rounded-md transition-all"
        >
          <BookOpen className="h-5 w-5" />
          <span>Info</span>
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
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2" style={{ color: tournament.accent_color }}>
              Fixture y Resultados
            </h2>
            <p className="text-white/70 font-body">
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
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2" style={{ color: tournament.accent_color }}>
              Estadísticas de Jugadores
            </h2>
            <p className="text-white/70 font-body">
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
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2" style={{ color: tournament.accent_color }}>
              Reglamento del Torneo
            </h2>
            <p className="text-white/70 font-body">
              Reglas oficiales y código de conducta
            </p>
          </div>
          <TournamentRules tournament={tournament} />
        </TabsContent>

        <TabsContent value="glossary" className="mt-0">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2" style={{ color: tournament.accent_color }}>
              Glosario de Términos
            </h2>
            <p className="text-white/70 font-body">
              Explicación de estadísticas y términos del básquet
            </p>
          </div>
          <TournamentGlossary accentColor={tournament.accent_color} />
        </TabsContent>
      </div>
    </div>
  );
}
