import React from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Info, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Alert({ variant = 'info', title, children, className, onClose }) {
  return (
    <div className={cn(
      "p-4 rounded-md border flex gap-3 relative animate-in fade-in duration-200",
      {
        'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50': variant === 'info',
        'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50': variant === 'success',
        'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50': variant === 'warning',
        'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50': variant === 'danger',
      },
      className
    )}>
      {variant === 'info' && <Info className="h-5 w-5 shrink-0" />}
      {variant === 'success' && <CheckCircle className="h-5 w-5 shrink-0" />}
      {variant === 'warning' && <AlertTriangle className="h-5 w-5 shrink-0" />}
      {variant === 'danger' && <AlertCircle className="h-5 w-5 shrink-0" />}
      
      <div className="space-y-1">
        {title && <h5 className="font-bold text-sm leading-none">{title}</h5>}
        <div className="text-xs">{children}</div>
      </div>

      {onClose && (
        <button 
          onClick={onClose}
          className="absolute right-2 top-2 h-6 w-6 inline-flex items-center justify-center rounded hover:bg-muted/10 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export function Banner({ message, variant = 'info', actionLabel, onActionClick, onClose }) {
  return (
    <div className={cn(
      "w-full px-4 py-3 flex items-center justify-between gap-4 text-xs font-semibold select-none",
      {
        'bg-primary text-primary-foreground': variant === 'primary',
        'bg-destructive text-destructive-foreground': variant === 'danger',
        'bg-amber-500 text-white': variant === 'warning',
      }
    )}>
      <div className="flex items-center gap-2 truncate">
        {message}
      </div>
      <div className="flex items-center gap-2">
        {actionLabel && onActionClick && (
          <button 
            onClick={onActionClick}
            className="px-2 py-1 rounded bg-background text-foreground hover:bg-muted font-bold transition-colors cursor-pointer"
          >
            {actionLabel}
          </button>
        )}
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-background/10 rounded cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function Progress({ value = 0, className }) {
  return (
    <div className={cn("h-2 w-full bg-muted rounded-full overflow-hidden", className)}>
      <div 
        className="h-full bg-primary transition-all duration-300 rounded-full" 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function LoadingSpinner({ className }) {
  return (
    <Loader2 className={cn("h-6 w-6 animate-spin text-primary", className)} />
  )
}

export function Skeleton({ className }) {
  return (
    <div className={cn("animate-pulse rounded bg-muted/65", className)} />
  )
}
