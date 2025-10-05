'use client'
import { useI18n } from '@/components/i18n-provider'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

// Timeline compacta con hitos clave
const timeline = [
  {
    year: '2023',
    title: 'Nace la idea',
    desc:
      'Empezamos a imaginar Busy como un espacio de streetwear auténtico, con una mirada propia y cerca de la comunidad.',
  },
  {
    year: 'Dic 2024',
    title: 'Primeros básicos',
    desc:
      'Creamos la primera tanda de básicos: remeras y hoodies que sentaron la base de nuestra identidad.',
  },
  {
    year: 'Feb 2025',
    title: 'Sold out',
    desc:
      'Algunos productos se agotan en días. Confirmamos que vamos por buen camino y redoblamos la apuesta.',
  },
  {
    year: 'Oct 2025',
    title: 'Comunidad y marcas amigas',
    desc:
      'Sumamos productos de marcas amigas y comenzamos a crear artículos importantes junto a nuestra comunidad.',
  },
  {
    year: '2026',
    title: 'Próximo paso: showroom',
    desc:
      'Nuestro plan es abrir el primer showroom para encontrarnos cara a cara y vivir Busy offline.',
  },
]

export default function AboutPage() {
  const { t } = useI18n()
  return (
    <div className="flex flex-col font-body">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Pattern background limited to this hero section */}
        <div
          className="pointer-events-none absolute bg-repeat bg-cover opacity-80"
          style={{
            backgroundImage: 'url(/pattern.png)',
            backgroundSize: '40% ',
            width: '100%',
            height: '100%',
          }}
        />
        <div className="container px-3 sm:px-4 relative z-10 py-12 md:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-row items-center justify-center gap-3 mb-2 md:mb-2">
              <div className="relative h-20 w-20 md:h-28 md:w-28">
                <Image
                  src="/logo-busy-white.png"
                  alt={t('about.image.alt')}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <h1
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 px-4"
              dangerouslySetInnerHTML={{ __html: t('about.hero.title') }}
            />
            <p className="font-body text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-4 max-w-2xl mx-auto">
              {t('about.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-3 sm:px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                  {t('about.story.title')}
                </h2>
                <div className="font-body space-y-3 md:space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg">
                  <p>{t('about.story.p1')}</p>
                  <p>{t('about.story.p2')}</p>
                  <p>{t('about.story.p3')}</p>
                </div>
                <Button asChild className="mt-6 md:mt-8 w-full sm:w-auto" size="lg">
                  <Link href="/products">{t('about.story.cta')}</Link>
                </Button>
              </div>
              <div className="group relative order-1 lg:order-2">
                {/* soft external glow */}
                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5" />
                <div className="aspect-square overflow-hidden rounded-xl md:rounded-2xl bg-muted opacity-80 ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)] transition-all duration-500 hover:ring-white/20">
                  {/* gentle sheen on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-15" />

                  <Image
                    src="/estacionamiento-chicos.jpg"
                    alt={t('about.image.alt')}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section: dos contenedores grandes tipo panel de marca */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container px-3 sm:px-4">
          <div className="max-w-7xl mx-auto">
            {/* Grid responsive: 1 columna en mobile, 2 en desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Panel 1 - Imagen vertical */}
              <div className="group relative overflow-hidden rounded-xl md:rounded-2xl ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.3)] transition-all duration-500 hover:ring-white/20 hover:shadow-[0_16px_60px_rgba(25,25,25,0.4)]">
                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-full aspect-[3/4] md:aspect-[4/5] lg:aspect-[3/4]">
                  <Image
                    src="/showcase-busy-1.jpg"
                    alt="Busy Streetwear - Identidad de marca"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  {/* Overlay sutil con gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                </div>
              </div>

              {/* Panel 2 - Imagen vertical */}
              <div className="group relative overflow-hidden rounded-xl md:rounded-2xl ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.3)] transition-all duration-500 hover:ring-white/20 hover:shadow-[0_16px_60px_rgba(25,25,25,0.4)]">
                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-full aspect-[3/4] md:aspect-[4/5] lg:aspect-[3/4]">
                  <Image
                    src="/showcase-busy-2.jpg"
                    alt="Busy Since 2024 - Colección"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  {/* Overlay sutil con gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                </div>
              </div>
            </div>

            {/* Imagen horizontal grande debajo - ocupa todo el ancho */}
            <div className="mt-4 md:mt-6 group relative overflow-hidden rounded-xl md:rounded-2xl ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.3)] transition-all duration-500 hover:ring-white/20 hover:shadow-[0_16px_60px_rgba(25,25,25,0.4)]">
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9]">
                <Image
                  src="/showcase-busy-3.jpg"
                  alt="Busy - Estilo urbano auténtico"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                {/* Overlay sutil con gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
                Nuestra línea de tiempo
              </h2>
              <p className="font-body text-muted-foreground text-base md:text-lg">
                Algunos hitos que marcan nuestro camino.
              </p>
            </div>

            <div className="space-y-6 md:space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="flex gap-4 md:gap-6">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-brand rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
                      {item.year.replace(/[^0-9]/g, '').slice(-2) || '—'}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-px h-12 md:h-16 bg-border mt-3 md:mt-4" />
                    )}
                  </div>
                  <div className="flex-1 pb-6 md:pb-8">
                    <div className="flex flex-col gap-1 md:gap-2 mb-2">
                      <span className="text-xs md:text-sm font-medium text-accent-brand">
                        {item.year}
                      </span>
                      <h3 className="font-heading text-lg md:text-xl font-semibold">{item.title}</h3>
                    </div>
                    <p className="font-body text-muted-foreground leading-relaxed text-sm md:text-base">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 px-4">
              {t('about.cta.title')}
            </h2>
            <p className="font-body text-muted-foreground text-base md:text-lg mb-6 md:mb-8 leading-relaxed px-4">
              {t('about.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/products">{t('about.cta.primary')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/contact">{t('about.cta.secondary')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
