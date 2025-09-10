export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  content: string
  readingTime: string
  cover?: string
  author?: string
}
