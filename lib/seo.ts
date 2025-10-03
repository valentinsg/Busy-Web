import type { Metadata } from "next"

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: "website" | "article"
}

export function generateSEO({
  title = "Busy Streetwear",
  description = 'Somos Busy Streetwear, la marca que representa a los que hacen. Únite a nuestra comunidad que ofrece ropa streetwear de moda, contenido relacionado a la cultura urbana, playlists, eventos exclusivos y más.',
  image = "/busy-streetwear.png",
  url = process.env.SITE_URL || "https://busy.com.ar",
  type = "website",
}: SEOProps = {}): Metadata {
  const ogType: "website" | "article" = type === "article" ? "article" : "website"
  return {
    title,
    description,
    keywords: [
      "Busy",
      "Streetwear",
      "Ropa urbana",
      "Moda",
      "Streetwear",
      "Hoodies",
      "Básicos",
      "Remeras",
      "Pantalones",
      "Argentina",
      "Indumentaria",
    ],
    openGraph: {
      title,
      description,
      images: [{ url: image, alt: title }],
      url,
      type: ogType,
      siteName: "Busy Streetwear",
      locale: "es_AR",
      alternateLocale: ["en_US"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    // Note: do NOT set a default canonical globally; set it per page via generateMetadata when needed.
  }
}

export function generateProductSEO(product: {
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  sku: string
}) {
  return generateSEO({
    title: `${product.name} - Busy Streetwear`,
    description: product.description,
    image: product.images[0],
    type: "website",
  })
}

export function generateBlogSEO(post: {
  title: string
  description: string
  cover?: string
  date: string
}) {
  return generateSEO({
    title: `${post.title} - Blog de Busy`,
    description: post.description,
    image: post.cover,
    type: "article",
  })
}
