import { getCurrentUser } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Fetch the authenticated user from the database. 
  // If not logged in -> /sign-in, if no db record -> /onboarding
  const user = await getCurrentUser()

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Fixed Sidebar (Hidden on mobile, block on md+) */}
      <div className="hidden md:flex">
        <Sidebar user={user} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (Visible on mobile, hidden on md+) */}
        <MobileHeader />
        
        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
