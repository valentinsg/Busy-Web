import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, MessageSquare } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Cambios y Devoluciones | Busy Streetwear',
  description: 'Conocé nuestra política de cambios y devoluciones en Busy Streetwear. Tiempos, condiciones y pasos para realizar cambios o devoluciones de tus productos.',
  alternates: {
    canonical: 'https://busy.com.ar/legal/returns',
  },
}

export default function ReturnsPolicy() {
  return (
    <div className="container max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-6 -ml-4">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </Button>

        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Política de Cambios y Devoluciones
        </h1>

        <p className="text-muted-foreground mb-8">
          En Busy Streetwear queremos que estés conforme con tu compra. Si necesitás realizar un cambio o devolución, podés hacerlo siguiendo las condiciones detalladas a continuación.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              📦 Cambios
            </h2>
            <ul className="space-y-3 pl-6 list-disc">
              <li>Aceptamos cambios dentro de los 15 días posteriores a la entrega.</li>
              <li>Se pueden cambiar prendas por:
                <ul className="mt-2 space-y-1 pl-6 list-disc">
                  <li>Talle equivocado</li>
                  <li>Color equivocado</li>
                  <li>Otro producto del mismo valor o pagando la diferencia</li>
                </ul>
              </li>
              <li>Requisitos:
                <ul className="mt-2 space-y-1 pl-6 list-disc">
                  <li>Producto en perfecto estado, sin uso y con etiquetas</li>
                  <li>Comprobante o número de pedido</li>
                </ul>
              </li>
              <li>Los costos de envío corren por cuenta del cliente, excepto si se trata de un error nuestro.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              🔁 Devoluciones
            </h2>
            <ul className="space-y-3 pl-6 list-disc">
              <li>Aceptamos devoluciones únicamente si:
                <ul className="mt-2 space-y-1 pl-6 list-disc">
                  <li>El producto llegó defectuoso</li>
                  <li>El producto recibido no coincide con lo comprado</li>
                </ul>
              </li>
              <li>En estos casos Busy cubre el costo del envío.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-red-500">
              ⚠️ Productos sin cambio ni devolución
            </h2>
            <ul className="space-y-2 pl-6 list-disc">
              <li>Productos usados</li>
              <li>Productos dañados por mal uso</li>
              <li>Prendas en liquidación, salvo defectos de fábrica</li>
            </ul>
          </section>

          <section className="bg-muted/50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              📬 ¿Cómo gestiono un cambio/devolución?
            </h2>
            <p className="mb-4">
              Contactanos por WhatsApp o Instagram <strong>@busy.streetwear</strong> con:
            </p>
            <ul className="space-y-2 pl-6 list-disc mb-6">
              <li>Número de pedido</li>
              <li>Motivo</li>
              <li>Fotos (si corresponde)</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Respondemos dentro de las 48 hs hábiles.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <Button asChild variant="outline" className="gap-2">
                <a href="https://wa.me/5492236825268" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <a href="https://www.instagram.com/busy.streetwear" target="_blank" rel="noopener noreferrer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <a href="mailto:busy.streetwear@gmail.com" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
