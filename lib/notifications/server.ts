import webpush from 'web-push'
import { getPushSubscriptions } from '@/lib/repo/notifications'
import type { PushNotificationPayload } from '@/types/notifications'

// =====================================================
// SERVER-SIDE PUSH NOTIFICATION SENDER
// =====================================================

/**
 * Initialize web-push with VAPID keys
 * Call this once at server startup
 */
export function initializeWebPush() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@busy.com'

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured. Push notifications will not work.')
    return false
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
  return true
}

/**
 * Send push notification to all subscribed devices
 */
export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<{ success: number; failed: number }> {
  // Initialize if not already done
  initializeWebPush()

  const subscriptions = await getPushSubscriptions()
  let success = 0
  let failed = 0

  const promises = subscriptions.map(async (sub) => {
    try {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      }

      await webpush.sendNotification(pushSubscription, JSON.stringify(payload))
      success++
    } catch (error: unknown) {
      console.error('Error sending push notification:', error)
      failed++

      // If subscription is invalid (410 Gone), delete it
      if ((error as { statusCode?: number }).statusCode === 410) {
        // TODO: Delete invalid subscription from database
        console.log('Subscription expired, should delete:', sub.endpoint)
      }
    }
  })

  await Promise.allSettled(promises)

  return { success, failed }
}

/**
 * Send push notification to specific endpoint
 */
export async function sendPushToEndpoint(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: PushNotificationPayload
): Promise<boolean> {
  initializeWebPush()

  try {
    const pushSubscription = {
      endpoint,
      keys: {
        p256dh,
        auth,
      },
    }

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload))
    return true
  } catch (error) {
    console.error('Error sending push notification:', error)
    return false
  }
}

/**
 * Generate VAPID keys (run once to generate keys)
 * Store the output in your .env file
 */
export function generateVapidKeys() {
  const vapidKeys = webpush.generateVAPIDKeys()
  console.log('VAPID Keys Generated:')
  console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey)
  console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey)
  return vapidKeys
}
