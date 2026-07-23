'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, MessageCircle, CheckCircle2, XCircle, Send, Save } from 'lucide-react'
import { toast } from 'sonner'

export function WhatsappSettings() {
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [isConfigured, setIsConfigured] = useState(false)
  const [integrationId, setIntegrationId] = useState('')
  
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [verifyToken, setVerifyToken] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  async function fetchConfig() {
    try {
      const res = await fetch('/api/settings/whatsapp')
      if (!res.ok) throw new Error('Failed to load WhatsApp config')
      const data = await res.json()
      
      setPhoneNumberId(data.config.phoneNumberId || '')
      setAccessToken(data.config.accessToken || '')
      setVerifyToken(data.config.verifyToken || '')
      setIntegrationId(data.config.integrationId || '')
      setIsConfigured(data.isConfigured)
    } catch (error) {
      toast.error('Failed to load WhatsApp settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId,
          accessToken,
          verifyToken
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save configuration')
      }

      toast.success('WhatsApp settings saved securely')
      await fetchConfig() // Reload to get masked values and updated integrationId
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  const webhookUrl = typeof window !== 'undefined' && integrationId 
    ? `${window.location.origin}/api/webhooks/whatsapp/${integrationId}` 
    : (typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/whatsapp/[integrationId]` : '')

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
              value={phoneNumberId} 
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="e.g. 101234567890123"
              className="bg-black/20 border-surface-border text-zinc-200 font-mono text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">System Access Token</label>
            <Input 
              type="password" 
              value={accessToken} 
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="•••••••••••• (Leave blank to keep unchanged)"
              className="bg-black/20 border-surface-border text-zinc-200 font-mono text-sm tracking-wider"
            />
            <p className="text-xs text-zinc-500">
              Your access token is encrypted securely at rest.
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
              value={webhookUrl} 
              className="bg-black/20 border-surface-border text-zinc-400 font-mono text-sm"
            />
            {!integrationId && (
              <p className="text-xs text-amber-500 mt-1">
                Save your configuration first to generate your unique Callback URL.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Verify Token</label>
            <Input 
              type="text" 
              value={verifyToken} 
              onChange={(e) => setVerifyToken(e.target.value)}
              placeholder="•••••••••••• (Leave blank to keep unchanged)"
              className="bg-black/20 border-surface-border text-zinc-200 font-mono text-sm tracking-wider"
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end gap-3">
          <Button 
            onClick={handleSave} 
            disabled={saving || (!phoneNumberId && !accessToken)}
            variant="outline"
            className="border-surface-border"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Configuration
          </Button>

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
