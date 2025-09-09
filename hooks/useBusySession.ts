"use client"

import { useEffect, useState } from 'react'
import type { BusySession } from '@/lib/session'
import { getSession, clearIfExpired } from '@/lib/session'

/**
 * Read BusySession once on mount. No subscription to storage changes.
 */
export function useBusySession(): BusySession {
  const [session, setSessionState] = useState<BusySession>(() => {
    if (typeof window === 'undefined') {
      // SSR fallback; values won't be used on server components
      return {
        lastCategory: null,
        recent: [],
        wishlist: [],
        clicks: {},
        seenModals: [],
        updatedAt: Date.now(),
        lastShownTop: null,
      }
    }
    clearIfExpired(90)
    return getSession()
  })

  useEffect(() => {
    // Ensure cleanup check on mount in client too
    clearIfExpired(90)
    setSessionState(getSession())
    // No subscription by design
  }, [])

  return session
}

export default useBusySession
