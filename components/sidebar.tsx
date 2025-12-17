"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Image,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  CreditCard,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/gallery", label: "Gallery", icon: Image },
  { href: "/settings", label: "Settings", icon: Settings },
];

const bottomLinks = [
  { href: "/pricing", label: "Get Credits", icon: CreditCard },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [totalCredits, setTotalCredits] = useState<number>(100);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      loadCredits();
    }
  }, [status]);

  const loadCredits = async () => {
    try {
      const response = await fetch("/api/user/credits");
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
        setTotalCredits(data.totalCredits || 100);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/auth/signin" });
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const creditPercentage =
    credits !== null ? Math.round((credits / totalCredits) * 100) : 0;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/90 to-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">
            RoomAI
          </span>
        </Link>
      </div>

      {/* Credits */}
      <div className="p-5 mx-4 mt-5 rounded-xl glass border border-sidebar-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-sidebar-foreground/80 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Credits
          </span>
          <span className="text-base font-bold text-sidebar-foreground">
            {credits !== null ? credits : "..."}/{totalCredits}
          </span>
        </div>
        <div className="w-full h-2 bg-sidebar-border/50 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${creditPercentage}%` }}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs font-medium text-primary hover:text-primary hover:bg-primary/10 border border-primary/20"
          asChild
        >
          <Link href="/pricing" className="flex items-center justify-center gap-2">
            <CreditCard className="w-3.5 h-3.5" />
            Get More Credits
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 mt-2">
        <ul className="space-y-2">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/30 shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:shadow-sm"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Links */}
      <div className="p-3 border-t border-sidebar-border">
        <ul className="space-y-1">
          {bottomLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </li>
        </ul>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-sidebar-border/50 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-sidebar-foreground border-2 border-sidebar-border/50 shadow-sm">
                {userInitials}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-sidebar shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {userName}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {userEmail}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 bg-sidebar border-r border-sidebar-border/50 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 shadow-lg",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
