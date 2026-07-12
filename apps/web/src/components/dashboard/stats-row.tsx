import React from 'react'
import { TrendingUp, AlertCircle, Users, Calendar, MessageSquare } from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import { CurrencyDisplay } from '@/components/shared/currency-display'

export interface DashboardData {
  todaysCollections: number | string | any
  totalOverdue: number | string | any
  customersRequiringAction: number
  promisesDueToday: number
  messagesWaiting: number
  todaysTasks: any[]
}

interface StatsRowProps {
  data: DashboardData
}

export function StatsRow({ data }: StatsRowProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard
        title="Today's Collections"
        value={<CurrencyDisplay value={data.todaysCollections} compact />}
        icon={<TrendingUp className="text-emerald-500" />}
      />
      
      <StatCard
        title="Total Overdue"
        value={<CurrencyDisplay value={data.totalOverdue} compact />}
        icon={<AlertCircle className="text-rose-500" />}
        valueClassName="text-rose-500"
        className="border-rose-500/20 bg-rose-500/5"
      />
      
      <StatCard
        title="Action Required"
        value={data.customersRequiringAction}
        icon={<Users />}
      />
      
      <StatCard
        title="Promises Due"
        value={data.promisesDueToday}
        icon={<Calendar />}
      />
      
      <StatCard
        title="Messages Waiting"
        value={data.messagesWaiting}
        icon={<MessageSquare />}
      />
    </div>
  )
}
