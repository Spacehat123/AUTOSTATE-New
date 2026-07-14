'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface ImportJob {
  id: string
  fileName: string
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
  totalRows: number | null
  processedRows: number | null
  createdAt: string
}

export function ImportSettings() {
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [jobs, setJobs] = useState<ImportJob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  // Polling logic
  useEffect(() => {
    const activeJobs = jobs.filter(j => j.status === 'PENDING' || j.status === 'PROCESSING')
    
    if (activeJobs.length === 0) return

    const interval = setInterval(async () => {
      // Poll active jobs
      for (const job of activeJobs) {
        try {
          const res = await fetch(`/api/import/${job.id}`)
          if (res.ok) {
            const updatedJob = await res.json()
            setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j))
          }
        } catch (e) {
          console.error('Failed to poll job status')
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [jobs])

  async function fetchJobs() {
    try {
      const res = await fetch('/api/import')
      if (!res.ok) throw new Error('Failed to load import history')
      const data = await res.json()
      setJobs(data)
    } catch (error) {
      toast.error('Failed to load import history')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Failed to upload file')
      
      const newJob = await res.json()
      setJobs([newJob, ...jobs])
      toast.success('File uploaded. Import started.')
    } catch (error) {
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Only .csv and .xlsx files are supported')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error('Failed to upload file')
      
      const newJob = await res.json()
      setJobs([newJob, ...jobs])
      toast.success('File uploaded. Import started.')
    } catch (error) {
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const getStatusBadge = (status: ImportJob['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-500/10 text-zinc-400 text-xs font-medium">
            <Clock className="w-3 h-3" /> Pending
          </span>
        )
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium">
            <Loader2 className="w-3 h-3 animate-spin" /> Processing
          </span>
        )
      case 'DONE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" /> Done
          </span>
        )
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-medium">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        )
    }
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl max-w-4xl overflow-hidden">
      <div className="p-6 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">Data Import</h2>
            <p className="text-sm text-zinc-400">Bulk upload customers and invoices via CSV or Excel.</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div 
          className={`border-2 border-dashed border-surface-border rounded-xl p-10 text-center transition-colors cursor-pointer hover:bg-white/5 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept=".csv,.xlsx"
            onChange={handleFileSelect}
          />
          <div className="w-16 h-16 bg-surface-background rounded-full flex items-center justify-center mx-auto mb-4">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8 text-indigo-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Drop your Excel file here or click to browse</h3>
          <p className="text-sm text-zinc-400">Supported formats: .xlsx, .csv</p>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-medium text-zinc-200 mb-4">Import History</h3>
          
          {loading ? (
            <div className="flex justify-center p-8 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center p-8 border border-surface-border border-dashed rounded-xl text-zinc-500 bg-surface-background/50 text-sm">
              No imports yet. Upload a file to get started.
            </div>
          ) : (
            <div className="border border-surface-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                <div className="col-span-5">File Name</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Rows Processed</div>
                <div className="col-span-3 text-right">Date</div>
              </div>
              <div className="divide-y divide-surface-border">
                {jobs.map((job) => (
                  <div key={job.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors text-sm">
                    <div className="col-span-5 font-medium text-zinc-200 truncate pr-2" title={job.fileName}>
                      {job.fileName}
                    </div>
                    <div className="col-span-2">
                      {getStatusBadge(job.status)}
                    </div>
                    <div className="col-span-2 text-right text-zinc-400">
                      {job.processedRows !== null ? `${job.processedRows} / ${job.totalRows || '?'}` : '-'}
                    </div>
                    <div className="col-span-3 text-right text-zinc-500">
                      {new Date(job.createdAt).toLocaleString('en-US', { 
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
