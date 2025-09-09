import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { getPostBySlug, getAllPosts } from "@/lib/blog"
import { format } from "date-fns"
import { cookies } from "next/headers"
import { enUS, es } from "date-fns/locale"
import { I18nText } from "@/components/blog/i18n-text"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
export const revalidate = 3600
// Note: This page is a server component. Avoid client hooks here.

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  const base = process.env.SITE_URL || "https://busy.com.ar"
  const canonical = `${base}/blog/${post.slug}`
  const image = "/busy-streetwear.png"

  return {
    title: `${post.title} - Busy Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} - Busy Blog`,
      description: post.description,
      images: [image],
    },
    alternates: {
      canonical,
    },
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const allPosts = getAllPosts()
  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug)
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null

  const localeCookie = cookies().get("busy_locale")?.value
  const dfnsLocale = localeCookie === "es" ? es : enUS

  return (
    <div className="container px-4 py-8 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* JSON-LD Article */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: post.title,
              description: post.description,
              datePublished: post.date,
              dateModified: post.date,
              url: `${process.env.SITE_URL || "https://busy.com.ar"}/blog/${post.slug}`,
              image: ["/busy-streetwear.png"],
              author: {
                "@type": "Organization",
                name: "Busy",
              },
              publisher: {
                "@type": "Organization",
                name: "Busy",
                logo: {
                  "@type": "ImageObject",
                  url: `${process.env.SITE_URL || "https://busy.com.ar"}/logo-busy-black.png`,
                },
              },
            }),
          }}
        />
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/blog" prefetch={false}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            <I18nText k="blog.post.back" />
          </Link>
        </Button>

        {/* Article Header */}
        <article>
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-balance">{post.title}</h1>

            <p className="text-lg text-muted-foreground mb-6 text-pretty">{post.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.date), "MMMM dd, yyyy", { locale: dfnsLocale })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {post.readingTime}
                </div>
              </div>

              <Button variant="outline" size="sm" aria-label="Share" title="Share" data-label="Share">
                <Share2 className="h-4 w-4 mr-2" />
                <I18nText k="blog.post.share" />
              </Button>
            </div>
          </header>

          <Separator className="mb-8" />

          {/* Article Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-a:text-accent-brand prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-accent-brand prose-blockquote:bg-muted prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
            <MDXRemote
              source={post.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </div>
        </article>

        <Separator className="my-12" />

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prevPost && (
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-2"><I18nText k="blog.post.prev" /></div>
                <Link href={`/blog/${prevPost.slug}`} className="group" prefetch={false}>
                  <h3 className="font-medium group-hover:text-accent-brand transition-colors line-clamp-2">
                    {prevPost.title}
                  </h3>
                </Link>
              </CardContent>
            </Card>
          )}

          {nextPost && (
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-2"><I18nText k="blog.post.next" /></div>
                <Link href={`/blog/${nextPost.slug}`} className="group" prefetch={false}>
                  <h3 className="font-medium group-hover:text-accent-brand transition-colors line-clamp-2">
                    {nextPost.title}
                  </h3>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card>
            <CardContent className="p-8">
              <h3 className="font-heading text-2xl font-bold mb-4"><I18nText k="blog.post.cta.title" /></h3>
              <p className="text-muted-foreground mb-6"><I18nText k="blog.post.cta.subtitle" /></p>
              <Button asChild size="lg" aria-label="Shop Collection" title="Shop Collection" data-label="Shop Collection">
                <Link href="/products" prefetch={false}><I18nText k="blog.post.cta.button" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
