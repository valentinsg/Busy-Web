import { AutoSliderBanner } from '@/components/home/auto-slider-banner'
import HomeLatestBlogServer from '@/components/home/latest-blog-server'
import { ProductCard } from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import { getImageConfig } from '@/lib/imageConfig'
import { getProductsAsync } from '@/lib/repo/products'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 3600 // Revalidar cada hora

export default async function Home() {
  // Cargar productos del lado del servidor
  const allProducts = await getProductsAsync()
  const featuredProducts = allProducts.slice(0, 4)

  const categories = [
    {
      name: 'Hoodies',
      href: '/products/category/buzos',
      image: '/backgrounds/hoodies-background.png',
    },
    {
      name: 'Remeras',
      href: '/products/category/remeras',
      image: '/backgrounds/t-shirts-background.png',
    },
    {
      name: 'Pantalones',
      href: '/products/category/pantalones',
      image: '/backgrounds/pants-background.png',
    },
  ]

  return (
    <div className="flex flex-col overflow-x-hidden">
      <AutoSliderBanner />

      {/* Latest Collection */}
      <section
        id="product-section"
        className="relative overflow-hidden bg-black py-16 md:py-24"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 h-16 bg-gradient-to-b from-transparent to-black"
        />
        <div className="relative container px-3 sm:px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Últimos lanzamientos
            </h2>
            <p className="font-body text-muted-foreground text-lg md:text-xl">
              Descubrí lo más nuevo de Busy
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/products" prefetch={false} className="font-heading">
                Ver todos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative py-14 sm:py-16 md:py-24 lg:py-28">
        <div className="container px-3 sm:px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Categorías
            </h2>
            <p className="font-body text-muted-foreground  text-lg md:text-xl">
              Explorá por tipo de producto
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {categories.map((category) => (
              <div key={category.name}>
                <Link
                  href={category.href}
                  prefetch={false}
                  className="group block"
                >
                  <div className="group relative rounded-2xl p-[4px] bg-gradient-to-br from-white/45 via-white/20 to-transparent shadow-[0_0_50px_rgba(35,35,35,0.3)] ring-2 ring-white/30">
                    <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5" />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15" />

                    <span className="pointer-events-none absolute top-3 left-3 h-px w-8 bg-white/40" />
                    <span className="pointer-events-none absolute top-3 left-3 h-8 w-px bg-white/40" />
                    <span className="pointer-events-none absolute top-3 right-3 h-px w-8 bg-white/40" />
                    <span className="pointer-events-none absolute top-3 right-3 h-8 w-px bg-white/40" />
                    <span className="pointer-events-none absolute bottom-3 left-3 h-px w-8 bg-white/30" />
                    <span className="pointer-events-none absolute bottom-3 left-3 h-8 w-px bg-white/30" />
                    <span className="pointer-events-none absolute bottom-3 right-3 h-px w-8 bg-white/30" />
                    <span className="pointer-events-none absolute bottom-3 right-3 h-8 w-px bg-white/30" />

                    <div className="relative aspect-square overflow-hidden rounded-[16px] bg-background ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)]">
                      <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-15 transition-opacity duration-500" />

                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes={getImageConfig('categoryCard').sizes}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

                      <div className="absolute bottom-6 left-6 z-20">
                        <h3 className="font-heading text-2xl font-bold text-white mb-2">
                          {category.name}
                        </h3>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="font-body"
                        >
                          Ver colección <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-black">
        <div className="relative z-10 container px-3 sm:px-4 mx-auto py-16 md:py-24 ">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-repeat opacity-25"
            style={{
              backgroundImage: 'url(/backgrounds/pattern-black.jpg)',
            }}
          />
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center justify-center justify-items-center place-content-center">
            <div className="w-full max-w-xl mx-auto text-center">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Hecho para la vida urbana
              </h2>
              <p className="text-muted-foreground font-body text-lg md:text-xl mb-4 leading-relaxed ">
                Diseñamos básicos premium con foco en calidad, confort y durabilidad.
              </p>
              <p className="text-muted-foreground font-body text-lg md:text-xl mb-8 leading-relaxed">
                Productos versátiles pensados para acompañarte todos los días.
              </p>
              <Button asChild variant="outline" size="lg">
                <Link href="/about" prefetch={false} className="font-heading">
                  Conocé más
                </Link>
              </Button>
            </div>

            <div className="relative ml-auto w-full">
              <div className="group relative w-full max-w-sm sm:max-w-md md:max-w-lg aspect-[11/19] rounded-2xl p-[4px] bg-gradient-to-br from-white/45 via-white/20 to-transparent shadow-[0_0_50px_rgba(35,35,35,0.3)] ring-2 ring-white/30">
                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5" />
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15" />

                <span className="pointer-events-none absolute top-3 left-3 h-px w-8 bg-white/40" />
                <span className="pointer-events-none absolute top-3 left-3 h-8 w-px bg-white/40" />
                <span className="pointer-events-none absolute top-3 right-3 h-px w-8 bg-white/40" />
                <span className="pointer-events-none absolute top-3 right-3 h-8 w-px bg-white/40" />
                <span className="pointer-events-none absolute bottom-3 left-3 h-px w-8 bg-white/30" />
                <span className="pointer-events-none absolute bottom-3 left-3 h-8 w-px bg-white/30" />
                <span className="pointer-events-none absolute bottom-3 right-3 h-px w-8 bg-white/30" />
                <span className="pointer-events-none absolute bottom-3 right-3 h-8 w-px bg-white/30" />

                <div className="relative h-full w-full overflow-hidden rounded-[16px] bg-muted opacity-80 ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)]">
                  <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-15 transition-opacity duration-500" />
                  <Image
                    src="/docs/archive/ciro-gif.gif"
                    alt="Busy Streetwear"
                    fill
                    sizes={getImageConfig('hero').sizes}
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative bg-black py-16 md:py-28">
        <div className="relative z-10 container px-3 sm:px-4">
          <div className="text-center mb-24">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Comunidad Busy
            </h2>
            <p className="font-body text-muted-foreground text-lg md:text-xl">
              Lo que construimos con nuestra comunidad
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                iconSrc: '/blog.png',
                title: 'Guías y noticias',
                description: 'Consejos de estilo, cuidado y cultura Busy',
                href: '/blog',
              },
              {
                iconSrc: '/spotify.png',
                title: 'Playlist',
                description: 'Sonido para acompañar tu día',
                href: '/playlists',
              },
              {
                iconSrc: '/drops.png',
                title: 'Calidad Busy',
                description: 'Materiales premium y confección cuidada',
                href: '/products',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <Link href={item.href} prefetch={false} className="group inline-block">
                  <div className="inline-flex bg-transparent rounded-full border-4 border-white items-center justify-center mb-3 sm:mb-4">
                    <Image
                      src={item.iconSrc}
                      alt={item.title}
                      width={getImageConfig('socialIcon').width}
                      height={getImageConfig('socialIcon').height}
                      sizes={getImageConfig('socialIcon').sizes}
                      className="h-32 w-32 sm:h-36 sm:w-36 md:h-40 md:w-40 lg:h-48 lg:w-48 rounded-full contrast-150 brightness-25 transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-semibold mb-1 sm:mb-2">
                    {item.title}
                  </h3>
                </Link>
                <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeLatestBlogServer />
    </div>
  )
}
