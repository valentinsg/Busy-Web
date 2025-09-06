"use client"

import * as React from "react"
import { useI18n } from "@/components/i18n-provider"

export function I18nText({ k }: { k: string }) {
  const { t } = useI18n()
  return <>{t(k)}</>
}
