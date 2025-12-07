import { getImageConfig } from "@/lib/imageConfig"
import Image from "next/image"

export function Logo() {
  const config = getImageConfig('logo')
  return (
    <div className="relative w-24 h-24">
      <Image
        src="/logo-busy-white.png"
        alt="Busy Logo"
        width={config.width}
        height={config.height}
        unoptimized
        sizes={config.sizes}
        className="object-contain"
      />
    </div>
  )
}
