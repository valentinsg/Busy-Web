"use client"

import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  const { locale, setLocale } = useI18n()

  const isEN = locale === "en"

  return (
    <div className="flex items-center gap-1" aria-label="Language selector">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <Button
          type="button"
          variant={isEN ? "secondary" : "ghost"}
          size="sm"
          className="px-2"
          onClick={() => setLocale("en")}
          aria-pressed={isEN}
        >
          EN
        </Button>
        <Button
          type="button"
          variant={!isEN ? "secondary" : "ghost"}
          size="sm"
          className="px-2"
          onClick={() => setLocale("es")}
          aria-pressed={!isEN}
        >
          ES
        </Button>
      </div>
    </div>
  )
}
