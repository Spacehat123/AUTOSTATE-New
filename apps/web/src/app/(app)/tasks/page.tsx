import { PageHeader } from '@/components/shared/page-header'
import { getCurrentUser } from '@/lib/auth'
import { getTasks } from '@/lib/services/tasks'
import { TasksPageClient } from '@/components/tasks/tasks-page-client'
import { ActionItemsSection } from '@/components/tasks/action-items-section'
import { prisma } from '@autostate/database'

export default async function TasksPage() {
  const user = await getCurrentUser()
  
  // Eagerly pre-fetch pending tasks for instant first paint
  const { data: initialTasks } = await getTasks({
    db: user.db,
    status: 'PENDING'
  })

  const teamMembers = await prisma.user.findMany({
    where: { companyId: user.companyId },
    select: { id: true, name: true, email: true, role: true }
  })

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-12">
      <PageHeader 
        title="Tasks" 
        subtitle="Your prioritized work for today" 
      />
      <ActionItemsSection />
      
      <TasksPageClient 
        initialTasks={initialTasks} 
        currentUserRole={user.role} 
        teamMembers={teamMembers} 
      />
    </div>
  )
}
