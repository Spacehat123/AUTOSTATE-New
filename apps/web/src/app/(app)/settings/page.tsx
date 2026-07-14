import { PageHeader } from '@/components/ui/page-header'
import { SettingsLayout } from '@/components/settings/settings-layout'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        subtitle="Manage your company preferences and integrations" 
      />
      
      <SettingsLayout />
    </div>
  )
}
