"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

export default function ModalShell({ title, children }: { title?: string; children: React.ReactNode }) {
  const router = useRouter()
  const dialogRef = React.useRef<HTMLDivElement | null>(null)
  const openedAtRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    openedAtRef.current = performance.now()
    return () => prev?.focus()
  }, [])

  return (
    <div
      id="admin-modal-root"
      aria-hidden={false}
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/40"
      onClick={() => {
        const now = performance.now()
        if (openedAtRef.current) {
          // eslint-disable-next-line no-console
          console.log("[Admin][Modal] Close (backdrop)", { msSinceOpen: Math.round(now - openedAtRef.current) })
        }
        router.back()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Modal"}
        ref={dialogRef}
        tabIndex={-1}
        className="m-2 md:m-6 w-full md:max-w-2xl rounded-lg border bg-background shadow-2xl outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="font-heading font-medium text-sm">{title}</div>
          <button
            onClick={() => {
              const now = performance.now()
              if (openedAtRef.current) {
                // eslint-disable-next-line no-console
                console.log("[Admin][Modal] Close (button)", { msSinceOpen: Math.round(now - openedAtRef.current) })
              }
              router.back()
            }}
            className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
            aria-label="Cerrar"
          >
            Cerrar
          </button>
        </div>
        <div className="p-4 max-h-[80vh] overflow-auto">{children}</div>
      </div>
    </div>
  )
}
