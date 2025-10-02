import type { Metadata } from "next"
import Link from "next/link"
import { generateSEO } from "@/lib/seo"

export const metadata: Metadata = generateSEO({
  title: "Hoodies premium para todos los días - Busy",
  description:
    "Hoodies streetwear de calidad premium: telas suaves, terminaciones prolijas y calce cómodo. Ideales para el día a día y combinar con tu estilo urbano.",
  url: `${process.env.SITE_URL || "https://busy.com.ar"}/products/hoodies`,
  image: "/hoodies-background.png",
})

export default function HoodiesCategoryPage() {
  const base = process.env.SITE_URL || "https://busy.com.ar"
  const listingUrl = `/products/category/hoodies`
  return (
    <div className="container px-4 py-8 pt-20">
      {/* JSON-LD: CollectionPage + Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Hoodies premium para todos los días",
            url: `${base}/products/hoodies`,
            inLanguage: "es-AR",
            about: "hoodies streetwear, buzos oversize, buzo algodón",
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
              { "@type": "ListItem", position: 3, name: "Hoodies", item: `${base}/products/hoodies` },
            ],
          }),
        }}
      />

      <header className="max-w-3xl mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Hoodies premium para todos los días</h1>
        <p className="font-body text-muted-foreground text-lg leading-relaxed">
          Diseñados para acompañarte en cualquier momento, nuestros hoodies combinan materiales suaves con terminaciones
          prolijas y un calce cómodo. Inspirados en el streetwear argentino, ofrecen versatilidad para el día a día y
          durabilidad prenda tras prenda. Descubrí opciones oversize, capuchas ajustables y paletas de color fáciles de
          combinar.
        </p>
      </header>

      <div>
        <Link href={listingUrl} prefetch={false} className="underline font-heading">
          Ver todos los hoodies
        </Link>
      </div>
    </div>
  )
}
