'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

interface ImportJob {
  id: string
  fileName: string
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
  totalRows: number | null
  processedRows: number | null
  createdAt: string
}

interface PreviewRow {
  row: number
  customerName: string
  invoiceNumber: string
  amount: number | null
  dueDate: string | null
  issueDate: string
  phone?: string
  email?: string
  gst?: string
  errors: string[]
  alreadyExists: boolean
}

interface Preview {
  fileName: string
  rows: PreviewRow[]
  errors: { row: number; message: string }[]
  validRows: number
}

type RowStatus = 'ready' | 'already-exists' | 'duplicate-in-file' | 'invalid'

export function ImportSettings() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [jobs, setJobs] = useState<ImportJob[]>([])
  const [preview, setPreview] = useState<Preview | null>(null)
  const [selectedDuplicateRows, setSelectedDuplicateRows] = useState<Record<string, number>>({})
  const [result, setResult] = useState<{ importedInvoices: number; customersCreated: number; skippedAlreadyExists: number; skippedDuplicates: number; errors: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchJobs() {
    try {
      const response = await fetch('/api/import')
      if (!response.ok) throw new Error()
      setJobs(await response.json())
    } catch {
      toast.error('Failed to load import history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchJobs() }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function previewFile(file: File) {
    if (!/\.(csv|xlsx)$/i.test(file.name)) {
      toast.error('Only .csv and .xlsx files are supported')
      return
    }
    setParsing(true)
    setPreview(null)
    setSelectedDuplicateRows({})
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/import', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Unable to parse file')
      setPreview(data)
      if (data.errors.length) toast.error(`Found ${data.errors.length} issue${data.errors.length === 1 ? '' : 's'} to fix`)
      else toast.success(`${data.validRows} rows passed basic validation; checking duplicates in the preview`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to parse file')
    } finally {
      setParsing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function duplicateKey(row: PreviewRow) {
    return `${row.customerName.trim().toLocaleLowerCase()}\u0000${row.invoiceNumber.trim()}`
  }

  function getRowStatus(row: PreviewRow): RowStatus {
    if (row.errors.length) return 'invalid'
    if (row.alreadyExists) return 'already-exists'
    const sameInvoiceRows = preview?.rows.filter((candidate) => !candidate.errors.length && !candidate.alreadyExists && duplicateKey(candidate) === duplicateKey(row)) ?? []
    if (sameInvoiceRows.length < 2) return 'ready'
    const selectedRow = selectedDuplicateRows[duplicateKey(row)] ?? sameInvoiceRows[0]?.row
    return selectedRow === row.row ? 'ready' : 'duplicate-in-file'
  }

  async function importPreview() {
    if (!preview) return
    const readyRows = preview.rows.filter((row) => getRowStatus(row) === 'ready')
    if (!readyRows.length) return
    setImporting(true)
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: preview.fileName, rows: readyRows }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Import failed')
      setResult(data)
      setJobs((current) => [data.job, ...current])
      setPreview(null)
      router.refresh()
      toast.success(`${data.importedInvoices} invoices imported`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  function getStatusBadge(status: ImportJob['status']) {
    const config = {
      PENDING: ['bg-zinc-500/10 text-zinc-400', Clock, 'Pending'],
      PROCESSING: ['bg-blue-500/10 text-blue-400', Loader2, 'Processing'],
      DONE: ['bg-emerald-500/10 text-emerald-400', CheckCircle2, 'Done'],
      FAILED: ['bg-rose-500/10 text-rose-400', XCircle, 'Failed'],
    } as const
    const [className, Icon, label] = config[status]
    return <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${className}`}><Icon className={`w-3 h-3 ${status === 'PROCESSING' ? 'animate-spin' : ''}`} />{label}</span>
  }

  const hasErrors = Boolean(preview?.errors.length)
  const rowStatuses = preview?.rows.map((row) => ({ row, status: getRowStatus(row) })) ?? []
  const readyRows = rowStatuses.filter(({ status }) => status === 'ready').length
  const existingRows = rowStatuses.filter(({ status }) => status === 'already-exists').length
  const duplicateRows = rowStatuses.filter(({ status }) => status === 'duplicate-in-file').length

  return (
    <div className="bg-surface-card border border-surface-border rounded-xl max-w-5xl overflow-hidden">
      <div className="p-6 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center"><FileSpreadsheet className="w-5 h-5 text-indigo-400" /></div>
          <div><h2 className="text-lg font-medium text-foreground">Invoice import</h2><p className="text-sm text-zinc-400">Preview and validate CSV or Excel invoices before anything is saved.</p></div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div
          className={`border-2 border-dashed border-surface-border rounded-xl p-10 text-center transition-colors cursor-pointer hover:bg-white/5 ${parsing || importing ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={(event) => { event.preventDefault(); event.stopPropagation() }}
          onDrop={(event) => { event.preventDefault(); event.stopPropagation(); const file = event.dataTransfer.files?.[0]; if (file) void previewFile(file) }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.xlsx" onChange={(event) => { const file = event.target.files?.[0]; if (file) void previewFile(file) }} />
          <div className="w-16 h-16 bg-surface-background rounded-full flex items-center justify-center mx-auto mb-4">{parsing ? <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /> : <UploadCloud className="w-8 h-8 text-indigo-400" />}</div>
          <h3 className="text-lg font-medium text-foreground mb-2">Drop an invoice file here or click to browse</h3>
          <p className="text-sm text-zinc-400">Accepts .csv and .xlsx · Required columns: Customer, Amount, Due Date</p>
        </div>

        {preview && (
          <section className="border border-surface-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-surface-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><h3 className="font-medium text-foreground">Review {preview.fileName}</h3><p className="text-sm text-zinc-400">{preview.rows.length} rows found</p></div>
              <Button onClick={() => void importPreview()} disabled={importing || readyRows === 0}>{importing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{`Import ${readyRows} ready invoice${readyRows === 1 ? '' : 's'}`}</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 text-sm"><div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-300"><strong>{readyRows}</strong> ready to import</div><div className="rounded-lg bg-amber-500/10 p-3 text-amber-300"><strong>{existingRows}</strong> already exists</div><div className="rounded-lg bg-amber-500/10 p-3 text-amber-300"><strong>{duplicateRows}</strong> duplicate in file</div><div className="rounded-lg bg-rose-500/10 p-3 text-rose-300"><strong>{preview.errors.length}</strong> invalid</div></div>
            {hasErrors && <div className="mx-4 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-300 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span className="flex gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />Invalid and duplicate rows are excluded by default.</span><Button size="sm" variant="outline" onClick={() => void importPreview()} disabled={importing || readyRows === 0}>Import ready rows anyway</Button></div>}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm"><thead className="bg-white/5 text-xs uppercase tracking-wider text-zinc-400"><tr><th className="p-3 text-left">Row</th><th className="p-3 text-left">Customer</th><th className="p-3 text-left">Invoice</th><th className="p-3 text-right">Amount</th><th className="p-3 text-left">Due date</th><th className="p-3 text-left">Validation</th></tr></thead>
                <tbody className="divide-y divide-surface-border">{preview.rows.map((row) => {
                  const status = getRowStatus(row)
                  return <tr key={row.row} className={status === 'invalid' ? 'bg-rose-500/5' : status === 'ready' ? '' : 'bg-amber-500/5'}><td className="p-3 text-zinc-500">{row.row}</td><td className="p-3 text-zinc-200">{row.customerName || '—'}</td><td className="p-3 text-zinc-200">{row.invoiceNumber}</td><td className="p-3 text-right text-zinc-200">{row.amount === null ? '—' : row.amount.toLocaleString()}</td><td className="p-3 text-zinc-200">{row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '—'}</td><td className="p-3">{status === 'invalid' ? <span className="text-rose-400">❌ {row.errors.join(' · ')}</span> : status === 'already-exists' ? <span className="text-amber-300">⚠ Already exists — will skip</span> : status === 'duplicate-in-file' ? <span className="text-amber-300">⚠ Duplicate in file <button className="underline ml-1" onClick={() => setSelectedDuplicateRows((current) => ({ ...current, [duplicateKey(row)]: row.row }))}>Use this row</button></span> : <span className="text-emerald-400">✅ Ready</span>}</td></tr>
                })}</tbody>
              </table>
            </div>
          </section>
        )}

        {result && <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-5 text-emerald-100"><div className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-400" />Import complete</div><p className="mt-2 text-sm">Imported: {result.importedInvoices}<br />Skipped (already existed): {result.skippedAlreadyExists}<br />Skipped (duplicates): {result.skippedDuplicates}<br />Failed: {result.errors}</p><p className="mt-2 text-sm text-emerald-300">{result.customersCreated} customers created. Dashboard KPIs now include the imported invoices.</p></div>}

        <section><h3 className="text-sm font-medium text-zinc-200 mb-4">Import history</h3>{loading ? <div className="flex justify-center p-8 text-zinc-500"><Loader2 className="w-6 h-6 animate-spin" /></div> : jobs.length === 0 ? <div className="text-center p-8 border border-surface-border border-dashed rounded-xl text-zinc-500 bg-surface-background/50 text-sm">No imports yet. Upload a file to get started.</div> : <div className="border border-surface-border rounded-lg overflow-hidden"><div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 text-xs font-medium text-zinc-400 uppercase tracking-wider"><div className="col-span-5">File name</div><div className="col-span-2">Status</div><div className="col-span-2 text-right">Rows</div><div className="col-span-3 text-right">Date</div></div><div className="divide-y divide-surface-border">{jobs.map((job) => <div key={job.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center text-sm"><div className="col-span-5 font-medium text-zinc-200 truncate">{job.fileName}</div><div className="col-span-2">{getStatusBadge(job.status)}</div><div className="col-span-2 text-right text-zinc-400">{job.processedRows !== null ? `${job.processedRows} / ${job.totalRows ?? '?'}` : '-'}</div><div className="col-span-3 text-right text-zinc-500">{new Date(job.createdAt).toLocaleString()}</div></div>)}</div></div>}</section>
      </div>
    </div>
  )
}
