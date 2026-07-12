'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, LayoutDashboard, Users, CheckSquare, MessageSquare, BarChart2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Logo } from '@/components/layout/logo'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Customers', icon: Users, href: '/customers' },
  { name: 'Tasks', icon: CheckSquare, href: '/tasks' },
  { name: 'Messages', icon: MessageSquare, href: '/messages' },
  { name: 'Reports', icon: BarChart2, href: '/reports' },
]

export function MobileHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="md:hidden flex items-center justify-between px-4 h-16 border-b border-surface-border bg-surface-card flex-shrink-0">
      <Logo />
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <Menu className="w-6 h-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-surface-card border-r border-surface-border p-0 flex flex-col text-white">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Navigate through the application</SheetDescription>
          
          <div className="h-16 flex items-center px-6 border-b border-surface-border">
            <Logo />
          </div>

          <nav className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setOpen(false)}
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

          <div className="px-3 py-4 border-t border-surface-border/50">
            <Link 
              href="/settings"
              onClick={() => setOpen(false)}
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
        </SheetContent>
      </Sheet>
    </header>
  )
}
