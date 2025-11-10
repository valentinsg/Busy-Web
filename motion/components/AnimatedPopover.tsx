'use client'

import { type ReactNode, useEffect } from 'react'

interface AnimatedPopoverProps {
  isVisible: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * Wrapper simple para popovers sin animaciones complejas
 */
export function AnimatedPopover({ isVisible, onClose, children }: AnimatedPopoverProps) {
  // Bloquear scroll del body cuando el popover está visible
  useEffect(() => {
    if (isVisible) {
      // Guardar el scroll actual
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      
      return () => {
        // Restaurar scroll
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop - sin onClick para que solo se cierre con la X */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999999] animate-in fade-in duration-200"
      />

      {/* Popover - centrado con más espacio del navbar en mobile */}
      <div className="fixed inset-0 z-[9999999] flex items-start justify-center pt-20 pb-4 px-3 sm:items-center sm:pt-20 sm:pb-4 sm:px-4 pointer-events-none overflow-y-auto">
        <div
          className="w-full max-w-3xl my-auto animate-in fade-in zoom-in-95 duration-300 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  )
}
