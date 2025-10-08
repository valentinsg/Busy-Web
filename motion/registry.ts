import { motionTokens } from './tokens'
import type { Variants } from 'framer-motion'

/**
 * Registry de animaciones reutilizables
 * Helpers y factories para crear animaciones complejas
 */

// ============= FRAMER MOTION HELPERS =============

/**
 * Crea variantes de fadeIn con dirección personalizada
 */
export function fadeIn(
  direction: 'up' | 'down' | 'left' | 'right' | 'none' = 'up',
  distance: keyof typeof motionTokens.distance = 'md'
): Variants {
  const offset = motionTokens.distance[distance]
  
  const directionMap = {
    up: { y: offset },
    down: { y: -offset },
    left: { x: offset },
    right: { x: -offset },
    none: {},
  }

  return {
    initial: { opacity: 0, ...directionMap[direction] },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0 },
  }
}

/**
 * Crea variantes de slideIn desde un eje
 */
export function slideIn(
  axis: 'x' | 'y',
  distance: number = motionTokens.distance.lg
): Variants {
  return {
    initial: { [axis]: distance },
    animate: { [axis]: 0 },
    exit: { [axis]: -distance },
  }
}

/**
 * Crea variantes de scale con blur opcional
 */
export function scaleIn(withBlur = false): Variants {
  return {
    initial: {
      opacity: 0,
      scale: motionTokens.scale.md,
      ...(withBlur && { filter: `blur(${motionTokens.blur.lg})` }),
    },
    animate: {
      opacity: 1,
      scale: 1,
      ...(withBlur && { filter: 'blur(0px)' }),
    },
    exit: {
      opacity: 0,
      scale: motionTokens.scale.sm,
    },
  }
}

/**
 * Crea variantes de stagger para listas
 */
export function staggerContainer(
  staggerDelay: keyof typeof motionTokens.stagger = 'normal'
): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: motionTokens.stagger[staggerDelay],
      },
    },
  }
}

/**
 * Variantes para items dentro de un stagger container
 */
export function staggerItem(direction: 'up' | 'down' | 'left' | 'right' = 'up'): Variants {
  return fadeIn(direction, 'sm')
}

// ============= GSAP HELPERS =============

/**
 * Configuración base para ScrollTrigger scenes
 */
export interface ScrollSceneConfig {
  trigger: string | Element
  start?: string
  end?: string
  scrub?: boolean | number
  pin?: boolean
  markers?: boolean
  toggleActions?: string
  onEnter?: () => void
  onLeave?: () => void
  onEnterBack?: () => void
  onLeaveBack?: () => void
}

/**
 * Factory para crear ScrollTrigger scenes consistentes
 */
export function makeScrollScene(config: ScrollSceneConfig) {
  return {
    trigger: config.trigger,
    start: config.start || 'top 80%',
    end: config.end || 'bottom 20%',
    scrub: config.scrub ?? false,
    pin: config.pin ?? false,
    markers: config.markers ?? false,
    toggleActions: config.toggleActions || 'play none none reverse',
    onEnter: config.onEnter,
    onLeave: config.onLeave,
    onEnterBack: config.onEnterBack,
    onLeaveBack: config.onLeaveBack,
  }
}

/**
 * Configuración para parallax effect
 */
export function parallax(speed: number = 0.5) {
  return {
    y: `${speed * 100}%`,
    ease: 'none',
  }
}

/**
 * Configuración para diagonal timeline
 */
export interface DiagonalTimelineConfig {
  items: string | Element[]
  alternateSides?: boolean
  skewDeg?: number
  stagger?: number
}

export function diagonalTimeline(config: DiagonalTimelineConfig) {
  return {
    items: config.items,
    alternateSides: config.alternateSides ?? true,
    skewDeg: config.skewDeg ?? 2,
    stagger: config.stagger ?? 0.2,
  }
}

/**
 * Preset para reveal con blur
 */
export function revealWithBlur() {
  return {
    opacity: 0,
    y: 100,
    filter: `blur(${motionTokens.blur.xl})`,
    duration: 1.2,
    ease: motionTokens.easings.gsapOut,
  }
}

/**
 * Preset para fade in básico (GSAP)
 */
export function gsapFadeIn(distance: number = motionTokens.distance.md) {
  return {
    opacity: 0,
    y: distance,
    duration: motionTokens.durations.normal,
    ease: motionTokens.easings.gsapOut,
  }
}

/**
 * Preset para slide in (GSAP)
 */
export function gsapSlideIn(axis: 'x' | 'y', distance: number = motionTokens.distance.lg) {
  return {
    [axis]: distance,
    duration: motionTokens.durations.slow,
    ease: motionTokens.easings.gsapOut,
  }
}

// ============= UTILITY FUNCTIONS =============

/**
 * Calcula el delay para stagger basado en índice
 */
export function calculateStaggerDelay(
  index: number,
  staggerType: keyof typeof motionTokens.stagger = 'normal'
): number {
  return index * motionTokens.stagger[staggerType]
}

/**
 * Genera una curva de path SVG para timeline diagonal
 */
export function generateDiagonalPath(
  startX: number,
  startY: number,
  endY: number,
  segments: number = 3
): string {
  const points: string[] = [`M ${startX} ${startY}`]
  const segmentHeight = (endY - startY) / segments
  
  for (let i = 1; i <= segments; i++) {
    const y = startY + segmentHeight * i
    const controlY = y - segmentHeight / 2
    const offsetX = i % 2 === 0 ? 40 : -20
    
    points.push(`Q ${startX + offsetX} ${controlY}, ${startX} ${y}`)
  }
  
  return points.join(' ')
}
