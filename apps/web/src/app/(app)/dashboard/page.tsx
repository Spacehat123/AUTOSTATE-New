import { PageHeader } from '@/components/shared/page-header'
import { StatsRow } from '@/components/dashboard/stats-row'
import { TodaysWork } from '@/components/dashboard/todays-work'
import { getCurrentUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/services/dashboard'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const data = await getDashboardData(user.companyId)

  return (
    <div className="flex flex-col">
      <PageHeader 
        title="Dashboard" 
        subtitle={`Good morning, ${user.name || 'there'}! Here's your collections overview.`} 
      />
      
      <StatsRow data={data} />
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4 tracking-tight">Today's Work</h2>
        <TodaysWork tasks={data.todaysTasks} />
      </div>
    </div>
  )
}
