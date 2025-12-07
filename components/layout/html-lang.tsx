"use client"

import { useI18n } from "@/components/providers/i18n-provider"
import { useEffect } from "react"

export function HtmlLang() {
  const { locale } = useI18n()

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale
    }
  }, [locale])

  return null
}
