import { getServiceClient } from "@/lib/supabase/server"
import type { Popover } from "@/types/popover"

export async function listPopovers(): Promise<Popover[]> {
  const sb = getServiceClient()
  const { data, error } = await sb
    .from("popovers")
    .select("id, title, body, discount_code, enabled, priority, start_at, end_at, sections, paths, created_at, updated_at")
    .order("enabled", { ascending: false })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as Popover[]) || []
}

export async function getPopover(id: string): Promise<Popover | null> {
  const sb = getServiceClient()
  const { data, error } = await sb
    .from("popovers")
    .select("id, title, body, discount_code, enabled, priority, start_at, end_at, sections, paths, created_at, updated_at")
    .eq("id", id)
    .single()
  if (error) return null
  return data as Popover
}

export type SavePopoverInput = Partial<Popover> & { title: string }

export async function createPopover(input: SavePopoverInput): Promise<Popover> {
  const sb = getServiceClient()
  const payload = {
    title: input.title,
    body: input.body ?? null,
    discount_code: input.discount_code ?? null,
    enabled: input.enabled ?? true,
    priority: input.priority ?? 0,
    start_at: input.start_at ?? null,
    end_at: input.end_at ?? null,
    sections: input.sections ?? [],
    paths: input.paths ?? [],
  }
  const { data, error } = await sb.from("popovers").insert(payload).select("*").single()
  if (error) throw error
  return data as Popover
}

export async function updatePopover(id: string, input: Partial<SavePopoverInput>): Promise<Popover> {
  const sb = getServiceClient()
  const { data, error } = await sb
    .from("popovers")
    .update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.discount_code !== undefined ? { discount_code: input.discount_code } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.start_at !== undefined ? { start_at: input.start_at } : {}),
      ...(input.end_at !== undefined ? { end_at: input.end_at } : {}),
      ...(input.sections !== undefined ? { sections: input.sections } : {}),
      ...(input.paths !== undefined ? { paths: input.paths } : {}),
    })
    .eq("id", id)
    .select("*")
    .single()
  if (error) throw error
  return data as Popover
}

export async function deletePopover(id: string): Promise<void> {
  const sb = getServiceClient()
  const { error } = await sb.from("popovers").delete().eq("id", id)
  if (error) throw error
}

export async function getActivePopoverFor(pathname: string, section?: string | null): Promise<Popover | null> {
  const sb = getServiceClient()
  const now = new Date().toISOString()
  // Fetch enabled candidates and filter in JS for time window and prefix matching on paths
  const { data, error } = await sb
    .from("popovers")
    .select("*")
    .eq("enabled", true)
    .order("priority", { ascending: false })
  if (error) throw error
  const list = (data as Popover[]) || []
  const matches = list.filter((p) => {
    // time window
    const okTime = (!p.start_at || p.start_at <= now) && (!p.end_at || p.end_at >= now)
    if (!okTime) return false
    const sec = (p.sections || []) as string[]
    const pat = (p.paths || []) as string[]
    const secOk = !section || sec.length === 0 || sec.includes(section)
    const pathOk = pat.length === 0 || pat.some((prefix) => pathname.startsWith(prefix))
    return secOk && pathOk
  })
  return matches[0] ?? null
}
