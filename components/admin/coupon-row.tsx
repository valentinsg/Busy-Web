"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

type Coupon = {
  code: string
  percent: number
  active: boolean
  max_uses: number | null
  used_count: number
  expires_at: string | null
}

export default function CouponRow({ coupon }: { coupon: Coupon }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [local, setLocal] = useState(coupon)
  const [busy, setBusy] = useState(false)

  async function toggleActive() {
    setBusy(true)
    try {
      await fetch(`/api/admin/coupons/${encodeURIComponent(local.code)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !local.active }),
      })
      setLocal({ ...local, active: !local.active })
      startTransition(() => router.refresh())
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm(`Eliminar cupón ${local.code}?`)) return
    setBusy(true)
    try {
      await fetch(`/api/admin/coupons/${encodeURIComponent(local.code)}`, { method: "DELETE" })
      startTransition(() => router.refresh())
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`p-4 flex items-center justify-between ${busy || pending ? "opacity-70" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="font-heading font-medium tracking-wide">{local.code}</div>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border ${local.active ? "bg-green-500/10 text-green-400 border-green-600/40" : "bg-red-500/10 text-red-400 border-red-600/40"}`}>
          {local.active ? "Activo" : "Inactivo"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-xs text-muted-foreground hidden sm:block">
          {local.percent}%
          {typeof local.max_uses === "number" ? ` · ${local.used_count}/${local.max_uses}` : ""}
          {local.expires_at ? ` · vence: ${new Date(local.expires_at as any).toLocaleDateString()}` : ""}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                disabled={busy || pending}
                onClick={toggleActive}
                className={`rounded-md border px-2 py-1 text-xs transition ${local.active ? "hover:bg-yellow-500/20" : "hover:bg-emerald-500/20"}`}
              >
                {local.active ? "Desactivar" : "Activar"}
              </button>
            </TooltipTrigger>
            <TooltipContent>{local.active ? "El cupón dejará de poder usarse" : "El cupón quedará habilitado"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button disabled={busy || pending} className="rounded-md border px-2 py-1 text-xs hover:bg-destructive/20">Borrar</button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar cupón {local.code}?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={remove}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
