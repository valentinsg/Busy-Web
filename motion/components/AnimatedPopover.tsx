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
  // Bloquear scroll del body y ocultar header cuando el popover está visible
  useEffect(() => {
    if (isVisible) {
      // Guardar el scroll actual
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'

      // Ocultar el header
      const header = document.querySelector('header')
      if (header) {
        header.style.opacity = '0'
        header.style.pointerEvents = 'none'
      }

      return () => {
        // Restaurar scroll
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)

        // Mostrar el header
        if (header) {
          header.style.opacity = ''
          header.style.pointerEvents = ''
        }
      }
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop - sin onClick para que solo se cierre con la X */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998] animate-in fade-in duration-200"
      />

      {/* Popover - centrado sin navbar */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-3xl max-h-[calc(100vh-6rem)] sm:max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  )
}
