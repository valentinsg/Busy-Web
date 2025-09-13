export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  content: string
  readingTime: string
  cover?: string
  /** Legacy author string for backward compatibility */
  author?: string
  /** Preferred structured author fields */
  authorName?: string
  authorAvatar?: string
  canonical?: string
  backlinks?: { label: string; url: string }[]
}
