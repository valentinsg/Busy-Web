import Image from "next/image"

export function Logo() {
  return (
    <div className="relative w-24 h-24">
      <Image src="/logo-busy-black.png" alt="Busy Logo" fill className="object-contain" priority />
    </div>
  )
}
