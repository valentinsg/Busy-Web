"use client"

import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { BlogPost } from "@/types/blog"
import { format } from "date-fns"
import { enUS, es as esLocale } from "date-fns/locale"
import { Calendar, Clock, Search } from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { BlogCategories, CategoryBadge } from "./blog-categories"
import { MarketingSidebar } from "./marketing-sidebar"

interface BlogClientProps {
  allPosts: BlogPost[]
  allTags: string[]
  latestPost?: BlogPost
}

export default function BlogClient({ allPosts, allTags, latestPost }: BlogClientProps) {
  const { t, locale } = useI18n() as { t: (k: string) => string; locale: "en" | "es" }
  const dfnsLocale = locale === "es" ? esLocale : enUS
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

  const filteredPosts = React.useMemo(() => {
    let posts = allPosts

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      posts = posts.filter(
        (post: BlogPost) =>
          post.title.toLowerCase().includes(q) ||
          post.description.toLowerCase().includes(q) ||
          post.tags.some((tag: string) => tag.toLowerCase().includes(q)) ||
          post.content.toLowerCase().includes(q),
      )
    }

    if (selectedCategory) {
      posts = posts.filter((post) => post.category === selectedCategory)
    }

    return posts
  }, [allPosts, searchQuery, selectedCategory])

  // Calculate post counts by category
  const postCounts = React.useMemo(() => {
    const counts: Record<string, number> = { total: allPosts.length }
    allPosts.forEach(post => {
      if (post.category) {
        counts[post.category] = (counts[post.category] || 0) + 1
      }
    })
    return counts
  }, [allPosts])

  // Unique categories present in content
  const categories = React.useMemo(
    () => Array.from(new Set(allPosts.map(p => p.category).filter(Boolean) as string[])),
    [allPosts]
  )

  const featuredPost = filteredPosts[0] ?? allPosts[0]
  //const regularPosts = filteredPosts.length > 0 ? filteredPosts.slice(1) : allPosts.slice(1)

  return (
    <div className="container px-4 py-8 pt-24 font-body">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 ">{t("blog.header.title")}</h1>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">{t("blog.header.subtitle")}</p>
        </div>

        {/* Categories + Search in one section */}
        <div className="mb-6 space-y-4">
          <BlogCategories
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChangeAction={setSelectedCategory}
            postCounts={postCounts}
          />
          <div className="relative max-w-xl mx-auto w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("blog.search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Post */}
            {!searchQuery && !selectedCategory && featuredPost && (
              <div className="mb-12">
                <h2 className="font-heading text-2xl font-bold mb-6">Artículo Destacado</h2>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow rounded-xl border bg-muted/10">
                  <Link href={`/blog/${featuredPost.slug}`} prefetch={false}>
                    {featuredPost.cover && (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={featuredPost.cover}
                          alt={featuredPost.coverAlt || featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        {featuredPost.category && <CategoryBadge categoryId={featuredPost.category} />}
                      </div>
                      <h3 className="font-heading text-2xl font-bold mb-4 line-clamp-2 hover:text-accent-brand transition-colors">
                        {featuredPost.title}
                      </h3>
                      <p className="font-body text-muted-foreground mb-6 line-clamp-3">{featuredPost.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(featuredPost.date), "MMM dd, yyyy", { locale: dfnsLocale })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {featuredPost.readingTime}
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            )}

            {/* Posts Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl font-bold">
                  {searchQuery || selectedCategory ? "Resultados de búsqueda" : "Últimos artículos"}
                </h2>
                <p className="font-body text-sm text-muted-foreground">
                  {filteredPosts.length} artículo{filteredPosts.length !== 1 ? 's' : ''}
                </p>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-muted-foreground mb-4">
                    <Search className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="font-heading font-medium mb-2">No se encontraron artículos</h3>
                    <p className="font-body text-sm">Intenta con otros términos de búsqueda</p>
                  </div>
                  <Button
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory(null)
                    }}
                    variant="outline"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-7">
                  {filteredPosts.map((post) => (
                    <Card
                      key={post.slug}
                      className="overflow-hidden group hover:shadow-lg transition-all duration-300 h-full rounded-xl border bg-muted/10 hover:-translate-y-0.5"
                    >
                      <Link href={`/blog/${post.slug}`} prefetch={false} className="flex h-full flex-col">
                        {post.cover && (
                          <div className="relative aspect-[16/9] overflow-hidden">
                            <img
                              src={post.cover}
                              alt={post.coverAlt || post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                            {post.category && (
                              <div className="absolute left-3 bottom-3">
                                <CategoryBadge categoryId={post.category} />
                              </div>
                            )}
                          </div>
                        )}
                        <CardContent className="p-5 flex flex-col gap-2 grow">
                          <h3 className="font-heading text-lg font-bold line-clamp-2 group-hover:text-accent-brand transition-colors">
                            {post.title}
                          </h3>
                          <p className="font-body text-muted-foreground text-sm line-clamp-2">
                            {post.excerpt || post.description}
                          </p>
                          <div className="mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(post.date), "MMM dd", { locale: dfnsLocale })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readingTime}
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <MarketingSidebar latestPost={latestPost || allPosts[0]} />
          </div>
        </div>
      </div>
    </div>
  )
}
