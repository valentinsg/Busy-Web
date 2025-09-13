"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function MarkdownPreview({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content || "Escribe contenido en el editor de la izquierda para ver la vista previa aquí."}
    </ReactMarkdown>
  )
}
