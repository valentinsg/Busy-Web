import './globals.css'
import type { Metadata } from 'next'
import { Space_Grotesk, Plus_Jakarta_Sans, Abel, DM_Sans, Libre_Barcode_39_Text, Poppins } from 'next/font/google'
import type React from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/toaster'
import { generateSEO } from '@/lib/seo'
import { SplashGate } from '@/components/home/splash-gate'
import { CustomCursor } from '@/components/custom-cursor'
import { I18nProvider } from '@/components/i18n-provider'
import { HtmlLang } from '@/components/layout/html-lang'
import { PageTransition } from '@/components/layout/page-transition'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
})

// Additional fonts migrated from <link> to next/font
const abel = Abel({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-abel',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const libreBarcode39Text = Libre_Barcode_39_Text({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-libre-barcode-39-text',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: [
    '100', '200', '300', '400', '500', '600', '700', '800', '900',
  ],
  variable: '--font-poppins',
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  ...generateSEO(),
  metadataBase: new URL(process.env.SITE_URL || 'https://busy.com.ar'),
  title: {
    default: 'Busy - Premium Streetwear',
    template: '%s | Busy',
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Busy',
  description: 'Streetwear para la vida moderna',
  url: process.env.SITE_URL || 'https://busy.com.ar',
  logo: `${process.env.SITE_URL || 'https://busy.com.ar'}/logo-busy-black.png`,
  sameAs: [
    'https://instagram.com/busy',
    'https://twitter.com/busy',
    'https://facebook.com/busy',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+54 9 11 6262 6262',
    contactType: 'Customer Service',
    email: 'contacto@busy.com.ar',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${abel.variable} ${dmSans.variable} ${libreBarcode39Text.variable} ${poppins.variable} font-sans antialiased`}
      >
        <I18nProvider>
          <HtmlLang />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SplashGate />
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <PageTransition>
                <main className="flex-1">{children}</main>
              </PageTransition>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </I18nProvider>
        {/* Custom cursor should be rendered within <body> to avoid removeChild null errors */}
        <CustomCursor />
      </body>
    </html>
  )
}
