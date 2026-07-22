import React from 'react'
import Breadcrumbs from '../navigation/Breadcrumbs'

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-5 mb-6">
      <div>
        <Breadcrumbs />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          {actions}
        </div>
      )}
    </div>
  )
}
