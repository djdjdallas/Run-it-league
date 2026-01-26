"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Trophy,
  LayoutDashboard,
  Users,
  UserCircle,
  Calendar,
  Megaphone,
  LogOut,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/teams", label: "Teams", icon: Users },
  { href: "/admin/players", label: "Players", icon: UserCircle },
  { href: "/admin/games", label: "Games", icon: Calendar },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
]

export function AdminSidebar({ onSignOut }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-card h-screen sticky top-0 flex flex-col">
      <div className="p-6 border-b">
        <Link href="/admin" className="flex items-center space-x-2">
          <Trophy className="h-6 w-6" />
          <span className="font-bold text-lg">Run It Admin</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href))

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Site
          </Button>
        </Link>
        {onSignOut && (
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            size="sm"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        )}
      </div>
    </aside>
  )
}
