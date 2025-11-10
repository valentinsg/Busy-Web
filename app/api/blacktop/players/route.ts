import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('players')
      .insert({
        tournament_id: body.tournament_id,
        team_id: body.team_id,
        full_name: body.full_name,
        instagram_handle: body.instagram_handle,
        email: body.email ?? null,
        is_captain: !!body.is_captain,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json({ error: 'Error al crear jugador' }, { status: 500 })
  }
}
