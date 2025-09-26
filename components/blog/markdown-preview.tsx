"use client"

import React from "react"

export default function MarkdownPreview({ content }: { content: string }) {
  const [MD, setMD] = React.useState<null | {
    Component: React.ComponentType<any>
    remark: any[]
    rehype: any[]
  }>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [{ default: ReactMarkdown }, { default: remarkGfm }, { default: remarkBreaks }, { default: rehypeRaw }] = await Promise.all([
          import("react-markdown"),
          import("remark-gfm"),
          import("remark-breaks"),
          import("rehype-raw"),
        ])
        if (!cancelled) setMD({ Component: ReactMarkdown as any, remark: [remarkGfm, remarkBreaks], rehype: [rehypeRaw] })
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      }
    })()
    return () => { cancelled = true }
  }, [])

  const prepared = content || ""

  if (!MD || error) {
    return (
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-body">
          {prepared || "Escribe contenido en el editor de la izquierda para ver la vista previa aquí."}
        </pre>
        {error && <div className="text-xs text-red-500 mt-2">Vista previa simple (fallback) por un problema al cargar el renderizador de Markdown.</div>}
      </div>
    )
  }

  const { Component, remark, rehype } = MD
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:my-5 prose-li:my-2 prose-headings:font-heading prose-p:font-body prose-li:font-body prose-a:text-accent-brand prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-accent-brand prose-blockquote:bg-muted prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-th:border prose-td:border prose-table:border prose-table:rounded-md">
      <Component remarkPlugins={remark} rehypePlugins={rehype}>
        {prepared || "Escribe contenido en el editor de la izquierda para ver la vista previa aquí."}
      </Component>
    </div>
  )
}
