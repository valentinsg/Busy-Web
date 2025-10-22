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
  const isInitializedRef = React.useRef(false)

  React.useEffect(() => {
    // Prevenir doble ejecución en StrictMode
    if (isInitializedRef.current) {
      console.log('[Popover] Already initialized, skipping')
      return
    }
    
    if (dismissed) {
      console.log('[Popover] Already dismissed, skipping')
      return
    }
    
    let cancelled = false
    let timeoutId: NodeJS.Timeout | null = null
    
    const run = async () => {
      try {
        console.log('[Popover] Fetching active popover...')
        const res = await fetch(`/api/popovers/active?path=${encodeURIComponent(pathname)}${section ? `&section=${encodeURIComponent(section)}` : ""}`)
        
        if (cancelled) return
        
        const json = await res.json()
        const p = json?.popover
        
        console.log('[Popover] Response:', p)
        
        if (p && !cancelled) {
          const lsKey = `dismiss_popover_${p.id}`
          const already = typeof window !== "undefined" ? localStorage.getItem(lsKey) : null
          
          if (!already) {
            console.log('[Popover] Setting up popover data')
            isInitializedRef.current = true
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
            
            // Trigger visibility immediately for testing
            console.log('[Popover] Making visible in', delayMs, 'ms')
            timeoutId = setTimeout(() => {
              if (!cancelled) {
                console.log('[Popover] NOW VISIBLE')
                setIsVisible(true)
              }
            }, delayMs)
          } else {
            console.log('[Popover] Already dismissed in localStorage')
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          console.error("[Popover] Error loading:", e)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }
    
    run()
    
    return () => {
      console.log('[Popover] Cleanup')
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [pathname, section, dismissed])

  if (loading || dismissed) return null
  if (!data) return null

  const onDismiss = () => {
    console.log('[Popover] User dismissed')
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
        <div className="relative bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-700 overflow-hidden">
          {/* Gradient glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
          
          {/* Close button - más grande en móvil */}
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 md:top-4 md:right-4 z-10 p-2.5 md:p-2 rounded-full bg-zinc-800/90 backdrop-blur-sm border border-zinc-600 hover:bg-zinc-700 transition-all duration-200 hover:scale-110 shadow-lg active:scale-95"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 md:w-4 md:h-4 text-white" />
          </button>

          {/* Image section - Más compacto en móvil */}
          {data.image_url && (
            <div className="relative w-full h-56 sm:h-72 md:h-96 bg-gradient-to-br from-muted/50 to-muted">
              <Image
                src={data.image_url}
                alt={data.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 95vw, 672px"
                priority
              />
              {/* Logo Busy en la esquina - más pequeño en móvil */}
              <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 opacity-90">
                <Image
                  src="/logo-busy-white.png"
                  alt="Busy"
                  width={48}
                  height={48}
                  className="drop-shadow-lg md:w-[60px] md:h-[60px]"
                />
              </div>
            </div>
          )}

          {/* Content section - más padding si no hay imagen */}
          <div className={`relative space-y-4 md:space-y-5 ${data.image_url ? 'p-4 sm:p-6 md:p-8' : 'p-6 sm:p-8 md:p-12'}`}>
            <div className="space-y-3 md:space-y-4">
              <h3 className={`font-body font-bold tracking-tight pr-10 md:pr-8 text-white ${
                data.image_url 
                  ? 'text-xl sm:text-2xl md:text-3xl' 
                  : 'text-2xl sm:text-3xl md:text-4xl'
              }`}>
                {data.title}
              </h3>
              {data.body && (
                <p className={`font-body text-zinc-300 leading-relaxed ${
                  data.image_url 
                    ? 'text-sm sm:text-base' 
                    : 'text-base sm:text-lg'
                }`}>
                  {data.body}
                </p>
              )}
            </div>

            {/* Email form section (email-gate or newsletter) */}
            {needsEmail && (
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="popover-email" className="font-body text-xs sm:text-sm font-medium text-white">
                    {data.show_newsletter 
                      ? "Suscríbete a nuestro newsletter" 
                      : "Ingresa tu email para desbloquear el código"}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="popover-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      disabled={submitting}
                      className="font-body flex-1 px-4 py-3.5 sm:py-3 rounded-lg border border-zinc-600 bg-zinc-800 text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-base"
                    />
                    <button
                      type="submit"
                      disabled={submitting || !email.trim()}
                      className="font-body w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-base"
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                  <code className="flex-1 font-body text-lg sm:text-base md:text-lg font-semibold tracking-wider text-primary text-center sm:text-left">
                    {data.discount_code}
                  </code>
                  <button
                    onClick={onCopy}
                    className="font-body flex items-center justify-center gap-2 px-6 py-3 sm:px-4 sm:py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all duration-200 text-base sm:text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 sm:w-4 sm:h-4" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 sm:w-4 sm:h-4" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* CTA Button - más grande en móvil */}
            {data.cta_url && data.cta_text && (
              <div className="pt-2">
                <a
                  href={data.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body block w-full text-center px-6 py-3.5 sm:py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-base"
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
