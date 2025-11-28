"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FolderOpen, Settings, HelpCircle, LogOut, Sparkles, Shield } from "lucide-react"
import { CreditBadge } from "./credit-badge"
import { mockUser } from "@/lib/mock-data"

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/settings", label: "Settings", icon: Settings },
]

const bottomLinks = [
  { href: "#", label: "Help", icon: HelpCircle },
  { href: "/admin", label: "Admin", icon: Shield },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleLogout = () => {
    console.log("[v0] Logout clicked")
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col z-40">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl text-foreground">RoomAI</span>
        </Link>
      </div>

      <div className="p-4">
        <CreditBadge credits={mockUser.credits} total={mockUser.totalCredits} />
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <ul className="space-y-1">
          {bottomLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </li>
        </ul>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <img
            src={mockUser.avatar || "/placeholder.svg"}
            alt={mockUser.name}
            className="w-10 h-10 rounded-full bg-muted"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{mockUser.name}</p>
            <p className="text-xs text-muted-foreground truncate">{mockUser.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
