import React from 'react'
import { cn } from '@/lib/utils'

export function Badge({ children, variant = 'info', className }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold leading-none capitalize",
      {
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': variant === 'info',
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400': variant === 'success',
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400': variant === 'warning',
        'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400': variant === 'danger',
        'bg-secondary text-secondary-foreground': variant === 'muted',
      },
      className
    )}>
      {children}
    </span>
  )
}

export function StatusChip({ label, status = 'active', className }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-border bg-card shadow-sm text-foreground capitalize",
      className
    )}>
      <span className={cn(
        "h-1.5 w-1.5 rounded-full shrink-0",
        {
          'bg-emerald-500': status === 'active' || status === 'completed',
          'bg-rose-500': status === 'inactive' || status === 'cancelled',
          'bg-amber-500': status === 'pending' || status === 'review',
        }
      )} />
      {label || status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  let variant = 'info'
  if (priority === 'high' || priority === 'critical') variant = 'danger'
  if (priority === 'medium') variant = 'warning'
  if (priority === 'low') variant = 'muted'
  return (
    <Badge variant={variant} className="capitalize">
      {priority}
    </Badge>
  )
}

export function AttendanceBadge({ status }) {
  let variant = 'success'
  let label = 'Present'
  if (status === 'absent') {
    variant = 'danger'
    label = 'Absent'
  } else if (status === 'late') {
    variant = 'warning'
    label = 'Late'
  } else if (status === 'halfday') {
    variant = 'info'
    label = 'Half Day'
  }
  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  )
}

export function PaymentBadge({ status }) {
  let variant = 'success'
  let label = 'Paid'
  if (status === 'overdue' || status === 'unpaid') {
    variant = 'danger'
    label = status === 'overdue' ? 'Overdue' : 'Unpaid'
  } else if (status === 'partial') {
    variant = 'warning'
    label = 'Partial'
  }
  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  )
}
