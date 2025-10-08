'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '../registry'
import { motionTokens } from '../tokens'
import { useReducedMotion } from '../providers/ReducedMotionProvider'

interface RevealOnViewProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  threshold?: number
  className?: string
  once?: boolean
}

/**
 * Componente que se revela cuando entra en viewport
 * Usa IntersectionObserver (más performante que ScrollTrigger para casos simples)
 * Respeta prefers-reduced-motion
 */
export function RevealOnView({
  children,
  direction = 'up',
  threshold = 0.1,
  className = '',
  once = true,
}: RevealOnViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) {
            observer.disconnect()
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, once])

  const variants = fadeIn(direction, 'md')
  
  // Si prefiere reducir movimiento, solo fade
  const reducedVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  }

  return (
    <motion.div
      ref={ref}
      variants={prefersReducedMotion ? reducedVariants : variants}
      initial="initial"
      animate={isVisible ? 'animate' : 'initial'}
      transition={{
        duration: motionTokens.durations.normal,
        ease: motionTokens.easings.easeOut,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
