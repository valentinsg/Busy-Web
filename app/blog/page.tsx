import { getAllPosts, getAllTags } from "@/lib/blog"
import BlogClient from "@/components/blog/blog-client"
import type { Metadata } from "next"
import { generateSEO } from "@/lib/seo"

export const metadata: Metadata = generateSEO({
  title: "Busy Blog",
  description: "Consejos de estilo, sostenibilidad y novedades de Busy.",
  url: `${process.env.SITE_URL || "https://busy.com.ar"}/blog`,
  image: "/busy-streetwear.png",
  type: "website",
})

export default async function BlogPage() {
  const allPosts = getAllPosts()
  const allTags = getAllTags()

  return <BlogClient allPosts={allPosts} allTags={allTags} />
}
