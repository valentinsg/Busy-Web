"use client"

import { useChristmas } from "@/components/providers/christmas-provider"

/**
 * Christmas tree pattern background for product cards.
 * Only renders when Christmas mode is enabled.
 * Uses CSS conic gradients to create a festive tree pattern.
 */
export function ChristmasTreeBackground({ className = "" }: { className?: string }) {
  const { isChristmasMode } = useChristmas()

  if (!isChristmasMode) return null

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        // Christmas tree pattern with darker, more subtle colors
        ["--s" as string]: "60px",
        ["--_c" as string]: "#0000, rgba(255,255,255,0.6) 1deg 79deg, #0000 81deg",
        ["--g0" as string]: "conic-gradient(from 140deg at 50% 87.5%, var(--_c))",
        ["--g1" as string]: "conic-gradient(from 140deg at 50% 81.25%, var(--_c))",
        ["--g2" as string]: "conic-gradient(from 140deg at 50% 75%, var(--_c))",
        ["--g3" as string]: "conic-gradient(at 10% 20%, #0000 75%, rgba(255,255,255,0.5) 0)",
        background: `
          var(--g0) 0 calc(var(--s) / -4),
          var(--g0) var(--s) calc(3 * var(--s) / 4),
          var(--g1),
          var(--g1) var(--s) var(--s),
          var(--g2) 0 calc(var(--s) / 4),
          var(--g2) var(--s) calc(5 * var(--s) / 4),
          var(--g3) calc(var(--s) / -10) var(--s),
          var(--g3) calc(9 * var(--s) / 10) calc(2 * var(--s)),
          repeating-conic-gradient(from 45deg, #0f3d0f 0 25%, #1a5c1a 0 50%)
        `,
        backgroundSize: "calc(2 * var(--s)) calc(2 * var(--s))",
        opacity: 0.35,
      }}
    />
  )
}

/**
 * Snow accumulation effect for the top of product cards
 * z-[5] to be below badges, positioned higher up
 */
export function SnowAccumulation({ className = "" }: { className?: string }) {
  const { isChristmasMode } = useChristmas()

  if (!isChristmasMode) return null

  return (
    <div
      className={`absolute -top-10 left-0 right-0 h-12 pointer-events-none z-[5] ${className}`}
      style={{
        background: `
          /* Main snow layer - bigger piles */
          radial-gradient(ellipse 18px 10px at 5% 100%, rgba(255,255,255,0.95) 50%, transparent 50%),
          radial-gradient(ellipse 25px 12px at 18% 100%, rgba(255,255,255,0.92) 50%, transparent 50%),
          radial-gradient(ellipse 20px 9px at 35% 100%, rgba(255,255,255,0.95) 50%, transparent 50%),
          radial-gradient(ellipse 28px 14px at 52% 100%, rgba(255,255,255,0.9) 50%, transparent 50%),
          radial-gradient(ellipse 22px 10px at 70% 100%, rgba(255,255,255,0.95) 50%, transparent 50%),
          radial-gradient(ellipse 24px 11px at 85% 100%, rgba(255,255,255,0.92) 50%, transparent 50%),
          radial-gradient(ellipse 16px 8px at 97% 100%, rgba(255,255,255,0.95) 50%, transparent 50%),
          /* Secondary layer - smaller details */
          radial-gradient(ellipse 10px 5px at 12% 95%, rgba(255,255,255,0.8) 50%, transparent 50%),
          radial-gradient(ellipse 8px 4px at 42% 92%, rgba(255,255,255,0.75) 50%, transparent 50%),
          radial-gradient(ellipse 12px 6px at 62% 95%, rgba(255,255,255,0.8) 50%, transparent 50%),
          radial-gradient(ellipse 9px 4px at 78% 93%, rgba(255,255,255,0.75) 50%, transparent 50%)
        `,
        filter: "blur(0.3px)",
      }}
    />
  )
}

/**
 * Festive garland decoration for card corners
 */
export function FestiveGarland({
  position = "top-left",
  className = ""
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  className?: string
}) {
  const { isChristmasMode } = useChristmas()

  if (!isChristmasMode) return null

  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0 -scale-x-100",
    "bottom-left": "bottom-0 left-0 -scale-y-100",
    "bottom-right": "bottom-0 right-0 -scale-x-100 -scale-y-100",
  }

  return (
    <div
      className={`absolute w-12 h-12 pointer-events-none z-20 ${positionClasses[position]} ${className}`}
      style={{
        backgroundImage: "url(/festive-garland.png)",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        opacity: 0.85,
      }}
    />
  )
}
