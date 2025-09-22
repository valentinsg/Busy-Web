import type { Metadata } from 'next'
import ProductsClient from '@/components/products/ProductsClient'
import { ProductCard } from '@/components/shop/product-card'
import type { Product } from '@/lib/types'
import getServiceClient from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Productos - Busy Streetwear',
  description:
    'Catálogo Busy: hoodies, remeras y básicos streetwear de alta calidad, diseñados en Mar del Plata para quienes valoran el estilo urbano. Descubrí prendas versátiles con foco en confort, durabilidad y diseño contemporáneo, pensadas para el día a día.',
  alternates: { canonical: '/products' },
}

async function getFeaturedSSR(): Promise<Product[]> {
  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .from('products')
      .select('*')
      .contains('tags', ['featured'])
      .order('created_at', { ascending: false })
      .limit(3)
    if (error || !data) return []
    return data as unknown as Product[]
  } catch {
    return []
  }
}

export default async function ProductsPage() {
  const featured = await getFeaturedSSR()
  const siteUrl = process.env.SITE_URL || 'https://busy.com.ar'
  return (
    <div className="container px-4 py-8 pt-28">
      {/* JSON-LD: CollectionPage + BreadcrumbList (static SSR) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Productos',
            url: `${siteUrl}/products`,
            about: 'coleccion',
            inLanguage: 'es-AR',
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'Productos', item: `${siteUrl}/products` },
            ],
          }),
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Header SSR with real copy */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-4">
            Productos destacados y básicos premium
          </h1>
          <p className="font-body text-muted-foreground">
            En Busy creemos en básicos premium para la vida urbana. Descubrí nuestra selección de prendas con materiales de calidad y diseño contemporáneo: hoodies, remeras y accesorios pensados para acompañarte todos los días.
          </p>
        </div>

        {/* Optional SSR: Featured products to avoid thin HTML */}
        {featured.length > 0 && (
          <div className="mb-10">
            <h2 className="font-heading text-2xl font-semibold mb-4">Destacados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Client filters/search and full listing */}
        <ProductsClient />
      </div>
    </div>
  )
}
