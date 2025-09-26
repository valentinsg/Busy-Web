import AuthorCard from '@/components/blog/author-card'
import { I18nText } from '@/components/blog/i18n-text'
import LatestPostsSidebar from '@/components/blog/latest-posts-sidebar'
import SocialLinksInline from '@/components/blog/social-links-inline'
import MdxRenderer from '@/components/mdx/MdxRenderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getAllPostsAsync, getPostBySlugAsync } from '@/lib/blog'
import { format } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import Image from 'next/image'
import {
  ArrowUpRight,
  Calendar,
  ChevronDown,
  Clock,
  Share2,
} from 'lucide-react'
import type { Metadata } from 'next'
import type { BlogPost } from '@/types/blog'
import NextDynamic from 'next/dynamic'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import getServiceClient from '@/lib/supabase/server'
import authorsJson from '@/data/authors.json'

// Client helpers
const CopyLinkButton = NextDynamic(
  () => import('@/components/blog/copy-link-button'),
  { ssr: false }
)

// Table of contents (client)
const TableOfContents = NextDynamic(
  () =>
    import('@/components/blog/table-of-contents').catch(() => ({
      default: () => null,
    })),
  { ssr: false }
)

const NewsletterSignup = NextDynamic(
  () => import('@/components/blog/newsletter-signup'),
  { ssr: false }
)

const RatingStars = NextDynamic(() => import('@/components/blog/rating-stars'), {
  ssr: false,
})

const CommentsForm = NextDynamic(() => import('@/components/blog/comments-form'), {
  ssr: false,
})

export const revalidate = process.env.NODE_ENV === 'production' ? 3600 : 0
export const dynamic = process.env.NODE_ENV === 'production' ? 'auto' : 'force-dynamic'

// Note: This page is a server component. Avoid client hooks here.

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostBySlugAsync(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const base = process.env.SITE_URL || 'https://busy.com.ar'
  const canonical = post.canonical || `${base}/blog/${post.slug}`
  const image = post.ogImage || post.cover || '/busy-streetwear.png'

  return {
    title: `▷ ${post.title}`,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} - Blog de Busy`,
      description: post.description,
      images: [image],
    },
    alternates: {
      canonical,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlugAsync(params.slug)

  if (!post) {
    notFound()
  }

  const allPosts = await getAllPostsAsync()
  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug)
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
  const nextPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  // Note: related posts are rendered via backlinks below; explicit 'related' list removed

  const localeCookie = cookies().get('busy_locale')?.value
  const dfnsLocale = localeCookie === 'es' ? es : enUS
  const authorName = post.authorName || post.author || ''

  // Enrich author social links from Supabase (authors table)
  const supabase = getServiceClient()
  let social: { instagram?: string; x?: string; linkedin?: string; medium?: string; bio?: string } = {}
  try {
    if (authorName) {
      const { data } = await supabase
        .from('authors')
        .select('instagram_url, linkedin_url, medium_url, twitter_url, bio, name')
        .ilike('name', authorName) // case-insensitive match; if fails, we'll fallback to JSON
        .maybeSingle()
      if (data) {
        social.instagram = (data as any).instagram_url || undefined
        social.linkedin = (data as any).linkedin_url || undefined
        social.medium = (data as any).medium_url || undefined
        social.x = (data as any).twitter_url || undefined
        social.bio = (data as any).bio || undefined
      }
    }
  } catch {}

  // Fallback: explicit X/Twitter link for Valentín Sánchez Guevara
  if (!social.x && authorName.toLowerCase().includes('valent')) {
    social.x = 'https://x.com/valentainn__'
  }
  // Fallback: Instagram for Valentín Sánchez Guevara
  if (!social.instagram && authorName.toLowerCase().includes('valent')) {
    social.instagram = 'https://instagram.com/valensanchez.g'
  }

  // Fallback to local authors.json if still missing any field
  if (!social.instagram || !social.x || !social.linkedin || !social.medium || !social.bio) {
    try {
      const list = authorsJson as Array<{ name?: string; instagram?: string; twitter?: string; linkedin?: string; medium?: string; bio?: string }>
      const norm = (s: string) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
      const found = list.find((a) => norm(a.name || '') === norm(authorName))
      if (found) {
        social.instagram = social.instagram || (found as any).instagram || undefined
        social.x = social.x || (found as any).twitter || undefined
        social.linkedin = social.linkedin || (found as any).linkedin || undefined
        social.medium = social.medium || (found as any).medium || undefined
        social.bio = social.bio || (found as any).bio || undefined
      }
    } catch {}
  }

  // Final fallback bio for Valentín if still missing
  if (!social.bio && authorName.toLowerCase().includes('valent')) {
    social.bio = 'Co-Founder, Director Técnico y Creativo de Busy, desarrollador de software y creador de la identidad de la marca.'
  }

  // Normalize CRLF to LF only; remark-breaks will handle single newlines as <br>
  const preparedContent = (post.content || '').replace(/\r\n/g, '\n')

  return (
    <div className="container py-8 pt-28 tracking-wide font-body backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        {/* JSON-LD Article */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: post.title,
              description: post.description,
              datePublished: post.date,
              dateModified: post.date,
              url: `${process.env.SITE_URL || 'https://busy.com.ar'}/blog/${
                post.slug
              }`,
              image: [post.ogImage || post.cover || '/busy-streetwear.png'],
              keywords: post.tags,
              author:
                post.authorName || post.author
                  ? { '@type': 'Person', name: post.authorName || post.author }
                  : { '@type': 'Organization', name: 'Busy' },
              publisher: {
                '@type': 'Organization',
                name: 'Busy',
                logo: {
                  '@type': 'ImageObject',
                  url: `${
                    process.env.SITE_URL || 'https://busy.com.ar'
                  }/logo-busy-black.png`,
                },
              },
            }),
          }}
        />
        {/* Article Header */}
        <article>
          <header className="mb-6">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3 text-balance">
              {post.title}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-4 text-pretty font-body">
              {post.description || post.excerpt}
            </p>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                {post.category && (
                  <span className="text-xs inline-block bg-muted px-2 py-1 rounded mr-2">
                    {post.category}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.date), 'MMMM dd, yyyy', {
                    locale: dfnsLocale,
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {post.readingTime}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CopyLinkButton />
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Share"
                  title="Share"
                  data-label="Share"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  <I18nText k="blog.post.share" />
                </Button>
              </div>
            </div>
          </header>

          <Separator className="mb-6 bg-muted h-[2px]" />

          {/* Body with sidebar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              {/* Article Content */}
              <div
                id="post-content"
                className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-body prose-h1:font-heading prose-p:font-body prose-li:font-body md:prose-xl prose-p:text-[18px] md:prose-p:text-[20px] prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-p:leading-relaxed prose-p:my-5 prose-li:my-2 prose-a:text-accent-brand prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-accent-brand prose-blockquote:bg-muted prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-th:border prose-td:border prose-table:border prose-table:rounded-md whitespace-normal break-words"
              >
                <MdxRenderer source={preparedContent} />
              </div>
            </div>
            <aside className="md:col-span-1 space-y-6 md:sticky md:top-24 h-fit">
              <TableOfContents targetSelector="#post-content" />
              {/* CTA personalizada al final después de relacionados */}
              {post.cta?.url && (post.cta.text || post.cta.url) && (
                <div className="mt-12 mb-12 text-center ">
                  <Card>
                    <CardContent className="p-6 bg-muted/20">
                      <h3 className="font-body text-xl font-bold mb-4">
                        {post.cta.text || 'Descubrí más'}
                      </h3>
                      <Button
                        asChild
                        size="lg"
                        aria-label="CTA"
                        title="CTA"
                        data-label="CTA"
                      >
                        <Link
                          href={post.cta.url}
                          prefetch={false}
                          className="font-body"
                        >
                          {post.cta.text || post.cta.url}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
              <SocialLinksInline />
              <LatestPostsSidebar currentSlug={post.slug} />
            </aside>
          </div>
        </article>

        {/* FAQs first */}
        {Array.isArray(post.faqs) && post.faqs.length > 0 && (
          <div className="my-10 ">
            <h3 className="font-heading text-2xl font-semibold mb-4">
              Preguntas resumidas
            </h3>
            <div className="space-y-3">
              {post.faqs.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-lg border bg-transparent px-4 py-3"
                >
                  <summary className="list-none cursor-pointer flex items-center justify-between gap-3">
                    <span className="font-body text-lg md:text-lg font-semibold">
                      {f.question}
                    </span>
                    <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="mt-2 text-md md:text-md text-muted-foreground leading-relaxed">
                    {f.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
        {/* Author card */}
        <div className="mt-10">
          {(() => {
            const authorInfo = {
              name: authorName || post.author || 'Equipo Busy',
              avatar: post.authorAvatar || '/busy-gothic.png',
              instagram: social.instagram,
              x: social.x,
              linkedin: social.linkedin,
              medium: social.medium,
              bio: social.bio,
            }
            return <AuthorCard author={authorInfo} />
          })()}
        </div>

        {/* Minimal navigation links above newsletter */}
        <div className="my-8 flex justify-between items-end">
          <div>
            {prevPost && (
              <>
                <div className="text-xs text-muted-foreground mb-1">
                  Artículo previo
                </div>
                <Link
                  href={`/blog/${prevPost.slug}`}
                  prefetch={false}
                  className="font-body font-medium text-accent-brand underline underline-offset-4 hover:text-foreground"
                >
                  {prevPost.title}
                </Link>
              </>
            )}
          </div>
          <div className="text-right">
            {nextPost && (
              <>
                <div className="text-xs text-muted-foreground mb-1">
                  Artículo siguiente
                </div>
                <Link
                  href={`/blog/${nextPost.slug}`}
                  prefetch={false}
                  className="font-body font-medium text-accent-brand underline underline-offset-4 hover:text-foreground"
                >
                  {nextPost.title}
                </Link>
              </>
            )}
          </div>
        </div>

        <Separator className="my-12" />
        <NewsletterSignup />

        {/* Backlinks / Related (enhanced) */}
        {Array.isArray(post.backlinks) && post.backlinks.length > 0 && (
          <div className="mb-12">
            <h3 className="font-heading text-2xl font-semibold mb-4">
              Relacionados
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {post.backlinks.map((b, i) => {
                const isInternal = b.url?.startsWith('/blog/')
                let enriched: BlogPost | null = null
                if (isInternal) {
                  const slug = (b.url || '')
                    .replace(/^\/?blog\//, '')
                    .split(/[?#]/)[0]
                  enriched = allPosts.find((p) => p.slug === slug) || null
                }
                if (enriched) {
                  return (
                    <Link
                      key={i}
                      href={b.url}
                      className="group text-white rounded-lg border bg-muted/20 p-3 flex gap-3 items-center hover:border-accent-brand transition-colors"
                    >
                      {enriched.cover ? (
                        <Image
                          src={enriched.cover}
                          alt={enriched.title}
                          width={96}
                          height={64}
                          className="h-16 w-24 object-cover rounded border"
                        />
                      ) : (
                        <div className="h-16 w-24 rounded border bg-muted" />
                      )}
                      <div className="min-w-0">
                        <div className="font-body font-medium text-white group-hover:text-accent-brand line-clamp-2">
                          {enriched.title}
                        </div>
                        {enriched.excerpt && (
                          <div className="text-xs text-white line-clamp-2 mt-1">
                            {enriched.excerpt}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                }
                return (
                  <Link
                    key={i}
                    href={b.url}
                    className="text-white rounded-lg border bg-muted/20 p-3 flex items-center justify-between hover:border-accent-brand transition-colors"
                  >
                    <span className="font-body text-sm text-accent-brand truncate mr-3">
                      {b.label || b.url}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Newsletter, rating and comments at the very bottom */}
        <div className="mt-16 space-y-10">
          <RatingStars />
          <CommentsForm />
        </div>
      </div>
    </div>
  )
}
