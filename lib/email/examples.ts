// =====================================================
// EMAIL SYSTEM - USAGE EXAMPLES
// Ejemplos de uso del sistema de emails
// =====================================================

import {
  sendEmail,
  sendAdminEmail,
  sendTestEmail,
  handleNotificationEmail,
} from '@/lib/email'
import type {
  NewOrderEmailData,
  PendingTransferEmailData,
  NewsletterWelcomeEmailData,
} from '@/types/email'

// =====================================================
// EXAMPLE 1: Send Test Email
// =====================================================

export async function exampleSendTestEmail() {
  // Send to default admin email
  const result1 = await sendTestEmail()
  console.log('Test email result:', result1)

  // Send to specific email
  const result2 = await sendTestEmail('custom@example.com')
  console.log('Custom test email result:', result2)
}

// =====================================================
// EXAMPLE 2: Send New Order Email (Manual)
// =====================================================

export async function exampleSendNewOrderEmail() {
  const orderData: NewOrderEmailData = {
    orderId: '123e4567-e89b-12d3-a456-426614174000',
    orderNumber: '123e4567',
    customerName: 'Juan Pérez',
    customerEmail: 'juan@example.com',
    total: 15000,
    currency: 'ARS',
    channel: 'online',
    items: [
      {
        product_name: 'Hoodie Busy Black',
        quantity: 2,
        unit_price: 6000,
        total: 12000,
      },
      {
        product_name: 'Remera Busy White',
        quantity: 1,
        unit_price: 3000,
        total: 3000,
      },
    ],
    actionUrl: 'https://busy.com.ar/admin/orders/123e4567',
  }

  const result = await sendAdminEmail({
    template: 'new_order',
    data: orderData,
    notificationType: 'new_order',
  })

  console.log('New order email result:', result)
}

// =====================================================
// EXAMPLE 3: Send Newsletter Welcome Email
// =====================================================

export async function exampleSendNewsletterWelcome() {
  const newsletterData: NewsletterWelcomeEmailData = {
    email: 'nuevo@subscriber.com',
    firstName: 'María',
    unsubscribeUrl: 'https://busy.com.ar/newsletter/unsubscribe?token=abc123',
  }

  const result = await sendEmail({
    to: newsletterData.email,
    template: 'newsletter_welcome',
    data: newsletterData,
    notificationType: 'newsletter_subscription',
  })

  console.log('Newsletter welcome result:', result)
}

// =====================================================
// EXAMPLE 4: Automatic Email on Notification
// =====================================================

export async function exampleHandleNotificationEmail() {
  // This would be called automatically when a notification is created
  // For example, in your order creation logic:

  const notificationId = '456e7890-e89b-12d3-a456-426614174000'
  const metadata = {
    order_id: '123e4567-e89b-12d3-a456-426614174000',
    total: 15000,
    channel: 'online',
    customer_name: 'Juan Pérez',
  }

  await handleNotificationEmail({
    notificationId,
    notificationType: 'new_order',
    metadata,
  })
}

// =====================================================
// EXAMPLE 5: Integration with Existing Code
// =====================================================

/**
 * Example: Add to your order creation endpoint
 * File: app/api/orders/route.ts
 */
export async function exampleOrderCreationIntegration() {
  // ... your existing order creation logic ...

  // After creating the order:
  const orderId = 'newly-created-order-id'

  // Create notification (this already exists in your system)
  // The notification trigger will create the notification in the database

  // Then send email (add this)
  const notificationId = 'notification-id-from-db'
  await handleNotificationEmail({
    notificationId,
    notificationType: 'new_order',
    metadata: {
      order_id: orderId,
      total: 15000,
      channel: 'online',
      customer_name: 'Juan Pérez',
    },
  })
}

// =====================================================
// EXAMPLE 6: Send Pending Transfer Email
// =====================================================

export async function exampleSendPendingTransferEmail() {
  const transferData: PendingTransferEmailData = {
    orderId: '789e0123-e89b-12d3-a456-426614174000',
    orderNumber: '789e0123',
    customerName: 'Ana García',
    total: 8500,
    currency: 'ARS',
    actionUrl: 'https://busy.com.ar/admin/orders/789e0123',
  }

  const result = await sendAdminEmail({
    template: 'pending_transfer',
    data: transferData,
    notificationType: 'pending_transfer',
  })

  console.log('Pending transfer email result:', result)
}

// =====================================================
// EXAMPLE 7: Check Email Configuration
// =====================================================

export async function exampleCheckEmailConfig() {
  const { isEmailConfigured, isEmailEnabledForType } = await import('@/lib/email')

  // Check if email system is configured
  if (!isEmailConfigured()) {
    console.log('⚠️ Email system not configured. Set RESEND_API_KEY in .env.local')
    return
  }

  // Check if emails are enabled for specific notification types
  const newOrderEnabled = await isEmailEnabledForType('new_order')
  const lowStockEnabled = await isEmailEnabledForType('low_stock')

  console.log('New order emails enabled:', newOrderEnabled)
  console.log('Low stock emails enabled:', lowStockEnabled)
}
