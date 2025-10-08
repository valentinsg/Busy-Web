'use client'
import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import Image from 'next/image'
import React from 'react'

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsLoading(false)
      },
    })

    // Animación del logo
    tl.from('.loader-logo', {
      scale: 0.5,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.7)',
    })
      .to('.loader-logo', {
        scale: 1.1,
        duration: 0.3,
        ease: 'power2.inOut',
      })
      .to('.loader-logo', {
        scale: 1,
        duration: 0.2,
      })
      .to('.loader-overlay', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      })
  }, [])

  if (!isLoading) return null

  return (
    <div className="loader-overlay fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="loader-logo relative h-32 w-32 md:h-40 md:w-40">
        <Image
          src="/logo-busy-white.png"
          alt="Busy"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}
