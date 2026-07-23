'use client'

import React, { useState } from 'react'
import { Webhook, MessageSquare, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export interface IntegrationStepProps {
  onComplete: () => void
  onSkip: () => void
}

export function IntegrationStep({ onComplete, onSkip }: IntegrationStepProps) {
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP')
  const [whatsappKey, setWhatsappKey] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')

  async function handleSave() {
    if (activeTab === 'WHATSAPP' && !whatsappKey.trim()) {
      toast.error('Please enter a valid WhatsApp API key')
      return
    }
    if (activeTab === 'EMAIL' && !webhookUrl.trim()) {
      toast.error('Please enter a valid webhook URL')
      return
    }

    setSaving(true)
    
    try {
      const type = activeTab
      const config = activeTab === 'WHATSAPP' 
        ? { apiKey: whatsappKey }
        : { webhookUrl }

      const response = await fetch('/api/onboarding/integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, config })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save integration')
      }
      
      toast.success('Integration saved successfully!')
      onComplete()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">Connect Integrations</h2>
        <p className="text-sm text-zinc-400">Connect your channels to start syncing messages automatically.</p>
      </div>

      <div className="flex bg-zinc-800/50 p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('WHATSAPP')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'WHATSAPP' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          <MessageSquare className="w-4 h-4" />
          WhatsApp
        </button>
        <button
          onClick={() => setActiveTab('EMAIL')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'EMAIL' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          <Webhook className="w-4 h-4" />
          Email
        </button>
      </div>

      <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-6">
        {activeTab === 'WHATSAPP' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">WhatsApp API Key</label>
              <input
                type="text"
                placeholder="Paste your Meta WhatsApp token here"
                value={whatsappKey}
                onChange={(e) => setWhatsappKey(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <p className="text-xs text-zinc-500">
              You can find this token in your Meta App Dashboard under WhatsApp &gt; API Setup.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Email Webhook URL</label>
              <input
                type="url"
                placeholder="https://your-domain.com/webhook/email"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <p className="text-xs text-zinc-500">
              Enter the URL where you'd like to receive email event webhooks.
            </p>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Save & Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={onSkip}
          disabled={saving}
          className="text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
