import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports" 
        subtitle="Financial performance overview" 
      />
      
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    </div>
  )
}
