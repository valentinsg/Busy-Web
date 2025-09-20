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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, you would send this to your API
      const mailtoLink = `mailto:support@busy.com?subject=${encodeURIComponent(
        formData.subject || t("contact.mail.default_subject"),
      )}&body=${encodeURIComponent(
        `${t("contact.mail.name")}: ${formData.name}\n${t("contact.mail.email")}: ${formData.email}\n\n${t("contact.mail.message")}:\n${formData.message}`,
      )}`

      window.location.href = mailtoLink

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
                    <div className="font-medium">{t("contact.info.address.title")}</div>
                    <div className="font-body text-sm text-muted-foreground">
                      {t("contact.info.address.line1")}
                      <br />
                      {t("contact.info.address.line2")}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">{t("contact.info.phone.title")}</div>
                    <div className="font-body text-sm text-muted-foreground">{t("contact.info.phone.value")}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">{t("contact.info.email.title")}</div>
                    <div className="font-body text-sm text-muted-foreground">{t("contact.info.email.value")}</div>
                  </div>
                </div>

                <div className="font-body flex items-center gap-1">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">{t("contact.info.hours.title")}</div>
                    <div className="font-body text-sm text-muted-foreground">
                      {t("contact.info.hours.weekdays")}
                      <br />
                      {t("contact.info.hours.weekend")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("contact.links.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <a href="/faq" className="font-body text-sm text-accent-brand hover:underline">{t("contact.links.faq")}</a>
                </div>
                <div>
                  <a href="/faq#size-guide" className="font-body text-sm text-accent-brand hover:underline">{t("contact.links.size_guide")}</a>
                </div>
                <div>
                  <a href="/faq#returns" className="font-body text-sm text-accent-brand hover:underline">{t("contact.links.returns")}</a>
                </div>
                <div>
                  <a href="/about" className="font-body text-sm text-accent-brand hover:underline">{t("contact.links.about")}</a>
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
