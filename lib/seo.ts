import type { Metadata } from "next"

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: "website" | "article"
}

export function generateSEO({
  title = "Busy - Premium Streetwear",
  description = "Premium streetwear for the modern lifestyle. Quality craftsmanship meets contemporary design.",
  image = "/busy-streetwear.png",
  url = process.env.SITE_URL || "https://busy.com.ar",
  type = "website",
}: SEOProps = {}): Metadata {
  const ogType: "website" | "article" = type === "article" ? "article" : "website"
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, alt: title }],
      url,
      type: ogType,
      siteName: "Busy",
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
    },
    alternates: {
      canonical: url,
    },
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
    title: `${product.name} - Busy`,
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
    title: `${post.title} - Busy Blog`,
    description: post.description,
    image: post.cover,
    type: "article",
  })
}
