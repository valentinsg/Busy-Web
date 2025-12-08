import RouteTracker from '@/components/analytics/route-tracker'
import { SplashGate } from '@/components/home/splash-gate'
import { HtmlLang } from '@/components/layout/html-lang'
import SiteFrame from '@/components/layout/site-frame'
import { ChristmasProvider } from '@/components/providers/christmas-provider'
import { I18nProvider } from '@/components/providers/i18n-provider'
import { PromotionsProvider } from '@/components/providers/promotions-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import SitePopover from '@/components/shared/site-popover'
import { Toaster } from '@/components/ui/toaster'
import { generateSEO } from '@/lib/seo'
import { ReducedMotionProvider } from '@/motion/providers/ReducedMotionProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import { Abel, DM_Sans, Plus_Jakarta_Sans, Poppins, Space_Grotesk } from 'next/font/google'
import { cookies } from 'next/headers'
import Script from 'next/script'
import type React from 'react'
import './globals.css'

// Ensure we always have a valid absolute URL (with scheme) for metadataBase and JSON-LD
const RAW_SITE_URL = process.env.SITE_URL || ''
const SITE_URL = /^https?:\/\//.test(RAW_SITE_URL) && RAW_SITE_URL
  ? RAW_SITE_URL
  : 'https://busy.com.ar'

const IS_PROD = process.env.NODE_ENV === 'production'
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

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
    title: 'Busy Streetwear | Cultura Urbana, Moda y Comunidad Argentina',
    description: 'Marca argentina de cultura urbana nacida en Mar del Plata. Más que ropa: cultura, música, básquet, playlists, blog y comunidad real. Busy hace para los que hacen.',
    image: '/busy-og-image.png',
    url: SITE_URL,
  }),
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Busy Streetwear | Cultura Urbana, Moda y Comunidad Argentina',
    template: '%s | Busy Streetwear',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      // Microsoft Tiles
      { rel: 'msapplication-TileImage', url: '/mstile-150x150.png' },
      { rel: 'msapplication-square70x70logo', url: '/mstile-70x70.png' },
      { rel: 'msapplication-square150x150logo', url: '/mstile-150x150.png' },
      { rel: 'msapplication-square310x310logo', url: '/mstile-310x310.png' },
    ],
  },
  // Configuración de Microsoft Tiles
  other: {
    'msapplication-TileColor': '#000000',
    'msapplication-TileImage': '/mstile-150x150.png',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#000000',
    'apple-mobile-web-app-title': 'Busy Streetwear',
    'application-name': 'Busy Streetwear',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
  manifest: '/site.webmanifest',

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
  // Brand Schema - Identidad de marca completa
  {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: 'Busy Streetwear',
    alternateName: 'Busy',
    description: 'Marca argentina de cultura urbana que combina moda, contenido y comunidad. Más que ropa: cultura, música, básquet y generar conversación.',
    url: SITE_URL,
    logo: `${SITE_URL}/logo-busy-black.png`,
    image: `${SITE_URL}/busy-og-image.png`,
    foundingDate: '2024',
    foundingLocation: {
      '@type': 'Place',
      name: 'Mar del Plata, Buenos Aires, Argentina',
    },
    founder: [
      {
        '@type': 'Person',
        name: 'Valentín Sánchez Guevara',
        jobTitle: 'Fundador, Programador, Director Creativo',
        description: 'Fundador de Busy Streetwear, responsable de la idea de Busy, el desarrollo web y estrategia digital',
      },
      {
        '@type': 'Person',
        name: 'Agustín Bernardo Molina',
        jobTitle: 'Co-fundador, Diseñador y embajador',
        description: 'Co-fundador de Busy Streetwear, responsable del diseño de productos y dirección de la marca',
      },
    ],
    sameAs: [
      'https://www.instagram.com/busy.streetwear',
      'https://www.tiktok.com/@busy.streetwear',
      'https://www.facebook.com/profile.php?id=61581696441351',
      'https://open.spotify.com/user/agustinmancho',
      'https://www.youtube.com/@busystreetwear',
    ],
    slogan: 'Busy hace para los que hacen',
  },
  // Organization Schema - Información empresarial
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Busy Streetwear',
    legalName: 'Busy Streetwear',
    description: 'Marca de cultura urbana nacida en Mar del Plata que trasciende la moda. Plataforma creativa que impulsa cultura, artistas y experiencias reales.',
    url: SITE_URL,
    logo: `${SITE_URL}/logo-busy-black.png`,
    image: `${SITE_URL}/busy-og-image.png`,
    foundingDate: '2024',
    sameAs: [
      'https://www.instagram.com/busy.streetwear',
      'https://www.tiktok.com/@busy.streetwear',
      'https://www.facebook.com/profile.php?id=61581696441351',
      'https://open.spotify.com/user/agustinmancho',
      'https://www.youtube.com/@busystreetwear',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+54 9 22 3668 0041',
      contactType: 'Customer Service',
      email: 'busystreetwear@gmail.com',
      areaServed: 'AR',
      availableLanguage: ['Spanish', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'María Curie 5457',
      addressLocality: 'Mar del Plata',
      addressRegion: 'Buenos Aires',
      addressCountry: 'AR',
    },
  },
  // LocalBusiness Schema - Showroom actual
  {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Busy Streetwear Showroom',
    description: 'Showroom provisional de Busy Streetwear en Mar del Plata. Primer local físico planeado para 2026.',
    image: `${SITE_URL}/busy-og-image.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'María Curie 5457',
      addressLocality: 'Mar del Plata',
      addressRegion: 'Buenos Aires',
      postalCode: '7600',
      addressCountry: 'AR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -38.0055,
      longitude: -57.5426,
    },
    url: SITE_URL,
    telephone: '+54 9 22 3668 0041',
    priceRange: '$$',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '20:00',
    },
  },
  // WebSite Schema - Búsqueda del sitio
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Busy Streetwear',
    alternateName: 'Busy',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'es-AR',
    publisher: {
      '@type': 'Organization',
      name: 'Busy Streetwear',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo-busy-black.png`,
      },
    },
  },
  // PodcastSeries Schema - Busy Talks
  {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    name: 'Busy Talks',
    description: 'Podcast de Busy Streetwear: conversaciones reales sobre cultura urbana, música, básquet y creatividad. Entrevistas con artistas, creadores y la comunidad.',
    url: `${SITE_URL}/blog`,
    webFeed: `${SITE_URL}/blog`,
    image: `${SITE_URL}/busy-og-image.png`,
    author: {
      '@type': 'Organization',
      name: 'Busy Streetwear',
      url: SITE_URL,
    },
    inLanguage: 'es-AR',
  },
  // CreativeWorkSeries Schema - Contenido audiovisual
  {
    '@context': 'https://schema.org',
    '@type': 'CreativeWorkSeries',
    name: 'Busy Content',
    description: 'Serie de contenido cultural de Busy Streetwear: documentales, entrevistas, cultura urbana y streetwear en YouTube y redes sociales.',
    url: 'https://www.youtube.com/@busystreetwear',
    creator: {
      '@type': 'Organization',
      name: 'Busy Streetwear',
      url: SITE_URL,
    },
    inLanguage: 'es-AR',
  },
  // ItemList Schema - Navegación principal
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Secciones principales de Busy Streetwear',
    description: 'Navegación principal del sitio',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Productos',
        description: 'Tienda de ropa streetwear: hoodies, remeras, pantalones y más',
        url: `${SITE_URL}/products`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Sobre Nosotros',
        description: 'Historia de Busy Streetwear – Fundada en Mar del Plata por Valentín S. Guevara y Agustín B. Molina',
        url: `${SITE_URL}/about`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Playlists',
        description: 'Playlists curadas de Spotify para potenciar artistas emergentes',
        url: `${SITE_URL}/playlists`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Blog',
        description: 'Blog Busy | Cultura, cine, arte y streetwear',
        url: `${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'Contacto',
        description: 'Ponete en contacto con Busy Streetwear',
        url: `${SITE_URL}/contact`,
      },
      {
        '@type': 'ListItem',
        position: 6,
        name: 'Calculadora de Talles',
        description: 'Encontrá tu talle perfecto con nuestra calculadora',
        url: `${SITE_URL}/size-calculator`,
      },
      {
        '@type': 'ListItem',
        position: 7,
        name: 'Preguntas Frecuentes',
        description: 'Respuestas a las preguntas más comunes sobre Busy',
        url: `${SITE_URL}/faq`,
      },
    ],
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
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="ozNbxcPGbF1jmIx5QHcWduHhaPUkzDAqFziJ2POUpIk" />

        {/* Preconnect a Supabase Storage para mejorar LCP */}
        <link rel="preconnect" href="https://wbqbupxoyzczwroqzklj.supabase.co" />
        <link rel="dns-prefetch" href="https://wbqbupxoyzczwroqzklj.supabase.co" />

        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){document.documentElement.classList.add('dark')})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {IS_PROD && GTM_ID ? (
          <Script id="gtm" strategy="beforeInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        ) : null}
      </head>
      <body
        className={`bg-black/90 ${spaceGrotesk.variable} ${plusJakartaSans.variable} ${abel.variable} ${dmSans.variable} ${poppins.variable} font-sans antialiased`}
      >
        {IS_PROD && GTM_ID ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        ) : null}
        {IS_PROD && GA_ID ? (
          <>
            <Script
              id="ga4"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','${GA_ID}',{send_page_view:false});`}
            </Script>
          </>
        ) : null}
        {/* Meta Pixel ahora se gestiona 100% desde GTM - ver tags en Google Tag Manager */}
        <ReducedMotionProvider>
          <I18nProvider>
            <HtmlLang />
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              forcedTheme="dark"
              disableTransitionOnChange
            >
              <ChristmasProvider>
                <PromotionsProvider />
                <SplashGate />
                <SiteFrame>
                  {children}
                </SiteFrame>
                <Toaster />
              </ChristmasProvider>
            </ThemeProvider>
          </I18nProvider>
        </ReducedMotionProvider>
        <RouteTracker />
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
