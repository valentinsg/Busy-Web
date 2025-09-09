import Image from "next/image"

export function Logo() {
  return (
    <div className="relative w-24 h-24">
      <Image src="/logo-busy-white.png" alt="Busy Logo" fill className="object-contain" />
    </div>
  )
}
