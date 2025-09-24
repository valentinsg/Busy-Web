"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [clicked, setClicked] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [variant, setVariant] = useState<"default" | "pointer" | "text">("default")
  const [label, setLabel] = useState<string>("")
  const [heartbeat, setHeartbeat] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMounted(true)
    // Ensure visible even before first mouse move
    try {
      setPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    } catch {}

    // Function to compute whether the custom cursor should be enabled
    const computeEnabled = () => {
      try {
        if (typeof window === "undefined") return false
        const width = window.innerWidth
        if (width <= 1024) return false
        const supportsFineHover = window.matchMedia
          ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
          : false
        const ua = (navigator?.userAgent || navigator?.vendor || "").toLowerCase()
        const isMobileUA = /android|iphone|ipad|ipod|mobile|tablet|windows phone/.test(ua)
        // Enable on devices that support fine hover and are likely desktop (even if touch-capable)
        // We intentionally do NOT require maxTouchPoints === 0 because many laptops report touch.
        return supportsFineHover && !isMobileUA
      } catch {
        return false
      }
    }

    // Initial compute
    setEnabled(computeEnabled())

    // Re-compute on resize/orientation changes
    const onResize = () => setEnabled(computeEnabled())
    try {
      window.addEventListener("resize", onResize)
      window.addEventListener("orientationchange", onResize)
    } catch {}

    return () => {
      try {
        window.removeEventListener("resize", onResize)
        window.removeEventListener("orientationchange", onResize)
      } catch {}
    }
  }, [])

  // Manage mouse listeners strictly when enabled
  useEffect(() => {
    if (!enabled) return

    const getClickableLabel = (el: Element): string => {
      const clickableRoot = el.closest(
        'button, a[href], [role="button"], [onclick], input[type="button"], input[type="submit"], summary, label',
      ) as HTMLElement | null
      if (!clickableRoot) return ""

      const candidates = [
        clickableRoot.getAttribute("data-label"),
        clickableRoot.getAttribute("aria-label"),
        clickableRoot.getAttribute("title"),
        (clickableRoot as HTMLInputElement).value,
        clickableRoot.textContent,
      ].filter(Boolean) as string[]

      const raw = candidates.find((t) => t && t.trim().length > 0) || ""
      const trimmed = raw.replace(/\s+/g, " ").trim()
      // Limit length for aesthetics
      const short = trimmed.length > 18 ? trimmed.slice(0, 18) + "…" : trimmed
      return short.toUpperCase()
    }

    const resetDwell = () => {
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current)
        dwellTimerRef.current = null
      }

      setHeartbeat(false)
    }

    const scheduleDwell = () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current)
      dwellTimerRef.current = setTimeout(() => setHeartbeat(true), 650)
    }

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })

      // Detect hover target to personalize cursor
      const raw = e.target as EventTarget | null
      // Resolve to a proper Element (Text nodes do not have closest)
      const target: Element | null =
        raw && (raw as Element).closest
          ? (raw as Element)
          : (raw as Node | null)?.parentElement || null

      if (target) {
        // Is it a text input/editable?
        const textLike = target.closest(
          'input:not([type="button"]):not([type="submit"]):not([type="reset"]), textarea, [contenteditable=""], [contenteditable="true"]',
        )
        if (textLike) {
          setVariant("text")
          setLabel("")
          resetDwell()
          return
        }

        // Is it clickable (button/link/role/button, or CSS cursor: pointer)?
        let clickable: Element | null | boolean = target.closest(
          'button, a[href], [role="button"], [onclick], input[type="button"], input[type="submit"], summary, label',
        )
        if (!clickable) {
          try {
            clickable = typeof window !== "undefined" && window.getComputedStyle(target).cursor === "pointer"
          } catch {
            clickable = false
          }
        }

        if (clickable) {
          setVariant("pointer")
          setLabel(getClickableLabel(target) || "")
          // Start dwell heartbeat after a short pause
          setHeartbeat(false)
          scheduleDwell()
          return
        }

        setVariant("default")
        setLabel("")
        resetDwell()
      }
    }

    const handleClick = () => {
      setClicked(true)
      setTimeout(() => setClicked(false), 300)
    }

    window.addEventListener("mousemove", updatePosition)
    window.addEventListener("click", handleClick)

    return () => {
      window.removeEventListener("mousemove", updatePosition)
      window.removeEventListener("click", handleClick)
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current)
        dwellTimerRef.current = null
      }
    }
  }, [enabled])

  // Toggle a class on <html> so CSS only hides the native cursor when our custom cursor is actually active
  useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    if (enabled) {
      root.classList.add("has-custom-cursor")
    } else {
      root.classList.remove("has-custom-cursor")
    }
    return () => {
      root.classList.remove("has-custom-cursor")
    }
  }, [enabled])

  // Ensure we are in browser before using portal
  if (!mounted || !enabled || typeof window === "undefined" || typeof document === "undefined") return null

  return createPortal(
    <div
      className={`custom-cursor ${clicked ? "cursor-click" : ""} ${
        variant === "pointer" ? "cursor-pointer is-pointer" : variant === "text" ? "cursor-text" : ""
      } ${heartbeat && variant === "pointer" ? "cursor-heartbeat" : ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: "fixed",
        width: 22,
        height: 22,
        border: "2px solid rgba(255,255,255,0.95)",
        borderRadius: 9999,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 2147483647,
        backgroundColor: "rgba(255,255,255,0.05)",
        mixBlendMode: "difference",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.12), 0 0 10px rgba(0,0,0,0.25)",
      }}
      aria-hidden="true"
      role="presentation"
    >
      {variant === "pointer" && (
        <>
          <div className="cursor-ring" />
          {label && <div className="cursor-label">{label}</div>}
        </>
      )}
    </div>,
    document.body,
  )
}

