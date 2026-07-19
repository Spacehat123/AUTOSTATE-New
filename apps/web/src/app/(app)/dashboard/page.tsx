import { HeroStats } from '@/components/dashboard/hero-stats'
import { MetricsGroup } from '@/components/dashboard/metrics-group'
import { NeedsAttention } from '@/components/dashboard/needs-attention'
import { TodaysFocus } from '@/components/dashboard/todays-focus'
import { MonthlyCollectionsChart } from '@/components/dashboard/monthly-collections-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { getCurrentUser } from '@/lib/auth'
import { getDashboardData } from '@/lib/services/dashboard'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const data = await getDashboardData(user.companyId)

  // Use the fetched data for the HeroStats
  const overdueAmount = Number(data.totalOverdue) || 0
  const expectedCollections = Number(data.expectedCollections) || 0
  const todaysCollections = Number(data.todaysCollections) || 0

  return (
    <div className="flex flex-col pb-10 max-w-5xl mx-auto w-full gap-12 pt-8">
      <HeroStats 
        userName={user.name?.split(' ')[0] || 'there'}
        overdueAmount={overdueAmount} 
        expectedCollections={expectedCollections}
      />
      
      <MetricsGroup 
        outstanding={overdueAmount}
        predicted={expectedCollections}
        recovered={todaysCollections}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 lg:gap-16 pt-4">
        <div className="flex flex-col gap-16">
          <NeedsAttention tasks={data.needsAttentionTasks} />
          <TodaysFocus tasks={data.todaysTasks} />
          <MonthlyCollectionsChart data={data.monthlyChartData} />
        </div>
        
        <div className="flex flex-col">
          <RecentActivity activities={data.recentActivity} />
        </div>
      </div>
    </div>
  )
}
