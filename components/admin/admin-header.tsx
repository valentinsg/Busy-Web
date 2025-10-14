"use client"

import { NotificationsBell } from "@/components/admin/notifications-bell"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import supabase from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import authorsJson from "@/data/authors.json"

export function AdminHeader() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const email = user?.email || null
      setUserEmail(email)

      let avatarUrl: string | null = null

      // Try to get avatar from user metadata first
      // If no avatar in metadata, try to match with authors.json
      if (email) {
        try {
          interface Author {
            id: string
            email: string
            avatar?: string
          }
          const author = (authorsJson as Author[]).find((a) =>
            a.email === email ||
            email.includes(a.id.replace('-', ''))
          )
          if (author?.avatar) {
            avatarUrl = author.avatar
          }
        } catch {
          // Ignore errors, will use fallback
        }
      }

      setUserAvatar(avatarUrl)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/admin/sign-in")
  }

  const getInitials = (email: string | null) => {
    if (!email) return "AD"
    const parts = email.split("@")[0].split(".")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex items-center gap-3 font-body py-4 ">
      <NotificationsBell />

      <div className="h-6 w-px bg-border" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 gap-2 px-2 font-body">
            <Avatar className="h-8 w-8 ring-2 ring-accent-brand/20 hover:ring-accent-brand/40 transition-all">
              <AvatarImage src={userAvatar || ''} alt={userEmail || 'Admin'} />
              <AvatarFallback className="bg-accent-brand/10 text-accent-brand font-semibold text-xs font-body">
                {getInitials(userEmail)}
              </AvatarFallback>
            </Avatar>
            {!loading && userEmail && (
              <span className="hidden md:inline-block text-sm font-medium max-w-[150px] truncate font-body">
                {userEmail.split("@")[0]}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 font-body" sideOffset={5}>
          <DropdownMenuLabel className="font-body">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Admin</p>
              {userEmail && (
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {userEmail}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/admin/settings")} className="font-body">
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/admin/profile")} className="font-body">
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive font-body">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
