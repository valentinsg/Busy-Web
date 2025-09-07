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
      { name: t("footer.sections.shop.links.all_products"), href: "/products" },
      { name: t("footer.sections.shop.links.hoodies"), href: "/products?category=hoodies" },
      { name: t("footer.sections.shop.links.tshirts"), href: "/products?category=tshirts" },
      { name: t("footer.sections.shop.links.accessories"), href: "/products?category=accessories" },
    ],
  },
  brand: {
    title: t("footer.sections.brand.title"),
    links: [
      { name: t("footer.sections.brand.links.about_us"), href: "/about" },
      { name: t("footer.sections.brand.links.our_story"), href: "/about#story" },
      { name: t("footer.sections.brand.links.sustainability"), href: "/about#sustainability" },
      { name: t("footer.sections.brand.links.careers"), href: "/about#careers" },
    ],
  },
  support: {
    title: t("footer.sections.support.title"),
    links: [
      { name: t("footer.sections.support.links.faq"), href: "/faq" },
      { name: t("footer.sections.support.links.contact"), href: "/contact" },
      { name: t("footer.sections.support.links.size_guide"), href: "/faq#size-guide" },
      { name: t("footer.sections.support.links.returns"), href: "/faq#returns" },
    ],
  },
  social: {
    title: t("footer.sections.social.title"),
    links: [
      { name: t("footer.sections.social.links.instagram"), href: "https://instagram.com" },
      { name: t("footer.sections.social.links.twitter"), href: "https://twitter.com" },
      { name: t("footer.sections.social.links.tiktok"), href: "https://tiktok.com" },
      { name: t("footer.sections.social.links.youtube"), href: "https://youtube.com" },
    ],
  },
})

export function Footer() {
  const { t } = useI18n()
  const pathname = usePathname()
  const [email, setEmail] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [message, setMessage] = React.useState<string | null>(null)
  const sections = footerSections(t)
  const year = new Date().getFullYear()
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center w-28 ml-16">
              <div className="relative h-28 w-28">
                <Image src="/busy-parche.png" alt="Busy" fill className="object-contain hidden dark:block contrast-30" />
              </div>
            </Link>
            <p className="font-body text-sm text-muted-foreground mb-4 max-w-xs">
              {t("footer.brand.description")}
            </p>

            {/* Newsletter */}
            <div className="space-y-2">
              <h4 className="font-heading font-medium">{t("footer.newsletter.title")}</h4>
              <div className="flex space-x-2">
                <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder={t("footer.newsletter.placeholder")} className="max-w-[200px] text-sm font-heading" />
                <Button size="sm" disabled={submitting} onClick={async ()=>{
                  setSubmitting(true); setMessage(null)
                  try {
                    const res = await fetch("/api/newsletter/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
                    const json = await res.json()
                    if (!res.ok || !json.ok) throw new Error(json.error || "Error")
                    setEmail(""); setMessage("¡Gracias por suscribirte!")
                  } catch (e:any) {
                    setMessage(e?.message || "No se pudo suscribir")
                  } finally {
                    setSubmitting(false)
                  }
                }} className="text-sm font-heading font-semibold">{submitting ? "..." : t("footer.newsletter.subscribe")}</Button>
              </div>
              {message && <p className="text-xs text-muted-foreground">{message}</p>}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(sections).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-heading font-bold  mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="font-body text-sm text-muted-foreground">© {year} Busy. {t("footer.bottom.rights")}</p>
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <Link href="/legal/privacy" className="font-body hover:text-foreground transition-colors">
              {t("footer.bottom.privacy")}
            </Link>
            <Link href="/legal/terms" className="font-body hover:text-foreground transition-colors">
              {t("footer.bottom.terms")}
            </Link>
            <Link href="/legal/cookies" className="font-body hover:text-foreground transition-colors">
              {t("footer.bottom.cookies")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
