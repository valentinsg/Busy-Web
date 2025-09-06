import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const footerSections = {
  shop: {
    title: "Shop",
    links: [
      { name: "All Products", href: "/products" },
      { name: "Hoodies", href: "/products?category=hoodies" },
      { name: "T-Shirts", href: "/products?category=tshirts" },
      { name: "Accessories", href: "/products?category=accessories" },
    ],
  },
  brand: {
    title: "Brand",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Our Story", href: "/about#story" },
      { name: "Sustainability", href: "/about#sustainability" },
      { name: "Careers", href: "/about#careers" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { name: "FAQ", href: "/faq" },
      { name: "Contact", href: "/contact" },
      { name: "Size Guide", href: "/faq#size-guide" },
      { name: "Returns", href: "/faq#returns" },
    ],
  },
  social: {
    title: "Social",
    links: [
      { name: "Instagram", href: "https://instagram.com" },
      { name: "Twitter", href: "https://twitter.com" },
      { name: "TikTok", href: "https://tiktok.com" },
      { name: "YouTube", href: "https://youtube.com" },
    ],
  },
}

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="relative h-8 w-8">
                <Image src="/logo-busy-black.png" alt="Busy" fill className="object-contain dark:hidden" />
                <Image src="/logo-busy-white.png" alt="Busy" fill className="object-contain hidden dark:block" />
              </div>
              <span className="font-heading text-xl font-bold">Busy</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Premium streetwear for the modern lifestyle. Quality craftsmanship meets contemporary design.
            </p>

            {/* Newsletter */}
            <div className="space-y-2">
              <h4 className="font-medium">Stay Updated</h4>
              <div className="flex space-x-2">
                <Input type="email" placeholder="Enter your email" className="max-w-[200px]" />
                <Button size="sm">Subscribe</Button>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h4 className="font-medium mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
          <p className="text-sm text-muted-foreground">© 2025 Busy. All rights reserved.</p>
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/legal/cookies" className="hover:text-foreground transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
