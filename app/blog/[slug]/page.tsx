import AuthorCard from '@/components/blog/author-card'
import LatestPlaylistsSidebar from '@/components/blog/latest-playlists-sidebar'
import LatestPostsSidebar from '@/components/blog/latest-posts-sidebar'
import SocialLinksInline from '@/components/blog/social-links-inline'
import MdxRenderer from '@/components/mdx/MdxRenderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getAllPostsAsync, getPostBySlugAsync } from '@/lib/blog'
import getServiceClient from '@/lib/supabase/server'
import type { Author } from '@/types'
import type { BlogPost } from '@/types/blog'
import { format } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import {
    ArrowUpRight,
    Calendar,
    ChevronDown,
    Clock,
} from 'lucide-react'
import type { Metadata } from 'next'
import NextDynamic from 'next/dynamic'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Client helpers
const CopyLinkButton = NextDynamic(
  () => import('@/components/blog/copy-link-button'),
  { ssr: false }
)

const ShareButton = NextDynamic(
  () => import('@/components/blog/share-button'),
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

export const revalidate = 3600 // Revalidar cada hora
export const dynamic = 'force-static' // Generar estáticamente en build

// Pre-generar TODOS los posts en build (blog pequeño)
export async function generateStaticParams() {
  const posts = await getAllPostsAsync()
  console.log('[BUILD] generateStaticParams - Posts encontrados:', posts.length)
  console.log('[BUILD] Slugs:', posts.map(p => p.slug).join(', '))
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

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
    title: post.title,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      type: 'article',
      publishedTime: post.date,
      authors: [post.authorName || 'Busy'],
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [image],
    },
    alternates: {
      canonical,
      languages: {
        'es-AR': canonical,
      },
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

  const localeCookie = cookies().get('busy_locale')?.value
  const dfnsLocale = localeCookie === 'es' ? es : enUS
  const authorName = post.authorName || post.author || ''

  // Enrich author social links from Supabase (authors table)
  const supabase = getServiceClient()
  const social: { instagram?: string; x?: string; linkedin?: string; medium?: string; bio?: string } = {}
  try {
    if (authorName) {
      const { data } = await supabase
        .from('authors')
        .select('instagram, linkedin, medium, twitter, bio, name')
        .ilike('name', authorName)
        .maybeSingle()
      if (data) {
        social.instagram = (data as unknown as Author).instagram || undefined
        social.linkedin = (data as unknown as Author).linkedin || undefined
        social.medium = (data as unknown as Author).medium || undefined
        social.x = (data as unknown as Author).twitter || undefined
        social.bio = (data as unknown as Author).bio || undefined
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

  // Additional fallback: try to find by partial name match if still missing data
  if ((!social.instagram || !social.x || !social.linkedin || !social.medium || !social.bio) && authorName) {
    try {
      const { data } = await supabase
        .from('authors')
        .select('instagram, linkedin, medium, twitter, bio')
        .ilike('name', `%${authorName.split(' ')[0]}%`)
        .maybeSingle()
      if (data) {
        social.instagram = social.instagram || (data as unknown as Author).instagram || undefined
        social.x = social.x || (data as unknown as Author).twitter || undefined
        social.linkedin = social.linkedin || (data as unknown as Author).linkedin || undefined
        social.medium = social.medium || (data as unknown as Author).medium || undefined
        social.bio = social.bio || (data as unknown as Author).bio || undefined
      }
    } catch {}
  }

  // Final fallback bio for Valentín if still missing
  if (!social.bio && authorName.toLowerCase().includes('valent')) {
    social.bio = 'Co-Founder, Director Técnico y Creativo de Busy, desarrollador de software y creador de la identidad de la marca.'
  }

  // Normalize CRLF to LF only; remark-breaks will handle single newlines as <br>
  const preparedContent = (post.content || '').replace(/\r\n/g, '\n')

  const base = process.env.SITE_URL || 'https://busy.com.ar'
  const postUrl = `${base}/blog/${post.slug}`

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: base,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${base}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  }

  // FAQ schema (condicional)
  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null

  // Article schema completo
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    image: [post.ogImage || post.cover || `${base}/busy-streetwear.png`],
    keywords: post.tags?.join(', '),
    author: post.authorName || post.author
      ? { '@type': 'Person', name: post.authorName || post.author }
      : { '@type': 'Organization', name: 'Busy' },
    publisher: {
      '@type': 'Organization',
      name: 'Busy Streetwear',
      url: base,
      logo: {
        '@type': 'ImageObject',
        url: `${base}/logo-busy-black.png`,
      },
      sameAs: [
        'https://instagram.com/busy_streetwear',
        'https://www.facebook.com/profile.php?id=61581696441351',
        'https://www.tiktok.com/@busy_streetwear',
      ],
    },
  }

  // JSON-LD consolidado con @graph
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [articleSchema, breadcrumbSchema, faqSchema].filter(Boolean),
  }

  return (
    <div className="container py-6 sm:py-8 pt-24 sm:pt-28 tracking-wide font-body backdrop-blur-sm px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
        {/* JSON-LD consolidado (Article + Breadcrumb + FAQ) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Article Header */}
        <article>
          <header className="mb-5 sm:mb-6">
            {/* Hero image con priority para LCP */}
            {post.cover && (
              <Image
                src={post.cover}
                alt={post.coverAlt || post.title}
                width={1200}
                height={630}
                priority={true}
                className="w-full h-auto rounded-lg mb-6"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            )}

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 text-balance">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-3 sm:mb-4 text-pretty font-body">
              {post.description || post.excerpt}
            </p>

            <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
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
                <ShareButton title={post.title} text={post.description} />
              </div>
            </div>
          </header>

          <Separator className="mb-6 bg-muted h-[2px]" />

          {/* Body with sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-6">
            <div>
              {/* Article Content */}
              <div
                id="post-content"
                className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-body prose-h1:font-heading prose-p:font-body prose-li:font-body md:prose-xl prose-p:text-[16px] sm:prose-p:text-[18px] md:prose-p:text-[20px] prose-h1:text-4xl sm:prose-h1:text-5xl prose-h2:text-2xl sm:prose-h2:text-3xl md:prose-h2:text-4xl prose-h3:text-xl sm:prose-h3:text-2xl prose-p:leading-relaxed prose-p:my-4 sm:prose-p:my-5 prose-li:my-2 prose-a:text-accent-brand prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:mx-auto prose-img:w-full prose-img:max-h-[320px] sm:prose-img:max-h-[420px] prose-img:object-cover prose-blockquote:border-l-accent-brand prose-blockquote:bg-muted prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-th:border prose-td:border prose-table:border prose-table:rounded-md whitespace-normal break-words"
              >
                <MdxRenderer source={preparedContent} />
              </div>
            </div>
            <aside className="space-y-10 lg:top-18 h-fit w-full">
              <TableOfContents targetSelector="#post-content" />
              {/* CTA personalizada al final después de relacionados */}
              {post.cta?.url && (post.cta.text || post.cta.url) && (
                <div className="my-8 text-center ">
                  <Card>
                    <CardContent className="p-4 sm:p-4 bg-muted/20">
                      <h3 className="font-body text-lg font-bold mb-2">
                        {post.cta.text || 'Descubrí más'}
                      </h3>
                      <Button
                        asChild
                        size="sm"
                        className="relative z-10"
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
              <LatestPlaylistsSidebar />
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
        <div className="my-8 grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            {prevPost && (
              <>
                <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                  Previo
                </div>
                <Link
                  href={`/blog/${prevPost.slug}`}
                  prefetch={false}
                  className="font-body font-medium text-accent-brand underline underline-offset-4 hover:text-foreground line-clamp-1 text-xs sm:text-sm"
                >
                  {prevPost.title}
                </Link>
              </>
            )}
          </div>
          <div className="text-right">
            {nextPost && (
              <>
                <div className="text-[10px] sm:text-xs text-muted-foreground mb-1">
                  Siguiente
                </div>
                <Link
                  href={`/blog/${nextPost.slug}`}
                  prefetch={false}
                  className="font-body font-medium text-accent-brand underline underline-offset-4 hover:text-foreground line-clamp-1 text-xs sm:text-sm"
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
