import { NextRequest, NextResponse } from 'next/server'
import { updateArtistSubmission, deleteArtistSubmission } from '@/lib/repo/artist-submissions'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    const { status, admin_notes } = body

    if (!status) {
      return NextResponse.json(
        { ok: false, error: 'El estado es requerido' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'reviewed', 'approved', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { ok: false, error: 'Estado inválido' },
        { status: 400 }
      )
    }

    const updated = await updateArtistSubmission(params.id, {
      status,
      admin_notes: admin_notes || undefined,
    })

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: 'No se pudo actualizar la propuesta' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, data: updated })
  } catch (error) {
    console.error('Error in PATCH artist-submission:', error)
    return NextResponse.json(
      { ok: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteArtistSubmission(params.id)

    if (!success) {
      return NextResponse.json(
        { ok: false, error: 'No se pudo eliminar la propuesta' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error in DELETE artist-submission:', error)
    return NextResponse.json(
      { ok: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
