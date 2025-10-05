"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface BusyLoaderProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  fullScreen?: boolean
}

const sizeMap = {
  sm: { container: "w-32 h-32", image: 128 },
  md: { container: "w-48 h-48", image: 192 },
  lg: { container: "w-64 h-64", image: 256 },
  xl: { container: "w-96 h-96", image: 384 },
}

export function BusyLoader({ 
  size = "md", 
  className,
  fullScreen = false 
}: BusyLoaderProps) {
  const { container, image } = sizeMap[size]

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
        <div className={cn("relative", container)}>
          <Image
            src="/busy-charge.gif"
            alt="Cargando..."
            width={image}
            height={image}
            className="object-contain"
            priority
            unoptimized
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className={cn("relative", container)}>
        <Image
          src="/busy-charge.gif"
          alt="Cargando..."
          width={image}
          height={image}
          className="object-contain"
          priority
          unoptimized
        />
      </div>
    </div>
  )
}
