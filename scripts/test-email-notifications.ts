// =====================================================
// TEST EMAIL NOTIFICATIONS
// Script para probar todos los tipos de emails
// =====================================================

import {
  sendNewOrderEmail,
  sendPendingTransferEmail,
  sendArtistSubmissionEmail,
  sendLowStockEmail,
  sendOrderCancelledEmail,
  sendEmail,
} from '../lib/email'
import type {
  NewsletterWelcomeEmailData,
} from '../types/email'

/**
 * Test 1: Nueva Orden (Pagada con MercadoPago)
 */
async function testNewOrder() {
  console.log('\n📧 Test 1: Nueva Orden (Pagada)')
  
  const result = await sendNewOrderEmail({
    notificationId: 'test-notification-1',
    metadata: {
      order_id: '123e4567-e89b-12d3-a456-426614174000',
      total: 25000,
      channel: 'online',
      customer_name: 'Juan Pérez',
      customer_id: 'customer-123',
    },
  })

  console.log(result.success ? '✅ Enviado' : '❌ Error:', result.error)
}

/**
 * Test 2: Transferencia Pendiente
 */
async function testPendingTransfer() {
  console.log('\n📧 Test 2: Transferencia Pendiente')
  
  const result = await sendPendingTransferEmail({
    notificationId: 'test-notification-2',
    metadata: {
      order_id: '789e0123-e89b-12d3-a456-426614174000',
      total: 18500,
      customer_name: 'María García',
    },
  })

  console.log(result.success ? '✅ Enviado' : '❌ Error:', result.error)
}

/**
 * Test 3: Propuesta de Artista
 */
async function testArtistSubmission() {
  console.log('\n📧 Test 3: Propuesta de Artista')
  
  const result = await sendArtistSubmissionEmail({
    notificationId: 'test-notification-3',
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

  console.log(result.success ? '✅ Enviado' : '❌ Error:', result.error)
}

/**
 * Test 4: Stock Bajo (Crítico)
 */
async function testLowStock() {
  console.log('\n📧 Test 4: Stock Bajo')
  
  const result = await sendLowStockEmail({
    notificationId: 'test-notification-4',
    metadata: {
      product_id: 'product-123',
      product_name: 'Hoodie Busy Black - Talle M',
      sku: 'BUSY-HOOD-001-M',
      stock: 2,
    },
    threshold: 5,
  })

  console.log(result.success ? '✅ Enviado' : '❌ Error:', result.error)
}

/**
 * Test 5: Orden Cancelada
 */
async function testOrderCancelled() {
  console.log('\n📧 Test 5: Orden Cancelada')
  
  const result = await sendOrderCancelledEmail({
    notificationId: 'test-notification-5',
    metadata: {
      order_id: 'cancelled-order-123',
      total: 12000,
      customer_name: 'Pedro Rodríguez',
      reason: 'Cliente solicitó cancelación por cambio de talla',
    },
  })

  console.log(result.success ? '✅ Enviado' : '❌ Error:', result.error)
}

/**
 * Test 6: Nueva Suscripción Newsletter
 */
async function testNewsletterWelcome() {
  console.log('\n📧 Test 6: Bienvenida Newsletter')
  
  const data: NewsletterWelcomeEmailData = {
    email: 'nuevo@subscriber.com',
    firstName: 'Ana',
    unsubscribeUrl: 'https://busy.com.ar/newsletter/unsubscribe?token=abc123',
  }

  const result = await sendEmail({
    to: process.env.ADMIN_EMAIL || 'admin@busy.com.ar',
    template: 'newsletter_welcome',
    data,
    notificationType: 'newsletter_subscription',
  })

  console.log(result.success ? '✅ Enviado' : '❌ Error:', result.error)
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
  console.log('🚀 Iniciando tests de emails...\n')
  console.log('📬 Los emails se enviarán a:', process.env.ADMIN_EMAIL || 'admin@busy.com.ar')
  console.log('⏳ Esto puede tardar unos segundos...\n')

  try {
    await testNewOrder()
    await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1s entre emails

    await testPendingTransfer()
    await new Promise(resolve => setTimeout(resolve, 1000))

    await testArtistSubmission()
    await new Promise(resolve => setTimeout(resolve, 1000))

    await testLowStock()
    await new Promise(resolve => setTimeout(resolve, 1000))

    await testOrderCancelled()
    await new Promise(resolve => setTimeout(resolve, 1000))

    await testNewsletterWelcome()

    console.log('\n✅ Todos los tests completados!')
    console.log('📬 Revisa tu bandeja de entrada:', process.env.ADMIN_EMAIL || 'admin@busy.com.ar')
  } catch (error) {
    console.error('\n❌ Error ejecutando tests:', error)
  }
}

// Ejecutar tests
runAllTests()
