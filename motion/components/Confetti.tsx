'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../providers/ReducedMotionProvider'

interface ConfettiProps {
  active: boolean
  duration?: number
  particleCount?: number
  colors?: string[]
}

/**
 * Componente de confetti para celebraciones (descuentos aplicados, etc.)
 * Respeta prefers-reduced-motion
 */
export function Confetti({
  active,
  duration = 3000,
  particleCount = 50,
  colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!active || prefersReducedMotion || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      rotation: number
      rotationSpeed: number
      color: string
      size: number
      opacity: number
    }

    const particles: Particle[] = []

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        opacity: 1,
      })
    }

    let animationId: number
    const startTime = Date.now()

    function animate() {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const elapsed = Date.now() - startTime
      const progress = elapsed / duration

      particles.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.1 // gravity
        particle.rotation += particle.rotationSpeed

        // Fade out
        particle.opacity = Math.max(0, 1 - progress)

        // Draw particle
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate((particle.rotation * Math.PI) / 180)
        ctx.globalAlpha = particle.opacity
        ctx.fillStyle = particle.color
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
        ctx.restore()
      })

      if (progress < 1) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [active, duration, particleCount, colors, prefersReducedMotion])

  if (!active || prefersReducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
