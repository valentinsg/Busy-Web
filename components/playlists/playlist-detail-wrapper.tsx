'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PlaylistDetailWrapperProps {
  children: ReactNode
}

export function PlaylistDetailWrapper({ children }: PlaylistDetailWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.15,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  )
}
