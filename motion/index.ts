/**
 * Motion Layer - Sistema unificado de animaciones
 * 
 * Exporta todos los componentes, hooks y utilidades de animación
 */

// Tokens y configuración
export { motionTokens, motionVariants, motionTransitions } from './tokens'

// Registry y helpers
export * from './registry'

// Hooks
export { useGsap, useGsapScrollTrigger } from './useGsap'
export { useReducedMotion, ReducedMotionProvider } from './providers/ReducedMotionProvider'

// Componentes Framer Motion (micro-interacciones)
export { MotionButton } from './components/MotionButton'
export { MotionCard } from './components/MotionCard'
export { FadeIn } from './components/FadeIn'
export { StaggerContainer, StaggerItem } from './components/StaggerContainer'

// Componentes GSAP (scroll storytelling)
export { ScrollSection } from './components/ScrollSection'
export { ParallaxLayer } from './components/ParallaxLayer'
export { DiagonalTimeline } from './components/DiagonalTimeline'
export { RevealOnView } from './components/RevealOnView'

// Efectos especiales
export { Confetti } from './components/Confetti'
export { AnimatedPopover } from './components/AnimatedPopover'
