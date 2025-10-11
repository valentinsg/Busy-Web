// =====================================================
// SERVICE WORKER FOR PUSH NOTIFICATIONS
// =====================================================

const CACHE_NAME = 'busy-notifications-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(self.clients.claim())
})

// Push event - receive push notification
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event)

  let data = {
    title: 'Busy Notification',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {},
  }

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() }
    } catch (e) {
      console.error('[Service Worker] Error parsing push data:', e)
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data,
    actions: data.actions || [],
    tag: data.tag || 'busy-notification',
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event)

  event.notification.close()

  // Handle action clicks
  if (event.action) {
    console.log('[Service Worker] Action clicked:', event.action)
    // Handle specific actions here
  }

  // Get the URL to open (from notification data or default)
  const urlToOpen = event.notification.data?.url || '/'

  // Open or focus the app
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }

        // Open new window if none found
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen)
        }
      })
  )
})

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event)
  // Track notification dismissal if needed
})

// Fetch event (optional - for offline support)
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return

  // Skip caching for API requests
  if (event.request.url.includes('/api/')) return

  // Basic cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})

// Message event (for communication with the app)
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
