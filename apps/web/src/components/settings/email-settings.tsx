'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Mail, Send } from 'lucide-react'
import { toast } from 'sonner'

export function EmailSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  
  const [formData, setFormData] = useState({
    fromEmail: '',
    fromName: '',
    apiKey: ''
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  async function fetchConfig() {
    try {
      const res = await fetch('/api/settings/email')
      if (!res.ok) throw new Error('Failed to load email config')
      const data = await res.json()
      
      if (data.config) {
        setFormData({
          fromEmail: data.config.fromEmail,
          fromName: data.config.fromName,
          apiKey: data.config.apiKey // This comes masked from server
        })
        setIsConfigured(true)
      }
    } catch (error) {
      toast.error('Failed to load email settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/settings/email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to save config')
      
      toast.success('Email settings saved successfully')
      setIsConfigured(true)
      fetchConfig() // Re-fetch to get the newly masked API key
    } catch (error) {
      toast.error('Failed to save email settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const res = await fetch('/api/settings/email/test', {
        method: 'POST'
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send test email')
      }
      
      toast.success(`Test email sent successfully to ${data.deliveredTo}!`)
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

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl max-w-2xl overflow-hidden">
      <div className="p-6 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">Email Integration</h2>
            <p className="text-sm text-zinc-400">Configure Resend API to send automated emails.</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Sender Name</label>
              <Input 
                name="fromName"
                value={formData.fromName}
                onChange={handleChange}
                placeholder="e.g. Acme Billing"
                required
                className="bg-black/20 border-surface-border text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Sender Email</label>
              <Input 
                type="email"
                name="fromEmail"
                value={formData.fromEmail}
                onChange={handleChange}
                placeholder="e.g. billing@acme.com"
                required
                className="bg-black/20 border-surface-border text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Resend API Key</label>
            <Input 
              type="text"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="re_..."
              required
              className="bg-black/20 border-surface-border text-zinc-400 font-mono text-sm tracking-wider"
            />
            <p className="text-xs text-zinc-500">
              Create an API key in your Resend Dashboard. We encrypt this in our database.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-surface-border">
            <Button 
              type="button"
              variant="outline"
              onClick={handleTestConnection} 
              disabled={testing || !isConfigured}
              className="border-surface-border text-zinc-300 hover:text-white"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {testing ? 'Sending...' : 'Send Test Email'}
            </Button>

            <Button 
              type="submit" 
              disabled={saving}
              className="bg-brand-500 hover:bg-brand-600 text-white min-w-[120px]"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
