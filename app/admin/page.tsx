import Link from "next/link"
import dynamic from "next/dynamic"
import TopProducts from "@/components/admin/top-products"
import LatestBlogCard from "@/components/admin/latest-blog"
import { FadeIn } from "@/components/ui/fade-in"

const DashboardCards = dynamic(() => import("@/components/admin/dashboard-cards"), { ssr: false })

export default function AdminHomePage() {
  return (
    <div className="space-y-6 sm:space-y-8 font-body">
      <FadeIn>
        <header className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          <div className="flex-1">
            <h2 className="font-heading text-xl sm:text-2xl font-semibold">Panel</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Visión general del negocio y accesos rápidos.</p>
          </div>
          <div className="sm:ml-auto">
            <Link href="/" className="inline-block rounded-md border px-3 py-2 text-xs sm:text-sm hover:bg-accent transition-colors">Ver tienda</Link>
          </div>
        </header>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section>
          <DashboardCards variant="full" showControls={true} />
        </section>
      </FadeIn>

      <FadeIn delay={0.2}>
        <section>
          <h3 className="font-heading text-base sm:text-lg mb-3">Accesos rápidos</h3>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <Link href="/admin/products/new" className="rounded-md border p-2.5 sm:p-3 hover:bg-accent transition-colors text-xs sm:text-sm text-center">+ Nuevo producto</Link>
            <Link href="/admin/blog/new" className="rounded-md border p-2.5 sm:p-3 hover:bg-accent transition-colors text-xs sm:text-sm text-center">+ Nuevo artículo</Link>
            <Link href="/admin/newsletter/campaigns/new" className="rounded-md border p-2.5 sm:p-3 hover:bg-accent transition-colors text-xs sm:text-sm text-center">+ Nueva campaña</Link>
            <Link href="/admin/analytics" className="rounded-md border p-2.5 sm:p-3 hover:bg-accent transition-colors text-xs sm:text-sm text-center">Ver analíticas</Link>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.3}>
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <TopProducts limit={5} />
            <LatestBlogCard />
          </div>
        </section>
      </FadeIn>

    </div>
  )
}
