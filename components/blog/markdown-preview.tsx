"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import rehypeRaw from "rehype-raw"

export default function MarkdownPreview({ content }: { content: string }) {
  const prepared = content || ""
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:my-5 prose-li:my-2 prose-headings:font-heading prose-p:font-body prose-li:font-body prose-a:text-accent-brand prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-accent-brand prose-blockquote:bg-muted prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-th:border prose-td:border prose-table:border prose-table:rounded-md">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
        {prepared || "Escribe contenido en el editor de la izquierda para ver la vista previa aquí."}
      </ReactMarkdown>
    </div>
  )
}
