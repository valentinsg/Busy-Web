"use client"

import * as React from "react"
import Link from "next/link"
import { Search, Calendar, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import type { BlogPost } from "@/types/blog"

interface BlogClientProps {
  allPosts: BlogPost[]
  allTags: string[]
}

export default function BlogClient({ allPosts, allTags }: BlogClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null)

  const filteredPosts = React.useMemo(() => {
    let posts = allPosts

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      posts = posts.filter(
        (post: BlogPost) =>
          post.title.toLowerCase().includes(q) ||
          post.description.toLowerCase().includes(q) ||
          post.tags.some((tag: string) => tag.toLowerCase().includes(q)) ||
          post.content.toLowerCase().includes(q),
      )
    }

    if (selectedTag) {
      posts = posts.filter((post) => post.tags.includes(selectedTag))
    }

    return posts
  }, [allPosts, searchQuery, selectedTag])

  const featuredPost = filteredPosts[0] ?? allPosts[0]
  const regularPosts = filteredPosts.length > 0 ? filteredPosts.slice(1) : allPosts.slice(1)

  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Busy Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stories, insights, and inspiration from the world of streetwear and modern lifestyle.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              All Posts
            </Button>
            {allTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {!searchQuery && !selectedTag && featuredPost && (
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-bold mb-6">Featured Article</h2>
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  {featuredPost.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-heading text-2xl font-bold mb-4 line-clamp-2">{featuredPost.title}</h3>
                <p className="text-muted-foreground mb-6 line-clamp-3">{featuredPost.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(featuredPost.date), "MMM dd, yyyy")}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredPost.readingTime}
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/blog/${featuredPost.slug}`}>Read Article</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Posts Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold">
              {searchQuery || selectedTag ? "Search Results" : "Latest Articles"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <h3 className="font-medium mb-2">No articles found</h3>
                <p className="text-sm">Try adjusting your search or browse all posts</p>
              </div>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedTag(null)
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card key={post.slug} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <Link href={`/blog/${post.slug}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="font-heading text-lg font-semibold mb-2 line-clamp-2 group-hover:text-accent-brand transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(post.date), "MMM dd")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime}
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
