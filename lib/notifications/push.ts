import type { PushNotificationPayload, PushSubscriptionData } from '@/types/notifications'

// =====================================================
// WEB PUSH API CLIENT
// =====================================================

/**
 * Check if browser supports push notifications
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * Get current permission status
 */
export function getPermissionStatus(): NotificationPermission {
  if (!isPushSupported()) return 'denied'
  return Notification.permission
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported')
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(
  vapidPublicKey: string
): Promise<PushSubscriptionData | null> {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported')
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })

    // Convert to our format
    const p256dh = arrayBufferToBase64(subscription.getKey('p256dh'))
    const auth = arrayBufferToBase64(subscription.getKey('auth'))

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh,
        auth,
      },
    }
  } catch (error) {
    console.error('Error subscribing to push:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
      return true
    }

    return false
  } catch (error) {
    console.error('Error unsubscribing from push:', error)
    return false
  }
}

/**
 * Get current push subscription
 */
export async function getCurrentSubscription(): Promise<PushSubscriptionData | null> {
  if (!isPushSupported()) return null

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) return null

    const p256dh = arrayBufferToBase64(subscription.getKey('p256dh'))
    const auth = arrayBufferToBase64(subscription.getKey('auth'))

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh,
        auth,
      },
    }
  } catch (error) {
    console.error('Error getting current subscription:', error)
    return null
  }
}

/**
 * Show local notification (for testing)
 */
export async function showLocalNotification(payload: PushNotificationPayload): Promise<void> {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported')
  }

  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    throw new Error('Notification permission denied')
  }

  const registration = await navigator.serviceWorker.ready
  await registration.showNotification(payload.title, {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/badge-72x72.png',
    data: payload.data,
    actions: payload.actions,
    tag: payload.tag,
    requireInteraction: payload.requireInteraction || false,
  })
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return ''

  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}
