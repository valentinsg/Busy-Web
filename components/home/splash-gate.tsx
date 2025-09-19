"use client"

import { SplashScreen } from "@/components/home/splash-screen"
import { usePathname } from "next/navigation"

/**
 * SplashGate
 * - Solo se muestra en la Home ("/").
 * - Oculto en el resto del sitio para no impactar FCP.
 */
export function SplashGate() {
  const pathname = usePathname() || ""
  if (pathname !== "/") return null
  return <SplashScreen />
}
