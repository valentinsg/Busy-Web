import { CustomCursor } from '@/components/custom-cursor'
import { SplashGate } from '@/components/home/splash-gate'
import { I18nProvider } from '@/components/i18n-provider'
import { HtmlLang } from '@/components/layout/html-lang'
import SiteFrame from '@/components/layout/site-frame'
import SitePopover from '@/components/site-popover'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { generateSEO } from '@/lib/seo'
import { ReducedMotionProvider } from '@/motion/providers/ReducedMotionProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import { Space_Grotesk, Plus_Jakarta_Sans, Abel, DM_Sans, Poppins } from 'next/font/google'
import { cookies } from 'next/headers'
import type React from 'react'
import './globals.css'

// Ensure we always have a valid absolute URL (with scheme) for metadataBase and JSON-LD
const RAW_SITE_URL = process.env.SITE_URL || ''
const SITE_URL = /^https?:\/\//.test(RAW_SITE_URL) && RAW_SITE_URL
  ? RAW_SITE_URL
  : 'https://busy.com.ar'

const AdminQuickFAB = dynamic(() => import('@/components/admin/admin-quick-fab'), {
  ssr: false,
})

// Fuentes de Google (temporal hasta descargar locales)
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

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  ...generateSEO({
    title: 'Busy Streetwear',
    description: 'Busy hace para los que hacen. Únite a nuestra comunidad que ofrece ropa de moda, contenido sobre cultura urbana, playlists, eventos y más.',
    image: '/busy-streetwear.png',
    url: SITE_URL,
  }),
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Busy Streetwear',
    template: '%s - Busy Streetwear',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  // Do not set a global canonical here; individual pages define their own canonical
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#000000',
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Busy Streetwear',
    description: 'Busy hace para los que hacen. Únite a nuestra comunidad que ofrece ropa de moda, contenido sobre cultura urbana, playlists, eventos y más.',
    url: SITE_URL,
    logo: `${SITE_URL}/logo-busy-black.png`,
    sameAs: [
      'https://instagram.com/busy.streetwear',
      'https://www.facebook.com/profile.php?id=61581696441351',
      'https://www.tiktok.com/@busy.streetwear',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+54 9 22 3668 0041',
      contactType: 'Customer Service',
      email: 'busy.streetwear@gmail.com',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Busy',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'es-AR',
  },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const cookieLocale = cookieStore.get('busy_locale')?.value
  const htmlLang = cookieLocale === 'es' || cookieLocale === 'en' ? cookieLocale : 'es'
  return (
    <html lang={htmlLang} suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){document.documentElement.classList.add('dark')})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`bg-black/90 ${spaceGrotesk.variable} ${plusJakartaSans.variable} ${abel.variable} ${dmSans.variable} ${poppins.variable} font-sans antialiased`}
      >
        <ReducedMotionProvider>
          <I18nProvider>
            <HtmlLang />
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              forcedTheme="dark"
              disableTransitionOnChange
            >
              <SplashGate />
              <SiteFrame>
                {children}
              </SiteFrame>
              <Toaster />
            </ThemeProvider>
          </I18nProvider>
        </ReducedMotionProvider>
        {/* Custom cursor should be rendered within <body> to avoid removeChild null errors */}
        <CustomCursor />
        <AdminQuickFAB />
        <SitePopover />
        {/* Vercel Web Analytics - only sends events in production, loaded after interactive */}
        <Analytics mode="production" />
        {/* Vercel Speed Insights - Web Vitals reporting, loaded after interactive */}
        <SpeedInsights sampleRate={1.0} />
      </body>
    </html>
  )
}
