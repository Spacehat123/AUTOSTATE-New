import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { MarketingNavbar } from '@/components/layout/marketing-navbar'
import { DotMatrix } from '@/components/layout/dot-matrix'
import { Magnetic } from '@/components/ui/magnetic'
import { FloatingBento } from '@/components/ui/floating-bento'
import { DashboardMockup } from '@/components/ui/dashboard-mockup'
import { StorySection } from '@/components/ui/story-section'
import { PhilosophySection } from '@/components/ui/philosophy-section'
import { AiKnowledgeSection } from '@/components/ui/ai-knowledge-section'
import { PricingSection } from '@/components/ui/pricing-section'
import { Footer } from '@/components/layout/footer'

import { HeroScrollWrapper } from '@/components/ui/hero-scroll-wrapper'
import { ScrollDownButton } from '@/components/ui/scroll-down-button'

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
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen pt-40 lg:pt-48 px-6 md:px-12 lg:px-24">
        
        <HeroScrollWrapper>
          <div className="flex flex-col items-start text-left lg:pl-12 xl:pl-16 relative z-10 pt-12">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[5.5rem] font-bold tracking-tight text-zinc-900 leading-[1.05] animate-fade-up font-serif">
              Run your business.<br />
              Not your software.
            </h1>
            
            <p className="mt-8 text-lg sm:text-xl md:text-[1.35rem] text-zinc-500 max-w-xl font-normal leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
              Customers, WhatsApp, invoices, tasks, and AI—working together in one workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-12 animate-fade-up" style={{ animationDelay: '400ms' }}>
              <Link 
                href="/sign-up"
                className="px-8 py-3.5 rounded-full bg-zinc-900 text-white font-medium hover:bg-zinc-800 transition-colors inline-block"
              >
                Start Free
              </Link>
              <Link 
                href="/pricing"
                className="px-8 py-3.5 rounded-full border border-dashed border-zinc-300 text-zinc-500 font-medium transition-colors hover:text-zinc-900 hover:border-zinc-400"
              >
                View Plans
              </Link>
            </div>
          </div>
        </HeroScrollWrapper>
        
        {/* Right Half: Floating Bento Graphic */}
        <div className="hidden lg:flex items-center justify-center relative w-full h-full">
          <FloatingBento />
        </div>

        {/* Button to Trigger Scroll Sequence */}
        <ScrollDownButton />
      </main>

      {/* Demo Dashboard Section */}
      <section className="relative z-10 w-full px-6 md:px-12 lg:px-24 pb-32 pt-20">
        <DashboardMockup />
      </section>

      <StorySection />
      <PhilosophySection />
      <AiKnowledgeSection />
      <PricingSection />
      <Footer />
    </div>
  )
}
