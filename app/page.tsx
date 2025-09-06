"use client"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Star, Users, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/shop/product-card"
import { getProducts } from "@/lib/products"
import { AutoSliderBanner } from "@/components/home/auto-slider-banner"

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

export default function Home() {
  const featuredProducts = getProducts().slice(0, 4)
  const categories = [
    { name: "Hoodies", href: "/products?category=hoodies", image: "/cozy-hoodie.png" },
    { name: "T-Shirts", href: "/products?category=tshirts", image: "/plain-white-tshirt.png" },
    { name: "Accessories", href: "/products?category=accessories", image: "/baseball-cap-display.png" },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Slider */}
      <AutoSliderBanner />

      {/* Latest Collection */}
      <section id="product-section" className="py-16 md:py-24">
        <div className="container px-4">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Latest Collection</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our newest arrivals, crafted with attention to detail and designed for everyday comfort.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featuredProducts.map((product) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...fadeInUp} className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/products">View All Products</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-4">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground text-lg">Find exactly what you're looking for</p>
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
                      <h3 className="font-heading text-2xl font-bold text-white mb-2">{category.name}</h3>
                      <Button variant="secondary" size="sm">
                        Shop Now <ArrowRight className="ml-2 h-4 w-4" />
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
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">About Busy</h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Founded on the principle that great style shouldn't compromise comfort, Busy creates premium streetwear
                for the modern individual. Every piece is thoughtfully designed and crafted with the finest materials.
              </p>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                From our signature hoodies to essential tees, we believe in quality over quantity, creating timeless
                pieces that become staples in your wardrobe.
              </p>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Our Story</Link>
              </Button>
            </motion.div>

            <motion.div {...fadeInUp} className="relative">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: "url('/busy-brand-story.jpg')" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container px-4">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Trusted by Thousands</h2>
            <p className="text-muted-foreground text-lg">Join our community of style enthusiasts</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: Star, title: "4.8/5 Rating", description: "From over 1,000 reviews" },
              { icon: Users, title: "50K+ Customers", description: "Worldwide community" },
              { icon: Award, title: "Premium Quality", description: "Guaranteed satisfaction" },
            ].map((item, index) => (
              <motion.div key={index} variants={fadeInUp} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-brand/10 rounded-full mb-4">
                  <item.icon className="h-8 w-8 text-accent-brand" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">{item.title}</h3>
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
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">Ready to Elevate Your Style?</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Discover premium streetwear that combines comfort, quality, and contemporary design. Join thousands of
              satisfied customers who trust Busy for their everyday style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/products">
                  Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
