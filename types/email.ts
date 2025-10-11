// =====================================================
// EMAIL TYPES
// =====================================================

import type { NotificationType } from './notifications'

export type EmailTemplate =
  | 'new_order'
  | 'pending_transfer'
  | 'artist_submission'
  | 'low_stock'
  | 'order_cancelled'
  | 'newsletter_welcome'
  | 'test'

export interface EmailConfig {
  from: string
  replyTo?: string
  bcc?: string[]
}

// =====================================================
// EMAIL TEMPLATE DATA TYPES
// =====================================================

export interface NewOrderEmailData {
  orderId: string
  orderNumber: string
  customerName: string
  customerEmail: string
  total: number
  currency: string
  channel: string
  paymentMethod?: string
  status?: string
  items: Array<{
    product_name: string
    quantity: number
    unit_price: number
    total: number
  }>
  actionUrl: string
}

export interface PendingTransferEmailData {
  orderId: string
  orderNumber: string
  customerName: string
  total: number
  currency: string
  actionUrl: string
}

export interface ArtistSubmissionEmailData {
  submissionId: string
  artistName: string
  email: string
  phone?: string
  genre?: string
  trackUrl?: string
  spotifyUrl?: string
  instagram?: string
  youtube?: string
  message?: string
  actionUrl: string
}

export interface LowStockEmailData {
  productId: string
  productName: string
  sku: string
  currentStock: number
  threshold: number
  actionUrl: string
}

export interface OrderCancelledEmailData {
  orderId: string
  orderNumber: string
  customerName: string
  total: number
  currency: string
  reason?: string
  actionUrl: string
}

export interface NewsletterWelcomeEmailData {
  email: string
  firstName?: string
  unsubscribeUrl?: string
}

export interface TestEmailData {
  message: string
  timestamp: string
}

// =====================================================
// EMAIL SEND RESULT
// =====================================================

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

// =====================================================
// EMAIL LOG
// =====================================================

export interface EmailLogEntry {
  notification_id?: string
  notification_type: NotificationType | 'newsletter_welcome' | 'test'
  recipient: string
  subject: string
  status: 'sent' | 'failed'
  error_message?: string
  message_id?: string
  sent_at: string
}
