// =====================================================
// TEST ALL EMAIL TYPES ENDPOINT
// Endpoint para probar todos los tipos de emails
// =====================================================

import { NextResponse } from 'next/server'
import {
  sendNewOrderEmail,
  sendPendingTransferEmail,
  sendArtistSubmissionEmail,
  sendLowStockEmail,
  sendOrderCancelledEmail,
  sendEmail,
} from '@/lib/email'
import type { NewsletterWelcomeEmailData } from '@/types/email'

export const dynamic = 'force-dynamic'

/**
 * GET /api/email/test-all
 * Send test emails for all notification types
 */
export async function GET() {
  try {
    const results: Array<{ type: string; success: boolean; error?: string }> = []

    // 1. Nueva Orden
    console.log('📧 Enviando: Nueva Orden...')
    const newOrderResult = await sendNewOrderEmail({
      notificationId: 'test-new-order',
      metadata: {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        total: 25000,
        channel: 'online',
        customer_name: 'Juan Pérez',
        customer_id: 'customer-123',
        payment_method: 'mercadopago',
        status: 'paid',
      },
    })
    results.push({ type: 'new_order', ...newOrderResult })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 2. Transferencia Pendiente
    console.log('📧 Enviando: Transferencia Pendiente...')
    const transferResult = await sendPendingTransferEmail({
      notificationId: 'test-pending-transfer',
      metadata: {
        order_id: '789e0123-e89b-12d3-a456-426614174000',
        total: 18500,
        customer_name: 'María García',
      },
    })
    results.push({ type: 'pending_transfer', ...transferResult })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 3. Propuesta de Artista
    console.log('📧 Enviando: Propuesta de Artista...')
    const artistResult = await sendArtistSubmissionEmail({
      notificationId: 'test-artist-submission',
      metadata: {
        submission_id: 'artist-123',
        artist_name: 'DJ Flow',
        email: 'djflow@example.com',
        genre: 'Trap',
        phone: '+54 9 11 1234-5678',
        track_url: 'https://soundcloud.com/djflow/track',
        spotify_url: 'https://open.spotify.com/artist/123',
        instagram: 'https://instagram.com/djflow',
        youtube: 'https://youtube.com/@djflow',
        message: 'Hola! Me encantaría colaborar con Busy. Mi música tiene mucha onda urbana.',
      },
    })
    results.push({ type: 'artist_submission', ...artistResult })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 4. Stock Bajo
    console.log('📧 Enviando: Stock Bajo...')
    const stockResult = await sendLowStockEmail({
      notificationId: 'test-low-stock',
      metadata: {
        product_id: 'product-123',
        product_name: 'Hoodie Busy Black - Talle M',
        sku: 'BUSY-HOOD-001-M',
        stock: 2,
      },
      threshold: 5,
    })
    results.push({ type: 'low_stock', ...stockResult })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 5. Orden Cancelada
    console.log('📧 Enviando: Orden Cancelada...')
    const cancelledResult = await sendOrderCancelledEmail({
      notificationId: 'test-order-cancelled',
      metadata: {
        order_id: 'cancelled-order-123',
        total: 12000,
        customer_name: 'Pedro Rodríguez',
        reason: 'Cliente solicitó cancelación por cambio de talla',
      },
    })
    results.push({ type: 'order_cancelled', ...cancelledResult })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 6. Newsletter Welcome
    console.log('📧 Enviando: Bienvenida Newsletter...')
    const newsletterData: NewsletterWelcomeEmailData = {
      email: 'nuevo@subscriber.com',
      firstName: 'Ana',
      unsubscribeUrl: 'https://busy.com.ar/newsletter/unsubscribe?token=abc123',
    }
    const newsletterResult = await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@busy.com.ar',
      template: 'newsletter_welcome',
      data: newsletterData,
      notificationType: 'newsletter_subscription',
    })
    results.push({ type: 'newsletter_welcome', ...newsletterResult })

    // Contar resultados
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Enviados ${successful} de ${results.length} emails`,
      recipient: process.env.ADMIN_EMAIL || 'admin@busy.com.ar',
      results,
      summary: {
        total: results.length,
        successful,
        failed,
      },
    })
  } catch (error: unknown) {
    console.error('Error in test-all email endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
