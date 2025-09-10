"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

export type Locale = "en" | "es"

// Non-recursive shape to satisfy linters; we'll treat nested objects as unknown and traverse at runtime
export type Messages = Record<string, unknown>

type I18nContextType = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const SUPPORTED_LOCALES: Locale[] = ["en", "es"]
const DEFAULT_LOCALE: Locale = "es"

function flattenMessages(messages: Messages, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(messages)) {
    const fullKey = prefix ? `${prefix}.${k}` : k
    if (typeof v === "string") {
      out[fullKey] = v
    } else if (v && typeof v === "object") {
      Object.assign(out, flattenMessages(v as Messages, fullKey))
    }
  }
  return out
}

async function loadMessages(locale: Locale): Promise<Record<string, string>> {
  // Using dynamic import for tree-shaking and bundling per-locale
  switch (locale) {
    case "es": {
      const mod = await import("@/locales/es.json")
      return flattenMessages(mod.default as Messages)
    }
    case "en":
    default: {
      const mod = await import("@/locales/en.json")
      return flattenMessages(mod.default as Messages)
    }
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE)
  const [messages, setMessages] = useState<Record<string, string>>({})

  // Initialize from localStorage or browser settings
  useEffect(() => {
    const stored = typeof window !== "undefined" ? (localStorage.getItem("busy.locale") as Locale | null) : null
    const initial = stored && SUPPORTED_LOCALES.includes(stored) ? stored : DEFAULT_LOCALE
    setLocaleState(initial)
  }, [])

  // Load messages on locale change
  useEffect(() => {
    let cancelled = false
    loadMessages(locale).then((m) => {
      if (!cancelled) setMessages(m)
    })
    return () => {
      cancelled = true
    }
  }, [locale])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem("busy.locale", l)
      // Also hint SSR/SEO via cookie (non-httpOnly). Path=/ for app-wide
      document.cookie = `busy_locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}`
    } catch {
      // ignore
    }
  }, [])

  const t = useCallback(
    (key: string) => {
      return messages[key] ?? key
    },
    [messages],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider")
  return ctx
}
