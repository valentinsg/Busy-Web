"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface SplashScreenProps {
  onComplete?: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0)
  const [, setMatrixText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

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
        "fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black transition-opacity duration-500",
        isComplete ? "opacity-0 pointer-events-none" : "opacity-100",
      )}
    >
      <div className="relative md:w-[680px] md:h-[680px] w-[380px] h-[380px]">
        <Image
          src="/busy-charge.gif"
          alt="Busy"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Progress bar container */}
      <div className="w-64 h-1 bg-white/30 rounded-full overflow-hidden">
        <div className="h-full bg-white transition-all duration-100 ease-out" style={{ width: `${progress}%` }} />
      </div>
      {/* Progress percentage */}
      <div className="mt-2 font-mono text-sm text-white">{progress.toFixed(0)}%</div>
    </div>
  )
}

