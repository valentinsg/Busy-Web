'use client'
import NewsletterSignup from '@/components/blog/newsletter-signup'
import { useI18n } from '@/components/providers/i18n-provider'
import { BusyLogo } from '@/components/shared/busy-logo'
import { Button } from '@/components/ui/button'
import { gsap } from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

// Roadmap con hitos clave
const roadmap = [
  {
    year: '2024',
    title: 'Nace la idea',
    desc: 'Empezamos a imaginar a Busy un concepto diferente para crear nuestro propio espacio sobre moda, tratando de darle un trasfondo personal y cercano para que más personas puedan sentirse identificadas.',
    icon: 'lightbulb',
  },
  {
    year: 'Noviembre 2024',
    title: 'Primera Colección',
    desc: 'Creamos la primera tanda de básicos: remeras y hoodies que sentaron la base de nuestra identidad.',
    icon: 'shirt',
  },
  {
    year: 'Febrero 2025',
    title: 'Sold out y problemas',
    desc: 'Algunos productos se agotaron en días, no lo podíamos creer porque nos movimos e invertimos mucho. Confirmamos que ibamos por buen camino, pero hubo problemas personales y trabas que nos imposibilitaron continuar con la marca.',
    icon: 'flame',
  },
  {
    year: 'Septiembre 2025',
    title: 'Comunidad y marcas amigas',
    desc: 'Decidimos volver porque sabíamos que algo habíamos hecho bien, entonces pensamos que la mejor manera y la más rápida, era sumando productos de marcas amigas, sumado a algunas cosas que nos habían quedado de nuestro primer drop.',
    icon: 'users',
  },
  {
    year: '2026',
    title: 'Próximo paso: local',
    desc: 'Nuestro plan es abrir el primer showroom o local de la marca y poder conectar aún mejor personalmente, con nuestro espacio ya definido queremos empezar a armar nuestros primeros eventos y un accionar más constante.',
    icon: 'store',
  },
]

// Iconos SVG para el roadmap
const RoadmapIcon = ({ name }: { name: string }) => {
  const icons: Record<string, JSX.Element> = {
    lightbulb: (
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 18h6M10 22h4M15 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path d="M12 3v1M6.6 6.6l.7.7M3 12h1M6.6 17.4l.7-.7M17.4 6.6l-.7.7M21 12h-1M17.4 17.4l-.7-.7" />
      </svg>
    ),
    shirt: (
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </svg>
    ),
    flame: (
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
    users: (
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    store: (
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
        <path d="M3 9V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3M9 22V12h6v10" />
      </svg>
    ),
  }
  return icons[name] || icons.lightbulb
}

function AboutContent() {
  const { t } = useI18n()
  const heroRef = useRef<HTMLDivElement>(null)
  const storyRef = useRef<HTMLDivElement>(null)
  const showcaseRef = useRef<HTMLDivElement>(null)
  const roadmapRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const roadmapDotsRef = useRef<(HTMLDivElement | null)[]>([])
  const roadmapPathRef = useRef<SVGPathElement>(null)
  const roadmapPathFutureRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    // Calcular y dibujar el path dinámicamente basado en las posiciones reales de los dots
    const updateRoadmapPath = () => {
      if (
        !roadmapRef.current ||
        !roadmapPathRef.current ||
        !roadmapPathFutureRef.current
      )
        return

      const containerRect = roadmapRef.current.getBoundingClientRect()
      const dots = roadmapDotsRef.current.filter((dot) => dot !== null)

      if (dots.length === 0) {
        console.log('No dots found yet')
        return
      }

      console.log(`Found ${dots.length} dots`)

      // Obtener posiciones relativas de cada dot
      const positions = dots.map((dot) => {
        const rect = dot!.getBoundingClientRect()
        const pos = {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        }
        console.log('Dot position:', pos)
        return pos
      })

      // Índice del punto actual (Oct 2025 - Comunidad y marcas amigas = índice 3)
      const currentIndex = 3

      // Construir path PASADO/PRESENTE (blanco) - desde inicio hasta punto actual
      let pathDataPresent = `M ${positions[0].x} ${positions[0].y}`

      for (let i = 1; i <= currentIndex && i < positions.length; i++) {
        const prev = positions[i - 1]
        const curr = positions[i]

        const deltaY = curr.y - prev.y
        const cp1x = prev.x
        const cp1y = prev.y + deltaY * 0.5
        const cp2x = curr.x
        const cp2y = curr.y - deltaY * 0.5

        pathDataPresent += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
      }

      // Construir path FUTURO (gris) - desde punto actual hasta el final
      let pathDataFuture = ''
      if (currentIndex < positions.length - 1) {
        pathDataFuture = `M ${positions[currentIndex].x} ${positions[currentIndex].y}`

        for (let i = currentIndex + 1; i < positions.length; i++) {
          const prev = positions[i - 1]
          const curr = positions[i]

          const deltaY = curr.y - prev.y
          const cp1x = prev.x
          const cp1y = prev.y + deltaY * 0.5
          const cp2x = curr.x
          const cp2y = curr.y - deltaY * 0.5

          pathDataFuture += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
        }
      }

      roadmapPathRef.current.setAttribute('d', pathDataPresent)
      roadmapPathFutureRef.current.setAttribute('d', pathDataFuture)
    }

    // Actualizar path después de que el DOM esté listo y después de las animaciones
    const timeoutId1 = setTimeout(updateRoadmapPath, 300)
    const timeoutId2 = setTimeout(updateRoadmapPath, 1000)
    const timeoutId3 = setTimeout(updateRoadmapPath, 2000)
    window.addEventListener('resize', updateRoadmapPath)

    const ctx = gsap.context(() => {
      // Hero Animation - Fade + Scale
      gsap.from('.hero-logo', {
        opacity: 0,
        scale: 0.8,
        duration: 1,
        ease: 'power2.out',
      })
      gsap.from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.3,
        ease: 'power2.out',
      })
      gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.5,
        ease: 'power2.out',
      })

      // Story Section - Fade + Slide
      gsap.from('.story-content', {
        scrollTrigger: {
          trigger: storyRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        x: -50,
        duration: 1,
        ease: 'power2.out',
      })
      gsap.from('.story-image', {
        scrollTrigger: {
          trigger: storyRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        x: 50,
        duration: 1,
        ease: 'power2.out',
      })

      // Showcase - Reveal con blur
      gsap.from('.showcase-panel', {
        scrollTrigger: {
          trigger: showcaseRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 100,
        filter: 'blur(20px)',
        duration: 1.2,
        stagger: 0.2,
        ease: 'power2.out',
      })

      // Roadmap - Línea diagonal progresiva con animación de carga
      const roadmapPath = roadmapPathRef.current
      if (roadmapPath && roadmapRef.current) {
        // Esperar a que el path esté calculado
        setTimeout(() => {
          try {
            const pathLength = roadmapPath.getTotalLength()

            // Configurar el dasharray y dashoffset inicial (línea oculta)
            gsap.set(roadmapPath, {
              strokeDasharray: pathLength,
              strokeDashoffset: pathLength,
            })

            // Animar el dashoffset a 0 (línea se dibuja) mientras scrolleas
            gsap.to(roadmapPath, {
              scrollTrigger: {
                trigger: roadmapRef.current,
                start: 'top 80%',
                end: 'bottom 20%',
                scrub: 1.5, // Suavizado de la animación
                // markers: true, // Descomentar para debug
              },
              strokeDashoffset: 0,
              ease: 'none',
            })
          } catch (error) {
            console.error('Error animating path:', error)
          }
        }, 500)
      }

      gsap.from('.roadmap-item', {
        scrollTrigger: {
          trigger: roadmapRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        onComplete: () => {
          // Actualizar path después de que las animaciones terminen
          setTimeout(updateRoadmapPath, 100)
        },
      })

      // CTA Section
      gsap.from('.cta-content', {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power2.out',
      })
    })

    return () => {
      ctx.revert()
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
      clearTimeout(timeoutId3)
      window.removeEventListener('resize', updateRoadmapPath)
    }
  }, [])

  return (
    <div className="flex flex-col font-body overflow-x-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden w-full">
        {/* Pattern background limited to this hero section */}
        <div
          className="pointer-events-none absolute bg-repeat bg-cover opacity-80"
          style={{
            backgroundImage: 'url(/backgrounds/pattern.png)',
            backgroundSize: '40% ',
            width: '100%',
            height: '100%',
          }}
        />
        <div className="container px-3 sm:px-4 relative z-10 pb-12 md:py-12 lg:pb-12 pt-20 md:pt-20 lg:pt-20 ">
          <div className="max-w-4xl mx-auto text-center">
            <div className="hero-logo flex flex-row items-center justify-center gap-3 mb-2 md:mb-2">
              <div className="relative h-20 w-20 md:h-28 md:w-28">
                <BusyLogo variant="white" fill alt={t('about.image.alt')} />
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

      {/* Story Section */}
      <section
        ref={storyRef}
        className="py-16 md:py-24 bg-muted/50 w-full overflow-hidden"
      >
        <div className="container px-3 sm:px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="story-content order-2 lg:order-1">
                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                  {t('about.story.title')}
                </h2>
                <div className="font-body space-y-3 md:space-y-4 text-muted-foreground leading-relaxed text-base md:text-lg">
                  <p>{t('about.story.p1')}</p>
                  <p>{t('about.story.p2')}</p>
                  <p>{t('about.story.p3')}</p>
                </div>
                <Button
                  asChild
                  className="mt-6 md:mt-8 w-full sm:w-auto"
                  size="lg"
                >
                  <Link href="/products">{t('about.story.cta')}</Link>
                </Button>
              </div>
              <div className="story-image group relative order-1 lg:order-2">
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
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section - Bento Box Layout Creativo */}
      <section
        ref={showcaseRef}
        className="relative bg-black overflow-hidden py-12 md:py-16 w-full"
      >
        {/* Pattern background */}
        <div
          className="pointer-events-none absolute bg-repeat bg-cover opacity-30"
          style={{
            backgroundImage: 'url(/backgrounds/pattern-black.jpg)',
            backgroundSize: '50%',
            width: '100%',
            height: '100%',
          }}
        />
        <div className="container px-3 sm:px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Bento Grid - Layout asimétrico creativo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Imagen 1 - Grande vertical (ocupa 2 filas en desktop) - REMERA NEGRA */}
              <div className="showcase-panel group relative overflow-hidden rounded-2xl md:rounded-3xl md:row-span-2 aspect-[4/5] md:aspect-auto shadow-2xl">
                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-full h-full">
                  <Image
                    src="/showcase/showcase-busy-2.jpg"
                    alt="Busy Streetwear - Identidad de marca"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Parche Busy - Marca de agua pequeña */}
                  <div className="absolute bottom-2 right-2 w-12 h-12 md:w-14 md:h-14 opacity-40">
                    <Image
                      src="/busy-parche.png"
                      alt="Busy"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
                      Nuestra Identidad
                    </h3>
                    <p className="text-white/80 text-sm md:text-base">
                      Streetwear auténtico desde Mar del Plata
                    </p>
                  </div>
                </div>
              </div>

              {/* Imagen 2 - Horizontal superior - BUZO BLANCO */}
              <div className="showcase-panel group relative overflow-hidden rounded-2xl md:rounded-3xl lg:col-span-2 aspect-[16/9] shadow-2xl">
                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-full h-full">
                  <Image
                    src="/showcase/showcase-busy-1.jpg"
                    alt="Busy Since 2024 - Colección"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
                  {/* Parche Busy - Marca de agua pequeña */}
                  <div className="absolute bottom-2 right-2 w-12 h-12 md:w-14 md:h-14 opacity-40">
                    <Image
                      src="/busy-parche.png"
                      alt="Busy"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
                      Colección 2024
                    </h3>
                    <p className="text-white/80 text-sm md:text-base">
                      Diseños que representan la cultura urbana
                    </p>
                  </div>
                </div>
              </div>

              {/* Imagen 3 - Cuadrada (Community) */}
              <div className="showcase-panel group relative overflow-hidden rounded-2xl md:rounded-3xl aspect-square shadow-2xl">
                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-full h-full">
                  <Image
                    src="/showcase/busy-community.jpg"
                    alt="Busy Community"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Parche Busy - Marca de agua pequeña */}
                  <div className="absolute bottom-2 right-2 w-12 h-12 md:w-14 md:h-14 opacity-40">
                    <Image
                      src="/busy-parche.png"
                      alt="Busy"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-white mb-2">
                      Comunidad
                    </h3>
                    <p className="text-white/80 text-sm">
                      Unidos por la cultura
                    </p>
                  </div>
                </div>
              </div>

              {/* Logo - Cuadrado con fondo negro */}
              <div className="showcase-panel group relative overflow-hidden rounded-2xl md:rounded-3xl aspect-square bg-black shadow-2xl flex items-center justify-center border border-white/10">
                <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative w-40 h-40 md:w-48 md:h-48 transition-transform duration-500 group-hover:scale-110">
                  <BusyLogo variant="white" fill className="drop-shadow-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section - Zigzag Timeline con más recorrido */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background relative overflow-hidden w-full">
        {/* Decorative diagonal lines */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 35px, currentColor 35px, currentColor 36px)',
            }}
          />
        </div>

        <div className="container px-3 sm:px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16 md:mb-20">
              <div className="inline-block mb-4">
                <div className="h-1 w-20 bg-accent-brand rounded-full" />
              </div>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Nuestro Roadmap
              </h2>
              <p className="font-body text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                El camino que recorrimos y hacia dónde vamos
              </p>
            </div>

            {/* Roadmap Items - Zigzag Layout con más separación */}
            <div
              ref={roadmapRef}
              className="relative max-w-7xl mx-auto px-2 pt-16"
            >
              {/* SVG Zigzag Line - Path dinámico que se calcula automáticamente */}
              <svg
                className="absolute left-0 top-0 w-full h-full pointer-events-none hidden md:block"
                style={{ overflow: 'hidden' }}
              >
                <defs>
                  {/* Gradiente para línea pasado/presente (blanco brillante) */}
                  <linearGradient
                    id="roadmap-gradient-present"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--accent-brand))"
                      stopOpacity="1"
                    />
                    <stop
                      offset="50%"
                      stopColor="hsl(var(--accent-brand))"
                      stopOpacity="0.9"
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--accent-brand))"
                      stopOpacity="0.8"
                    />
                  </linearGradient>
                  {/* Gradiente para línea futuro (gris apagado) */}
                  <linearGradient
                    id="roadmap-gradient-future"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--muted-foreground))"
                      stopOpacity="0.3"
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--muted-foreground))"
                      stopOpacity="0.2"
                    />
                  </linearGradient>
                </defs>
                {/* Path PASADO/PRESENTE - Blanco brillante */}
                <path
                  ref={roadmapPathRef}
                  d=""
                  fill="none"
                  stroke="url(#roadmap-gradient-present)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="8 4"
                />
                {/* Path FUTURO - Gris apagado */}
                <path
                  ref={roadmapPathFutureRef}
                  d=""
                  fill="none"
                  stroke="url(#roadmap-gradient-future)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="8 4"
                  opacity="0.5"
                />
              </svg>

              {/* Items Grid - Zigzag alternado con mucha más separación */}
              <div className="space-y-16 md:space-y-32 lg:space-y-32">
                {roadmap.map((item, index) => {
                  // Zigzag centrado: izquierda, derecha alternado, último centrado
                  const isLeft = index % 2 === 0
                  const isLast = index === roadmap.length - 1
                  const alignment = isLeft ? 'left' : 'right'
                  const isCurrent = index === 3 // Oct 2025 - Comunidad y marcas amigas

                  return (
                    <div
                      key={index}
                      className={`roadmap-item ${isLast ? 'mx-auto' : ''}`}
                      style={{
                        marginLeft: isLast ? 'auto' : isLeft ? '0' : 'auto',
                        marginRight: isLast ? 'auto' : isLeft ? 'auto' : '0',
                        maxWidth: '480px',
                      }}
                    >
                      <div className="group relative">
                        {/* Indicador "¡Estamos acá!" */}
                        {isCurrent && (
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
                            <div className="relative">
                              <div className="bg-accent-brand text-black px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap shadow-lg animate-pulse">
                                ¡Estamos acá!
                              </div>
                              {/* Flecha apuntando hacia abajo */}
                              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-accent-brand"></div>
                            </div>
                          </div>
                        )}

                        {/* Card */}
                        <div className="relative bg-card border-2 border-border rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-accent-brand/50">
                          {/* Glow effect con accent-brand */}
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-brand to-accent-brand/50 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />

                          <div className="relative">
                            {/* Icon & Year */}
                            <div className="flex items-center gap-4 mb-4">
                              {/* Icono especial para los primeros tres items */}
                              {index === 0 ? (
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-accent-brand/20 overflow-hidden relative">
                                  <Image
                                    src="/BUSY_LOGO TRANSPARENTE-3.png"
                                    alt="Busy Logo Original"
                                    fill
                                    className="object-contain p-2"
                                    unoptimized
                                  />
                                </div>
                              ) : index === 1 ? (
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden group-hover:scale-110 transition-all duration-300 border border-accent-brand/20 relative">
                                  <Image
                                    src="/creadores.jpg"
                                    alt="Creadores Busy"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              ) : index === 2 ? (
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden group-hover:scale-110 transition-all duration-300 border border-accent-brand/20 relative">
                                  <Image
                                    src="/zakool-remera-crema.png"
                                    alt="Sold Out - Zakool"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-accent-brand/10 rounded-2xl flex items-center justify-center text-accent-brand group-hover:scale-110 group-hover:bg-accent-brand/20 transition-all duration-300 border border-accent-brand/20">
                                  <div className="w-10 h-10 md:w-12 md:h-12">
                                    <RoadmapIcon name={item.icon} />
                                  </div>
                                </div>
                              )}
                              <div>
                                <span className="inline-block px-3 py-1 bg-accent-brand/10 text-accent-brand rounded-full text-xs font-bold mb-2 tracking-wider border border-accent-brand/20">
                                  {item.year}
                                </span>
                                <h3 className="font-heading text-xl md:text-2xl font-bold">
                                  {item.title}
                                </h3>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="font-body text-muted-foreground leading-relaxed">
                              {item.desc}
                            </p>
                          </div>

                          {/* Connector dot */}
                          <div
                            ref={(el) => {
                              roadmapDotsRef.current[index] = el
                            }}
                            className={`absolute top-10 w-4 h-4 bg-accent-brand rounded-full border-4 border-background hidden lg:block ${
                              isLast
                                ? 'left-1/2 -translate-x-1/2'
                                : alignment === 'left'
                                ? '-right-8'
                                : '-left-8'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-12 md:py-16 w-full overflow-hidden">
        {/* Newsletter Signup */}
        <div className="max-w-3xl mx-auto px-4">
          <NewsletterSignup size="large" />
        </div>
      </section>
    </div>
  )
}

export default function AboutPage() {
  return <AboutContent />
}
