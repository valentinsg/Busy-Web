import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { getPostBySlug, getAllPosts } from "@/lib/blog"
import { format } from "date-fns"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return {
    title: `${post.title} - Busy Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
    },
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const allPosts = getAllPosts()
  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug)
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null

  return (
    <div className="container px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        {/* Article Header */}
        <article>
          <header className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-balance">{post.title}</h1>

            <p className="text-lg text-muted-foreground mb-6 text-pretty">{post.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.date), "MMMM dd, yyyy")}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {post.readingTime}
                </div>
              </div>

              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </header>

          <Separator className="mb-8" />

          {/* Article Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-a:text-accent-brand prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-accent-brand prose-blockquote:bg-muted prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
            <MDXRemote
              source={post.content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                },
              }}
            />
          </div>
        </article>

        <Separator className="my-12" />

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prevPost && (
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-2">Previous Article</div>
                <Link href={`/blog/${prevPost.slug}`} className="group">
                  <h3 className="font-medium group-hover:text-accent-brand transition-colors line-clamp-2">
                    {prevPost.title}
                  </h3>
                </Link>
              </CardContent>
            </Card>
          )}

          {nextPost && (
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground mb-2">Next Article</div>
                <Link href={`/blog/${nextPost.slug}`} className="group">
                  <h3 className="font-medium group-hover:text-accent-brand transition-colors line-clamp-2">
                    {nextPost.title}
                  </h3>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card>
            <CardContent className="p-8">
              <h3 className="font-heading text-2xl font-bold mb-4">Ready to Elevate Your Style?</h3>
              <p className="text-muted-foreground mb-6">
                Discover our latest collection of premium streetwear designed for the modern lifestyle.
              </p>
              <Button asChild size="lg">
                <Link href="/products">Shop Collection</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
