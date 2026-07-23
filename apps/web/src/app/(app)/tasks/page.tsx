import { PageHeader } from '@/components/shared/page-header'
import { getCurrentUser } from '@/lib/auth'
import { getTasks } from '@/lib/services/tasks'
import { TasksPageClient } from '@/components/tasks/tasks-page-client'
import { ActionItemsSection } from '@/components/tasks/action-items-section'
import { AssignedTasksSummary } from '@/components/tasks/assigned-tasks-summary'
import { prisma } from '@autostate/database'

export default async function TasksPage() {
  const user = await getCurrentUser()
  
  const [
    { data: initialTasks },
    { data: assignedTasks },
    initialActionItems,
    teamMembers
  ] = await Promise.all([
    // Main Tasks
    getTasks({
      db: user.db,
      status: 'PENDING'
    }),
    // Assigned Tasks for user
    getTasks({
      db: user.db,
      status: 'PENDING',
      assignedTo: user.id,
      requestingUserRole: user.role,
      requestingUserId: user.id
    }),
    // Action Items for user
    prisma.actionItem.findMany({
      where: {
        userId: user.id,
        status: 'PENDING',
        deletedAt: null
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    }),
    // Team Members
    prisma.user.findMany({
      where: { companyId: user.companyId },
      select: { id: true, name: true, email: true, role: true }
    })
  ])

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-12">
      <PageHeader 
        title="Tasks" 
        subtitle="Your prioritized work for today" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionItemsSection initialItems={initialActionItems} />
        <AssignedTasksSummary tasks={assignedTasks} />
      </div>
      
      <TasksPageClient 
        initialTasks={initialTasks} 
        currentUserRole={user.role} 
        teamMembers={teamMembers} 
      />
    </div>
  )
}
