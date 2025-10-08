'use client'

import { useRef, type ReactNode, type CSSProperties } from 'react'
import { useGsapScrollTrigger } from '../useGsap'

interface ParallaxLayerProps {
  children: ReactNode
  speed?: number
  className?: string
  style?: CSSProperties
}

/**
 * Layer con efecto parallax
 * speed: 0.5 = se mueve a la mitad de velocidad del scroll (más lento)
 * speed: 2 = se mueve al doble de velocidad del scroll (más rápido)
 */
export function ParallaxLayer({
  children,
  speed = 0.5,
  className = '',
  style = {},
}: ParallaxLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null)

  useGsapScrollTrigger((gsap, ScrollTrigger) => {
    if (!layerRef.current) return

    gsap.to(layerRef.current, {
      y: () => window.innerHeight * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: layerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, [speed])

  return (
    <div
      ref={layerRef}
      className={className}
      style={{
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
