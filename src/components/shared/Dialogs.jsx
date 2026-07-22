import React from 'react'
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { Button } from './Buttons'
import { cn } from '@/lib/utils'

export function DialogBase({ isOpen, onClose, title, children, className }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" 
      />
      
      {/* Dialog container */}
      <div className={cn(
        "relative bg-card text-card-foreground border border-border rounded-lg shadow-lg w-full max-w-md p-6 z-10 animate-in zoom-in-95 duration-200 flex flex-col gap-4",
        className
      )}>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-lg font-bold text-foreground capitalize">{title}</h3>
          <button 
            onClick={onClose}
            className="h-6 w-6 inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded cursor-pointer transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="w-full overflow-y-auto max-h-[70vh]">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title = "Confirm Action", message, loading }) {
  return (
    <DialogBase isOpen={isOpen} onClose={onClose} title={title} className="max-w-sm">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{message || "Are you sure you want to proceed with this action?"}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={onConfirm} disabled={loading}>Confirm</Button>
        </div>
      </div>
    </DialogBase>
  )
}

export function DeleteDialog({ isOpen, onClose, onConfirm, title = "Delete Record", itemName = "this item", loading }) {
  return (
    <DialogBase isOpen={isOpen} onClose={onClose} title={title} className="max-w-sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-foreground">Critical Action</h4>
            <p className="text-xs text-muted-foreground">Are you sure you want to delete {itemName}? This action is permanent and cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>Delete permanently</Button>
        </div>
      </div>
    </DialogBase>
  )
}

export function SuccessDialog({ isOpen, onClose, title = "Successful", message }) {
  return (
    <DialogBase isOpen={isOpen} onClose={onClose} title={title} className="max-w-sm">
      <div className="space-y-4 text-center">
        <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="h-6 w-6" />
        </div>
        <p className="text-sm text-muted-foreground">{message || "Your operation has completed successfully."}</p>
        <div className="flex justify-center">
          <Button onClick={onClose} className="px-6">Close</Button>
        </div>
      </div>
    </DialogBase>
  )
}

export function WarningDialog({ isOpen, onClose, title = "Warning Alert", message }) {
  return (
    <DialogBase isOpen={isOpen} onClose={onClose} title={title} className="max-w-sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-3 rounded-md">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">{message || "Warning config flag detected."}</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Acknowledge</Button>
        </div>
      </div>
    </DialogBase>
  )
}

export function FormDialog({ isOpen, onClose, title, children }) {
  return (
    <DialogBase isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
      {children}
    </DialogBase>
  )
}

export function PreviewDialog({ isOpen, onClose, title = "Preview Document", src, children }) {
  return (
    <DialogBase isOpen={isOpen} onClose={onClose} title={title} className="max-w-2xl">
      <div className="space-y-4">
        {src ? (
          <div className="border border-border rounded overflow-hidden bg-muted flex items-center justify-center min-h-[320px]">
            {src.endsWith('.pdf') ? (
              <iframe src={src} title={title} className="h-[450px] w-full border-none" />
            ) : (
              <img src={src} alt={title} className="max-h-[450px] object-contain max-w-full" />
            )}
          </div>
        ) : (
          children
        )}
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close Preview</Button>
        </div>
      </div>
    </DialogBase>
  )
}
