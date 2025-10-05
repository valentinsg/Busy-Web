"use client"

import { motion, HTMLMotionProps } from "framer-motion"
import { ReactNode } from "react"

interface FadeInProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode
  delay?: number
  duration?: number
  blur?: boolean
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.4,
  blur = true,
  ...props 
}: FadeInProps) {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 10,
        filter: blur ? "blur(4px)" : "blur(0px)"
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        filter: "blur(0px)"
      }}
      transition={{ 
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0]
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
