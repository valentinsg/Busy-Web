import Link from "next/link"
import dynamic from "next/dynamic"

const DashboardCards = dynamic(() => import("@/components/admin/dashboard-cards"), { ssr: false })

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <h2 className="font-heading text-xl font-semibold">Panel</h2>
            <p className="font-body text-muted-foreground">Gestión de productos, stock, media, newsletter, blog y más.</p>
          </div>
          <div className="ml-auto w-full lg:w-auto">
            <DashboardCards variant="compact" showControls={false} />
          </div>
        </div>
      </section>
      {/* Secciones colapsables para reducir ruido visual */}
      <details className="rounded-lg border p-4" open>
        <summary className="font-heading font-medium cursor-pointer select-none">Productos & Stock</summary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <Link href="/admin/products" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
            <h3 className="font-heading font-medium mb-1">Productos</h3>
            <p className="font-body text-sm text-muted-foreground">Crear, editar, eliminar.</p>
          </Link>
          <Link href="/admin/stock" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
            <h3 className="font-heading font-medium mb-1">Stock por talle</h3>
            <p className="font-body text-sm text-muted-foreground">Actualizar disponibilidad por talle.</p>
          </Link>
          <Link href="/admin/media" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
            <h3 className="font-heading font-medium mb-1">Media</h3>
            <p className="font-body text-sm text-muted-foreground">Subir imágenes y videos.</p>
          </Link>
        </div>
      </details>

      <details className="rounded-lg border p-4">
        <summary className="font-heading font-medium cursor-pointer select-none">Marketing & Contenido</summary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <Link href="/admin/blog" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
            <h3 className="font-heading font-medium mb-1">Blog</h3>
            <p className="font-body text-sm text-muted-foreground">Ver y crear artículos.</p>
          </Link>
          <Link href="/admin/newsletter" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
            <h3 className="font-heading font-medium mb-1">Newsletter</h3>
            <p className="font-body text-sm text-muted-foreground">Listas, etiquetas y envíos.</p>
          </Link>
          <Link href="/admin/newsletter/campaigns" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
            <h3 className="font-heading font-medium mb-1">Campañas</h3>
            <p className="font-body text-sm text-muted-foreground">Crear y gestionar campañas.</p>
          </Link>
          <Link href="/admin/coupons" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
            <h3 className="font-heading font-medium mb-1">Cupones</h3>
            <p className="font-body text-sm text-muted-foreground">Crear y validar cupones.</p>
          </Link>
        </div>
      </details>

      <details className="rounded-lg border p-4">
        <summary className="font-heading font-medium cursor-pointer select-none">Ventas & Clientes</summary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <Link href="/admin/analytics" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
            <h3 className="font-heading font-medium mb-1">Inteligencia comercial</h3>
            <p className="font-body text-sm text-muted-foreground">KPIs, series y canales.</p>
          </Link>
          <Link href="/admin/sales/manual" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
            <h3 className="font-heading font-medium mb-1">Ventas: Manual</h3>
            <p className="font-body text-sm text-muted-foreground">Registrar ventas fuera de la web.</p>
          </Link>
          <Link href="/admin/customers/ranking" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
            <h3 className="font-heading font-medium mb-1">Clientes: Ranking</h3>
            <p className="font-body text-sm text-muted-foreground">TOP por gasto, frecuencia o recencia.</p>
          </Link>
        </div>
      </details>

      <details className="rounded-lg border p-4">
        <summary className="font-heading font-medium cursor-pointer select-none">Operación</summary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <Link href="/admin/suppliers" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
            <h3 className="font-heading font-medium mb-1">Proveedores</h3>
            <p className="font-body text-sm text-muted-foreground">Listado y altas de proveedores.</p>
          </Link>
          <Link href="/admin/expenses" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
            <h3 className="font-heading font-medium mb-1">Gastos</h3>
            <p className="font-body text-sm text-muted-foreground">Registrar y ver gastos.</p>
          </Link>
        </div>
      </details>

      <details className="rounded-lg border p-4">
        <summary className="font-heading font-medium cursor-pointer select-none">Atajos</summary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <Link href="/admin/new" className="rounded-lg border bg-muted/10 p-4 transition-colors hover:bg-accent hover:text-accent-foreground block">
            <h3 className="font-heading font-medium mb-1">Nuevo</h3>
            <p className="font-body text-sm text-muted-foreground">Atajos rápidos para crear.</p>
          </Link>
        </div>
      </details>
    </div>
  )
}

