"use client"

import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function QuickNewMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-sm text-muted-foreground hover:underline outline-none">
        Nuevo
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px]">
        <DropdownMenuItem asChild>
          <Link href="/admin/products/new">Nuevo producto</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/newsletter/campaigns/new">Nueva campaña</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/coupons/new">Nuevo cupón</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/blog/new">Nuevo artículo</Link>
        </DropdownMenuItem>
        <div className="px-2 pt-2 text-xs text-muted-foreground">
          Más atajos en <Link href="/admin/new" className="underline">/admin/new</Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
