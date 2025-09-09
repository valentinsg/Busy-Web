"use client"

import React from 'react'
import { useBusySession } from '@/hooks/useBusySession'

export type DynamicHeroProps = {
  defaultTitle: string
  defaultSub?: string
  ctaLabel?: string
  className?: string
}

/**
 * DynamicHero renders a hero section with copy adjusted to the user's lastCategory.
 * Falls back to provided defaults if session is empty.
 */
export function DynamicHero({ defaultTitle, defaultSub, ctaLabel = 'Shop now', className }: DynamicHeroProps) {
  const session = useBusySession()
  const lastCat = session.lastCategory?.trim()

  const title = lastCat ? `${defaultTitle} · ${capitalize(lastCat)}` : defaultTitle
  const sub = lastCat
    ? defaultSub ?? `Descubrí lo mejor en ${lastCat}. Recomendado para vos.`
    : defaultSub ?? 'Descubrí nuestros productos más populares.'

  return (
    <section className={className}>
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
        <p className="mt-3 text-base sm:text-lg text-neutral-600">{sub}</p>
        {ctaLabel ? (
          <div className="mt-6">
            <a href="/products" className="inline-block rounded-md bg-black text-white px-5 py-2 text-sm hover:bg-neutral-800">
              {ctaLabel}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function capitalize(s?: string | null): string {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default DynamicHero
