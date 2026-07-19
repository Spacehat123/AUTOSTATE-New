'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  MessageSquare, 
  BarChart2, 
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/layout/logo'
import { Separator } from '@/components/ui/separator'

const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Customers', icon: Users, href: '/customers' },
  { name: 'Tasks', icon: CheckSquare, href: '/tasks' },
  { name: 'Messages', icon: MessageSquare, href: '/messages' },
  { name: 'Reports', icon: BarChart2, href: '/reports' },
]

export function Sidebar({ user: dbUser }: { user: any }) {
  const pathname = usePathname()
  const { user: clerkUser } = useUser()
  const { theme, setTheme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={cn(
      "border-r border-surface-border bg-surface-sidebar flex flex-col flex-shrink-0 h-full transition-all duration-300 relative group/sidebar",
      isCollapsed ? "w-[72px]" : "w-64"
    )}>
      {/* Collapse Toggle Button - visible on hover or always if collapsed */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-surface border border-surface-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground z-10 opacity-0 group-hover/sidebar:opacity-100 transition-opacity"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo */}
      <div className={cn("h-16 flex items-center border-b border-surface-border overflow-hidden", isCollapsed ? "justify-center px-0" : "px-6")}>
        <div className="flex-shrink-0">
          <Logo collapsed={isCollapsed} />
        </div>
      </div>

      {/* Main Navigation (Top) */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 py-2.5 rounded-md text-sm font-medium transition-colors overflow-hidden",
                isCollapsed ? "px-0 justify-center" : "px-3",
                isActive 
                  ? "bg-brand-600/10 text-brand-700 dark:bg-brand-600/20 dark:text-brand-400 border-l-2 border-brand-500 rounded-l-none" 
                  : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 border-l-2 border-transparent"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isCollapsed ? "" : "ml-[-2px]")} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section (Settings + User Info) */}
      <div className="flex flex-col bg-transparent">
        <Separator className="bg-surface-border/50" />
        
        <div className="px-3 py-2 flex flex-col gap-1">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={isCollapsed ? "Toggle Theme" : undefined}
            className={cn(
              "flex w-full items-center gap-3 py-2.5 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 overflow-hidden",
              isCollapsed ? "justify-center px-0" : "px-3"
            )}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            {!isCollapsed && <span className="truncate">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          <Link 
            href="/settings"
            title={isCollapsed ? "Settings" : undefined}
            className={cn(
              "flex items-center gap-3 py-2.5 rounded-md text-sm font-medium transition-colors overflow-hidden",
              isCollapsed ? "justify-center px-0" : "px-3",
              pathname.startsWith('/settings')
                ? "bg-brand-600/10 text-brand-700 dark:bg-brand-600/20 dark:text-brand-400 border-l-2 border-brand-500 rounded-l-none" 
                : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-white/5 border-l-2 border-transparent"
            )}
          >
            <Settings className={cn("w-5 h-5 flex-shrink-0", isCollapsed ? "" : "ml-[-2px]")} />
            {!isCollapsed && <span className="truncate">Settings</span>}
          </Link>
        </div>

        <Separator className="bg-surface-border" />

        <div className={cn("p-4 flex flex-col", isCollapsed ? "items-center px-2" : "")}>
          <div className={cn("flex items-center gap-3", isCollapsed ? "mb-4" : "mb-4")}>
            <div className="w-10 h-10 rounded-full bg-surface-border overflow-hidden flex items-center justify-center flex-shrink-0">
              {clerkUser?.imageUrl ? (
                <img src={clerkUser.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-foreground">{clerkUser?.firstName?.charAt(0) || 'U'}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-foreground truncate">
                  {clerkUser?.fullName || dbUser?.name || 'User'}
                </span>
                <span className="text-xs text-brand-400 truncate font-medium">
                  {dbUser?.company?.name || 'Company'}
                </span>
              </div>
            )}
          </div>
          
          <SignOutButton>
            <button 
              title={isCollapsed ? "Sign Out" : undefined}
              className={cn(
                "flex items-center justify-center gap-2 py-2 text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-md transition-colors border border-rose-500/20",
                isCollapsed ? "px-0 w-10 h-10 rounded-xl" : "px-3 w-full"
              )}>
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </SignOutButton>
        </div>
      </div>
    </aside>
  )
}
