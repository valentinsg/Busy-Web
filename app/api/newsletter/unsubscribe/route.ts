import { getServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ ok: false, error: 'Email requerido' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const supabase = getServiceClient()

    // Check if subscriber exists
    const { data: existing, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching subscriber:', fetchError)
      return NextResponse.json({ ok: false, error: 'Error al procesar solicitud' }, { status: 500 })
    }

    if (!existing) {
      // Email not found - still return success to avoid email enumeration
      return NextResponse.json({ ok: true, message: 'Procesado' })
    }

    if (existing.status === 'unsubscribed') {
      return NextResponse.json({ ok: true, message: 'Ya estás dado de baja' })
    }

    // Update status to unsubscribed
    const { error: updateError } = await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Error updating subscriber:', updateError)
      return NextResponse.json({ ok: false, error: 'Error al actualizar suscripción' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Suscripción cancelada exitosamente' })

  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 })
  }
}
