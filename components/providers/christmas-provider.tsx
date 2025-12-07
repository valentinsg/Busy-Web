"use client"

import { usePathname } from "next/navigation"
import * as React from "react"

// Snowflake component for individual snow particles
function Snowflake({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="pointer-events-none fixed text-white/30 select-none"
      style={style}
    >
      ❄
    </div>
  )
}

// Generate random snowflakes - fewer and more subtle
function generateSnowflakes(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${12 + Math.random() * 15}s`,
    animationDelay: `${Math.random() * 8}s`,
    fontSize: `${6 + Math.random() * 10}px`,
    opacity: 0.15 + Math.random() * 0.25,
  }))
}

// Snowfall effect component
function SnowfallEffect() {
  const [snowflakes, setSnowflakes] = React.useState<ReturnType<typeof generateSnowflakes>>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    setSnowflakes(generateSnowflakes(35))
  }, [])

  if (!mounted) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {snowflakes.map((flake) => (
        <Snowflake
          key={flake.id}
          style={{
            left: flake.left,
            top: "-20px",
            fontSize: flake.fontSize,
            opacity: flake.opacity,
            animation: `snowfall ${flake.animationDuration} linear ${flake.animationDelay} infinite`,
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) rotate(0deg) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(20px);
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translateY(100vh) rotate(360deg) translateX(-10px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Christmas decorations for navbar (subtle red/green accents)
function ChristmasDecorations() {
  return (
    <>
      {/* CSS variables for Christmas colors */}
      <style jsx global>{`
        :root {
          --christmas-red: #dc2626;
          --christmas-green: #16a34a;
          --christmas-gold: #fbbf24;
        }

        /* Subtle festive glow on brand elements */
        .christmas-active .logo-busy,
        .christmas-active [data-logo="busy"] {
          filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.3));
        }

        /* Festive accent on primary buttons */
        .christmas-active .btn-primary,
        .christmas-active [data-variant="default"] {
          box-shadow: 0 0 12px rgba(220, 38, 38, 0.2), 0 0 24px rgba(22, 163, 74, 0.1);
        }

        /* Subtle border glow on cards */
        .christmas-active .card,
        .christmas-active [data-card] {
          border-color: rgba(220, 38, 38, 0.1);
        }
      `}</style>
    </>
  )
}

interface ChristmasContextValue {
  isChristmasMode: boolean
}

const ChristmasContext = React.createContext<ChristmasContextValue>({
  isChristmasMode: false,
})

export function useChristmas() {
  return React.useContext(ChristmasContext)
}

interface ChristmasProviderProps {
  children: React.ReactNode
  initialEnabled?: boolean
}

export function ChristmasProvider({ children, initialEnabled = false }: ChristmasProviderProps) {
  const [isEnabled, setIsEnabled] = React.useState(initialEnabled)
  const [hasFetched, setHasFetched] = React.useState(false)
  const pathname = usePathname()

  // Don't show Christmas effects on admin pages
  const isAdminPage = pathname?.startsWith("/admin")

  // Fetch christmas_mode from settings on mount
  React.useEffect(() => {
    if (hasFetched) return

    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setIsEnabled(Boolean(data?.christmas_mode))
        }
      } catch {
        // Silently fail, keep default
      } finally {
        setHasFetched(true)
      }
    }

    fetchSettings()
  }, [hasFetched])

  const showEffects = isEnabled && !isAdminPage

  return (
    <ChristmasContext.Provider value={{ isChristmasMode: isEnabled }}>
      <div className={showEffects ? "christmas-active" : ""}>
        {showEffects && (
          <>
            <SnowfallEffect />
            <ChristmasDecorations />
          </>
        )}
        {children}
      </div>
    </ChristmasContext.Provider>
  )
}
