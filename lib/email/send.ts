// =====================================================
// EMAIL SENDER
// Sistema principal de envío de emails con Resend
// =====================================================

import { getResendClient, getEmailConfig, isEmailConfigured } from './resend'
import { getNotificationPreferences } from '@/lib/repo/notifications'
import { getServiceClient } from '@/lib/supabase/server'
import type {
  EmailTemplate,
  EmailSendResult,
  NewOrderEmailData,
  PendingTransferEmailData,
  ArtistSubmissionEmailData,
  LowStockEmailData,
  OrderCancelledEmailData,
  NewsletterWelcomeEmailData,
  TestEmailData,
} from '@/types/email'
import type { NotificationType } from '@/types/notifications'

// Import templates
import { createNewOrderEmail } from './templates/new-order'
import { createPendingTransferEmail } from './templates/pending-transfer'
import { createArtistSubmissionEmail } from './templates/artist-submission'
import { createLowStockEmail } from './templates/low-stock'
import { createOrderCancelledEmail } from './templates/order-cancelled'
import { createNewsletterWelcomeEmail } from './templates/newsletter-welcome'
import { createTestEmail } from './templates/test'

// =====================================================
// ADMIN EMAIL CONFIGURATION
// =====================================================

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@busy.com.ar'

/**
 * Get admin email address
 */
export function getAdminEmail(): string {
  return ADMIN_EMAIL
}

// =====================================================
// EMAIL SUBJECT MAPPING
// =====================================================

const EMAIL_SUBJECTS: Record<EmailTemplate, (data: any) => string> = {
  new_order: (data: NewOrderEmailData) => `🛍️ Nueva Orden #${data.orderNumber} - ${data.currency} ${data.total.toFixed(2)}`,
  pending_transfer: (data: PendingTransferEmailData) => `💳 Transferencia Pendiente - Orden #${data.orderNumber}`,
  artist_submission: (data: ArtistSubmissionEmailData) => `🎵 Nueva Propuesta: ${data.artistName}`,
  low_stock: (data: LowStockEmailData) => `⚠️ Stock Bajo: ${data.productName} (${data.currentStock} unidades)`,
  order_cancelled: (data: OrderCancelledEmailData) => `❌ Orden Cancelada #${data.orderNumber}`,
  newsletter_welcome: () => `🎉 ¡Bienvenido a Busy Streetwear!`,
  test: () => `🧪 Test Email - Sistema de Notificaciones`,
}

// =====================================================
// TEMPLATE RENDERING
// =====================================================

/**
 * Render email template based on type and data
 */
function renderEmailTemplate(template: EmailTemplate, data: any): string {
  switch (template) {
    case 'new_order':
      return createNewOrderEmail(data as NewOrderEmailData)
    case 'pending_transfer':
      return createPendingTransferEmail(data as PendingTransferEmailData)
    case 'artist_submission':
      return createArtistSubmissionEmail(data as ArtistSubmissionEmailData)
    case 'low_stock':
      return createLowStockEmail(data as LowStockEmailData)
    case 'order_cancelled':
      return createOrderCancelledEmail(data as OrderCancelledEmailData)
    case 'newsletter_welcome':
      return createNewsletterWelcomeEmail(data as NewsletterWelcomeEmailData)
    case 'test':
      return createTestEmail(data as TestEmailData)
    default:
      throw new Error(`Unknown email template: ${template}`)
  }
}

// =====================================================
// EMAIL SENDING
// =====================================================

/**
 * Send email using Resend
 */
export async function sendEmail(params: {
  to: string
  template: EmailTemplate
  data: any
  notificationId?: string
  notificationType?: NotificationType | 'newsletter_welcome' | 'test'
}): Promise<EmailSendResult> {
  // Check if email is configured
  if (!isEmailConfigured()) {
    console.warn('Email system not configured. Skipping email send.')
    return {
      success: false,
      error: 'Email system not configured',
    }
  }

  const resend = getResendClient()
  if (!resend) {
    return {
      success: false,
      error: 'Resend client not available',
    }
  }

  try {
    // Render template
    const html = renderEmailTemplate(params.template, params.data)
    const subject = EMAIL_SUBJECTS[params.template](params.data)
    const config = getEmailConfig()

    // Send email
    const result = await resend.emails.send({
      from: config.from,
      to: params.to,
      subject,
      html,
      replyTo: config.replyTo,
      bcc: config.bcc,
    })

    // Debug: Log full result
    console.log('📧 Resend result:', JSON.stringify(result, null, 2))

    // Log success
    if (params.notificationId || params.notificationType) {
      await logEmailSend({
        notification_id: params.notificationId,
        notification_type: params.notificationType || 'test',
        recipient: params.to,
        subject,
        status: 'sent',
        message_id: result.data?.id,
      })
    }

    console.log(`✅ Email sent successfully to ${params.to}:`, result.data?.id)

    return {
      success: true,
      messageId: result.data?.id,
    }
  } catch (error: any) {
    console.error('❌ Error sending email:', error)

    // Log failure
    if (params.notificationId || params.notificationType) {
      await logEmailSend({
        notification_id: params.notificationId,
        notification_type: params.notificationType || 'test',
        recipient: params.to,
        subject: EMAIL_SUBJECTS[params.template](params.data),
        status: 'failed',
        error_message: error.message || 'Unknown error',
      })
    }

    return {
      success: false,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * Send email to admin (respecting preferences)
 */
export async function sendAdminEmail(params: {
  template: EmailTemplate
  data: any
  notificationId?: string
  notificationType: NotificationType
}): Promise<EmailSendResult> {
  // Check if email notifications are enabled for this type
  const preferences = await getNotificationPreferences()
  const preference = preferences.find((p) => p.notification_type === params.notificationType)

  if (!preference?.email_enabled) {
    console.log(`Email notifications disabled for ${params.notificationType}. Skipping.`)
    return {
      success: false,
      error: 'Email notifications disabled for this type',
    }
  }

  return sendEmail({
    to: getAdminEmail(),
    template: params.template,
    data: params.data,
    notificationId: params.notificationId,
    notificationType: params.notificationType,
  })
}

/**
 * Send test email
 */
export async function sendTestEmail(to?: string): Promise<EmailSendResult> {
  const recipient = to || getAdminEmail()

  return sendEmail({
    to: recipient,
    template: 'test',
    data: {
      message: 'Sistema de emails funcionando correctamente',
      timestamp: new Date().toISOString(),
    } as TestEmailData,
    notificationType: 'test',
  })
}

// =====================================================
// EMAIL LOGGING
// =====================================================

/**
 * Log email send attempt to database
 */
async function logEmailSend(params: {
  notification_id?: string
  notification_type: NotificationType | 'newsletter_welcome' | 'test'
  recipient: string
  subject: string
  status: 'sent' | 'failed'
  error_message?: string
  message_id?: string
}): Promise<void> {
  try {
    const supabase = getServiceClient()

    // Log to notification_logs if notification_id exists
    if (params.notification_id) {
      await supabase.from('notification_logs').insert({
        notification_id: params.notification_id,
        channel: 'email',
        status: params.status,
        error_message: params.error_message || null,
        sent_at: params.status === 'sent' ? new Date().toISOString() : null,
      })
    }

    // Also log to a general email_logs table if it exists
    // This is optional and can be created later for more detailed tracking
    console.log(`📧 Email log: ${params.status} - ${params.recipient} - ${params.subject}`)
  } catch (error) {
    console.error('Error logging email send:', error)
    // Don't throw - logging failure shouldn't break email sending
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Check if email notifications are enabled for a notification type
 */
export async function isEmailEnabledForType(notificationType: NotificationType): Promise<boolean> {
  const preferences = await getNotificationPreferences()
  const preference = preferences.find((p) => p.notification_type === notificationType)
  return preference?.email_enabled || false
}

/**
 * Get email statistics (can be expanded later)
 */
export async function getEmailStats(): Promise<{
  total: number
  sent: number
  failed: number
}> {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('notification_logs')
      .select('status')
      .eq('channel', 'email')

    if (error) throw error

    const total = data?.length || 0
    const sent = data?.filter((log) => log.status === 'sent').length || 0
    const failed = data?.filter((log) => log.status === 'failed').length || 0

    return { total, sent, failed }
  } catch (error) {
    console.error('Error fetching email stats:', error)
    return { total: 0, sent: 0, failed: 0 }
  }
}
