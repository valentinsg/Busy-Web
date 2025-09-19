import { getAllPosts, getAllTags } from "@/lib/blog"
import BlogClient from "@/components/blog/blog-client"
import type { Metadata } from "next"
import { generateSEO } from "@/lib/seo"

export const metadata: Metadata = generateSEO({
  title: "Blog",
  description: "Consejos de estilo, sostenibilidad y novedades de Busy.",
  url: `${process.env.SITE_URL || "https://busy.com.ar"}/blog`,
  image: "/busy-streetwear.png",
  type: "website",
})

export default async function BlogPage() {
  const allPosts = getAllPosts()
  const allTags = getAllTags()
  const latestPost = allPosts[0]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Blog de Busy",
            url: `${process.env.SITE_URL || "https://busy.com.ar"}/blog`,
            inLanguage: "es-AR",
            description: "Consejos de estilo, sostenibilidad y novedades de Busy.",
          }),
        }}
      />
      <BlogClient allPosts={allPosts} allTags={allTags} latestPost={latestPost} />
    </>
  )
}
