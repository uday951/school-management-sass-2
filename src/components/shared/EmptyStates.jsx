import React from 'react'
import { Inbox, Search, WifiOff, AlertTriangle, ShieldAlert, RotateCcw } from 'lucide-react'
import { Button } from './Buttons'
import { cn } from '@/lib/utils'

export function EmptyStateBase({ icon: Icon, title, description, className, actionLabel, onActionClick }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-card rounded-lg border border-border shadow-sm max-w-sm mx-auto", className)}>
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shrink-0">
        <Icon className="h-6 w-6" />
      </div>
      <h4 className="font-bold text-foreground text-base mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground mb-4 leading-normal">{description}</p>
      {actionLabel && onActionClick && (
        <Button size="sm" onClick={onActionClick} className="flex gap-1.5 items-center">
          <RotateCcw className="h-3.5 w-3.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export function NoData({ onRefresh, title = "No Records Found", description = "There are no entries registered in the database at the moment." }) {
  return (
    <EmptyStateBase 
      icon={Inbox}
      title={title}
      description={description}
      actionLabel={onRefresh ? "Reload Roster" : null}
      onActionClick={onRefresh}
    />
  )
}

export function NoSearchResults({ onClear, title = "No Results Match", description = "We couldn't find any results matching your search terms. Try checking spelling or removing filters." }) {
  return (
    <EmptyStateBase 
      icon={Search}
      title={title}
      description={description}
      actionLabel={onClear ? "Clear filters" : null}
      onActionClick={onClear}
    />
  )
}

export function NoInternet({ onRetry }) {
  return (
    <EmptyStateBase 
      icon={WifiOff}
      title="No Connection"
      description="It seems you are offline. Please verify your internet connection and click retry to reload."
      actionLabel="Try again"
      onActionClick={onRetry}
    />
  )
}

export function ErrorState({ onReset, errorText }) {
  return (
    <EmptyStateBase 
      icon={AlertTriangle}
      title="Application Error"
      description={errorText || "An unexpected error occurred while parsing database rosters."}
      actionLabel={onReset ? "Retry page" : null}
      onActionClick={onReset}
    />
  )
}

export function PermissionDenied({ onGoBack }) {
  return (
    <EmptyStateBase 
      icon={ShieldAlert}
      title="Access Restricted"
      description="You do not possess the required RBAC privilege identifiers to inspect this page."
      actionLabel={onGoBack ? "Return to panel" : null}
      onActionClick={onGoBack}
    />
  )
}
