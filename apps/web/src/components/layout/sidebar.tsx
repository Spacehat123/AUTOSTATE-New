'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, SignOutButton } from '@clerk/nextjs'
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  FileText,
  Handshake,
  MessageSquare, 
  BarChart2, 
  Settings,
  Bell,
  Moon,
  Building2,
  ChevronDown,
  Star,
  ArrowRight,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Customers', icon: Users, href: '/customers' },
  { name: 'Tasks', icon: CheckSquare, href: '/tasks' },
  { name: 'Invoices', icon: FileText, href: '/invoices' },
  { name: 'Promises', icon: Handshake, href: '/promises' },
  { name: 'Messages', icon: MessageSquare, href: '/messages' },
  { name: 'Reports', icon: BarChart2, href: '/reports' },
]

export function Sidebar({ user: dbUser, notificationCount = 0 }: { user: any, notificationCount?: number }) {
  const pathname = usePathname()
  const { user: clerkUser } = useUser()
  const { theme, setTheme } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={cn(
      "border-r border-surface-border bg-surface-sidebar flex flex-col flex-shrink-0 h-full transition-all duration-300 relative group/sidebar",
      isCollapsed ? "w-[80px]" : "w-[280px]"
    )}>
      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-surface-card border border-surface-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground z-10 opacity-0 group-hover/sidebar:opacity-100 transition-opacity shadow-sm"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo Area */}
      <div className={cn("h-20 flex items-center shrink-0", isCollapsed ? "justify-center px-0" : "px-6")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          {!isCollapsed && <span className="font-bold text-lg text-foreground tracking-tight">AutoState</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col px-4 pb-4">
        {/* Main Navigation */}
        <nav className="flex flex-col gap-1.5 mb-6 pt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 py-2.5 rounded-xl text-sm transition-all relative overflow-hidden group",
                  isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "px-3",
                  isActive 
                    ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 font-medium"
                )}
              >
                <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive ? "text-brand-500" : "")} />
                {!isCollapsed && <span className="truncate flex-1">{item.name}</span>}
                {/* Notice we removed the hardcoded badge check here for generic nav items */}
              </Link>
            )
          })}
        </nav>

        {!isCollapsed && (
          <>
            <div className="h-px bg-surface-border w-full my-2" />
            
            {/* Workspace Switcher */}
            <div className="py-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-3 block">Workspace</span>
              <button className="w-full bg-surface-card border border-surface-border rounded-xl p-3 flex items-center justify-between shadow-sm hover:border-brand-500/30 transition-colors">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 text-purple-600">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-foreground truncate">{dbUser?.company?.name || 'Example Corp'}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            </div>

            {/* Upgrade Card */}
            <div className="mt-2 mb-6 bg-brand-50 dark:bg-brand-500/10 rounded-2xl p-4 border border-brand-100 dark:border-brand-500/20">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-sm mb-2">
                <Star className="w-4 h-4" />
                <span>Upgrade to Pro</span>
              </div>
              <p className="text-xs text-brand-600/70 dark:text-brand-400/70 font-medium leading-relaxed mb-4">
                Unlock advanced insights and automation.
              </p>
              <button className="w-6 h-6 rounded-full bg-white dark:bg-brand-500 flex items-center justify-center shadow-sm ml-auto text-brand-600 dark:text-white hover:scale-105 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        <div className="mt-auto flex flex-col gap-1.5 pt-4">
          <Link 
            href="/notifications"
            title={isCollapsed ? "Notifications" : undefined}
            className={cn(
              "flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
              isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "px-3"
            )}
          >
            <Bell className="w-[18px] h-[18px] shrink-0" />
            {!isCollapsed && <span className="truncate flex-1">Notifications</span>}
            {!isCollapsed && notificationCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
            {isCollapsed && notificationCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500" />}
          </Link>
          
          <Link 
            href="/settings"
            title={isCollapsed ? "Settings" : undefined}
            className={cn(
              "flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
              isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "px-3"
            )}
          >
            <Settings className="w-[18px] h-[18px] shrink-0" />
            {!isCollapsed && <span className="truncate flex-1">Settings</span>}
          </Link>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={isCollapsed ? "Toggle Theme" : undefined}
            className={cn(
              "flex items-center justify-between py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5",
              isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "px-3"
            )}
          >
            <div className="flex items-center gap-3">
              <Moon className="w-[18px] h-[18px] shrink-0" />
              {!isCollapsed && <span className="truncate">Dark Mode</span>}
            </div>
            {!isCollapsed && (
              <div className={cn("w-10 h-5 rounded-full flex items-center px-0.5 transition-colors", theme === 'dark' ? 'bg-brand-500' : 'bg-surface-border')}>
                <div className={cn("w-4 h-4 rounded-full bg-white transition-transform shadow-sm", theme === 'dark' ? 'translate-x-5' : 'translate-x-0')} />
              </div>
            )}
          </button>
        </div>

        {/* User Profile */}
        <div className={cn("mt-6 pt-4 border-t border-surface-border flex items-center", isCollapsed ? "justify-center" : "")}>
          <div className="relative cursor-pointer group flex items-center w-full">
            <div className="w-10 h-10 rounded-full bg-surface-border overflow-hidden flex items-center justify-center shrink-0">
              {clerkUser?.imageUrl ? (
                <img src={clerkUser.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-foreground">{clerkUser?.firstName?.charAt(0) || 'P'}</span>
              )}
            </div>
            {/* Online Indicator */}
            <div className="absolute bottom-0 left-7 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface-sidebar" />
            
            {!isCollapsed && (
              <div className="ml-3 flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold text-foreground truncate">
                  {clerkUser?.firstName || 'Pranav'}
                </span>
                <span className="text-xs text-muted-foreground font-medium truncate">
                  Admin
                </span>
              </div>
            )}
            
            {!isCollapsed && (
              <MoreVertical className="w-4 h-4 text-muted-foreground shrink-0 opacity-50 group-hover:opacity-100 transition-opacity ml-2" />
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
