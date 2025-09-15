"use client"

import { useEffect, useMemo, useState } from "react"

export default function RatingStars() {
  const [rating, setRating] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [sent, setSent] = useState(false)
  const [avg, setAvg] = useState<number | null>(null)
  const [count, setCount] = useState<number>(0)
  const slug = useMemo(() => typeof window !== "undefined" ? window.location.pathname.split("/").pop() || "" : "", [])

  async function load() {
    try {
      const res = await fetch(`/api/blog/ratings?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setAvg(typeof data.avg === "number" ? data.avg : null)
      setCount(typeof data.count === "number" ? data.count : 0)
    } catch {}
  }

  useEffect(() => {
    if (slug) void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  async function submit(value: number) {
    try {
      setRating(value)
      const res = await fetch(`/api/blog/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, rating: value }),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
        setAvg(data.avg ?? null)
        setCount(data.count ?? 0)
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="text-center my-8">
      <h4 className="font-heading text-xl mb-2">¿De cuánta utilidad te ha parecido este contenido?</h4>
      <p className="text-sm text-muted-foreground mb-3">¡Haz clic en una estrella para puntuar!</p>
      <div className="inline-flex gap-2">
        {[1,2,3,4,5].map((i) => (
          <button
            key={i}
            aria-label={`Puntuar ${i}`}
            title={`Puntuar ${i}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onClick={() => submit(i)}
            className="text-3xl leading-none"
          >
            <span className={(hover ?? rating ?? 0) >= i ? "text-yellow-500" : "text-muted-foreground"}>★</span>
          </button>
        ))}
      </div>
      <div className="text-sm text-muted-foreground mt-2">
        {avg ? `Promedio: ${avg.toFixed(1)} (${count})` : count ? `(${count})` : ""}
      </div>
      {sent && <div className="text-sm text-muted-foreground mt-1">¡Gracias por tu voto!</div>}
    </div>
  )
}
