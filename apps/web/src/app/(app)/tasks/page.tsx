import { PageHeader } from '@/components/shared/page-header'
import { getCurrentUser } from '@/lib/auth'
import { getTasks } from '@/lib/services/tasks'
import { TasksPageClient } from '@/components/tasks/tasks-page-client'

export default async function TasksPage() {
  const user = await getCurrentUser()
  
  // Eagerly pre-fetch pending tasks for instant first paint
  const { data: initialTasks } = await getTasks({
    companyId: user.companyId,
    status: 'PENDING'
  })

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-12">
      <PageHeader 
        title="Tasks" 
        subtitle="Your prioritized work for today" 
      />
      
      <TasksPageClient initialTasks={initialTasks} />
    </div>
  )
}
