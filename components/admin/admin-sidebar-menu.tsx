"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Boxes, FileText, Mail, Sparkles, BadgePercent, MessageCircle, BarChart2, HandCoins, Users, Factory, Wallet } from "lucide-react"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"

export default function AdminSidebarMenu() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/")

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="font-heading">Productos & Stock</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin" legacyBehavior>
                <SidebarMenuButton asChild isActive={isActive("/admin")} variant="outline" className="font-body hover:bg-accent hover:text-accent-foreground">
                  <a className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Dashboard</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/products" legacyBehavior>
                <SidebarMenuButton asChild isActive={isActive("/admin/products")} variant="outline" className="font-body hover:bg-accent hover:text-accent-foreground">
                  <a className="flex items-center gap-2"><Package className="h-4 w-4" /> Productos</a>
                </SidebarMenuButton>
              </Link>
              <SidebarMenuSub>
                <li>
                  <Link href="/admin/products/new" legacyBehavior>
                    <SidebarMenuSubButton asChild className="font-body hover:bg-accent hover:text-accent-foreground">
                      <a className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Nuevos</a>
                    </SidebarMenuSubButton>
                  </Link>
                </li>
              </SidebarMenuSub>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/stock" legacyBehavior>
                <SidebarMenuButton asChild isActive={isActive("/admin/stock")} variant="outline" className="font-body hover:bg-accent hover:text-accent-foreground">
                  <a className="flex items-center gap-2"><Boxes className="h-4 w-4" /> Stock</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="font-heading">Marketing & Contenido</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin/blog" legacyBehavior>
                <SidebarMenuButton asChild isActive={isActive("/admin/blog")} variant="outline" className="font-body hover:bg-accent hover:text-accent-foreground">
                  <a className="flex items-center gap-2"><FileText className="h-4 w-4" /> Blog</a>
                </SidebarMenuButton>
              </Link>
              <SidebarMenuSub>
                <li>
                  <Link href="/admin/blog/new" legacyBehavior>
                    <SidebarMenuSubButton asChild className="font-body hover:bg-accent hover:text-accent-foreground">
                      <a className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Nuevo artículo</a>
                    </SidebarMenuSubButton>
                  </Link>
                </li>
              </SidebarMenuSub>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/newsletter" legacyBehavior>
                <SidebarMenuButton asChild isActive={isActive("/admin/newsletter")} variant="outline" className="font-body hover:bg-accent hover:text-accent-foreground">
                  <a className="flex items-center gap-2"><Mail className="h-4 w-4" /> Newsletter</a>
                </SidebarMenuButton>
              </Link>
              <SidebarMenuSub>
                <li>
                  <Link href="/admin/newsletter/campaigns" legacyBehavior>
                    <SidebarMenuSubButton asChild className="font-body hover:bg-accent hover:text-accent-foreground">
                      <a className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Campañas</a>
                    </SidebarMenuSubButton>
                  </Link>
                </li>
              </SidebarMenuSub>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/popovers" legacyBehavior>
                <SidebarMenuButton asChild isActive={isActive("/admin/popovers")} variant="outline" className="font-body hover:bg-accent hover:text-accent-foreground">
                  <a className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Popovers</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/coupons" legacyBehavior>
                <SidebarMenuButton asChild isActive={isActive("/admin/coupons")} variant="outline" className="font-body hover:bg-accent hover:text-accent-foreground">
                  <a className="flex items-center gap-2"><BadgePercent className="h-4 w-4" /> Cupones</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="font-heading">Ventas & Clientes</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin/analytics" legacyBehavior>
                <SidebarMenuButton asChild isActive={isActive("/admin/analytics")} variant="outline" className="font-body hover:bg-accent hover:text-accent-foreground">
                  <a className="flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Inteligencia comercial</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/sales/manual" legacyBehavior>
                <SidebarMenuButton asChild isActive={isActive("/admin/sales/manual")} variant="outline" className="font-body hover:bg-accent hover:text-accent-foreground">
                  <a className="flex items-center gap-2"><HandCoins className="h-4 w-4" /> Ventas manuales</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/customers/ranking" legacyBehavior>
                <SidebarMenuButton asChild isActive={isActive("/admin/customers/ranking")} variant="outline" className="font-body hover:bg-accent hover:text-accent-foreground">
                  <a className="flex items-center gap-2"><Users className="h-4 w-4" /> Ranking de clientes</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="font-heading">Operación</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin/suppliers" legacyBehavior>
                <SidebarMenuButton asChild isActive={isActive("/admin/suppliers")} variant="outline" className="font-body hover:bg-accent hover:text-accent-foreground">
                  <a className="flex items-center gap-2"><Factory className="h-4 w-4" /> Proveedores</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/expenses" legacyBehavior>
                <SidebarMenuButton asChild isActive={isActive("/admin/expenses")} variant="outline" className="font-body hover:bg-accent hover:text-accent-foreground">
                  <a className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Gastos</a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
