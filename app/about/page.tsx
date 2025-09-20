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
        <div className="container px-3 sm:px-4 relative z-10 py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-row items-center justify-center gap-3 ">
              <div className="relative h-28 w-28">
                <Image
                  src="/logo-busy-white.png"
                  alt={t('about.image.alt')}
                  fill
                />
              </div>
            </div>
            <h1
              className="font-heading text-4xl md:text-6xl font-bold mb-2"
              dangerouslySetInnerHTML={{ __html: t('about.hero.title') }}
            />
            <p className="font-body text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t('about.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-3 sm:px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                  {t('about.story.title')}
                </h2>
                <div className="font-body space-y-4 text-muted-foreground leading-relaxed">
                  <p>{t('about.story.p1')}</p>
                  <p>{t('about.story.p2')}</p>
                  <p>{t('about.story.p3')}</p>
                </div>
                <Button asChild className="mt-6" size="lg">
                  <Link href="/products">{t('about.story.cta')}</Link>
                </Button>
              </div>
              <div className="group relative">
                {/* soft external glow */}
                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5" />
                <div className="aspect-square overflow-hidden rounded-[16px] bg-muted opacity-80 ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)]">
                  {/* gentle sheen on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-15" />

                  <Image
                    src="/estacionamiento-chicos.jpg"
                    alt={t('about.image.alt')}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section: dos contenedores grandes tipo panel de marca */}
      <section className="py-16 md:py-24">
        <div className="container px-3 sm:px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Panel 1 */}
            <div className="group relative overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)]">
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5" />
              <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-[16/10]">
                {/* Reemplaza el src por tu imagen grande */}
                <Image src="/placeholder-1.jpg" alt="Showcase 1" fill className="object-cover" />
              </div>
            </div>
            {/* Panel 2 */}
            <div className="group relative overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)]">
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5" />
              <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-[16/10]">
                {/* Reemplaza el src por tu imagen grande */}
                <Image src="/placeholder-2.jpg" alt="Showcase 2" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Nuestra línea de tiempo
              </h2>
              <p className="font-body text-muted-foreground text-lg">
                Algunos hitos que marcan nuestro camino.
              </p>
            </div>

            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-accent-brand rounded-full flex items-center justify-center text-white font-bold">
                      {item.year.replace(/[^0-9]/g, '').slice(-2) || '—'}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-px h-16 bg-border mt-4" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <span className="text-sm font-medium text-accent-brand">
                        {item.year}
                      </span>
                      <h3 className="font-heading text-xl font-semibold">{item.title}</h3>
                    </div>
                    <p className="font-body text-muted-foreground leading-relaxed">{item.desc}</p>
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              {t('about.cta.title')}
            </h2>
            <p className="font-body text-muted-foreground text-lg mb-8 leading-relaxed">
              {t('about.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/products">{t('about.cta.primary')}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">{t('about.cta.secondary')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
