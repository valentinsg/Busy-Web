"use client"

import * as React from "react"

// Lightweight confetti using pure CSS. Renders N pieces that fall and fade out.
// Usage: <ConfettiBurst key={someChangingKey} /> to re-trigger.
export function ConfettiBurst({ pieces = 24, duration = 1200 }: { pieces?: number; duration?: number }) {
  const [mounted, setMounted] = React.useState(true)
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(false), duration)
    return () => clearTimeout(t)
  }, [duration])
  if (!mounted) return null

  const items = Array.from({ length: pieces })
  return (
    <div className="pointer-events-none fixed inset-0 z-[1100] overflow-hidden">
      {items.map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 0.2
        const rotate = Math.floor(Math.random() * 360)
        const hue = Math.floor(Math.random() * 360)
        const size = 6 + Math.floor(Math.random() * 6)
        return (
          <span
            key={i}
            style={{
              left: `${left}%`,
              top: `-10px`,
              animationDelay: `${delay}s`,
              transform: `rotate(${rotate}deg)`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: `hsl(${hue} 90% 55%)`,
            }}
            className="absolute block opacity-0 animate-[confetti-fall_1.2s_ease-out_forwards] rounded-[1px] shadow-sm"
          />
        )
      })}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
