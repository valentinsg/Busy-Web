import ProductsClient from '@/components/products/ProductsClient'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

// SEO content for each category
const categoryContent: Record<string, { title: string; description: string; keywords: string; image: string }> = {
  remeras: {
    title: 'Remeras urbanas de alta calidad - Busy',
    description: 'Remeras streetwear con algodón suave, fit relajado y terminaciones prolijas. Ideales para todos los días y combinar con tu estilo.',
    keywords: 'remeras streetwear, remeras oversize, remera premium',
    image: '/t-shirts-background.png',
  },
  buzos: {
    title: 'Hoodies premium para todos los días - Busy',
    description: 'Hoodies streetwear de calidad premium: telas suaves, terminaciones prolijas y calce cómodo. Ideales para el día a día y combinar con tu estilo urbano.',
    keywords: 'hoodies streetwear, buzos oversize, buzo algodón',
    image: '/hoodies-background.png',
  },
  pantalones: {
    title: 'Pantalones cargo y joggers streetwear - Busy',
    description: 'Pantalones resistentes y cómodos con estética streetwear: cargo y joggers con bolsillos funcionales y calce moderno.',
    keywords: 'pantalón cargo streetwear, jogger urbano, pantalón resistente',
    image: '/pants-background.png',
  },
  camperas: {
    title: 'Camperas streetwear - Busy',
    description: 'Camperas urbanas con estilo y funcionalidad. Diseños modernos para el día a día.',
    keywords: 'camperas streetwear, campera urbana, campera argentina',
    image: '/og/busy-products.png',
  },
  accesorios: {
    title: 'Accesorios streetwear - Busy',
    description: 'Gorras, pins y accesorios para completar tu look urbano.',
    keywords: 'accesorios streetwear, gorras urbanas, pins',
    image: '/og/busy-products.png',
  },
  ofertas: {
    title: 'Ofertas y descuentos - Busy',
    description: 'Las mejores ofertas en ropa streetwear. Aprovechá los descuentos en remeras, buzos y más.',
    keywords: 'ofertas streetwear, descuentos ropa, promociones busy',
    image: '/og/busy-products.png',
  },
}

const categoryLabels: Record<string, string> = {
  remeras: 'Remeras',
  buzos: 'Buzos',
  pantalones: 'Pantalones',
  camperas: 'Camperas',
  accesorios: 'Accesorios',
  ofertas: 'Ofertas',
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const siteUrl = process.env.SITE_URL || 'https://busy.com.ar'
  const cat = params.category.toLowerCase()
  const content = categoryContent[cat]
  const label = categoryLabels[cat] || cat

  const title = content?.title || `${label} - Busy Streetwear`
  const description = content?.description || `Explorá ${label} en Busy`
  const image = content?.image || '/og/busy-products.png'

  return {
    title,
    description,
    keywords: content?.keywords,
    alternates: {
      canonical: `${siteUrl}/products/category/${cat}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products/category/${cat}`,
      images: [
        { url: `${siteUrl}${image}`, width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}${image}`],
    },
  }
}

export default function ProductsByCategoryPage({ params }: { params: { category: string } }) {
  const siteUrl = process.env.SITE_URL || 'https://busy.com.ar'
  const cat = params.category.toLowerCase()
  const content = categoryContent[cat]
  const label = categoryLabels[cat] || cat

  return (
    <div className="container px-4 py-8 pt-28">
      {/* JSON-LD: CollectionPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: content?.title || `${label} - Busy`,
            url: `${siteUrl}/products/category/${cat}`,
            inLanguage: 'es-AR',
            about: content?.keywords || `${label} streetwear`,
          }),
        }}
      />
      {/* JSON-LD: Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'Productos', item: `${siteUrl}/products` },
              { '@type': 'ListItem', position: 3, name: label, item: `${siteUrl}/products/category/${cat}` },
            ],
          }),
        }}
      />
      <div className="max-w-7xl mx-auto">
        {/* SEO Header - descripción solo en metadata, no visible */}
        <header className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-3">{label}</h1>
          {/* Category quick links */}
          <div className="flex flex-wrap gap-2 mt-4">
            {Object.entries(categoryLabels)
              .filter(([slug]) => slug !== cat)
              .slice(0, 4)
              .map(([slug, name]) => (
                <Link
                  key={slug}
                  href={slug === 'ofertas' ? '/products/ofertas' : `/products/category/${slug}`}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {name}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
          </div>
        </header>

        <ProductsClient initialCategory={params.category} />
      </div>
    </div>
  )
}
