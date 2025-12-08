"use client"

import { useChristmas } from "@/components/providers/christmas-provider"
import { BusyLogo } from "@/components/shared/busy-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Gift, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ChristmasLights } from "./christmas-lights"

/**
 * Christmas promotional section for the home page
 * Displays festive messaging and links to products with discounts
 */
export function ChristmasPromoSection() {
  const { isChristmasMode } = useChristmas()
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubscribe = async () => {
    if (!email) return
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || "Error")
      setEmail("")
      setMessage(json.already ? "¡Ya estás suscripto!" : "¡Gracias por suscribirte! 🎄")
    } catch {
      setMessage("No se pudo suscribir")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isChristmasMode) return null

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Christmas tree pattern background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          ["--s" as string]: "80px",
          ["--_c" as string]: "#0000, rgba(255,255,255,0.5) 1deg 79deg, #0000 81deg",
          ["--g0" as string]: "conic-gradient(from 140deg at 50% 87.5%, var(--_c))",
          ["--g1" as string]: "conic-gradient(from 140deg at 50% 81.25%, var(--_c))",
          ["--g2" as string]: "conic-gradient(from 140deg at 50% 75%, var(--_c))",
          ["--g3" as string]: "conic-gradient(at 10% 20%, #0000 75%, rgba(255,255,255,0.4) 0)",
          background: `
            var(--g0) 0 calc(var(--s) / -4),
            var(--g0) var(--s) calc(3 * var(--s) / 4),
            var(--g1),
            var(--g1) var(--s) var(--s),
            var(--g2) 0 calc(var(--s) / 4),
            var(--g2) var(--s) calc(5 * var(--s) / 4),
            var(--g3) calc(var(--s) / -10) var(--s),
            var(--g3) calc(9 * var(--s) / 10) calc(2 * var(--s)),
            repeating-conic-gradient(from 45deg, #0a2e0a 0 25%, #143d14 0 50%)
          `,
          backgroundSize: "calc(2 * var(--s)) calc(2 * var(--s))",
          opacity: 0.25,
        }}
      />

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/80 pointer-events-none" />

      {/* Christmas lights at top */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <ChristmasLights />
      </div>


      <div className="container relative z-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo with Christmas hat */}
          <div className="flex justify-center mb-6">
            <BusyLogo variant="white" width={100} height={100} />
          </div>

          {/* Festive title with cursive style */}
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            <span className="block text-white/90">En Busy</span>
            <span
              className="block bg-gradient-to-r from-red-400 via-green-400 to-red-400 bg-clip-text text-transparent"
              style={{ fontStyle: "italic" }}
            >
              celebramos la Navidad
            </span>
          </h2>

          {/* Description */}
          <p
            className="font-body text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
            style={{ fontStyle: "italic" }}
          >
            Descuentos especiales en toda la tienda. Encontrá el regalo perfecto para vos o para alguien especial.
            <br />
            <span className="text-green-400">Felices fiestas</span> de parte de todo el equipo Busy.
          </p>

          {/* Decorative ribbon/gift icon - floating animation */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 md:w-40 md:h-40 animate-float">
              <Image
                src="/regalito-liston-navidad.png"
                alt="Regalo navideño"
                fill
                className="object-contain drop-shadow-lg"
              />
            </div>
          </div>
          <style jsx>{`
            @keyframes float {
              0%, 100% {
                transform: translateY(0) rotate(-3deg);
              }
              50% {
                transform: translateY(-12px) rotate(3deg);
              }
            }
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
          `}</style>

          {/* CTA Button */}
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-heading font-semibold px-8 py-6 text-lg shadow-lg shadow-red-900/30 group"
          >
            <Link href="/products">
              <Gift className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              Ver ofertas navideñas
            </Link>
          </Button>

          {/* Newsletter subscription */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="font-body text-sm text-muted-foreground mb-4">
              Suscribite para recibir ofertas exclusivas y novedades
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <div className="relative w-full sm:w-auto sm:flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu email"
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-green-500 font-body"
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                />
              </div>
              <Button
                onClick={handleSubscribe}
                disabled={submitting || !email}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-body"
              >
                {submitting ? "..." : "Suscribirme"}
              </Button>
            </div>
            {message && (
              <p className={`font-body text-sm mt-3 ${message.includes("Gracias") || message.includes("Ya") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
