"use client"

import NewsletterSignup from "@/components/blog/newsletter-signup"
import SocialLinksInline from "@/components/blog/social-links-inline"
import LatestPlaylistsSidebarClient from "@/components/blog/latest-playlists-sidebar-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Product } from "@/lib/types"
import type { BlogPost } from "@/types/blog"
import { ArrowRight, ShoppingBag } from "lucide-react"
import Link from "next/link"

interface MarketingSidebarProps {
  latestPost?: BlogPost
  featuredProducts?: Product[]
}

export function MarketingSidebar({ latestPost, featuredProducts = [] }: MarketingSidebarProps) {

  return (
    <div className="space-y-6 mt-6 md:mt-12 font-body">
      {/* Newsletter Subscription (shared component) */}
      <NewsletterSignup />

      {/* Latest post CTA */}
      {latestPost && (
        <Card className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex gap-3 items-center">
              {latestPost.cover && (
                <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={latestPost.cover} alt={latestPost.coverAlt || latestPost.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-base font-semibold mb-1 line-clamp-2">{latestPost.title}</h3>
                <Button asChild size="sm" className="font-body h-8 text-sm mt-2">
                  <Link href={latestPost.cta?.url || `/blog/${latestPost.slug}`} prefetch={false}>
                    {latestPost.cta?.text || "Leer"}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Arrivals */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-accent-brand" />
            <CardTitle className="text-lg">Destacados</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-3">
          {featuredProducts.length === 0 && (
            <div className="text-sm text-muted-foreground">No hay productos destacados.</div>
          )}
          {featuredProducts.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} prefetch={false} className="group flex items-center gap-2 rounded-md p-1.5 hover:bg-muted/50 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images?.[0] || "/product-bg.jpg"} alt={p.name} className="h-10 w-10 rounded object-cover border" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium truncate group-hover:text-accent-brand">{p.name}</div>
                <div className="text-xs text-muted-foreground">Desde ${p.price.toLocaleString()}</div>
              </div>
            </Link>
          ))}
          <Button asChild variant="outline" size="sm" className="w-full h-9 text-sm">
            <Link href="/products" prefetch={false}>
              Ver todos <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Playlists */}
      <LatestPlaylistsSidebarClient />

      {/* Social Links */}
      <SocialLinksInline />
    </div>
  )
}
