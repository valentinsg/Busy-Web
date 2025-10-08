'use client'
/**
 * EJEMPLO DE MIGRACIÓN - About Page con Motion Layer
 * 
 * Este archivo muestra cómo migrar app/about/page.tsx al nuevo sistema
 * NO reemplazar el archivo original hasta testear completamente
 */

import { useI18n } from '@/components/i18n-provider'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { useGsapScrollTrigger } from '@/motion/useGsap'
import { FadeIn } from '@/motion/components/FadeIn'
import { ScrollSection } from '@/motion/components/ScrollSection'
import { motionTokens } from '@/motion/tokens'

// Timeline data
const timeline = [
  {
    year: '2023',
    title: 'Nace la idea',
    desc: 'Empezamos a imaginar Busy como un espacio de streetwear auténtico, con una mirada propia y cerca de la comunidad.',
  },
  {
    year: 'Dic 2024',
    title: 'Primeros básicos',
    desc: 'Creamos la primera tanda de básicos: remeras y hoodies que sentaron la base de nuestra identidad.',
  },
  {
    year: 'Feb 2025',
    title: 'Sold out',
    desc: 'Algunos productos se agotan en días. Confirmamos que vamos por buen camino y redoblamos la apuesta.',
  },
  {
    year: 'Oct 2025',
    title: 'Comunidad y marcas amigas',
    desc: 'Sumamos productos de marcas amigas y comenzamos a crear artículos importantes junto a nuestra comunidad.',
  },
  {
    year: '2026',
    title: 'Próximo paso: showroom',
    desc: 'Nuestro plan es abrir el primer showroom para encontrarnos cara a cara y vivir Busy offline.',
  },
]

export default function AboutPageMigrated() {
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(true)
  const showcaseRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Loader animation (mantener el original)
  useGsapScrollTrigger((gsap) => {
    const loaderTl = gsap.timeline({
      onComplete: () => setIsLoading(false),
    })

    loaderTl
      .from('.loader-logo', {
        scale: 0.5,
        opacity: 0,
        duration: 0.6,
        ease: motionTokens.easings.back,
      })
      .to('.loader-logo', {
        scale: 1.1,
        duration: 0.3,
      })
      .to('.loader-logo', {
        scale: 1,
        duration: 0.2,
      })
      .to('.loader-overlay', {
        opacity: 0,
        duration: 0.5,
        delay: 0.3,
      })
  }, [])

  // Hero animations con tokens
  useGsapScrollTrigger((gsap) => {
    gsap.from('.hero-logo', {
      opacity: 0,
      scale: motionTokens.scale.md,
      duration: motionTokens.durations.normal,
      ease: motionTokens.easings.gsapOut,
    })
    gsap.from('.hero-title', {
      opacity: 0,
      y: motionTokens.distance.lg,
      duration: motionTokens.durations.normal,
      delay: 0.3,
      ease: motionTokens.easings.gsapOut,
    })
    gsap.from('.hero-subtitle', {
      opacity: 0,
      y: motionTokens.distance.md,
      duration: motionTokens.durations.normal,
      delay: 0.5,
      ease: motionTokens.easings.gsapOut,
    })
  }, [])

  // Showcase animations con tokens
  useGsapScrollTrigger((gsap, ScrollTrigger) => {
    if (!showcaseRef.current) return

    gsap.from('.showcase-panel', {
      scrollTrigger: {
        trigger: showcaseRef.current,
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      y: 100,
      filter: `blur(${motionTokens.blur.xl})`,
      duration: 1.2,
      stagger: motionTokens.stagger.slow,
      ease: motionTokens.easings.gsapOut,
    })
  }, [])

  // Timeline animations con tokens
  useGsapScrollTrigger((gsap, ScrollTrigger) => {
    if (!timelineRef.current) return

    const timelinePath = document.querySelector('.timeline-path')
    if (timelinePath) {
      const pathLength = (timelinePath as SVGPathElement).getTotalLength()
      
      gsap.set(timelinePath, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      })

      gsap.to(timelinePath, {
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
        },
        strokeDashoffset: 0,
        ease: 'none',
      })
    }

    gsap.from('.roadmap-card', {
      scrollTrigger: {
        trigger: timelineRef.current,
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      y: 50,
      scale: motionTokens.scale.md,
      duration: 0.8,
      stagger: motionTokens.stagger.normal,
      ease: motionTokens.easings.back,
    })
  }, [])

  return (
    <>
      {/* Loader (mantener original) */}
      {isLoading && (
        <div className="loader-overlay fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="loader-logo relative h-32 w-32 md:h-40 md:w-40">
            <Image
              src="/logo-busy-white.png"
              alt="Busy"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}

      <div className="flex flex-col font-body">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute bg-repeat bg-cover opacity-80"
            style={{
              backgroundImage: 'url(/pattern.png)',
              backgroundSize: '40%',
              width: '100%',
              height: '100%',
            }}
          />
          <div className="container px-3 sm:px-4 relative z-10 py-12 md:py-16 lg:py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="hero-logo flex flex-row items-center justify-center gap-3 mb-2 md:mb-2">
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
                className="hero-title font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 px-4"
                dangerouslySetInnerHTML={{ __html: t('about.hero.title') }}
              />
              <p className="hero-subtitle font-body text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed px-4 max-w-2xl mx-auto">
                {t('about.hero.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Story Section - Usando ScrollSection */}
        <ScrollSection trigger="center" animation="fade" className="py-16 md:py-24 bg-muted/50">
          <div className="container px-3 sm:px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* Content - Usando FadeIn */}
                <FadeIn direction="left" distance="lg" className="order-2 lg:order-1">
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
                </FadeIn>

                {/* Image - Usando FadeIn */}
                <FadeIn direction="right" distance="lg" className="order-1 lg:order-2">
                  <div className="group relative">
                    <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5" />
                    <div className="aspect-square overflow-hidden rounded-xl md:rounded-2xl bg-muted opacity-80 ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)] transition-all duration-500 hover:ring-white/20">
                      <div className="pointer-events-none absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-15" />
                      <Image
                        src="/estacionamiento-chicos.jpg"
                        alt={t('about.image.alt')}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </ScrollSection>

        {/* Showcase Section */}
        <section ref={showcaseRef} className="relative bg-black overflow-hidden py-16 md:py-24">
          <div
            className="pointer-events-none absolute bg-repeat bg-cover opacity-30"
            style={{
              backgroundImage: 'url(/pattern-black.jpg)',
              backgroundSize: '50%',
              width: '100%',
              height: '100%',
            }}
          />
          <div className="container relative z-10 px-3 sm:px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Panels con clase para GSAP */}
                <div className="showcase-panel md:row-span-2 group relative overflow-hidden rounded-2xl shadow-2xl">
                  <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-full aspect-[3/4] md:aspect-[4/5]">
                    <Image
                      src="/showcase-busy-1.jpg"
                      alt="Busy Streetwear"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">Busy Streetwear</h3>
                      <p className="text-white/80 text-sm md:text-base">Identidad de marca</p>
                    </div>
                  </div>
                </div>

                <div className="showcase-panel group relative overflow-hidden rounded-2xl shadow-2xl">
                  <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-full aspect-[4/3] md:aspect-square">
                    <Image
                      src="/showcase-busy-2.jpg"
                      alt="Since 2024"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-heading text-xl md:text-2xl font-bold text-white mb-1">Since 2024</h3>
                      <p className="text-white/80 text-xs md:text-sm">Colección</p>
                    </div>
                  </div>
                </div>

                <div className="showcase-panel group relative overflow-hidden rounded-2xl shadow-2xl">
                  <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-full aspect-[4/3] md:aspect-square">
                    <Image
                      src="/showcase-busy-3.jpg"
                      alt="Community"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-heading text-xl md:text-2xl font-bold text-white mb-1">Community</h3>
                      <p className="text-white/80 text-xs md:text-sm">Nuestra gente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap Section - Mantener estructura original con mejoras */}
        <section ref={timelineRef} className="relative py-16 md:py-32 bg-gradient-to-br from-accent-brand/10 via-background to-background overflow-hidden">
          <div className="container px-3 sm:px-4">
            <div className="max-w-6xl mx-auto">
              <FadeIn direction="up" className="text-center mb-12 md:mb-20">
                <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                  Nuestro Roadmap
                </h2>
                <p className="font-body text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
                  El camino que hemos recorrido y hacia dónde vamos
                </p>
              </FadeIn>

              <div className="relative">
                <svg
                  className="absolute left-0 top-0 w-full h-full pointer-events-none hidden md:block"
                  style={{ overflow: 'visible' }}
                >
                  <defs>
                    <linearGradient id="roadmap-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--accent-brand))" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="hsl(var(--accent-brand))" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <path
                    className="timeline-path"
                    d="M 100 80 Q 300 200, 500 150 T 900 280 Q 1100 350, 1000 500"
                    fill="none"
                    stroke="url(#roadmap-gradient)"
                    strokeWidth="3"
                    strokeDasharray="10 10"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="space-y-8 md:space-y-16">
                  {timeline.map((item, index) => (
                    <div
                      key={index}
                      className={`roadmap-card flex justify-start md:justify-${index % 2 === 0 ? 'start' : 'end'}`}
                    >
                      <div className="relative max-w-md md:max-w-lg w-full">
                        <div className="relative bg-card border-2 border-accent-brand/20 rounded-xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                          <div className="absolute -top-4 -left-4 w-12 h-12 md:w-14 md:h-14 bg-accent-brand rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg md:text-xl">{String(index + 1).padStart(2, '0')}</span>
                          </div>
                          <div className="ml-6">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-accent-brand font-bold text-sm md:text-base">{item.year}</span>
                            </div>
                            <h3 className="font-heading text-xl md:text-2xl font-bold mb-3">{item.title}</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{item.desc}</p>
                          </div>
                          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
                            <div className="w-full h-px bg-current mt-16" />
                            <div className="w-full h-px bg-current mt-6" />
                            <div className="w-full h-px bg-current mt-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Usando FadeIn */}
        <section className="py-16 md:py-24">
          <div className="container px-3 sm:px-4">
            <FadeIn direction="up" className="max-w-4xl mx-auto text-center">
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
            </FadeIn>
          </div>
        </section>
      </div>
    </>
  )
}
