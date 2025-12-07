'use client'

import { useI18n } from '@/components/providers/i18n-provider'
import { ProductCard } from '@/components/shop/product-card'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const { t } = useI18n()

  return (
    <section
      id="product-section"
      className="relative overflow-hidden bg-black py-16 md:py-24"
    >
      {/* Top fade to smoothly connect with hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-10 h-16 bg-gradient-to-b from-transparent to-black"
      />
      <div className="relative container px-6 sm:px-4">
        <motion.div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            {t('home.latest.title', { default: 'Últimos lanzamientos' })}
          </h2>
          <p className="font-body text-muted-foreground text-lg md:text-xl">
            {t('home.latest.subtitle', {
              default: 'Descubrí lo más nuevo de Busy',
            })}
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {products.map((product, index) => (
            <motion.div key={product.id}>
              <ProductCard product={product} priority={index < 2} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="text-center mt-12">
          <Button asChild variant="outline" size="lg">
            <Link href="/products" prefetch={false} className="font-heading">
              {t('home.latest.view_all', { default: 'Ver todos' })}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
