"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface NewsletterSignupProps {
  size?: 'default' | 'large'
}

export default function NewsletterSignup({ size = 'default' }: NewsletterSignupProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "exists" | "error">("idle")
  const [message, setMessage] = useState<string>("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setMessage("")
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Handle conflict or custom error text from backend
        const msg = (data?.error || "").toString().toLowerCase()
        if (res.status === 409 || msg.includes("already") || msg.includes("suscrip")) {
          setStatus("exists")
          setMessage("Ya estás suscripto/a con ese email.")
        } else {
          throw new Error(data?.error || "Error")
        }
        return
      }
      setStatus("done")
      setMessage("¡Gracias por suscribirte!")
      setEmail("")
    } catch (e: unknown) {
      setStatus("error")
      setMessage(e?.toString() || "Error al suscribirte")
    }
  }

  const isLarge = size === 'large'

  return (
    <div className={`rounded-lg border bg-transparent ${
      isLarge ? 'p-8 md:p-12 my-12' : 'p-4 md:p-5 my-10'
    }`}>
      <h3 className={`font-heading font-semibold mb-1 ${
        isLarge ? 'text-2xl md:text-3xl mb-3' : 'text-lg'
      }`}>
        Suscribite a nuestra newsletter y enterate de las últimas novedades sobre Busy
      </h3>
      <form onSubmit={onSubmit} className={`grid gap-3 sm:grid-cols-[1fr,auto] w-full ${
        isLarge ? 'mt-6' : 'mt-4'
      }`}>
        <Input
          required
          type="email"
          placeholder="Tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`font-body ${
            isLarge ? 'h-14 text-lg' : ''
          }`}
          disabled={status === "loading" || status === "done" || status === "exists"}
        />
        <Button 
          disabled={status === "loading" || status === "done"} 
          className="font-body w-full sm:w-auto"
          size={isLarge ? 'lg' : 'default'}
        >
          {status === "loading" ? "Enviando…" : status === "done" ? "¡Listo!" : "Suscribirme"}
        </Button>
      </form>
      {message && (
        <p
          className={`mt-3 ${
            isLarge ? 'text-base' : 'text-sm'
          } ${
            status === "error" ? "text-red-500" : status === "exists" ? "text-yellow-500" : "text-muted-foreground"
          }`}
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  )
}
