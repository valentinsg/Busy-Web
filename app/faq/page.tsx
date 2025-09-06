import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Mail } from "lucide-react"
import Link from "next/link"
import faqsData from "@/content/faqs.json"

export const metadata = {
  title: "Frequently Asked Questions - Busy",
  description: "Find answers to common questions about Busy products, shipping, returns, and more.",
}

export default function FAQPage() {
  return (
    <div className="container px-4 py-8 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to the most common questions about our products and services.
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
                Still Have Questions?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Our customer support team is here to help.
              </p>
              <Button asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Us Directly
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Send us an email and we'll get back to you within 24 hours.</p>
              <Button asChild variant="outline">
                <a href="mailto:support@busy.com">support@busy.com</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
