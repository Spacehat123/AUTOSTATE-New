'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, LayoutDashboard, Users, CheckSquare, FileText, Handshake, MessageSquare, BarChart2, Settings, Bell, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'
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

export function MobileHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  return (
    <header className="md:hidden flex items-center justify-between px-4 h-16 border-b border-surface-border bg-surface-card flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <span className="font-bold text-lg text-foreground tracking-tight">AutoState</span>
      </div>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger 
          render={<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" />}
        >
          <Menu className="w-6 h-6" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] bg-surface-sidebar border-r border-surface-border p-0 flex flex-col text-foreground">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Navigate through the application</SheetDescription>
          
          <div className="h-20 flex items-center px-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">AutoState</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col px-4 pb-4">
            <nav className="flex flex-col gap-1.5 mb-6 pt-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 py-2.5 rounded-xl text-sm transition-all relative overflow-hidden group px-3",
                      isActive 
                        ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold" 
                        : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 font-medium"
                    )}
                  >
                    <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive ? "text-brand-500" : "")} />
                    <span className="truncate flex-1">{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-1.5 pt-4 border-t border-surface-border">
              <Link 
                href="/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 px-3"
              >
                <Bell className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate flex-1">Notifications</span>
              </Link>
              
              <Link 
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 px-3"
              >
                <Settings className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate flex-1">Settings</span>
              </Link>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-between py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 px-3 w-full"
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-[18px] h-[18px] shrink-0" />
                  <span className="truncate">Dark Mode</span>
                </div>
                <div className={cn("w-10 h-5 rounded-full flex items-center px-0.5 transition-colors", theme === 'dark' ? 'bg-brand-500' : 'bg-surface-border')}>
                  <div className={cn("w-4 h-4 rounded-full bg-white transition-transform shadow-sm", theme === 'dark' ? 'translate-x-5' : 'translate-x-0')} />
                </div>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
