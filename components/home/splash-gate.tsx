"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { SplashScreen } from "@/components/home/splash-screen"

/**
 * SplashGate
 * - Appears immediately on homepage ("/") before any content (no flash).
 * - Shows on every visit to the homepage, not just first session.
 * - Hidden on all other routes.
 */
export function SplashGate() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  // Start as visible on homepage to avoid initial content flash
  const [shouldShow, setShouldShow] = useState<boolean>(isHome)

  // Reset visibility whenever the route changes
  useEffect(() => {
    setShouldShow(isHome)
  }, [isHome])

  const handleComplete = () => {
    setShouldShow(false)
  }

  if (!isHome || !shouldShow) return null

  return <SplashScreen onComplete={handleComplete} />
}
