"use client"

import React from 'react'
import { useBusySession } from '@/hooks/useBusySession'
import type { RecentItem } from '@/lib/session'

export type RecentRailProps = {
  title?: string
  className?: string
  itemRenderer?: (item: RecentItem) => React.ReactNode
}

/**
 * RecentRail shows a simple grid/rail of recently viewed/clicked products from session.recent.
 * Does not depend on external libraries.
 */
export function RecentRail({ title = 'Vistos recientemente', className, itemRenderer }: RecentRailProps) {
  const session = useBusySession()
  const items = session.recent ?? []

  if (!items.length) return null

  return (
    <section className={className}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((it) => (
            <div key={it.id} className="group rounded-md border border-neutral-200 overflow-hidden bg-white">
              {itemRenderer ? (
                itemRenderer(it)
              ) : (
                <a href={`/product/${encodeURIComponent(it.id)}`} className="block">
                  <div className="aspect-square w-full overflow-hidden bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.img} alt={it.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="p-3 text-sm">
                    <div className="line-clamp-1 font-medium">{it.name}</div>
                    <div className="mt-1 text-neutral-600">{formatPrice(it.price)}</div>
                    <div className="mt-1 text-xs text-neutral-500">{it.category}</div>
                  </div>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function formatPrice(v: number): string {
  if (!Number.isFinite(v)) return ''
  // Simple ARS formatting default; adapt as needed
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v)
}

export default RecentRail
