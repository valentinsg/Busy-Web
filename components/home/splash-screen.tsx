"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import { useEffect, useState } from "react"

// Snowflake for splash screen
function SplashSnowflake({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="pointer-events-none fixed text-white select-none"
      style={style}
    >
      ❄
    </div>
  )
}

// Generate snowflakes for splash - pre-generated for instant display
const SPLASH_SNOWFLAKES = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  left: `${(i * 2.86) % 100}%`, // Distribute evenly
  animationDuration: `${3 + (i % 5)}s`,
  animationDelay: `${(i % 8) * 0.25}s`,
  fontSize: `${10 + (i % 4) * 5}px`,
  opacity: 0.3 + (i % 5) * 0.1,
}))

interface SplashScreenProps {
  onComplete?: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const [, setMatrixText] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  // Start with Christmas mode ON by default, then disable if API says no
  // This way snow shows immediately instead of waiting for API
  const [isChristmasMode, setIsChristmasMode] = useState(true)

  // Check if christmas mode is actually disabled
  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data?.christmas_mode) setIsChristmasMode(false)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%"

    // Matrix text effect
    const matrixInterval = setInterval(() => {
      const randomText = Array(8)
        .fill(0)
        .map(() => characters.charAt(Math.floor(Math.random() * characters.length)))
        .join("")
      setMatrixText(randomText)
    }, 50)

    // Progress bar animation - adjusted for 3 seconds total
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          clearInterval(matrixInterval)
          setTimeout(() => {
            setIsComplete(true)
            setTimeout(() => {
              // Inform the app that splash is complete
              try {
                window.dispatchEvent(new CustomEvent("busy:splash-complete"))
              } catch {}
              onComplete?.()
            }, 200)
          }, 300)
          return 100
        }
        return prev + 6.33 // Increment by ~3.33 to complete in 3 seconds (100/30)
      })
    }, 100) // Increased interval to 100ms

    return () => {
      clearInterval(interval)
      clearInterval(matrixInterval)
    }
  }, [onComplete])

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black transition-opacity duration-500 overflow-hidden",
        isComplete ? "opacity-0 pointer-events-none" : "opacity-100",
      )}
    >
      {/* Christmas snowfall effect */}
      {isChristmasMode && (
        <>
          {SPLASH_SNOWFLAKES.map((flake) => (
            <SplashSnowflake
              key={flake.id}
              style={{
                left: flake.left,
                top: "-30px",
                fontSize: flake.fontSize,
                opacity: flake.opacity,
                animation: `splashSnowfall ${flake.animationDuration} linear ${flake.animationDelay} infinite`,
                zIndex: 1,
              }}
            />
          ))}
          <style jsx global>{`
            @keyframes splashSnowfall {
              0% {
                transform: translateY(-30px) rotate(0deg) translateX(0);
                opacity: 0;
              }
              10% {
                opacity: 0.6;
              }
              50% {
                transform: translateY(50vh) rotate(180deg) translateX(30px);
              }
              90% {
                opacity: 0.4;
              }
              100% {
                transform: translateY(100vh) rotate(360deg) translateX(-20px);
                opacity: 0;
              }
            }
          `}</style>
        </>
      )}

      <div className="relative md:w-[680px] md:h-[680px] w-[380px] h-[380px] z-10">
        <Image
          src="/busy-charge.gif"
          alt="Busy"
          fill
          className="object-contain"
          priority
          unoptimized
        />
      </div>

      {/* Progress bar container */}
      <div className="w-64 h-1 bg-white/30 rounded-full overflow-hidden z-10">
        <div
          className={cn(
            "h-full transition-all duration-100 ease-out",
            isChristmasMode ? "bg-gradient-to-r from-red-500 via-green-500 to-red-500" : "bg-white"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Progress percentage */}
      <div className={cn(
        "mt-2 font-mono text-sm z-10",
        isChristmasMode ? "text-green-400" : "text-white"
      )}>
        {progress.toFixed(0)}%
      </div>

      {/* Christmas message */}
      {isChristmasMode && (
        <div className="mt-4 text-white/60 text-xs font-body italic z-10">
          ✨ Felices fiestas de parte de Busy ✨
        </div>
      )}
    </div>
  )
}

