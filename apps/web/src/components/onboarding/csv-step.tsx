'use client'

import React, { useRef, useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export interface CsvStepProps {
  onComplete: () => void
  onSkip: () => void
}

export function CsvStep({ onComplete, onSkip }: CsvStepProps) {
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    if (!/\.(csv|xlsx)$/i.test(file.name)) {
      toast.error('Only .csv and .xlsx files are supported')
      return
    }
    
    setImporting(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'INVOICE')
      
      const response = await fetch('/api/import', { method: 'POST', body: formData })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }
      
      toast.success('Invoices uploaded successfully!')
      onComplete()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">Import your first invoices</h2>
        <p className="text-sm text-zinc-400">Upload a CSV or Excel file to get started quickly.</p>
      </div>

      <div
        className={`border-2 border-dashed border-zinc-700 bg-zinc-800/30 rounded-xl p-10 text-center transition-colors cursor-pointer hover:bg-zinc-800/50 ${importing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={(event) => { event.preventDefault(); event.stopPropagation() }}
        onDrop={(event) => { 
          event.preventDefault(); 
          event.stopPropagation(); 
          const file = event.dataTransfer.files?.[0]; 
          if (file) void handleUpload(file) 
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef} 
          type="file" 
          className="hidden" 
          accept=".csv,.xlsx" 
          onChange={(event) => { 
            const file = event.target.files?.[0]; 
            if (file) void handleUpload(file) 
          }} 
        />
        
        <div className="w-16 h-16 bg-zinc-900/80 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
          {importing ? (
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8 text-blue-400" />
          )}
        </div>
        
        <h3 className="text-lg font-medium text-white mb-2">Drop a file here or click to browse</h3>
        <p className="text-sm text-zinc-400">Required columns: Customer, Amount, Due Date</p>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={onSkip}
          disabled={importing}
          className="text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
