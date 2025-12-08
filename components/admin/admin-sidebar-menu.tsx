"use client"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
    useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    BadgePercent,
    BarChart2,
    Bell,
    Boxes,
    Camera,
    ChevronRight,
    Clock,
    DollarSign,
    Factory,
    FileText,
    Film,
    HandCoins,
    HelpCircle,
    LayoutDashboard,
    List,
    Mail,
    Megaphone,
    MessageCircle,
    Music2,
    Package,
    Plus,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Tag,
    Trophy,
    Users,
    Wallet
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminSidebarMenu({ allSectionsOpen }: { allSectionsOpen: boolean }) {
  const pathname = usePathname()
  const { state, isMobile } = useSidebar()
  // En mobile nunca mostrar versión colapsada
  const isCollapsed = !isMobile && state === "collapsed"
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
      <SidebarContent className="gap-0 py-0 relative overflow-y-auto bg-black scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      <div className="relative z-10 px-2 py-3 pb-24 md:pb-6">
      {/* Dashboard - siempre visible */}
      <SidebarGroup className="py-0 px-0">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin" legacyBehavior>
                <SidebarMenuButton asChild isActive={pathname === "/admin"} className="font-heading hover:bg-white/10 hover:text-white h-11 rounded-lg transition-all duration-200">
                  <a className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
                    <LayoutDashboard className="h-5 w-5 group-data-[collapsible=icon]:mx-auto" />
                    <span className="font-semibold text-[15px] uppercase tracking-wider group-data-[collapsible=icon]:hidden">Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Separador */}
      <div className="h-px bg-white/10 mx-0 my-4" />

      {/* Productos & Stock */}
      <SidebarGroup className="py-0 px-0">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/admin/products">
                  <SidebarMenuButton className="h-10 w-10 p-0 mx-auto hover:bg-white/10 rounded-lg">
                    <ShoppingBag className="h-5 w-5" />
                  </SidebarMenuButton>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Inventario</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
        <Collapsible
          open={openSections.products}
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, products: open }))}
        >
          <SidebarGroupLabel className="font-heading flex items-center justify-between cursor-pointer group h-10" asChild>
            <CollapsibleTrigger className="w-full flex items-center gap-3 hover:bg-white/5 rounded-lg px-3 py-2.5 transition-all duration-200">
              <ShoppingBag className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              <span className="flex-1 text-left font-semibold text-[13px] uppercase tracking-wider text-white/90">Inventario</span>
              <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${openSections.products ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
            <SidebarGroupContent className="pl-0 pt-2">
              <SidebarMenu className="gap-1">
                <Collapsible>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isActive("/admin/products")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                        <Package className="h-4 w-4" />
                        <span>Productos</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                      <SidebarMenuSub className="gap-1 ml-3 mt-1.5 mb-1.5 border-l-2 border-white/10 pl-3">
                        <SidebarMenuSubItem>
                          <Link href="/admin/products" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <Package className="h-3.5 w-3.5" /> Ver todos
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/products/new" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <Plus className="h-3.5 w-3.5" /> Crear nuevo
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/categories" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <Tag className="h-3.5 w-3.5" /> Categorías
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
                    <SidebarMenuButton asChild isActive={isActive("/admin/stock")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                      <a className="flex items-center gap-2">
                        <Boxes className="h-4 w-4" /> Stock
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/admin/promotions" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/promotions")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                      <a className="flex items-center gap-2">
                        <Tag className="h-4 w-4" /> Promociones
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
        )}
      </SidebarGroup>

      {/* Separador */}
      <div className="h-px bg-white/10 mx-0 my-4" />

      {/* Marketing & Contenido */}
      <SidebarGroup className="py-0 px-0">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/admin/blog">
                  <SidebarMenuButton className="h-10 w-10 p-0 mx-auto hover:bg-white/10 rounded-lg">
                    <Megaphone className="h-5 w-5" />
                  </SidebarMenuButton>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Marketing</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
        <Collapsible
          open={openSections.marketing}
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, marketing: open }))}
        >
          <SidebarGroupLabel className="font-heading flex items-center justify-between cursor-pointer group h-10" asChild>
            <CollapsibleTrigger className="w-full flex items-center gap-3 hover:bg-white/5 rounded-lg px-3 py-2.5 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <Megaphone className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 group-data-[collapsible=icon]:mx-auto" />
              <span className="flex-1 text-left font-semibold text-[13px] uppercase tracking-wider text-white/90 group-data-[collapsible=icon]:hidden">Marketing</span>
              <ChevronRight className={`h-4 w-4 transition-transform duration-300 group-data-[collapsible=icon]:hidden ${openSections.marketing ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
            <SidebarGroupContent className="pl-0 pt-2">
              <SidebarMenu className="gap-1">
                <Collapsible>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isActive("/admin/blog")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                        <FileText className="h-4 w-4" />
                        <span>Blog</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                      <SidebarMenuSub className="gap-1 ml-2 mt-1 mb-1 border-l border-border/30 pl-2">
                        <SidebarMenuSubItem>
                          <Link href="/admin/blog" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5" /> Ver artículos
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/blog/new" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
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
                      <SidebarMenuButton isActive={isActive("/admin/playlists") || isActive("/admin/artist-submissions")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                        <Music2 className="h-4 w-4" />
                        <span>Playlists</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                      <SidebarMenuSub className="gap-1 ml-3 mt-1.5 mb-1.5 border-l-2 border-white/10 pl-3">
                        <SidebarMenuSubItem>
                          <Link href="/admin/playlists" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <Music2 className="h-3.5 w-3.5" /> Ver playlists
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/playlists/new" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <Plus className="h-3.5 w-3.5" /> Nueva playlist
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/artist-submissions" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
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
                      <SidebarMenuButton isActive={isActive("/admin/blacktop")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                        <Trophy className="h-4 w-4" />
                        <span>Blacktop</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                      <SidebarMenuSub className="gap-1 ml-3 mt-1.5 mb-1.5 border-l-2 border-white/10 pl-3">
                        <SidebarMenuSubItem>
                          <Link href="/admin/blacktop" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <Trophy className="h-3.5 w-3.5" /> Ver torneos
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/blacktop/new" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <Plus className="h-3.5 w-3.5" /> Nuevo torneo
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
                      <SidebarMenuButton isActive={isActive("/admin/newsletter")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                        <Mail className="h-4 w-4" />
                        <span>Newsletter</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                      <SidebarMenuSub className="gap-1 ml-3 mt-1.5 mb-1.5 border-l-2 border-white/10 pl-3">
                        <SidebarMenuSubItem>
                          <Link href="/admin/newsletter" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5" /> Suscriptores
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/newsletter/campaigns" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
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
                    <SidebarMenuButton asChild isActive={isActive("/admin/popovers")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                      <a className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" /> Popups
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/admin/coupons" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/coupons")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                      <a className="flex items-center gap-2">
                        <BadgePercent className="h-4 w-4" /> Cupones
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <Collapsible>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isActive("/admin/files") || isActive("/admin/files/entries")}
                        className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Busy Files</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                      <SidebarMenuSub className="gap-1 ml-3 mt-1.5 mb-1.5 border-l-2 border-white/10 pl-3">
                        <SidebarMenuSubItem>
                          <Link href="/admin/files" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <Camera className="h-3.5 w-3.5" /> Uploader
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/files/entries" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <List className="h-3.5 w-3.5" /> Ver files
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
                      <SidebarMenuButton isActive={isActive("/admin/scripts")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                        <Film className="h-4 w-4" />
                        <span>Guiones</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                      <SidebarMenuSub className="gap-1 ml-3 mt-1.5 mb-1.5 border-l-2 border-white/10 pl-3">
                        <SidebarMenuSubItem>
                          <Link href="/admin/scripts" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <Film className="h-3.5 w-3.5" /> Ver guiones
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
        )}
      </SidebarGroup>

      {/* Separador */}
      <div className="h-px bg-white/10 mx-0 my-4" />

      {/* Ventas & Clientes */}
      <SidebarGroup className="py-0 px-0">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/admin/analytics">
                  <SidebarMenuButton className="h-10 w-10 p-0 mx-auto hover:bg-white/10 rounded-lg">
                    <DollarSign className="h-5 w-5" />
                  </SidebarMenuButton>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Ventas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
        <Collapsible
          open={openSections.sales}
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, sales: open }))}
        >
          <SidebarGroupLabel className="font-heading flex items-center justify-between cursor-pointer group h-10" asChild>
            <CollapsibleTrigger className="w-full flex items-center gap-3 hover:bg-white/5 rounded-lg px-3 py-2.5 transition-all duration-200">
              <DollarSign className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 group-data-[collapsible=icon]:mx-auto" />
              <span className="flex-1 text-left font-semibold text-[13px] uppercase tracking-wider text-white/90 group-data-[collapsible=icon]:hidden">Ventas</span>
              <ChevronRight className={`h-4 w-4 transition-transform duration-300 group-data-[collapsible=icon]:hidden ${openSections.sales ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
            <SidebarGroupContent className="pl-0 pt-2">
              <SidebarMenu className="gap-1">
                <SidebarMenuItem>
                  <Link href="/admin/analytics" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/analytics")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                      <a className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" /> Inteligencia comercial
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <Collapsible>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton isActive={isActive("/admin/orders") || isActive("/admin/sales/manual")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Pedidos</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                      <SidebarMenuSub className="gap-1 ml-3 mt-1.5 mb-1.5 border-l-2 border-white/10 pl-3">
                        <SidebarMenuSubItem>
                          <Link href="/admin/orders" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <List className="h-3.5 w-3.5" /> Lista de pedidos
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/orders/pending" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" /> Transferencias pendientes
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <Link href="/admin/sales/manual" legacyBehavior>
                            <SidebarMenuSubButton asChild className="font-body hover:bg-white/5 hover:text-white rounded-md transition-all duration-200 text-white/70">
                              <a className="flex items-center gap-2">
                                <HandCoins className="h-3.5 w-3.5" /> Ventas manuales
                              </a>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem>
                  <Link href="/admin/customers/ranking" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/customers/ranking")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
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
        )}
      </SidebarGroup>

      {/* Separador */}
      <div className="h-px bg-white/10 mx-0 my-4" />

      {/* Operación */}
      <SidebarGroup className="py-0 px-0">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/admin/suppliers">
                  <SidebarMenuButton className="h-10 w-10 p-0 mx-auto hover:bg-white/10 rounded-lg">
                    <Settings className="h-5 w-5" />
                  </SidebarMenuButton>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Operaciones</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
        <Collapsible
          open={openSections.operations}
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, operations: open }))}
        >
          <SidebarGroupLabel className="font-heading flex items-center justify-between cursor-pointer group h-10" asChild>
            <CollapsibleTrigger className="w-full flex items-center gap-3 hover:bg-white/5 rounded-lg px-3 py-2.5 transition-all duration-200">
              <Settings className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 group-data-[collapsible=icon]:mx-auto" />
              <span className="flex-1 text-left font-semibold text-[13px] uppercase tracking-wider text-white/90 group-data-[collapsible=icon]:hidden">Operaciones</span>
              <ChevronRight className={`h-4 w-4 transition-transform duration-300 group-data-[collapsible=icon]:hidden ${openSections.operations ? 'rotate-90' : ''}`} />
            </CollapsibleTrigger>
          </SidebarGroupLabel>
          <CollapsibleContent className="pb-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2">
            <SidebarGroupContent className="pl-0 pt-2">
              <SidebarMenu className="gap-1">
                <SidebarMenuItem>
                  <Link href="/admin/suppliers" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/suppliers")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                      <a className="flex items-center gap-2">
                        <Factory className="h-4 w-4" /> Proveedores
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/admin/expenses" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/expenses")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                      <a className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" /> Gastos
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/admin/faqs" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/faqs")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                      <a className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" /> FAQs
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <Link href="/admin/settings" legacyBehavior>
                    <SidebarMenuButton asChild isActive={isActive("/admin/settings")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                      <a className="flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Configuración
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
        )}
      </SidebarGroup>

      {/* Separador */}
      <div className="h-px bg-white/10 mx-0 my-4" />

      {/* Notificaciones */}
      <SidebarGroup className="py-0 px-0 mb-3">
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/admin/notifications">
                  <SidebarMenuButton className="h-10 w-10 p-0 mx-auto hover:bg-white/10 rounded-lg">
                    <Bell className="h-5 w-5" />
                  </SidebarMenuButton>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Notificaciones</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin/notifications" legacyBehavior>
                <SidebarMenuButton asChild isActive={isActive("/admin/notifications")} className="font-body hover:bg-white/5 hover:text-white rounded-lg transition-all duration-200">
                  <a className="flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Notificaciones
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
        )}
      </SidebarGroup>
      </div>
      </SidebarContent>
    </>
  )
}
