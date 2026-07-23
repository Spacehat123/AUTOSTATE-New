'use client'

import React, { useEffect, useRef, useState } from 'react'
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, XCircle, Clock, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

interface ImportJob {
  id: string
  fileName: string
  type: 'INVOICE' | 'PAYMENT'
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
  totalRows: number | null
  processedRows: number | null
  createdAt: string
  errorLog?: string | null
}

function getStatusBadge(status: ImportJob['status']) {
  const config = {
    PENDING: ['bg-zinc-500/10 text-zinc-400', Clock, 'Pending'],
    PROCESSING: ['bg-blue-500/10 text-blue-400', Loader2, 'Processing'],
    DONE: ['bg-emerald-500/10 text-emerald-400', CheckCircle2, 'Done'],
    FAILED: ['bg-rose-500/10 text-rose-400', XCircle, 'Failed'],
  } as const
  const [className, Icon, label] = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${className}`}>
      <Icon className={`w-3 h-3 ${status === 'PROCESSING' ? 'animate-spin' : ''}`} />
      {label}
    </span>
  )
}

interface ImportDropzoneProps {
  type: 'INVOICE' | 'PAYMENT'
  title: string
  description: string
  requiredColumns: string
  icon: React.ReactNode
  jobs: ImportJob[]
  loading: boolean
  onUpload: (file: File, type: 'INVOICE' | 'PAYMENT') => Promise<void>
}

function ImportDropzone({
  type,
  title,
  description,
  requiredColumns,
  icon,
  jobs,
  loading,
  onUpload
}: ImportDropzoneProps) {
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    if (!/\.(csv|xlsx)$/i.test(file.name)) {
      toast.error('Only .csv and .xlsx files are supported')
      return
    }
    setImporting(true)
    try {
      await onUpload(file, type)
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-medium text-foreground">{title}</h2>
            <p className="text-sm text-zinc-400">{description}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 flex-1 flex flex-col">
        <div
          className={`border-2 border-dashed border-surface-border rounded-xl p-10 text-center transition-colors cursor-pointer hover:bg-white/5 ${importing ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={(event) => { event.preventDefault(); event.stopPropagation() }}
          onDrop={(event) => { event.preventDefault(); event.stopPropagation(); const file = event.dataTransfer.files?.[0]; if (file) void handleUpload(file) }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.xlsx" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleUpload(file) }} />
          <div className="w-16 h-16 bg-surface-background rounded-full flex items-center justify-center mx-auto mb-4">
            {importing ? <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /> : <UploadCloud className="w-8 h-8 text-indigo-400" />}
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Drop a file here or click to browse</h3>
          <p className="text-sm text-zinc-400">Accepts .csv and .xlsx · Required columns: {requiredColumns}</p>
        </div>

        <section className="flex-1">
          <h3 className="text-sm font-medium text-zinc-200 mb-4">Import history</h3>
          {loading ? (
            <div className="flex justify-center p-8 text-zinc-500"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : jobs.length === 0 ? (
            <div className="text-center p-8 border border-surface-border border-dashed rounded-xl text-zinc-500 bg-surface-background/50 text-sm">No imports yet. Upload a file to get started.</div>
          ) : (
            <div className="border border-surface-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                <div className="col-span-5">File name</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Rows</div>
                <div className="col-span-3 text-right">Date</div>
              </div>
              <div className="divide-y divide-surface-border">
                {jobs.map((job) => (
                  <div key={job.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center text-sm">
                    <div className="col-span-5 font-medium text-zinc-200 truncate flex flex-col">
                      <span>{job.fileName}</span>
                      {job.errorLog && (() => {
                        try {
                          const parsed = JSON.parse(job.errorLog)
                          if (Array.isArray(parsed) && parsed.length > 0) {
                            return <span className="text-xs text-rose-400 truncate mt-1" title={parsed.map((e: any) => `Row ${e.row}: ${e.message}`).join('\n')}>
                              {parsed.length} row{parsed.length > 1 ? 's' : ''} had errors (hover to see)
                            </span>
                          }
                        } catch {
                          return <span className="text-xs text-rose-400 truncate mt-1">Error processing some rows</span>
                        }
                        return null
                      })()}
                    </div>
                    <div className="col-span-2">{getStatusBadge(job.status)}</div>
                    <div className="col-span-2 text-right text-zinc-400">{job.processedRows !== null ? `${job.processedRows} / ${job.totalRows ?? '?'}` : '-'}</div>
                    <div className="col-span-3 text-right text-zinc-500">{new Date(job.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export function ImportSettings() {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<ImportJob[]>([])

  async function fetchJobs() {
    try {
      const response = await fetch('/api/import')
      if (!response.ok) throw new Error()
      const data = await response.json()
      setJobs(data)
    } catch {
      toast.error('Failed to load import history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchJobs() }, 0)
    const interval = setInterval(() => {
      setJobs(currentJobs => {
        const needsPolling = currentJobs.some(job => job.status === 'PENDING' || job.status === 'PROCESSING')
        if (needsPolling) {
          void fetchJobs()
        }
        return currentJobs
      })
    }, 3000)
    return () => {
      window.clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  async function uploadFile(file: File, type: 'INVOICE' | 'PAYMENT') {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      const response = await fetch('/api/import', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Upload failed')
      setJobs((current) => [data.job, ...current])
      toast.success(`Upload complete. Processing started.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
      throw error
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <ImportDropzone
        type="INVOICE"
        title="Invoice import"
        description="Upload CSV or Excel invoices for processing."
        requiredColumns="Customer, Amount, Due Date"
        icon={<FileSpreadsheet className="w-5 h-5 text-indigo-400" />}
        jobs={jobs.filter(j => j.type === 'INVOICE')}
        loading={loading}
        onUpload={uploadFile}
      />
      
      <ImportDropzone
        type="PAYMENT"
        title="Payment import"
        description="Upload CSV or Excel payments for processing."
        requiredColumns="Invoice ID, Amount, Date"
        icon={<CreditCard className="w-5 h-5 text-indigo-400" />}
        jobs={jobs.filter(j => j.type === 'PAYMENT')}
        loading={loading}
        onUpload={uploadFile}
      />
    </div>
  )
}
