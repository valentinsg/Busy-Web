'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { forwardRef } from 'react'
import { motionTokens } from '../tokens'
import { useReducedMotion } from '../providers/ReducedMotionProvider'

interface MotionCardProps extends Omit<HTMLMotionProps<'div'>, 'whileHover'> {
  hoverY?: number
  hoverScale?: number
  children: React.ReactNode
}

/**
 * Card con hover lift effect
 * Respeta prefers-reduced-motion
 */
export const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ hoverY = -4, hoverScale = 1.02, children, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion()

    return (
      <motion.div
        ref={ref}
        whileHover={
          prefersReducedMotion
            ? undefined
            : {
                y: hoverY,
                scale: hoverScale,
                transition: {
                  duration: motionTokens.durations.fast,
                  ease: motionTokens.easings.easeOut,
                },
              }
        }
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

MotionCard.displayName = 'MotionCard'
