import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { MarketingNavbar } from '@/components/layout/marketing-navbar'
import { DotMatrix } from '@/components/layout/dot-matrix'
import { Magnetic } from '@/components/ui/magnetic'
import { FloatingBento } from '@/components/ui/floating-bento'

export default async function Home() {
  const { userId } = await auth()

  return (
    <div className="relative min-h-[200vh] bg-[#fafafa] font-sans selection:bg-zinc-200 overflow-hidden">
      {/* Huge Abstract Shapes */}
      <div className="absolute top-[-200px] left-[-200px] w-[800px] h-[800px] rounded-full bg-[#EEF7F3] blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[200px] right-[-200px] w-[800px] h-[800px] rounded-full bg-[#F3F6FF] blur-[120px] pointer-events-none z-0" />

      <DotMatrix />
      <MarketingNavbar userId={userId} />
      
      {/* Hero Section */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen pt-48 px-6 md:px-12 lg:px-24">
        <div className="flex flex-col items-start text-left lg:pl-20 xl:pl-24">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-zinc-900 leading-[1.05] animate-fade-up">
            Run your business.<br />
            Not your software.
          </h1>
          
          <p className="mt-8 text-lg sm:text-xl md:text-2xl text-zinc-500 max-w-xl font-medium tracking-tight animate-fade-up" style={{ animationDelay: '200ms' }}>
            Customers, WhatsApp, invoices, tasks, and AI—working together in one workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-12 animate-fade-up" style={{ animationDelay: '400ms' }}>
            <Magnetic>
              <Link 
                href="/sign-up"
                className="px-8 py-3.5 rounded-full bg-zinc-900 text-white font-medium shadow-md transition-all hover:bg-zinc-800 hover:scale-[1.02] inline-block"
              >
                Start Free
              </Link>
            </Magnetic>
            <Link 
              href="/pricing"
              className="px-8 py-3.5 rounded-full border border-dashed border-zinc-300 text-zinc-500 font-medium transition-all hover:text-zinc-900 hover:border-zinc-400 hover:bg-black/5"
            >
              View Plans
            </Link>
          </div>
        </div>
        
        {/* Right Half: Floating Bento Graphic */}
        <div className="hidden lg:flex items-center justify-center relative w-full h-full">
          <FloatingBento />
        </div>
      </main>
    </div>
  )
}
