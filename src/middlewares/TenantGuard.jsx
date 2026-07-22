import React from 'react'
import { Outlet } from 'react-router-dom'

export const TenantGuard = () => {
  const host = window.location.host
  const parts = host.split('.')
  const tenant = parts.length > 2 ? parts[0] : 'default'
  
  window.__tenant__ = tenant
  
  return <Outlet />
}
