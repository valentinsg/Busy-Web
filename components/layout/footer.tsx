"use client"

import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n-provider"
import { usePathname } from "next/navigation"
import * as React from "react"

const footerSections = (t: (k: string) => string) => ({
  shop: {
    title: t("footer.sections.shop.title"),
    links: [
      { nameKey: "footer.sections.shop.links.all_products", href: "/products" },
      { nameKey: "footer.sections.shop.links.hoodies", href: "/products?category=hoodies" },
      { nameKey: "footer.sections.shop.links.tshirts", href: "/products?category=tshirts" },
      { nameKey: "footer.sections.shop.links.accessories", href: "/products?category=accessories" },
      { nameKey: "footer.sections.shop.links.care_guide", href: "/blog/cuidar-tus-prendas" },
    ],
  },
  brand: {
    title: t("footer.sections.brand.title"),
    links: [
      { nameKey: "footer.sections.brand.links.about_us", href: "/about" },
      { nameKey: "footer.sections.brand.links.our_story", href: "/about#story" },
      { nameKey: "footer.sections.brand.links.blog", href: "/blog" },
    ],
  },
  support: {
    title: t("footer.sections.support.title"),
    links: [
      { nameKey: "footer.sections.support.links.faq", href: "/faq" },
      { nameKey: "footer.sections.support.links.contact", href: "/contact" },
      { nameKey: "footer.sections.support.links.size_guide", href: "/faq#size-guide" },
      { nameKey: "footer.sections.support.links.returns", href: "/faq#returns" },
      { nameKey: "footer.sections.support.links.whatsapp", href: "https://wa.me/542236680041" },
    ],
  },
  social: {
    title: t("footer.sections.social.title"),
    links: [
      { nameKey: "footer.sections.social.links.instagram", href: "https://instagram.com" },
      { nameKey: "footer.sections.social.links.tiktok", href: "https://tiktok.com" },
      { nameKey: "footer.sections.social.links.facebook", href: "https://facebook.com" },
      { nameKey: "footer.sections.social.links.pinterest", href: "https://pinterest.com" },
    ],
  },
})

export function Footer() {
  const { t } = useI18n()
  const [email, setEmail] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const sections = footerSections(t)

  const tt = (key: string, fallback: string) => {
    const val = t(key)
    return val === key ? fallback : val
  }

  const formatFallback = (label?: string) => {
    if (!label) return ""
    const trimmed = label.trim()
    if (!trimmed) return ""
    const lower = trimmed.toLowerCase()
    const BRAND_EXCEPTIONS: Record<string, string> = {
      "whatsapp": "WhatsApp",
      "facebook": "Facebook",
      "pinterest": "Pinterest",
      "tiktok": "TikTok",
      "blog": "Blog",
    }

    // If it's a single word and matches a brand exception, return it directly
    if (!lower.includes(" ") && BRAND_EXCEPTIONS[lower]) {
      return BRAND_EXCEPTIONS[lower]
    }

    // Otherwise, title-case words while applying brand exceptions per word
    return lower
      .split(" ")
      .map((w) => BRAND_EXCEPTIONS[w] || (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ")
  }

  return (
    <footer className="bg-background">
      <div className="container px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" prefetch={false} className="flex items-center w-28 ml-16">
              <div className="relative h-28 w-28">
                <Image src="/busy-parche.png" alt="Busy" fill className="object-contain hidden dark:block contrast-30" />
              </div>
            </Link>
            <p className="font-body text-sm text-muted-foreground mb-4 max-w-xs">
              {t("footer.brand.description")}
            </p>

            {/* Newsletter */}
            <div className="space-y-2">
              <h4 className="font-heading font-medium">{tt("footer.newsletter.title", "Mantente al día")}</h4>
              <div className="flex space-x-2">
                <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder={tt("footer.newsletter.placeholder", "Ingresa tu email")} className="max-w-[200px] text-sm font-heading" />
                <Button size="sm" disabled={submitting} onClick={async ()=>{
                  setSubmitting(true); setMessage(null)
                  try {
                    const res = await fetch("/api/newsletter/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
                    const json = await res.json()
                    if (!res.ok || !json.ok) throw new Error(json.error || "Error")
                    setEmail("")
                    if (json.already) {
                      setMessage("Ya estás suscripto")
                    } else {
                      setMessage("¡Gracias por suscribirte!")
                    }
                  } catch (e:any) {
                    setMessage(e?.message || "No se pudo suscribir")
                  } finally {
                    setSubmitting(false)
                  }
                }} className="text-sm font-heading font-semibold">{submitting ? "..." : tt("footer.newsletter.subscribe", "Suscribirse")}</Button>
              </div>
              {message && <p className="text-xs text-muted-foreground">{message}</p>}
              <p className="text-xs text-muted-foreground">Soporte por WhatsApp: <Link href="https://wa.me/542236680041" target="_blank" className="underline">223 668 0041</Link></p>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(sections).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-heading font-bold  mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link: any) => {
                  const label = t(link.nameKey)
                  const humanFallback = link.nameKey?.split(".").pop()?.replaceAll("_", " ")
                  const finalLabel = label === link.nameKey ? formatFallback(humanFallback || link.nameKey) : label
                  return (
                  <li key={link.nameKey}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {finalLabel}
                    </Link>
                  </li>
                )})}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="font-body text-sm text-muted-foreground"> 2024 Busy. {t("footer.bottom.rights")}</p>
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <Link href="/legal/privacy" prefetch={false} className="font-body hover:text-foreground transition-colors">
              {t("footer.bottom.privacy")}
            </Link>
            <Link href="/legal/terms" prefetch={false} className="font-body hover:text-foreground transition-colors">
              {t("footer.bottom.terms")}
            </Link>
            <Link href="/legal/cookies" prefetch={false} className="font-body hover:text-foreground transition-colors">
              {t("footer.bottom.cookies")}
            </Link>
            </div>
        </div>
      </div>
    </footer>
  )
}
