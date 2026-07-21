import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  isDestructive?: boolean
  confirmText?: string
  cancelText?: string
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  isDestructive = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmDialogProps) {
  // Trigger onCancel if the dialog is dismissed (e.g., clicking outside, pressing Escape)
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCancel()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-surface-card border-surface-border text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-tight">{title}</DialogTitle>
          <DialogDescription className="text-zinc-400 pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            className="border-surface-border text-zinc-300 hover:bg-white/5 hover:text-foreground transition-colors"
          >
            {cancelText}
          </Button>
          <Button 
            variant={isDestructive ? 'destructive' : 'default'} 
            onClick={onConfirm}
            className={!isDestructive ? "bg-brand-500 hover:bg-brand-600 text-white" : ""}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
