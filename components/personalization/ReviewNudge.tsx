"use client"

import React from 'react'
import { useBusySession } from '@/hooks/useBusySession'
import { markModalSeen } from '@/lib/session'

export type ReviewNudgeProps = {
  productId: string
  productName?: string
  delayMs?: number
  className?: string
}

/**
 * ReviewNudge shows a modal 30s after mount on PDP if not yet seen for this product.
 * The seen id is `review:<productId>` persisted in busy_session.seenModals.
 */
export function ReviewNudge({ productId, productName, delayMs = 30_000, className }: ReviewNudgeProps) {
  const session = useBusySession()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!productId) return
    const key = `review:${productId}`
    const already = session.seenModals?.includes(key)
    if (already) return

    const t = setTimeout(() => {
      setOpen(true)
      // mark seen so we don't show again
      markModalSeen(key)
    }, Math.max(0, delayMs))

    return () => clearTimeout(t)
  }, [productId, session.seenModals, delayMs])

  if (!open) return null

  return (
    <div className={className}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-md bg-white p-5 shadow-xl">
          <h3 className="text-lg font-semibold">¿Te gusta{productName ? ` ${productName}` : ''}?</h3>
          <p className="mt-2 text-sm text-neutral-700">
            Dejanos tu reseña para ayudar a otros compradores.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-md border border-neutral-300 px-3 text-sm hover:bg-neutral-50"
              onClick={() => setOpen(false)}
            >
              Más tarde
            </button>
            <a
              href={`#reviews`}
              className="inline-flex h-9 items-center justify-center rounded-md bg-black px-3 text-sm text-white hover:bg-neutral-800"
              onClick={() => setOpen(false)}
            >
              Escribir reseña
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewNudge
