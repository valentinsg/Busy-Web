import type { Metadata } from "next"

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: "website" | "article" | "product"
}

export function generateSEO({
  title = "Busy - Premium Streetwear",
  description = "Premium streetwear for the modern lifestyle. Quality craftsmanship meets contemporary design.",
  image = "/og-image.jpg",
  url = "https://busy.com",
  type = "website",
}: SEOProps = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, alt: title }],
      url,
      type,
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
    type: "product",
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
