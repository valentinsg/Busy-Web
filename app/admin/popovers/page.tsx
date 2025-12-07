import { DeletePopoverButton } from "@/components/admin/delete-popover-button"
import { getServiceClient } from "@/lib/supabase/server"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminPopoversPage() {
  const sb = getServiceClient()
  const { data, error } = await sb
    .from("popovers")
    .select("id, title, enabled, priority, start_at, end_at, sections, paths, discount_code, updated_at")
    .order("enabled", { ascending: false })
    .order("priority", { ascending: false })
    .order("updated_at", { ascending: false })

  const items = data ?? []

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-2">Popups</h2>
          <p className="font-body text-muted-foreground">Configurar popups de descuento por tiempo y sección/ruta.</p>
        </div>
        <Link href="/admin/popovers/new" className="rounded-md border bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90">
          Nuevo popup
        </Link>
      </section>

      <div className="rounded-lg border bg-muted/10 divide-y">
        {error && (
          <div className="p-4 text-sm text-muted-foreground">Error cargando popups: {error.message}</div>
        )}
        {!error && items.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">No hay popups todavía.</div>
        )}
        {items.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs border ${p.enabled ? 'bg-green-500/10 border-green-500/30 text-green-600' : 'bg-muted border-muted-foreground/20 text-muted-foreground'}`}>{p.enabled ? 'Activo' : 'Inactivo'}</span>
                <span className="text-xs text-muted-foreground">Prioridad {p.priority}</span>
              </div>
              <h3 className="font-heading font-medium truncate">{p.title}</h3>
              <p className="text-xs text-muted-foreground truncate">{p.discount_code ? `Código: ${p.discount_code}` : 'Sin código'}</p>
              <p className="text-xs text-muted-foreground truncate">Ventana: {p.start_at || '—'} → {p.end_at || '—'}</p>
              <p className="text-xs text-muted-foreground truncate">Secciones: {(p.sections || []).join(', ') || 'Todas'}</p>
              <p className="text-xs text-muted-foreground truncate">Rutas: {(p.paths || []).join(', ') || 'Todas'}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/popovers/new?id=${p.id}`} className="text-sm underline text-muted-foreground hover:text-foreground">Editar</Link>
              <DeletePopoverButton id={p.id} title={p.title} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
