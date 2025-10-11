'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  isPushSupported,
  getPermissionStatus,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
} from '@/lib/notifications/push'

export function usePushNotifications() {
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check support and permission on mount
  useEffect(() => {
    setSupported(isPushSupported())
    setPermission(getPermissionStatus())

    // Check if already subscribed
    getCurrentSubscription().then((sub) => {
      setSubscribed(!!sub)
    })
  }, [])

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!supported) {
      throw new Error('Push notifications not supported')
    }

    setLoading(true)

    try {
      // Request permission
      const perm = await requestNotificationPermission()
      setPermission(perm)

      if (perm !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // Get VAPID public key from env
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured')
      }

      // Subscribe to push
      const subscription = await subscribeToPush(vapidPublicKey)
      if (!subscription) {
        throw new Error('Failed to subscribe to push notifications')
      }

      // Save subscription to server
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          userAgent: navigator.userAgent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save push subscription')
      }

      setSubscribed(true)
      return true
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [supported])

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setLoading(true)

    try {
      const currentSub = await getCurrentSubscription()
      if (!currentSub) {
        setSubscribed(false)
        return true
      }

      // Unsubscribe from browser
      await unsubscribeFromPush()

      // Remove from server
      await fetch('/api/notifications/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: currentSub.endpoint }),
      })

      setSubscribed(false)
      return true
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    supported,
    permission,
    subscribed,
    loading,
    subscribe,
    unsubscribe,
  }
}
