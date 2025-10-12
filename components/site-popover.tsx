"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { X, Copy, Check } from "lucide-react"
import Image from "next/image"
import { AnimatedPopover } from "@/motion/components/AnimatedPopover"
import { Confetti } from "@/motion/components/Confetti"

export default function SitePopover({ section }: { section?: string }) {
  const pathname = usePathname()
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<null | {
    id: string
    title: string
    body?: string | null
    discount_code?: string | null
    image_url?: string | null
    type?: string
    require_email?: boolean
    show_newsletter?: boolean
    cta_text?: string | null
    cta_url?: string | null
    delay_seconds?: number
  }>(null)
  const [dismissed, setDismissed] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [emailSubmitted, setEmailSubmitted] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitMessage, setSubmitMessage] = React.useState("")
  const [showConfetti, setShowConfetti] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    
    const run = async () => {
      try {
        const res = await fetch(`/api/popovers/active?path=${encodeURIComponent(pathname)}${section ? `&section=${encodeURIComponent(section)}` : ""}`)
        
        if (cancelled) return
        
        const json = await res.json()
        const p = json?.popover
        
        if (p && !cancelled) {
          const lsKey = `dismiss_popover_${p.id}`
          const already = typeof window !== "undefined" ? localStorage.getItem(lsKey) : null
          
          if (!already) {
            const delayMs = (p.delay_seconds || 0) * 1000
            setData({ 
              id: p.id, 
              title: p.title, 
              body: p.body, 
              discount_code: p.discount_code, 
              image_url: p.image_url,
              type: p.type || 'simple',
              require_email: p.require_email || false,
              show_newsletter: p.show_newsletter || false,
              cta_text: p.cta_text,
              cta_url: p.cta_url,
              delay_seconds: p.delay_seconds || 0
            })
            // Trigger animation after configured delay
            setTimeout(() => {
              if (!cancelled) setIsVisible(true)
            }, delayMs + 100)
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          console.error("Error loading popover:", e)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    run()
    
    return () => {
      cancelled = true
    }
  }, [pathname, section])

  if (loading || !data || dismissed) return null

  const onDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      setDismissed(true)
      try {
        localStorage.setItem(`dismiss_popover_${data.id}`, "1")
      } catch {}
    }, 300)
  }

  const onCopy = async () => {
    if (!data.discount_code) return
    try {
      await navigator.clipboard.writeText(data.discount_code)
      setCopied(true)
      setShowConfetti(true)
      setTimeout(() => {
        setCopied(false)
        setShowConfetti(false)
      }, 3000)
    } catch {}
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    
    setSubmitting(true)
    setSubmitMessage("")
    
    try {
      // Submit to newsletter API
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: `popover-${data.id}` })
      })
      
      const json = await res.json()
      
      if (res.ok) {
        setEmailSubmitted(true)
        setSubmitMessage(data.show_newsletter ? "¡Gracias por suscribirte!" : "¡Código desbloqueado!")
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      } else {
        setSubmitMessage(json?.error || "Error al procesar")
      }
    } catch {
      setSubmitMessage("Error de conexión")
    } finally {
      setSubmitting(false)
    }
  }

  const showDiscountCode = data.discount_code && (!data.require_email || emailSubmitted)
  const needsEmail = (data.require_email || data.show_newsletter) && !emailSubmitted

  return (
    <>
      <Confetti active={showConfetti} />
      
      <AnimatedPopover isVisible={isVisible} onClose={onDismiss}>
        <div className="relative bg-background rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
          {/* Gradient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
          
          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-accent transition-all duration-200 hover:scale-110 shadow-lg"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Image section - Más alto */}
          {data.image_url && (
            <div className="relative w-full h-80 md:h-96 bg-gradient-to-br from-muted/50 to-muted">
              <Image
                src={data.image_url}
                alt={data.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 95vw, 672px"
                priority
              />
              {/* Logo Busy en la esquina */}
              <div className="absolute bottom-4 right-4 opacity-90">
                <Image
                  src="/logo-busy-white.png"
                  alt="Busy"
                  width={60}
                  height={60}
                  className="drop-shadow-lg"
                />
              </div>
            </div>
          )}

          {/* Content section */}
          <div className="relative p-6 md:p-8 space-y-5">
            <div className="space-y-3">
              <h3 className="font-body text-2xl md:text-3xl font-bold tracking-tight pr-8">
                {data.title}
              </h3>
              {data.body && (
                <p className="font-body text-base text-muted-foreground leading-relaxed">
                  {data.body}
                </p>
              )}
            </div>

            {/* Email form section (email-gate or newsletter) */}
            {needsEmail && (
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="popover-email" className="font-body text-sm font-medium">
                    {data.show_newsletter 
                      ? "Suscríbete a nuestro newsletter" 
                      : "Ingresa tu email para desbloquear el código"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="popover-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      disabled={submitting}
                      className="font-body flex-1 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !email.trim()}
                      className="font-body px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "..." : data.show_newsletter ? "Suscribirme" : "Desbloquear"}
                    </button>
                  </div>
                  {submitMessage && (
                    <p className={`font-body text-sm ${emailSubmitted ? 'text-green-600' : 'text-red-600'}`}>
                      {submitMessage}
                    </p>
                  )}
                </div>
              </form>
            )}

            {/* Discount code section - solo si no requiere email o ya lo envió */}
            {showDiscountCode && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                  <code className="flex-1 font-body text-base md:text-lg font-semibold tracking-wider text-primary">
                    {data.discount_code}
                  </code>
                  <button
                    onClick={onCopy}
                    className="font-body flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* CTA Button */}
            {data.cta_url && data.cta_text && (
              <div className="pt-2">
                <a
                  href={data.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body block w-full text-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  onClick={onDismiss}
                >
                  {data.cta_text}
                </a>
              </div>
            )}
          </div>

          {/* Bottom accent line */}
          <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-primary" />
        </div>
      </AnimatedPopover>
    </>
  )
}
