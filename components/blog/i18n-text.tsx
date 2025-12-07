"use client"

import { useI18n } from "@/components/providers/i18n-provider"

export function I18nText({ k }: { k: string }) {
  const { t } = useI18n()
  return <>{t(k)}</>
}
