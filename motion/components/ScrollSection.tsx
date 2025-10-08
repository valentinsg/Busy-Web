'use client'

import { useRef, type ReactNode } from 'react'
import { useGsapScrollTrigger } from '../useGsap'
import { gsapFadeIn } from '../registry'

interface ScrollSectionProps {
  children: ReactNode
  className?: string
  trigger?: 'top' | 'center' | 'bottom'
  animation?: 'fade' | 'slide' | 'scale' | 'none'
}

/**
 * Sección con animación básica de ScrollTrigger
 * Se anima cuando entra en viewport
 */
export function ScrollSection({
  children,
  className = '',
  trigger = 'center',
  animation = 'fade',
}: ScrollSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGsapScrollTrigger((gsap, ScrollTrigger) => {
    if (!sectionRef.current) return

    const triggerMap = {
      top: 'top 80%',
      center: 'top 60%',
      bottom: 'top 90%',
    }

    const animationPresets = {
      fade: gsapFadeIn(),
      slide: { opacity: 0, x: -50, duration: 0.8, ease: 'power2.out' },
      scale: { opacity: 0, scale: 0.9, duration: 0.8, ease: 'power2.out' },
      none: {},
    }

    if (animation !== 'none') {
      gsap.from(sectionRef.current, {
        ...animationPresets[animation],
        scrollTrigger: {
          trigger: sectionRef.current,
          start: triggerMap[trigger],
          toggleActions: 'play none none reverse',
        },
      })
    }
  }, [trigger, animation])

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  )
}
