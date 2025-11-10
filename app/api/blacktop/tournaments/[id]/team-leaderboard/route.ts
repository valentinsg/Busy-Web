import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';
import type { TeamLeaderboard } from '@/types/blacktop';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient();
    const tournamentId = parseInt(params.id);

    // Obtener equipos con sus estadísticas
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select(`
        *,
        stats:team_match_stats(points, assists, rebounds, steals, blocks, turnovers)
      `)
      .eq('tournament_id', tournamentId)
      .eq('status', 'approved');

    if (teamsError) throw teamsError;
    if (!teams) return NextResponse.json([]);

    // Calcular totales por equipo
    const leaderboard: TeamLeaderboard[] = teams.map((team: any) => {
      const stats = team.stats || [];
      return {
        team: team,
        total_points: stats.reduce((sum: number, s: any) => sum + (s.points || 0), 0),
        total_assists: stats.reduce((sum: number, s: any) => sum + (s.assists || 0), 0),
        total_rebounds: stats.reduce((sum: number, s: any) => sum + (s.rebounds || 0), 0),
        total_steals: stats.reduce((sum: number, s: any) => sum + (s.steals || 0), 0),
        total_blocks: stats.reduce((sum: number, s: any) => sum + (s.blocks || 0), 0),
        total_turnovers: stats.reduce((sum: number, s: any) => sum + (s.turnovers || 0), 0),
        games_played: stats.length,
      };
    });

    // Ordenar por puntos
    const sorted = leaderboard.sort((a, b) => b.total_points - a.total_points);

    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error fetching team leaderboard:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de equipos' },
      { status: 500 }
    );
  }
}
