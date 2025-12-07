"use client"

import { useChristmas } from "@/components/providers/christmas-provider"
import Image from "next/image"

/**
 * Full-width Christmas garland divider
 * Can be placed between sections for festive decoration
 */
export function ChristmasGarlandDivider({ className = "" }: { className?: string }) {
  const { isChristmasMode } = useChristmas()

  if (!isChristmasMode) return null

  return (
    <div className={`relative w-full h-16 md:h-20 overflow-hidden pointer-events-none ${className}`}>
      <Image
        src="/festive-christmas-garland-seamless-and-endless-with-minimalist-decor-green-needles-lights-for-winter-holiday-decorations-isolated-on-transparent-background.png"
        alt=""
        fill
        className="object-cover object-center"
        style={{ objectPosition: "center top" }}
      />
    </div>
  )
}

/**
 * Christmas tree decoration for corners or small spaces
 */
export function ChristmasTreeDecoration({
  size = "md",
  className = ""
}: {
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const { isChristmasMode } = useChristmas()

  if (!isChristmasMode) return null

  const sizeClasses = {
    sm: "w-8 h-10",
    md: "w-12 h-16",
    lg: "w-16 h-20",
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <Image
        src="/arboles-de-navidadimagenes-arboles-de-navidad.png"
        alt=""
        fill
        className="object-contain"
      />
    </div>
  )
}

/**
 * Gift ribbon decoration
 */
export function ChristmasRibbonDecoration({
  size = "md",
  className = ""
}: {
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const { isChristmasMode } = useChristmas()

  if (!isChristmasMode) return null

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <Image
        src="/regalito-liston-navidad.png"
        alt=""
        fill
        className="object-contain"
      />
    </div>
  )
}
