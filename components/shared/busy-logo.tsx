"use client"

import { useChristmas } from "@/components/providers/christmas-provider"
import Image from "next/image"

interface BusyLogoProps {
  /** Logo variant: 'white' for white B logo, 'gothic' for text logo, 'full' for full brand logo */
  variant?: "white" | "gothic" | "full"
  /** Width in pixels */
  width?: number
  /** Height in pixels */
  height?: number
  /** Additional className */
  className?: string
  /** Alt text override */
  alt?: string
  /** Use fill instead of width/height */
  fill?: boolean
}

const LOGO_PATHS = {
  white: {
    normal: "/logo-busy-white.png",
    christmas: "/logo-busy-navidad.png",
  },
  gothic: {
    normal: "/busy-gothic.png",
    christmas: "/busy-gothic.png", // Gothic doesn't have christmas variant
  },
  full: {
    normal: "/brand/BUSY_LOGO TRANSPARENTE-3.png",
    christmas: "/brand/BUSY_LOGO TRANSPARENTE-3.png", // Full doesn't have christmas variant
  },
}

/**
 * Centralized Busy logo component that automatically switches to Christmas variant
 * when Christmas mode is enabled (only for 'white' variant).
 */
export function BusyLogo({
  variant = "white",
  width = 100,
  height = 100,
  className = "",
  alt = "Busy",
  fill = false,
}: BusyLogoProps) {
  const { isChristmasMode } = useChristmas()

  const paths = LOGO_PATHS[variant]
  const src = isChristmasMode && variant === "white" ? paths.christmas : paths.normal

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-contain ${className}`}
        unoptimized
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-contain ${className}`}
      unoptimized
    />
  )
}
