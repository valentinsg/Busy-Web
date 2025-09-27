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
        initial={reduce ? false : { opacity: 0.92, y: 6 }}
        animate={reduce ? { opacity: 1, y: 0 } : { opacity: [0.92, 0.98, 1], y: [6, 2, 0], transition: { duration: 0.35, times: [0, 0.6, 1], ease: 'easeOut' } }}
        exit={reduce ? { opacity: 0.98 } : { opacity: 0.98, y: 2, transition: { duration: 0.2 } }}
        className="min-h-screen will-change-[opacity,transform]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
