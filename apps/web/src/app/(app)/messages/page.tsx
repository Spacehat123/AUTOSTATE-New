import { PageHeader } from '@/components/shared/page-header'
import { getCurrentUser } from '@/lib/auth'
import { getMessageInbox } from '@/lib/services/messages'
import { MessagesPageClient } from '@/components/messages/messages-page-client'

export default async function MessagesPage() {
  const user = await getCurrentUser()
  const { data: conversations } = await getMessageInbox(user.db)

  return (
    <div className="flex flex-col gap-4 pb-4">
      <PageHeader
        title="Messages"
        subtitle="Two-way WhatsApp conversations with your customers"
      />
      <MessagesPageClient initialConversations={conversations} />
    </div>
  )
}
