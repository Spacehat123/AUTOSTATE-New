'use client'

import React from 'react'
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
  LogOut
} from 'lucide-react'
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

  return (
    <aside className="w-64 border-r border-surface-border bg-surface-card flex flex-col flex-shrink-0 h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-surface-border">
        <Logo />
      </div>

      {/* Main Navigation (Top) */}
      <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-brand-600/20 text-brand-400 border-r-2 border-brand-500 rounded-r-none" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section (Settings + User Info) */}
      <div className="flex flex-col bg-surface-card/50">
        <Separator className="bg-surface-border/50" />
        
        <div className="px-3 py-2">
          <Link 
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              pathname.startsWith('/settings')
                ? "bg-brand-600/20 text-brand-400 border-r-2 border-brand-500 rounded-r-none" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </div>

        <Separator className="bg-surface-border" />

        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-surface-border overflow-hidden flex items-center justify-center flex-shrink-0">
              {clerkUser?.imageUrl ? (
                <img src={clerkUser.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-white">{clerkUser?.firstName?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">
                {clerkUser?.fullName || dbUser?.name || 'User'}
              </span>
              <span className="text-xs text-brand-400 truncate font-medium">
                {dbUser?.company?.name || 'Company'}
              </span>
            </div>
          </div>
          
          <SignOutButton>
            <button className="flex w-full items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-md transition-colors border border-rose-500/20">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>
    </aside>
  )
}
