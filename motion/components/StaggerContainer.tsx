'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { staggerContainer, staggerItem } from '../registry'
import { motionTokens } from '../tokens'
import { useReducedMotion } from '../providers/ReducedMotionProvider'

interface StaggerContainerProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  stagger?: keyof typeof motionTokens.stagger
  children: React.ReactNode
}

/**
 * Container que aplica stagger a sus hijos
 */
export function StaggerContainer({ stagger = 'normal', children, ...props }: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion()
  const variants = staggerContainer(stagger)

  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : variants}
      initial={false}
      whileInView="animate"
      viewport={{ once: false, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  direction?: 'up' | 'down' | 'left' | 'right'
  children: React.ReactNode
}

/**
 * Item individual dentro de un StaggerContainer
 */
export function StaggerItem({ direction = 'up', children, ...props }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion()
  const variants = staggerItem(direction)

  // Si prefiere reducir movimiento, solo fade
  const reducedVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  }

  return (
    <motion.div
      variants={prefersReducedMotion ? reducedVariants : variants}
      initial={false}
      whileInView="animate"
      viewport={{ once: false, amount: 0.2 }}
      {...props}
      style={{ opacity: 1, ...(props as any).style }}
    >
      {children}
    </motion.div>
  )
}
