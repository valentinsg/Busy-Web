"use client"

import NewsletterSignup from "@/components/blog/newsletter-signup"
import SocialLinksInline from "@/components/blog/social-links-inline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, ShoppingBag } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import type { BlogPost } from "@/types/blog"
import { getProductsAsync } from "@/lib/repo/products"
import type { Product } from "@/lib/types"

export function MarketingSidebar({ latestPost }: { latestPost?: BlogPost }) {
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([])

  React.useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const res = await getProductsAsync({ featuredOnly: true, sortBy: "newest" })
        if (!cancel) setFeaturedProducts((res || []).slice(0, 3))
      } catch {
        if (!cancel) setFeaturedProducts([])
      }
    })()
    return () => { cancel = true }
  }, [])

  return (
    <div className="space-y-6 mt-14 font-body">
      {/* Newsletter Subscription (shared component) */}
      <NewsletterSignup />

      {/* Latest post CTA */}
      {latestPost && (
        <Card className="overflow-hidden">
          {latestPost.cover && (
            <div className="relative aspect-[16/9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={latestPost.cover} alt={latestPost.coverAlt || latestPost.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}
          <CardContent className="p-5">
            {latestPost.category && (
              <div className="mb-2 text-xs text-muted-foreground uppercase tracking-wide">{latestPost.category}</div>
            )}
            <h3 className="font-heading text-lg font-semibold mb-2 line-clamp-2">{latestPost.title}</h3>
            {latestPost.description && (
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{latestPost.description}</p>
            )}
            <Button asChild size="sm" className="font-body">
              <Link href={latestPost.cta?.url || `/blog/${latestPost.slug}`} prefetch={false}>
                {latestPost.cta?.text || "Leer artículo"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* New Arrivals */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-accent-brand" />
            <CardTitle className="text-lg">Destacados</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {featuredProducts.length === 0 && (
            <div className="text-sm text-muted-foreground">No hay productos destacados.</div>
          )}
          {featuredProducts.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} prefetch={false} className="group flex items-center gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images?.[0] || "/product-bg.jpg"} alt={p.name} className="h-10 w-10 rounded object-cover border" />
              <div className="min-w-0">
                <div className="font-medium truncate group-hover:text-accent-brand">{p.name}</div>
                <div className="text-xs text-muted-foreground">Desde ${p.price.toLocaleString()}</div>
              </div>
            </Link>
          ))}
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/products" prefetch={false}>
              Ver todos los productos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Social Links */}
      <SocialLinksInline />
    </div>
  )
}
