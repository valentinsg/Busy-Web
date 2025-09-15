import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"

export default function SocialLinksInline() {
  const TIKTOK_ICON = "https://cdn-icons-png.flaticon.com/512/3046/3046120.png"
  const PINTEREST_ICON = "https://cdn-icons-png.flaticon.com/512/2175/2175205.png"

  return (
    <div className="flex items-center justify-center gap-6 text-white">
      <Link href="https://instagram.com" prefetch={false} target="_blank" aria-label="Instagram" className="opacity-80 hover:opacity-100 transition">
        <Instagram className="h-7 w-7" aria-hidden />
      </Link>
      <Link href="https://tiktok.com" prefetch={false} target="_blank" aria-label="TikTok" className="opacity-80 hover:opacity-100 transition">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={TIKTOK_ICON} alt="TikTok" className="h-7 w-7 object-contain filter invert brightness-0" />
      </Link>
      <Link href="https://facebook.com" prefetch={false} target="_blank" aria-label="Facebook" className="opacity-80 hover:opacity-100 transition">
        <Facebook className="h-7 w-7" aria-hidden />
      </Link>
      <Link href="https://pinterest.com" prefetch={false} target="_blank" aria-label="Pinterest" className="opacity-80 hover:opacity-100 transition">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PINTEREST_ICON} alt="Pinterest" className="h-7 w-7 object-contain filter invert brightness-0" />
      </Link>
    </div>
  )
}
