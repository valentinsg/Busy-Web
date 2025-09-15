export interface BlogPost {
  slug: string
  title: string
  description: string
  /** Short excerpt or resumen corto */
  excerpt?: string
  date: string
  tags: string[]
  content: string
  /** Reading time label (can be overridden from frontmatter) */
  readingTime: string
  cover?: string
  /** Alt text for cover image */
  coverAlt?: string
  /** Legacy author string for backward compatibility */
  author?: string
  /** Preferred structured author fields */
  authorName?: string
  authorAvatar?: string
  canonical?: string
  backlinks?: { label: string; url: string }[]
  /** Optional category for the post */
  category?: string
  /** Open Graph/Twitter image */
  ogImage?: string
  /** Frequently Asked Questions */
  faqs?: { question: string; answer: string }[]
  /** Custom Call-To-Action */
  cta?: { text: string; url: string }
  /** Internal SEO target keywords */
  seoKeywords?: string[]
}
