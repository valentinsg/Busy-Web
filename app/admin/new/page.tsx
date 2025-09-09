import Link from "next/link"

export default function AdminQuickNewPage() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-heading text-xl font-semibold mb-2">Crear nuevo</h2>
        <p className="font-body text-muted-foreground">Atajos rápidos para crear contenido.</p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/products/new" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
          <h3 className="font-heading font-medium mb-1">Nuevo producto</h3>
          <p className="font-body text-sm text-muted-foreground">Crear un producto en la tienda.</p>
        </Link>
        <Link href="/admin/newsletter/campaigns/new" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
          <h3 className="font-heading font-medium mb-1">Nueva campaña</h3>
          <p className="font-body text-sm text-muted-foreground">Configurar y enviar una campaña.</p>
        </Link>
        <Link href="/admin/coupons/new" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
          <h3 className="font-heading font-medium mb-1">Nuevo cupón</h3>
          <p className="font-body text-sm text-muted-foreground">Crear un código de descuento.</p>
        </Link>
        <Link href="/admin/blog/new" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
          <h3 className="font-heading font-medium mb-1">Nuevo artículo</h3>
          <p className="font-body text-sm text-muted-foreground">Redactar una entrada del blog.</p>
        </Link>
      </div>
    </div>
  )
}
