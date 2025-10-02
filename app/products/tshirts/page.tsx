import type { Metadata } from "next"
import Link from "next/link"
import { generateSEO } from "@/lib/seo"

export const metadata: Metadata = generateSEO({
  title: "Remeras urbanas de alta calidad - Busy",
  description:
    "Remeras streetwear con algodón suave, fit relajado y terminaciones prolijas. Ideales para todos los días y combinar con tu estilo.",
  url: `${process.env.SITE_URL || "https://busy.com.ar"}/products/tshirts`,
  image: "/t-shirts-background.png",
})

export default function TShirtsCategoryPage() {
  const base = process.env.SITE_URL || "https://busy.com.ar"
  const listingUrl = `/products/category/tshirts`
  return (
    <div className="container px-4 py-8 pt-20">
      {/* JSON-LD: CollectionPage + Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Remeras urbanas de alta calidad",
            url: `${base}/products/tshirts`,
            inLanguage: "es-AR",
            about: "remeras streetwear, remeras oversize, remera premium",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Inicio", item: base },
              { "@type": "ListItem", position: 2, name: "Productos", item: `${base}/products` },
              { "@type": "ListItem", position: 3, name: "Remeras", item: `${base}/products/tshirts` },
            ],
          }),
        }}
      />

      <header className="max-w-3xl mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Remeras urbanas de alta calidad</h1>
        <p className="font-body text-muted-foreground text-lg leading-relaxed">
          Nuestras remeras combinan algodón suave y respirable con un fit relajado pensado para el uso diario. Costuras
          reforzadas, calce moderno y colores que combinan con todo. Elegí entre cortes clásicos y oversize para llevar
          tu estilo al siguiente nivel.
        </p>
      </header>

      <div>
        <Link href={listingUrl} prefetch={false} className="underline font-heading">
          Ver todas las remeras
        </Link>
      </div>
    </div>
  )
}
