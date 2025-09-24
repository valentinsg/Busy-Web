"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface CommentItem { id: string; name: string; message: string; created_at: string }

export default function CommentsForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [comment, setComment] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<CommentItem[]>([])
  const slug = useMemo(() => typeof window !== "undefined" ? window.location.pathname.split("/").pop() || "" : "", [])

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/blog/comments?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setList(Array.isArray(data?.items) ? data.items : [])
    } catch {}
  }, [slug])

  useEffect(() => { if (slug) void load() }, [slug, load])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSent(false)
    try {
      const res = await fetch(`/api/blog/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, email, message: comment }),
      })
      if (res.ok) {
        setSent(true)
        setName("")
        setEmail("")
        setComment("")
        await load()
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10">
      <h3 className="font-heading text-2xl font-semibold mb-4">Deja un comentario</h3>
      <form onSubmit={onSubmit} className="grid gap-3">
        <Textarea required placeholder="Escribe tu comentario" value={comment} onChange={(e) => setComment(e.target.value)} className="font-body min-h-[120px]" />
        <div className="grid md:grid-cols-2 gap-3">
          <Input required placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className="font-body" />
          <Input required type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="font-body" />
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Publicando…" : "Publicar comentario"}</Button>
        {sent && <p className="text-sm text-muted-foreground">Gracias por comentar. Moderaremos tu mensaje pronto.</p>}
      </form>

      {list.length > 0 && (
        <div className="mt-8">
          <h4 className="font-heading text-lg font-semibold mb-2">Comentarios</h4>
          <ul className="space-y-4">
            {list.map((c) => (
              <li key={c.id} className="rounded-md border p-3 bg-muted/20">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{c.message}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
