"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import "@uiw/react-md-editor/markdown-editor.css"
import "@uiw/react-markdown-preview/markdown.css"

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
)

interface WYSIWYGEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function WYSIWYGEditor({ value, onChange, placeholder }: WYSIWYGEditorProps) {
  const [mounted, setMounted] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-trim whitespace when using toolbar buttons
  useEffect(() => {
    if (!mounted) return

    const handleToolbarClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const button = target.closest('button')
      
      if (button && button.closest('.w-md-editor-toolbar')) {
        setTimeout(() => {
          const textarea = document.querySelector('.w-md-editor-text-input') as HTMLTextAreaElement
          if (!textarea) return

          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          
          if (start === end) return // No selection

          const selectedText = textarea.value.substring(start, end)
          const trimmedText = selectedText.trim()
          
          if (selectedText !== trimmedText && trimmedText.length > 0) {
            // Find where the trimmed text starts and ends
            const leadingSpaces = selectedText.indexOf(trimmedText)
            const trailingSpaces = selectedText.length - trimmedText.length - leadingSpaces
            
            // Adjust selection to exclude spaces
            textarea.selectionStart = start + leadingSpaces
            textarea.selectionEnd = end - trailingSpaces
          }
        }, 0)
      }
    }

    document.addEventListener('mousedown', handleToolbarClick, true)
    return () => document.removeEventListener('mousedown', handleToolbarClick, true)
  }, [mounted])

  if (!mounted) {
    return (
      <div className="min-h-[500px] rounded-md border bg-muted/30 p-4 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando editor...</p>
      </div>
    )
  }

  return (
    <div data-color-mode="dark" className="wysiwyg-editor-container">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        preview="live"
        height={700}
        visibleDragbar={false}
        highlightEnable={false}
        textareaProps={{
          placeholder: placeholder || "Escribe tu contenido aquí...",
        }}
        previewOptions={{
          className: "prose prose-sm dark:prose-invert max-w-none",
          remarkPlugins: [],
          rehypePlugins: [],
          components: {
            p: ({ children }) => <p style={{ marginBottom: '1em' }}>{children}</p>,
          },
        }}
      />
    </div>
  )
}
