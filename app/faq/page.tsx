import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getActiveFAQs } from "@/lib/repo/faqs"
import { Mail, MessageCircle, MessageSquare } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

// Fallback FAQs in case DB is empty
const FALLBACK_FAQS = [
  { id: '1', question: '¿Envían a todo el país?', answer: 'Sí, enviamos a todo el país a través de Correo Argentino y otros transportes. Los envíos son gratuitos para pedidos superiores a $100.000.' },
  { id: '2', question: '¿Cuál es la guía de talles?', answer: 'Puedes encontrar nuestra guía de talles detallada en cada página de producto y en nuestra calculadora de talles.' },
  { id: '3', question: '¿Cuál es su política de devoluciones?', answer: 'Ofrecemos cambios dentro de los 30 días posteriores a la compra. Los artículos deben estar en condiciones originales con etiquetas.' },
]

const siteUrl = process.env.SITE_URL || "https://busy.com.ar"

export const metadata: Metadata = {
  title: "Preguntas Frecuentes | Envíos, Talles, Cambios | Busy Streetwear",
  description:
    "Respuestas a las preguntas más comunes sobre envíos a todo el país, guía de talles, política de cambios y devoluciones, métodos de pago y más. Atención personalizada por WhatsApp.",
  keywords: [
    "preguntas frecuentes busy",
    "envíos busy streetwear",
    "guía de talles busy",
    "cambios y devoluciones",
    "política de envíos argentina",
    "streetwear mar del plata",
    "atención al cliente busy",
  ],
  alternates: {
    canonical: `${siteUrl}/faq`,
    languages: {
      'es-AR': `${siteUrl}/faq`,
    },
  },
  openGraph: {
    title: "Preguntas Frecuentes | Busy Streetwear",
    description: "Respuestas rápidas sobre envíos, talles, cambios y más. Atención personalizada por WhatsApp.",
    url: `${siteUrl}/faq`,
    siteName: "Busy Streetwear",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og/busy-faq.png`,
        width: 1200,
        height: 630,
        alt: "Preguntas Frecuentes - Busy Streetwear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Preguntas Frecuentes | Busy Streetwear",
    description: "Respuestas rápidas sobre envíos, talles, cambios y más.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function FAQPage() {
  const SITE_URL = process.env.SITE_URL || 'https://busy.com.ar'
  const WHATSAPP_NUMBER = '5492236825268'
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`
  const EMAIL = 'busystreetwear@gmail.com'

  // Load FAQs from database
  let faqs: Array<{ id: string; question: string; answer: string }>
  try {
    const dbFaqs = await getActiveFAQs()
    faqs = dbFaqs.length > 0 ? dbFaqs : FALLBACK_FAQS
  } catch {
    faqs = FALLBACK_FAQS
  }

  // Combined JSON-LD schema for better SEO
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      // BreadcrumbList
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Inicio',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Preguntas Frecuentes',
            item: `${SITE_URL}/faq`,
          },
        ],
      },
      // FAQPage with all questions
      {
        '@type': 'FAQPage',
        name: 'Preguntas Frecuentes - Busy Streetwear',
        description: 'Respuestas a las preguntas más comunes sobre envíos, talles, cambios y devoluciones.',
        url: `${SITE_URL}/faq`,
        inLanguage: 'es-AR',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      // Organization for contact info
      {
        '@type': 'Organization',
        name: 'Busy Streetwear',
        url: SITE_URL,
        logo: `${SITE_URL}/logo-busy-black.png`,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+54-9-223-682-5268',
          contactType: 'Customer Service',
          email: EMAIL,
          availableLanguage: ['Spanish'],
          areaServed: 'AR',
        },
        sameAs: [
          'https://instagram.com/busy_streetwear',
          'https://tiktok.com/@busy_streetwear',
          'https://youtube.com/@busystreetwear',
        ],
      },
      // WebPage
      {
        '@type': 'WebPage',
        name: 'Preguntas Frecuentes',
        url: `${SITE_URL}/faq`,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Busy Streetwear',
          url: SITE_URL,
        },
        about: {
          '@type': 'Thing',
          name: 'Atención al cliente Busy Streetwear',
        },
        lastReviewed: new Date().toISOString(),
      },
    ],
  }

  return (
    <div className="container px-4 py-6 sm:py-8 pt-24 sm:pt-28 font-body">
      <div className="max-w-4xl mx-auto">
        {/* Combined JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Preguntas frecuentes</h1>
          <p className="text-base sm:text-lg text-muted-foreground px-2">
            Encontrá respuestas rápidas sobre productos, envíos, cambios y más.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Card className="mb-8 sm:mb-12">
          <CardContent className="p-4 sm:p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                  <AccordionTrigger className="text-left text-sm sm:text-base py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Section - Improved mobile layout */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {/* WhatsApp Card - Primary CTA */}
          <Card className="border-green-500/30 bg-green-950/10">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <MessageSquare className="h-5 w-5 text-green-500" />
                Contactar soporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                ¿No encontrás lo que buscás? Escribinos por WhatsApp y te ayudamos al instante.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none">
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Escribir por WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" className="flex-1 sm:flex-none">
                  <Link href="/contact">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Formulario de contacto
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                +54 9 223 682-5268 · Respondemos de Lunes a Sábado
              </p>
            </CardContent>
          </Card>

          {/* Email Card */}
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Mail className="h-5 w-5" />
                Escribinos por mail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Para consultas más detalladas, escribinos y te respondemos dentro de las 24 horas.
              </p>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-3">También te puede interesar:</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <Link href="/size-calculator" className="text-sm text-accent-brand hover:underline">
              Calculadora de talles
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/legal/returns" className="text-sm text-accent-brand hover:underline">
              Cambios y devoluciones
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/about" className="text-sm text-accent-brand hover:underline">
              Sobre nosotros
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/blog/guia-para-cuidar-tu-ropa" className="text-sm text-accent-brand hover:underline">
              Cuidado de prendas
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
