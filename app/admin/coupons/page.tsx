import Link from "next/link"
import { getServiceClient } from "@/lib/supabase/server"
import CouponRow from "@/components/admin/coupon-row"
import AdminSearchBar from "@/components/admin/search-bar"
import AdminPagination from "@/components/admin/pagination"

export const dynamic = "force-dynamic"

export default async function AdminCouponsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const sb = getServiceClient()
  const q = (typeof searchParams.q === "string" ? searchParams.q : "").trim()
  const page = Math.max(1, Number(typeof searchParams.page === "string" ? searchParams.page : 1))
  const pageSize = 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = sb
    .from("coupons")
    .select("code, percent, active, max_uses, used_count, expires_at", { count: "exact" })

  if (q) query = query.ilike("code", `%${q}%`)

  const { data, error, count } = await query.order("code").range(from, to)
  const coupons = data ?? []
  const totalPages = Math.max(1, Math.ceil((count ?? coupons.length) / pageSize))

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold mb-2">Cupones</h2>
          <p className="font-body text-muted-foreground">Crear y administrar códigos de descuento.</p>
        </div>
        <Link href="/admin/coupons/new" className="rounded-md border bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90">
          Nuevo cupón
        </Link>
      </section>

      <div className="flex items-center justify-between gap-3">
        <AdminSearchBar placeholder="Buscar por código..." />
        <AdminPagination page={page} totalPages={totalPages} />
      </div>

      <div className="rounded-lg border bg-muted/10 divide-y">
        {error && (
          <div className="p-4 text-sm text-muted-foreground">Error cargando cupones: {error.message}</div>
        )}
        {!error && coupons.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">No hay cupones todavía.</div>
        )}
        {coupons.map((c) => (
          <CouponRow key={c.code} coupon={c as any} />
        ))}
      </div>
    </div>
  )
}

