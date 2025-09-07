'use client'
import { AutoSliderBanner } from '@/components/home/auto-slider-banner'
import { useI18n } from '@/components/i18n-provider'
import { ProductCard } from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import { getProducts } from '@/lib/products'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Award, Star, Users } from 'lucide-react'
import Link from 'next/link'

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
  const featuredProducts = getProducts().slice(0, 4)
  const categories = [
    {
      name: t('footer.sections.shop.links.hoodies'),
      href: '/products?category=hoodies',
      image: '/cozy-hoodie.png',
    },
    {
      name: t('footer.sections.shop.links.tshirts'),
      href: '/products?category=tshirts',
      image: '/plain-white-tshirt.png',
    },
    {
      name: t('footer.sections.shop.links.accessories'),
      href: '/products?category=accessories',
      image: '/baseball-cap-display.png',
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Slider */}
      <AutoSliderBanner />

      {/* Latest Collection */}
      <section
        id="product-section"
        className="py-16 md:py-24 relative overflow-hidden"
      >
        {/* right-side decorative background image */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, filter: 'blur(12px)' }}
          whileInView={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-y-0 right-0 w-[650px] -mr-24 pointer-events-none hidden md:block -z-10"
          aria-hidden
        >
          <div className="relative h-full w-full">
            <Image
              src="/ciro remera blanca.png"
              alt="Ciro Remera Blanca"
              width={650}
              height={650}
              className="object-contain object-right brightness-50 contrast-100"
              priority={false}
            />
          </div>
        </motion.div>
        <div className="container px-4">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {t('home.latest.title')}
            </h2>
            <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
              {t('home.latest.subtitle')}
            </p>
          </motion.div>

          <motion.div
            variants={immersiveContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featuredProducts.map((product) => (
              <motion.div key={product.id} variants={immersiveItem}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...fadeInUp} className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/products" className="font-heading">
                {t('home.latest.view_all')}
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-4">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {t('home.categories.title')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('home.categories.subtitle')}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {categories.map((category) => (
              <motion.div key={category.name} variants={fadeInUp}>
                <Link href={category.href} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-background">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundImage: `url('${category.image}')` }}
                    />
                    <div className="absolute bottom-6 left-6 z-20">
                      <h3 className="font-heading text-2xl font-bold text-white mb-2">
                        {category.name}
                      </h3>
                      <Button variant="secondary" size="sm">
                        {t('home.categories.cta')}{' '}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative overflow-hidden ">
        <div className="container px-4 mx-auto py-16 md:py-24 ">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-repeat bg-cover opacity-50"
            style={{
              backgroundImage: 'url(/pattern.png)',
              backgroundSize: '90% ',
            }}
          />
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center justify-center justify-items-center place-content-center">
            <motion.div {...fadeInUp} className="w-full max-w-xl mx-auto">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
                {t('home.about.title')}
              </h2>
              <p className="text-muted-foreground font-body text-lg mb-6 leading-relaxed ">
                {t('home.about.p1')}
              </p>
              <p className="text-muted-foreground font-body text-lg mb-8 leading-relaxed">
                {t('home.about.p2')}
              </p>
              <Button asChild variant="outline" size="lg">
                <Link href="/about" className="font-heading">
                  {t('home.about.cta')}
                </Link>
              </Button>
            </motion.div>

            <motion.div {...fadeInUp} className="relative ml-auto">
              {/* Creative border frame with subtle white glow */}
              <div className="group relative h-[760px] w-[440px] rounded-2xl p-[2px] bg-gradient-to-br from-white/25 via-white/10 to-transparent shadow-[0_0_50px_rgba(35,35,35,0.3)] ring-1 ring-white/10">
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
      </section>

      {/* Social Proof */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-4">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {t('home.social.title')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('home.social.subtitle')}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Star,
                title: t('home.social.items.rating.title'),
                description: t('home.social.items.rating.desc'),
              },
              {
                icon: Users,
                title: t('home.social.items.customers.title'),
                description: t('home.social.items.customers.desc'),
              },
              {
                icon: Award,
                title: t('home.social.items.quality.title'),
                description: t('home.social.items.quality.desc'),
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-brand/10 rounded-full mb-4">
                  <item.icon className="h-8 w-8 text-accent-brand" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {t('home.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/products">
                  {t('home.cta.primary')}{' '}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 bg-transparent"
              >
                <Link href="/contact">{t('home.cta.secondary')}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
