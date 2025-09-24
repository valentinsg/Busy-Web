'use client'
import { AutoSliderBanner } from '@/components/home/auto-slider-banner'
import HomeLatestBlog from '@/components/home/latest-blog'
import { useI18n } from '@/components/i18n-provider'
import { ProductCard } from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import { getProductsAsync } from '@/lib/repo/products'
import type { Product } from '@/lib/types'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Subtle, immersive entrance for product cards
const immersiveItem = {
  initial: { opacity: 0, y: 24, scale: 0.98, filter: 'blur(8px)' },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.7 },
  },
}

const immersiveContainer = {
  animate: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.05,
    },
  },
}

export default function Home() {
  const { t } = useI18n()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const fromSb = await getProductsAsync()
        if (mounted && fromSb && fromSb.length) {
          setFeaturedProducts(fromSb.slice(0, 4))
        }
      } catch {
        // Do not fallback to local JSON to avoid stale/fake data on Home
        setFeaturedProducts([])
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Wait for splash screen to complete before rendering animated sections
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const markReady = () => {
      setReady(true)
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    // Fallback in case the event isn't received for any reason
    timeoutId = setTimeout(markReady, 3000)

    const onSplashComplete = () => markReady()
    try {
      window.addEventListener('busy:splash-complete', onSplashComplete)
    } catch {}

    return () => {
      try {
        window.removeEventListener('busy:splash-complete', onSplashComplete)
      } catch {}
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const categories = [
    {
      name: t('footer.sections.shop.links.hoodies'),
      href: '/products?category=hoodies',
      image: '/hoodies-background.png',
    },
    {
      name: t('footer.sections.shop.links.tshirts'),
      href: '/products?category=tshirts',
      image: '/t-shirts-background.png',
    },
    {
      name: t('footer.sections.shop.links.pants'),
      href: '/products?category=pants',
      image: '/pants-background.png',
    },
  ]

  return (
    <div className="flex flex-col">
      <AutoSliderBanner />

      {/* Latest Collection (render after splash completes for visible animations) */}
      {ready && (
        <section
          id="product-section"
          className="relative overflow-hidden bg-black py-16 md:py-24"
        >
          {/* Top fade to smoothly connect with hero */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-10 h-16 bg-gradient-to-b from-transparent to-black"
          />
          <div className="relative container px-3 sm:px-4">
            <motion.div {...fadeInUp} className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                {t('home.latest.title')}
              </h2>
              <p className="font-body text-muted-foreground text-lg md:text-xl">
                {t('home.latest.subtitle')}
              </p>
            </motion.div>

            <motion.div
              key={`products-${ready ? 'after' : 'before'}`}
              variants={immersiveContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8"
            >
              {featuredProducts.map((product) => (
                <motion.div key={product.id} variants={immersiveItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            <motion.div {...fadeInUp} className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link
                  href="/products"
                  prefetch={false}
                  className="font-heading"
                >
                  {t('home.latest.view_all')}
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Categories Grid */}
      {ready && (
        <section className="relative py-14 sm:py-16 md:py-24 lg:py-28">
          <div className="container px-3 sm:px-4">
            <motion.div {...fadeInUp} className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                {t('home.categories.title')}
              </h2>
              <p className="font-body text-muted-foreground  text-lg md:text-xl">
                {t('home.categories.subtitle')}
              </p>
            </motion.div>

            <motion.div
              key={`categories-${ready ? 'after' : 'before'}`}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8"
            >
              {categories.map((category) => (
                <motion.div key={category.name} variants={fadeInUp}>
                  <Link
                    href={category.href}
                    prefetch={false}
                    className="group block"
                  >
                    {/* Glow frame wrapper */}
                    <div className="group relative rounded-2xl p-[4px] bg-gradient-to-br from-white/45 via-white/20 to-transparent shadow-[0_0_50px_rgba(35,35,35,0.3)] ring-2 ring-white/30">
                      {/* soft external glow */}
                      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5" />

                      {/* subtle inner border */}
                      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15" />

                      {/* corner accents */}
                      <span className="pointer-events-none absolute top-3 left-3 h-px w-8 bg-white/40" />
                      <span className="pointer-events-none absolute top-3 left-3 h-8 w-px bg-white/40" />
                      <span className="pointer-events-none absolute top-3 right-3 h-px w-8 bg-white/40" />
                      <span className="pointer-events-none absolute top-3 right-3 h-8 w-px bg-white/40" />
                      <span className="pointer-events-none absolute bottom-3 left-3 h-px w-8 bg-white/30" />
                      <span className="pointer-events-none absolute bottom-3 left-3 h-8 w-px bg-white/30" />
                      <span className="pointer-events-none absolute bottom-3 right-3 h-px w-8 bg-white/30" />
                      <span className="pointer-events-none absolute bottom-3 right-3 h-8 w-px bg-white/30" />

                      {/* content card */}
                      <div className="relative aspect-square overflow-hidden rounded-[16px] bg-background ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)]">
                        {/* gentle sheen on hover */}
                        <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-15 transition-opacity duration-500" />

                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                          style={{
                            backgroundImage: `url('${category.image}')`,
                          }}
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
                            {t('home.categories.cta')}{' '}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* About Section */}
      {ready && (
        <section className="relative overflow-hidden bg-black">
          <div className="relative z-10 container px-3 sm:px-4 mx-auto py-16 md:py-24 ">
            <div
              className="pointer-events-none absolute inset-0 -z-10 bg-repeat opacity-25"
              style={{
                backgroundImage: 'url(/pattern-black.jpg)',
              }}
            />
            <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center justify-center justify-items-center place-content-center">
              <motion.div
                {...fadeInUp}
                className="w-full max-w-xl mx-auto text-center"
              >
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                  {t('home.about.title')}
                </h2>
                <p className="text-muted-foreground font-body text-lg md:text-xl mb-4 leading-relaxed ">
                  {t('home.about.p1')}
                </p>
                <p className="text-muted-foreground font-body text-lg md:text-xl mb-8 leading-relaxed">
                  {t('home.about.p2')}
                </p>
                <Button asChild variant="outline" size="lg">
                  <Link href="/about" prefetch={false} className="font-heading">
                    {t('home.about.cta')}
                  </Link>
                </Button>
              </motion.div>

              <motion.div {...fadeInUp} className="relative ml-auto w-full">
                {/* Creative border frame with subtle white glow */}
                <div className="group relative w-full max-w-sm sm:max-w-md md:max-w-lg aspect-[11/19] rounded-2xl p-[4px] bg-gradient-to-br from-white/45 via-white/20 to-transparent shadow-[0_0_50px_rgba(35,35,35,0.3)] ring-2 ring-white/30">
                  {/* soft external glow */}
                  <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl blur-3xl bg-white/5" />

                  {/* subtle inner border */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15" />

                  {/* corner accents */}
                  <span className="pointer-events-none absolute top-3 left-3 h-px w-8 bg-white/40" />
                  <span className="pointer-events-none absolute top-3 left-3 h-8 w-px bg-white/40" />
                  <span className="pointer-events-none absolute top-3 right-3 h-px w-8 bg-white/40" />
                  <span className="pointer-events-none absolute top-3 right-3 h-8 w-px bg-white/40" />
                  <span className="pointer-events-none absolute bottom-3 left-3 h-px w-8 bg-white/30" />
                  <span className="pointer-events-none absolute bottom-3 left-3 h-8 w-px bg-white/30" />
                  <span className="pointer-events-none absolute bottom-3 right-3 h-px w-8 bg-white/30" />
                  <span className="pointer-events-none absolute bottom-3 right-3 h-8 w-px bg-white/30" />

                  {/* content card */}
                  <div className="relative h-full w-full overflow-hidden rounded-[16px] bg-muted opacity-80 ring-1 ring-white/10 shadow-[0_8px_40px_rgba(25,25,25,0.2)]">
                    {/* gentle sheen on hover */}
                    <div className="pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-tr from-white/15 via-transparent to-transparent opacity-0 group-hover:opacity-15 transition-opacity duration-500" />
                    <div
                      className="w-full h-full bg-cover object-contain"
                      style={{ backgroundImage: "url('/ciro-gif.gif')" }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          {/* Bottom fade to blend patterned About section with next (Contracultura) section */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 md:h-56 bg-gradient-to-b from-transparent via-black/70 to-black"
          />
        </section>
      )}

      {/* Social Proof */}
      {ready && (
        <section className="relative bg-background py-16 md:py-28">
          {/* Top fade to smoothly connect with About */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 md:h-56 bg-gradient-to-b from-black via-black/70 to-transparent"
          />
          <div className="relative z-10 container px-3 sm:px-4">
            <motion.div {...fadeInUp} className="text-center mb-24">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                {t('home.social.title')}
              </h2>
              <p className="font-body text-muted-foreground text-lg md:text-xl">
                {t('home.social.subtitle')}
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {[
                {
                  iconSrc: '/blog.png',
                  title: t('home.social.items.rating.title'),
                  description: t('home.social.items.rating.desc'),
                  href: '/blog',
                },
                {
                  iconSrc: '/spotify.png',
                  title: t('home.social.items.customers.title'),
                  description: t('home.social.items.customers.desc'),
                  href: 'https://open.spotify.com/',
                },
                {
                  iconSrc: '/drops.png',
                  title: t('home.social.items.quality.title'),
                  description: t('home.social.items.quality.desc'),
                  href: '/products',
                },
              ].map(
                (
                  item: {
                    iconSrc: string
                    title: string
                    description: string
                    href: string
                  },
                  index
                ) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="text-center"
                  >
                    {item.href.startsWith('http') ? (
                      <>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-block"
                        >
                          <div className="inline-flex bg-transparent rounded-full border-4 border-white items-center justify-center mb-3 sm:mb-4">
                            <Image
                              src={item.iconSrc || ''}
                              alt={item.title}
                              width={160}
                              height={160}
                              className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-40 lg:w-40 rounded-full contrast-150 brightness-25 transition-transform duration-300"
                            />
                          </div>
                          <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-semibold mb-1 sm:mb-2">
                            {item.title}
                          </h3>
                        </a>
                        <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg">
                          {item.description}
                        </p>
                      </>
                    ) : (
                      <>
                        <Link
                          href={item.href}
                          prefetch={false}
                          className="group inline-block"
                        >
                          <div className="inline-flex bg-transparent  rounded-full border-4 border-white items-center justify-center mb-3 sm:mb-4">
                            <Image
                              src={item.iconSrc || ''}
                              alt={item.title}
                              width={160}
                              height={160}
                              className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-40 lg:w-40 rounded-full contrast-150 brightness-25 transition-transform duration-300"
                            />
                          </div>
                          <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-semibold mb-1 sm:mb-2">
                            {item.title}
                          </h3>
                        </Link>
                        <p className="font-body text-muted-foreground text-sm sm:text-base md:text-lg">
                          {item.description}
                        </p>
                      </>
                    )}
                  </motion.div>
                )
              )
            }
            </motion.div>
          </div>
        </section>
      )}

      {/* Latest Blog Section (replaces previous CTA) */}
      {ready && <HomeLatestBlog />}
    </div>
  )
}
