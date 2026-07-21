'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, MessageCircle, CheckCircle2, XCircle, Send } from 'lucide-react'
import { toast } from 'sonner'

export function WhatsappSettings() {
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [config, setConfig] = useState<any>(null)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  async function fetchConfig() {
    try {
      const res = await fetch('/api/settings/whatsapp')
      if (!res.ok) throw new Error('Failed to load WhatsApp config')
      const data = await res.json()
      setConfig(data.config)
      setIsConfigured(data.isConfigured)
    } catch (error) {
      toast.error('Failed to load WhatsApp settings')
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const res = await fetch('/api/settings/whatsapp/test', {
        method: 'POST'
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send test message')
      }
      
      toast.success(`Test message sent successfully to ${data.deliveredTo}!`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setTesting(false)
    }
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl max-w-2xl overflow-hidden">
      <div className="p-6 border-b border-surface-border flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-foreground">WhatsApp Cloud API</h2>
            <p className="text-sm text-zinc-400">Manage your connection to the Meta Developer Platform.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 border border-surface-border">
          {isConfigured ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Connected</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-medium text-rose-400">Not Configured</span>
            </>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">WhatsApp Phone Number ID</label>
            <Input 
              readOnly 
              value={config.phoneNumberId} 
              className="bg-black/20 border-surface-border text-zinc-400 font-mono text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">System Access Token</label>
            <Input 
              type="text" 
              readOnly 
              value={config.accessToken} 
              className="bg-black/20 border-surface-border text-zinc-400 font-mono text-sm tracking-wider"
            />
            <p className="text-xs text-zinc-500">
              For security, access tokens are managed via environment variables and cannot be edited here.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-border space-y-4">
          <h3 className="text-sm font-medium text-zinc-200">Webhook Configuration</h3>
          <p className="text-sm text-zinc-400">
            Paste this URL into your Meta App Dashboard to receive incoming customer messages.
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Callback URL</label>
            <Input 
              readOnly 
              value={config.webhookUrl} 
              className="bg-black/20 border-surface-border text-zinc-300 font-mono text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Verify Token</label>
            <Input 
              type="text" 
              readOnly 
              value={config.verifyToken} 
              className="bg-black/20 border-surface-border text-zinc-400 font-mono text-sm tracking-wider"
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <Button 
            onClick={handleTestConnection} 
            disabled={testing || !isConfigured}
            className="bg-[#25D366] hover:bg-[#20bd5a] text-foreground shadow-[0_0_15px_rgba(37,211,102,0.2)]"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {testing ? 'Sending...' : 'Test Connection'}
          </Button>
        </div>
      </div>
    </div>
  )
}
