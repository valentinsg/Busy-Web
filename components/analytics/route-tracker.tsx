"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const DEBUG = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true"

function trackPageview(url: string, opts?: { skipFbq?: boolean }) {
  if (typeof window === "undefined") return
  if ((window as any).gtag && GA_ID) {
    ;(window as any).gtag("config", GA_ID, { page_path: url })
  }
  if (!opts?.skipFbq && (window as any).fbq && META_PIXEL_ID) {
    ;(window as any).fbq("track", "PageView")
  }
  if ((window as any).dataLayer) {
    ;(window as any).dataLayer.push({ event: "pageview", page_path: url })
  }
  if (DEBUG) {
    console.log("analytics:pageview", { url })
  }
}

export default function RouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const firstRun = useRef(true)

  useEffect(() => {
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams?.toString()}`
      : pathname || "/"
    const skipFbq = firstRun.current
    firstRun.current = false
    trackPageview(url, { skipFbq })
  }, [pathname, searchParams])

  return null
}
