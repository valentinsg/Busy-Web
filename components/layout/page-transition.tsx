"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"
import React from "react"

interface PageTransitionProps {
  children: React.ReactNode
}

// Minimal, immersive page transition (full-screen wrapper)
// - subtle fade + tiny translate + slight blur
// - short duration to keep it snappy
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const reduce = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduce ? false : { filter: 'blur(3px)' }}
        animate={{
          filter: reduce ? 'none' : ['blur(3px)', 'blur(1px)', 'blur(0px)'],
          transition: { duration: 0.42, times: [0, 0.5, 1] },
        }}
        className="min-h-screen will-change-[filter]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
