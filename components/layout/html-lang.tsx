"use client"

import { useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"

export function HtmlLang() {
  const { locale } = useI18n()

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale
    }
  }, [locale])

  return null
}
