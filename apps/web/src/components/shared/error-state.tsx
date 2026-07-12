import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  retry?: () => void
}

export function ErrorState({ title, description, retry, className, ...props }: ErrorStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4",
        "border border-rose-500/20 rounded-xl bg-rose-500/5",
        className
      )} 
      {...props}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 mb-4 shadow-inner">
        <AlertCircle className="h-8 w-8 text-rose-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-rose-500 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-md mb-6">{description}</p>
      
      {retry && (
        <Button 
          variant="outline" 
          onClick={retry}
          className="border-rose-500/20 text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}
