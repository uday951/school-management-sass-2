import React from 'react'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function SimpleCard({ className, title, subtitle, footer, children, ...props }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm p-6", className)} {...props}>
      {(title || subtitle) && (
        <div className="flex flex-col space-y-1.5 pb-4 border-b border-border mb-4">
          {title && <h3 className="font-semibold text-lg leading-none tracking-tight text-foreground">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className="w-full">{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-border flex items-center justify-end">{footer}</div>}
    </div>
  )
}

export function StatCard({ title, value, change, changeType = 'positive', icon: Icon, className, ...props }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-6 shadow-sm flex items-center justify-between gap-4", className)} {...props}>
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <div className="flex items-center gap-1 text-xs">
            {changeType === 'positive' ? (
              <span className="flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-500">
                <ArrowUpRight className="h-3 w-3" /> {change}
              </span>
            ) : (
              <span className="flex items-center gap-0.5 font-semibold text-rose-600 dark:text-rose-500">
                <ArrowDownRight className="h-3 w-3" /> {change}
              </span>
            )}
            <span className="text-muted-foreground">vs last month</span>
          </div>
        )}
      </div>
      {Icon && (
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Icon className="h-6 w-6" />
        </div>
      )}
    </div>
  )
}

export function ProfileCard({ name, role, avatar, details = [], actions, className, ...props }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-6 shadow-sm text-center flex flex-col items-center", className)} {...props}>
      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mb-4 overflow-hidden border border-border">
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          name?.charAt(0) || 'U'
        )}
      </div>
      <h3 className="font-bold text-lg text-foreground capitalize">{name}</h3>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">{role}</p>
      
      <div className="w-full space-y-2 text-sm text-muted-foreground border-y border-border py-4 mb-4">
        {details.map((det, i) => (
          <div key={i} className="flex justify-between">
            <span className="font-medium text-muted-foreground">{det.label}:</span>
            <span className="text-foreground">{det.value}</span>
          </div>
        ))}
      </div>

      {actions && <div className="flex gap-2 w-full justify-center">{actions}</div>}
    </div>
  )
}

export function SummaryCard({ title, items = [], className, ...props }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-6 shadow-sm", className)} {...props}>
      {title && <h3 className="font-semibold text-base mb-4 border-b border-border pb-2 text-foreground">{title}</h3>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((it, i) => (
          <div key={i} className="space-y-1">
            <span className="text-xs text-muted-foreground">{it.label}</span>
            <div className="text-sm font-semibold text-foreground">{it.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartCard({ title, filterOptions, selectedFilter, onFilterChange, children, className, ...props }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-6 shadow-sm", className)} {...props}>
      <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
        {title && <h3 className="font-semibold text-lg text-foreground">{title}</h3>}
        {filterOptions && (
          <select 
            value={selectedFilter} 
            onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
            className="text-xs bg-background border border-border rounded px-2 py-1 cursor-pointer focus:outline-none"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
      </div>
      <div className="w-full flex items-center justify-center min-h-[240px]">{children}</div>
    </div>
  )
}

export function ActionCard({ title, description, icon: Icon, onClick, className, ...props }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "rounded-lg border border-border bg-card p-6 shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group flex items-start gap-4 select-none",
        className
      )} 
      {...props}
    >
      {Icon && (
        <div className="h-10 w-10 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="space-y-1">
        <h4 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function InformationCard({ items = [], title, className, ...props }) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-6 shadow-sm", className)} {...props}>
      {title && <h3 className="font-semibold text-base mb-4 border-b border-border pb-2 text-foreground">{title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
        {items.map((it, i) => (
          <div key={i} className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-sm font-medium text-muted-foreground">{it.label}</span>
            <span className="text-sm font-semibold text-foreground text-right">{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
