import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SearchBar({ 
  value = '', 
  onChange, 
  onClear, 
  placeholder = 'Search...', 
  className,
  ...props 
}) {
  return (
    <div className={cn("relative flex-1 max-w-sm w-full select-none", className)}>
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 rounded-md border border-input bg-background pl-9 pr-8 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else if (onChange) onChange('');
          }}
          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 p-0.5 rounded cursor-pointer transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
