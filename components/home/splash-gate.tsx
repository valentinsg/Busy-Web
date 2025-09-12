"use client"

import { SplashScreen } from "@/components/home/splash-screen"

/**
 * SplashGate
 * - Solo se muestra en la pantalla de inicio de sesión de admin ("/admin/sign-in").
 * - Oculto en el resto del sitio para no impactar FCP.
 */
export function SplashGate() {

  return <SplashScreen />
}
