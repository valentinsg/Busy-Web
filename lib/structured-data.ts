/**
 * Helpers para generar Structured Data (Schema.org) para SEO
 */

const SITE_URL = process.env.SITE_URL || 'https://busy.com.ar'

interface BreadcrumbItem {
  name: string
  url: string
}

/**
 * Genera BreadcrumbList Schema.org
 * @param items - Array de items del breadcrumb (sin incluir Home, se agrega automáticamente)
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Inicio',
      item: SITE_URL,
    },
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: item.name,
      item: item.url,
    })),
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }
}

/**
 * Genera Product Schema.org para páginas de producto
 */
export function generateProductSchema(product: {
  name: string
  description: string
  image: string
  price: number
  currency: string
  sku: string
  brand?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Busy Streetwear',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      url: `${SITE_URL}/product/${product.sku}`,
    },
  }
}

/**
 * Genera Article Schema.org para posts de blog
 */
export function generateArticleSchema(article: {
  title: string
  description: string
  image?: string
  datePublished: string
  dateModified?: string
  author?: string
  slug: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image || `${SITE_URL}/busy-streetwear.png`,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.author || 'Busy Streetwear',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Busy Streetwear',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-busy-black.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${article.slug}`,
    },
  }
}

/**
 * Genera FAQPage Schema.org
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Genera CollectionPage Schema.org para categorías de productos
 */
export function generateCollectionSchema(collection: {
  name: string
  description: string
  url: string
  numberOfItems?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description,
    url: collection.url,
    ...(collection.numberOfItems && {
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: collection.numberOfItems,
      },
    }),
  }
}
