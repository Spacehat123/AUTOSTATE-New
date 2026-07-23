import { PageHeader } from '@/components/shared/page-header'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { getCurrentUser } from '@/lib/auth'
import { isAuthorizedUser } from '@/lib/rbac'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!isAuthorizedUser(user)) {
    redirect('/dashboard')
  }
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
