import BlogClient from '@/components/blog/blog-client'
import { getAllPostsAsync } from '@/lib/blog'
import { getProductsAsync } from '@/lib/repo/products'
import type { Metadata } from 'next'

export function generateMetadata(): Metadata {
  const siteUrlStr = process.env.SITE_URL ?? 'https://busy.com.ar'
  const canonical = `${siteUrlStr}/blog`
  const ogImage = `${siteUrlStr}/busy-streetwear.png`

  return {
    title: 'Blog Busy | Cultura, Cine, Arte y Streetwear',
    description:
      'Artículos sobre cultura urbana, cine, moda y lifestyle. Contenido editorial curado por Busy Streetwear: guías de estilo, tendencias, cuidado de ropa y conversaciones reales. Busy Talks en desarrollo.',
    keywords: [
      'blog cultura urbana',
      'busy talks',
      'streetwear argentina',
      'cultura urbana mar del plata',
      'moda urbana',
      'cine y cultura',
      'arte urbano',
      'lifestyle streetwear',
      'guías de estilo',
      'tendencias streetwear',
      'cuidado de ropa',
      'básquet y cultura',
      'podcast cultura urbana',
      'Busy Streetwear',
    ],

    alternates: {
      canonical,
      languages: {
        'es-AR': canonical,
      },
    },

    openGraph: {
      type: 'website',
      locale: 'es_AR',
      url: canonical,
      siteName: 'Busy Streetwear',
      title: 'Blog Busy | Cultura, Cine, Arte y Streetwear',
      description:
        'Contenido editorial sobre cultura urbana, cine, moda y lifestyle. Artículos curados por Busy Streetwear. Conversaciones reales, sin frases motivacionales vacías.',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Blog Busy - Cultura Urbana y Streetwear',
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: 'Blog de Busy: Streetwear y Moda',
      description: 'Descubrí guías útiles relacionadas con la moda, tendencias del streetwear y contenido relacionado a la cultura urbana. Todos los articulos están curados por Busy.',
      images: [ogImage],
    },

    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export const revalidate = 3600 // Revalidar cada hora

export default async function BlogPage() {
  // Cargar posts y productos en paralelo
  const [allPosts, productsRes] = await Promise.all([
    getAllPostsAsync(),
    getProductsAsync({ featuredOnly: true, sortBy: "newest" }).catch(() => [])
  ])

  const latestPost = allPosts?.[0]
  const featuredProducts = (productsRes || []).slice(0, 3)

  // Para JSON-LD
  const siteUrlStr = process.env.SITE_URL ?? 'https://busy.com.ar'
  const blogUrl = `${siteUrlStr}/blog`

  // ItemList para listados (mejora la comprensión del índice)
  const itemList =
    Array.isArray(allPosts) && allPosts.length
      ? {
          '@type': 'ItemList',
          itemListElement: allPosts.slice(0, 20).map((p: { slug?: string }, i: number) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${siteUrlStr}${
              p?.slug?.startsWith('/') ? p.slug : `/blog/${p?.slug}`
            }`,
          })),
        }
      : undefined

  // Breadcrumbs simples
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: `${siteUrlStr}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: blogUrl,
      },
    ],
  }

  // WebSite con SearchAction (si tenés buscador en el blog)
  const website = {
    '@type': 'WebSite',
    url: siteUrlStr,
    name: 'Busy',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${blogUrl}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  const blog = {
    '@type': 'Blog',
    name: 'Blog de Busy Streetwear',
    url: blogUrl,
    inLanguage: 'es-AR',
    description: 'Guías de estilo, tendencias del streetwear y cultura urbana.',
    publisher: {
      '@type': 'Organization',
      name: 'Busy Streetwear',
      url: siteUrlStr,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrlStr}/logo-busy-black.png`,
      },
      sameAs: [
        'https://instagram.com/busy.streetwear',
        'https://www.facebook.com/profile.php?id=61581696441351',
        'https://www.tiktok.com/@busy.streetwear',
      ],
    },
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [website, blog, breadcrumb, itemList].filter(Boolean),
  }

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD consolidado (WebSite + Blog + Breadcrumb + ItemList)
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogClient allPosts={allPosts} latestPost={latestPost} featuredProducts={featuredProducts} />
    </>
  )
}
