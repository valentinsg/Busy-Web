'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { type ReactNode } from 'react'
import { motionTokens } from '../tokens'
import { useReducedMotion } from '../providers/ReducedMotionProvider'

interface AnimatedPopoverProps {
  isVisible: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * Wrapper animado para popovers
 * Entrada con scale + blur, salida suave
 */
export function AnimatedPopover({ isVisible, onClose, children }: AnimatedPopoverProps) {
  const prefersReducedMotion = useReducedMotion()

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const popoverVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      }
    : {
        hidden: {
          opacity: 0,
          scale: 0.9,
          y: 20,
          filter: 'blur(10px)',
        },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: 'blur(0px)',
        },
      }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: motionTokens.durations.fast }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Popover */}
          <motion.div
            variants={popoverVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{
              duration: motionTokens.durations.normal,
              ease: motionTokens.easings.easeOut,
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[95%] max-w-2xl"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
