"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link as LinkIcon, Check } from "lucide-react"

export default function CopyLinkButton({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "")
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <Button type="button" size="sm" variant="ghost" onClick={copy} className={className} aria-label="Copiar link" title="Copiar link" data-label="Copiar link">
      {copied ? <Check className="h-4 w-4 mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
      {copied ? "Copiado" : "Copiar link del artículo"}
    </Button>
  )
}
