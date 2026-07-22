import React, { useState } from 'react'
import { Loader2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  type = 'button',
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
          'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
          'hover:bg-accent hover:text-accent-foreground text-foreground': variant === 'ghost',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'danger',
          'bg-emerald-600 text-white hover:bg-emerald-700': variant === 'success',
          'px-3 py-1.5 text-xs': size === 'sm',
          'px-4 py-2': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
})
Button.displayName = 'Button'

export function LoadingButton({ loading, children, icon: Icon, ...props }) {
  return (
    <Button disabled={loading} {...props}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
    </Button>
  )
}

export function IconButton({ icon: Icon, className, ...props }) {
  return (
    <Button 
      variant="outline" 
      className={cn("h-9 w-9 p-0 flex items-center justify-center", className)} 
      {...props}
    >
      <Icon className="h-4 w-4 shrink-0" />
    </Button>
  )
}

export function SplitButton({ label, actions = [], onClick, variant = 'primary', ...props }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-flex rounded-md shadow-sm">
      <Button 
        variant={variant} 
        onClick={onClick} 
        className="rounded-r-none border-r border-background/20"
        {...props}
      >
        {label}
      </Button>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center justify-center p-2 rounded-r-md border-l border-background/10 cursor-pointer focus:outline-none transition-colors",
          {
            'bg-primary text-primary-foreground hover:bg-primary/95': variant === 'primary',
            'bg-secondary text-secondary-foreground hover:bg-secondary/90': variant === 'secondary',
            'bg-background border border-input text-foreground hover:bg-accent': variant === 'outline',
            'bg-destructive text-destructive-foreground hover:bg-destructive/95': variant === 'danger',
          }
        )}
      >
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-40 rounded-md border border-border bg-card p-1 shadow-md z-40 animate-in fade-in duration-100">
            {actions.map((act) => (
              <button
                key={act.label}
                onClick={() => {
                  setOpen(false)
                  if (act.onClick) act.onClick()
                }}
                className="flex w-full items-center rounded px-2 py-1.5 text-xs text-left text-foreground hover:bg-muted cursor-pointer"
              >
                {act.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
