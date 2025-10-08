'use client'

import { useRef, type ReactNode } from 'react'
import { useGsapScrollTrigger } from '../useGsap'
import { generateDiagonalPath } from '../registry'
import { motionTokens } from '../tokens'

interface DiagonalTimelineProps {
  items: Array<{
    id: string
    content: ReactNode
  }>
  className?: string
  pathColor?: string
  alternateSides?: boolean
  stagger?: number
}

/**
 * Timeline diagonal con SVG path animado y items con stagger
 * Ideal para secciones de historia/timeline
 */
export function DiagonalTimeline({
  items,
  className = '',
  pathColor = 'hsl(var(--accent-brand))',
  alternateSides = true,
  stagger = 0.2,
}: DiagonalTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  useGsapScrollTrigger((gsap, ScrollTrigger) => {
    if (!containerRef.current) return

    // Animar el path SVG
    if (pathRef.current) {
      const pathLength = pathRef.current.getTotalLength()
      
      gsap.set(pathRef.current, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      })

      gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
          end: 'bottom 30%',
          scrub: 1,
        },
      })
    }

    // Animar items con stagger
    gsap.from('.diagonal-timeline-item', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      x: -30,
      duration: 0.8,
      stagger: stagger,
      ease: motionTokens.easings.gsapOut,
    })
  }, [stagger])

  // Generar path dinámico basado en cantidad de items
  const pathD = generateDiagonalPath(20, 20, items.length * 120, items.length)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* SVG Path */}
      <svg
        className="absolute left-0 top-0 w-full h-full pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="timeline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={pathColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={pathColor} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          d={pathD}
          fill="none"
          stroke="url(#timeline-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Items */}
      <div className="relative space-y-6 md:space-y-8 pl-8 md:pl-12">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="diagonal-timeline-item relative"
            style={{
              marginLeft: alternateSides && index % 2 === 0 ? '0' : '20px',
            }}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  )
}
