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
    <div className="overflow-x-auto pb-3 flex justify-center -mx-4 px-4">
      <TabsList className="inline-flex bg-white/5 backdrop-blur-sm border border-white/10 p-1 rounded-lg h-auto gap-1 whitespace-nowrap [@media(max-width:640px)]:text-[13px] [@media(max-width:640px)]:gap-1 [@media(max-width:640px)]:p-1 w-full max-w-[460px] sm:max-w-[680px] md:max-w-[760px]">
        <TabsTrigger
          value="dashboard"
          className="flex items-center justify-center flex-1 gap-1.5 text-white/70 font-body text-[11px] sm:text-sm px-3 sm:px-5 py-3 sm:py-2.5 rounded-md transition-all hover:text-white/90 border border-transparent data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400 data-[state=active]:border-red-500/30"
        >
          <Home className="h-5 w-5" />
          <span className="hidden sm:inline">Inicio</span>
        </TabsTrigger>

        <TabsTrigger
          value="teams"
          className="flex items-center justify-center flex-1 gap-1.5 text-white/70 font-body text-[11px] sm:text-sm px-3 sm:px-5 py-3 sm:py-2.5 rounded-md transition-all hover:text-white/90 border border-transparent data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400 data-[state=active]:border-red-500/30"
        >
          <Users className="h-5 w-5" />
          <span className="hidden sm:inline">Equipos</span>
        </TabsTrigger>

        <TabsTrigger
          value="fixture"
          className="flex items-center justify-center flex-1 gap-1.5 text-white/70 font-body text-[11px] sm:text-sm px-3 sm:px-5 py-3 sm:py-2.5 rounded-md transition-all hover:text-white/90 border border-transparent data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400 data-[state=active]:border-red-500/30"
        >
          <Calendar className="h-5 w-5" />
          <span className="hidden sm:inline">Fixture</span>
        </TabsTrigger>

        <TabsTrigger
          value="stats"
          className="flex items-center justify-center flex-1 gap-1.5 text-white/70 font-body text-[11px] sm:text-sm px-3 sm:px-5 py-3 sm:py-2.5 rounded-md transition-all hover:text-white/90 border border-transparent data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400 data-[state=active]:border-red-500/30"
        >
          <TrendingUp className="h-5 w-5" />
          <span className="hidden sm:inline">Stats</span>
        </TabsTrigger>

        <TabsTrigger
          value="rules"
          className="flex items-center justify-center flex-1 gap-1.5 text-white/70 font-body text-[11px] sm:text-sm px-3 sm:px-5 py-3 sm:py-2.5 rounded-md transition-all hover:text-white/90 border border-transparent data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400 data-[state=active]:border-red-500/30"
        >
          <FileText className="h-5 w-5" />
          <span className="hidden sm:inline">Reglas</span>
        </TabsTrigger>

        <TabsTrigger
          value="glossary"
          className="flex items-center justify-center flex-1 gap-1.5 text-white/70 font-body text-[11px] sm:text-sm px-3 sm:px-5 py-3 sm:py-2.5 rounded-md transition-all hover:text-white/90 border border-transparent data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400 data-[state=active]:border-red-500/30"
        >
          <BookOpen className="h-5 w-5" />
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
          <TournamentRules tournament={tournament} />
        </TabsContent>

        <TabsContent value="glossary" className="mt-0">
          <TournamentGlossary accentColor={tournament.accent_color} />
        </TabsContent>
      </div>
    </div>
  );
}
