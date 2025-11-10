import { NextRequest, NextResponse } from 'next/server';
import { createMatch } from '@/lib/repo/blacktop';
import type { MatchFormData } from '@/types/blacktop';

export async function POST(request: NextRequest) {
  try {
    const body: MatchFormData = await request.json();
    const match = await createMatch(body);
    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { error: 'Error al crear partido' },
      { status: 500 }
    );
  }
}
