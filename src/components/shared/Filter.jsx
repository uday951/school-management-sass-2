import React from 'react'
import { Filter as FilterIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Filter({ 
  value = '', 
  onChange, 
  options = [], 
  placeholder = 'All', 
  label, 
  className,
  ...props 
}) {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      {label && <span className="text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">{label}</span>}
      <div className="relative flex items-center">
        <FilterIcon className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <select
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="h-9 rounded-md border border-input bg-background pl-8 pr-6 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer appearance-none min-w-[120px]"
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-2.5 pointer-events-none text-muted-foreground text-[10px] font-bold">▼</span>
      </div>
    </div>
  )
}
