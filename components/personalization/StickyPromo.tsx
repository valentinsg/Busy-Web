"use client"

import React from 'react'
import { useBusySession } from '@/hooks/useBusySession'
import { shouldShowPromo } from '@/lib/personalization'

export type StickyPromoProps = {
  category: string
  threshold?: number
  message?: string
  className?: string
}

/**
 * StickyPromo renders a dismissible banner if clicks[category] > threshold.
 */
export function StickyPromo({ category, threshold = 3, message, className }: StickyPromoProps) {
  const session = useBusySession()
  const [hidden, setHidden] = React.useState(false)
  const show = shouldShowPromo(category, session, threshold)

  if (!show || hidden) return null

  return (
    <div className={className}>
      <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-white px-4 py-3 shadow-lg">
          <div className="text-sm text-neutral-800">
            {message ?? `Te gusta ${category}. Aprovechá las ofertas de esta categoría.`}
          </div>
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center rounded-md border border-neutral-300 px-3 text-xs hover:bg-neutral-50"
            onClick={() => setHidden(true)}
            aria-label="Cerrar"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default StickyPromo
