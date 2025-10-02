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
    <Button 
      type="button" 
      variant="outline" 
      onClick={copy} 
      className={`h-9 w-9 sm:h-10 sm:w-auto sm:px-4 ${className}`}
      aria-label="Copiar link" 
      title="Copiar link"
    >
      {copied ? <Check className="h-4 w-4 sm:mr-2" /> : <LinkIcon className="h-4 w-4 sm:mr-2" />}
      <span className="hidden sm:inline">{copied ? "Copiado" : "Copiar link"}</span>
    </Button>
  )
}
