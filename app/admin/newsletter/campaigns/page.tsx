import Link from "next/link"
import { getServiceClient } from "@/lib/supabase/server"
import AdminSearchBar from "@/components/admin/search-bar"
import AdminPagination from "@/components/admin/pagination"

export const dynamic = "force-dynamic"

export default async function CampaignsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const sb = getServiceClient()
  const q = (typeof searchParams.q === "string" ? searchParams.q : "").trim()
  const page = Math.max(1, Number(typeof searchParams.page === "string" ? searchParams.page : 1))
  const pageSize = 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = sb
    .from("newsletter_campaigns")
    .select("id, name, subject, status, scheduled_at, created_at, sent_count", { count: "exact" })

  if (q) query = query.or(`name.ilike.%${q}%,subject.ilike.%${q}%`)

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to)
  const campaigns = data ?? []
  const totalPages = Math.max(1, Math.ceil((count ?? campaigns.length) / pageSize))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-semibold">Campañas</h2>
        <Link href="/admin/newsletter/campaigns/new" className="rounded-md border bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90">Nueva campaña</Link>
      </div>

      <div className="flex items-center justify-between gap-3">
        <AdminSearchBar placeholder="Buscar por nombre o asunto..." />
        <AdminPagination page={page} totalPages={totalPages} />
      </div>

      <div className="rounded-lg border bg-muted/10 divide-y">
        {error && <div className="p-4 text-sm text-muted-foreground">Error: {error.message}</div>}
        {!error && campaigns.length === 0 && <div className="p-4 text-sm text-muted-foreground">No hay campañas aún.</div>}
        {campaigns.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-heading font-medium truncate max-w-[48ch]" title={c.name}>{c.name}</div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border ${c.status === 'sent' ? 'bg-green-500/10 text-green-400 border-green-600/40' : c.status === 'scheduled' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-600/40' : c.status === 'sending' ? 'bg-blue-500/10 text-blue-400 border-blue-600/40' : c.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-600/40' : 'bg-zinc-500/10 text-zinc-300 border-zinc-600/40'}`}>
                  {c.status}
                </span>
              </div>
              <div className="text-xs text-muted-foreground truncate max-w-[80ch]">
                {c.subject} {c.scheduled_at ? `· programa: ${new Date(c.scheduled_at as string).toLocaleString()}` : ''} · creado: {new Date(c.created_at as string).toLocaleString()} · enviados: {c.sent_count}
              </div>
            </div>
            <Link href={`/admin/newsletter/campaigns/new`} className="text-xs rounded-md border px-2 py-1 hover:bg-accent hover:text-accent-foreground">
              Duplicar
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
