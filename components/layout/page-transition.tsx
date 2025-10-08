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
        className="min-h-screen will-change-[opacity,transform]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
