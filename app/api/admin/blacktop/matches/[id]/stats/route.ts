import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient();
    const matchId = parseInt(params.id);

    // Obtener datos del partido
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*, team_a:teams!team_a_id(id, name), team_b:teams!team_b_id(id, name)')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    // Obtener estadísticas de jugadores
    const { data: playerStats, error: statsError } = await supabase
      .from('player_match_stats')
      .select(`
        *,
        player:players(id, full_name)
      `)
      .eq('match_id', matchId);

    if (statsError) {
      console.error('Error fetching player stats:', statsError);
    }

    // Separar stats por equipo
    const { data: teamAPlayers } = await supabase
      .from('players')
      .select('id, full_name')
      .eq('team_id', match.team_a_id)
      .eq('status', 'approved');

    const { data: teamBPlayers } = await supabase
      .from('players')
      .select('id, full_name')
      .eq('team_id', match.team_b_id)
      .eq('status', 'approved');

    const teamAPlayerIds = teamAPlayers?.map(p => p.id) || [];
    const teamBPlayerIds = teamBPlayers?.map(p => p.id) || [];

    const statsA = (playerStats || [])
      .filter(s => teamAPlayerIds.includes(s.player_id))
      .map(s => ({
        player_id: s.player_id,
        player_name: s.player?.full_name || 'Unknown',
        points: s.points || 0,
        assists: s.assists || 0,
        rebounds: s.rebounds || 0,
        steals: s.steals || 0,
        blocks: s.blocks || 0,
        turnovers: s.turnovers || 0,
        is_mvp: s.is_mvp || false,
      }));

    const statsB = (playerStats || [])
      .filter(s => teamBPlayerIds.includes(s.player_id))
      .map(s => ({
        player_id: s.player_id,
        player_name: s.player?.full_name || 'Unknown',
        points: s.points || 0,
        assists: s.assists || 0,
        rebounds: s.rebounds || 0,
        steals: s.steals || 0,
        blocks: s.blocks || 0,
        turnovers: s.turnovers || 0,
        is_mvp: s.is_mvp || false,
      }));

    return NextResponse.json({
      match: {
        id: match.id,
        team_a_score: match.team_a_score || 0,
        team_b_score: match.team_b_score || 0,
        fouls_a: match.fouls_a || 0,
        fouls_b: match.fouls_b || 0,
      },
      teamA: {
        id: match.team_a?.id,
        name: match.team_a?.name || 'Team A',
      },
      teamB: {
        id: match.team_b?.id,
        name: match.team_b?.name || 'Team B',
      },
      statsA,
      statsB,
    });
  } catch (error: any) {
    console.error('Error fetching match stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
