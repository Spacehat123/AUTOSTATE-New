'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Building2 } from 'lucide-react'
import { toast } from 'sonner'

export function CompanySettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    gstNumber: '',
    phone: '',
    email: '',
    address: ''
  })

  useEffect(() => {
    async function fetchCompany() {
      try {
        const res = await fetch('/api/settings/company')
        if (!res.ok) throw new Error('Failed to load company details')
        const data = await res.json()
        setFormData({
          name: data.name || '',
          gstNumber: data.gstNumber || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || ''
        })
      } catch (error) {
        toast.error('Failed to load company settings')
      } finally {
        setLoading(false)
      }
    }
    fetchCompany()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/settings/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to save')
      
      toast.success('Company settings saved.')
    } catch (error) {
      toast.error('Failed to save company settings')
    } finally {
      setSaving(false)
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
    <div className="bg-surface-card border border-surface-border rounded-xl p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">Company Profile</h2>
          <p className="text-sm text-zinc-400">Manage your business details and contact info.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Company Name *</label>
          <Input 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            placeholder="e.g. Acme Corp" 
            className="bg-black/20 border-surface-border text-white"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">GST Number</label>
            <Input 
              name="gstNumber" 
              value={formData.gstNumber} 
              onChange={handleChange} 
              placeholder="e.g. 29ABCDE1234F1Z5"
              className="bg-black/20 border-surface-border text-white"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Phone</label>
            <Input 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="e.g. +91 98765 43210"
              className="bg-black/20 border-surface-border text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Support Email</label>
          <Input 
            name="email" 
            type="email"
            value={formData.email} 
            onChange={handleChange} 
            placeholder="e.g. support@acme.com"
            className="bg-black/20 border-surface-border text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Registered Address</label>
          <Input 
            name="address" 
            value={formData.address} 
            onChange={handleChange} 
            placeholder="Full business address"
            className="bg-black/20 border-surface-border text-white"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button 
            type="submit" 
            disabled={saving || !formData.name.trim()}
            className="bg-brand-500 hover:bg-brand-600 text-white min-w-[120px]"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
