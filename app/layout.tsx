import { SplashGate } from '@/components/home/splash-gate'
import { I18nProvider } from '@/components/i18n-provider'
import { HtmlLang } from '@/components/layout/html-lang'
import SiteFrame from '@/components/layout/site-frame'
import SitePopover from '@/components/site-popover'
import { PromotionsProvider } from '@/components/promotions-provider'
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
import Script from 'next/script'
import RouteTracker from '@/components/analytics/route-tracker'
import './globals.css'

// Ensure we always have a valid absolute URL (with scheme) for metadataBase and JSON-LD
const RAW_SITE_URL = process.env.SITE_URL || ''
const SITE_URL = /^https?:\/\//.test(RAW_SITE_URL) && RAW_SITE_URL
  ? RAW_SITE_URL
  : 'https://busy.com.ar'

const IS_PROD = process.env.NODE_ENV === 'production'
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const DEBUG_ANALYTICS = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true'

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
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      // Android/Chrome
      { rel: 'icon', type: 'image/png', sizes: '192x192', url: '/android-chrome-192x192.png' },
      { rel: 'icon', type: 'image/png', sizes: '512x512', url: '/android-chrome-512x512.png' },
      // Safari
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' },
      // Microsoft Tiles
      { rel: 'msapplication-TileImage', url: '/mstile-150x150.png' },
      // PWA
      { rel: 'manifest', url: '/site.webmanifest' },
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
        description: 'Conocé la historia, valores y roadmap de Busy Streetwear',
        url: `${SITE_URL}/about`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Playlists',
        description: 'Playlists curadas de música urbana y cultura streetwear',
        url: `${SITE_URL}/playlists`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Blog',
        description: 'Artículos sobre cultura urbana, moda y streetwear',
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
        {IS_PROD && META_PIXEL_ID ? (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
            </Script>
            <noscript>
              <img height="1" width="1" style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
            </noscript>
          </>
        ) : null}
        <ReducedMotionProvider>
          <I18nProvider>
            <HtmlLang />
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              forcedTheme="dark"
              disableTransitionOnChange
            >
              <PromotionsProvider />
              <SplashGate />
              <SiteFrame>
                {children}
              </SiteFrame>
              <Toaster />
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
