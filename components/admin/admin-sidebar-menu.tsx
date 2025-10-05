"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Boxes,
  FileText,
  Mail,
  Plus,
  BadgePercent,
  MessageCircle,
  BarChart2,
  HandCoins,
  Users,
  Factory,
  Wallet,
  Clock,
  Music2,
  ChevronRight,
  ShoppingBag,
  Megaphone,
  DollarSign,
  Settings
} from "lucide-react"
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
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState, useEffect } from "react"

export default function AdminSidebarMenu({ allSectionsOpen }: { allSectionsOpen: boolean }) {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/")

  // Estado para controlar qué secciones están abiertas
  const [openSections, setOpenSections] = useState({
    products: true,
    marketing: true,
    sales: true,
    operations: true,
  })

  // Sincronizar con el prop allSectionsOpen
  useEffect(() => {
    setOpenSections({
      products: allSectionsOpen,
      marketing: allSectionsOpen,
      sales: allSectionsOpen,
      operations: allSectionsOpen,
    })
  }, [allSectionsOpen])

  return (
    <>
      {/* Background con overlay que se extiende con el contenido */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'url(/product-bg.jpg)',
        backgroundSize: '400px',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
      }}>
        <div className="absolute inset-0 bg-black/90" />
      </div>

      <SidebarContent className="gap-0 py-2 relative">
      <div className="relative z-10">
      {/* Dashboard - siempre visible */}
      <SidebarGroup className="py-0">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin" legacyBehavior>
                <SidebarMenuButton asChild isActive={pathname === "/admin"} className="font-heading hover:bg-accent hover:text-accent-foreground h-10">
                  <a className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
                    <LayoutDashboard className="h-5 w-5 group-data-[collapsible=icon]:mx-auto" />
                    <span className="font-semibold text-[15px] uppercase tracking-wide group-data-[collapsible=icon]:hidden">Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Separador */}
      <div className="h-px bg-border/40 mx-3 my-3" />

      {/* Productos & Stock */}
      <SidebarGroup className="py-0">
        <Collapsible
          open={openSections.products}
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, products: open }))}
        >
          <SidebarGroupLabel className="font-heading flex items-center justify-between cursor-pointer group h-10" asChild>
            <CollapsibleTrigger className="w-full flex items-center gap-3 hover:bg-accent/50 rounded-md px-3 py-2 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <ShoppingBag className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 group-data-[collapsible=icon]:mx-auto" />
              <span className="flex-1 text-left font-semibold text-[15px] uppercase tracking-wide group-data-[collapsible=icon]:hidden">Inventario</span>
              <ChevronRight className={`h-4 w-4 transition-transform duration-300 group-data-[collapsible=icon]:hidden ${openSections.products ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
            <SidebarGroupContent className="pl-2 pt-1">
              <SidebarMenu className="gap-1.5">
                <Collapsible>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isActive("/admin/products")} className="font-body hover:bg-accent hover:text-accent-foreground">
                        <Package className="h-4 w-4" />
                        <span>Productos</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                      <SidebarMenuSub className="gap-1 ml-0 mt-1 mb-1 border-l border-border/30 pl-3">
                        <SidebarMenuSubItem>
                          <Link href="/admin/products" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-accent hover:text-accent-foreground">
                              <a className="flex items-center gap-2">
                                <Package className="h-3.5 w-3.5" /> Ver todos
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/products/new" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-accent hover:text-accent-foreground">
                              <a className="flex items-center gap-2">
                                <Plus className="h-3.5 w-3.5" /> Crear nuevo
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem>
                  <Link href="/admin/stock" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/stock")} className="font-body hover:bg-accent hover:text-accent-foreground">
                      <a className="flex items-center gap-2">
                        <Boxes className="h-4 w-4" /> Stock
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>

      {/* Separador */}
      <div className="h-px bg-border/40 mx-3 my-3" />

      {/* Marketing & Contenido */}
      <SidebarGroup className="py-0">
        <Collapsible
          open={openSections.marketing}
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, marketing: open }))}
        >
          <SidebarGroupLabel className="font-heading flex items-center justify-between cursor-pointer group h-10" asChild>
            <CollapsibleTrigger className="w-full flex items-center gap-3 hover:bg-accent/50 rounded-md px-3 py-2 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <Megaphone className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 group-data-[collapsible=icon]:mx-auto" />
              <span className="flex-1 text-left font-semibold text-[15px] uppercase tracking-wide group-data-[collapsible=icon]:hidden">Marketing</span>
              <ChevronRight className={`h-4 w-4 transition-transform duration-300 group-data-[collapsible=icon]:hidden ${openSections.marketing ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
            <SidebarGroupContent className="pl-2 pt-1">
              <SidebarMenu className="gap-1.5">
                <Collapsible>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isActive("/admin/blog")} className="font-body hover:bg-accent hover:text-accent-foreground transition-all duration-200">
                        <FileText className="h-4 w-4" />
                        <span>Blog</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                      <SidebarMenuSub className="gap-1 ml-2 mt-1 mb-1 border-l border-border/30 pl-2">
                        <SidebarMenuSubItem>
                          <Link href="/admin/blog" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-accent hover:text-accent-foreground">
                              <a className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5" /> Ver artículos
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/blog/new" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-accent hover:text-accent-foreground">
                              <a className="flex items-center gap-2">
                                <Plus className="h-3.5 w-3.5" /> Nuevo artículo
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <Collapsible>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isActive("/admin/playlists") || isActive("/admin/artist-submissions")} className="font-body hover:bg-accent hover:text-accent-foreground">
                        <Music2 className="h-4 w-4" />
                        <span>Playlists</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                      <SidebarMenuSub className="gap-1 ml-0 mt-1 mb-1 border-l border-border/30 pl-3">
                        <SidebarMenuSubItem>
                          <Link href="/admin/playlists" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-accent hover:text-accent-foreground">
                              <a className="flex items-center gap-2">
                                <Music2 className="h-3.5 w-3.5" /> Ver playlists
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/playlists/new" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-accent hover:text-accent-foreground">
                              <a className="flex items-center gap-2">
                                <Plus className="h-3.5 w-3.5" /> Nueva playlist
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/artist-submissions" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-accent hover:text-accent-foreground">
                              <a className="flex items-center gap-2">
                                <Users className="h-3.5 w-3.5" /> Propuestas de artistas
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <Collapsible>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isActive("/admin/newsletter")} className="font-body hover:bg-accent hover:text-accent-foreground">
                        <Mail className="h-4 w-4" />
                        <span>Newsletter</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                      <SidebarMenuSub className="gap-1 ml-0 mt-1 mb-1 border-l border-border/30 pl-3">
                        <SidebarMenuSubItem>
                          <Link href="/admin/newsletter" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-accent hover:text-accent-foreground">
                              <a className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5" /> Suscriptores
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/newsletter/campaigns" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-accent hover:text-accent-foreground">
                              <a className="flex items-center gap-2">
                                <Plus className="h-3.5 w-3.5" /> Campañas
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem>
                  <Link href="/admin/popovers" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/popovers")} className="font-body hover:bg-accent hover:text-accent-foreground">
                      <a className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" /> Popovers
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/admin/coupons" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/coupons")} className="font-body hover:bg-accent hover:text-accent-foreground">
                      <a className="flex items-center gap-2">
                        <BadgePercent className="h-4 w-4" /> Cupones
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>

      {/* Separador */}
      <div className="h-px bg-border/40 mx-3 my-3" />

      {/* Ventas & Clientes */}
      <SidebarGroup className="py-0">
        <Collapsible
          open={openSections.sales}
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, sales: open }))}
        >
          <SidebarGroupLabel className="font-heading flex items-center justify-between cursor-pointer group h-10" asChild>
            <CollapsibleTrigger className="w-full flex items-center gap-3 hover:bg-accent/50 rounded-md px-3 py-2 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <DollarSign className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 group-data-[collapsible=icon]:mx-auto" />
              <span className="flex-1 text-left font-semibold text-[15px] uppercase tracking-wide group-data-[collapsible=icon]:hidden">Ventas</span>
              <ChevronRight className={`h-4 w-4 transition-transform duration-300 group-data-[collapsible=icon]:hidden ${openSections.sales ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
            <SidebarGroupContent className="pl-2 pt-1">
              <SidebarMenu className="gap-1.5">
                <SidebarMenuItem>
                  <Link href="/admin/analytics" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/analytics")} className="font-body hover:bg-accent hover:text-accent-foreground">
                      <a className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" /> Inteligencia comercial
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/admin/orders/pending" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/orders/pending")} className="font-body hover:bg-accent hover:text-accent-foreground">
                      <a className="flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Transferencias pendientes
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/admin/sales/manual" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/sales/manual")} className="font-body hover:bg-accent hover:text-accent-foreground">
                      <a className="flex items-center gap-2">
                        <HandCoins className="h-4 w-4" /> Ventas manuales
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/admin/customers/ranking" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/customers/ranking")} className="font-body hover:bg-accent hover:text-accent-foreground">
                      <a className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> Ranking de clientes
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>

      {/* Separador */}
      <div className="h-px bg-border/40 mx-3 my-3" />

      {/* Operación */}
      <SidebarGroup className="py-0">
        <Collapsible
          open={openSections.operations}
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, operations: open }))}
        >
          <SidebarGroupLabel className="font-heading flex items-center justify-between cursor-pointer group h-10" asChild>
            <CollapsibleTrigger className="w-full flex items-center gap-3 hover:bg-accent/50 rounded-md px-3 py-2 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <Settings className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 group-data-[collapsible=icon]:mx-auto" />
              <span className="flex-1 text-left font-semibold text-[15px] uppercase tracking-wide group-data-[collapsible=icon]:hidden">Operaciones</span>
              <ChevronRight className={`h-4 w-4 transition-transform duration-300 group-data-[collapsible=icon]:hidden ${openSections.operations ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
            <SidebarGroupContent className="pl-2 pt-1">
              <SidebarMenu className="gap-1.5">
                <SidebarMenuItem>
                  <Link href="/admin/suppliers" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/suppliers")} className="font-body hover:bg-accent hover:text-accent-foreground">
                      <a className="flex items-center gap-2">
                        <Factory className="h-4 w-4" /> Proveedores
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/admin/expenses" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/expenses")} className="font-body hover:bg-accent hover:text-accent-foreground">
                      <a className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" /> Gastos
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>
      </div>
      </SidebarContent>
    </>
  )
}
