import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@autostate/database'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'
import { GridBackground } from '@/components/layout/grid-background'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch the authenticated user from the database. 
  // If not logged in -> /sign-in, if no db record -> /onboarding
  const user = await getCurrentUser()

  const notificationCount = await prisma.task.count({
    where: { customer: { companyId: user.companyId }, status: 'PENDING', priority: { gte: 70 } }
  }).catch(() => 0)

  return (
    <>
      <GridBackground />
      <div className="flex h-screen bg-transparent overflow-hidden relative z-10">
        {/* Fixed Sidebar (Hidden on mobile, block on md+) */}
        <div className="hidden md:flex z-20 relative">
          <Sidebar companyName={user.company?.name} notificationCount={notificationCount} />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header (Visible on mobile, hidden on md+) */}
          <MobileHeader />
          
          {/* Scrollable Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
