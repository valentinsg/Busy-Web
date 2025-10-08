import { useEffect, useRef, useContext, type DependencyList } from 'react'
import { ReducedMotionContext } from './providers/ReducedMotionProvider'

/**
 * Hook seguro para usar GSAP con cleanup automático
 * Compatible con React StrictMode y prefers-reduced-motion
 * 
 * @example
 * ```tsx
 * useGsap((gsap, ctx) => {
 *   gsap.from('.element', { opacity: 0, y: 20 })
 * }, [])
 * ```
 */
export function useGsap(
  callback: (gsap: typeof import('gsap').gsap, ctx: gsap.Context) => void | (() => void),
  deps: DependencyList = []
) {
  const contextRef = useRef<gsap.Context | null>(null)
  const prefersReducedMotion = useContext(ReducedMotionContext)

  useEffect(() => {
    // Si el usuario prefiere reducir movimiento, no ejecutar animaciones GSAP
    if (prefersReducedMotion) {
      return
    }

    let cleanup: void | (() => void)

    // Lazy import de GSAP para tree-shaking
    import('gsap').then(({ gsap }) => {
      // Crear contexto GSAP para cleanup automático
      const ctx = gsap.context(() => {
        cleanup = callback(gsap, ctx)
      })
      
      contextRef.current = ctx
    })

    return () => {
      // Cleanup del contexto GSAP
      contextRef.current?.revert()
      contextRef.current = null
      
      // Cleanup personalizado del callback
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Hook para usar GSAP ScrollTrigger con cleanup automático
 * 
 * @example
 * ```tsx
 * useGsapScrollTrigger((gsap, ScrollTrigger) => {
 *   gsap.to('.element', {
 *     scrollTrigger: {
 *       trigger: '.section',
 *       start: 'top center',
 *       end: 'bottom center',
 *       scrub: true,
 *     },
 *     x: 100
 *   })
 * }, [])
 * ```
 */
export function useGsapScrollTrigger(
  callback: (
    gsap: typeof import('gsap').gsap,
    ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger,
    ctx: gsap.Context
  ) => void | (() => void),
  deps: DependencyList = []
) {
  const contextRef = useRef<gsap.Context | null>(null)
  const prefersReducedMotion = useContext(ReducedMotionContext)

  useEffect(() => {
    // Si el usuario prefiere reducir movimiento, no ejecutar ScrollTrigger
    if (prefersReducedMotion) {
      return
    }

    let cleanup: void | (() => void)

    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ]).then(([{ gsap }, { ScrollTrigger }]) => {
      // Registrar plugin
      gsap.registerPlugin(ScrollTrigger)

      // Crear contexto GSAP
      const ctx = gsap.context(() => {
        cleanup = callback(gsap, ScrollTrigger, ctx)
      })

      contextRef.current = ctx
    })

    return () => {
      // Matar todos los ScrollTriggers del contexto
      contextRef.current?.revert()
      contextRef.current = null

      // Cleanup personalizado
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
