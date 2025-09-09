import React from 'react'
import DynamicHero from '@/components/personalization/DynamicHero'
import RecentRail from '@/components/personalization/RecentRail'
import StickyPromo from '@/components/personalization/StickyPromo'
import ReviewNudge from '@/components/personalization/ReviewNudge'
import SandboxClient from '@/components/personalization/SandboxClient'
import { setLastCategoryCookie } from '@/app/actions/setLastCategory'

export const dynamic = 'force-dynamic'

export default function PersonalizationSandboxPage() {
  async function setCookie(formData: FormData) {
    'use server'
    const cat = String(formData.get('cat') || '')
    await setLastCategoryCookie(cat)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Sandbox · Personalization</h1>
      <p className="text-sm text-neutral-600 mb-6">
        Esta página es de prueba. Podés interactuar con la sesión del cliente y setear la cookie lastCategory vía Server Action.
      </p>

      <form action={setCookie} className="mb-8 flex gap-2">
        <input
          type="text"
          name="cat"
          placeholder="Categoría (p. ej., hoodies)"
          className="w-64 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          required
        />
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800"
        >
          Setear cookie lastCategory
        </button>
      </form>

      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-semibold mb-3">Componentes</h2>
          <DynamicHero defaultTitle="Bienvenido a Busy" ctaLabel="Ver productos" />
          <RecentRail />
          <StickyPromo category="hoodies" threshold={3} />
          <div className="mt-10">
            <ReviewNudge productId="p1" productName="Producto Demo" />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Controles de sesión</h2>
          <SandboxClient />
        </section>
      </div>
    </div>
  )
}
