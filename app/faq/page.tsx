import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail } from "lucide-react"
import Link from "next/link"
import faqsData from "@/content/faqs.json"
import type { Metadata } from "next"
import { generateSEO } from "@/lib/seo"

export const metadata: Metadata = generateSEO({
  title: "Preguntas frecuentes - Busy",
  description:
    "Respuestas a las preguntas más comunes sobre productos, envíos, políticas y más.",
  url: `${process.env.SITE_URL || "https://busy.com.ar"}/faq`,
})

export default function FAQPage() {
  const SITE_URL = process.env.SITE_URL || 'https://busy.com.ar'
  
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
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
  }

  return (
    <div className="container px-4 py-8 pt-28 font-body">
      <div className="max-w-4xl mx-auto">
        {/* BreadcrumbList JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        {/* FAQPage JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqsData.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: { "@type": "Answer", text: faq.a },
              })),
            }),
          }}
        />

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold mb-4">Preguntas frecuentes</h1>
          <p className="text-lg text-muted-foreground">
            Encontrá respuestas rápidas sobre productos, envíos, cambios y más.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqsData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                ¿Todavía tenés dudas?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                ¿No encontrás lo que buscás? Nuestro equipo de soporte está para ayudarte.
              </p>
              <Button asChild>
                <Link href="/contact">Contactar soporte</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Escribinos por mail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Escribinos y te respondemos dentro de las 24 horas.</p>
              <Button asChild variant="outline">
                <a href="mailto:contacto@busy.com.ar">contacto@busy.com.ar</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
