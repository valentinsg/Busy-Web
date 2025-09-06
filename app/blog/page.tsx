import { getAllPosts, getAllTags } from "@/lib/blog"
import BlogClient from "@/components/blog/blog-client"

export default async function BlogPage() {
  const allPosts = getAllPosts()
  const allTags = getAllTags()

  return <BlogClient allPosts={allPosts} allTags={allTags} />
}
