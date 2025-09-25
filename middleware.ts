import { NextResponse, type NextRequest } from 'next/server'

const CANONICAL_HOST = 'busy.com.ar'

export function middleware(req: NextRequest) {
  // Skip middleware logic entirely in development to avoid breaking localhost
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next()
  }

  const url = req.nextUrl.clone()
  const host = req.headers.get('host') || url.host
  const proto = req.headers.get('x-forwarded-proto') || url.protocol.replace(':', '')

  let changed = false

  // Allow localhost/127.0.0.1 just in case
  if (host && (host.startsWith('localhost') || host.startsWith('127.0.0.1'))) {
    return NextResponse.next()
  }

  // Enforce non-www
  if (host && host.toLowerCase().startsWith('www.')) {
    url.host = CANONICAL_HOST
    changed = true
  }

  // Enforce HTTPS
  if (proto !== 'https') {
    url.protocol = 'https:'
    url.host = CANONICAL_HOST
    changed = true
  }

  if (changed) {
    return NextResponse.redirect(url, { status: 301 })
  }

  return NextResponse.next()
}

// Only run middleware for user-facing paths
export const config = {
  matcher: [
    '/((?!_next/|static/|favicon.ico|robots.txt|sitemap.xml|sitemap-.*\\.xml|api/).*)',
  ],
}
