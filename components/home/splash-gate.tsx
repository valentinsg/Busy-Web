"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { SplashScreen } from "@/components/home/splash-screen"

/**
 * SplashGate
 * - Solo se muestra en la pantalla de inicio de sesión de admin ("/admin/sign-in").
 * - Oculto en el resto del sitio para no impactar FCP.
 */
export function SplashGate() {
  const pathname = usePathname()
  const isAuth = pathname === "/admin/sign-in"
  const disabled = process.env.NEXT_PUBLIC_DISABLE_SPLASH === "1" && !isAuth

  // Visible solo en /admin/sign-in (a menos que esté deshabilitado globalmente)
  const [shouldShow, setShouldShow] = useState<boolean>(isAuth && !disabled)

  // Reset visibility whenever the route changes
  useEffect(() => {
    setShouldShow(isAuth && !disabled)
  }, [isAuth, disabled])

  const handleComplete = () => {
    setShouldShow(false)
  }

  if (disabled || !isAuth || !shouldShow) return null

  return <SplashScreen onComplete={handleComplete} />
}
