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
    <div className="rounded-lg border bg-transparent">
      <div className="p-5 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={author.avatar || ''} alt={author.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-4">
            <div className="font-heading text-xl font-semibold leading-tight text-accent-brand">
              {author.name}
            </div>
            <div className="flex items-center gap-4">
              {author.x && (
                <a
                  href={author.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className="opacity-80 hover:opacity-100 transition"
                >
                  <Twitter className="h-5 w-5" aria-hidden />
                </a>
              )}
              {author.linkedin && (
                <a
                  href={author.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="opacity-80 hover:opacity-100 transition"
                >
                  <Linkedin className="h-5 w-5" aria-hidden />
                </a>
              )}
              {author.medium && (
                <a
                  href={author.medium}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Medium"
                  className="opacity-80 hover:opacity-100 transition"
                >
                  <Badge className="h-5 w-5" aria-hidden />
                </a>
              )}
              {author.instagram && (
                <a
                  href={author.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="opacity-80 hover:opacity-100 transition"
                >
                  <Instagram className="h-5 w-5" aria-hidden />
                </a>
              )}
            </div>
          </div>
          {author.bio && (
            <p className="mt-2 text-[15px] md:text-base text-muted-foreground font-body leading-relaxed">
              {author.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
