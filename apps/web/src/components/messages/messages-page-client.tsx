'use client'

import React, { useState } from 'react'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { MessageInbox } from '@/components/messages/message-inbox'
import { ConversationDetail } from '@/components/messages/conversation-detail'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'

interface MessagesPageClientProps {
  initialConversations: any[]
}

export function MessagesPageClient({ initialConversations }: MessagesPageClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedName, setSelectedName] = useState<string>('')
  // On mobile: true = show detail, false = show inbox
  const [showDetail, setShowDetail] = useState(false)

  const handleSelect = (customerId: string) => {
    const conv = initialConversations.find(c => c.customerId === customerId)
    setSelectedId(customerId)
    setSelectedName(conv?.customerName ?? '')
    setShowDetail(true)
  }

  const handleBack = () => {
    setShowDetail(false)
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] rounded-xl border border-surface-border bg-surface-card overflow-hidden">

      {/* ── LEFT PANEL: Inbox List ── */}
      <div className={`
        w-full md:w-1/3 flex-shrink-0 border-r border-surface-border flex flex-col
        ${showDetail ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="px-4 py-3 border-b border-surface-border flex-shrink-0">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Conversations</h2>
        </div>
        <div className="flex-1 overflow-hidden">
          <MessageInbox
            conversations={initialConversations}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {/* ── RIGHT PANEL: Conversation Detail ── */}
      <div className={`
        flex-1 flex flex-col min-w-0
        ${showDetail ? 'flex' : 'hidden md:flex'}
      `}>
        {/* Mobile back button */}
        {showDetail && (
          <div className="md:hidden px-4 py-2 border-b border-surface-border flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-zinc-400 hover:text-foreground -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        )}

        {selectedId ? (
          <ConversationDetail
            key={selectedId}
            customerId={selectedId}
            customerName={selectedName}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={<MessageSquare className="w-12 h-12" />}
              title="Select a conversation"
              description="Choose a customer from the list to view the full message thread."
              className="border-none bg-transparent"
            />
          </div>
        )}
      </div>

    </div>
  )
}
