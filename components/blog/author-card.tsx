'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Instagram, Twitter, Linkedin, Badge } from 'lucide-react'

export interface AuthorInfo {
  name: string
  avatar?: string
  instagram?: string
  bio?: string
  x?: string
  linkedin?: string
  medium?: string
}

export default function AuthorCard({ author }: { author: AuthorInfo }) {
  const initials = author.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="rounded-xl border bg-muted/20 backdrop-blur-sm">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 ring-accent-brand/20">
            <AvatarImage src={author.avatar || ''} alt={author.name} />
            <AvatarFallback className="bg-accent-brand/10 text-accent-brand font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-heading text-lg sm:text-xl font-bold mb-1">
              {author.name}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {author.x && (
                <a
                  href={author.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className="text-muted-foreground hover:text-accent-brand transition-colors"
                >
                  <Twitter className="h-4 w-4" aria-hidden />
                </a>
              )}
              {author.instagram && (
                <a
                  href={author.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-muted-foreground hover:text-accent-brand transition-colors"
                >
                  <Instagram className="h-4 w-4" aria-hidden />
                </a>
              )}
              {author.linkedin && (
                <a
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-muted-foreground hover:text-accent-brand transition-colors"
                >
                  <Linkedin className="h-4 w-4" aria-hidden />
                </a>
              )}
              {author.medium && (
                <a
                  href={author.medium}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Medium"
                  className="text-muted-foreground hover:text-accent-brand transition-colors"
                >
                  <Badge className="h-4 w-4" aria-hidden />
                </a>
              )}
            </div>
          </div>
        </div>
        {author.bio && (
          <p className="text-sm sm:text-base text-muted-foreground font-body leading-relaxed">
            {author.bio}
          </p>
        )}
      </div>
    </div>
  )
}
