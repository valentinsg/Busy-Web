/**
 * Motion Design Tokens
 * Valores centralizados para animaciones consistentes en toda la app
 */

export const motionTokens = {
  // Duraciones (en segundos)
  durations: {
    instant: 0.15,
    fast: 0.25,
    normal: 0.35,
    slow: 0.5,
    slower: 0.75,
    slowest: 1.0,
  },

  // Easings personalizados
  easings: {
    // Framer Motion
    easeOut: [0.25, 0.1, 0.25, 1.0] as const,
    easeIn: [0.42, 0, 1, 1] as const,
    easeInOut: [0.42, 0, 0.58, 1] as const,
    spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
    bounce: { type: 'spring' as const, stiffness: 400, damping: 10 },
    
    // GSAP
    gsapOut: 'power2.out',
    gsapIn: 'power2.in',
    gsapInOut: 'power2.inOut',
    elastic: 'elastic.out(1, 0.5)',
    back: 'back.out(1.7)',
  },

  // Stagger (para listas/grids)
  stagger: {
    fast: 0.03,
    normal: 0.05,
    slow: 0.1,
    slower: 0.15,
  },

  // Distancias de desplazamiento
  distance: {
    xs: 5,
    sm: 10,
    md: 20,
    lg: 30,
    xl: 50,
  },

  // Blur values
  blur: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '20px',
  },

  // Scale values
  scale: {
    sm: 0.95,
    md: 0.9,
    lg: 0.8,
    grow: 1.05,
    growMd: 1.1,
    growLg: 1.2,
  },
} as const

// Variantes predefinidas para Framer Motion
export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  fadeInUp: {
    initial: { opacity: 0, y: motionTokens.distance.md },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -motionTokens.distance.sm },
  },
  
  fadeInDown: {
    initial: { opacity: 0, y: -motionTokens.distance.md },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: motionTokens.distance.sm },
  },
  
  fadeInLeft: {
    initial: { opacity: 0, x: -motionTokens.distance.lg },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: motionTokens.distance.sm },
  },
  
  fadeInRight: {
    initial: { opacity: 0, x: motionTokens.distance.lg },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -motionTokens.distance.sm },
  },
  
  scaleIn: {
    initial: { opacity: 0, scale: motionTokens.scale.md },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: motionTokens.scale.sm },
  },
  
  blurIn: {
    initial: { opacity: 0, filter: `blur(${motionTokens.blur.lg})` },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: `blur(${motionTokens.blur.sm})` },
  },
} as const

// Transiciones predefinidas
export const motionTransitions = {
  fast: {
    duration: motionTokens.durations.fast,
    ease: motionTokens.easings.easeOut,
  },
  normal: {
    duration: motionTokens.durations.normal,
    ease: motionTokens.easings.easeOut,
  },
  slow: {
    duration: motionTokens.durations.slow,
    ease: motionTokens.easings.easeOut,
  },
  spring: motionTokens.easings.spring,
  bounce: motionTokens.easings.bounce,
} as const
