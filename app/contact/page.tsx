"use client"

import * as React from "react"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/i18n-provider"

export default function ContactPage() {
  const { toast } = useToast()
  const { t } = useI18n()
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Error al enviar el mensaje")
      }

      toast({
        title: t("contact.toast.success.title"),
        description: t("contact.toast.success.desc"),
      })

      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch {
      toast({
        title: t("contact.toast.error.title"),
        description: t("contact.toast.error.desc"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container px-4 py-8 pt-28 font-body">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold mb-4">{t("contact.header.title")}</h1>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">{t("contact.header.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("contact.info.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Dirección</div>
                    <div className="font-body text-sm text-muted-foreground">
                      Showroom privado en Mar del Plata
                      <br />
                      <span className="text-xs italic">Coordinamos tu visita por WhatsApp</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Teléfono / WhatsApp</div>
                    <a href="https://wa.me/5492236680041" target="_blank" rel="noopener noreferrer" className="font-body text-sm text-accent-brand hover:underline">
                      +54 9 223 668-0041
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Email</div>
                    <a href="mailto:busy.streetwear@gmail.com" className="font-body text-sm text-accent-brand hover:underline">
                      busy.streetwear@gmail.com
                    </a>
                  </div>
                </div>

                <div className="font-body flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Horarios de atención</div>
                    <div className="font-body text-sm text-muted-foreground">
                      Lunes a Sábado: 24 horas
                      <br />
                      <span className="text-xs italic">Respondemos por WhatsApp</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enlaces rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <a href="/products" className="font-body text-sm text-accent-brand hover:underline">Nuestros Productos</a>
                </div>
                <div>
                  <a href="/faq" className="font-body text-sm text-accent-brand hover:underline">Preguntas Frecuentes</a>
                </div>
                <div>
                  <a href="/faq#size-guide" className="font-body text-sm text-accent-brand hover:underline">Guía de Talles</a>
                </div>
                <div>
                  <a href="/about" className="font-body text-sm text-accent-brand hover:underline">Sobre Nosotros</a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("contact.form.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t("contact.form.name")} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t("contact.form.email")} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">{t("contact.form.subject")}</Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("contact.form.select_placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">{t("contact.form.subject_options.general")}</SelectItem>
                        <SelectItem value="order">{t("contact.form.subject_options.order")}</SelectItem>
                        <SelectItem value="returns">{t("contact.form.subject_options.returns")}</SelectItem>
                        <SelectItem value="product">{t("contact.form.subject_options.product")}</SelectItem>
                        <SelectItem value="wholesale">{t("contact.form.subject_options.wholesale")}</SelectItem>
                        <SelectItem value="press">{t("contact.form.subject_options.press")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">{t("contact.form.message")} *</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder={t("contact.form.message_placeholder")}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? t("contact.form.sending") : t("contact.form.submit")}
                  </Button>

                  <p className="font-body text-xs text-muted-foreground">
                    {t("contact.form.privacy")}
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
