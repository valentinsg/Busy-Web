import type { Metadata } from "next"
import Link from "next/link"
import { generateSEO } from "@/lib/seo"

export const metadata: Metadata = generateSEO({
  title: "Pantalones cargo y joggers streetwear - Busy",
  description:
    "Pantalones resistentes y cómodos con estética streetwear: cargo y joggers con bolsillos funcionales y calce moderno.",
  url: `${process.env.SITE_URL || "https://busy.com.ar"}/products/pants`,
  image: "/pants-background.png",
})

export default function PantsCategoryPage() {
  const base = process.env.SITE_URL || "https://busy.com.ar"
  const listingUrl = `/products?category=pants`
  return (
    <div className="container px-4 py-8 pt-20">
      {/* JSON-LD: CollectionPage + Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Pantalones cargo y joggers streetwear",
            url: `${base}/products/pants`,
            inLanguage: "es-AR",
            about: "pantalón cargo streetwear, jogger urbano, pantalón resistente",
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
              { "@type": "ListItem", position: 3, name: "Pantalones", item: `${base}/products/pants` },
            ],
          }),
        }}
      />

      <header className="max-w-3xl mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Pantalones cargo y joggers streetwear</h1>
        <p className="font-body text-muted-foreground text-lg leading-relaxed">
          Diseñados para resistir el ritmo urbano y brindarte comodidad todo el día. Nuestros pantalones cargo y joggers
          suman bolsillos funcionales, tejidos durables y calce moderno para que te muevas con estilo.
        </p>
      </header>

      <div>
        <Link href={listingUrl} prefetch={false} className="underline font-heading">
          Ver todos los pantalones
        </Link>
      </div>
    </div>
  )
}
