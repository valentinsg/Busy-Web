"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewCouponPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [percent, setPercent] = useState<number>(10)
  const [active, setActive] = useState(true)
  const [maxUses, setMaxUses] = useState<string>("")
  const [expiresAt, setExpiresAt] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-2">Nuevo cupón</h2>
          <p className="font-body text-muted-foreground">Completa los campos para crear un cupón en la base de datos.</p>
        </div>
        <Link href="/admin/coupons" className="text-sm text-muted-foreground hover:underline">Volver</Link>
      </section>

      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setSaving(true)
          setMessage(null)
          try {
            const res = await fetch("/api/admin/coupons", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: code.trim().toUpperCase(),
                percent: Number(percent),
                active,
                max_uses: maxUses ? Number(maxUses) : null,
                expires_at: expiresAt || null,
              }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Error al crear el cupón")
            // Clear all fields
            setCode("")
            setPercent(10)
            setActive(true)
            setMaxUses("")
            setExpiresAt("")
            setMessage("Cupón creado correctamente. Redirigiendo...")
            setRedirecting(true)
            setTimeout(() => router.push("/admin/coupons"), 800)
          } catch (err: any) {
            setMessage(err.message)
          } finally {
            setSaving(false)
          }
        }}
        className="rounded-lg border bg-background p-4 space-y-4"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm">Código</label>
            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="BUSY10" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Porcentaje</label>
            <input type="number" min={1} max={100} className="rounded-md border bg-background px-3 py-2 text-sm" value={percent} onChange={(e) => setPercent(Number(e.target.value))} />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Activo
          </label>
          <div className="grid gap-2">
            <label className="text-sm">Máx. usos (opcional)</label>
            <input type="number" min={1} className="rounded-md border bg-background px-3 py-2 text-sm" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label className="text-sm">Expira (opcional)</label>
            <input type="date" className="rounded-md border bg-background px-3 py-2 text-sm" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
          </div>
        </div>
        <button disabled={saving || redirecting} className="rounded-md border bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90 disabled:opacity-60">
          {redirecting ? "Redirigiendo..." : saving ? "Guardando..." : "Crear cupón"}
        </button>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </form>
    </div>
  )
}

