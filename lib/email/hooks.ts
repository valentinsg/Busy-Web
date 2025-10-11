// =====================================================
// EMAIL NOTIFICATION HOOKS
// Integración automática con el sistema de notificaciones
// =====================================================

import { sendAdminEmail } from './send'
import type {
  NewOrderEmailData,
  PendingTransferEmailData,
  ArtistSubmissionEmailData,
  LowStockEmailData,
  OrderCancelledEmailData,
} from '@/types/email'
import type {
  NewOrderMetadata,
  PendingTransferMetadata,
  ArtistSubmissionMetadata,
  LowStockMetadata,
  OrderCancelledMetadata,
} from '@/types/notifications'

// =====================================================
// NOTIFICATION TO EMAIL HOOKS
// =====================================================

/**
 * Send email for new order notification
 */
export async function sendNewOrderEmail(params: {
  notificationId: string
  metadata: NewOrderMetadata
}) {
  const emailData: NewOrderEmailData = {
    orderId: params.metadata.order_id,
    orderNumber: params.metadata.order_id.substring(0, 8),
    customerName: params.metadata.customer_name || 'Cliente',
    customerEmail: 'N/A', // TODO: Get from customer table if needed
    total: params.metadata.total,
    currency: 'ARS',
    channel: params.metadata.channel,
    paymentMethod: params.metadata.payment_method || undefined,
    status: params.metadata.status || undefined,
    items: [], // TODO: Get from order_items if needed for email
    actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://busy.com.ar'}/admin/orders/${params.metadata.order_id}`,
  }

  return sendAdminEmail({
    template: 'new_order',
    data: emailData,
    notificationId: params.notificationId,
    notificationType: 'new_order',
  })
}

/**
 * Send email for pending transfer notification
 */
export async function sendPendingTransferEmail(params: {
  notificationId: string
  metadata: PendingTransferMetadata & { customer_name?: string }
}) {
  const emailData: PendingTransferEmailData = {
    orderId: params.metadata.order_id,
    orderNumber: params.metadata.order_id.substring(0, 8),
    customerName: params.metadata.customer_name || 'Cliente',
    total: params.metadata.total,
    currency: 'ARS',
    actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://busy.com.ar'}/admin/orders/${params.metadata.order_id}`,
  }

  return sendAdminEmail({
    template: 'pending_transfer',
    data: emailData,
    notificationId: params.notificationId,
    notificationType: 'pending_transfer',
  })
}

/**
 * Send email for artist submission notification
 */
export async function sendArtistSubmissionEmail(params: {
  notificationId: string
  metadata: ArtistSubmissionMetadata & {
    phone?: string
    track_url?: string
    spotify_url?: string
    instagram?: string
    youtube?: string
    message?: string
  }
}) {
  const emailData: ArtistSubmissionEmailData = {
    submissionId: params.metadata.submission_id,
    artistName: params.metadata.artist_name,
    email: params.metadata.email,
    phone: params.metadata.phone,
    genre: params.metadata.genre || undefined,
    trackUrl: params.metadata.track_url,
    spotifyUrl: params.metadata.spotify_url,
    instagram: params.metadata.instagram,
    youtube: params.metadata.youtube,
    message: params.metadata.message,
    actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://busy.com.ar'}/admin/artist-submissions`,
  }

  return sendAdminEmail({
    template: 'artist_submission',
    data: emailData,
    notificationId: params.notificationId,
    notificationType: 'artist_submission',
  })
}

/**
 * Send email for low stock notification
 */
export async function sendLowStockEmail(params: {
  notificationId: string
  metadata: LowStockMetadata
  threshold?: number
}) {
  const emailData: LowStockEmailData = {
    productId: params.metadata.product_id,
    productName: params.metadata.product_name,
    sku: params.metadata.sku,
    currentStock: params.metadata.stock,
    threshold: params.threshold || 5,
    actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://busy.com.ar'}/admin/products/${params.metadata.product_id}`,
  }

  return sendAdminEmail({
    template: 'low_stock',
    data: emailData,
    notificationId: params.notificationId,
    notificationType: 'low_stock',
  })
}

/**
 * Send email for order cancelled notification
 */
export async function sendOrderCancelledEmail(params: {
  notificationId: string
  metadata: OrderCancelledMetadata & { customer_name?: string; reason?: string }
}) {
  const emailData: OrderCancelledEmailData = {
    orderId: params.metadata.order_id,
    orderNumber: params.metadata.order_id.substring(0, 8),
    customerName: params.metadata.customer_name || 'Cliente',
    total: params.metadata.total,
    currency: 'ARS',
    reason: params.metadata.reason,
    actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://busy.com.ar'}/admin/orders/${params.metadata.order_id}`,
  }

  return sendAdminEmail({
    template: 'order_cancelled',
    data: emailData,
    notificationId: params.notificationId,
    notificationType: 'order_cancelled',
  })
}

// =====================================================
// UNIFIED NOTIFICATION HANDLER
// =====================================================

/**
 * Handle notification and send email if enabled
 * Call this from your notification creation logic
 */
export async function handleNotificationEmail(params: {
  notificationId: string
  notificationType: string
  metadata: any
}) {
  try {
    switch (params.notificationType) {
      case 'new_order':
        await sendNewOrderEmail({
          notificationId: params.notificationId,
          metadata: params.metadata,
        })
        break

      case 'pending_transfer':
        await sendPendingTransferEmail({
          notificationId: params.notificationId,
          metadata: params.metadata,
        })
        break

      case 'artist_submission':
        await sendArtistSubmissionEmail({
          notificationId: params.notificationId,
          metadata: params.metadata,
        })
        break

      case 'low_stock':
        await sendLowStockEmail({
          notificationId: params.notificationId,
          metadata: params.metadata,
          threshold: params.metadata.threshold,
        })
        break

      case 'order_cancelled':
        await sendOrderCancelledEmail({
          notificationId: params.notificationId,
          metadata: params.metadata,
        })
        break

      default:
        console.log(`No email handler for notification type: ${params.notificationType}`)
    }
  } catch (error) {
    console.error('Error handling notification email:', error)
    // Don't throw - email failure shouldn't break notification creation
  }
}
