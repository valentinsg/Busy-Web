import Link from "next/link"
import dynamic from "next/dynamic"
import TopProducts from "@/components/admin/top-products"
import LatestBlogCard from "@/components/admin/latest-blog"

const DashboardCards = dynamic(() => import("@/components/admin/dashboard-cards"), { ssr: false })

export default function AdminHomePage() {
  return (
    <div className="space-y-8 font-body">
      <header className="flex items-end gap-4 flex-wrap">
        <div>
          <h2 className="font-heading text-2xl font-semibold">Panel</h2>
          <p className="text-muted-foreground">Visión general del negocio y accesos rápidos.</p>
        </div>
        <div className="ml-auto">
          <Link href="/" className="rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors">Ver tienda</Link>
        </div>
      </header>

      <section>
        <DashboardCards variant="full" showControls={true} />
      </section>

      <section>
        <h3 className="font-heading text-lg mb-3">Accesos rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/products/new" className="rounded-md border p-3 hover:bg-accent transition-colors text-sm">+ Nuevo producto</Link>
          <Link href="/admin/blog/new" className="rounded-md border p-3 hover:bg-accent transition-colors text-sm">+ Nuevo artículo</Link>
          <Link href="/admin/newsletter/campaigns/new" className="rounded-md border p-3 hover:bg-accent transition-colors text-sm">+ Nueva campaña</Link>
          <Link href="/admin/analytics" className="rounded-md border p-3 hover:bg-accent transition-colors text-sm">Ver analíticas</Link>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TopProducts limit={5} />
          <LatestBlogCard />
        </div>
      </section>

      <section>
        <div className="rounded-lg border p-4">
          <div className="mb-2 font-medium">Stock bajo</div>
          <div className="text-sm text-muted-foreground">Conectamos este bloque a tu fuente de stock para listar variantes por debajo del umbral.</div>
        </div>
      </section>
    </div>
  )
}
