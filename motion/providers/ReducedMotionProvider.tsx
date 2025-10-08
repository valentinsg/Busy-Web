'use client'

import { createContext, useEffect, useState, type ReactNode } from 'react'

export const ReducedMotionContext = createContext(false)

interface ReducedMotionProviderProps {
  children: ReactNode
}

/**
 * Provider que detecta prefers-reduced-motion y lo expone via Context
 * Usado por hooks de GSAP y componentes de animación
 */
export function ReducedMotionProvider({ children }: ReducedMotionProviderProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Detectar preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    setPrefersReducedMotion(mediaQuery.matches)

    // Listener para cambios en la preferencia
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return (
    <ReducedMotionContext.Provider value={prefersReducedMotion}>
      {children}
    </ReducedMotionContext.Provider>
  )
}

/**
 * Hook para acceder al estado de reduced motion
 */
export function useReducedMotion() {
  const prefersReducedMotion = useContext(ReducedMotionContext)
  return prefersReducedMotion
}

// Re-export del context para uso directo
import { useContext } from 'react'
export { useContext }
