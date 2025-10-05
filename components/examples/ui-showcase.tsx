"use client"

/**
 * Componente de ejemplo que muestra cómo usar los nuevos componentes de UI/UX
 * Este archivo es solo para referencia y no se usa en producción
 */

import { FadeIn } from "@/components/ui/fade-in"
import { Skeleton } from "@/components/ui/skeleton"
import { BusyLoader } from "@/components/ui/busy-loader"
import { useState } from "react"

export function UIShowcase() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="container mx-auto p-8 space-y-12">
      
      {/* Ejemplo 1: FadeIn con delays escalonados */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Ejemplo 1: Animaciones FadeIn</h2>
        
        <FadeIn>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">Primer elemento (delay: 0s)</h3>
            <p>Este elemento aparece primero con una animación suave.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">Segundo elemento (delay: 0.1s)</h3>
            <p>Este elemento aparece un poco después.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-xl font-semibold mb-2">Tercer elemento (delay: 0.2s)</h3>
            <p>Y este aparece al final, creando un efecto cascada.</p>
          </div>
        </FadeIn>
      </section>

      {/* Ejemplo 2: Skeletons con shimmer */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Ejemplo 2: Skeletons con efecto shimmer</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Card Skeleton</h3>
            <div className="p-6 border rounded-lg space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Product Skeleton</h3>
            <div className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      </section>

      {/* Ejemplo 3: BusyLoader */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Ejemplo 3: BusyLoader</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Tamaño pequeño</h3>
            <div className="border rounded-lg p-4">
              <BusyLoader size="sm" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Tamaño mediano</h3>
            <div className="border rounded-lg p-4">
              <BusyLoader size="md" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Fullscreen (click para probar)</h3>
          <button
            onClick={() => {
              setLoading(true)
              setTimeout(() => setLoading(false), 3000)
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Mostrar loader fullscreen (3s)
          </button>
        </div>

        {loading && <BusyLoader size="lg" fullScreen />}
      </section>

      {/* Ejemplo 4: Combinando todo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Ejemplo 4: Combinando FadeIn + Skeleton</h2>
        
        <FadeIn delay={0.1}>
          <div className="p-6 border rounded-lg space-y-4">
            <h3 className="text-xl font-semibold">Contenido con carga progresiva</h3>
            <p className="text-muted-foreground">
              Primero aparece el contenedor con FadeIn, y dentro puedes mostrar
              skeletons mientras cargan los datos reales.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Skeleton className="h-32 w-full rounded" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-32 w-full rounded" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-32 w-full rounded" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Código de ejemplo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Código de ejemplo</h2>
        
        <div className="p-6 border rounded-lg bg-muted/50 overflow-x-auto">
          <pre className="text-sm">
{`// Importar componentes
import { FadeIn } from "@/components/ui/fade-in"
import { Skeleton } from "@/components/ui/skeleton"
import { BusyLoader } from "@/components/ui/busy-loader"

// Usar FadeIn
<FadeIn delay={0.1}>
  <YourComponent />
</FadeIn>

// Usar Skeleton
<Skeleton className="h-10 w-64" />

// Usar BusyLoader
<BusyLoader size="md" />
<BusyLoader size="lg" fullScreen />
`}
          </pre>
        </div>
      </section>

    </div>
  )
}
