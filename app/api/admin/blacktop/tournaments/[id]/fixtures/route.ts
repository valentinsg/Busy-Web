import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';
import { calculateStandings } from '@/lib/blacktop/standings';
import type { FixturesResponse } from '@/types/blacktop';

// Cache inteligente: 60 segundos con revalidación on-demand por tags
export const revalidate = 60;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getServiceClient();
    const tournamentId = parseInt(params.id);
    
    // Get tournament
    const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single();
    if (!tournament) throw new Error('Torneo no encontrado');
    
    // Get groups
    const { data: groups } = await supabase.from('groups').select('*').eq('tournament_id', tournamentId).order('order_index');
    
    // Build groups data
    const groupsData = await Promise.all(
      (groups || []).map(async (group) => {
        const { data: teams } = await supabase
          .from('teams')
          .select('*')
          .eq('tournament_id', tournamentId)
          .eq('group_id', group.id)
          .eq('status', 'approved');
        
        const { data: matches } = await supabase
          .from('matches')
          .select(`
            *,
            team_a:team_a_id(id, name),
            team_b:team_b_id(id, name),
            winner:winner_id(id, name)
          `)
          .eq('tournament_id', tournamentId)
          .eq('group_id', group.id)
          .eq('phase', 'groups')
          .order('match_number');
        
        const standings = await calculateStandings(tournamentId, group.id);
        
        return {
          group,
          teams: teams || [],
          matches: matches || [],
          standings,
        };
      })
    );
    
    // Get playoffs
    const { data: semifinals } = await supabase
      .from('matches')
      .select(`
        *,
        team_a:team_a_id(id, name),
        team_b:team_b_id(id, name),
        winner:winner_id(id, name)
      `)
      .eq('tournament_id', tournamentId)
      .eq('phase', 'semifinals')
      .order('match_number');
    
    const { data: thirdPlace } = await supabase
      .from('matches')
      .select(`
        *,
        team_a:team_a_id(id, name),
        team_b:team_b_id(id, name),
        winner:winner_id(id, name)
      `)
      .eq('tournament_id', tournamentId)
      .eq('phase', 'third_place')
      .single();
    
    const { data: final } = await supabase
      .from('matches')
      .select(`
        *,
        team_a:team_a_id(id, name),
        team_b:team_b_id(id, name),
        winner:winner_id(id, name)
      `)
      .eq('tournament_id', tournamentId)
      .eq('phase', 'final')
      .single();
    
    const response: FixturesResponse = {
      tournament,
      groups: groupsData,
      playoffs: {
        semifinals: semifinals || [],
        third_place: thirdPlace || null,
        final: final || null,
      },
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
