'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { fadeIn as fadeInVariants } from '../registry'
import { motionTransitions, motionTokens } from '../tokens'
import { useReducedMotion } from '../providers/ReducedMotionProvider'

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'variants' | 'initial' | 'animate' | 'exit'> {
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: keyof typeof motionTokens.distance
  delay?: number
  duration?: keyof typeof motionTokens.durations
  children: React.ReactNode
}

/**
 * Componente FadeIn mejorado con tokens centralizados
 * Reemplaza el componente legacy components/ui/fade-in.tsx
 */
export function FadeIn({
  direction = 'up',
  distance = 'md',
  delay = 0,
  duration = 'normal',
  children,
  ...props
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion()
  const variants = fadeInVariants(direction, distance)

  // Si prefiere reducir movimiento, solo fade sin desplazamiento
  const reducedVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  return (
    <motion.div
      variants={prefersReducedMotion ? reducedVariants : variants}
      initial={false}
      whileInView="animate"
      viewport={{ once: false, amount: 0.2 }}
      transition={{
        duration: motionTokens.durations[duration],
        delay,
        ease: motionTokens.easings.easeOut,
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
