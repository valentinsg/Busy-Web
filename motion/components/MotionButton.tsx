'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'
import { motionTokens } from '../tokens'
import { useReducedMotion } from '../providers/ReducedMotionProvider'

interface MotionButtonProps extends Omit<HTMLMotionProps<'button'>, 'whileHover' | 'whileTap'> {
  hoverScale?: number
  tapScale?: number
  children: React.ReactNode
}

/**
 * Botón con micro-interacciones de Framer Motion
 * Respeta prefers-reduced-motion
 */
export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ hoverScale = 1.05, tapScale = 0.95, children, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion()

    return (
      <motion.button
        ref={ref}
        whileHover={
          prefersReducedMotion
            ? undefined
            : {
                scale: hoverScale,
                transition: { duration: motionTokens.durations.fast },
              }
        }
        whileTap={
          prefersReducedMotion
            ? undefined
            : {
                scale: tapScale,
                transition: { duration: motionTokens.durations.instant },
              }
        }
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

MotionButton.displayName = 'MotionButton'
