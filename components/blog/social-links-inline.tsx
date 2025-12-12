import { Facebook, Instagram } from "lucide-react"
import Link from "next/link"

export default function SocialLinksInline() {
  const TIKTOK_ICON = "https://cdn-icons-png.flaticon.com/512/3046/3046120.png"
  const PINTEREST_ICON = "https://cdn-icons-png.flaticon.com/512/2175/2175205.png"

  return (
    <div className="flex items-center justify-center gap-6 text-white">
      <Link href="https://instagram.com/busy_streetwear" prefetch={false} target="_blank" aria-label="Instagram" className="opacity-80 hover:opacity-100 transition">
        <Instagram className="h-7 w-7" aria-hidden />
      </Link>
      <Link href="https://tiktok.com/@busy_streetwear" prefetch={false} target="_blank" aria-label="TikTok" className="opacity-80 hover:opacity-100 transition">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={TIKTOK_ICON} alt="TikTok" className="h-7 w-7 object-contain filter invert brightness-0" />
      </Link>
      <Link href="https://www.facebook.com/profile.php?id=61581696441351" prefetch={false} target="_blank" aria-label="Facebook" className="opacity-80 hover:opacity-100 transition">
        <Facebook className="h-7 w-7" aria-hidden />
      </Link>
      <Link href="https://pinterest.com" prefetch={false} target="_blank" aria-label="Pinterest" className="opacity-80 hover:opacity-100 transition">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PINTEREST_ICON} alt="Pinterest" className="h-7 w-7 object-contain filter invert brightness-0" />
      </Link>
      <Link href={process.env.NEXT_PUBLIC_SPOTIFY_PROFILE_URL || 'https://open.spotify.com/user/agustinmancho'} prefetch={false} target="_blank" aria-label="Spotify" className="opacity-80 hover:opacity-100 transition">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      </Link>
    </div>
  )
}
