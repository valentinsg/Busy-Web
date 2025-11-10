import { NextRequest, NextResponse } from 'next/server';
import { getTournamentMedia } from '@/lib/repo/blacktop';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const media = await getTournamentMedia(parseInt(params.id));
    return NextResponse.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Error al obtener galería' },
      { status: 500 }
    );
  }
}
